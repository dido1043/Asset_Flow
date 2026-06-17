import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RegisterForm from './components/forms/auth/RegisterForm'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <>
    <h1>Asset Flow</h1>
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
