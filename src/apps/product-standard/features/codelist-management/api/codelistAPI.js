import request from '@/Utils/request'

/**
 * 获取所有代码列表目录。
 * 后端真实返回的是目录数组，外层可能带有 value 包装，这里统一展开成数组。
 */
export function getCodelistTree() {
  return request({
    url: '/CodeListTableCatelog',
    method: 'get'
  }).then((res) => {
    if (Array.isArray(res)) return res
    if (Array.isArray(res?.value)) return res.value
    return []
  })
}

const pickRowValue = (row, keys = []) => {
  for (const key of keys) {
    const value = row?.[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return ''
}

const normalizeLevelRows = (rows = [], levelIndex = 1) => {
  const shortKey = `level${levelIndex}ShortDesc`
  const longKey = `level${levelIndex}LongDesc`
  const codeKey = `level${levelIndex}CodeNum`
  const statusKey = `level${levelIndex}Status`
  const uniqueMap = new Map()

  rows.forEach((row) => {
    const normalized = {
      shortDesc: pickRowValue(row, [shortKey, 'shortStringValue', 'shortDesc']),
      longDesc: pickRowValue(row, [longKey, 'longStringValue', 'longDesc']),
      codeNum: pickRowValue(row, [codeKey, 'codeListNumber', 'codeNum']),
      status: Number(pickRowValue(row, [statusKey, 'status', 'level1Status']) || 0)
    }

    if (!normalized.shortDesc && normalized.codeNum === '') return

    const uniqueKey = `${normalized.shortDesc}__${normalized.codeNum}`
    if (!uniqueMap.has(uniqueKey)) {
      uniqueMap.set(uniqueKey, normalized)
    }
  })

  return Array.from(uniqueMap.values())
}

const normalizeCombinedResponse = (res = {}) => {
  const count = Number(res?.count || 1)
  const levelData = normalizeLevelRows(res?.levelData || [], 1)

  return {
    count,
    level1: res?.level1 || 'Level1',
    level2: res?.level2 || '',
    level3: res?.level3 || '',
    levelData
  }
}

/**
 * 获取 Codelist 首层表格数据和层级信息。
 * 当前对接后端真实接口：/CodeListTableCatelog/combined/{codeListTableName}
 * @param {string} nodeLabel 当前节点名称
 */
export function getCodelistTableData(nodeLabel) {
  return request({
    url: `/CodeListTableCatelog/combined/${encodeURIComponent(nodeLabel)}`,
    method: 'get'
  }).then((res) => normalizeCombinedResponse(res))
}

/**
 * 根据父级层级名称和 shortDesc 查询子集数据。
 * @param {string} shortDesc 父级 shortDesc
 */
export function getCodelistChildData(shortDesc) {
  return request({
    url: `/CodeListTableCatelog/values/by-parent/${encodeURIComponent(shortDesc)}`,
    method: 'get'
  }).then((res) => {
    const rows = Array.isArray(res) ? res : Array.isArray(res?.value) ? res.value : []
    return {
      levelData: normalizeLevelRows(rows, 1)
    }
  })
}

/**
 * 创建代码列表值。
 * 当前对接后端真实接口：/CodeListTableCatelog/values
 * @param {object} data 保存参数
 */
export function saveCodelistItem(data) {
  return request({
    url: '/CodeListTableCatelog/values',
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
export function getNextCodelistNumber() {
  return request({
    url: '/CodeListTableCatelog/next-code',
    method: 'get'
  }).then((res) => {
    if (typeof res === 'number') return { nextCodeNum: res }
    if (typeof res?.value === 'number') return { nextCodeNum: res.value }
    if (typeof res?.nextCodeNum === 'number') return { nextCodeNum: res.nextCodeNum }
    return { nextCodeNum: '' }
  })
}

/**
 * 禁用选中的行。
 * 当前仍是前端占位实现，后续可以替换成真实接口。
 * @param {Array} rows 选中的表格行
 */
export function disableRows(rows) {
  console.log('disableRows mock passthrough', rows)
  return Promise.resolve({ code: 200, message: '操作成功' })
}

/**
 * 启用选中的行。
 * 当前仍是前端占位实现，后续可以替换成真实接口。
 * @param {Array} rows 选中的表格行
 */
export function enableRows(rows) {
  console.log('enableRows mock passthrough', rows)
  return Promise.resolve({ code: 200, message: '操作成功' })
}
