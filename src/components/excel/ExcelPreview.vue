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
              :rowspan="cell.rowspan || 1"
              :style="getCellStyle(cell.style)"
              :class="['preview-cell', { 'empty-cell': cell.row === -1 }]"
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
  rowspan?: number
  style?: {
    bgColor?: string
    textAlign?: 'left' | 'center' | 'right' | 'general'
    fontWeight?: 'normal' | 'bold'
  }
  hidden?: boolean
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

  const data = rawData.value
  const { rowCount, columnCount } = data.grid || { rowCount: 0, columnCount: 0 }
  const cells = data.cells || []
  const mergedCells = data.mergedCells || []

  // 初始化二维数组
  const grid: (PreviewCellData | null)[][] = Array(rowCount)
    .fill(null)
    .map(() => Array(columnCount).fill(null))

  // 1. 处理合并单元格
  for (const merge of mergedCells) {
    const { startRow, endRow, startColumn, endColumn } = merge
    const rowspan = endRow - startRow + 1
    const colspan = endColumn - startColumn + 1

    // 标记被覆盖的区域为 hidden
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startColumn; c <= endColumn; c++) {
        if (r < rowCount && c < columnCount) {
          grid[r][c] = {
            row: r,
            col: c,
            value: null,
            hidden: true
          }
        }
      }
    }

    // 设置主单元格
    if (startRow < rowCount && startColumn < columnCount) {
      grid[startRow][startColumn] = {
        row: startRow,
        col: startColumn,
        value: merge.value,
        colspan,
        rowspan,
        style: merge.style,
        hidden: false
      }
    }
  }

  // 2. 填充普通单元格
  for (const cell of cells) {
    if (cell.row < rowCount && cell.column < columnCount) {
      // 只有当该位置未被合并单元格占用时才填充
      if (!grid[cell.row][cell.column]) {
        grid[cell.row][cell.column] = {
          row: cell.row,
          col: cell.column,
          value: cell.value,
          style: cell.style
        }
      }
    }
  }

  // 3. 生成渲染行，过滤掉 hidden 单元格
  return grid.map(row => {
    return row.map((cell, colIndex) => {
      if (cell) return cell
      // 空单元格占位
      return {
        row: -1,
        col: colIndex,
        value: '',
        style: undefined
      }
    }).filter(cell => !cell.hidden)
  })
})

const getCellStyle = (style?: PreviewCellData['style']) => {
  if (!style) return {}
  return {
    backgroundColor: style.bgColor || 'transparent',
    textAlign: style.textAlign === 'general' ? 'left' : (style.textAlign || 'left'),
    fontWeight: style.fontWeight || 'normal'
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get(`/api/template-preview/${props.templateId}`, {
      params: props.params
    })
    // 处理响应格式：{ code, message, data }
    if (response.data.code === 200) {
      rawData.value = response.data.data
      templateTitle.value = response.data.data?.title || ''
    } else {
      error.value = response.data.message || '加载失败'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  try {
    const response = await axios.post(
      `/api/template-preview/${props.templateId}/export`,
      props.params || {},
      { responseType: 'blob' }
    )
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const fileName = rawData.value?.title || props.templateId
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    emit('export')
  } catch (err: any) {
    alert('导出失败：' + (err.response?.data?.message || err.message || '未知错误'))
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
  min-width: 50px;
}

.preview-cell.empty-cell {
  background-color: #fafafa;
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