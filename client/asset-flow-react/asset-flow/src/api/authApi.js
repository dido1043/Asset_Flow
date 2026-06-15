import api from './axios'

export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const logout = () => api.post('/auth/logout')

export const getAllUsers = () => api.get('/auth/users')
export const getUser = (userId) => api.get(`/auth/user/${userId}`)
export const getUsersByOrganization = (orgId) => api.get(`/auth/users/org/${orgId}`)

export const oAuthLogin = () => api.get('/auth/oauth2/login')
export const exchangeOAuthCode = (data) => api.post('/auth/oauth/exchange', data)

export const editUser = (userId, data) => api.put(`/auth/user/edit/${userId}`, data)
export const deleteUser = (userId) => api.delete(`/auth/user/delete/${userId}`)
