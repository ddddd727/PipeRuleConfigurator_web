import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'

/**
 * 脏数据检测 Hook (修复版)
 * 1. 支持 row.id, row.Id, row.ID 多种主键格式
 * 2. 支持 isModified(row) 检测整行是否变化
 */
export function useDirtyData() {
  // 存储原始数据的 Map <id, rowData>
  const originalDataMap = ref(new Map())

  // 辅助函数：智能获取 ID (兼容后端各种大小写返回)
  const getId = (row) => {
    if (!row) return null
    return row.id || row.Id || row.ID
  }

  // 1. 初始化快照 (在获取数据成功、或保存成功后调用)
  const initSnapshot = (dataList) => {
    originalDataMap.value.clear()
    if (!dataList || !Array.isArray(dataList)) return

    dataList.forEach(row => {
      const id = getId(row)
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

    const id = getId(row)
    const originalRow = originalDataMap.value.get(id)

    // 如果找不到原始数据（可能是快照没初始化好），视为未修改，防止误操作
    if (!originalRow) return false

    // === 场景 A: 检查指定单元格 ===
    if (prop) {
      return compareValues(originalRow[prop], row[prop])
    }

    // === 场景 B: 检查整行 (保存时调用) ===
    // 遍历原始数据的所有 Key，看当前行是否有变化
    const keys = Object.keys(originalRow)
    return keys.some(key => {
      // 忽略前端内部字段 (如下划线开头的)
      if (key.startsWith('_') || key === 'children') return false
      return compareValues(originalRow[key], row[key])
    })
  }

  // 辅助对比函数
  const compareValues = (oldVal, newVal) => {
    // 统一转字符串比对，避免 100 和 "100" 被算作修改
    // 处理 null/undefined 转空字符串
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