import { skillPool } from '../game/skillPool'
import { useGameStore } from '../store/gameStore'

export default function LevelUpPanel() {
  const { setLevelUp } = useGameStore()

  // 随机 3 个技能
  const options = [...skillPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  function choose(skill) {
    const store = useGameStore.getState()
    skill.apply(store)
    setLevelUp(false)
  }

  return (
    <div className="levelup-panel">
      <h2>选择一个技能</h2>
      {options.map(s => (
        <button key={s.id} onClick={() => choose(s)}>
          {s.name}
        </button>
      ))}
    </div>
  )
}
