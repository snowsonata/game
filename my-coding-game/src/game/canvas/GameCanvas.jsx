import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { STAGES } from '../config/stages'
import { createWaveController } from '../wave/waveController'
import { CombatManager } from '../combat/combatManager'

// Canvas 视口尺寸（固定）
const VIEW_W = 360
const VIEW_H = 640

// 世界宽度：视口 + 左右各 0.3 倍拓展 = 360 * 1.6 = 576
// 左右各拓展 108px
const EXTEND = Math.round(VIEW_W * 0.3)   // 108
const WORLD_W = VIEW_W + EXTEND * 2       // 576

const DEFENSE_LINE = 520

// 2.5D 参数：适当倾斜，非汇聚于一点
const PERSPECTIVE_STRENGTH = 0.30

/* ================================================================
 * skillPool.id → skillDefinitions upgradeId 完整映射表
 * 格式：{ [skillPoolId]: { skillId, upgradeId } }
 * upgradeId 为 null 表示只注册主技能，不添加强化（首次获得技能本体）
 * ================================================================ */
const SKILL_POOL_MAP = {
  // ---- 笔记本电脑 ----
  '磁盘清理':     { skillId: 'laptop',       upgradeId: 'laptop_disk_cleanup' },
  '校园网':       { skillId: 'laptop',       upgradeId: 'laptop_campus_network' },
  '快捷键':       { skillId: 'laptop',       upgradeId: 'laptop_hotkey' },
  '固态硬盘':     { skillId: 'laptop',       upgradeId: 'laptop_solid_state' },
  '机械键盘':     { skillId: 'laptop',       upgradeId: 'laptop_keyboard' },
  '更新驱动':     { skillId: 'laptop',       upgradeId: 'laptop_driver' },
  '豪华显示器':   { skillId: 'laptop',       upgradeId: 'laptop_luxury_display' },
  '低耗模式':     { skillId: 'laptop',       upgradeId: 'laptop_low_power' },
  '"科学上网"':   { skillId: 'laptop',       upgradeId: 'laptop_vpn' },

  // ---- 外卖 ----
  '满减券':       { skillId: 'takeout',      upgradeId: 'takeout_discount' },
  '急送':         { skillId: 'takeout',      upgradeId: 'takeout_rush' },
  '黑色液体勺':   { skillId: 'takeout',      upgradeId: 'takeout_black_liquid' },
  '精准起送':     { skillId: 'takeout',      upgradeId: 'takeout_precise_delivery' },
  '下饭剧':       { skillId: 'takeout',      upgradeId: 'takeout_drama' },
  '外卖柜监控':   { skillId: 'takeout',      upgradeId: 'takeout_locker' },
  '轻量化饮食':   { skillId: 'takeout',      upgradeId: 'takeout_light_diet' },
  '"搞劳"':       { skillId: 'takeout',      upgradeId: 'takeout_overtime' },
  '犒劳':         { skillId: 'takeout',      upgradeId: 'takeout_overtime' },
  '免配送费':     { skillId: 'takeout',      upgradeId: 'takeout_free_delivery' },

  // ---- 摸鱼宝典（初版 skillPool 中叫"换鱼宝典"，skillDefinitions 中 id 为 fish_swap） ----
  '摸鱼计时':     { skillId: 'fish_swap',    upgradeId: 'fish_timer' },
  '喝水':         { skillId: 'fish_swap',    upgradeId: 'fish_drink' },
  '快速切屏':     { skillId: 'fish_swap',    upgradeId: 'fish_quick_switch' },
  'ddl':          { skillId: 'fish_swap',    upgradeId: 'fish_ddl' },
  '假装工作':     { skillId: 'fish_swap',    upgradeId: 'fish_pretend_work' },
  '摸鱼雷达':     { skillId: 'fish_swap',    upgradeId: 'fish_radar' },
  '跑路枪头':     { skillId: 'fish_swap',    upgradeId: 'fish_escape' },
  '厕所遁走':     { skillId: 'fish_swap',    upgradeId: 'fish_walk_through' },
  '消息免打扰':   { skillId: 'fish_swap',    upgradeId: 'fish_dnd' },

  // ---- 电动车（skillDefinitions id 为 electric_car） ----
  '头盔':         { skillId: 'electric_car', upgradeId: 'car_helmet' },
  '充电器':       { skillId: 'electric_car', upgradeId: 'car_charger' },
  '充电桩':       { skillId: 'electric_car', upgradeId: 'car_charging_station' },
  '神奇车牌':     { skillId: 'electric_car', upgradeId: 'car_magic_plate' },
  '武汉交通':     { skillId: 'electric_car', upgradeId: 'car_wuhan_traffic' },
  '识别码':       { skillId: 'electric_car', upgradeId: 'car_id_code' },

  // ---- AI工具 ----
  '"共创"':       { skillId: 'ai_tool',      upgradeId: 'ai_co_create' },
  '共创':         { skillId: 'ai_tool',      upgradeId: 'ai_co_create' },
  '免费额度':     { skillId: 'ai_tool',      upgradeId: 'ai_free_quota' },
  '云端同步':     { skillId: 'ai_tool',      upgradeId: 'ai_cloud_sync' },
  '提示词优化':   { skillId: 'ai_tool',      upgradeId: 'ai_prompt_optimize' },
  '一键润色':     { skillId: 'ai_tool',      upgradeId: 'ai_polish' },
  '深度思考':     { skillId: 'ai_tool',      upgradeId: 'ai_deep_think' },

  // ---- 期末周模式（skillDefinitions id 为 exam_mode） ----
  '网课':         { skillId: 'exam_mode',    upgradeId: 'exam_online_course' },
  '热带冰红茶':   { skillId: 'exam_mode',    upgradeId: 'exam_ice_tea' },
  'PPT':          { skillId: 'exam_mode',    upgradeId: 'exam_ppt' },
  '小抄':         { skillId: 'exam_mode',    upgradeId: 'exam_cheat_sheet' },
  '求捞':         { skillId: 'exam_mode',    upgradeId: 'exam_beg' },
  '历年真题':     { skillId: 'exam_mode',    upgradeId: 'exam_past_papers' },

  // ---- 君子六艺 ----
  '急':           { skillId: 'six_arts',     upgradeId: 'arts_taboo' },
  '蚌':           { skillId: 'six_arts',     upgradeId: 'arts_clam' },
  '典':           { skillId: 'six_arts',     upgradeId: 'arts_classic' },
  '麻':           { skillId: 'six_arts',     upgradeId: 'arts_mahjong' },
  '孝':           { skillId: 'six_arts',     upgradeId: 'arts_filial' },
  '乐':           { skillId: 'six_arts',     upgradeId: 'arts_music' },
}

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

  // 玩家在世界坐标中（x 范围 0~WORLD_W）
  const playerRef = useRef({
    x: WORLD_W / 2,
    y: DEFENSE_LINE + 20,
    size: 16
  })

  // 摄像机 X（世界坐标左边缘），初始居中
  const cameraXRef = useRef(EXTEND)   // EXTEND = 108，使玩家初始在视口中心

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

  /* ---- 监听 isLevelUp → 弹窗 ---- */
  useEffect(() => {
    if (isLevelUp) setShowModal(true)
  }, [isLevelUp])

  /* ---- 选技能处理 ---- */
  function handlePickSkill(skill) {
    // 1. 更新 store（skillLevels / skillEffects / 恢复 pauseGame）
    pickSkill(skill)
    // 2. 通过映射表将 skillPool 选项注册到 CombatManager
    registerSkillToCombatManager(skill)
    setShowModal(false)
  }

  /* ================================================================
   * 核心修复：将 skillPool 选项转换为 CombatManager 可识别的技能注册
   *
   * 流程：
   *   1. 通过 SKILL_POOL_MAP 找到 skillId 和 upgradeId
   *   2. 调用 cm.addSkill(skillId)：若技能不存在则注册，已存在则升级等级
   *   3. 调用 cm.addUpgrade(skillId, upgradeId)：应用强化效果到 skill.effect
   *   4. CombatManager.autoTriggerSkills 会在每帧自动触发冷却完毕的技能
   * ================================================================ */
  function registerSkillToCombatManager(poolSkill) {
    const cm = combatManagerRef.current
    if (!cm) return

    const mapping = SKILL_POOL_MAP[poolSkill.id]
    if (!mapping) {
      console.warn(`[SkillMap] 未找到映射: "${poolSkill.id}"，请检查 SKILL_POOL_MAP`)
      return
    }

    const { skillId, upgradeId } = mapping

    // 注册主技能（首次注册 or 升级等级）
    cm.addSkill(skillId)

    // 应用强化效果
    if (upgradeId) {
      const ok = cm.addUpgrade(skillId, upgradeId)
      if (!ok) {
        console.warn(`[SkillMap] 强化未找到: skillId="${skillId}" upgradeId="${upgradeId}"`)
      }
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

    // 热重载：重新应用已有技能
    useGameStore.getState().skillEffects.forEach(skill => registerSkillToCombatManager(skill))

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

      // pauseGame=true 时冻结逻辑（升级弹窗期间）
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

    // CombatManager.update：自动触发技能、自动射击、更新 Buff/CD
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

    /* 敌人移动 + 2.5D 透视 */
    const slowMod = cm ? cm.getEnemySpeedModifier() : 1
    enemies.forEach(e => {
      e.y += e.speed * dt * slowMod

      // 缩放：顶部 0.3x → 底部 1.0x
      const t = Math.max(0, Math.min(1, e.y / DEFENSE_LINE))
      e.scale = 0.3 + t * 0.7

      // X 轴透视：远端向世界中心适当收束
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

    /* 摄像机平滑跟随玩家 */
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

    /* 透视地面线（随摄像机偏移） */
    ctx.strokeStyle = '#1e1e30'
    ctx.lineWidth = 1
    const lineCount = 10
    for (let i = 0; i <= lineCount; i++) {
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
      ctx.fillStyle = b.color || '#fff'
      ctx.beginPath()
      ctx.arc(b.x - camX, b.y, b.size || 4, 0, Math.PI * 2)
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

    ctx.save()
    ctx.globalAlpha = 0.3 * e.scale
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(sx, e.y + size * 0.5, size * 0.6, size * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    const r = Math.floor(160 + 95 * e.scale)
    const g = Math.floor(20 * e.scale)
    ctx.fillStyle = `rgb(${r},${g},${g})`
    ctx.fillRect(sx - size / 2, e.y - size / 2, size, size)

    ctx.fillStyle = `rgba(255,255,255,${0.12 * e.scale})`
    ctx.fillRect(sx - size / 2 + 1, e.y - size / 2 + 1, size * 0.35, size * 0.3)

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

    if (joystickMoveRef) {
      joystickMoveRef.current = (screenDx) => {
        const rect = canvas.getBoundingClientRect()
        const scaleX = VIEW_W / rect.width
        // 速度系数：上次 0.20，再降为 0.20 × 0.2 = 0.04
        const worldDx = screenDx * scaleX * 0.04
        player.x = Math.max(20, Math.min(WORLD_W - 20, player.x + worldDx))
      }
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = VIEW_W / rect.width
      const viewX = (e.clientX - rect.left) * scaleX
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
