import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../../api/authApi'

function RegisterForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    role: 'EMPLOYEE',
    organizationId: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const roles = ['EMPLOYEE', 'LEADER']
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { confirmPassword, age, organizationId, ...rest } = formData
      const payload = {
        ...rest,
        age: age ? Number(age) : null,
        organizationId: organizationId ? Number(organizationId) : null,
      }
      await register(payload)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <div>
        <label htmlFor="fullName">Full Name</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="age">Age</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min="0"
        />
      </div>

      <div>
        <label htmlFor="role">Role</label>
        <select id="role" name="role" value={formData.role} onChange={handleChange}>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="organizationId">Organization ID</label>
        <input
          type="number"
          id="organizationId"
          name="organizationId"
          value={formData.organizationId}
          onChange={handleChange}
          min="0"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}

export default RegisterForm
