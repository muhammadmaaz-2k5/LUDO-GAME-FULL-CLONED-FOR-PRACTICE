import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './layout'
import './App.css'
import { ThemesProvider } from './context/themeContext'

// Import pages
import Home from './pages/Home'
import PlayOnline from './pages/PlayOnline'
import Computer from './pages/Computer'
import Tournaments from './pages/Tournaments'
import Variants from './pages/Variants'
import Leaderboard from './pages/Leaderboard'
import Login from './pages/Login'
import Settings from './pages/Settings'

// Import components
import { Themes } from './components/themes'

function App() {
  return (
    <ThemesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/play-online" element={<Layout><PlayOnline /></Layout>} />
          <Route path="/computer" element={<Layout><Computer /></Layout>} />
          <Route path="/tournaments" element={<Layout><Tournaments /></Layout>} />
          <Route path="/variants" element={<Layout><Variants /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          
          <Route path="/settings" element={<Layout><Settings /></Layout>}>
            <Route index element={<Themes />} />
            <Route path="themes" element={<Themes />} />
            <Route path="audio" element={<div />} />
            <Route path="gameplay" element={<div />} />
            <Route path="profile" element={<div />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemesProvider>
  )
}

export default App
