import { useRef, useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameCanvas from '../game/canvas/GameCanvas.jsx'
import SkillHUD from '../ui/SkillHUD.jsx'
import VirtualJoystick from '../ui/VirtualJoystick.jsx'
import { useGameStore } from '../store/gameStore'
import StageClearScreen from '../ui/StageClearScreen.jsx'

/* ================================================================
 * 顶部 HUD 布局（三列，互不重叠）
 *
 * ┌──────────────────────────────────────────────┐
 * │ [Lv.X]          [⏱ 00:XX]         [⏸ / ▶]  │
 * │ ████░░░░░░░░                                  │
 * │ 12 / 30                                       │
 * └──────────────────────────────────────────────┘
 * ================================================================ */

/* ---- 左上角：等级 + 经验条 ---- */
function LevelExpHUD() {
  const level   = useGameStore(s => s.level)
  const exp     = useGameStore(s => s.exp)
  const expMax  = useGameStore(s => s.expMax)
  const progress = Math.min(1, exp / expMax)

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      left: 8,
      zIndex: 40,
      pointerEvents: 'none',
      width: 110
    }}>
      <div style={{
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textShadow: '0 1px 3px #000',
        marginBottom: 3
      }}>
        Lv.{level}
      </div>
      <div style={{
        width: '100%',
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

/* ---- 顶部正中：倒计时 ---- */
function TimerHUD() {
  const timeLeft = useGameStore(s => s.timeLeft)
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const isUrgent = timeLeft <= 10

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      pointerEvents: 'none',
      textAlign: 'center'
    }}>
      <div style={{
        background: isUrgent ? 'rgba(180,20,20,0.80)' : 'rgba(0,0,0,0.65)',
        border: `1.5px solid ${isUrgent ? '#f44' : 'rgba(255,255,255,0.25)'}`,
        borderRadius: 8,
        padding: '3px 12px',
        backdropFilter: 'blur(4px)',
        display: 'inline-block'
      }}>
        <span style={{
          color: isUrgent ? '#fdd' : '#fff',
          fontSize: 16,
          fontWeight: 'bold',
          fontVariantNumeric: 'tabular-nums',
          textShadow: '0 1px 3px #000',
          letterSpacing: 1
        }}>
          ⏱ {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`}
        </span>
      </div>
    </div>
  )
}

/* ================================================================
 * 主组件
 * ================================================================ */
export default function Game({ onBack }) {
  const navigate = useNavigate()
  const joystickMoveRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [stageClear, setStageClear] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const pauseGame          = useGameStore(s => s.pauseGame)
  const setPause           = useGameStore(s => s.setPause)
  const setStageClearStore = useGameStore(s => s.setStageClear)
  const setGameOverStore   = useGameStore(s => s.setGameOver)

  /* 监听通关事件 */
  const stageClearStore = useGameStore(s => s.stageClear)
  useEffect(() => {
    if (stageClearStore) {
      setStageClear(true)
      setPause(true)
    }
  }, [stageClearStore])

  /* 监听失败事件 */
  const gameOverStore = useGameStore(s => s.gameOver)
  useEffect(() => {
    if (gameOverStore) {
      setGameOver(true)
      setPause(true)
    }
  }, [gameOverStore])

  /* 手动暂停/恢复 */
  function togglePause() {
    if (useGameStore.getState().isLevelUp) return
    if (stageClear || gameOver) return
    const next = !pauseGame
    setPause(next)
    setMenuOpen(next)
  }

  function handleResume() {
    setPause(false)
    setMenuOpen(false)
  }

  function handleExit() {
    setPause(false)
    setStageClearStore(false)
    setGameOverStore(false)
    setStageClear(false)
    setGameOver(false)
    if (onBack) {
      onBack();
    } else {
      navigate('/')
    }
  }

  const handleJoystickMove = useCallback((dx) => {
    if (joystickMoveRef.current) joystickMoveRef.current(dx)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GameCanvas joystickMoveRef={joystickMoveRef} />
      <SkillHUD />

      {/* ★ 传递 paused 给摇杆，暂停时停止推送移动量 */}
      <VirtualJoystick onMove={handleJoystickMove} paused={pauseGame} />

      {/* ===== 左上角：等级 + 经验值 ===== */}
      <LevelExpHUD />

      {/* ===== 顶部正中：倒计时 ===== */}
      <TimerHUD />

      {/* ===== 右上角：暂停按钮（固定位置，菜单绝对定位不影响按钮位置） ===== */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 40,
        /* ★ 修复：不使用 flexDirection:column，避免菜单展开时撑开容器导致按钮偏移 */
        width: 36,
        height: 36
      }}>
        {/* 暂停/继续图标按钮（固定在右上角，不随菜单移动） */}
        <button
          onClick={togglePause}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(0,0,0,0.65)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          {menuOpen ? '▶' : '⏸'}
        </button>

        {/* ★ 展开菜单：绝对定位在按钮正下方，不影响按钮本身位置 */}
        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: 42,   /* 按钮高度36 + 间距6 */
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            <button onClick={handleResume} style={menuBtnStyle('#1a6b3a')}>
              继续
            </button>
            <button onClick={handleExit} style={menuBtnStyle('#6b1a1a')}>
              退出
            </button>
          </div>
        )}
      </div>

      {/* ===== 暂停遮罩 ===== */}
      {menuOpen && !stageClear && !gameOver && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 28,
            fontWeight: 'bold',
            letterSpacing: 4
          }}>
            已暂停
          </span>
        </div>
      )}

      {/* ===== 通关结算画面 ===== */}
      {stageClear && <StageClearScreen onExit={handleExit} />}

      {/* ===== 失败画面 ===== */}
      {gameOver && !stageClear && <GameOverScreen onExit={handleExit} />}
    </div>
  )
}

/* ---- 失败画面 ---- */
function GameOverScreen({ onExit }) {
  const level       = useGameStore(s => s.level)
  const skillLevels = useGameStore(s => s.skillLevels)
  const skillCount  = Object.keys(skillLevels).length

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }}>
      <div style={{ fontSize: 36, fontWeight: 'bold', color: '#f44', textShadow: '0 0 20px #f44' }}>
        ✕ 时间耗尽
      </div>
      <div style={{ color: '#aaa', fontSize: 14 }}>
        敌人突破了防线……
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: '16px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 220
      }}>
        <StatRow label="最终等级" value={`Lv.${level}`}       color="#4af" />
        <StatRow label="技能种类" value={`${skillCount} 种`}  color="#fa4" />
      </div>
      <button
        onClick={onExit}
        style={{
          marginTop: 8,
          padding: '10px 36px',
          borderRadius: 8,
          background: '#6b1a1a',
          border: '1.5px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: 15,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        返回主页
      </button>
    </div>
  )
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32 }}>
      <span style={{ color: '#888', fontSize: 13 }}>{label}</span>
      <span style={{ color: color || '#fff', fontSize: 14, fontWeight: 'bold' }}>{value}</span>
    </div>
  )
}

function menuBtnStyle(bg) {
  return {
    width: 60,
    height: 30,
    borderRadius: 6,
    background: bg,
    border: '1.5px solid rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 13,
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}
