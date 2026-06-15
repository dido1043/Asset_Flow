import api from './axios'

export const getProtocolsByEmployee = (employeeId) =>  api.get(`/protocol/employee/${employeeId}`)
export const getProtocolById = (id) => api.get(`/protocol/${id}`)
export const downloadProtocol = (id) => api.get(`/protocol/download/${id}`, { responseType: 'blob' })
export const getProtocolsByOrganization = (orgId) => api.get(`/protocol/org/${orgId}`)

export const createProtocol = (organizationId, userId) => api.post(`/protocol/create/${organizationId}/user/${userId}`)
export const createReturnProtocol = (organizationId, userId) => api.post(`/protocol/create-return/${organizationId}/user/${userId}`)

export const editProtocolText = (protocolId, content) => api.put(`/protocol/edit/${protocolId}`, content, {
    headers: { 'Content-Type': 'text/plain' },
  })
