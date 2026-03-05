// src/pages/LevelUp.jsx
import { useGameStore } from '../store/gameStore'
import { SKILL_POOL } from '../config/skillPool'
import { getRarityByLevel } from '../config/skillRules'

export default function LevelUp({ choices }) {
  const pickSkill = useGameStore(s => s.pickSkill)
  const levels = useGameStore(s => s.skillLevels)

  return (
    <div className="levelup">
      {choices.map(cat => {
        const level = levels[cat] || 1
        const rarities = getRarityByLevel(level)
        const rarity = rarities[Math.floor(Math.random() * rarities.length)]
        const skill =
          SKILL_POOL[cat][rarity][
            Math.floor(Math.random() * SKILL_POOL[cat][rarity].length)
          ]

        return (
          <button
            key={cat + skill.id}
            onClick={() => pickSkill(cat, skill)}
          >
            <h3>{cat}</h3>
            <p>{skill.id}</p>
            <small>{rarity}</small>
          </button>
        )
      })}
    </div>
  )
}
