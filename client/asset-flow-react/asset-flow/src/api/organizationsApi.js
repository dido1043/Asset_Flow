import api from './axios'

export const getOrganizationByLeaderId = (leaderId) => api.get(`/org/leader/${leaderId}`)
export const getOrganizationInventory = (organizationId) => api.get(`/org/inventory/${organizationId}`)
export const createOrganization = (leaderId, data) => api.post(`/org/create/${leaderId}`, data)
export const becomeLeader = (userId, organizationId) => api.post(`/org/becomeLeader/${userId}/${organizationId}`)
export const joinOrganization = (userId, organizationId) =>  api.post(`/org/join/${userId}/${organizationId}`)
