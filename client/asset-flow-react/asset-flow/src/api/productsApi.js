import api from './axios'

export const createProduct = (data) => api.post('/product', data)
export const addProduct = (data) => api.post('/product/add', data)
export const getProduct = (id) => api.get(`/product/${id}`)
export const getAllProducts = () => api.get('/product/all')
export const updateProduct = (id, data) => api.put(`/product/${id}`, data)
export const deleteProduct = (id) => api.delete(`/product/${id}`)

export const findByAssetTag = (assetTag) => api.get(`/product/asset/${assetTag}`)
export const findByProductType = (type) => api.get(`/product/search/type/${type}`)
export const getProductsByOrganization = (orgId) => api.get(`/product/org/${orgId}`)
