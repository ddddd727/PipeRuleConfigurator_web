import { ref } from 'vue'
import { cloneDeep } from 'lodash-es'

/**
 * 脏数据检测 Hook
 * @returns { initSnapshot, isModified, clearSnapshot }
 */
export function useDirtyData() {
  // 存储原始数据的 Map <id, rowData>
  const originalDataMap = ref(new Map())

  // 1. 初始化快照 (在获取数据成功、或保存成功后调用)
  const initSnapshot = (dataList) => {
    originalDataMap.value.clear()
    dataList.forEach(row => {
      // 只有已有 ID 的行才建立快照，新增行(无ID或临时ID)不需要
      if (row.id && !row._isNew) {
        originalDataMap.value.set(row.id, cloneDeep(row))
      }
    })
  }

  // 2. 判断某个单元格是否被修改
  const isModified = (row, prop) => {
    // 新增行不视为“修改”，而是整行高亮，所以这里返回 false
    if (row._isNew) return false

    const originalRow = originalDataMap.value.get(row.id)
    // 如果找不到原始数据（极端情况），视为未修改
    if (!originalRow) return false

    // 获取新旧值，处理 null/undefined 转空字符串，防止误报
    const oldVal = originalRow[prop] ?? ''
    const newVal = row[prop] ?? ''

    // 统一转字符串比对 (避免 100 和 "100" 被算作修改)
    return String(oldVal) !== String(newVal)
  }

  return {
    originalDataMap,
    initSnapshot,
    isModified
  }
}