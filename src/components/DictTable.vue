<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirtyData } from '@/hooks/useDirtyData'

const props = defineProps({
  dictId: {
    type: String,
    required: true
  }
})

const { initSnapshot, isModified } = useDirtyData()

const tableConfig = ref({ title: '', columns: [], data: [] })
const loading = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')

// --- 搜索过滤 ---
const displayData = computed(() => {
  const rawData = tableConfig.value.data || []
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return rawData
  return rawData.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(keyword)
    )
  })
})

const getColumnFilters = (prop) => {
  const rawData = tableConfig.value.data || []
  const values = rawData.map(item => item[prop])
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
    if (res.data.code === 200) {
      tableConfig.value = res.data.data
      initSnapshot(tableConfig.value.data)
      isEdit.value = false
      searchKeyword.value = ''
    } else {
      ElMessage.error(res.data.msg || '获取数据失败')
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

// --- 编辑逻辑 ---
const toggleEdit = () => {
  if (isEdit.value) {
    isEdit.value = false
  } else {
    isEdit.value = true
  }
}

const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  const newRow = { id: Date.now(), _isNew: true }
  tableConfig.value.columns.forEach(col => newRow[col.prop] = '')
  tableConfig.value.data.push(newRow)
  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    if(tableBody) tableBody.scrollTop = tableBody.scrollHeight
  }, 100)
}

const handleAddColumn = async () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  try {
    const { value } = await ElMessageBox.prompt('请输入新列名', '新增列', { inputPattern: /\S/ })
    const newProp = 'col_' + Date.now()
    tableConfig.value.columns.push({ prop: newProp, label: value, width: 150, filterable: true })
    tableConfig.value.data.forEach(row => row[newProp] = '')
  } catch(e) {}
}

const handleSave = () => {
  loading.value = true
  setTimeout(() => {
    console.log(`提交 ${props.dictId} 数据:`, JSON.stringify(tableConfig.value.data))
    tableConfig.value.data.forEach(row => delete row._isNew)
    initSnapshot(tableConfig.value.data)
    loading.value = false
    isEdit.value = false
    ElMessage.success('保存成功')
  }, 600)
}

const handleDeleteRow = (row) => {
  ElMessageBox.confirm('确定删除该行吗？', '提示', { type: 'warning' }).then(() => {
    const index = tableConfig.value.data.indexOf(row)
    if (index > -1) {
      tableConfig.value.data.splice(index, 1)
    }
  }).catch(() => {})
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
          placeholder="搜索当前页..." 
          prefix-icon="Search" 
          clearable
          style="width: 200px; margin-right: 12px;" 
        />
        <el-button-group>
          <el-button :type="isEdit ? 'info' : 'primary'" @click="toggleEdit">
            {{ isEdit ? '取消' : '编辑' }}
          </el-button>
          <el-button type="success" :disabled="!isEdit" icon="Plus" @click="handleAddRow">行</el-button>
          <el-button type="warning" :disabled="!isEdit" icon="Menu" @click="handleAddColumn">列</el-button>
          <el-button type="primary" :disabled="!isEdit" icon="Check" @click="handleSave">保存</el-button>
        </el-button-group>
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
    >
      <el-table-column type="index" label="#" width="50" align="center" fixed />

      <el-table-column
        v-for="(col, index) in tableConfig.columns"
        :key="col.prop + index"
        :prop="col.prop"
        :label="col.label"
        :min-width="col.width || 150" 
        show-overflow-tooltip
        :filters="col.filterable ? getColumnFilters(col.prop) : null"
        :filter-method="col.filterable ? filterHandler : null"
      >
        <template #default="scope">
          <div v-if="isEdit && col.prop !== 'id'" 
               class="dirty-cell-wrapper"
               :class="{ 'is-modified': isModified(scope.row, col.prop) }"
          >
            <el-input v-model="scope.row[col.prop]" size="small" />
            <div v-if="isModified(scope.row, col.prop)" class="dirty-marker"></div>
          </div>
          <span v-else>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="isEdit" label="操作" width="80" fixed="right" align="center">
        <template #default="scope">
          <el-button type="danger" link icon="Delete" @click="handleDeleteRow(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
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

.title-area { display: flex; align-items: center; }
.title-area h3 { margin: 0; font-size: 18px; color: #303133; }
.ml-2 { margin-left: 8px; }

.dirty-cell-wrapper { position: relative; }
.dirty-marker {
  position: absolute; top: 0; right: 0;
  width: 0; height: 0;
  border-top: 6px solid #f56c6c; border-left: 6px solid transparent;
}
:deep(.new-row-highlight) { background-color: #f0f9eb !important; }
</style>