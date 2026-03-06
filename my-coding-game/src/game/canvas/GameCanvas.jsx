import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { STAGES } from '../config/stages'
import { createWaveController } from '../wave/waveController'
import { CombatManager } from '../combat/combatManager'
import { BuffType } from '../buff/buffSystem'

const WIDTH = 360
const HEIGHT = 640
const DEFENSE_LINE = 520

// 2.5D 透视消失点（水平居中，屏幕顶部附近）
const VP_X = WIDTH / 2   // 消失点 X
const VP_Y = 0           // 消失点 Y（顶部）

/* ================= 升级选技能弹窗 ================= */

const TIER_COLOR = { bronze: '#cd7f32', silver: '#bdc3c7', gold: '#f1c40f' }
const TIER_LABEL = { bronze: '铜', silver: '银', gold: '金' }

function LevelUpModal({ choices, onPick }) {
  if (!choices || choices.length === 0) return null
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.85)',
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
              {TIER_LABEL[skill.tier] || skill.tier} · {skill.category}
            </div>
            <div style={{ fontSize: 16, fontWeight: 'bold' }}>{skill.id}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
              {skill.desc || describeSkill(skill)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* 根据 skillPool 字段生成描述（兜底） */
function describeSkill(skill) {
  const parts = []
  if (skill.dmgUp)            parts.push(`伤害 +${pct(skill.dmgUp)}`)
  if (skill.dmgDown)          parts.push(`伤害 -${pct(skill.dmgDown)}`)
  if (skill.critRate)         parts.push(`暴击率 +${pct(skill.critRate)}`)
  if (skill.critDmg)          parts.push(`爆伤 +${pct(skill.critDmg)}`)
  if (skill.cdReduce)         parts.push(`CD -${pct(skill.cdReduce)}`)
  if (skill.cdUp)             parts.push(`CD +${pct(skill.cdUp)}`)
  if (skill.pierce)           parts.push(`穿透 +${skill.pierce}`)
  if (skill.atkSpeedUp)       parts.push(`攻速 +${pct(skill.atkSpeedUp)}`)
  if (skill.fireRateUp)       parts.push(`射速 +${pct(skill.fireRateUp)}`)
  if (skill.durationUp)       parts.push(`持续 +${pct(skill.durationUp)}`)
  if (skill.mirror)           parts.push(`镜像 +${skill.mirror}`)
  if (skill.enemySlow)        parts.push(`敌方减速 ${pct(skill.enemySlow)}`)
  if (skill.permanent)        parts.push('永久生效')
  if (skill.forceCrit)        parts.push('必定暴击')
  if (skill.converge)         parts.push('弹幕向中心收束')
  if (skill.rows)             parts.push(`弹幕排数 +${skill.rows - 1}`)
  if (skill.shots)            parts.push(`释放 ${skill.shots} 次`)
  return parts.length > 0 ? parts.join(' / ') : '特殊效果'
}

function pct(v) { return `${(v * 100).toFixed(0)}%` }

/* ================= 主组件 ================= */

export default function GameCanvas({ joystickMoveRef }) {
  const canvasRef = useRef(null)
  const lastTimeRef = useRef(0)
  const waveControllerRef = useRef(null)
  const combatManagerRef = useRef(null)

  /* ---- 战斗态（不进 store） ---- */
  const playerRef = useRef({ x: WIDTH / 2, y: DEFENSE_LINE + 20, size: 16 })
  const bulletsRef = useRef([])
  const enemiesRef = useRef([])
  const hpRef = useRef(10)

  /* ---- store 订阅 ---- */
  const pauseGame          = useGameStore(s => s.pauseGame)
  const gainExp            = useGameStore(s => s.gainExp)
  const tickSkillCooldowns = useGameStore(s => s.tickSkillCooldowns)
  const isLevelUp          = useGameStore(s => s.isLevelUp)
  const levelUpChoices     = useGameStore(s => s.levelUpChoices)
  const pickSkill          = useGameStore(s => s.pickSkill)

  /* ---- 本地 state：升级弹窗 ---- */
  const [showModal, setShowModal] = useState(false)

  /* ---- 监听 isLevelUp ---- */
  useEffect(() => {
    if (isLevelUp) setShowModal(true)
  }, [isLevelUp])

  /* ---- 选技能处理 ---- */
  function handlePickSkill(skill) {
    pickSkill(skill)
    applySkillToCombatManager(skill)
    setShowModal(false)
  }

  /* ================================================================
   * 将 skillPool 中选出的技能对象应用到 CombatManager
   *
   * skillPool 中每个强化对象的字段（直接挂在对象上，非嵌套 effect）：
   *   dmgUp / dmgDown / critRate / critDmg / cdReduce / cdUp
   *   pierce / atkSpeedUp / fireRateUp / durationUp / durationDown
   *   mirror / enemySlow / permanent / forceCrit / converge
   *   rows / shots / secondCastDmg / outerRingDmg / centerDmgUp
   *   pierceDmgUp / rangeUp / bulletCountUp / sizeUp / intervalReduce
   *   moveSpeedUp / mirrorDmgBuff / mirrorDmgUp / mirrorDmgDown
   *   affectOtherSkills / ignoreDamageReduce / disableOtherActive
   *   activeSkillDmgBuff / intervalUp
   * ================================================================ */
  function applySkillToCombatManager(skill) {
    const cm = combatManagerRef.current
    if (!cm) return

    // --- 暴击率 ---
    if (skill.critRate) {
      cm.damageCalculator.addCritRate(skill.critRate)
    }

    // --- 暴击伤害 ---
    if (skill.critDmg) {
      cm.damageCalculator.addCritDamage(skill.critDmg)
    }

    // --- 伤害增加 ---
    if (skill.dmgUp) {
      cm.damageCalculator.addDamageIncrease(skill.dmgUp)
    }

    // --- 伤害降低（负数增加） ---
    if (skill.dmgDown) {
      cm.damageCalculator.addDamageIncrease(-skill.dmgDown)
    }

    // --- 攻速提升（缩短 baseFireRate） ---
    if (skill.atkSpeedUp) {
      cm.baseFireRate = cm.baseFireRate / (1 + skill.atkSpeedUp)
    }
    if (skill.fireRateUp) {
      cm.baseFireRate = cm.baseFireRate / (1 + skill.fireRateUp)
    }

    // --- 永久镜像 ---
    if (skill.mirror && skill.permanent) {
      cm.buffManager.addBuff({
        type: BuffType.MIRROR,
        value: skill.mirror,
        duration: 99999,
        source: 'permanent_mirror'
      })
    }

    // --- 永久敌方减速 ---
    if (skill.enemySlow && skill.permanent) {
      cm.buffManager.addBuff({
        type: BuffType.ENEMY_SLOW,
        value: skill.enemySlow,
        duration: 99999,
        source: 'permanent_slow'
      })
    }

    // --- 永久必定暴击（如电动车识别码 + 期末周模式） ---
    if (skill.forceCrit && skill.permanent) {
      cm.damageCalculator.setGuaranteedCrit(true)
    }

    // --- 技能 CD 减少（写入 CombatManager 的 skillManager） ---
    if (skill.cdReduce && skill.category) {
      const skillIdMap = {
        '笔记本电脑': 'laptop',
        '外卖': 'takeout',
        '摸鱼宝典': 'fish',
        '电动车': 'ebike',
        'AI工具': 'ai_tool',
        '期末周模式': 'exam_mode',
        '君子六艺': 'six_arts'
      }
      const skillId = skillIdMap[skill.category]
      if (skillId) {
        const s = cm.skillManager.getSkill(skillId)
        if (s) {
          s.cdModifier = (s.cdModifier || 0) - skill.cdReduce
        }
      }
    }

    // --- 镜像伤害加成（临时 buff，每次选技能叠加） ---
    if (skill.mirrorDmgBuff) {
      cm.damageCalculator.addDamageIncrease(skill.mirrorDmgBuff)
    }
    if (skill.mirrorDmgUp) {
      cm.damageCalculator.addDamageIncrease(skill.mirrorDmgUp)
    }

    // --- 每个主动技增伤（君子六艺·乐） ---
    if (skill.activeSkillDmgBuff) {
      const ownedCount = Object.keys(useGameStore.getState().skillLevels).length
      cm.damageCalculator.addDamageIncrease(skill.activeSkillDmgBuff * ownedCount)
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

    // 热重载：重新应用已有技能效果
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

    /* 敌人移动 + 2.5D 透视坐标 */
    const slowMod = cm ? cm.getEnemySpeedModifier() : 1
    enemies.forEach(e => {
      e.y += e.speed * dt * slowMod

      // 透视缩放：顶部 0.25x → 底部 1.0x
      const t = Math.max(0, Math.min(1, e.y / DEFENSE_LINE))
      e.scale = 0.25 + t * 0.75

      // 透视 X：将敌人 X 向消失点收束
      // spawnX 是敌人出生时的原始 X（需要在 waveController 中保存）
      if (e.spawnX === undefined) e.spawnX = e.x
      // 从消失点 VP_X 插值到 spawnX
      e.x = VP_X + (e.spawnX - VP_X) * t

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

    /* 背景渐变 */
    const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT)
    bg.addColorStop(0, '#0a0a1a')
    bg.addColorStop(1, '#111122')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    /* 透视地面线 */
    ctx.strokeStyle = '#2a2a3a'
    ctx.lineWidth = 1
    for (let i = 0; i < 7; i++) {
      const x = (i / 6) * WIDTH
      ctx.beginPath()
      ctx.moveTo(VP_X, VP_Y)
      ctx.lineTo(x, DEFENSE_LINE)
      ctx.stroke()
    }

    /* 防守线 */
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, DEFENSE_LINE)
    ctx.lineTo(WIDTH, DEFENSE_LINE)
    ctx.stroke()

    /* 敌人（按 y 排序，近的后画，覆盖远的） */
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

    /* HUD */
    renderHUD(ctx)
  }

  /* ---- 渲染敌人（2.5D） ---- */
  function renderEnemy(ctx, e) {
    const size = e.size * e.scale

    /* 地面阴影 */
    ctx.save()
    ctx.globalAlpha = 0.3 * e.scale
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(e.x, e.y + size * 0.5, size * 0.6, size * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    /* 本体：颜色随距离变化（远端暗红，近端鲜红） */
    const r = Math.floor(160 + 95 * e.scale)
    const g = Math.floor(20 * e.scale)
    const b = Math.floor(20 * e.scale)
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(e.x - size / 2, e.y - size / 2, size, size)

    /* 高光 */
    ctx.fillStyle = `rgba(255,255,255,${0.12 * e.scale})`
    ctx.fillRect(e.x - size / 2 + 1, e.y - size / 2 + 1, size * 0.35, size * 0.3)

    /* 血条 */
    if (e.maxHp > 0) {
      const barW = size
      const barH = Math.max(2, size * 0.1)
      const barY = e.y - size / 2 - barH - 2
      ctx.fillStyle = '#222'
      ctx.fillRect(e.x - barW / 2, barY, barW, barH)
      ctx.fillStyle = '#0f0'
      ctx.fillRect(e.x - barW / 2, barY, barW * Math.max(0, e.hp / e.maxHp), barH)
    }
  }

  /* ---- 渲染玩家 ---- */
  function renderPlayer(ctx, player) {
    const size = 30

    /* 阴影 */
    ctx.save()
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(player.x, player.y + size * 0.45, size * 0.6, size * 0.18, 0, 0, Math.PI * 2)
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

    if (joystickMoveRef) {
      joystickMoveRef.current = (screenDx) => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = WIDTH / rect.width
        player.x = Math.max(20, Math.min(WIDTH - 20, player.x + screenDx * scaleX))
      }
    }

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
