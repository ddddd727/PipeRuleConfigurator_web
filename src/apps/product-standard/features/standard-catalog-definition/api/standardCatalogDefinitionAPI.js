import request from '@/Utils/request'

export function getStandardCatalogDisciplines() {
  return request({
    url: '/StandardCatalogDefinition/disciplines',
    method: 'get'
  }).then((res) => (Array.isArray(res) ? res : []))
}

export function getStandardCatalogComponentTypes(params = {}) {
  return request({
    url: '/StandardCatalogDefinition/component-types',
    method: 'get',
    params
  }).then((res) => (Array.isArray(res) ? res : []))
}

export function checkStandardCatalogComponentTypeDescriptionExists(params = {}) {
  return request({
    url: '/StandardCatalogDefinition/component-types/existence',
    method: 'get',
    params
  }).then((res) => Boolean(res?.exists))
}

export function createStandardCatalogComponentType(data) {
  return request({
    url: '/StandardCatalogDefinition/component-types',
    method: 'post',
    data
  })
}

export function getStandardCatalogBindingDialog(componentTypeId) {
  return request({
    url: `/StandardCatalogDefinition/component-types/${componentTypeId}/binding-dialog`,
    method: 'get'
  })
}

export function saveStandardCatalogBindings(data) {
  return request({
    url: '/StandardCatalogDefinition/component-type-standard-bindings',
    method: 'put',
    data
  })
}

export function getStandardCatalogIndustryStandards(componentTypeId) {
  return request({
    url: `/StandardCatalogDefinition/component-types/${componentTypeId}/industry-standards`,
    method: 'get'
  }).then((res) => (Array.isArray(res) ? res : []))
}

export function getStandardCatalogCustomCatalogs(componentTypeId) {
  return request({
    url: `/StandardCatalogDefinition/component-types/${componentTypeId}/custom-catalogs`,
    method: 'get'
  }).then((res) => (Array.isArray(res) ? res : []))
}

export function getStandardCatalogProductStandardCatalogs(componentTypeId, componentSubType) {
  return request({
    url: `/StandardCatalogDefinition/component-types/${componentTypeId}/product-standard-catalogs`,
    method: 'get',
    params: { componentSubType }
  }).then((res) => (Array.isArray(res) ? res : []))
}

export function updateStandardCatalogProductStandardCatalogStatus(componentTypeId, data) {
  return request({
    url: `/StandardCatalogDefinition/component-types/${componentTypeId}/product-standard-catalogs/status`,
    method: 'put',
    data
  })
}

export function updateStandardCatalogIndustryStandardStatus(id, enabled) {
  return request({
    url: `/StandardCatalogDefinition/industry-standards/${id}/status`,
    method: 'put',
    data: { enabled }
  })
}

export function updateStandardCatalogComponentTypeStatus(id, enabled) {
  return request({
    url: `/StandardCatalogDefinition/component-types/${id}/status`,
    method: 'put',
    data: { enabled }
  })
}
