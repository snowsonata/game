// src/game/canvas/GameCanvas.jsx
import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { STAGES } from '../config/stages'
import { createWaveController } from '../wave/waveController'
import { CombatManager } from '../combat/combatManager'
import { BuffType } from '../buff/buffSystem'

const WIDTH = 360
const HEIGHT = 640
const DEFENSE_LINE = 520

/* ================= 升级选技能弹窗（内联 React 组件） ================= */

const TIER_COLOR = { bronze: '#cd7f32', silver: '#bdc3c7', gold: '#f1c40f' }

function LevelUpModal({ choices, onPick }) {
  if (!choices || choices.length === 0) return null

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 50, gap: 14, padding: 20
    }}>
      <div style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>
        ⬆ 升级！选择技能强化
      </div>
      {choices.map((skill, i) => {
        const color = TIER_COLOR[skill.tier] || '#aaa'
        return (
          <div
            key={i}
            onClick={() => onPick(skill)}
            style={{
              width: '90%', maxWidth: 320,
              background: '#1a1a1a',
              border: `2px solid ${color}`,
              borderRadius: 10, padding: '14px 16px',
              cursor: 'pointer', color: '#fff'
            }}
          >
            <div style={{ fontSize: 11, color, marginBottom: 4 }}>
              {skill.tier === 'gold' ? '金' : skill.tier === 'silver' ? '银' : '铜'} · {skill.category}
            </div>
            <div style={{ fontSize: 16, fontWeight: 'bold' }}>{skill.id}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
              {describeSkill(skill)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* 根据 skill 对象的 key 生成描述文字 */
function describeSkill(skill) {
  const parts = []
  if (skill.dmgUp)        parts.push(`伤害 +${(skill.dmgUp * 100).toFixed(0)}%`)
  if (skill.dmgDown)      parts.push(`伤害 -${(skill.dmgDown * 100).toFixed(0)}%`)
  if (skill.critRate)     parts.push(`暴击率 +${(skill.critRate * 100).toFixed(0)}%`)
  if (skill.critDmg)      parts.push(`爆伤 +${(skill.critDmg * 100).toFixed(0)}%`)
  if (skill.cdReduce)     parts.push(`CD -${(skill.cdReduce * 100).toFixed(0)}%`)
  if (skill.cdUp)         parts.push(`CD +${(skill.cdUp * 100).toFixed(0)}%`)
  if (skill.pierce)       parts.push(`穿透 +${skill.pierce}`)
  if (skill.atkSpeedUp)   parts.push(`攻速 +${(skill.atkSpeedUp * 100).toFixed(0)}%`)
  if (skill.durationUp)   parts.push(`持续 +${skill.durationUp}s`)
  if (skill.fireRateUp)   parts.push(`射速 +${(skill.fireRateUp * 100).toFixed(0)}%`)
  if (skill.mirror)       parts.push(`镜像 +${skill.mirror}`)
  if (skill.enemySlow)    parts.push(`敌人减速 ${(skill.enemySlow * 100).toFixed(0)}%`)
  if (skill.permanent)    parts.push('永久生效')
  if (skill.forceCrit)    parts.push('必定暴击')
  if (skill.doubleCast)   parts.push('弹幕释放 2 次')
  if (skill.converge)     parts.push('弹幕向中心收束')
  return parts.length > 0 ? parts.join(' / ') : '特殊效果'
}

/* ================= 主组件 ================= */

export default function GameCanvas({ joystickMoveRef }) {
  const canvasRef = useRef(null)
  const lastTimeRef = useRef(0)
  const waveControllerRef = useRef(null)
  const combatManagerRef = useRef(null)

  /* ---- 战斗态（不进 store） ---- */
  const playerRef = useRef({
    x: WIDTH / 2,
    y: DEFENSE_LINE + 20,
    size: 16
  })
  const bulletsRef = useRef([])
  const enemiesRef = useRef([])
  const hpRef = useRef(10)

  /* ---- store 订阅 ---- */
  const pauseGame        = useGameStore(s => s.pauseGame)
  const gainExp          = useGameStore(s => s.gainExp)
  const tickSkillCooldowns = useGameStore(s => s.tickSkillCooldowns)
  const isLevelUp        = useGameStore(s => s.isLevelUp)
  const levelUpChoices   = useGameStore(s => s.levelUpChoices)
  const pickSkill        = useGameStore(s => s.pickSkill)
  const skillEffects     = useGameStore(s => s.skillEffects)

  /* ---- 本地 state：升级弹窗 ---- */
  const [showModal, setShowModal] = useState(false)

  /* ---- 监听 isLevelUp 变化，显示弹窗 ---- */
  useEffect(() => {
    if (isLevelUp) setShowModal(true)
  }, [isLevelUp])

  /* ---- 选技能处理 ---- */
  function handlePickSkill(skill) {
    // 1. 更新 store（skillLevels / skillEffects / 冷却）
    pickSkill(skill)
    // 2. 将技能效果应用到 CombatManager
    applySkillToCombatManager(skill)
    setShowModal(false)
  }

  /* ---- 将 skillPool 中的技能效果应用到 CombatManager ---- */
  function applySkillToCombatManager(skill) {
    const cm = combatManagerRef.current
    if (!cm) return

    const { combatStats } = useGameStore.getState()

    // 暴击率
    if (skill.critRate) {
      cm.damageCalculator.addCritRate(skill.critRate)
    }
    // 暴击伤害
    if (skill.critDmg) {
      cm.damageCalculator.addCritDamage(skill.critDmg)
    }
    // 伤害增加
    if (skill.dmgUp) {
      cm.damageCalculator.addDamageIncrease(skill.dmgUp)
    }
    // 攻速（通过 baseFireRate 调整）
    if (skill.atkSpeedUp) {
      cm.baseFireRate = cm.baseFireRate / (1 + skill.atkSpeedUp)
    }
    // 攻速（通过 fireRateUp 调整）
    if (skill.fireRateUp) {
      cm.baseFireRate = cm.baseFireRate / (1 + skill.fireRateUp)
    }
    // 镜像（永久镜像：识别码 / permanent mirror）
    if (skill.mirror && skill.permanent) {
      cm.buffManager.addBuff({
        type: BuffType.MIRROR,
        value: skill.mirror,
        duration: 99999,
        source: 'permanent_mirror'
      })
    }
    // 敌人减速（永久）
    if (skill.enemySlow && skill.permanent) {
      cm.buffManager.addBuff({
        type: BuffType.ENEMY_SLOW,
        value: skill.enemySlow,
        duration: 99999,
        source: 'permanent_slow'
      })
    }
    // 必定暴击（永久）
    if (skill.forceCrit && skill.permanent) {
      cm.damageCalculator.setGuaranteedCrit(true)
    }
  }

  /* ---- 初始化 ---- */
  useEffect(() => {
    const stage = STAGES[0]
    waveControllerRef.current = createWaveController(stage, enemiesRef.current)

    const cm = new CombatManager()
    cm.initialize({
      player: playerRef.current,
      bullets: bulletsRef.current,
      enemies: enemiesRef.current
    })
    combatManagerRef.current = cm

    // 将已有技能效果（热重载场景）重新应用
    const effects = useGameStore.getState().skillEffects
    effects.forEach(skill => applySkillToCombatManager(skill))

    return () => cm.cleanup()
  }, [])

  /* ---- 主循环 ---- */
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function loop(time) {
      let dt = (time - lastTimeRef.current) / 1000
      dt = Math.min(dt, 0.033)
      lastTimeRef.current = time

      if (!pauseGame) {
        update(dt)
        tickSkillCooldowns(dt)
      }

      render(ctx)
      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
  }, [pauseGame])

  /* ---- 更新逻辑 ---- */
  function update(dt) {
    const player = playerRef.current
    const bullets = bulletsRef.current
    const enemies = enemiesRef.current
    const cm = combatManagerRef.current

    waveControllerRef.current?.update(dt)

    if (cm) {
      cm.update(dt, { player, bullets, enemies })
    }

    /* 子弹移动 */
    bullets.forEach(b => {
      if (!b.orbit) {
        b.x += (b.vx || 0) * dt
        b.y += (b.vy !== undefined ? b.vy : -(b.speed || 420)) * dt
      } else {
        b.orbit.angle += b.orbit.speed * dt
        b.x = b.orbit.centerX + Math.cos(b.orbit.angle) * b.orbit.radius
        b.y = b.orbit.centerY + Math.sin(b.orbit.angle) * b.orbit.radius
      }
      if (b.y < -20 || b.y > HEIGHT + 20 || b.x < -20 || b.x > WIDTH + 20) {
        b.alive = false
      }
    })

    /* 敌人移动 */
    const slowMod = cm ? cm.getEnemySpeedModifier() : 1
    enemies.forEach(e => {
      e.y += e.speed * dt * slowMod
      e.scale = 0.3 + (e.y / DEFENSE_LINE) * 0.7  // 2.5D 缩放：远端 0.3，近端 1.0

      if (e.y >= DEFENSE_LINE) {
        hpRef.current -= 1
        e.alive = false
      }
    })

    /* 碰撞检测 */
    bullets.forEach(b => {
      if (!b.alive) return
      enemies.forEach(e => {
        if (!e.alive) return
        const dist = Math.hypot(b.x - e.x, b.y - e.y)
        if (dist < (b.size || 4) + e.size * e.scale) {
          if (cm) {
            cm.handleBulletHit(b, e)
          } else {
            e.hp -= b.damage || 1
            b.alive = false
          }
          if (e.hp <= 0) {
            e.alive = false
            gainExp(20)
          }
        }
      })
    })

    cleanArray(bullets)
    cleanArray(enemies)
  }

  /* ---- 渲染 ---- */
  function render(ctx) {
    const player = playerRef.current
    const bullets = bulletsRef.current
    const enemies = enemiesRef.current

    /* 背景 */
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    /* 防守线 */
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, DEFENSE_LINE)
    ctx.lineTo(WIDTH, DEFENSE_LINE)
    ctx.stroke()

    /* 敌人（按 y 排序，近的后画） */
    const sortedEnemies = [...enemies].sort((a, b) => a.y - b.y)
    sortedEnemies.forEach(e => renderEnemy(ctx, e))

    /* 子弹 */
    bullets.forEach(b => {
      ctx.fillStyle = b.color || '#fff'
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.size || 4, 0, Math.PI * 2)
      ctx.fill()
    })

    /* 玩家 */
    renderPlayer(ctx, player)

    /* UI */
    renderHUD(ctx)
  }

  /* ---- 渲染敌人（2.5D） ---- */
  function renderEnemy(ctx, e) {
    const size = e.size * e.scale

    /* 地面阴影 */
    const shadowW = size * 1.2
    const shadowH = size * 0.25
    ctx.save()
    ctx.globalAlpha = 0.35 * e.scale
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(e.x, e.y + size * 0.45, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    /* 本体 */
    ctx.fillStyle = `rgb(${Math.floor(200 + 55 * e.scale)}, ${Math.floor(40 * (1 - e.scale))}, ${Math.floor(40 * (1 - e.scale))})`
    ctx.fillRect(e.x - size / 2, e.y - size / 2, size, size)

    /* 血条 */
    const barW = size
    const barH = Math.max(3, size * 0.12)
    const barY = e.y - size / 2 - barH - 2
    ctx.fillStyle = '#222'
    ctx.fillRect(e.x - barW / 2, barY, barW, barH)
    ctx.fillStyle = '#0f0'
    ctx.fillRect(e.x - barW / 2, barY, barW * Math.max(0, e.hp / e.maxHp), barH)
  }

  /* ---- 渲染玩家（2.5D 底部固定） ---- */
  function renderPlayer(ctx, player) {
    const size = 30

    /* 阴影 */
    ctx.save()
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(player.x, player.y + size * 0.45, size * 0.6, size * 0.2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    /* 本体 */
    ctx.fillStyle = '#4af'
    ctx.fillRect(player.x - size / 2, player.y - size / 2, size, size)

    /* 高光 */
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(player.x - size / 2 + 2, player.y - size / 2 + 2, size * 0.4, size * 0.35)
  }

  /* ---- 渲染 HUD ---- */
  function renderHUD(ctx) {
    const { exp, expMax, level } = useGameStore.getState()

    ctx.font = 'bold 14px Arial'
    ctx.fillStyle = '#fff'
    ctx.fillText(`HP: ${hpRef.current}`, 10, 22)
    ctx.fillText(`Lv.${level}`, 10, 40)

    /* 经验条 */
    ctx.fillStyle = '#333'
    ctx.fillRect(10, 46, 130, 7)
    ctx.fillStyle = '#4af'
    ctx.fillRect(10, 46, 130 * Math.min(1, exp / expMax), 7)
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 1
    ctx.strokeRect(10, 46, 130, 7)
  }

  /* ---- 操控：摇杆回调 + PC 鼠标 ---- */
  useEffect(() => {
    const canvas = canvasRef.current
    const player = playerRef.current

    // 注册摇杆回调（由 VirtualJoystick 调用）
    if (joystickMoveRef) {
      joystickMoveRef.current = (screenDx) => {
        // 将屏幕像素差映射到 Canvas 坐标
        const rect = canvas.getBoundingClientRect()
        const scaleX = WIDTH / rect.width
        const canvasDx = screenDx * scaleX
        player.x = Math.max(20, Math.min(WIDTH - 20, player.x + canvasDx))
      }
    }

    /* 鼠标：保留绝对定位方式（PC 调试用） */
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = WIDTH / rect.width
      const x = (e.clientX - rect.left) * scaleX
      player.x = Math.max(20, Math.min(WIDTH - 20, x))
    }

    canvas.addEventListener('mousemove', onMouseMove)

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove)
      if (joystickMoveRef) joystickMoveRef.current = null
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {showModal && (
        <LevelUpModal
          choices={levelUpChoices}
          onPick={handlePickSkill}
        />
      )}
    </div>
  )
}

/* ================= 工具 ================= */

function cleanArray(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (!arr[i].alive) arr.splice(i, 1)
  }
}
