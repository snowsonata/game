import { create } from 'zustand'
import { getRandomSkills } from '../game/skill/skillSystem'
import { SKILL_POOL } from '../game/skill/skillPool'

/* ================= 经验曲线 ================= */
function calcExpMax(level) {
  return Math.floor(10 + level * level * 1.5)
}

/* ================= 技能基础 CD 查表 ================= */
function getBaseCD(category) {
  const data = SKILL_POOL[category]
  if (!data || data.base == null) return 0
  return data.base.cd ?? 0
}

export const useGameStore = create((set, get) => ({
  /* ================= 基础成长 ================= */
  level: 1,
  exp: 0,
  expMax: calcExpMax(1),

  isLevelUp: false,
  pauseGame: false,

  /* ================= 倒计时 ================= */
  timeLeft: 60,   // 当前剩余秒数（整数，供UI读取）

  /* ================= 游戏结果状态 ================= */
  stageClear: false,
  gameOver: false,

  /* ================= 双货币系统 ================= */
  quantum: 0,
  gold: 0,

  /* ================= 战斗数值 ================= */
  combatStats: {
    attack: 0,
    damageMultiplier: 1,
    critRate: 0.05,
    critDamage: 1.5
  },

  /* ================= 技能系统 ================= */
  skillLevels: {},
  skillEffects: [],
  levelUpChoices: [],

  /* ================= 技能冷却（供 UI 读取） ================= */
  skillCooldowns: {},

  /* ================== 经验获取 ================== */
  gainExp(amount) {
    let { exp, expMax, level } = get()
    exp += amount
    let leveledUp = false
    while (exp >= expMax) {
      exp -= expMax
      level += 1
      expMax = calcExpMax(level)
      leveledUp = true
    }
    if (leveledUp) {
      const { skillLevels } = get()
      set({
        exp, level, expMax,
        isLevelUp: true,
        pauseGame: true,
        levelUpChoices: getRandomSkills({ ownedSkills: skillLevels, count: 3 })
      })
    } else {
      set({ exp })
    }
  },

  /* ================== 选择技能 ================== */
  pickSkill(skill) {
    set(state => {
      const category = skill.category
      const newLevel = (state.skillLevels[category] || 0) + 1
      const maxCd = getBaseCD(category)
      return {
        skillLevels: { ...state.skillLevels, [category]: newLevel },
        skillEffects: [...state.skillEffects, skill],
        skillCooldowns: {
          ...state.skillCooldowns,
          [category]: { cd: 0, maxCd }
        },
        isLevelUp: false,
        pauseGame: false,
        levelUpChoices: []
      }
    })
  },

  /* ================== 更新技能冷却 ================== */
  tickSkillCooldowns(dt) {
    const { skillCooldowns } = get()
    const updated = {}
    let changed = false
    for (const [cat, state] of Object.entries(skillCooldowns)) {
      if (state.cd > 0) {
        const newCd = Math.max(0, state.cd - dt)
        updated[cat] = { ...state, cd: newCd }
        changed = true
      } else {
        updated[cat] = state
      }
    }
    if (changed) set({ skillCooldowns: updated })
  },

  /* ================== 手动暂停/恢复 ================== */
  setPause(value) {
    set({ pauseGame: value })
  },

  /* ================== 触发技能冷却 ================== */
  triggerSkillCooldown(category, actualCd) {
    const { skillCooldowns } = get()
    const state = skillCooldowns[category]
    const maxCd = actualCd ?? state?.maxCd ?? 0
    set({
      skillCooldowns: {
        ...skillCooldowns,
        [category]: { cd: maxCd, maxCd }
      }
    })
  },

  /* ================== 倒计时同步 ================== */
  setTimeLeft(value) {
    set({ timeLeft: value })
  },

  /* ================== 通关/失败状态 ================== */
  setStageClear(value) {
    set({ stageClear: value })
    if (value) set({ pauseGame: true })
  },

  setGameOver(value) {
    set({ gameOver: value })
    if (value) set({ pauseGame: true })
  },

  /* ================== 货币系统 ================== */
  addCurrency({ quantum = 0, gold = 0 }) {
    set(state => ({
      quantum: state.quantum + quantum,
      gold: state.gold + gold
    }))
  },

  spendCurrency({ quantum = 0, gold = 0 }) {
    const state = get()
    if (state.quantum < quantum || state.gold < gold) return false
    set({ quantum: state.quantum - quantum, gold: state.gold - gold })
    return true
  }
}))
