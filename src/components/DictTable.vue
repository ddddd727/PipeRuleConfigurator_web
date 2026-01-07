<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
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

// 【修改点 1】初始化改为 list
const tableConfig = ref({ title: '', columns: [], list: [] }) 
const loading = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')

// --- 搜索过滤 ---
const displayData = computed(() => {
  // 【修改点 2】从 list 获取数据
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
  // 【修改点 3】从 list 获取筛选源
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
    // Apifox 返回结构通常是 { code: 200, data: { columns: [], list: [] } }
    const resData = res.data 
    if (resData.code === 200) {
      tableConfig.value = resData.data
      // 【修改点 4】初始化快照时使用 list
      initSnapshot(tableConfig.value.list || []) 
      isEdit.value = false
      searchKeyword.value = ''
    } else {
      ElMessage.error(resData.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('Fetch error:', error)
    ElMessage.error('网络错误，请检查 Apifox 代理配置')
  } finally {
    loading.value = false
  }
}

watch(() => props.dictId, fetchData)
onMounted(fetchData)

// --- 编辑逻辑 ---
const toggleEdit = () => {
  isEdit.value = !isEdit.value
}

const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  const newRow = { id: Date.now(), _isNew: true }
  tableConfig.value.columns.forEach(col => newRow[col.prop] = '')
  
  // 【修改点 5】推送到 list
  if (!tableConfig.value.list) tableConfig.value.list = []
  tableConfig.value.list.push(newRow)
  
  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    if(tableBody) tableBody.scrollTop = tableBody.scrollHeight
  }, 100)
}

const handleSave = () => {
  loading.value = true
  setTimeout(() => {
    // 【修改点 6】保存 list
    console.log(`提交 ${props.dictId} 数据:`, JSON.stringify(tableConfig.value.list))
    if (tableConfig.value.list) {
      tableConfig.value.list.forEach(row => delete row._isNew)
      initSnapshot(tableConfig.value.list)
    }
    loading.value = false
    isEdit.value = false
    ElMessage.success('保存成功 (已打印到控制台)')
  }, 600)
}

const handleDeleteRow = (row) => {
  ElMessageBox.confirm('确定删除该行吗？', '提示', { type: 'warning' }).then(() => {
    // 【修改点 7】从 list 删除
    const index = tableConfig.value.list.indexOf(row)
    if (index > -1) {
      tableConfig.value.list.splice(index, 1)
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
        <el-input v-model="searchKeyword" placeholder="搜索..." prefix-icon="Search" clearable style="width: 200px; margin-right: 12px;" />
        <el-button-group>
          <el-button :type="isEdit ? 'info' : 'primary'" @click="toggleEdit">{{ isEdit ? '取消' : '编辑' }}</el-button>
          <el-button type="success" :disabled="!isEdit" icon="Plus" @click="handleAddRow">行</el-button>
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
              placeholder="请选择"
            >
              <el-option v-for="opt in col.options" :key="opt" :label="opt" :value="opt" />
            </el-select>

            <el-input v-else v-model="scope.row[col.prop]" size="small" />

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
.dict-table-container { height: 100%; display: flex; flex-direction: column; background: #fff; padding: 16px; border-radius: 4px; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; }
.title-area { display: flex; align-items: center; }
.title-area h3 { margin: 0; font-size: 18px; color: #303133; }
.ml-2 { margin-left: 8px; }
.dirty-cell-wrapper { position: relative; width: 100%; }
.dirty-marker { position: absolute; top: 0; right: 0; width: 0; height: 0; border-top: 6px solid #f56c6c; border-left: 6px solid transparent; }
:deep(.new-row-highlight) { background-color: #f0f9eb !important; }
</style>