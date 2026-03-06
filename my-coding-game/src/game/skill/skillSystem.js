// src/game/skill/skillSystem.js
import { SKILL_POOL } from './skillPool'

const MAX_CATEGORIES = 3  // 最多拥有的技能大类数量

/**
 * 获取升级时的随机技能选项
 *
 * 规则：
 * - 若已拥有大类 < MAX_CATEGORIES：可从所有大类中随机（包含新大类）
 * - 若已拥有大类 >= MAX_CATEGORIES：只从已拥有的大类中出牌
 * - 每次升级展示 count 张（去重，同大类最多出现一次）
 */
export function getRandomSkills({ ownedSkills = {}, count = 3 }) {
  const ownedCategories = Object.keys(ownedSkills).filter(c => (ownedSkills[c] || 0) > 0)
  const isLocked = ownedCategories.length >= MAX_CATEGORIES

  const candidates = []

  for (const [category, data] of Object.entries(SKILL_POOL)) {
    // 大类锁定后，只允许已拥有的大类出牌
    if (isLocked && !ownedCategories.includes(category)) continue

    const level = ownedSkills[category] || 0
    const tier = getTierByLevel(level)
    const pool = data[tier] || []

    pool.forEach(skill => {
      candidates.push({
        ...skill,
        category,
        tier
      })
    })
  }

  // 打乱后取前 count 个，但同一大类最多出现一次
  const shuffled = shuffle(candidates)
  const result = []
  const usedCategories = new Set()

  for (const skill of shuffled) {
    if (result.length >= count) break
    if (usedCategories.has(skill.category)) continue
    result.push(skill)
    usedCategories.add(skill.category)
  }

  // 若候选不足 count 个（某大类已无可选），允许同大类重复填充
  if (result.length < count) {
    for (const skill of shuffled) {
      if (result.length >= count) break
      if (result.includes(skill)) continue
      result.push(skill)
    }
  }

  return result
}

/* ============== 稀有度规则 ============== */
function getTierByLevel(level) {
  if (level >= 6) return 'gold'
  if (level >= 3) return 'silver'
  return 'bronze'
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
