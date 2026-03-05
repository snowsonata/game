import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()

  return (
    <div className="page">
      <h1>Muxi Shooter</h1>

      <button onClick={() => nav('/game')}>
        开始第一关
      </button>

      <button disabled>第二关（未解锁）</button>
      <button disabled>第三关（未解锁）</button>
    </div>
  )
}
