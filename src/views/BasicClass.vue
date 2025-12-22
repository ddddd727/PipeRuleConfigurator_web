<template>
  <div class="basic-config-container">
    <div class="basic-config-content">
      <!-- 左侧目录树 -->
      <div class="basic-config-sidebar">
        <div class="sidebar-header">
          <span>配置目录</span>
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
        <div class="main-header">
          <div class="title-section">
            <h3>{{ currentNode.label }}</h3>
            <span class="subtitle">{{ currentNode.id === 'bend-pipe' ? '弯管参数配置' : '管材壁厚系列配置' }}</span>
          </div>
          <div class="action-buttons">
            <el-button 
              size="small" 
              type="primary" 
              @click="openAddRowDialog"
            >
              <el-icon><Plus /></el-icon>
              增加行
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="handleAddColumn"
            >
              <el-icon><Plus /></el-icon>
              增加列
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDeleteSelectedRows"
              :disabled="selectedRows.length === 0"
            >
              <el-icon><Delete /></el-icon>
              删除 ({{ selectedRows.length }})
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              @click="handleSave"
            >
              <el-icon><Check /></el-icon>
              保存
            </el-button>
          </div>
        </div>

        <!-- 添加列对话框 -->
        <el-dialog
          v-model="addColumnDialogVisible"
          :title="`为${currentNode.label}增加新列`"
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

        <!-- 添加行对话框 -->
        <el-dialog
          v-model="addRowDialogVisible"
          :title="`为${currentNode.label}增加新行`"
          width="600px"
          @close="handleAddRowDialogClose"
        >
          <el-form 
            :model="newRowForm" 
            ref="rowFormRef"
            label-width="100px"
          >
            <el-form-item 
              v-for="col in currentColumns.filter(col => col.prop !== 'id')" 
              :key="col.prop"
              :label="col.label"
              :prop="col.prop"
              :required="!col.isNew"
            >
              <el-input 
                v-model="newRowForm[col.prop]" 
                :placeholder="col.isNew ? `请输入${col.label}（可选）` : `请输入${col.label}`" 
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addRowDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmAddRow">确定</el-button>
            </span>
          </template>
        </el-dialog>

        <div class="main-content">
          <!-- 弯管数据表格 -->
          <div v-if="currentNode.id === 'bend-pipe'" class="table-container">
            <el-table
              ref="bendPipeTableRef"
              :data="bendPipeData"
              stripe
              style="width: 100%"
              height="100%"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                type="selection"
                width="55"
              />
              <el-table-column
                prop="id"
                label="序号"
                width="80"
              />
              <template v-for="col in bendPipeColumns" :key="col.prop">
                <el-table-column
                  v-if="col.prop !== 'id'"
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                />
              </template>
            </el-table>
            
            <div class="table-footer">
              <div class="pagination-info">
                共 {{ bendPipeData.length }} 条记录
                <span v-if="selectedRows.length > 0" class="selected-info">
                  | 已选 {{ selectedRows.length }} 条
                </span>
              </div>
            </div>
          </div>

          <!-- 壁厚系列表格 -->
          <div v-else-if="currentNode.id === 'wall-thickness-series'" class="table-container">
            <el-table
              ref="wallThicknessTableRef"
              :data="wallThicknessData"
              stripe
              style="width: 100%"
              height="100%"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                type="selection"
                width="55"
              />
              <el-table-column
                prop="id"
                label="序号"
                width="80"
              />
              <template v-for="col in wallThicknessColumns" :key="col.prop">
                <el-table-column
                  v-if="col.prop !== 'id'"
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                />
              </template>
            </el-table>
            
            <div class="table-footer">
              <div class="pagination-info">
                共 {{ wallThicknessData.length }} 条记录
                <span v-if="selectedRows.length > 0" class="selected-info">
                  | 已选 {{ selectedRows.length }} 条
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Folder,
  Document,
  Plus,
  Delete,
  Check
} from '@element-plus/icons-vue'

// 树形数据
const treeData = ref([
  {
    id: 'basic',
    label: '基础类',
    icon: Folder,
    children: [
      {
        id: 'bend-pipe',
        label: '弯管数据',
        icon: Document
      },
      {
        id: 'wall-thickness-series',
        label: '壁厚系列',
        icon: Document
      },
    ]
  }
])

// 当前选中的节点
const currentNode = ref(treeData.value[0].children[0])

// 表格引用
const bendPipeTableRef = ref()
const wallThicknessTableRef = ref()
const columnFormRef = ref()
const rowFormRef = ref()

// 状态管理
const addColumnDialogVisible = ref(false)
const addRowDialogVisible = ref(false)
const selectedRows = ref([])

// 弯管数据表列定义
const bendPipeColumns = ref([
  { prop: 'id', label: '序号', width: '80', editable: false, isNew: false },
  { prop: 'Diameter', label: '通径DN', width: 'auto', editable: true, isNew: false },
  { prop: 'unit', label: '通径单位', width: 'auto', editable: true, isNew: false },
  { prop: 'series', label: '壁厚系列', width: 'auto', editable: true, isNew: false },
  { prop: 'outerDiameter', label: '外径mm', width: 'auto', editable: true, isNew: false },
  { prop: 'thickness', label: '壁厚值', width: 'auto', editable: true, isNew: false },
  { prop: 'material', label: '主材料', width: 'auto', editable: true, isNew: false },
])

// 壁厚系列表列定义
const wallThicknessColumns = ref([
  { prop: 'id', label: '序号', width: '80', editable: false, isNew: false },
  { prop: 'Diameter', label: '通径DN', width: 'auto', editable: true, isNew: false },
  { prop: 'unit', label: '通径单位', width: 'auto', editable: true, isNew: false },
  { prop: 'material', label: '主材料', width: 'auto', editable: true, isNew: false },
  { prop: 'l1', label: '前夹L1', width: 'auto', editable: true, isNew: false },
  { prop: 'l2', label: '前夹L2', width: 'auto', editable: true, isNew: false },
])

// 添加列表单
const newColumnForm = reactive({
  label: '',
  prop: '',
  width: '',
  editable: true
})

// 添加行表单
const newRowForm = reactive({})

// 表单验证规则
const columnFormRules = {
  label: [
    { required: true, message: '请输入列名', trigger: 'blur' }
  ],
  prop: [
    { required: true, message: '请输入字段名', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '字段名只能包含字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ]
}

// 表格数据示例（弯管数据）
const bendPipeData = ref([
  { 
    id: 1, 
    Diameter: 'DN15', 
    unit: 'mm',
    series: 'Sch10',
    outerDiameter: '21.3',
    thickness: '2.11',
    material: '304不锈钢'
  },
  { 
    id: 2, 
    Diameter: 'DN20', 
    unit: 'mm',
    series: 'Sch20',
    outerDiameter: '26.9',
    thickness: '2.65',
    material: '304不锈钢'
  },
  { 
    id: 3, 
    Diameter: 'DN25', 
    unit: 'mm',
    series: 'Sch40',
    outerDiameter: '33.7',
    thickness: '3.38',
    material: '碳钢'
  },
])

// 表格数据示例（壁厚系列）
const wallThicknessData = ref([
  { 
    id: 1, 
    Diameter: 'DN15', 
    unit: 'mm', 
    material: '304不锈钢',
    l1: '50mm',
    l2: '60mm'
  },
  { 
    id: 2, 
    Diameter: 'DN20', 
    unit: 'mm', 
    material: '304不锈钢',
    l1: '55mm',
    l2: '65mm'
  },
  { 
    id: 3, 
    Diameter: 'DN25', 
    unit: 'mm', 
    material: '碳钢',
    l1: '60mm',
    l2: '70mm'
  },
])

// 计算当前表格的列（排除序号列）
const currentColumns = computed(() => {
  const columns = currentNode.value.id === 'bend-pipe' ? bendPipeColumns.value : wallThicknessColumns.value
  return columns.filter(col => col.prop !== 'id')
})

// 计算当前表格的数据
const currentData = computed(() => {
  return currentNode.value.id === 'bend-pipe' ? bendPipeData.value : wallThicknessData.value
})

// 处理节点点击
const handleNodeClick = (node) => {
  if (node.id !== 'basic') {
    currentNode.value = node
    selectedRows.value = [] // 切换节点时清空选中
  }
}

// 打开添加行对话框
const openAddRowDialog = () => {
  // 重置表单
  Object.keys(newRowForm).forEach(key => {
    delete newRowForm[key]
  })
  
  // 为所有列设置初始空值
  currentColumns.value.forEach(col => {
    newRowForm[col.prop] = ''
    
    // 设置默认值
    if (col.prop === 'unit') {
      newRowForm[col.prop] = 'mm'
    }
  })
  
  addRowDialogVisible.value = true
}

// 计算下一个序号
const getNextId = () => {
  const data = currentData.value
  if (data.length === 0) return 1
  
  // 找到最大的ID
  const maxId = Math.max(...data.map(row => row.id))
  return maxId + 1
}

// 确认添加行
const confirmAddRow = () => {
  // 只验证非新增的必填字段
  const requiredFields = currentColumns.value
    .filter(col => !col.isNew)
    .map(col => col.prop)
    
  const missingFields = requiredFields.filter(field => !newRowForm[field] || newRowForm[field].trim() === '')
  
  if (missingFields.length > 0) {
    ElMessage.warning('请填写所有必填字段')
    return
  }
  
  // 创建新行对象
  const newRow = { id: getNextId() }
  
  // 复制表单数据到新行
  currentColumns.value.forEach(col => {
    newRow[col.prop] = newRowForm[col.prop]
  })
  
  // 添加新行到表格数据
  if (currentNode.value.id === 'bend-pipe') {
    bendPipeData.value.push(newRow)
  } else {
    wallThicknessData.value.push(newRow)
  }
  
  addRowDialogVisible.value = false
  ElMessage.success('新增行成功')
  
  // 滚动到新增的行
  nextTick(() => {
    const tableRef = currentNode.value.id === 'bend-pipe' 
      ? bendPipeTableRef.value 
      : wallThicknessTableRef.value
    if (tableRef) {
      tableRef.scrollTo({ top: tableRef.$el.scrollHeight })
    }
  })
}

// 处理添加行对话框关闭
const handleAddRowDialogClose = () => {
  // 清空表单
  Object.keys(newRowForm).forEach(key => {
    delete newRowForm[key]
  })
}

// 处理删除选中行
const handleDeleteSelectedRows = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的行')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 行数据吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 获取选中行的ID
    const selectedIds = selectedRows.value.map(row => row.id)
    
    if (currentNode.value.id === 'bend-pipe') {
      bendPipeData.value = bendPipeData.value.filter(row => !selectedIds.includes(row.id))
      // 重新排序ID
      bendPipeData.value.forEach((row, index) => {
        row.id = index + 1
      })
    } else {
      wallThicknessData.value = wallThicknessData.value.filter(row => !selectedIds.includes(row.id))
      // 重新排序ID
      wallThicknessData.value.forEach((row, index) => {
        row.id = index + 1
      })
    }
    
    ElMessage.success(`成功删除 ${selectedIds.length} 行数据`)
    selectedRows.value = [] // 清空选中
  }).catch(() => {
    // 用户取消
  })
}

// 处理增加列
const handleAddColumn = () => {
  // 重置表单
  Object.assign(newColumnForm, {
    label: '',
    prop: '',
    width: '',
    editable: true
  })
  addColumnDialogVisible.value = true
}

// 确认添加列
const confirmAddColumn = () => {
  if (!columnFormRef.value) return
  
  columnFormRef.value.validate((valid) => {
    if (valid) {
      const newColumn = {
        prop: newColumnForm.prop,
        label: newColumnForm.label,
        width: newColumnForm.width || 'auto',
        editable: newColumnForm.editable,
        isNew: true // 标记为新增列
      }
      
      if (currentNode.value.id === 'bend-pipe') {
        // 检查列是否已存在
        if (bendPipeColumns.value.some(col => col.prop === newColumn.prop)) {
          ElMessage.error('字段名已存在，请使用其他字段名')
          return
        }
        bendPipeColumns.value.push(newColumn)
        
        // 为所有行添加新字段
        bendPipeData.value.forEach(row => {
          row[newColumn.prop] = ''
        })
      } else {
        // 检查列是否已存在
        if (wallThicknessColumns.value.some(col => col.prop === newColumn.prop)) {
          ElMessage.error('字段名已存在，请使用其他字段名')
          return
        }
        wallThicknessColumns.value.push(newColumn)
        
        // 为所有行添加新字段
        wallThicknessData.value.forEach(row => {
          row[newColumn.prop] = ''
        })
      }
      
      addColumnDialogVisible.value = false
      ElMessage.success('添加列成功')
    }
  })
}

// 处理添加列对话框关闭
const handleAddColumnDialogClose = () => {
  if (columnFormRef.value) {
    columnFormRef.value.resetFields()
  }
}

// 处理保存
const handleSave = () => {
  ElMessageBox.confirm(
    '确定要保存当前表格的所有更改吗？',
    '保存确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    // 模拟API调用
    setTimeout(() => {
      ElMessage.success('保存成功')
    }, 500)
  }).catch(() => {
    // 用户取消
  })
}

// 处理选择变更
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 初始化选中第一个二级节点
onMounted(() => {
  currentNode.value = treeData.value[0].children[0]
})
</script>

<style scoped>
/* 样式保持不变，省略以节省空间 */
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

.main-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafafa;
}

.title-section h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #303133;
}

.subtitle {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.el-button.is-disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>