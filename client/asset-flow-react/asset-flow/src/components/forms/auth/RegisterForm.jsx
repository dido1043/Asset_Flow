import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../../../api/authApi'

const RegisterForm = () => {
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
  const [showPassword, setShowPassword] = useState(false)
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
  const oAuthBtn = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`
  }
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic credentials */}
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        {/* Role, age, organisation */}
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0) + role.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                value={formData.age}
                onChange={handleChange}
                className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {formData.role === 'EMPLOYEE' && (
              <div className="sm:col-span-2">
                <label htmlFor="organizationId" className="block text-sm font-medium text-slate-700">
                  Company
                </label>
                <input
                  id="organizationId"
                  name="organizationId"
                  type="number"
                  min="0"
                  value={formData.organizationId}
                  onChange={handleChange}
                  placeholder="Enter the company ID if the company list is unavailable"
                  className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Company names are shown here. The matching organization ID is submitted to the backend.
                </p>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Or continue with
        </p>
        <button type="button" disabled={loading} onClick={oAuthBtn}>
          Register with Google
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export default RegisterForm
