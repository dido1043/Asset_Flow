import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true,
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
})

api.interceptors.request.use((config) => {
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith('XSRF-TOKEN='))
    ?.split('=')
    .slice(1)
    .join('=')

  if (
    raw &&
    ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() ?? '')
  ) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(raw)
  }

  return config
})

export default api
