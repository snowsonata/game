// src/ui/VirtualJoystick.jsx
// 虚拟摇杆 UI 组件
// 显示在战斗屏幕底部，接收触摸/鼠标事件，通过 onMove 回调传递 dx 偏移量

import { useRef, useEffect } from 'react'

const TRACK_W = 200   // 轨道总宽度
const TRACK_H = 48    // 轨道高度
const KNOB_R  = 20    // 旋钮半径
const DEAD_ZONE = 4   // 死区（px），小于此值不移动

export default function VirtualJoystick({ onMove }) {
  const trackRef = useRef(null)
  const knobRef  = useRef(null)

  // 记录触摸起点和上一帧位置
  const stateRef = useRef({
    active: false,
    startX: 0,
    lastX: 0,
    knobOffset: 0  // knob 相对轨道中心的偏移（-1 ~ 1）
  })

  useEffect(() => {
    const track = trackRef.current
    const knob  = knobRef.current
    const state = stateRef.current

    const MAX_OFFSET = TRACK_W / 2 - KNOB_R - 4

    function setKnobPos(offset) {
      const clamped = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offset))
      knob.style.transform = `translateX(${clamped}px)`
      state.knobOffset = clamped / MAX_OFFSET  // -1 ~ 1
    }

    function onStart(clientX) {
      state.active = true
      state.startX = clientX
      state.lastX  = clientX
    }

    function onDrag(clientX) {
      if (!state.active) return
      const dx = clientX - state.lastX
      state.lastX = clientX

      if (Math.abs(dx) > DEAD_ZONE || Math.abs(dx) > 0) {
        const newOffset = (state.knobOffset * MAX_OFFSET) + dx
        setKnobPos(newOffset)
        // 回调：传递 dx（屏幕像素，由 GameCanvas 换算 Canvas 坐标）
        onMove && onMove(dx)
      }
    }

    function onEnd() {
      state.active = false
      // 弹回中心
      setKnobPos(0)
    }

    // Touch 事件
    function onTouchStart(e) {
      e.preventDefault()
      onStart(e.touches[0].clientX)
    }
    function onTouchMove(e) {
      e.preventDefault()
      onDrag(e.touches[0].clientX)
    }
    function onTouchEnd(e) {
      e.preventDefault()
      onEnd()
    }

    // Mouse 事件（PC 调试）
    function onMouseDown(e) {
      onStart(e.clientX)
    }
    function onMouseMove(e) {
      onDrag(e.clientX)
    }
    function onMouseUp() {
      onEnd()
    }

    track.addEventListener('touchstart',  onTouchStart, { passive: false })
    track.addEventListener('touchmove',   onTouchMove,  { passive: false })
    track.addEventListener('touchend',    onTouchEnd,   { passive: false })
    track.addEventListener('mousedown',   onMouseDown)
    window.addEventListener('mousemove',  onMouseMove)
    window.addEventListener('mouseup',    onMouseUp)

    return () => {
      track.removeEventListener('touchstart',  onTouchStart)
      track.removeEventListener('touchmove',   onTouchMove)
      track.removeEventListener('touchend',    onTouchEnd)
      track.removeEventListener('mousedown',   onMouseDown)
      window.removeEventListener('mousemove',  onMouseMove)
      window.removeEventListener('mouseup',    onMouseUp)
    }
  }, [onMove])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        pointerEvents: 'auto',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {/* 轨道 */}
      <div
        ref={trackRef}
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          background: 'rgba(255,255,255,0.08)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        {/* 中心刻度线 */}
        <div style={{
          position: 'absolute',
          width: 1,
          height: '60%',
          background: 'rgba(255,255,255,0.15)'
        }} />

        {/* 旋钮 */}
        <div
          ref={knobRef}
          style={{
            width: KNOB_R * 2,
            height: KNOB_R * 2,
            borderRadius: '50%',
            background: 'rgba(68, 170, 255, 0.85)',
            border: '2px solid rgba(68,170,255,1)',
            boxShadow: '0 0 8px rgba(68,170,255,0.6)',
            transition: 'transform 0.05s ease-out',
            flexShrink: 0,
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* 提示文字 */}
      <div style={{
        textAlign: 'center',
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 4
      }}>
        左右滑动移动角色
      </div>
    </div>
  )
}
