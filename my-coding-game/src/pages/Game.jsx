import { useRef, useCallback } from 'react'
import GameCanvas from '../game/canvas/GameCanvas.jsx'
import SkillHUD from '../ui/SkillHUD.jsx'
import VirtualJoystick from '../ui/VirtualJoystick.jsx'

export default function Game() {
  // 通过 ref 传递摇杆移动回调给 GameCanvas
  const joystickMoveRef = useRef(null)

  const handleJoystickMove = useCallback((dx) => {
    if (joystickMoveRef.current) {
      joystickMoveRef.current(dx)
    }
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <GameCanvas joystickMoveRef={joystickMoveRef} />
      <SkillHUD />
      <VirtualJoystick onMove={handleJoystickMove} />
    </div>
  )
}
