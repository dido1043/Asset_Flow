import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import OAuthCallback from './pages/OAuthCallback'
import Navigation from './components/shared/Navigation'

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
