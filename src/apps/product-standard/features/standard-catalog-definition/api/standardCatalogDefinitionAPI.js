import request from '@/Utils/request'

/**
 * 获取标准目录定义模块的专业下拉选项。
 * 数据来源为 S3D_Dict_ComponentType 的 Discipline 去重结果。
 */
export function getStandardCatalogDisciplines() {
  return request({
    url: '/StandardCatalogDefinition/disciplines',
    method: 'get'
  }).then((res) => (Array.isArray(res) ? res : []))
}

/**
 * 获取标准目录定义模块的部件类型列表。
 * @param {object} params 查询参数
 * @param {string} [params.discipline] 专业筛选值
 * @param {boolean} [params.enabledOnly] 是否只返回启用项
 */
export function getStandardCatalogComponentTypes(params = {}) {
  return request({
    url: '/StandardCatalogDefinition/component-types',
    method: 'get',
    params
  }).then((res) => (Array.isArray(res) ? res : []))
}

/**
 * 获取指定部件类型下的产品元件标准列表。
 * @param {number} componentTypeId 部件类型主键
 */
export function getStandardCatalogIndustryStandards(componentTypeId) {
  return request({
    url: `/StandardCatalogDefinition/component-types/${componentTypeId}/industry-standards`,
    method: 'get'
  }).then((res) => (Array.isArray(res) ? res : []))
}

/**
 * 更新指定产品元件标准的启用状态。
 * @param {number} id 关联记录主键
 * @param {boolean} enabled 目标启用状态
 */
export function updateStandardCatalogIndustryStandardStatus(id, enabled) {
  return request({
    url: `/StandardCatalogDefinition/industry-standards/${id}/status`,
    method: 'put',
    data: { enabled }
  })
}

/**
 * 更新指定部件类型的启用状态。
 * @param {number} id 主键标识
 * @param {boolean} enabled 目标启用状态
 */
export function updateStandardCatalogComponentTypeStatus(id, enabled) {
  return request({
    url: `/StandardCatalogDefinition/component-types/${id}/status`,
    method: 'put',
    data: { enabled }
  })
}
