import api from './axios'

export const createAssignment = (data) => api.post('/assignment/add', data)
export const getAssignment = (id) => api.get(`/assignment/get/${id}`)
export const getAllAssignments = () => api.get('/assignment/all')
export const updateAssignment = (id, data) => api.put(`/assignment/update/${id}`, data)
export const deleteAssignment = (id) => api.delete(`/assignment/delete/${id}`)

export const getUserAssignments = (userId) => api.get(`/assignment/user/${userId}`)
export const getAssignmentsByProduct = (productId) => api.get(`/assignment/product/${productId}`)
export const getAssignmentsByOrganization = (orgId) => api.get(`/assignment/org/${orgId}`)
export const getCurrentlyAssigned = () => api.get('/assignment/current')
