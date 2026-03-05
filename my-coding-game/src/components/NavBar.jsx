// src/components/NavBar.jsx
import { NavLink } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="nav">
      <NavLink to="/">主页</NavLink>
      <NavLink to="/enhance">强化</NavLink>
      <NavLink to="/skills">技能</NavLink>
      <NavLink to="/codex">图鉴</NavLink>
    </nav>
  )
}
