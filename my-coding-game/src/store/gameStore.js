import { create } from 'zustand'
import { getRandomSkills } from '../game/skill/skillSystem'

/* ================= 经验曲线 ================= */

// 你以后想换“波动式”“阶段式”，只改这里
function calcExpMax(level) {
  return Math.floor(10 + level * level * 1.5)
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
    set(state => ({
      skillLevels: {
        ...state.skillLevels,
        [skill.category]:
          (state.skillLevels[skill.category] || 0) + 1
      },

      skillEffects: [...state.skillEffects, skill],

      isLevelUp: false,
      pauseGame: false,
      levelUpChoices: []
    }))
  }
}))
