import { ref } from 'vue'
import { cloneDeep, isEqualWith } from 'lodash-es'

/**
 * 脏数据检测 Hook (修复版)
 * 1. 支持 row.id, row.Id, row.ID 多种主键格式
 * 2. 支持 isModified(row) 检测整行是否变化
 */
export function useDirtyData() {
  // 存储原始数据的 Map <id, rowData>
  const originalDataMap = ref(new Map())

  // 辅助函数：智能获取 ID (兼容后端各种大小写返回)
  const getIdKey = (row) => {
    if (!row) return null

    // 常见命名
    const direct = row.id ?? row.Id ?? row.ID
    if (direct !== undefined && direct !== null && direct !== '') return String(direct)

    // 兜底：按 key 名称大小写不敏感找 "id"
    const idProp = Object.keys(row).find(k => k.toLowerCase() === 'id')
    if (idProp) {
      const val = row[idProp]
      if (val !== undefined && val !== null && val !== '') return String(val)
    }

    return null
  }

  // 1. 初始化快照 (在获取数据成功、或保存成功后调用)
  const initSnapshot = (dataList) => {
    originalDataMap.value.clear()
    if (!dataList || !Array.isArray(dataList)) return

    dataList.forEach(row => {
      const id = getIdKey(row)
      // 只有已有 ID 的行才建立快照，新增行(无ID或临时ID)不需要
      if (id !== undefined && id !== null && !row._isNew) {
        originalDataMap.value.set(id, cloneDeep(row))
      }
    })
    console.log('📸 数据快照已建立，条数:', originalDataMap.value.size)
  }

  // 2. 判断数据是否被修改
  // 用法 A: isModified(row, 'propName') -> 检查单个单元格 (用于红点显示)
  // 用法 B: isModified(row) -> 检查整行是否有任意字段变化 (用于保存判断)
  const isModified = (row, prop) => {
    // 新增行不视为“脏数据”（它直接走新增接口，不需要比对）
    if (!row || row._isNew) return false

    const id = getIdKey(row)
    const originalRow = originalDataMap.value.get(id)

    // 如果找不到原始数据（可能是快照没初始化好），视为未修改，防止误操作
    if (!originalRow) return false

    // === 场景 A: 检查指定单元格 ===
    if (prop) {
      return compareValues(originalRow[prop], row[prop])
    }

    // === 场景 B: 检查整行 (保存时调用) ===
    // 遍历所有可能的 Key，包括原始数据和当前行的 Key
    const allKeys = new Set([...Object.keys(originalRow), ...Object.keys(row)])
    return Array.from(allKeys).some(key => {
      // 忽略前端内部字段 (如下划线开头的)
      if (key.startsWith('_') || key === 'children') return false
      return compareValues(originalRow[key], row[key])
    })
  }

  // 辅助对比函数
  const compareValues = (oldVal, newVal) => {
    // 对象/数组需要深比较，否则像 JsonData 这类嵌套结构的修改会被漏检
    const isObj = (v) => v !== null && typeof v === 'object'

    // null/undefined 视为同类空值
    if (oldVal == null && newVal == null) return false

    // 对象/数组：深比较；对原子值：按字符串比较，避免 100 vs "100" 被误判为修改
    if (isObj(oldVal) || isObj(newVal)) {
      const equal = isEqualWith(oldVal, newVal, (a, b) => {
        const aIsObj = isObj(a)
        const bIsObj = isObj(b)
        if (!aIsObj && !bIsObj) {
          const s1 = (a === null || a === undefined) ? '' : String(a)
          const s2 = (b === null || b === undefined) ? '' : String(b)
          return s1 === s2
        }
        // 其它情况交给 lodash 继续递归
        return undefined
      })
      return !equal
    }

    const s1 = (oldVal === null || oldVal === undefined) ? '' : String(oldVal)
    const s2 = (newVal === null || newVal === undefined) ? '' : String(newVal)
    return s1 !== s2
  }

  return {
    originalDataMap,
    initSnapshot,
    isModified
  }
}