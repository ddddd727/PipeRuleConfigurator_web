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
              :type="editMode ? 'danger' : 'warning'"
              @click="toggleEditMode"
            >
              <el-icon><Edit /></el-icon>
              {{ editMode ? '取消' : '编辑' }} 
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="handleAddRow"
              :disabled="!editMode"
            >
              <el-icon><Plus /></el-icon>
              增加行
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="handleAddColumn"
              :disabled="!editMode"
            >
              <el-icon><Plus /></el-icon>
              增加列
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDeleteSelectedRows"
              :disabled="!editMode || selectedRows.length === 0"
            >
              <el-icon><Delete /></el-icon>
              删除 ({{ selectedRows.length }})
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              @click="handleSave"
              :disabled="!editMode"
            >
              <el-icon><Check /></el-icon>
              保存
            </el-button>
          </div>
        </div>

        <!-- 添加列对话框 -->
        <el-dialog
          v-model="addColumnDialogVisible"
          :title="`为${currentNode.label}添加新列`"
          
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
            <!-- <el-form-item label="是否可编辑">
              <el-switch v-model="newColumnForm.editable" />
            </el-form-item> -->
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addColumnDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmAddColumn">确定</el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 批量编辑对话框 -->
        <el-dialog
          v-model="batchEditDialogVisible"
          :title="`批量编辑选中的${selectedRows.length}行`"
          width="500px"
        >
          <el-form :model="batchEditForm" ref="batchEditFormRef">
            <el-form-item 
              v-for="col in currentColumns" 
              :key="col.prop"
              :label="col.label"
            >
              <el-input 
                v-model="batchEditForm[col.prop]"
                :placeholder="`批量设置${col.label}`"
                @keyup.enter="confirmBatchEdit"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="batchEditDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmBatchEdit">确定</el-button>
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
              >
                <template #default="{ row, $index }">
                  <template v-if="editMode">
                    <el-input
                      v-model="row.id"
                      size="small"
                      type="number"
                      min="1"
                      @change="handleCellChange(row, 'id', $index)"
                    />
                  </template>
                  <template v-else>
                    {{ row.id }}
                  </template>
                </template>
              </el-table-column>
              <template v-for="col in bendPipeColumns" :key="col.prop">
                <el-table-column
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                >
                  <template #default="{ row, $index }">
                    <template v-if="editMode && col.editable">
                      <el-input
                        v-model="row[col.prop]"
                        size="small"
                        @change="handleCellChange(row, col.prop, $index)"
                      />
                    </template>
                    <template v-else>
                      {{ row[col.prop] }}
                    </template>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            
            <div class="table-footer">
              <div class="pagination-info">
                共 {{ bendPipeData.length }} 条记录
                <span v-if="selectedRows.length > 0" class="selected-info">
                  | 已选 {{ selectedRows.length }} 条
                </span>
                <el-button 
                  v-if="selectedRows.length > 0 && editMode" 
                  type="text" 
                  size="small"
                  @click="openBatchEditDialog"
                  class="batch-edit-btn"
                >
                  <el-icon><Edit /></el-icon>
                  批量编辑选中行
                </el-button>
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
              >
                <template #default="{ row, $index }">
                  <template v-if="editMode">
                    <el-input
                      v-model="row.id"
                      size="small"
                      type="number"
                      min="1"
                      @change="handleCellChange(row, 'id', $index)"
                    />
                  </template>
                  <template v-else>
                    {{ row.id }}
                  </template>
                </template>
              </el-table-column>
              <template v-for="col in wallThicknessColumns" :key="col.prop">
                <el-table-column
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                >
                  <template #default="{ row, $index }">
                    <template v-if="editMode && col.editable">
                      <el-input
                        v-model="row[col.prop]"
                        size="small"
                        @change="handleCellChange(row, col.prop, $index)"
                      />
                    </template>
                    <template v-else>
                      {{ row[col.prop] }}
                    </template>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            
            <div class="table-footer">
              <div class="pagination-info">
                共 {{ wallThicknessData.length }} 条记录
                <span v-if="selectedRows.length > 0" class="selected-info">
                  | 已选 {{ selectedRows.length }} 条
                </span>
                <el-button 
                  v-if="selectedRows.length > 0 && editMode" 
                  type="text" 
                  size="small"
                  @click="openBatchEditDialog"
                  class="batch-edit-btn"
                >
                  <el-icon><Edit /></el-icon>
                  批量编辑选中行
                </el-button>
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
  Edit,
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
const batchEditFormRef = ref()

// 状态管理
const editMode = ref(false)
const addColumnDialogVisible = ref(false)
const batchEditDialogVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref([])

// 弯管数据表列定义
const bendPipeColumns = ref([
  { prop: 'Diameter', label: '通径DN', width: 'auto', editable: true },
  { prop: 'unit', label: '通径单位', width: 'auto', editable: true },
  { prop: 'series', label: '壁厚系列', width: 'auto', editable: true },
  { prop: 'outerDiameter', label: '外径mm', width: 'auto', editable: true },
  { prop: 'thickness', label: '壁厚值', width: 'auto', editable: true },
  { prop: 'material', label: '主材料', width: 'auto', editable: true },
])

// 壁厚系列表列定义
const wallThicknessColumns = ref([
  { prop: 'Diameter', label: '通径DN', width: 'auto', editable: true },
  { prop: 'unit', label: '通径单位', width: 'auto', editable: true },
  { prop: 'material', label: '主材料', width: 'auto', editable: true },
  { prop: 'l1', label: '前夹L1', width: 'auto', editable: true },
  { prop: 'l2', label: '前夹L2', width: 'auto', editable: true },
])

// 添加列表单
const newColumnForm = reactive({
  label: '',
  prop: '',
  width: '',
  editable: true
})

// 批量编辑表单
const batchEditForm = reactive({})

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

// 计算当前表格的列
const currentColumns = computed(() => {
  return currentNode.value.id === 'bend-pipe' ? bendPipeColumns.value : wallThicknessColumns.value
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

// 切换编辑模式
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (!editMode.value) {
    selectedRows.value = [] // 退出编辑模式时清空选中
  }
}

// 处理单元格变更
const handleCellChange = (row, prop, index) => {
  console.log(`行${index + 1}的${prop}字段修改为:`, row[prop])
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

// 处理增加行
const handleAddRow = () => {
  const newId = currentData.value.length > 0 
    ? Math.max(...currentData.value.map(item => item.id)) + 1 
    : 1
  
  // 创建新行，包含所有列
  const newRow = { id: newId }
  
  // 为每个列添加空值
  currentColumns.value.forEach(col => {
    newRow[col.prop] = ''
  })
  
  if (currentNode.value.id === 'bend-pipe') {
    // 弯管数据的默认值
    newRow.Diameter = ''
    newRow.unit = 'mm'
    newRow.series = ''
    newRow.outerDiameter = ''
    newRow.thickness = ''
    newRow.material = ''
    bendPipeData.value.push(newRow)
  } else {
    // 壁厚系列的默认值
    newRow.Diameter = ''
    newRow.unit = 'mm'
    newRow.material = ''
    newRow.l1 = ''
    newRow.l2 = ''
    wallThicknessData.value.push(newRow)
  }
  
  ElMessage.success('新增一行成功')
  
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
        editable: newColumnForm.editable
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

// 打开批量编辑对话框
const openBatchEditDialog = () => {
  // 初始化批量编辑表单
  currentColumns.value.forEach(col => {
    batchEditForm[col.prop] = ''
  })
  batchEditDialogVisible.value = true
}

// 确认批量编辑
const confirmBatchEdit = () => {
  // 更新所有选中行
  selectedRows.value.forEach(row => {
    currentColumns.value.forEach(col => {
      if (batchEditForm[col.prop]) {
        row[col.prop] = batchEditForm[col.prop]
      }
    })
  })
  
  batchEditDialogVisible.value = false
  ElMessage.success(`已批量更新 ${selectedRows.value.length} 行数据`)
  
  // 清空表单
  currentColumns.value.forEach(col => {
    batchEditForm[col.prop] = ''
  })
}

// 处理保存
const handleSave = () => {
  // 这里应该调用API保存数据
  // 示例：模拟保存操作
  
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
      editMode.value = false // 保存后退出编辑模式
      selectedRows.value = [] // 清空选中
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
.basic-config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.basic-config-header {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.basic-config-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}

.basic-config-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  margin: -10px;
  gap: 10px;
}

/* 左侧目录树样式 */
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

/* 右侧内容区域样式 */
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

/* 表格容器 */
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

.table-header {
  vertical-align: middle;
}

.header-icon {
  margin-left: 4px;
  color: #c0c4cc;
  cursor: help;
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

.batch-edit-btn {
  margin-left: 12px;
  font-size: 12px;
  color: #409eff;
}

.batch-edit-btn:hover {
  color: #66b1ff;
}

.batch-edit-btn .el-icon {
  margin-right: 4px;
}

/* 树节点选中样式 */
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

/* 编辑模式样式 */
:deep(.el-table .cell) {
  padding: 4px 8px;
}

:deep(.el-input--small) {
  width: 100%;
}

:deep(.el-input-number--small) {
  width: 100%;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 按钮禁用样式 */
:deep(.el-button.is-disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>