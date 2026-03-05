// src/game/levelUp.js
import { SKILL_CATEGORIES } from './skill/skillCategories'

export function getSkillChoices(state) {
  const picked = Object.keys(state.skillLevels)

  // 首次升级
  if (picked.length === 0) {
    return random(SKILL_CATEGORIES, 3)
  }

  // 未满 3 大类
  if (picked.length < 3) {
    const unpicked = SKILL_CATEGORIES.filter(c => !picked.includes(c))
    return [
      ...random(unpicked, 2),
      random(picked, 1)[0]
    ]
  }

  // 已满 3 大类 → 强化
  return picked
}

function random(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}
