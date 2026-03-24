import request from '@/Utils/request'

export function fetchProperties(params) {
  return request.get('/properties', { params })
}

export function createProperty(payload) {
  return request.post('/properties', payload)
}

export function updateProperty(id, payload) {
  return request.put(`/properties/${id}`, payload)
}

export function deleteProperty(id) {
  return request.delete(`/properties/${id}`)
}

export function fetchObjectTypes() {
  return request.get('/object-types')
}

export function createObjectType(payload) {
  return request.post('/object-types', payload)
}

export function addInterfaceToObjectType(objectType, payload) {
  return request.post(`/object-types/${objectType}/interfaces`, payload)
}

export function removeInterfaceFromObjectType(objectType, interfaceName) {
  return request.delete(`/object-types/${objectType}/interfaces/${interfaceName}`)
}

export function deleteObjectType(objectType) {
  return request.delete(`/object-types/${objectType}`)
}

export async function exportPropertyData(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })

  const baseUrl = import.meta.env.VITE_API_URL || '/api'
  const token = localStorage.getItem('token')
  const url = `${baseUrl}/properties/export${query.toString() ? `?${query.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,text/csv,*/*'
    }
  })

  if (!response.ok) {
    let message = `导出失败（HTTP ${response.status}）`
    try {
      const errorText = await response.text()
      const errorJson = JSON.parse(errorText)
      message = errorJson?.message || message
    } catch {
    }
    throw new Error(message)
  }

  return {
    blob: await response.blob(),
    contentDisposition: response.headers.get('content-disposition'),
    contentType: response.headers.get('content-type')
  }
}

export function fetchPropertyMetadata() {
  return request.get('/property-metadata')
}

export function fetchPropertyTree(params) {
  return request.get('/properties/tree', { params })
}
