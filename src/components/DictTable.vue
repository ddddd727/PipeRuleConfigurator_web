<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router' // 1. 引入 useRoute
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirtyData } from '@/hooks/useDirtyData'

const props = defineProps({
  dictId: {
    type: String,
    required: true
  }
})

const route = useRoute() // 2. 获取当前路由实例
const { initSnapshot, isModified } = useDirtyData()

// 核心数据状态
const tableConfig = ref({ title: '', columns: [], list: [] }) 
const loading = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')
const selectedRows = ref([])
const dataSnapshot = ref(null)

// ... (mapUiType 和 toCamelCase 辅助函数保持不变) ...
const mapUiType = (backendUiType) => {
  if (!backendUiType) return 'string'
  const type = String(backendUiType).toLowerCase()
  switch (type) {
    case 'switch': return 'switch'
    case 'select': return 'select'
    case 'jsoninput': 
    case 'json': return 'json'
    case 'input': 
    default: return 'string'
  }
}

const toCamelCase = (str) => {
  if (!str) return str
  return str.charAt(0).toLowerCase() + str.slice(1)
}

// ... (搜索过滤逻辑保持不变) ...
const displayData = computed(() => {
  const rawData = tableConfig.value.list || [] 
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return rawData
  return rawData.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(keyword)
    )
  })
})

const getColumnFilters = (col) => {
  const rawData = tableConfig.value.list || []
  const values = rawData.map(item => item[col.prop])
  return [...new Set(values)]
    .filter(v => v !== null && v !== undefined && v !== '')
    .map(v => ({ text: v, value: v }))
}

const filterHandler = (value, row, column) => {
  return row[column.property] === value
}

// --- [核心修改] 获取数据并适配 ---
const fetchData = async () => {
  const dictType = props.dictId 
  if (!dictType) return
  
  loading.value = true
  try {
    const res = await axios.get(`/api/Dict/${dictType}`)
    const resData = res.data 
    const backendData = resData.data || resData
    
    if (resData.code === 200 || Array.isArray(backendData.rows)) {
      const rawRows = backendData.rows || [] 

      let useCamelCase = false
      if (rawRows.length > 0) {
        const firstRowKeys = Object.keys(rawRows[0])
        if (firstRowKeys.includes('id') || firstRowKeys.some(k => /^[a-z]/.test(k))) {
          useCamelCase = true
        }
      }

      const mappedColumns = (backendData.columns || []).map(col => {
        let finalProp = col.prop || col.DbField
        if (useCamelCase && finalProp) {
          finalProp = toCamelCase(finalProp)
        }

        return {
          ...col,
          prop: finalProp,
          label: col.Title || col.DisplayName || col.label || '未命名',
          type: mapUiType(col.uiType || col.UiType), 
          show: col.show !== undefined ? col.show : (col.IsHidden === true ? false : true),
          isReadOnly: col.isReadOnly !== undefined ? col.isReadOnly : col.IsReadOnly,
          required: col.required
        }
      })

      // 👇 [核心修复] 标题获取逻辑升级
      // 优先级：
      // 1. 后端返回的 DisplayName (如果后端做了配置)
      // 2. 路由元信息里的 meta.title (比如 "标准系列")
      // 3. dictId (英文备选)
      const pageTitle = backendData.DisplayName || backendData.displayName || route.meta.title || dictType

      tableConfig.value = {
        title: pageTitle, 
        columns: mappedColumns,
        list: rawRows
      }
      
      dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
      initSnapshot(tableConfig.value.list) 
      
      isEdit.value = false
      searchKeyword.value = ''
      selectedRows.value = []
    } else {
      ElMessage.error(resData.message || '获取数据失败')
    }
  } catch (error) {
    console.error('Fetch error:', error)
    ElMessage.error('网络错误: 无法连接到后端接口')
  } finally {
    loading.value = false
  }
}

watch(() => props.dictId, fetchData)
onMounted(fetchData)

// ... (后续的 toggleEdit, handleCancel, handleAddRow, handleBatchDelete, handleSave 等逻辑保持不变，直接复制即可) ...
// ... 为了节省篇幅，这里假设你保留了之前提供的方法 ...
// --- 编辑/取消 逻辑 ---
const toggleEdit = () => {
  if (isEdit.value) {
    handleCancel()
  } else {
    dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
    isEdit.value = true
  }
}

const handleCancel = () => {
  if (dataSnapshot.value) {
    tableConfig.value = JSON.parse(JSON.stringify(dataSnapshot.value))
    initSnapshot(tableConfig.value.list || [])
  }
  isEdit.value = false
  selectedRows.value = [] 
  ElMessage.info('已取消更改')
}

// --- 表格操作 ---
const handleSelectionChange = (val) => { selectedRows.value = val }

const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  const newRow = { _isNew: true }
  
  tableConfig.value.columns.forEach(col => {
    // 自动填充默认值
    if (col.isPrimaryKey) {
        newRow[col.prop] = -(Date.now()) // 临时负数ID
    } else if (col.type === 'switch') {
        newRow[col.prop] = true 
    } else {
        newRow[col.prop] = null 
    }
  })
  
  if (!tableConfig.value.list) tableConfig.value.list = []
  tableConfig.value.list.push(newRow)
  
  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    if(tableBody) tableBody.scrollTop = tableBody.scrollHeight
  }, 100)
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  ElMessageBox.confirm('确定要删除选中的行吗？', '提示', { type: 'warning' })
    .then(() => {
      tableConfig.value.list = tableConfig.value.list.filter(row => !selectedRows.value.includes(row))
      selectedRows.value = []
    }).catch(() => {})
}

// --- 保存逻辑 ---
const handleSave = async () => {
  const currentList = tableConfig.value.list || []
  const columns = tableConfig.value.columns || []

  // 1. 必填校验
  for (let i = 0; i < currentList.length; i++) {
    const row = currentList[i]
    for (const col of columns) {
      // 只有非只读、且标记为必填的字段才校验
      if (col.required && !col.isReadOnly && (row[col.prop] === null || row[col.prop] === '')) {
         ElMessage.warning(`第 ${i + 1} 行：[${col.label}] 不能为空`)
         return
      }
    }
  }

  loading.value = true
  try {
    // 构造 Payload：只发回 rows 和 columns (如果后端需要)
    const payload = {
      rows: currentList,
      columns: columns // 将适配后的 columns 发回去，或者发原始的，视后端需求而定
    }
    
    const res = await axios.post(`/api/Dict/${props.dictId}`, payload)
    
    if (res.status === 200 && res.data?.code === 200) {
      ElMessage.success('保存成功')
      currentList.forEach(row => delete row._isNew)
      dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
      initSnapshot(currentList)
      isEdit.value = false
      selectedRows.value = []
    } else {
      ElMessage.error(res.data?.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存请求失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="dict-table-container">
    <div class="table-header">
      <div class="title-area">
        <h3>{{ tableConfig.title || '数据列表' }}</h3>
        <el-tag v-if="isEdit" type="warning" effect="dark" class="ml-2">编辑模式</el-tag>
      </div>
      
      <div class="actions">
        <el-input v-model="searchKeyword" placeholder="搜索..." clearable style="width: 200px;" />
        
        <el-button v-if="!isEdit" type="primary" @click="toggleEdit">编辑</el-button>

        <template v-if="isEdit">
          <el-button type="primary" @click="handleAddRow">新增行</el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            批量删除 ({{ selectedRows.length }})
          </el-button>
          <el-button @click="toggleEdit">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </template>
      </div>
    </div>

    <el-table 
      :data="displayData" 
      border 
      stripe
      style="width: 100%; flex: 1;" 
      v-loading="loading"
      height="100%"
      :row-class-name="({ row }) => row._isNew ? 'new-row-highlight' : ''"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="isEdit" type="selection" width="50" align="center" fixed />
      <el-table-column type="index" label="#" width="50" align="center" fixed />

      <template v-for="(col, index) in tableConfig.columns" :key="col.prop + index">
        <el-table-column
          v-if="col.show !== false"
          :prop="col.prop"
          :label="col.label"
          :min-width="col.width || 150" 
          show-overflow-tooltip
          :fixed="col.isPrimaryKey ? 'left' : false"
        >
          <template #header>
            <span>
              <span v-if="col.required" style="color: red; margin-right: 4px;">*</span>
              {{ col.label }}
            </span>
          </template>

          <template #default="scope">
            <div v-if="isEdit" 
                 class="dirty-cell-wrapper"
                 :class="{ 'is-modified': isModified(scope.row, col.prop) }"
            >
              <template v-if="!col.isReadOnly">
                <el-switch
                  v-if="col.type === 'switch'"
                  v-model="scope.row[col.prop]"
                  inline-prompt
                  active-text="是"
                  inactive-text="否"
                />
                <el-input 
                  v-else 
                  v-model="scope.row[col.prop]" 
                  size="small" 
                />
              </template>
              
              <span v-else style="color: #909399; cursor: not-allowed;">
                 <el-tag v-if="col.type === 'switch'" type="info" size="small" effect="plain">
                    {{ scope.row[col.prop] ? '是' : '否' }}
                 </el-tag>
                 <span v-else>{{ scope.row[col.prop] }}</span>
              </span>

              <div v-if="!col.isReadOnly && isModified(scope.row, col.prop)" class="dirty-marker"></div>
            </div>
            
            <span v-else>
              <el-switch
                v-if="col.type === 'switch'"
                v-model="scope.row[col.prop]"
                disabled
                size="small"
                style="--el-switch-off-color: #dcdfe6;"
              />
              <span v-else>{{ scope.row[col.prop] }}</span>
            </span>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
.dict-table-container { height: 100%; display: flex; flex-direction: column; background: #fff; padding: 16px; border-radius: 4px; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; }
.title-area { display: flex; align-items: center; }
.title-area h3 { margin: 0; font-size: 18px; color: #303133; }
.ml-2 { margin-left: 8px; }
.actions { display: flex; align-items: center; gap: 12px; }
.dirty-cell-wrapper { position: relative; width: 100%; }
.dirty-marker { position: absolute; top: 0; right: 0; width: 0; height: 0; border-top: 6px solid #f56c6c; border-left: 6px solid transparent; }
:deep(.new-row-highlight) { background-color: #f0f9eb !important; }
</style>