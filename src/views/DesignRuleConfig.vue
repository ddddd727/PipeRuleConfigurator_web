<template>
  <div class="basic-config-container">
    <div class="basic-config-content">
      <!-- 左侧目录树 -->
      <div class="basic-config-sidebar">
        <div class="sidebar-header">
          <span>目录</span>
        </div>
        <div class="sidebar-tree">
          <el-tree
            ref="treeRef"
            :data="treeData"
            node-key="id"
            :default-expanded-keys="['basic', 'bend-pipe']"
            :default-checked-keys="['bend-pipe']"
            :highlight-current="true"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <el-icon v-if="data.icon" class="tree-icon">
                  <component :is="data.icon" />
                </el-icon>
                <span class="tree-label">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="basic-config-main">
        <!-- 动态渲染配置区域 -->
        <div class="config-section" v-if="currentConfig">
          <!-- 标题区域 -->
          <div class="main-header">
            <div class="title-section">
              <h3>{{ currentConfig.title }}</h3>
              <span 
                v-if="currentConfig.id === 'bend-pipe'" 
                class="subtitle clickable-standard" 
                @click="openStandardImageDialog"
              >
                相关标准/规范:《管子设计惯例6M241000TB》
                <el-icon class="view-icon"><View /></el-icon>
              </span>
            </div>
            
            <!-- 操作按钮组 -->
            <div class="action-buttons">
              <el-button 
                size="small" 
                type="primary" 
                @click="openAddDialog(currentConfig.id)"
              >
                <el-icon><Plus /></el-icon>
                新增
              </el-button>

              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteRows(currentConfig.id)"
                :disabled="currentConfig.selectedRows.length === 0"
              >
                <el-icon><Delete /></el-icon>
                删除 ({{ currentConfig.selectedRows.length }})
              </el-button>

            </div>
          </div>

          <!-- 数据表格 -->
          <div class="table-container">
            <el-table
              :ref="`${currentConfig.id}TableRef`"
              :data="currentConfig.data"
              stripe
              style="width: 100%"
              height="100%"
              @row-dblclick="(row) => handleRowDblClick(row)"
              @selection-change="(val) => handleSelectionChange(currentConfig.id, val)"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column type="index" label="序号" width="80" align="center" />
              
              <template v-for="col in currentConfig.columns" :key="col.prop">
                <el-table-column
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                >
                  <template #default="{ row, $index }">
                    {{ row[col.prop] }}
                  </template>
                </el-table-column>
              </template>
            </el-table>
            
            <!-- 表格底部信息 -->
            <div class="table-footer">
              <div class="pagination-info">
                共 {{ currentConfig.data.length }} 条记录
                <span v-if="currentConfig.selectedRows.length > 0" class="selected-info">
                  | 已选 {{ currentConfig.selectedRows.length }} 条
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量新增对话框 -->
    <el-dialog
      v-model="batchAddDialogVisible"
      :title="`批量新增 - ${currentConfig?.title || ''}`"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="batch-add-toolbar" style="margin-bottom: 10px;">
        <el-button type="primary" @click="handleAddBatchRow">
          <el-icon><Plus /></el-icon> 增加一行
        </el-button>
      </div>
      
      <el-table :data="batchAddData" border stripe height="400">
        
        <template v-if="currentConfig">
          <el-table-column 
            v-for="col in currentConfig.columns" 
            :key="col.prop" 
            :label="col.label"
            :prop="col.prop"
          >
            <template #default="{ row }">
              <el-input v-model="row[col.prop]" size="small" />
            </template>
          </el-table-column>
        </template>

        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="{ $index }">
            <el-button 
              type="danger" 
              link 
              @click="handleDeleteBatchRow($index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAddDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchAdd" :loading="batchSaveLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 单行编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="`编辑 - ${currentConfig?.title || ''}`"
      width="60%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-table :data="[editRowData]" border stripe height="auto" v-if="editRowData && currentConfig">
        <template v-for="col in currentConfig.columns" :key="col.prop">
          <el-table-column :label="col.label" :prop="col.prop">
            <template #default>
              <el-input v-model="editRowData[col.prop]" size="small" />
            </template>
          </el-table-column>
        </template>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="confirmEdit" :loading="editSaveLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 标准规范图片对话框 -->
    <el-dialog
      v-model="standardImageDialogVisible"
      width="70%"
      top="10vh"
      class="standard-image-dialog"
    >
      <div class="image-container">
        <div class="image-wrapper">
          <img 
            :src="standardImagePath" 
            alt="管子设计惯例6M241000TB"
            class="standard-image"
            @load="handleImageLoad"
            @error="handleImageError"
          />
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { db } from '@/mock/index.js'
import Mock from 'mockjs'
import axios from 'axios'
import {
  Folder,
  Document,
  Plus,
  Delete,
  View
} from '@element-plus/icons-vue'

// 树形数据
const treeData = ref([
  {
    id: 'basic',
    label: '设计规则类',
    icon: Folder,
    children: [
      { id: 'bend-pipe', label: '弯管数据', icon: Document },
      { id: 'wall-thickness-series', label: '壁厚系列', icon: Document },
      { id: 'shortcode', label: 'ShortCode', icon: Document },
      { id: 'spec', label: 'Spec', icon: Document }
    ]
  }
])

// 当前选中的节点
const currentNode = ref(treeData.value[0].children[0])

// 配置数据
const configs = reactive({})

// 初始化所有配置
const initializeConfigs = () => {
  const configIds = ['bend-pipe', 'wall-thickness-series', 'shortcode','spec']
  
  configIds.forEach(configId => {
    if (db[configId]) {
      const mockData = Mock.mock(db[configId])
      
      configs[configId] = {
        id: configId,
        title: mockData.title || configId,
        selectedRows: [],
        columns: mockData.columns ? mockData.columns.map(col => ({
          ...col,
          editable: col.editable !== undefined ? col.editable : true
        })) : [],
        data: mockData.data || []
      }
    } else {
      // 如果db中没有找到配置，使用默认数据
      console.warn(`配置 ${configId} 未在 db 中找到`)
      configs[configId] = {
        id: configId,
        title: configId,
        selectedRows: [],
        columns: [],
        data: []
      }
    }
  })
  
  // 设置默认选中节点
  if (treeData.value[0].children.length > 0) {
    currentNode.value = treeData.value[0].children[0]
  }
}

const currentConfig = computed(() => {
  if (!currentNode.value || !configs[currentNode.value.id]) {
    return null
  }
  return configs[currentNode.value.id]
})

// ========== 通用状态 ==========

// ========== 标准图片相关状态 ==========
const standardImageDialogVisible = ref(false)
const standardImagePath = ref('/管子设计惯例6M241000TB.png')
const imageLoading = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

// ========== 表单验证规则 ==========

// ========== 通用方法 ==========
const handleNodeClick = (node) => {
  if (node.id !== 'basic') {
    // 如果该配置尚未加载，则加载
    if (!configs[node.id] && db[node.id]) {
      const mockData = Mock.mock(db[node.id])
      configs[node.id] = {
        id: node.id,
        title: mockData.title || node.id,
        selectedRows: [],
        columns: mockData.columns ? mockData.columns.map(col => ({
          ...col,
          editable: col.editable !== undefined ? col.editable : true
        })) : [],
        data: mockData.data || []
      }
    }
    
    currentNode.value = node
    // 清空所有配置的选中行
    Object.values(configs).forEach(config => {
      if (config) {
        config.selectedRows = []
      }
    })
  }
}


const handleSelectionChange = (configId, selection) => {
  const config = configs[configId]
  if (config) {
    config.selectedRows = selection
  }
}

const handleDeleteRows = (configId) => {
  const config = configs[configId]
  if (!config) return
  
  if (config.selectedRows.length === 0) {
    ElMessage.warning('请先选择要删除的行')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${config.selectedRows.length} 行数据吗？`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    // 针对 bend-pipe 走后端删除接口
    if (configId === 'bend-pipe') {
      try {
        const deletePromises = config.selectedRows.map(row => 
          axios.delete(`/api/DspSpmcDictPipingBend/${row.id}`)
        )
        await Promise.all(deletePromises)
        ElMessage.success(`成功删除 ${config.selectedRows.length} 行数据`)
        // 刷新数据
        await fetchBendPipeData()
        config.selectedRows = []
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败，请重试')
      }
      return
    }

    // 其他配置走前端假删除
    const selectedIds = config.selectedRows.map(row => row.id)
    config.data = config.data.filter(row => !selectedIds.includes(row.id))
    
    // 重新排序ID
    config.data.forEach((row, index) => {
      row.id = index + 1
    })
    
    ElMessage.success(`成功删除 ${selectedIds.length} 行数据`)
    config.selectedRows = []
  })
}

const batchAddDialogVisible = ref(false)
const batchAddData = ref([])
const batchSaveLoading = ref(false)

const openAddDialog = (configId) => {
  const config = configs[configId]
  if (!config) return
  
  batchAddData.value = []
  handleAddBatchRow() // 默认添加一行
  batchAddDialogVisible.value = true
}

const handleAddBatchRow = () => {
  const config = currentConfig.value
  if (!config) return
  
  const newRow = {}
  config.columns.forEach(col => {
    newRow[col.prop] = ''
  })
  batchAddData.value.push(newRow)
}

const handleDeleteBatchRow = (index) => {
  batchAddData.value.splice(index, 1)
}

const confirmBatchAdd = async () => {
  if (batchAddData.value.length === 0) {
    ElMessage.warning('请至少添加一行数据')
    return
  }

  const config = currentConfig.value
  if (!config) return

  // 校验数据：所有字段必填
  for (let i = 0; i < batchAddData.value.length; i++) {
    const row = batchAddData.value[i]
    for (const col of config.columns) {
      const val = row[col.prop]
      if (val === undefined || val === null || String(val).trim() === '') {
        ElMessage.warning(`第 ${i + 1} 行的 "${col.label}" 不能为空`)
        return
      }
    }
  }

  // 校验重复数据
  // 1. 检查批量新增列表中是否有重复行
  const batchRowsStr = batchAddData.value.map(row => {
    // 提取所有列的值组合成字符串用于比较
    return config.columns.map(col => String(row[col.prop]).trim()).join('|')
  })
  
  const batchSet = new Set()
  for (let i = 0; i < batchRowsStr.length; i++) {
    const str = batchRowsStr[i]
    if (batchSet.has(str)) {
      ElMessage.warning(`新增列表中存在重复数据（第 ${i + 1} 行与其他行重复）`)
      return
    }
    batchSet.add(str)
  }

  // 2. 检查是否与数据库已有数据重复
  if (config.data && config.data.length > 0) {
    const existingRowsStr = config.data.map(row => {
      return config.columns.map(col => String(row[col.prop]).trim()).join('|')
    })
    
    for (let i = 0; i < batchRowsStr.length; i++) {
      const str = batchRowsStr[i]
      if (existingRowsStr.includes(str)) {
        ElMessage.warning(`第 ${i + 1} 行数据已存在于数据库中，不能重复添加`)
        return
      }
    }
  }

  batchSaveLoading.value = true
  
  try {
    if (config.id === 'bend-pipe') {
      // 弯管数据：循环调用POST接口
      const promises = batchAddData.value.map(row => {
        // 构造请求体，确保数据格式正确
        const payload = {
          ...row,
          // 确保数值类型正确转换
          outSideDiameter: Number(row.outSideDiameter) || 0,
          headerClampLength: Number(row.headerClampLength) || 0,
          tailClampLength: Number(row.tailClampLength) || 0
        }
        return axios.post('/api/DspSpmcDictPipingBend', payload)
      })
      
      await Promise.all(promises)
      await fetchBendPipeData()
      ElMessage.success(`成功添加 ${batchAddData.value.length} 条数据`)
    } else {
      // 其他配置：前端模拟添加
      let newId = config.data.length > 0 
        ? Math.max(...config.data.map(item => item.id)) + 1 
        : 1
        
      const newRows = batchAddData.value.map((row, index) => ({
        ...row,
        id: newId + index
      }))
      
      config.data.push(...newRows)
      ElMessage.success(`成功添加 ${batchAddData.value.length} 条数据`)
      
      // 自动滚动到底部
      setTimeout(() => {
        const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap') 
                          || document.querySelector('.el-table__body-wrapper')
        if (tableBody) {
          tableBody.scrollTop = tableBody.scrollHeight
        }
      }, 100)
    }
    
    batchAddDialogVisible.value = false
    batchAddData.value = []
  } catch (error) {
    console.error('批量新增失败:', error)
    ElMessage.error('批量新增失败，请检查数据格式或网络连接')
  } finally {
    batchSaveLoading.value = false
  }
}

const editDialogVisible = ref(false)
const editRowData = ref(null)
const editSaveLoading = ref(false)

const handleRowDblClick = (row) => {
  const config = currentConfig.value
  if (!config) return
  editRowData.value = { ...row }
  editDialogVisible.value = true
}

const cancelEdit = async () => {
  editDialogVisible.value = false
  editRowData.value = null
  if (currentConfig.value?.id === 'bend-pipe') {
    await fetchBendPipeData()
  }
}

const confirmEdit = async () => {
  const config = currentConfig.value
  if (!config || !editRowData.value) return

  for (const col of config.columns) {
    const val = editRowData.value[col.prop]
    if (val === undefined || val === null || String(val).trim() === '') {
      ElMessage.warning(`"${col.label}" 不能为空`)
      return
    }
  }

  if (config.data && config.data.length > 0) {
    const targetId = editRowData.value.id
    const existingRowsStr = config.data
      .filter(r => r.id !== targetId)
      .map(r => config.columns.map(col => String(r[col.prop]).trim()).join('|'))
    const currentStr = config.columns.map(col => String(editRowData.value[col.prop]).trim()).join('|')
    if (existingRowsStr.includes(currentStr)) {
      ElMessage.warning('该数据已存在，不能重复添加')
      return
    }
  }

  editSaveLoading.value = true
  try {
    if (config.id === 'bend-pipe') {
      const payload = {
        ...editRowData.value,
        outSideDiameter: Number(editRowData.value.outSideDiameter) || 0,
        headerClampLength: Number(editRowData.value.headerClampLength) || 0,
        tailClampLength: Number(editRowData.value.tailClampLength) || 0
      }
      await axios.put('http://localhost:5022/api/DspSpmcDictPipingBend', payload)
      await fetchBendPipeData()
      ElMessage.success('更新成功')
    } else {
      const idx = config.data.findIndex(r => r.id === editRowData.value.id)
      if (idx !== -1) {
        config.data[idx] = { ...config.data[idx], ...editRowData.value }
        ElMessage.success('更新成功')
      }
    }
    editDialogVisible.value = false
    editRowData.value = null
  } catch (e) {
    ElMessage.error(e?.message || '更新失败，请重试')
  } finally {
    editSaveLoading.value = false
  }
}

const handleAddRow = (configId) => {
  // Deprecated, replaced by openAddDialog
}

// ========== 标准图片相关方法 ==========
const openStandardImageDialog = () => {
  standardImageDialogVisible.value = true
  imageLoading.value = true
  imageLoaded.value = false
  imageError.value = false
}

const handleImageLoad = () => {
  imageLoading.value = false
  imageLoaded.value = true
  imageError.value = false
}

const handleImageError = () => {
  imageLoading.value = false
  imageLoaded.value = false
  imageError.value = true
  ElMessage.error('标准规范图片加载失败，请检查文件路径')
}

const fetchBendPipeData = async () => {
  try {
    const res = await axios.get('/api/DspSpmcDictPipingBend')
    if (res?.data?.code === 200) {
      const rows = Array.isArray(res.data.data) ? res.data.data : []
      const cfg = configs['bend-pipe'] || {
        id: 'bend-pipe',
        title: '弯管数据',
        selectedRows: [],
        columns: [],
        data: []
      }
      cfg.columns = [
        { prop: 'outSideDiameter', label: '外径DN', editable: false },
        { prop: 'outSideDiameterUnit', label: '外径单位', editable: false },
        { prop: 'headerClampLength', label: '前夹长L1', editable: false },
        { prop: 'tailClampLength', label: '后夹长L2', editable: false }
      ]
      cfg.data = rows
      configs['bend-pipe'] = cfg
    } else {
      ElMessage.error(res?.data?.message || '弯管数据接口返回异常')
    }
  } catch (e) {
    ElMessage.error(`弯管数据接口请求失败：${e?.message || '网络错误'}`)
  }
}

// 初始化
onMounted(() => {
  initializeConfigs()
  fetchBendPipeData()
})

watch(currentNode, (node) => {
  if (node?.id === 'bend-pipe') {
    fetchBendPipeData()
  }
})
</script>

<style scoped>
.basic-config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.basic-config-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  margin: -10px;
  gap: 10px;
}

.basic-config-sidebar {
  width: 240px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  color: #303133;
  background-color: #fafafa;
}

.sidebar-tree {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.tree-icon {
  margin-right: 8px;
  color: #909399;
}

.tree-label {
  font-size: 14px;
  color: #606266;
}

.basic-config-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.config-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafafa;
  flex-shrink: 0;
}

.title-section h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #303133;
}

.subtitle {
  font-size: 15px;
  color: #909399;
  display: inline-flex;
  align-items: center;
}

.clickable-standard {
  color: #409eff;
  cursor: pointer;
  transition: all 0.3s;
  padding: 2px 0px;
  border-radius: 4px;
}

.clickable-standard:hover {
  color: #66b1ff;
  background-color: #ecf5ff;
  text-decoration: underline;
}

.clickable-standard .view-icon {
  margin-left: 6px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-footer {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafafa;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-info {
  color: #409eff;
  font-weight: 500;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
  border-radius: 8px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node__expand-icon) {
  color: #c0c4cc;
}

:deep(.el-table .cell) {
  padding: 4px 8px;
}

:deep(.el-input--small) {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.standard-image-dialog .el-dialog__body) {
  padding: 0;
}

.image-container {
  display: flex;
  flex-direction: column;
  height: 65vh;
}

.image-wrapper {
  flex: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  overflow: auto;
  position: relative;
  min-height: 300px;
}

.standard-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
