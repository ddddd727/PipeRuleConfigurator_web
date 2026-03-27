import request from '@/Utils/request'

/**
 * 获取 Codelist 目录树。
 */
export function getCodelistTree() {
  return request({
    url: '/product-standard/codelist/tree',
    method: 'get'
  })
}

/**
 * 获取 Codelist 首层表格数据和层级信息。
 * @param {string} nodeLabel 当前节点名称
 */
export function getCodelistTableData(nodeLabel) {
  return request({
    url: '/product-standard/codelist/table-data',
    method: 'get',
    params: { nodeLabel }
  })
}

/**
 * 根据父级层级名和 shortDesc 查询子集数据。
 * @param {string} levelName 父级层级名称
 * @param {string} shortDesc 父级 shortDesc
 */
export function getCodelistChildData(levelName, shortDesc) {
  return request({
    url: '/product-standard/codelist/child-data',
    method: 'get',
    params: { levelName, shortDesc }
  })
}

/**
 * 保存新增的 Codelist 项。
 * @param {object} data 保存参数
 */
export function saveCodelistItem(data) {
  return request({
    url: '/product-standard/codelist/save-item',
    method: 'post',
    data
  })
}

/**
 * 获取建议的下一个 Codelist 编码。
 * @param {string} nodeLabel 当前节点名称
 * @param {string|number} category 当前层级数
 * @param {string} parentShortDesc 父级 shortDesc
 */
export function getNextCodelistNumber(nodeLabel, category, parentShortDesc = '') {
  return request({
    url: '/product-standard/codelist/next-code-num',
    method: 'get',
    params: { nodeLabel, category, parentShortDesc }
  })
}

/**
 * 禁用选中的行。
 * 当前为前端占位实现，后续可替换为真实接口。
 * @param {Array} rows 选中的表格行
 */
export function disableRows(rows) {
  console.log('disableRows mock passthrough', rows)
  return Promise.resolve({ code: 200, message: '操作成功' })
}

/**
 * 启用选中的行。
 * 当前为前端占位实现，后续可替换为真实接口。
 * @param {Array} rows 选中的表格行
 */
export function enableRows(rows) {
  console.log('enableRows mock passthrough', rows)
  return Promise.resolve({ code: 200, message: '操作成功' })
}
