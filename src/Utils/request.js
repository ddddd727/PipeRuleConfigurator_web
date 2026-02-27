<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios' // ✅ 最原始的 axios，没有任何封装
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirtyData } from '@/hooks/useDirtyData'

const props = defineProps({
  dictId: {
    type: String,
    required: true
  }
})

const route = useRoute()
const { initSnapshot, isModified } = useDirtyData()

// --- 核心状态 ---
const tableConfig = ref({ title: '', columns: [], list: [] }) 
const loading = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')
const selectedRows = ref([])
const dataSnapshot = ref(null)
const optionsMap = ref({}) // 下拉框数据缓存

// --- 辅助函数 ---
const mapUiType = (backendUiType) => {
  if (!backendUiType) return 'string'
  const type = String(backendUiType).toLowerCase()
  switch (type) {
    case 'switch': return 'switch'
    case 'select': return 'select'
    case 'jsoninput': 
    case 'json': return 'json'
    default: return 'string'
  }
}

const toCamelCase = (str) => {
  if (!str) return str
  return str.charAt(0).toLowerCase() + str.slice(1)
}

// --- 1. 获取下拉框选项 ---
const fetchOptions = async (col) => {
  const ds = col.dataSource || col.DataSource
  if (col.type === 'select' && ds && ds.url) {
    try {
      // ✅ 手动处理 URL：如果不是 http 开头，默认补 /api/
      let url = ds.url
      if (!url.startsWith('http') && !url.startsWith('/api')) {
        url = `/api/${url.startsWith('/') ? url.slice(1) : url}`
      }
      
      // ✅ 原始 axios 请求
      const res = await axios.get(url)
      
      // ✅ 原始数据解包：axios 包了一层 data，后端可能又包了一层 data
      const responseData = res.data
      const list = Array.isArray(responseData) ? responseData : (responseData.data || [])
      
      optionsMap.value[col.prop] = list.map(item => ({
        label: item[ds.labelField || ds.LabelField || 'label'],
        value: item[ds.valueField || ds.ValueField || 'value']
      }))
    } catch (error) {
      console.warn(`加载 [${col.label}] 选项失败:`, error)
    }
  }
}

// --- 2. 获取表格数据 ---
const fetchData = async () => {
  const dictType = props.dictId 
  if (!dictType) return
  
  loading.value = true
  try {
    // ✅ 直接请求 /api/Dict/...
    const res = await axios.get(`/api/Dict/${dictType}`)
    
    // ✅ 解包数据
    const resData = res.data
    // 兼容后端返回结构：可能是 { code: 200, data: {...} } 也可能是直接 {...}
    const backendData = resData.data || resData
    
    if (backendData.rows || backendData.columns) {
      const rawRows = backendData.rows || [] 

      // 自动判断小驼峰
      let useCamelCase = false
      if (rawRows.length > 0) {
        const firstRowKeys = Object.keys(rawRows[0])
        if (firstRowKeys.includes('id') || firstRowKeys.some(k => /^[a-z]/.test(k))) {
          useCamelCase = true
        }
      }

      // 映射列配置
      const mappedColumns = (backendData.columns || []).map(col => {
        let finalProp = col.prop || col.DbField
        if (useCamelCase && finalProp) finalProp = toCamelCase(finalProp)

        const mappedCol = {
          ...col,
          prop: finalProp,
          label: col.Title || col.DisplayName || col.label || '未命名',
          type: mapUiType(col.uiType || col.UiType), 
          show: col.show !== undefined ? col.show : (col.IsHidden === true ? false : true),
          isReadOnly: col.isReadOnly !== undefined ? col.isReadOnly : col.IsReadOnly,
          required: col.required,
          dataSource: col.dataSource || col.DataSource 
        }

        // 如果是下拉框，去加载选项
        if (mappedCol.type === 'select') fetchOptions(mappedCol)

        return mappedCol
      })

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
      ElMessage.warning('未获取到有效数据')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

watch(() => props.dictId, fetchData)
onMounted(fetchData)

// --- 3. 编辑与交互逻辑 (保持原样) ---
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

const handleSelectionChange = (val) => { selectedRows.value = val }

const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  const newRow = { _isNew: true }
  
  tableConfig.value.columns.forEach(col => {
    if (col.isPrimaryKey) {
        newRow[col.prop] = 0 
    } else if (col.type === 'switch') {
        newRow[col.prop] = false 
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
    .then(async () => {
      try {
        const ids = selectedRows.value
          .filter(r => !r._isNew)
          .map(r => r.id || r.Id)
        
        // ✅ 原始 axios 删除
        for (const id of ids) {
          await axios.delete(`/api/Dict/${props.dictId}/${id}`)
        }
        
        tableConfig.value.list = tableConfig.value.list.filter(row => !selectedRows.value.includes(row))
        selectedRows.value = []
        ElMessage.success('删除成功')
      } catch (e) {
        ElMessage.error(e.response?.data?.message || '删除失败')
      }
    }).catch(() => {})
}

// --- 4. 保存逻辑 (适配后端) ---
const handleSave = async () => {
  const currentList = tableConfig.value.list || []
  const columns = tableConfig.value.columns || []

  for (let i = 0; i < currentList.length; i++) {
    const row = currentList[i]
    for (const col of columns) {
      if (col.required && !col.isReadOnly && (row[col.prop] === null || row[col.prop] === '')) {
         ElMessage.warning(`第 ${i + 1} 行：[${col.label}] 不能为空`)
         return
      }
    }
  }

  loading.value = true
  try {
    const promises = []
    
    for (const row of currentList) {
      const { _isNew, ...submitData } = row
      
      if (_isNew) {
        // ✅ 新增
        promises.push(axios.post(`/api/Dict/${props.dictId}`, submitData))
      } else if (isModified(row)) {
        // ✅ 修改
        const id = row.id || row.Id
        promises.push(axios.put(`/api/Dict/${props.dictId}/${id}`, submitData))
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises)
      ElMessage.success('保存成功')
      await fetchData()
    } else {
      ElMessage.info('没有检测到修改')
      isEdit.value = false
    }

  } catch (error) {
    console.error(error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

const displayData = computed(() => {
  const rawData = tableConfig.value.list || [] 
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return rawData
  return rawData.filter(row => 
    Object.values(row).some(val => String(val).toLowerCase().includes(keyword))
  )
})
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
          <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
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
                <el-select 
                  v-if="col.type === 'select'" 
                  v-model="scope.row[col.prop]" 
                  placeholder="请选择" 
                  size="small"
                  filterable
                >
                  <el-option
                    v-for="opt in optionsMap[col.prop]"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>

                <el-switch
                  v-else-if="col.type === 'switch'"
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
                 <span v-else-if="col.type === 'select' && optionsMap[col.prop]">
                    {{ optionsMap[col.prop].find(o => o.value == scope.row[col.prop])?.label || scope.row[col.prop] }}
                 </span>
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
              <span v-else-if="col.type === 'select' && optionsMap[col.prop]">
                 {{ optionsMap[col.prop].find(o => o.value == scope.row[col.prop])?.label || scope.row[col.prop] }}
              </span>
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