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
 * 获取部件基础信息
 * @param {string} nodeLabel 节点完整路径
 * @param {string} category 节点分类
 */
export function getComponentBaseData(nodeLabel, category) {
  return request({
    url: '/library/component-base-data',
    method: 'get',
    params: { nodeLabel, category }
  })
}

/**
 * 获取部件公用端面数据
 * @param {string} nodeLabel 节点完整路径
 * @param {string} category 节点分类
 * @param {object} filters 筛选条件
 */
export function getComponentCommonData(nodeLabel, category, filters = {}) {
  return request({
    url: '/library/component-common-data',
    method: 'get',
    params: { nodeLabel, category, ...filters }
  })
}

/**
 * 获取部件外形重量重心描述数据
 * @param {string} nodeLabel 节点完整路径
 * @param {string} category 节点分类
 * @param {object} filters 筛选条件
 */
export function getComponentAppearanceData(nodeLabel, category, filters = {}) {
  return request({
    url: '/library/component-appearance-data',
    method: 'get',
    params: { nodeLabel, category, ...filters }
  })
}

/**
 * 获取Codelist表格及层级数据
 * @param {string} nodeLabel 节点标签
 * @param {string} parentShortDesc 父级短描述，用于查询下一层级数据
 * @param {number} level 当前请求的层级（如1，2，3）
 */
export function getCodelistTableData(nodeLabel, parentShortDesc = '', level = 1) {
  return request({
    url: '/library/codelist-table-data',
    method: 'get',
    params: { nodeLabel, parentShortDesc, level }
  })
}

/**
 * 获取部件基础选项（用于新增下拉限制）
 */
export function getBaseOptions() {
  return request({
    url: '/library/base-options',
    method: 'get'
  })
}

/**
 * 保存/另存为 部件类型基础
 */
export function saveComponentBase(data) {
  return request({
    url: '/library/save-component-base',
    method: 'post',
    data
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

/**
 * 启用/恢复行数据
 * @param {Array} rows 选中的行数据
 */
export function enableRows(rows) {
  // 模拟接口调用
  console.log('调用后端接口启用行:', rows)
  return Promise.resolve({ code: 200, message: '操作成功' })
}

/**
 * 获取 Codelist 预填充值（下一个可用的 codeNum）
 * @param {string} nodeLabel Codelist 名称
 * @param {string|number} category 层级：'1' | '2' | '3'
 * @param {string} parentShortDesc 父级短描述（可为空）
 */
export function getNextCodelistNumber(nodeLabel, category, parentShortDesc = '') {
  return request({
    url: '/library/codelist-next-code-num',
    method: 'get',
    params: { nodeLabel, category, parentShortDesc }
  })
}
