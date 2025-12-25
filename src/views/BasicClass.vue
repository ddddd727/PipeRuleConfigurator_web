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
        <!-- 弯管数据配置 -->
        <div v-if="currentNode.id === 'bend-pipe'" class="config-section">
          <div class="main-header">
            <div class="title-section">
              <h3>{{ "名称:PlainPipingGenericData" }}</h3>
              <span 
                class="subtitle clickable-standard" 
                @click="openStandardImageDialog"
              >
                相关标准/规范:《管子设计惯例6M241000TB》
                <el-icon class="view-icon"><View /></el-icon>
              </span>
            </div>
            <div class="action-buttons">
              <el-button 
                size="small" 
                :type="bendPipeEditMode ? 'danger' : 'warning'"
                @click="toggleBendPipeEditMode"
              >
                <el-icon><Edit /></el-icon>
                {{ bendPipeEditMode ? '取消' : '编辑' }} 
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="handleAddBendPipeRow"
                :disabled="!bendPipeEditMode"
              >
                <el-icon><Plus /></el-icon>
                增加行
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="handleAddBendPipeColumn"
                :disabled="!bendPipeEditMode"
              >
                <el-icon><Plus /></el-icon>
                增加列
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteBendPipeRows"
                :disabled="!bendPipeEditMode || bendPipeSelectedRows.length === 0"
              >
                <el-icon><Delete /></el-icon>
                删除 ({{ bendPipeSelectedRows.length }})
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="handleSaveBendPipe"
                :disabled="!bendPipeEditMode"
              >
                <el-icon><Check /></el-icon>
                保存
              </el-button>
            </div>
          </div>

          <!-- 弯管数据表格 -->
          <div class="table-container">
            <el-table
              ref="bendPipeTableRef"
              :data="bendPipeData"
              stripe
              style="width: 100%"
              height="100%"
              @selection-change="handleBendPipeSelectionChange"
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
                <template #default="{ row }">
                  {{ row.id }}
                </template>
              </el-table-column>
              <template v-for="col in bendPipeColumns" :key="col.prop">
                <el-table-column
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                >
                  <template #default="{ row, $index }">
                    <template v-if="bendPipeEditMode && col.editable">
                      <el-input
                        v-model="row[col.prop]"
                        size="small"
                        @change="handleBendPipeCellChange(row, col.prop, $index)"
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
                <span v-if="bendPipeSelectedRows.length > 0" class="selected-info">
                  | 已选 {{ bendPipeSelectedRows.length }} 条
                </span>
                <el-button 
                  v-if="bendPipeSelectedRows.length > 0 && bendPipeEditMode" 
                  type="text" 
                  size="small"
                  @click="openBendPipeBatchEditDialog"
                  class="batch-edit-btn"
                >
                  <el-icon><Edit /></el-icon>
                  批量编辑选中行
                </el-button>
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

          <!-- 弯管数据添加列对话框 -->
          <el-dialog
            v-model="bendPipeAddColumnDialogVisible"
            title="为弯管数据添加新列"
            width="500px"
            @close="handleBendPipeAddColumnDialogClose"
          >
            <el-form :model="bendPipeNewColumnForm" :rules="columnFormRules" ref="bendPipeColumnFormRef">
              <el-form-item label="列名" prop="label">
                <el-input v-model="bendPipeNewColumnForm.label" placeholder="请输入列名" />
              </el-form-item>
              <el-form-item label="字段名" prop="prop">
                <el-input v-model="bendPipeNewColumnForm.prop" placeholder="请输入英文字段名" />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="bendPipeAddColumnDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmAddBendPipeColumn">确定</el-button>
              </span>
            </template>
          </el-dialog>

          <!-- 弯管数据批量编辑对话框 -->
          <el-dialog
            v-model="bendPipeBatchEditDialogVisible"
            :title="`批量编辑选中的${bendPipeSelectedRows.length}行`"
            width="500px"
          >
            <el-form :model="bendPipeBatchEditForm" ref="bendPipeBatchEditFormRef">
              <el-form-item 
                v-for="col in bendPipeColumns" 
                :key="col.prop"
                :label="col.label"
              >
                <el-input 
                  v-model="bendPipeBatchEditForm[col.prop]"
                  :placeholder="`批量设置${col.label}`"
                  @keyup.enter="confirmBendPipeBatchEdit"
                />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="bendPipeBatchEditDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmBendPipeBatchEdit">确定</el-button>
              </span>
            </template>
          </el-dialog>
        </div>

        <!-- 壁厚系列配置 -->
        <div v-else-if="currentNode.id === 'wall-thickness-series'" class="config-section">
          <div class="main-header">
            <div class="title-section">
              <h3>{{ "名称:PlainPipingGenericData" }}</h3>
              <!-- <span class="subtitle">管材壁厚系列配置</span> -->
            </div>
            <div class="action-buttons">
              <el-button 
                size="small" 
                :type="wallThicknessEditMode ? 'danger' : 'warning'"
                @click="toggleWallThicknessEditMode"
              >
                <el-icon><Edit /></el-icon>
                {{ wallThicknessEditMode ? '取消' : '编辑' }} 
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="handleAddWallThicknessRow"
                :disabled="!wallThicknessEditMode"
              >
                <el-icon><Plus /></el-icon>
                增加行
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="handleAddWallThicknessColumn"
                :disabled="!wallThicknessEditMode"
              >
                <el-icon><Plus /></el-icon>
                增加列
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteWallThicknessRows"
                :disabled="!wallThicknessEditMode || wallThicknessSelectedRows.length === 0"
              >
                <el-icon><Delete /></el-icon>
                删除 ({{ wallThicknessSelectedRows.length }})
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="handleSaveWallThickness"
                :disabled="!wallThicknessEditMode"
              >
                <el-icon><Check /></el-icon>
                保存
              </el-button>
            </div>
          </div>

          <!-- 壁厚系列表格 -->
          <div class="table-container">
            <el-table
              ref="wallThicknessTableRef"
              :data="wallThicknessData"
              stripe
              style="width: 100%"
              height="100%"
              @selection-change="handleWallThicknessSelectionChange"
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
                <template #default="{ row }">
                  {{ row.id }}
                </template>
              </el-table-column>
              <template v-for="col in wallThicknessColumns" :key="col.prop">
                <el-table-column
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                >
                  <template #default="{ row, $index }">
                    <template v-if="wallThicknessEditMode && col.editable">
                      <el-input
                        v-model="row[col.prop]"
                        size="small"
                        @change="handleWallThicknessCellChange(row, col.prop, $index)"
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
                <span v-if="wallThicknessSelectedRows.length > 0" class="selected-info">
                  | 已选 {{ wallThicknessSelectedRows.length }} 条
                </span>
                <el-button 
                  v-if="wallThicknessSelectedRows.length > 0 && wallThicknessEditMode" 
                  type="text" 
                  size="small"
                  @click="openWallThicknessBatchEditDialog"
                  class="batch-edit-btn"
                >
                  <el-icon><Edit /></el-icon>
                  批量编辑选中行
                </el-button>
              </div>
            </div>
          </div>

          <!-- 壁厚系列添加列对话框 -->
          <el-dialog
            v-model="wallThicknessAddColumnDialogVisible"
            title="为壁厚系列添加新列"
            width="500px"
            @close="handleWallThicknessAddColumnDialogClose"
          >
            <el-form :model="wallThicknessNewColumnForm" :rules="columnFormRules" ref="wallThicknessColumnFormRef">
              <el-form-item label="列名" prop="label">
                <el-input v-model="wallThicknessNewColumnForm.label" placeholder="请输入列名" />
              </el-form-item>
              <el-form-item label="字段名" prop="prop">
                <el-input v-model="wallThicknessNewColumnForm.prop" placeholder="请输入英文字段名" />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="wallThicknessAddColumnDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmAddWallThicknessColumn">确定</el-button>
              </span>
            </template>
          </el-dialog>

          <!-- 壁厚系列批量编辑对话框 -->
          <el-dialog
            v-model="wallThicknessBatchEditDialogVisible"
            :title="`批量编辑选中的${wallThicknessSelectedRows.length}行`"
            width="500px"
          >
            <el-form :model="wallThicknessBatchEditForm" ref="wallThicknessBatchEditFormRef">
              <el-form-item 
                v-for="col in wallThicknessColumns" 
                :key="col.prop"
                :label="col.label"
              >
                <el-input 
                  v-model="wallThicknessBatchEditForm[col.prop]"
                  :placeholder="`批量设置${col.label}`"
                  @keyup.enter="confirmWallThicknessBatchEdit"
                />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="wallThicknessBatchEditDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmWallThicknessBatchEdit">确定</el-button>
              </span>
            </template>
          </el-dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Folder,
  Document,
  Plus,
  Edit,
  Delete,
  Check,
  View,
  Download,
  Loading,
  Picture
} from '@element-plus/icons-vue'

// 树形数据
const treeData = ref([
  {
    id: 'basic',
    label: '设计规则类',
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
const bendPipeColumnFormRef = ref()
const wallThicknessColumnFormRef = ref()
const bendPipeBatchEditFormRef = ref()
const wallThicknessBatchEditFormRef = ref()

// ========== 标准规范图片相关状态 ==========
const standardImageDialogVisible = ref(false)
const standardImagePath = ref('/图片1.png') // 假设图片在public根目录下
const imageLoading = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)
const imageDimensions = ref({ width: 0, height: 0 })

// ========== 弯管数据状态 ==========
const bendPipeEditMode = ref(false)
const bendPipeAddColumnDialogVisible = ref(false)
const bendPipeBatchEditDialogVisible = ref(false)
const bendPipeSelectedRows = ref([])

// 弯管数据表列定义
const bendPipeColumns = ref([
  { prop: 'Diameter', label: '通径DN', width: 'auto', editable: true },
  { prop: 'unit', label: '通径单位', width: 'auto', editable: true },
  { prop: 'series', label: '壁厚系列', width: 'auto', editable: true },
  { prop: 'outerDiameter', label: '外径mm', width: 'auto', editable: true },
  { prop: 'thickness', label: '壁厚值', width: 'auto', editable: true },
  { prop: 'material', label: '主材料', width: 'auto', editable: true },
])

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

// 添加列表单（弯管数据）
const bendPipeNewColumnForm = reactive({
  label: '',
  prop: '',
  width: '',
  editable: true
})

// 批量编辑表单（弯管数据）
const bendPipeBatchEditForm = reactive({})

// ========== 壁厚系列状态 ==========
const wallThicknessEditMode = ref(false)
const wallThicknessAddColumnDialogVisible = ref(false)
const wallThicknessBatchEditDialogVisible = ref(false)
const wallThicknessSelectedRows = ref([])

// 壁厚系列表列定义
const wallThicknessColumns = ref([
  { prop: 'Diameter', label: '通径DN', width: 'auto', editable: true },
  { prop: 'unit', label: '通径单位', width: 'auto', editable: true },
  { prop: 'material', label: '主材料', width: 'auto', editable: true },
  { prop: 'l1', label: '前夹L1', width: 'auto', editable: true },
  { prop: 'l2', label: '前夹L2', width: 'auto', editable: true },
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

// 添加列表单（壁厚系列）
const wallThicknessNewColumnForm = reactive({
  label: '',
  prop: '',
  width: '',
  editable: true
})

// 批量编辑表单（壁厚系列）
const wallThicknessBatchEditForm = reactive({})

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

// ========== 标准规范图片相关方法 ==========
const openStandardImageDialog = () => {
  standardImageDialogVisible.value = true
  imageLoading.value = true
  imageLoaded.value = false
  imageError.value = false
  imageDimensions.value = { width: 0, height: 0 }
}

const handleImageLoad = (event) => {
  imageLoading.value = false
  imageLoaded.value = true
  imageError.value = false
  imageDimensions.value = {
    width: event.target.naturalWidth,
    height: event.target.naturalHeight
  }
  console.log('图片加载成功，尺寸:', imageDimensions.value)
}

const handleImageError = () => {
  imageLoading.value = false
  imageLoaded.value = false
  imageError.value = true
  ElMessage.error('标准规范图片加载失败，请检查文件路径')
  console.error('图片加载失败，路径:', standardImagePath.value)
}

const downloadImage = () => {
  if (imageError.value) return
  
  try {
    const link = document.createElement('a')
    link.href = standardImagePath.value
    link.download = '管子设计惯例6M241000TB.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('图片下载开始')
  } catch (error) {
    ElMessage.error('图片下载失败')
    console.error('下载图片时出错:', error)
  }
}

// 处理节点点击
const handleNodeClick = (node) => {
  if (node.id !== 'basic') {
    currentNode.value = node
    // 切换节点时清空选中行
    bendPipeSelectedRows.value = []
    wallThicknessSelectedRows.value = []
  }
}

// ========== 弯管数据方法 ==========
const toggleBendPipeEditMode = () => {
  bendPipeEditMode.value = !bendPipeEditMode.value
  if (!bendPipeEditMode.value) {
    bendPipeSelectedRows.value = []
  }
}

const handleBendPipeCellChange = (row, prop, index) => {
  console.log(`弯管数据行${index + 1}的${prop}字段修改为:`, row[prop])
}

const handleDeleteBendPipeRows = () => {
  if (bendPipeSelectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的行')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${bendPipeSelectedRows.value.length} 行数据吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const selectedIds = bendPipeSelectedRows.value.map(row => row.id)
    bendPipeData.value = bendPipeData.value.filter(row => !selectedIds.includes(row.id))
    
    // 重新排序ID
    bendPipeData.value.forEach((row, index) => {
      row.id = index + 1
    })
    
    ElMessage.success(`成功删除 ${selectedIds.length} 行数据`)
    bendPipeSelectedRows.value = []
  }).catch(() => {
    // 用户取消
  })
}

const handleAddBendPipeRow = () => {
  const newId = bendPipeData.value.length > 0 
    ? Math.max(...bendPipeData.value.map(item => item.id)) + 1 
    : 1
  
  const newRow = { id: newId }
  
  // 为每个列添加空值
  bendPipeColumns.value.forEach(col => {
    newRow[col.prop] = ''
  })
  
  // 设置默认值
  newRow.Diameter = ''
  newRow.unit = 'mm'
  newRow.series = ''
  newRow.outerDiameter = ''
  newRow.thickness = ''
  newRow.material = ''
  
  bendPipeData.value.push(newRow)
  
  ElMessage.success('新增一行成功')
  
  nextTick(() => {
    if (bendPipeTableRef.value) {
      bendPipeTableRef.value.scrollTo({ top: bendPipeTableRef.value.$el.scrollHeight })
    }
  })
}

const handleAddBendPipeColumn = () => {
  Object.assign(bendPipeNewColumnForm, {
    label: '',
    prop: '',
    width: '',
    editable: true
  })
  bendPipeAddColumnDialogVisible.value = true
}

const confirmAddBendPipeColumn = () => {
  if (!bendPipeColumnFormRef.value) return
  
  bendPipeColumnFormRef.value.validate((valid) => {
    if (valid) {
      const newColumn = {
        prop: bendPipeNewColumnForm.prop,
        label: bendPipeNewColumnForm.label,
        width: bendPipeNewColumnForm.width || 'auto',
        editable: bendPipeNewColumnForm.editable
      }
      
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
      
      bendPipeAddColumnDialogVisible.value = false
      ElMessage.success('添加列成功')
    }
  })
}

const handleBendPipeAddColumnDialogClose = () => {
  if (bendPipeColumnFormRef.value) {
    bendPipeColumnFormRef.value.resetFields()
  }
}

const openBendPipeBatchEditDialog = () => {
  bendPipeColumns.value.forEach(col => {
    bendPipeBatchEditForm[col.prop] = ''
  })
  bendPipeBatchEditDialogVisible.value = true
}

const confirmBendPipeBatchEdit = () => {
  bendPipeSelectedRows.value.forEach(row => {
    bendPipeColumns.value.forEach(col => {
      if (bendPipeBatchEditForm[col.prop]) {
        row[col.prop] = bendPipeBatchEditForm[col.prop]
      }
    })
  })
  
  bendPipeBatchEditDialogVisible.value = false
  ElMessage.success(`已批量更新 ${bendPipeSelectedRows.value.length} 行数据`)
  
  // 清空表单
  bendPipeColumns.value.forEach(col => {
    bendPipeBatchEditForm[col.prop] = ''
  })
}

const handleSaveBendPipe = () => {
  ElMessageBox.confirm(
    '确定要保存弯管数据的所有更改吗？',
    '保存确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    setTimeout(() => {
      ElMessage.success('弯管数据保存成功')
      bendPipeEditMode.value = false
      bendPipeSelectedRows.value = []
    }, 500)
  }).catch(() => {
    // 用户取消
  })
}

const handleBendPipeSelectionChange = (selection) => {
  bendPipeSelectedRows.value = selection
}

// ========== 壁厚系列方法 ==========
const toggleWallThicknessEditMode = () => {
  wallThicknessEditMode.value = !wallThicknessEditMode.value
  if (!wallThicknessEditMode.value) {
    wallThicknessSelectedRows.value = []
  }
}

const handleWallThicknessCellChange = (row, prop, index) => {
  console.log(`壁厚系列行${index + 1}的${prop}字段修改为:`, row[prop])
}

const handleDeleteWallThicknessRows = () => {
  if (wallThicknessSelectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的行')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${wallThicknessSelectedRows.value.length} 行数据吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const selectedIds = wallThicknessSelectedRows.value.map(row => row.id)
    wallThicknessData.value = wallThicknessData.value.filter(row => !selectedIds.includes(row.id))
    
    // 重新排序ID
    wallThicknessData.value.forEach((row, index) => {
      row.id = index + 1
    })
    
    ElMessage.success(`成功删除 ${selectedIds.length} 行数据`)
    wallThicknessSelectedRows.value = []
  }).catch(() => {
    // 用户取消
  })
}

const handleAddWallThicknessRow = () => {
  const newId = wallThicknessData.value.length > 0 
    ? Math.max(...wallThicknessData.value.map(item => item.id)) + 1 
    : 1
  
  const newRow = { id: newId }
  
  // 为每个列添加空值
  wallThicknessColumns.value.forEach(col => {
    newRow[col.prop] = ''
  })
  
  // 设置默认值
  newRow.Diameter = ''
  newRow.unit = 'mm'
  newRow.material = ''
  newRow.l1 = ''
  newRow.l2 = ''
  
  wallThicknessData.value.push(newRow)
  
  ElMessage.success('新增一行成功')
  
  nextTick(() => {
    if (wallThicknessTableRef.value) {
      wallThicknessTableRef.value.scrollTo({ top: wallThicknessTableRef.value.$el.scrollHeight })
    }
  })
}

const handleAddWallThicknessColumn = () => {
  Object.assign(wallThicknessNewColumnForm, {
    label: '',
    prop: '',
    width: '',
    editable: true
  })
  wallThicknessAddColumnDialogVisible.value = true
}

const confirmAddWallThicknessColumn = () => {
  if (!wallThicknessColumnFormRef.value) return
  
  wallThicknessColumnFormRef.value.validate((valid) => {
    if (valid) {
      const newColumn = {
        prop: wallThicknessNewColumnForm.prop,
        label: wallThicknessNewColumnForm.label,
        width: wallThicknessNewColumnForm.width || 'auto',
        editable: wallThicknessNewColumnForm.editable
      }
      
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
      
      wallThicknessAddColumnDialogVisible.value = false
      ElMessage.success('添加列成功')
    }
  })
}

const handleWallThicknessAddColumnDialogClose = () => {
  if (wallThicknessColumnFormRef.value) {
    wallThicknessColumnFormRef.value.resetFields()
  }
}

const openWallThicknessBatchEditDialog = () => {
  wallThicknessColumns.value.forEach(col => {
    wallThicknessBatchEditForm[col.prop] = ''
  })
  wallThicknessBatchEditDialogVisible.value = true
}

const confirmWallThicknessBatchEdit = () => {
  wallThicknessSelectedRows.value.forEach(row => {
    wallThicknessColumns.value.forEach(col => {
      if (wallThicknessBatchEditForm[col.prop]) {
        row[col.prop] = wallThicknessBatchEditForm[col.prop]
      }
    })
  })
  
  wallThicknessBatchEditDialogVisible.value = false
  ElMessage.success(`已批量更新 ${wallThicknessSelectedRows.value.length} 行数据`)
  
  // 清空表单
  wallThicknessColumns.value.forEach(col => {
    wallThicknessBatchEditForm[col.prop] = ''
  })
}

const handleSaveWallThickness = () => {
  ElMessageBox.confirm(
    '确定要保存壁厚系列的所有更改吗？',
    '保存确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }
  ).then(() => {
    setTimeout(() => {
      ElMessage.success('壁厚系列保存成功')
      wallThicknessEditMode.value = false
      wallThicknessSelectedRows.value = []
    }, 500)
  }).catch(() => {
    // 用户取消
  })
}

const handleWallThicknessSelectionChange = (selection) => {
  wallThicknessSelectedRows.value = selection
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

/* 标准规范点击样式 */
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

/* 表格容器 */
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

/* 标准图片对话框样式 */
:deep(.standard-image-dialog .el-dialog__body) {
  padding: 0;
}

.image-container {
  display: flex;
  flex-direction: column;
  height: 70vh;
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
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-loading,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  padding: 40px;
}

.loading-icon {
  font-size: 36px;
  margin-bottom: 16px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 36px;
  margin-bottom: 16px;
  color: #f56c6c;
}

.error-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
  max-width: 300px;
}

.image-footer {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafafa;
}

.image-title {
  font-weight: 500;
  color: #303133;
}

.image-size {
  font-size: 12px;
  color: #909399;
}
</style>