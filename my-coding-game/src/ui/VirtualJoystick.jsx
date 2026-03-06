// src/ui/VirtualJoystick.jsx
// 王者荣耀式动态摇杆：
//   - 手指按下时，以触点为圆心展开摇杆底盘
//   - 手指滑动时，旋钮跟随手指，超出半径则夹紧在边缘
//   - 手指抬起后，摇杆整体消失
//   - 仅响应屏幕左侧 65% 区域的触摸

import { useEffect, useRef, useState, useCallback } from 'react'

const OUTER_R = 60   // 底盘半径（px）
const INNER_R = 26   // 旋钮半径（px）
const SENSITIVITY = 0.55  // 灵敏度系数

export default function VirtualJoystick({ onMove }) {
  // joystick state: null = 隐藏；有值 = 显示
  const [joystick, setJoystick] = useState(null)

  const activeIdRef = useRef(null)   // 当前追踪的 touch identifier
  const knobDxRef = useRef(0)        // 旋钮相对底盘的 X 偏移（px）
  const rafRef = useRef(null)

  /* RAF 持续推送移动量（模拟摇杆持续输入） */
  const dispatchMove = useCallback((dx) => {
    if (onMove && Math.abs(dx) > 2) {
      onMove(dx * SENSITIVITY)
    }
  }, [onMove])

  useEffect(() => {
    function onTouchStart(e) {
      // 只处理左侧 65% 屏幕，且同时只追踪一个触点
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
      if (activeIdRef.current === null) return
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

        // 记录水平偏移供 RAF 推送
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

  /* 摇杆不可见时不渲染任何 DOM */
  if (!joystick) return null

  const { baseX, baseY, knobX, knobY } = joystick

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100
      }}
    >
      {/* 底盘 */}
      <div
        style={{
          position: 'absolute',
          left: baseX - OUTER_R,
          top: baseY - OUTER_R,
          width: OUTER_R * 2,
          height: OUTER_R * 2,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(255,255,255,0.35)',
          boxSizing: 'border-box'
        }}
      />

      {/* 旋钮 */}
      <div
        style={{
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
        }}
      />
    </div>
  )
}
