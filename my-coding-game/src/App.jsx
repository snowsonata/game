import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import Skills from './pages/Skills'
import Enhance from './pages/Enhance'
import Codex from './pages/Codex'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TabBar from './ui/TabBar'
import { Toaster } from 'react-hot-toast'

export default function App() {
  const location = useLocation()
  const isGamePage = location.pathname === '/game'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="app">
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/enhance" element={<Enhance />} />
        <Route path="/codex" element={<Codex />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>

      {!isGamePage && !isAuthPage && <TabBar />}
    </div>
  )
}
