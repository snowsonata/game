// src/ui/VirtualJoystick.jsx
// 王者荣耀式动态摇杆：
//   - 手指按下时，以触点为圆心展开摇杆底盘
//   - 手指滑动时，旋钮跟随手指，超出半径则夹紧在边缘
//   - 手指抬起后，摇杆整体消失
//   - 仅响应屏幕左侧 65% 区域的触摸
//   - ★ paused=true 时停止推送移动量，并强制隐藏摇杆

import { useEffect, useRef, useState, useCallback } from 'react'

const OUTER_R = 60   // 底盘半径（px）
const INNER_R = 26   // 旋钮半径（px）
const SENSITIVITY = 0.55  // 灵敏度系数

export default function VirtualJoystick({ onMove, paused = false }) {
  const [joystick, setJoystick] = useState(null)

  const activeIdRef = useRef(null)
  const knobDxRef   = useRef(0)
  const rafRef      = useRef(null)
  // 用 ref 追踪 paused，避免 RAF 闭包陈旧
  const pausedRef   = useRef(paused)

  // 同步 pausedRef
  useEffect(() => {
    pausedRef.current = paused
    if (paused) {
      // 暂停时立即归零并隐藏摇杆
      knobDxRef.current = 0
      activeIdRef.current = null
      setJoystick(null)
    }
  }, [paused])

  /* RAF 持续推送移动量（模拟摇杆持续输入） */
  const dispatchMove = useCallback((dx) => {
    // ★ 暂停时不推送
    if (pausedRef.current) return
    if (onMove && Math.abs(dx) > 2) {
      onMove(dx * SENSITIVITY)
    }
  }, [onMove])

  useEffect(() => {
    function onTouchStart(e) {
      // 暂停时不响应触摸
      if (pausedRef.current) return
      const touch = Array.from(e.changedTouches).find(
        t => t.clientX < window.innerWidth * 0.65
      )
      if (!touch || activeIdRef.current !== null) return

      activeIdRef.current = touch.identifier
      knobDxRef.current = 0

      setJoystick({
        baseX: touch.clientX,
        baseY: touch.clientY,
        knobX: touch.clientX,
        knobY: touch.clientY
      })
    }

    function onTouchMove(e) {
      if (pausedRef.current || activeIdRef.current === null) return
      const touch = Array.from(e.changedTouches).find(
        t => t.identifier === activeIdRef.current
      )
      if (!touch) return
      e.preventDefault()

      setJoystick(prev => {
        if (!prev) return null

        const dx = touch.clientX - prev.baseX
        const dy = touch.clientY - prev.baseY
        const dist = Math.hypot(dx, dy)
        const clamp = Math.min(dist, OUTER_R)
        const angle = Math.atan2(dy, dx)

        const knobX = prev.baseX + Math.cos(angle) * clamp
        const knobY = prev.baseY + Math.sin(angle) * clamp

        knobDxRef.current = Math.cos(angle) * clamp

        return { ...prev, knobX, knobY }
      })
    }

    function onTouchEnd(e) {
      const released = Array.from(e.changedTouches).find(
        t => t.identifier === activeIdRef.current
      )
      if (!released) return

      activeIdRef.current = null
      knobDxRef.current = 0
      setJoystick(null)
    }

    document.addEventListener('touchstart',  onTouchStart, { passive: false })
    document.addEventListener('touchmove',   onTouchMove,  { passive: false })
    document.addEventListener('touchend',    onTouchEnd)
    document.addEventListener('touchcancel', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart',  onTouchStart)
      document.removeEventListener('touchmove',   onTouchMove)
      document.removeEventListener('touchend',    onTouchEnd)
      document.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  /* RAF：持续推送移动量 */
  useEffect(() => {
    function tick() {
      dispatchMove(knobDxRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [dispatchMove])

  if (!joystick) return null

  const { baseX, baseY, knobX, knobY } = joystick

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      {/* 底盘 */}
      <div style={{
        position: 'absolute',
        left: baseX - OUTER_R,
        top: baseY - OUTER_R,
        width: OUTER_R * 2,
        height: OUTER_R * 2,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        border: '2px solid rgba(255,255,255,0.35)',
        boxSizing: 'border-box'
      }} />
      {/* 旋钮 */}
      <div style={{
        position: 'absolute',
        left: knobX - INNER_R,
        top: knobY - INNER_R,
        width: INNER_R * 2,
        height: INNER_R * 2,
        borderRadius: '50%',
        background: 'rgba(80,160,255,0.80)',
        border: '2px solid rgba(255,255,255,0.65)',
        boxShadow: '0 0 12px rgba(80,160,255,0.55)',
        boxSizing: 'border-box'
      }} />
    </div>
  )
}
