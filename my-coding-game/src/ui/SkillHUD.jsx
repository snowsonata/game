// src/ui/SkillHUD.jsx
// 战斗右上角技能状态面板
// 显示：已获得的技能大类、等级、冷却进度

import { useGameStore } from '../store/gameStore'
import { SKILL_POOL } from '../game/skill/skillPool'

/* ================= 稀有度颜色 ================= */
const TIER_COLOR = {
  bronze: '#cd7f32',
  silver: '#bdc3c7',
  gold: '#f1c40f'
}

function getTierByLevel(level) {
  if (level >= 6) return 'gold'
  if (level >= 3) return 'silver'
  return 'bronze'
}

/* ================= 技能图标缩写（取首字） ================= */
function getAbbr(category) {
  return category.slice(0, 2)
}

/* ================= 单个技能格子 ================= */
function SkillSlot({ category, level, cd, maxCd }) {
  const tier = getTierByLevel(level)
  const color = TIER_COLOR[tier]
  const isReady = cd <= 0
  const progress = maxCd > 0 ? cd / maxCd : 0 // 0 = 就绪，1 = 刚触发

  return (
    <div
      style={{
        position: 'relative',
        width: 40,
        height: 40,
        borderRadius: 6,
        border: `2px solid ${color}`,
        background: '#111',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isReady ? 1 : 0.65
      }}
    >
      {/* 冷却遮罩（从下往上消退） */}
      {!isReady && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: `${progress * 100}%`,
            background: 'rgba(0,0,0,0.6)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* 技能缩写 */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 'bold',
          color: color,
          lineHeight: 1,
          zIndex: 1,
          textAlign: 'center'
        }}
      >
        {getAbbr(category)}
      </span>

      {/* 等级 */}
      <span
        style={{
          fontSize: 9,
          color: '#aaa',
          lineHeight: 1,
          zIndex: 1
        }}
      >
        Lv{level}
      </span>

      {/* 冷却秒数（冷却中才显示） */}
      {!isReady && (
        <span
          style={{
            position: 'absolute',
            bottom: 2,
            right: 3,
            fontSize: 8,
            color: '#fff',
            zIndex: 2
          }}
        >
          {cd.toFixed(1)}
        </span>
      )}

      {/* 就绪标记 */}
      {isReady && maxCd > 0 && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 2,
            fontSize: 8,
            color: '#4f4',
            zIndex: 2
          }}
        >
          ✓
        </span>
      )}
    </div>
  )
}

/* ================= 主组件 ================= */
export default function SkillHUD() {
  const skillLevels = useGameStore(s => s.skillLevels)
  const skillCooldowns = useGameStore(s => s.skillCooldowns)

  const owned = Object.entries(skillLevels)

  if (owned.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,  // 暂停按钮在 right:52，不重叠
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 20,
        pointerEvents: 'none'
      }}
    >
      {owned.map(([category, level]) => {
        const cdState = skillCooldowns[category] || { cd: 0, maxCd: 0 }
        return (
          <SkillSlot
            key={category}
            category={category}
            level={level}
            cd={cdState.cd}
            maxCd={cdState.maxCd}
          />
        )
      })}
    </div>
  )
}
