import request from '@/Utils/request'

/**
 * 获取管系专业目录树。
 */
export function getPipingSpecTree() {
  return request({
    url: '/product-standard/piping-spec/tree',
    method: 'get'
  })
}

/**
 * 获取部件类型基础数据。
 * @param {string} nodeLabel 当前节点名称
 * @param {string} category 当前节点分类
 */
export function getPipingComponentBaseData(nodeLabel, category) {
  return request({
    url: '/product-standard/piping-spec/component-base-data',
    method: 'get',
    params: { nodeLabel, category }
  })
}

/**
 * 获取公用端面数据。
 * @param {string} nodeLabel 当前节点名称
 * @param {string} category 当前节点分类
 * @param {object} filters 筛选参数
 */
export function getPipingComponentCommonData(nodeLabel, category, filters = {}) {
  return request({
    url: '/product-standard/piping-spec/component-common-data',
    method: 'get',
    params: { nodeLabel, category, ...filters }
  })
}

/**
 * 获取外形、重量、重心描述数据。
 * @param {string} nodeLabel 当前节点名称
 * @param {string} category 当前节点分类
 * @param {object} filters 筛选参数
 */
export function getPipingComponentAppearanceData(nodeLabel, category, filters = {}) {
  return request({
    url: '/product-standard/piping-spec/component-appearance-data',
    method: 'get',
    params: { nodeLabel, category, ...filters }
  })
}

/**
 * 获取另存为弹窗下拉选项。
 */
export function getPipingBaseOptions() {
  return request({
    url: '/product-standard/piping-spec/base-options',
    method: 'get'
  })
}

/**
 * 保存或另存为部件类型基础数据。
 * @param {object} data 保存参数
 */
export function savePipingComponentBase(data) {
  return request({
    url: '/product-standard/piping-spec/save-component-base',
    method: 'post',
    data
  })
}

/**
 * 禁用选中的表格行。
 * 当前为前端占位实现，后续可替换为真实接口。
 * @param {Array} rows 选中的表格行
 */
export function disablePipingRows(rows) {
  console.log('disablePipingRows mock passthrough', rows)
  return Promise.resolve({ code: 200, message: '操作成功' })
}
