import { useRef, useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameCanvas from '../game/canvas/GameCanvas.jsx'
import SkillHUD from '../ui/SkillHUD.jsx'
import VirtualJoystick from '../ui/VirtualJoystick.jsx'
import { useGameStore } from '../store/gameStore'
import StageClearScreen from '../ui/StageClearScreen.jsx'

/* ===== 等级 & 经验值 HUD（左上角，独立于暂停按钮） ===== */
function LevelExpHUD() {
  const level  = useGameStore(s => s.level)
  const exp    = useGameStore(s => s.exp)
  const expMax = useGameStore(s => s.expMax)
  const progress = Math.min(1, exp / expMax)

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      left: 8,
      zIndex: 40,
      pointerEvents: 'none',
      minWidth: 140
    }}>
      {/* 等级文字 */}
      <div style={{
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textShadow: '0 1px 3px #000',
        marginBottom: 3
      }}>
        Lv.{level}
      </div>

      {/* 经验条 */}
      <div style={{
        width: 130,
        height: 7,
        background: '#333',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid #555'
      }}>
        <div style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4af, #08f)',
          borderRadius: 4,
          transition: 'width 0.15s ease'
        }} />
      </div>

      {/* 经验数值 */}
      <div style={{
        color: '#aaa',
        fontSize: 10,
        marginTop: 2,
        textShadow: '0 1px 2px #000'
      }}>
        {exp} / {expMax}
      </div>
    </div>
  )
}

export default function Game() {
  const navigate = useNavigate()
  const joystickMoveRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [stageClear, setStageClear] = useState(false)

  const pauseGame = useGameStore(s => s.pauseGame)
  const setPause  = useGameStore(s => s.setPause)
  const setStageClearStore = useGameStore(s => s.setStageClear)

  // 监听通关事件（通过 store 状态轮询）
  const stageClearStore = useGameStore(s => s.stageClear)
  useEffect(() => {
    if (stageClearStore) {
      setStageClear(true)
      setPause(true)
    }
  }, [stageClearStore])

  // 手动暂停/恢复（不影响升级弹窗的自动暂停）
  function togglePause() {
    if (useGameStore.getState().isLevelUp) return  // 升级期间不允许手动操作
    if (stageClear) return  // 通关后不允许操作
    setPause(!pauseGame)
    setMenuOpen(!pauseGame)  // 暂停时展开菜单，恢复时收起
  }

  function handleResume() {
    setPause(false)
    setMenuOpen(false)
  }

  function handleExit() {
    setPause(false)
    setStageClearStore(false)
    setStageClear(false)
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

      {/* ===== 左上角：等级 & 经验值（与暂停按钮完全分离） ===== */}
      <LevelExpHUD />

      {/* ===== 右上角：暂停按钮（独立，不与等级/经验值重叠） ===== */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 40 }}>
        {/* 主按钮：暂停/继续图标 */}
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

      {/* ===== 通关结算画面 ===== */}
      {stageClear && (
        <StageClearScreen onExit={handleExit} />
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
