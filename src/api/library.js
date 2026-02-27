import request from '@/Utils/request'

/**
 * 获取基础库目录树
 */
export function getLibraryTree() {
  return request({
    url: '/library/tree',
    method: 'get'
  })
}

/**
 * 获取Codelist目录树
 */
export function getCodelistTree() {
  return request({
    url: '/library/codelist-tree',
    method: 'get'
  })
}

/**
 * 获取部件详细信息
 * @param {string} nodeLabel 节点标签
 */
export function getComponentDetails(nodeLabel) {
  return request({
    url: '/library/component-details',
    method: 'get',
    params: { nodeLabel }
  })
}

/**
 * 获取表格数据
 * @param {string} nodeLabel 节点标签
 */
export function getTableData(nodeLabel) {
  return request({
    url: '/library/table-data',
    method: 'get',
    params: { nodeLabel }
  })
}

/**
 * 获取Codelist表格数据
 * @param {string} nodeLabel 节点标签
 */
export function getCodelistTableData(nodeLabel) {
  return request({
    url: '/library/codelist-table-data',
    method: 'get',
    params: { nodeLabel }
  })
}

/**
 * 禁用行数据
 * @param {Array} rows 选中的行数据
 */
export function disableRows(rows) {
  // 模拟接口调用
  console.log('调用后端接口禁用行:', rows)
  return Promise.resolve({ code: 200, message: '操作成功' })
}
