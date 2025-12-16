<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirtyData } from '@/hooks/useDirtyData' // 引入脏数据检测 Hook

const route = useRoute()
const { initSnapshot, isModified } = useDirtyData()

// 表格配置
const tableConfig = ref({ title: '', columns: [], data: [] })
const loading = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('') // 搜索关键词

// --- 核心逻辑：数据处理 ---

// 1. 计算显示的数据：先过滤搜索关键词，再传给表格显示
const displayData = computed(() => {
  const rawData = tableConfig.value.data || []
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) return rawData

  // 全字段模糊搜索
  return rawData.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(keyword)
    )
  })
})

// 2. 动态生成列筛选选项 (自动去重)
const getColumnFilters = (prop) => {
  const rawData = tableConfig.value.data || []
  const values = rawData.map(item => item[prop])
  return [...new Set(values)]
    .filter(v => v !== null && v !== undefined && v !== '')
    .map(v => ({ text: v, value: v }))
}

// 3. 列筛选回调
const filterHandler = (value, row, column) => {
  const property = column['property']
  return row[property] === value
}

// --- 数据获取 ---
const fetchData = async () => {
  const dictType = route.params.id 
  if (!dictType) return

  loading.value = true
  try {
    const res = await axios.get(`/api/dict/${dictType}`)
    if (res.data.code === 200) {
      tableConfig.value = res.data.data
      
      // 数据加载后，初始化脏数据快照
      initSnapshot(tableConfig.value.data)
      
      isEdit.value = false
      searchKeyword.value = '' // 切换页面重置搜索
    }
  } catch (error) {
    console.error('Fetch error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
watch(() => route.params.id, fetchData)

// --- 编辑与交互逻辑 ---

const toggleEdit = () => isEdit.value = !isEdit.value

// 新增行
const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  
  const newRow = { id: Date.now(), _isNew: true } // 标记新行
  // 补全字段
  tableConfig.value.columns.forEach(col => newRow[col.prop] = '')
  
  tableConfig.value.data.push(newRow)
  
  // 自动滚动到底部
  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    if(tableBody) tableBody.scrollTop = tableBody.scrollHeight
  }, 100)
}

// 新增列
const handleAddColumn = async () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  try {
    const { value } = await ElMessageBox.prompt('请输入新列名', '新增列', { inputPattern: /\S/ })
    const newProp = 'col_' + Date.now()
    tableConfig.value.columns.push({ prop: newProp, label: value, width: 150, filterable: true }) // 新增列也可以开启筛选
    tableConfig.value.data.forEach(row => row[newProp] = '')
  } catch(e) {}
}

// 保存
const handleSave = () => {
  loading.value = true
  setTimeout(() => {
    console.log('提交数据:', JSON.stringify(tableConfig.value.data))
    
    // 清除新行标记，更新快照
    tableConfig.value.data.forEach(row => delete row._isNew)
    initSnapshot(tableConfig.value.data)
    
    loading.value = false
    isEdit.value = false
    ElMessage.success('保存成功')
  }, 600)
}

// 删除行
// 【重要修正】因为有搜索过滤，不能直接用 index 删除，需要用 row 对象去找
const handleDeleteRow = (row) => {
  const index = tableConfig.value.data.indexOf(row)
  if (index > -1) {
    tableConfig.value.data.splice(index, 1)
  }
}
</script>

<template>
  <div class="dict-table">
    <div class="table-header">
      <div class="title-area">
        <h3>{{ tableConfig.title || '数据列表' }}</h3>
        <el-tag v-if="isEdit" type="warning" effect="dark" class="ml-2">编辑模式</el-tag>
      </div>
      
      <div class="actions">
        <el-input 
          v-model="searchKeyword"
          placeholder="全表搜索..." 
          prefix-icon="Search" 
          clearable
          style="width: 220px; margin-right: 12px;" 
        />

        <el-button-group>
          <el-button :type="isEdit ? 'info' : 'primary'" @click="toggleEdit">
            {{ isEdit ? '退出' : '编辑' }}
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
      style="width: 100%" 
      v-loading="loading"
      max-height="calc(100vh - 200px)"
      :row-class-name="({ row }) => row._isNew ? 'new-row-highlight' : ''"
    >
      <el-table-column type="index" label="#" width="50" align="center" />

      <el-table-column
        v-for="(col, index) in tableConfig.columns"
        :key="col.prop + index"
        :prop="col.prop"
        :label="col.label"
        :width="col.width || 150"
        show-overflow-tooltip
        :filters="col.filterable ? getColumnFilters(col.prop) : null"
        :filter-method="col.filterable ? filterHandler : null"
        filter-placement="bottom-end"
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

      <el-table-column v-if="isEdit" label="操作" width="60" fixed="right" align="center">
        <template #default="scope">
          <el-button type="danger" link icon="Delete" @click="handleDeleteRow(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.dict-table { height: 100%; display: flex; flex-direction: column; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; flex-shrink: 0; }
.title-area { display: flex; align-items: center; }
.title-area h3 { margin: 0; color: #333; }
.ml-2 { margin-left: 8px; }
.actions { display: flex; align-items: center; }
</style>