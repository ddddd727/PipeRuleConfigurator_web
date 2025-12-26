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
                :type="currentConfig.editMode ? 'danger' : 'warning'"
                @click="toggleEditMode(currentConfig.id)"
              >
                <el-icon><Edit /></el-icon>
                {{ currentConfig.editMode ? '取消' : '编辑' }} 
              </el-button>
              
              <el-button 
                size="small" 
                type="primary" 
                @click="handleAddRow(currentConfig.id)"
                :disabled="!currentConfig.editMode"
              >
                <el-icon><Plus /></el-icon>
                增加行
              </el-button>
              
              <el-button 
                size="small" 
                type="primary" 
                @click="showAddColumnDialog(currentConfig.id)"
                :disabled="!currentConfig.editMode"
              >
                <el-icon><Plus /></el-icon>
                增加列
              </el-button>
              
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteRows(currentConfig.id)"
                :disabled="!currentConfig.editMode || currentConfig.selectedRows.length === 0"
              >
                <el-icon><Delete /></el-icon>
                删除 ({{ currentConfig.selectedRows.length }})
              </el-button>
              
              <el-button 
                size="small" 
                type="success" 
                @click="handleSave(currentConfig.id)"
                :disabled="!currentConfig.editMode"
              >
                <el-icon><Check /></el-icon>
                保存
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
              @selection-change="(val) => handleSelectionChange(currentConfig.id, val)"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="序号" width="80" />
              
              <template v-for="col in currentConfig.columns" :key="col.prop">
                <el-table-column
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                >
                  <template #default="{ row, $index }">
                    <template v-if="currentConfig.editMode && col.editable">
                      <el-input
                        v-model="row[col.prop]"
                        size="small"
                        @change="handleCellChange(currentConfig.id, row, col.prop, $index)"
                      />
                    </template>
                    <template v-else>
                      {{ row[col.prop] }}
                    </template>
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

    <!-- 添加列对话框 -->
    <el-dialog
      v-model="addColumnDialogVisible"
      :title="`为${currentAddColumnConfig?.title || ''}添加新列`"
      width="500px"
      @close="handleAddColumnDialogClose"
    >
      <el-form :model="newColumnForm" :rules="columnFormRules" ref="columnFormRef">
        <el-form-item label="列名" prop="label">
          <el-input v-model="newColumnForm.label" placeholder="请输入列名" />
        </el-form-item>
        <el-form-item label="字段名" prop="prop">
          <el-input v-model="newColumnForm.prop" placeholder="请输入英文字段名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addColumnDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddColumn">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { db } from '@/mock/index.js'
import Mock from 'mockjs'
import {
  Folder,
  Document,
  Plus,
  Edit,
  Delete,
  Check,
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
      console.log(`加载配置 ${configId}:`, mockData) // 调试用
      
      configs[configId] = {
        id: configId,
        title: mockData.title || configId,
        editMode: false,
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
        editMode: false,
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
const columnFormRef = ref()
const addColumnDialogVisible = ref(false)
const currentAddColumnConfig = ref(null)
const newColumnForm = reactive({
  label: '',
  prop: '',
  editable: true
})

// ========== 标准图片相关状态 ==========
const standardImageDialogVisible = ref(false)
const standardImagePath = ref('/管子设计惯例6M241000TB.png')
const imageLoading = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

// ========== 表单验证规则 ==========
const columnFormRules = {
  label: [{ required: true, message: '请输入列名', trigger: 'blur' }],
  prop: [
    { required: true, message: '请输入字段名', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '字段名只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ]
}

// ========== 通用方法 ==========
const handleNodeClick = (node) => {
  if (node.id !== 'basic') {
    // 如果该配置尚未加载，则加载
    if (!configs[node.id] && db[node.id]) {
      const mockData = Mock.mock(db[node.id])
      configs[node.id] = {
        id: node.id,
        title: mockData.title || node.id,
        editMode: false,
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

const toggleEditMode = (configId) => {
  const config = configs[configId]
  if (config) {
    config.editMode = !config.editMode
    if (!config.editMode) {
      config.selectedRows = []
    }
  }
}

const handleCellChange = (configId, row, prop, index) => {
  console.log(`${configId} 行${index + 1}的${prop}字段修改为:`, row[prop])
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
  ).then(() => {
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

const handleAddRow = (configId) => {
  const config = configs[configId]
  if (!config) return
  
  const newId = config.data.length > 0 
    ? Math.max(...config.data.map(item => item.id)) + 1 
    : 1
  
  const newRow = { id: newId }
  
  // 为每个列添加空值
  config.columns.forEach(col => {
    newRow[col.prop] = ''
  })
  
  config.data.push(newRow)
  ElMessage.success('新增一行成功')
}

const showAddColumnDialog = (configId) => {
  const config = configs[configId]
  if (!config) return
  
  currentAddColumnConfig.value = config
  Object.assign(newColumnForm, {
    label: '',
    prop: '',
    editable: true
  })
  addColumnDialogVisible.value = true
}

const confirmAddColumn = () => {
  if (!columnFormRef.value) return
  
  columnFormRef.value.validate((valid) => {
    if (!valid) return
    
    const config = currentAddColumnConfig.value
    const newColumn = {
      prop: newColumnForm.prop,
      label: newColumnForm.label,
      width: 'auto',
      editable: newColumnForm.editable
    }
    
    // 检查列是否已存在
    if (config.columns.some(col => col.prop === newColumn.prop)) {
      ElMessage.error('字段名已存在，请使用其他字段名')
      return
    }
    
    config.columns.push(newColumn)
    
    // 为所有行添加新字段
    config.data.forEach(row => {
      row[newColumn.prop] = ''
    })
    
    addColumnDialogVisible.value = false
    ElMessage.success('添加列成功')
  })
}

const handleAddColumnDialogClose = () => {
  if (columnFormRef.value) {
    columnFormRef.value.resetFields()
  }
  currentAddColumnConfig.value = null
}

const handleSave = async (configId) => {
  const config = configs[configId]
  if (!config) return
  
  ElMessageBox.confirm(
    `确定要保存${config.title}的所有更改吗？`,
    '保存确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
  ).then(async () => {
    try {
      // 这里可以添加保存到服务器的逻辑
      console.log('保存数据:', config)
      
      ElMessage.success(`${config.title}保存成功`)
      config.editMode = false
      config.selectedRows = []
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败，请重试')
    }
  })
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

// 初始化
onMounted(() => {
  initializeConfigs()
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