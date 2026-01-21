<!-- src/components/ExcelPreview.vue -->
<template>
  <div class="excel-preview-container">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <span class="template-title">{{ templateTitle || props.templateId }}</span>
      <div class="actions">
        <button class="btn btn-secondary" @click="refreshData">刷新</button>
        <button class="btn btn-primary" @click="handleExport">导出 Excel</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="refreshData">重试</button>
    </div>

    <!-- 预览表格 -->
    <div v-else class="table-wrapper" ref="tableWrapper">
      <table class="preview-table">
        <tbody>
          <tr v-for="(row, rowIndex) in renderedRows" :key="rowIndex">
            <td
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              :colspan="cell.colspan || 1"
              :style="getCellStyle(cell.style)"
              class="preview-cell"
            >
              {{ cell.value ?? '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

interface PreviewCellData {
  row: number
  col: number
  value: string | null
  colspan?: number
  style?: {
    bgColor?: string
    textAlign?: 'left' | 'center' | 'right'
    fontWeight?: 'normal' | 'bold'
  }
}

const props = defineProps<{
  templateId: string
  params?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'export'): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const rawData = ref<any>(null)
const templateTitle = ref<string>('')

// 将扁平 cells 转为二维行数组（跳过合并覆盖区域）
const renderedRows = computed(() => {
  if (!rawData.value) return []

  const { rowCount, colCount, cells, mergedCells } = rawData.value.grid
    ? rawData.value
    : { rowCount: 0, colCount: 0, cells: [], mergedCells: [] }

  // 初始化二维数组
  const grid: (PreviewCellData | null)[][] = Array(rowCount)
    .fill(null)
    .map(() => Array(colCount).fill(null))

  // 标记被合并覆盖的单元格
  const skip = new Set<string>()
  for (const merge of mergedCells || []) {
    for (let r = merge.startRow; r <= merge.endRow; r++) {
      for (let c = merge.startCol; c <= merge.endCol; c++) {
        if (!(r === merge.startRow && c === merge.startCol)) {
          skip.add(`${r},${c}`)
        }
      }
    }
    // 主单元格
    grid[merge.startRow][merge.startCol] = {
      row: merge.startRow,
      col: merge.startCol,
      value: merge.value,
      colspan: merge.endCol - merge.startCol + 1,
      style: merge.style
    }
  }

  // 填充普通单元格
  for (const cell of cells || []) {
    const key = `${cell.row},${cell.col}`
    if (!skip.has(key) && !grid[cell.row]?.[cell.col]) {
      grid[cell.row][cell.col] = {
        row: cell.row,
        col: cell.col,
        value: cell.value,
        style: cell.style
      }
    }
  }

  // 转为行渲染结构
  return grid.map(row => row.filter(c => c !== null))
})

const getCellStyle = (style?: PreviewCellData['style']) => {
  if (!style) return {}
  return {
    backgroundColor: style.bgColor || 'transparent',
    textAlign: style.textAlign || 'left',
    fontWeight: style.fontWeight || 'normal'
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get(`/api/v1/template-previews/${props.templateId}`, {
      params: props.params
    })
    rawData.value = response.data
    templateTitle.value = response.data.title || ''
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  try {
    const response = await axios.post(
      `/api/v1/template-previews/${props.templateId}/export`,
      props.params || {},
      { responseType: 'blob' }
    )
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${props.templateId}_${new Date().toISOString().slice(0, 10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    emit('export')
  } catch (err: any) {
    alert('导出失败：' + (err.response?.data?.error?.message || '未知错误'))
  }
}

const refreshData = () => fetchData()

// 初始加载 & 参数变化时重新加载
onMounted(() => fetchData())
watch(() => props.params, () => fetchData(), { deep: true })
</script>

<style scoped>
.excel-preview-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: white;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
  gap: 16px;
  flex-wrap: wrap;
}
.template-title {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  flex-shrink: 0;
}
.actions { 
  display: flex; 
  gap: 8px;
  flex-wrap: wrap;
}
.btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}
.btn-secondary {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
}
.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  min-height: 300px;
}
.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: auto;
}
.preview-cell {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  white-space: normal;
  word-break: break-word;
  vertical-align: middle;
}
.loading, .error {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.error button {
  margin-top: 8px;
  padding: 4px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>