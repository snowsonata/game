import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { STAGES } from '../config/stages'
import { createWaveController } from '../wave/waveController'
import { CombatManager } from '../combat/combatManager'
import { BuffType } from '../buff/buffSystem'

// Canvas 视口尺寸（固定）
const VIEW_W = 360
const VIEW_H = 640

// 世界宽度（比视口宽，允许摄像机左右滚动）
const WORLD_W = 900
const DEFENSE_LINE = 520

// 2.5D 参数：适当倾斜，非汇聚于一点
// 远端（y=0）X 向中心偏移的比例（0=不偏移，1=完全汇聚）
const PERSPECTIVE_STRENGTH = 0.30   // 30% 收束，产生轻微透视感

/* ================= 升级弹窗 ================= */

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

function describeSkill(skill) {
  const parts = []
  if (skill.dmgUp)          parts.push(`伤害 +${pct(skill.dmgUp)}`)
  if (skill.dmgDown)        parts.push(`伤害 -${pct(skill.dmgDown)}`)
  if (skill.critRate)       parts.push(`暴击率 +${pct(skill.critRate)}`)
  if (skill.critDmg)        parts.push(`爆伤 +${pct(skill.critDmg)}`)
  if (skill.cdReduce)       parts.push(`CD -${pct(skill.cdReduce)}`)
  if (skill.cdUp)           parts.push(`CD +${pct(skill.cdUp)}`)
  if (skill.pierce)         parts.push(`穿透 +${skill.pierce}`)
  if (skill.atkSpeedUp)     parts.push(`攻速 +${pct(skill.atkSpeedUp)}`)
  if (skill.fireRateUp)     parts.push(`射速 +${pct(skill.fireRateUp)}`)
  if (skill.durationUp)     parts.push(`持续 +${skill.durationUp}s`)
  if (skill.mirror)         parts.push(`镜像 +${skill.mirror}`)
  if (skill.enemySlow)      parts.push(`敌方减速 ${pct(skill.enemySlow)}`)
  if (skill.permanent)      parts.push('永久生效')
  if (skill.forceCrit)      parts.push('必定暴击')
  if (skill.converge)       parts.push('弹幕向中心收束')
  return parts.length > 0 ? parts.join(' / ') : '特殊效果'
}

function pct(v) { return `${(v * 100).toFixed(0)}%` }

/* ================= 主组件 ================= */

export default function GameCanvas({ joystickMoveRef }) {
  const canvasRef = useRef(null)
  const lastTimeRef = useRef(0)
  const waveControllerRef = useRef(null)
  const combatManagerRef = useRef(null)

  // 世界坐标中的玩家（x 范围 0~WORLD_W）
  const playerRef = useRef({
    x: WORLD_W / 2,
    y: DEFENSE_LINE + 20,
    size: 16
  })

  // 摄像机 X（世界坐标，左边缘）
  const cameraXRef = useRef(WORLD_W / 2 - VIEW_W / 2)

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

  /* ---- 监听 isLevelUp → 暂停 + 弹窗 ---- */
  useEffect(() => {
    if (isLevelUp) {
      setShowModal(true)
    }
  }, [isLevelUp])

  /* ---- 选技能 ---- */
  function handlePickSkill(skill) {
    pickSkill(skill)              // store：更新 skillLevels / skillEffects / 恢复 pauseGame=false
    applySkillToCombatManager(skill)
    setShowModal(false)
  }

  /* ---- 将 skillPool 技能效果写入 CombatManager ---- */
  function applySkillToCombatManager(skill) {
    const cm = combatManagerRef.current
    if (!cm) return

    if (skill.critRate)       cm.damageCalculator.addCritRate(skill.critRate)
    if (skill.critDmg)        cm.damageCalculator.addCritDamage(skill.critDmg)
    if (skill.dmgUp)          cm.damageCalculator.addDamageIncrease(skill.dmgUp)
    if (skill.dmgDown)        cm.damageCalculator.addDamageIncrease(-skill.dmgDown)
    if (skill.atkSpeedUp)     cm.baseFireRate = cm.baseFireRate / (1 + skill.atkSpeedUp)
    if (skill.fireRateUp)     cm.baseFireRate = cm.baseFireRate / (1 + skill.fireRateUp)
    if (skill.mirrorDmgBuff)  cm.damageCalculator.addDamageIncrease(skill.mirrorDmgBuff)
    if (skill.mirrorDmgUp)    cm.damageCalculator.addDamageIncrease(skill.mirrorDmgUp)

    if (skill.mirror && skill.permanent) {
      cm.buffManager.addBuff({ type: BuffType.MIRROR, value: skill.mirror, duration: 99999, source: 'perm_mirror' })
    }
    if (skill.enemySlow && skill.permanent) {
      cm.buffManager.addBuff({ type: BuffType.ENEMY_SLOW, value: skill.enemySlow, duration: 99999, source: 'perm_slow' })
    }
    if (skill.forceCrit && skill.permanent) {
      cm.damageCalculator.setGuaranteedCrit(true)
    }

    // CD 减少
    if (skill.cdReduce && skill.category) {
      const idMap = {
        '笔记本电脑': 'laptop', '外卖': 'takeout', '摸鱼宝典': 'fish',
        '电动车': 'ebike', 'AI工具': 'ai_tool', '期末周模式': 'exam_mode', '君子六艺': 'six_arts'
      }
      const sid = idMap[skill.category]
      if (sid) {
        const s = cm.skillManager.getSkill(sid)
        if (s) s.cdModifier = (s.cdModifier || 0) - skill.cdReduce
      }
    }

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
    cm.initialize({ player: playerRef.current, bullets: bulletsRef.current, enemies: enemiesRef.current })
    combatManagerRef.current = cm

    // 热重载：重新应用已有技能
    useGameStore.getState().skillEffects.forEach(skill => applySkillToCombatManager(skill))

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

      // pauseGame 时只渲染，不更新逻辑（升级弹窗期间游戏冻结）
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

    if (cm) cm.update(dt, { player, bullets, enemies })

    /* 子弹移动 */
    bullets.forEach(b => {
      if (!b.orbit) {
        b.x += (b.vx || 0) * dt
        b.y += (b.vy !== undefined ? b.vy : -420) * dt
      } else {
        b.orbit.angle += b.orbit.speed * dt
        b.x = b.orbit.centerX + Math.cos(b.orbit.angle) * b.orbit.radius
        b.y = b.orbit.centerY + Math.sin(b.orbit.angle) * b.orbit.radius
      }
      if (b.y < -20 || b.y > VIEW_H + 20 || b.x < -100 || b.x > WORLD_W + 100) b.alive = false
    })

    /* 敌人移动 + 2.5D 透视（适当倾斜，非汇聚） */
    const slowMod = cm ? cm.getEnemySpeedModifier() : 1
    enemies.forEach(e => {
      e.y += e.speed * dt * slowMod

      // 缩放：顶部 0.3x → 底部 1.0x
      const t = Math.max(0, Math.min(1, e.y / DEFENSE_LINE))
      e.scale = 0.3 + t * 0.7

      // X 轴透视：远端向世界中心适当收束（PERSPECTIVE_STRENGTH 控制强度）
      // spawnX 是世界坐标中的出生 X
      const worldCenterX = WORLD_W / 2
      e.x = e.spawnX + (worldCenterX - e.spawnX) * PERSPECTIVE_STRENGTH * (1 - t)

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
        if (Math.hypot(b.x - e.x, b.y - e.y) < (b.size || 4) + e.size * e.scale) {
          cm ? cm.handleBulletHit(b, e) : (() => { e.hp -= b.damage || 1; b.alive = false })()
          if (e.hp <= 0) { e.alive = false; gainExp(20) }
        }
      })
    })

    cleanArray(bullets)
    cleanArray(enemies)

    /* 摄像机跟随玩家（平滑插值） */
    const targetCamX = player.x - VIEW_W / 2
    const clampedCamX = Math.max(0, Math.min(WORLD_W - VIEW_W, targetCamX))
    cameraXRef.current += (clampedCamX - cameraXRef.current) * 0.12
  }

  /* ---- 渲染 ---- */
  function render(ctx) {
    const player = playerRef.current
    const bullets = bulletsRef.current
    const enemies = enemiesRef.current
    const camX = cameraXRef.current

    ctx.clearRect(0, 0, VIEW_W, VIEW_H)

    /* 背景渐变 */
    const bg = ctx.createLinearGradient(0, 0, 0, VIEW_H)
    bg.addColorStop(0, '#0a0a1a')
    bg.addColorStop(1, '#111122')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)

    /* 透视地面线（从世界顶部向底部辐射，随摄像机偏移） */
    ctx.strokeStyle = '#1e1e30'
    ctx.lineWidth = 1
    const lineCount = 10
    for (let i = 0; i <= lineCount; i++) {
      // 底部均匀分布，顶部向中心收束
      const bottomX = (i / lineCount) * WORLD_W - camX
      const topX = VIEW_W / 2 + (bottomX - VIEW_W / 2) * (1 - PERSPECTIVE_STRENGTH)
      ctx.beginPath()
      ctx.moveTo(topX, 0)
      ctx.lineTo(bottomX, DEFENSE_LINE)
      ctx.stroke()
    }

    /* 防守线 */
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, DEFENSE_LINE)
    ctx.lineTo(VIEW_W, DEFENSE_LINE)
    ctx.stroke()

    /* 敌人（按 y 排序，近的后画） */
    const sortedEnemies = [...enemies].sort((a, b) => a.y - b.y)
    sortedEnemies.forEach(e => renderEnemy(ctx, e, camX))

    /* 子弹 */
    bullets.forEach(b => {
      const sx = b.x - camX
      ctx.fillStyle = b.color || '#fff'
      ctx.beginPath()
      ctx.arc(sx, b.y, b.size || 4, 0, Math.PI * 2)
      ctx.fill()
    })

    /* 玩家 */
    renderPlayer(ctx, player, camX)

    /* HUD */
    renderHUD(ctx)
  }

  /* ---- 渲染敌人 ---- */
  function renderEnemy(ctx, e, camX) {
    const sx = e.x - camX
    const size = e.size * e.scale

    /* 阴影 */
    ctx.save()
    ctx.globalAlpha = 0.3 * e.scale
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(sx, e.y + size * 0.5, size * 0.6, size * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    /* 本体 */
    const r = Math.floor(160 + 95 * e.scale)
    const g = Math.floor(20 * e.scale)
    ctx.fillStyle = `rgb(${r},${g},${g})`
    ctx.fillRect(sx - size / 2, e.y - size / 2, size, size)

    /* 高光 */
    ctx.fillStyle = `rgba(255,255,255,${0.12 * e.scale})`
    ctx.fillRect(sx - size / 2 + 1, e.y - size / 2 + 1, size * 0.35, size * 0.3)

    /* 血条 */
    if (e.maxHp > 0) {
      const barW = size, barH = Math.max(2, size * 0.1)
      const barY = e.y - size / 2 - barH - 2
      ctx.fillStyle = '#222'
      ctx.fillRect(sx - barW / 2, barY, barW, barH)
      ctx.fillStyle = '#0f0'
      ctx.fillRect(sx - barW / 2, barY, barW * Math.max(0, e.hp / e.maxHp), barH)
    }
  }

  /* ---- 渲染玩家 ---- */
  function renderPlayer(ctx, player, camX) {
    const sx = player.x - camX
    const size = 30

    ctx.save()
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(sx, player.y + size * 0.45, size * 0.6, size * 0.18, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = '#4af'
    ctx.fillRect(sx - size / 2, player.y - size / 2, size, size)

    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(sx - size / 2 + 2, player.y - size / 2 + 2, size * 0.4, size * 0.35)
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

    // 摇杆：每帧传入屏幕 dx，换算为世界坐标偏移
    // 速度系数 0.11（原来约 0.55，现在降为 1/5）
    if (joystickMoveRef) {
      joystickMoveRef.current = (screenDx) => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = VIEW_W / rect.width
        // 速度降为原来 1/5：乘以 0.11（原 scaleX 直接映射）
        const worldDx = screenDx * scaleX * 0.20
        player.x = Math.max(20, Math.min(WORLD_W - 20, player.x + worldDx))
      }
    }

    // PC 鼠标：绝对定位，映射到世界坐标
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = VIEW_W / rect.width
      const viewX = (e.clientX - rect.left) * scaleX
      // 鼠标位置 = 摄像机偏移 + 视口内 X
      player.x = Math.max(20, Math.min(WORLD_W - 20, cameraXRef.current + viewX))
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
        width={VIEW_W}
        height={VIEW_H}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {showModal && (
        <LevelUpModal choices={levelUpChoices} onPick={handlePickSkill} />
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
