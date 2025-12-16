<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
// 【核心】引入刚才封装的 hook
import { useDirtyData } from '@/hooks/useDirtyData'

const route = useRoute()
// 【核心】使用 Hook
const { initSnapshot, isModified } = useDirtyData()

// 表格配置
const tableConfig = ref({ title: '', columns: [], data: [] })
const loading = ref(false)
const isEdit = ref(false)

// --- 数据获取 ---
const fetchData = async () => {
  const dictType = route.params.id 
  if (!dictType) return

  loading.value = true
  try {
    const res = await axios.get(`/api/dict/${dictType}`)
    if (res.data.code === 200) {
      tableConfig.value = res.data.data
      
      // 【关键】数据加载后，立即拍快照
      initSnapshot(tableConfig.value.data)
      isEdit.value = false
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
watch(() => route.params.id, fetchData)

// --- 交互逻辑 ---
const toggleEdit = () => isEdit.value = !isEdit.value

const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  
  const newRow = { id: Date.now(), _isNew: true } // 标记新行
  // 补全所有列字段
  tableConfig.value.columns.forEach(col => newRow[col.prop] = '')
  
  tableConfig.value.data.push(newRow)
  // 滚动到底部 (可选)
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
    tableConfig.value.columns.push({ prop: newProp, label: value, width: 150 })
    tableConfig.value.data.forEach(row => row[newProp] = '')
  } catch(e) {}
}

const handleSave = () => {
  loading.value = true
  setTimeout(() => {
    console.log('提交后端数据:', JSON.stringify(tableConfig.value.data))
    
    // 【关键】保存成功后，清洗数据状态
    tableConfig.value.data.forEach(row => delete row._isNew) // 去除新行标记
    initSnapshot(tableConfig.value.data) // 更新快照为当前最新数据
    
    loading.value = false
    isEdit.value = false
    ElMessage.success('保存成功')
  }, 600)
}

const handleDeleteRow = (index) => tableConfig.value.data.splice(index, 1)
</script>

<template>
  <div class="dict-table">
    <div class="table-header">
      <div class="title-area">
        <h3>{{ tableConfig.title || '数据列表' }}</h3>
        <el-tag v-if="isEdit" type="warning" effect="dark" class="ml-2">编辑模式</el-tag>
      </div>
      <div class="actions">
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
      :data="tableConfig.data" 
      border 
      stripe
      style="width: 100%" 
      v-loading="loading"
      max-height="calc(100vh - 200px)"
      :row-class-name="({ row }) => row._isNew ? 'new-row-highlight' : ''"
    >
      <el-table-column
        v-for="(col, index) in tableConfig.columns"
        :key="col.prop + index"
        :prop="col.prop"
        :label="col.label"
        :width="col.width || 150"
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
          <el-button type="danger" link icon="Delete" @click="handleDeleteRow(scope.$index)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
/* 组件本身的布局样式 */
.dict-table { height: 100%; display: flex; flex-direction: column; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
.title-area { display: flex; align-items: center; }
.ml-2 { margin-left: 8px; }
/* 注意：高亮相关的样式已经移到 assets/dirty-status.css 了，这里不需要写 */
</style>