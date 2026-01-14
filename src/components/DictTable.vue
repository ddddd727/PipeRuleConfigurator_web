<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirtyData } from '@/hooks/useDirtyData'
// 移除图标引入，保持纯文字按钮

const props = defineProps({
  dictId: {
    type: String,
    required: true
  }
})

const { initSnapshot, isModified } = useDirtyData()

// 核心数据状态
const tableConfig = ref({ title: '', columns: [], list: [] }) 
const loading = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')
const selectedRows = ref([])

// [新增] 数据快照，用于取消时回滚（包含列定义和列表数据）
const dataSnapshot = ref(null)

// --- 新增列相关状态 ---
const addColDialogVisible = ref(false)
const newColForm = ref({
  label: '',
  prop: '',
  type: 'string'
})

// --- 搜索过滤 ---
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
  if (col.options) {
    return col.options.map(opt => ({ text: opt, value: opt }))
  }
  const rawData = tableConfig.value.list || []
  const values = rawData.map(item => item[col.prop])
  return [...new Set(values)]
    .filter(v => v !== null && v !== undefined && v !== '')
    .map(v => ({ text: v, value: v }))
}

const filterHandler = (value, row, column) => {
  return row[column.property] === value
}

// --- 获取数据 ---
const fetchData = async () => {
  const dictType = props.dictId 
  if (!dictType) return
  
  loading.value = true
  try {
    const res = await axios.get(`/api/dict/${dictType}`)
    const resData = res.data 
    if (resData.code === 200) {
      tableConfig.value = resData.data
      
      // [关键] 初始化时保存一份快照
      dataSnapshot.value = JSON.parse(JSON.stringify(resData.data))
      
      initSnapshot(tableConfig.value.list || []) 
      isEdit.value = false
      searchKeyword.value = ''
      selectedRows.value = []
    } else {
      ElMessage.error(resData.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('Fetch error:', error)
    ElMessage.error('网络错误')
  } finally {
    loading.value = false
  }
}

watch(() => props.dictId, fetchData)
onMounted(fetchData)

// --- 编辑/取消 逻辑 ---
const toggleEdit = () => {
  if (isEdit.value) {
    // 当前是编辑模式，点击执行“取消” -> 回滚数据
    handleCancel()
  } else {
    // 当前是查看模式，点击执行“进入编辑”
    // 进入时再次更新快照（确保基于最新数据编辑）
    dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
    isEdit.value = true
  }
}

// [关键] 取消回滚方法
const handleCancel = () => {
  if (dataSnapshot.value) {
    // 1. 整体回滚（包含 columns 和 list）
    tableConfig.value = JSON.parse(JSON.stringify(dataSnapshot.value))
    // 2. 重置脏数据检测状态
    initSnapshot(tableConfig.value.list || [])
  }
  
  // 3. 退出编辑状态并清空选择
  isEdit.value = false
  selectedRows.value = [] 
  ElMessage.info('已取消更改')
}

// --- 表格多选处理 ---
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// --- 新增行逻辑 ---
const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  const newRow = { id: Date.now(), _isNew: true }
  
  // 初始化所有列字段
  tableConfig.value.columns.forEach(col => {
    if (col.type === 'switch') {
      newRow[col.prop] = true 
    } else {
      newRow[col.prop] = ''
    }
  })
  
  if (!tableConfig.value.list) tableConfig.value.list = []
  tableConfig.value.list.push(newRow)
  
  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    if(tableBody) tableBody.scrollTop = tableBody.scrollHeight
  }, 100)
}

// --- 新增列逻辑 ---
const openAddColumn = () => {
  newColForm.value = { label: '', prop: '', type: 'string' }
  addColDialogVisible.value = true
}

const confirmAddColumn = () => {
  if (!newColForm.value.label || !newColForm.value.prop) {
    ElMessage.warning('请填写完整的列信息')
    return
  }
  
  // 查重
  if (tableConfig.value.columns.some(col => col.prop === newColForm.value.prop)) {
    ElMessage.warning('字段 Key 已存在，请更换')
    return
  }

  const newColumnConfig = {
    label: newColForm.value.label,
    prop: newColForm.value.prop,
    type: newColForm.value.type,
    editable: true,
    width: 150
  }
  
  // 1. 更新表头
  tableConfig.value.columns.push(newColumnConfig)

  // 2. 更新现有数据，补全字段（保证响应式）
  if (tableConfig.value.list) {
    tableConfig.value.list.forEach(row => {
      if (row[newColumnConfig.prop] === undefined) {
        row[newColumnConfig.prop] = newColumnConfig.type === 'switch' ? false : ''
      }
    })
  }

  ElMessage.success('列添加成功')
  addColDialogVisible.value = false
}

// --- 批量删除逻辑 ---
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 行数据吗？`, 
    '批量删除', 
    { type: 'warning', confirmButtonText: '确定删除', confirmButtonClass: 'el-button--danger' }
  ).then(() => {
    tableConfig.value.list = tableConfig.value.list.filter(row => !selectedRows.value.includes(row))
    selectedRows.value = []
    ElMessage.success('已移除选中行 (需保存生效)')
  }).catch(() => {})
}

// --- 辅助验证函数 ---
const isEmpty = (val) => {
  return val === null || val === undefined || val === ''
}

// --- 保存逻辑 ---
const handleSave = async () => {
  const currentList = tableConfig.value.list || []
  const columns = tableConfig.value.columns || []

  // 1. 校验
  for (let i = 0; i < currentList.length; i++) {
    const row = currentList[i]
    for (const col of columns) {
      const val = row[col.prop]
      const label = col.label

      if (col.required && isEmpty(val) && col.type !== 'switch') {
         ElMessage.warning(`第 ${i + 1} 行：[${label}] 不能为空`)
         return
      }

      if (col.rules && Array.isArray(col.rules)) {
        for (const rule of col.rules) {
          if (rule.required && isEmpty(val)) {
             ElMessage.warning(`第 ${i + 1} 行：${rule.message || label + ' 不能为空'}`)
             return 
          }
          if (rule.max && String(val).length > rule.max) {
             ElMessage.warning(`第 ${i + 1} 行：[${label}] ${rule.message || '长度超限'}`)
             return
          }
          if (rule.pattern && !isEmpty(val)) {
            try {
              const regex = new RegExp(rule.pattern)
              if (!regex.test(String(val))) {
                ElMessage.warning(`第 ${i + 1} 行：[${label}] ${rule.message || '格式不正确'}`)
                return
              }
            } catch (e) {
              console.warn('正则解析失败:', rule.pattern)
            }
          }
        }
      }
    }
  }

  // 2. 发送请求
  loading.value = true
  try {
    const res = await axios.post(`/api/dict/${props.dictId}`, {
      list: currentList,
      columns: columns // 将最新的列结构也传给后端
    })
    
    if (res.status === 200 && (res.data?.code === 200 || res.data?.code === undefined)) {
      ElMessage.success('保存成功')
      
      currentList.forEach(row => delete row._isNew)
      
      // 保存成功后更新快照
      dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
      
      initSnapshot(currentList)
      isEdit.value = false
      selectedRows.value = []
    } else {
      ElMessage.error(res.data?.msg || '保存失败')
    }
  } catch (error) {
    console.error('Save error:', error)
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
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索..." 
          clearable 
          style="width: 200px;" 
        />
        
        <el-button 
          v-if="!isEdit"
          type="primary" 
          @click="toggleEdit"
        >
          编辑
        </el-button>

        <template v-if="isEdit">
          <el-button 
            type="primary"
            @click="openAddColumn"
          >
            添加列
          </el-button>
          
          <el-button 
            type="primary" 
            @click="handleAddRow"
          >
            新增行
          </el-button>

          <el-button 
            type="danger" 
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRows.length }})
          </el-button>

          <el-button 
            @click="toggleEdit"
          >
            取消
          </el-button>

          <el-button 
            type="primary" 
            @click="handleSave"
          >
            保存
          </el-button>
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

      <el-table-column
        v-for="(col, index) in tableConfig.columns"
        :key="col.prop + index"
        :prop="col.prop"
        :label="col.label"
        :min-width="col.width || 150" 
        show-overflow-tooltip
        :filters="col.filterable ? getColumnFilters(col) : null"
        :filter-method="col.filterable ? filterHandler : null"
      >
        <template #header>
          <span>
            <span v-if="col.required" style="color: red; margin-right: 4px;">*</span>
            {{ col.label }}
          </span>
        </template>

        <template #default="scope">
          <div v-if="isEdit && col.editable !== false" 
               class="dirty-cell-wrapper"
               :class="{ 'is-modified': isModified(scope.row, col.prop) }"
          >
            <el-select 
              v-if="col.type === 'select'" 
              v-model="scope.row[col.prop]" 
              size="small"
            >
              <el-option v-for="opt in col.options" :key="opt" :label="opt" :value="opt" />
            </el-select>

            <el-switch
              v-else-if="col.type === 'switch'"
              v-model="scope.row[col.prop]"
              inline-prompt
              active-text="启"
              inactive-text="停"
            />

            <el-input v-else v-model="scope.row[col.prop]" size="small" />

            <div v-if="isModified(scope.row, col.prop)" class="dirty-marker"></div>
          </div>
          
          <span v-else>
            <el-tag v-if="col.type === 'switch'" :type="scope.row[col.prop] ? 'success' : 'info'">
              {{ scope.row[col.prop] ? '启用' : '停用' }}
            </el-tag>
            <span v-else>{{ scope.row[col.prop] }}</span>
          </span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="addColDialogVisible"
      title="添加新列"
      width="400px"
      append-to-body
    >
      <el-form label-position="top">
        <el-form-item label="列显示名 (Label)">
          <el-input v-model="newColForm.label" placeholder="例如：备注" />
        </el-form-item>
        <el-form-item label="字段标识 (Key)">
          <el-input v-model="newColForm.prop" placeholder="例如：remark (需唯一)" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-radio-group v-model="newColForm.type">
            <el-radio-button label="string">文本</el-radio-button>
            <el-radio-button label="select">下拉框</el-radio-button>
            <el-radio-button label="switch">开关</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addColDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddColumn">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dict-table-container { 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  background: #fff; 
  padding: 16px; 
  border-radius: 4px; 
}

.table-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 16px; 
  flex-shrink: 0; 
}

.title-area { 
  display: flex; 
  align-items: center; 
}

.title-area h3 { 
  margin: 0; 
  font-size: 18px; 
  color: #303133; 
}

.ml-2 { 
  margin-left: 8px; 
}

/* 右侧工具栏布局：统一间距 */
.actions { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.dirty-cell-wrapper { 
  position: relative; 
  width: 100%; 
}

.dirty-marker { 
  position: absolute; 
  top: 0; 
  right: 0; 
  width: 0; 
  height: 0; 
  border-top: 6px solid #f56c6c; 
  border-left: 6px solid transparent; 
}

:deep(.new-row-highlight) { 
  background-color: #f0f9eb !important; 
}
</style>