import { useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameCanvas from '../game/canvas/GameCanvas.jsx'
import SkillHUD from '../ui/SkillHUD.jsx'
import VirtualJoystick from '../ui/VirtualJoystick.jsx'
import { useGameStore } from '../store/gameStore'

export default function Game() {
  const navigate = useNavigate()
  const joystickMoveRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const pauseGame = useGameStore(s => s.pauseGame)
  const setPause  = useGameStore(s => s.setPause)

  // 手动暂停/恢复（不影响升级弹窗的自动暂停）
  const isManualPaused = pauseGame && !useGameStore.getState().isLevelUp

  function togglePause() {
    if (useGameStore.getState().isLevelUp) return  // 升级期间不允许手动操作
    setPause(!pauseGame)
    setMenuOpen(!pauseGame)  // 暂停时展开菜单，恢复时收起
  }

  function handleResume() {
    setPause(false)
    setMenuOpen(false)
  }

  function handleExit() {
    setPause(false)
    navigate('/')
  }

  const handleJoystickMove = useCallback((dx) => {
    if (joystickMoveRef.current) joystickMoveRef.current(dx)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GameCanvas joystickMoveRef={joystickMoveRef} />
      <SkillHUD />
      <VirtualJoystick onMove={handleJoystickMove} />

      {/* ===== 左上角暂停/退出混合按钮 ===== */}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 40 }}>
        {/* 主按钮：汉堡图标（暂停中变为 ▶） */}
        <button
          onClick={togglePause}
          style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: 'rgba(0,0,0,0.65)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          {menuOpen ? '▶' : '⏸'}
        </button>

        {/* 展开菜单（暂停时显示） */}
        {menuOpen && (
          <div style={{
            marginTop: 6,
            display: 'flex', flexDirection: 'column', gap: 6
          }}>
            <button
              onClick={handleResume}
              style={menuBtnStyle('#1a6b3a')}
            >
              继续
            </button>
            <button
              onClick={handleExit}
              style={menuBtnStyle('#6b1a1a')}
            >
              退出
            </button>
          </div>
        )}
      </div>

      {/* 暂停遮罩（手动暂停时显示，升级弹窗期间不显示） */}
      {menuOpen && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 28, fontWeight: 'bold', letterSpacing: 4 }}>
            已暂停
          </span>
        </div>
      )}
    </div>
  )
}

function menuBtnStyle(bg) {
  return {
    width: 60, height: 30,
    borderRadius: 6,
    background: bg,
    border: '1.5px solid rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 13,
    cursor: 'pointer',
    backdropFilter: 'blur(4px)'
  }
}
