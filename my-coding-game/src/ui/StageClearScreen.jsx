// src/ui/StageClearScreen.jsx
// 通关结算画面：显示获得的量子和金币奖励

import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

/* ===== 奖励计算规则 =====
 * 量子（Quantum）：稀有货币，用于解锁高级内容
 *   基础：通关固定 +10
 *   等级加成：每级 +2
 *   HP加成：剩余HP每点 +1
 *
 * 金币（Gold）：通用货币，用于强化与购买
 *   基础：通关固定 +100
 *   等级加成：每级 +15
 *   HP加成：剩余HP每点 +5
 * ============================= */
function calcRewards({ level, hp, skillCount }) {
  const quantum = 10 + level * 2 + Math.max(0, hp)
  const gold    = 100 + level * 15 + Math.max(0, hp) * 5

  // 技能种类加成
  const skillBonus = skillCount * 5
  return {
    quantum: quantum + skillBonus,
    gold: gold + skillBonus * 10
  }
}

/* ===== 数字滚动动画 hook ===== */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const startRef = useRef(null)
  const rafRef   = useRef(null)

  useEffect(() => {
    startRef.current = null
    function tick(time) {
      if (!startRef.current) startRef.current = time
      const elapsed = time - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

/* ===== 单行奖励展示 ===== */
function RewardRow({ icon, label, value, color, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const displayValue = useCountUp(visible ? value : 0, 1000)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 10,
      border: `1px solid ${color}44`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      marginBottom: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <span style={{ color: '#ddd', fontSize: 15 }}>{label}</span>
      </div>
      <span style={{
        fontSize: 22,
        fontWeight: 'bold',
        color,
        textShadow: `0 0 12px ${color}88`
      }}>
        +{displayValue}
      </span>
    </div>
  )
}

/* ===== 主组件 ===== */
export default function StageClearScreen({ onExit }) {
  const level      = useGameStore(s => s.level)
  const hp         = useGameStore(s => s.hp ?? 10)
  const skillLevels = useGameStore(s => s.skillLevels)
  const addCurrency = useGameStore(s => s.addCurrency)

  const skillCount = Object.keys(skillLevels).length

  const [rewards] = useState(() => calcRewards({ level, hp, skillCount }))
  const [rewarded, setRewarded] = useState(false)

  // 发放奖励（只执行一次）
  useEffect(() => {
    if (!rewarded) {
      addCurrency({ quantum: rewards.quantum, gold: rewards.gold })
      setRewarded(true)
    }
  }, [])

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(160deg, #050510 0%, #0a0a25 50%, #050510 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
      padding: 24
    }}>
      {/* 标题 */}
      <div style={{
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f1c40f',
        textShadow: '0 0 20px #f1c40f88, 0 2px 8px #000',
        marginBottom: 6,
        letterSpacing: 3
      }}>
        ✦ 关卡通关 ✦
      </div>
      <div style={{ color: '#888', fontSize: 13, marginBottom: 28 }}>
        第一关 · 全部波次已清除
      </div>

      {/* 统计信息 */}
      <div style={{
        width: '100%', maxWidth: 320,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 20,
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
          结算统计
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <StatItem label="最终等级" value={`Lv.${level}`} />
          <StatItem label="技能种类" value={`${skillCount} 种`} />
          <StatItem label="剩余HP" value={`${Math.max(0, hp)}`} />
        </div>
      </div>

      {/* 奖励区域 */}
      <div style={{ width: '100%', maxWidth: 320, marginBottom: 24 }}>
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
          获得奖励
        </div>

        <RewardRow
          icon="💠"
          label="量子"
          value={rewards.quantum}
          color="#4af"
          delay={200}
        />
        <RewardRow
          icon="🪙"
          label="金币"
          value={rewards.gold}
          color="#f1c40f"
          delay={600}
        />
      </div>

      {/* 奖励说明 */}
      <div style={{
        color: '#555',
        fontSize: 10,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 1.6
      }}>
        量子用于解锁高级内容 · 金币用于强化与购买
        <br />
        奖励已自动存入账户
      </div>

      {/* 按钮 */}
      <button
        onClick={onExit}
        style={{
          width: 180, height: 44,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #1a4a8a, #0d2d5e)',
          border: '1.5px solid #4af',
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
          cursor: 'pointer',
          letterSpacing: 2,
          boxShadow: '0 0 16px #4af44'
        }}
      >
        返回主页
      </button>
    </div>
  )
}

function StatItem({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{value}</div>
      <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>{label}</div>
    </div>
  )
}
