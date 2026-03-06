import { create } from 'zustand'
import { getRandomSkills } from '../game/skill/skillSystem'
import { SKILL_POOL } from '../game/skill/skillPool'

/* ================= 经验曲线 ================= */

// 你以后想换"波动式""阶段式"，只改这里
function calcExpMax(level) {
  return Math.floor(10 + level * level * 1.5)
}

/* ================= 技能基础 CD 查表 ================= */

// 从 SKILL_POOL 中读取每个技能大类的基础 CD
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


  /* ================= 战斗数值 ================= */
  combatStats: {
    attack: 0,             // 额外攻击力
    damageMultiplier: 1,   // 伤害倍率
    critRate: 0.05,        // 暴击率
    critDamage: 1.5        // 暴击伤害倍率
  },

  /* ================= 技能系统 ================= */

  skillLevels: {},
  skillEffects: [],
  levelUpChoices: [],

  /* ================= 技能冷却（供 UI 读取） ================= */
  // 格式：{ [category]: { cd: number, maxCd: number } }
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
        exp,
        level,
        expMax,

        isLevelUp: true,
        pauseGame: true,

        levelUpChoices: getRandomSkills({
          ownedSkills: skillLevels,
          count: 3
        })
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
        skillLevels: {
          ...state.skillLevels,
          [category]: newLevel
        },

        skillEffects: [...state.skillEffects, skill],

        // 初始化该技能冷却（刚获得时 cd = 0，即可立即使用）
        skillCooldowns: {
          ...state.skillCooldowns,
          [category]: {
            cd: 0,
            maxCd
          }
        },

        isLevelUp: false,
        pauseGame: false,
        levelUpChoices: []
      }
    })
  },

  /* ================== 更新技能冷却（由游戏主循环每帧调用） ================== */

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

    if (changed) {
      set({ skillCooldowns: updated })
    }
  },

  /* ================== 触发技能冷却（技能释放时调用） ================== */

  /* ================== 手动暂停/恢复 ================== */
  setPause(value) {
    set({ pauseGame: value })
  },

  triggerSkillCooldown(category, actualCd) {
    const { skillCooldowns } = get()
    const state = skillCooldowns[category]
    // 若传入了实际 CD 则更新 maxCd，否则使用已存的 maxCd
    const maxCd = actualCd ?? state?.maxCd ?? 0
    set({
      skillCooldowns: {
        ...skillCooldowns,
        [category]: { cd: maxCd, maxCd }
      }
    })
  }
}))
