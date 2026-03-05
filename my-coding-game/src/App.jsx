import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import Skills from './pages/Skills'
import Enhance from './pages/Enhance'
import Codex from './pages/Codex'
import TabBar from './ui/TabBar'

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/enhance" element={<Enhance />} />
        <Route path="/codex" element={<Codex />} />
      </Routes>

      <TabBar />
    </div>
  )
}
