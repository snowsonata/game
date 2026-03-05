import { useGameStore } from '../store/gameStore'

export default function Skills() {
  const { skillStats } = useGameStore()

  return (
    <div className="page">
      <h2>技能</h2>
      <pre>{JSON.stringify(skillStats, null, 2)}</pre>
    </div>
  )
}
