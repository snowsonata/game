import GameCanvas from '../game/canvas/GameCanvas.jsx'
import SkillHUD from '../ui/SkillHUD.jsx'

export default function Game() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <GameCanvas />
      <SkillHUD />
    </div>
  )
}
