<template>
  <div class="basic-config-container">
    <div class="basic-config-content">
      <!-- 左侧目录树 -->
      <div class="basic-config-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <span v-show="!sidebarCollapsed">目录</span>
          <el-button 
            class="collapse-btn" 
            @click="toggleSidebar"
            circle
            size="small"
          >
            <el-icon><ArrowLeft v-if="!sidebarCollapsed" /><ArrowRight v-else /></el-icon>
          </el-button>
        </div>
        <div class="sidebar-tree" v-show="!sidebarCollapsed">
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
            <div class="action-buttons" v-if="currentConfig.id !== 'shortcode-major'">
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
              :row-class-name="tableRowClassName"
              @row-dblclick="(row) => handleRowDblClick(row)"
              @selection-change="(val) => handleSelectionChange(currentConfig.id, val)"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column type="index" label="序号" width="60" align="center" />
              
              <template v-for="col in currentConfig.columns" :key="col.prop">
                <el-table-column
                  v-if="!col.hidden"
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width || 'auto'"
                  min-width="120"
                  align="center"
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
      width="60%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="batch-add-toolbar" style="margin-bottom: 10px;">
        <el-button type="primary" @click="handleAddBatchRow">
          <el-icon><Plus /></el-icon> 增加一行
        </el-button>
      </div>
      
      <el-table :data="batchAddData" border stripe height="auto">
        
        <template v-if="currentConfig">
          <el-table-column 
            v-for="col in currentConfig.columns" 
            :key="col.prop" 
            :label="col.label"
            :prop="col.prop"
            header-align="center"
            align="center"
          >
            <template #default="{ row }">
              <div v-if="col.prop === 'status'" style="display: flex; align-items: center; justify-content: center;">
                <el-switch
                  v-model="row[col.prop]"
                  :active-value="true"
                  :inactive-value="false"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                />
              </div>
              <template v-else-if="currentConfig?.id === 'wall-thickness-series' && col.prop === 'scheduleThickness'">
                <el-select v-model="row[col.prop]" size="small" style="width: 100%;">
                  <el-option
                    v-for="opt in WALL_THICKNESS_SCHEDULE_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
              <template v-else-if="currentConfig?.id === 'wall-thickness-series' && col.prop === 'endStandard'">
                <el-select v-model="row[col.prop]" size="small" style="width: 100%;">
                  <el-option
                    v-for="opt in END_STANDARD_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
              <template v-else-if="currentConfig?.id === 'bend-parameter' && col.prop === 'mainMaterial'">
                <el-select v-model="row[col.prop]" size="small" style="width: 100%;">
                  <el-option
                    v-for="opt in MATERIAL_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
              <template v-else-if="currentConfig?.id === 'bend-parameter' && col.prop === 'scheduleThickness'">
                <el-select v-model="row[col.prop]" size="small" style="width: 100%;">
                  <el-option
                    v-for="opt in WALL_THICKNESS_SCHEDULE_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
              <el-input v-else v-model="row[col.prop]" size="small" />
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
          <el-table-column :label="col.label" :prop="col.prop" align="center">
            <template #default>
              <div v-if="col.prop === 'status'" style="display: flex; align-items: center; justify-content: center;">
                <el-switch
                  v-model="editRowData[col.prop]"
                  :active-value="true"
                  :inactive-value="false"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                />
              </div>
              <template v-else-if="currentConfig?.id === 'wall-thickness-series' && col.prop === 'scheduleThickness'">
                <el-select v-model="editRowData[col.prop]" size="small" style="width: 100%;">
                  <el-option
                    v-for="opt in WALL_THICKNESS_SCHEDULE_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
              <template v-else-if="currentConfig?.id === 'wall-thickness-series' && col.prop === 'endStandard'">
                <el-select v-model="editRowData[col.prop]" size="small" style="width: 100%;">
                  <el-option
                    v-for="opt in END_STANDARD_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
              <template v-else-if="currentConfig?.id === 'bend-parameter' && col.prop === 'mainMaterial'">
                <el-select v-model="editRowData[col.prop]" size="small" style="width: 100%;">
                  <el-option
                    v-for="opt in MATERIAL_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.label"
                  />
                </el-select>
              </template>
              <template v-else-if="currentConfig?.id === 'bend-parameter' && col.prop === 'scheduleThickness'">
                <el-select v-model="editRowData[col.prop]" size="small" style="width: 100%;">
                  <el-option
                    v-for="opt in WALL_THICKNESS_SCHEDULE_OPTIONS"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.label"
                  />
                </el-select>
              </template>
              <el-input v-else v-model="editRowData[col.prop]" size="small" />
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

const sidebarCollapsed = ref(false)
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const LOCAL_COLUMNS = {
  'bend-pipe': [
    { prop: 'MachineNum', label: '机器号', editable: true },
    { prop: 'outSideDiameter', label: '外径', editable: false },
    { prop: 'outSideDiameterUnit', label: '外径单位', editable: false },
    { prop: 'headerClampLength', label: '前夹长L1', editable: false },
    { prop: 'tailClampLength', label: '后夹长L2', editable: false },
    { prop: 'status', label: '状态', editable: true, type: 'status', hidden: true }
  ],
  'bend-parameter': [
    { prop: 'mainMaterial', label: '主材料', editable: true },
    { prop: 'npd', label: '通径DN', editable: true },
    { prop: 'ndpunit', label: '通径单位', editable: true },
    { prop: 'scheduleThickness', label: '壁厚等级', editable: true },
    { prop: 'bendRadius', label: '弯曲半径', editable: true },
    { prop: 'status', label: '状态', editable: true, type: 'status', hidden: true }
  ],
  'wall-thickness-series': [
    { prop: 'npd', label: '通径DN', editable: true },
    { prop: 'ndpunit', label: '通径单位', editable: true },
    { prop: 'scheduleThickness', label: '壁厚等级', editable: true },
    { prop: 'endStandard', label: 'EndStandard', editable: true },
    { prop: 'pipingOutsideDiameter', label: '外径mm', editable: true },
    { prop: 'wallThickness', label: '壁厚值', editable: true },
    { prop: 'status', label: '状态', editable: true, type: 'status', hidden: true }
  ],
  'shortcode': [
    { prop: 'shortCodeHierarchyType', label: 'ShortCodeHierarchyType', editable: true },
    { prop: 'shortCode', label: 'ShortCode', editable: true }
  ],
  'shortcode-major': [
    { prop: 'ShortCodeHierarchyTypeShortDescription', label: 'ShortCodeHierarchyTypeShortDescription', editable: false },
    { prop: 'ShortCodeHierarchyTypeLongDescription', label: 'ShortCodeHierarchyTypeLongDescription', editable: false }
  ],
  'spec': [
    { prop: 'shortcode', label: 'ShortCode', editable: true },
    { prop: 'type', label: 'GeometricIndustryStandard', editable: true },
    { prop: 'type', label: 'CommodityCode', editable: true }
  ]
}

const LOCAL_TITLES = {
  'bend-pipe': '部件库名称：PlainPipingGenericData',
  'bend-parameter': '部件库名称：PipingBendParameterCodeConverted',
  'wall-thickness-series': '部件库名称：PlainPipingGenericData',
  'shortcode': '部件库名称：ShortCodeHierarchyRule',
  'spec': '部件库名称：PipingCommodityFilter'
}

const WALL_THICKNESS_SCHEDULE_OPTIONS = [
  { label: 'SCHSTD', value: '10001' },
  { label: 'SCH20', value: '10002' },
  { label: 'SCH30', value: '10003' },
  { label: 'SCH40', value: '10004' },
  { label: 'SCH80', value: '10005' },
  { label: 'SCHXS', value: '10006' },
  { label: 'SCH100', value: '10007' },
  { label: 'SCH120', value: '10008' },
  { label: 'SCH160', value: '10009' },
  { label: 'SCH5S', value: '10010' },
  { label: 'SCH10S', value: '10011' },
  { label: 'SCH20S', value: '10012' },
  { label: 'SCH40S', value: '10013' },
  { label: 'SCH80S', value: '10014' },
  { label: 'SCHXXS', value: '10015' },
  { label: '1.0Mpa', value: '10016' },
  { label: '4.0Mpa', value: '10017' },
  { label: '7.0Mpa', value: '10018' },
  { label: '14.0Mpa', value: '10019' }
]

const END_STANDARD_OPTIONS = [
  { label: 'GB/T 14976-2012', value: '10001' },
  { label: 'GB/T 8163-2018', value: '10002' },
  { label: 'GB/T 12459-2017', value: '10003' }
]

const MATERIAL_OPTIONS = [
  { label: '碳钢管', value: '10001' },
  { label: '不锈钢', value: '10002' },
  { label: '双相不锈钢', value: '10003' },
  { label: '超级奥氏体不锈钢 SMO254', value: '10004' },
  { label: '耐高温钢 15CRMOR', value: '10005' },
  { label: '纯钛管', value: '10006' },
  { label: '铜管', value: '10007' },
  { label: 'GRE', value: '10008' },
  { label: '塑料', value: '10009' },
  { label: '铜镍', value: '10010' }
]

const getScheduleCode = (v) => {
  const s = String(v ?? '')
  const found = WALL_THICKNESS_SCHEDULE_OPTIONS.find(o => o.value === s || o.label === s)
  return found ? found.value : s
}

const getEndStandardCode = (v) => {
  const s = String(v ?? '')
  const found = END_STANDARD_OPTIONS.find(o => o.value === s || o.label === s)
  return found ? found.value : s
}

const getMaterialCode = (v) => {
  const s = String(v ?? '')
  const found = MATERIAL_OPTIONS.find(o => o.value === s || o.label === s)
  return found ? found.value : s
}

const toBool = (v) => v === true || v === 1 || v === '1' || v === 'true'

const getRowsFromResponse = (res) => {
  const payload = res?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (payload?.code === 200 && Array.isArray(payload?.data)) return payload.data
  return []
}

const scrollTableToBottom = () => {
  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap') 
                      || document.querySelector('.el-table__body-wrapper')
    if (tableBody) {
      tableBody.scrollTop = tableBody.scrollHeight
    }
  }, 100)
}

// 树形数据
const treeData = ref([
  {
    id: 'basic',
    label: '设计规则类',
    icon: Folder,
    children: [
      { id: 'bend-parameter', label: '弯管参数', icon: Document },
      { id: 'wall-thickness-series', label: '壁厚等级', icon: Document },
      { id: 'shortcode-major', label: 'ShortCode大类', icon: Document },
      { id: 'shortcode', label: 'ShortCode细类', icon: Document },
      { id: 'spec', label: 'Spec', icon: Document }
    ]
  },
  {
    id: 'production',
    label: '生产规则类',
    icon: Folder,
    children: [
      { id: 'bend-pipe', label: '弯管机数据', icon: Document }
    ]
  }
])

// 当前选中的节点
const currentNode = ref(treeData.value[0].children[0])

// 配置数据
const configs = reactive({})

// 初始化所有配置
const initializeConfigs = () => {
  const configIds = ['bend-pipe', 'bend-parameter', 'wall-thickness-series', 'shortcode','spec']
  
  configIds.forEach(configId => {
    if (db[configId]) {
      const mockData = Mock.mock(db[configId])
      
      configs[configId] = {
        id: configId,
        title: LOCAL_TITLES[configId] || mockData.title || configId,
        selectedRows: [],
        columns: (LOCAL_COLUMNS[configId] || (mockData.columns || [])).map(col => ({
          ...col,
          editable: col.editable !== undefined ? col.editable : true
        })),
        data: mockData.data || []
      }
    } else {
      // 如果db中没有找到配置，使用默认数据
      console.warn(`配置 ${configId} 未在 db 中找到`)
      configs[configId] = {
        id: configId,
        title: LOCAL_TITLES[configId] || configId,
        selectedRows: [],
        columns: (LOCAL_COLUMNS[configId] || []).map(col => ({
          ...col,
          editable: col.editable !== undefined ? col.editable : true
        })),
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
const tableRowClassName = ({ row }) => {
  const disabled = row?.status === 0 
    || row?.status === false 
    || row?.status === '0' 
    || row?.status === 'false'
  return disabled ? 'disabled-row' : ''
}

const handleNodeClick = (node) => {
  if (node.id !== 'basic') {
    if (!configs[node.id]) {
      if (node.id === 'shortcode-major') {
        let source = null
        if (db['shortcode']) {
          source = Mock.mock(db['shortcode'])
        }
        const baseRows = Array.isArray(source?.data) ? source.data : []
        configs['shortcode-major'] = {
          id: 'shortcode-major',
          title: '部件库名称：ShortCodeHierarchyRule',
          selectedRows: [],
          columns: (LOCAL_COLUMNS['shortcode-major'] || []).map(col => ({
            ...col,
            editable: col.editable !== undefined ? col.editable : true
          })),
          data: baseRows.map((item, index) => ({
            id: item.id ?? index + 1,
            ShortCodeHierarchyTypeShortDescription: item.type ?? '',
            ShortCodeHierarchyTypeLongDescription: item.shortcode ?? ''
          }))
        }
      } else if (db[node.id]) {
        const mockData = Mock.mock(db[node.id])
        configs[node.id] = {
          id: node.id,
          title: mockData.title || node.id,
          selectedRows: [],
          columns: (LOCAL_COLUMNS[node.id] || (mockData.columns || [])).map(col => ({
            ...col,
            editable: col.editable !== undefined ? col.editable : true
          })),
          data: mockData.data || []
        }
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
    if (configId === 'bend-pipe') {
      try {
        const deletePromises = config.selectedRows.map(row => 
          axios.delete(`/api/DspSpmcDictPipingBendData/${row.id}`)
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

    if (configId === 'wall-thickness-series') {
      try {
        const deletePromises = config.selectedRows.map(row => 
          axios.delete(`/api/S3dDictWallThickness/${row.id}`)
        )
        await Promise.all(deletePromises)
        ElMessage.success(`成功删除 ${config.selectedRows.length} 行数据`)
        // 刷新数据
        await fetchWallThicknessData()
        config.selectedRows = []
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败，请重试')
      }
      return
    }

    if (configId === 'bend-parameter') {
      try {
        const deletePromises = config.selectedRows.map(row =>
          axios.delete(`/api/S3dRulePipingBendParameter/${row.id}`)
        )
        await Promise.all(deletePromises)
        ElMessage.success(`成功删除 ${config.selectedRows.length} 行数据`)
        await fetchBendParameterData()
        config.selectedRows = []
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败，请重试')
      }
      return
    }

    if (configId === 'shortcode') {
      try {
        const deletePromises = config.selectedRows.map(row =>
          axios.delete(`/api/S3dRuleShortCodeHierarchyRule/${row.id}`)
        )
        await Promise.all(deletePromises)
        ElMessage.success(`成功删除 ${config.selectedRows.length} 行数据`)
        await fetchShortCodeMinorData()
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
    newRow[col.prop] = col.prop === 'status' ? true : ''
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

  // 1. 获取用于去重的关键列（排除 status 和 id）
  const keyColumns = config.columns.filter(c => c.prop !== 'id' && c.prop !== 'status')

  // 辅助函数：生成行指纹
  const getRowFingerprint = (row) => {
    return keyColumns.map(col => {
      let val = row[col.prop]
      if (config.id === 'wall-thickness-series') {
        if (col.prop === 'scheduleThickness') val = getScheduleCode(val)
        if (col.prop === 'endStandard') val = getEndStandardCode(val)
      }
      return String(val ?? '').trim()
    }).join('|')
  }

  // 2. 批量数据内部去重
  const uniqueBatchData = []
  const batchFingerprints = new Set()
  let duplicateInBatchCount = 0

  for (const row of batchAddData.value) {
    const fp = getRowFingerprint(row)
    if (batchFingerprints.has(fp)) {
      duplicateInBatchCount++
    } else {
      batchFingerprints.add(fp)
      uniqueBatchData.push(row)
    }
  }

  if (duplicateInBatchCount > 0) {
    ElMessage.warning(`检测到批量新增列表中有 ${duplicateInBatchCount} 条重复数据，已自动过滤`)
  }

  // 3. 与现有数据对比去重
  const existingFingerprints = new Set(config.data.map(r => getRowFingerprint(r)))
  const finalRowsToAdd = uniqueBatchData.filter(row => {
    const fp = getRowFingerprint(row)
    return !existingFingerprints.has(fp)
  })

  if (finalRowsToAdd.length === 0) {
    ElMessage.warning('所有新增数据已存在于数据库中，无需添加')
    return
  }
  
  if (finalRowsToAdd.length < uniqueBatchData.length) {
    ElMessage.info(`检测到 ${uniqueBatchData.length - finalRowsToAdd.length} 条数据已存在，将跳过这些数据`)
  }

  batchSaveLoading.value = true
  
  try {
    if (config.id === 'bend-pipe') {
      let successCount = 0
      let failCount = 0
      
      // 按顺序执行新增
      for (const row of finalRowsToAdd) {
        try {
          const payload = {
            ...row,
            outSideDiameter: Number(row.outSideDiameter) || 0,
            headerClampLength: Number(row.headerClampLength) || 0,
            tailClampLength: Number(row.tailClampLength) || 0,
            status: toBool(row.status ?? true)
          }
          await axios.post('/api/DspSpmcDictPipingBendData', payload)
          successCount++
        } catch (e) {
          console.error('新增单行失败:', e)
          failCount++
        }
      }
      
      await fetchBendPipeData()
      if (successCount > 0) {
        ElMessage.success(`成功添加 ${successCount} 条数据${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
      } else {
        ElMessage.error('批量新增全部失败，请检查数据或网络')
      }
      scrollTableToBottom()
    } else if (config.id === 'wall-thickness-series') {
      let successCount = 0
      let failCount = 0
      
      // 按顺序执行新增
      for (const row of finalRowsToAdd) {
        try {
          const payload = {
            ...row,
            npd: String(row.npd || ''),
            ndpunit: String(row.ndpunit || ''),
            scheduleThicknessCl: getScheduleCode(row.scheduleThickness),
            endStandardCl: getEndStandardCode(row.endStandard),
            pipingOutsideDiameter: Number(row.pipingOutsideDiameter) || 0,
            wallThickness: Number(row.wallThickness) || 0,
            status: toBool(row.status ?? true)
          }
          await axios.post('/api/S3dDictWallThickness', payload)
          successCount++
        } catch (e) {
          console.error('新增单行失败:', e)
          failCount++
        }
      }

      await fetchWallThicknessData()
      if (successCount > 0) {
        ElMessage.success(`成功添加 ${successCount} 条数据${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
      } else {
        ElMessage.error('批量新增全部失败，请检查数据或网络')
      }
      scrollTableToBottom()
    } else if (config.id === 'bend-parameter') {
      let successCount = 0
      let failCount = 0

      for (const row of finalRowsToAdd) {
        try {
          const payload = {
            ...row,
            materialsCategoryCl: getMaterialCode(row.mainMaterial),
            normalDiameter: String(row.npd || ''),
            unitType: String(row.ndpunit || ''),
            scheduleThicknessCl: getScheduleCode(row.scheduleThickness),
            bendRadiusMultiplier: Number(row.bendRadius) || 0,
            status: toBool(row.status ?? true)
          }
          await axios.post('/api/S3dRulePipingBendParameter', payload)
          successCount++
        } catch (e) {
          console.error('新增单行失败:', e)
          failCount++
        }
      }

      await fetchBendParameterData()
      if (successCount > 0) {
        ElMessage.success(`成功添加 ${successCount} 条数据${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
      } else {
        ElMessage.error('批量新增全部失败，请检查数据或网络')
      }
      scrollTableToBottom()
    } else if (config.id === 'shortcode') {
      let successCount = 0
      let failCount = 0

      for (const row of finalRowsToAdd) {
        try {
          const payload = {
            shortCodeHierarchyType: row.shortCodeHierarchyType,
            shortCode: row.shortCode
          }
          await axios.post('/api/S3dRuleShortCodeHierarchyRule', payload)
          successCount++
        } catch (e) {
          console.error('新增单行失败:', e)
          failCount++
        }
      }

      await fetchShortCodeMinorData()
      if (successCount > 0) {
        ElMessage.success(`成功添加 ${successCount} 条数据${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
      } else {
        ElMessage.error('批量新增全部失败，请检查数据或网络')
      }
      scrollTableToBottom()
    } else {
      let newId = config.data.length > 0 
        ? Math.max(...config.data.map(item => item.id)) + 1 
        : 1

      const newRows = batchAddData.value.map((row, index) => ({
        ...row,
        id: newId + index
      }))

      config.data.push(...newRows)
      ElMessage.success(`成功添加 ${batchAddData.value.length} 条数据`)

      scrollTableToBottom()
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
  if (config.id === 'shortcode-major') return
  editRowData.value = { ...row }
  if (config.id === 'wall-thickness-series') {
    editRowData.value.scheduleThickness = getScheduleCode(editRowData.value.scheduleThickness)
    editRowData.value.endStandard = getEndStandardCode(editRowData.value.endStandard)
  }
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
        tailClampLength: Number(editRowData.value.tailClampLength) || 0,
        status: toBool(editRowData.value.status)
      }
      await axios.put('/api/DspSpmcDictPipingBendData', payload)
      await fetchBendPipeData()
      ElMessage.success('更新成功')
    } else if (config.id === 'wall-thickness-series') {
      const payload = {
        ...editRowData.value,
        npd: String(editRowData.value.npd || ''),
        ndpunit: String(editRowData.value.ndpunit || ''),
        scheduleThicknessCl: getScheduleCode(editRowData.value.scheduleThickness),
        endStandardCl: getEndStandardCode(editRowData.value.endStandard),
        pipingOutsideDiameter: Number(editRowData.value.pipingOutsideDiameter) || 0,
        wallThickness: Number(editRowData.value.wallThickness) || 0,
        status: toBool(editRowData.value.status)
      }
      await axios.put('/api/S3dDictWallThickness', payload)
      await fetchWallThicknessData()
      ElMessage.success('更新成功')
    } else if (config.id === 'bend-parameter') {
      const payload = {
        ...editRowData.value,
        materialsCategoryCl: getMaterialCode(editRowData.value.mainMaterial),
        normalDiameter: String(editRowData.value.npd || ''),
        unitType: String(editRowData.value.ndpunit || ''),
        scheduleThicknessCl: getScheduleCode(editRowData.value.scheduleThickness),
        bendRadiusMultiplier: Number(editRowData.value.bendRadius) || 0,
        status: toBool(editRowData.value.status)
      }
      await axios.put('/api/S3dRulePipingBendParameter', payload)
      await fetchBendParameterData()
      ElMessage.success('更新成功')
    } else if (config.id === 'shortcode') {
      const payload = {
        ...editRowData.value
      }
      await axios.put('/api/S3dRuleShortCodeHierarchyRule', payload)
      await fetchShortCodeMinorData()
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
    const res = await axios.get('/api/DspSpmcDictPipingBendData')
    let rows = getRowsFromResponse(res)
    rows.forEach(row => {
      if (row.status === undefined) {
        row.status = true
      } else {
        row.status = toBool(row.status)
      }
      if (row.MachineNum === undefined) {
        row.MachineNum = row.machineNum ?? row.machineNumber ?? ''
      }
    })
    const cfg = configs['bend-pipe'] || {
      id: 'bend-pipe',
      title: LOCAL_TITLES['bend-pipe'] || '弯管机数据',
      selectedRows: [],
      columns: [],
      data: []
    }
    cfg.columns = LOCAL_COLUMNS['bend-pipe'] || []
    cfg.data = rows
    configs['bend-pipe'] = cfg
  } catch (e) {
    ElMessage.error(`弯管机数据接口请求失败：${e?.message || '网络错误'}`)
  }
}

const fetchShortCodeMinorData = async () => {
  try {
    const res = await axios.get('/api/S3dRuleShortCodeHierarchyRule')
    let rows = getRowsFromResponse(res)
    rows = rows.map((r, idx) => ({
      id: r.id ?? idx + 1,
      shortCodeHierarchyType: r.shortCodeHierarchyType ?? r.ShortCodeHierarchyType ?? '',
      shortCode: r.shortCode ?? r.ShortCode ?? ''
    }))
    const cfg = configs['shortcode'] || {
      id: 'shortcode',
      title: LOCAL_TITLES['shortcode'] || '部件库名称：ShortCodeHierarchyRule',
      selectedRows: [],
      columns: [],
      data: []
    }
    cfg.columns = LOCAL_COLUMNS['shortcode'] || []
    cfg.data = rows
    configs['shortcode'] = cfg
  } catch (e) {
    ElMessage.error(`ShortCode细类接口请求失败：${e?.message || '网络错误'}`)
  }
}

const fetchBendParameterData = async () => {
  try {
    const res = await axios.get('/api/PipingBendParameterCodeConverted')
    let rows = getRowsFromResponse(res)
    rows = rows.map((r, idx) => {
      const row = {
        id: r.id ?? idx + 1,
        mainMaterial: r.materialsCategory ?? '',
        npd: r.normalDiameter ?? '',
        ndpunit: r.unitType ?? '',
        scheduleThickness: r.scheduleThickness ?? r.ScheduleThickness ?? r.schedule ?? '',
        bendRadius: r.bendRadiusMultiplier ?? ''
      }
      if (r.status === undefined) {
        row.status = true
      } else {
        row.status = toBool(r.status)
      }
      return row
    })
    const cfg = configs['bend-parameter'] || {
      id: 'bend-parameter',
      title: LOCAL_TITLES['bend-parameter'] || '弯管参数',
      selectedRows: [],
      columns: [],
      data: []
    }
    cfg.columns = LOCAL_COLUMNS['bend-parameter'] || []
    cfg.data = rows
    configs['bend-parameter'] = cfg
  } catch (e) {
    ElMessage.error(`弯管参数接口请求失败：${e?.message || '网络错误'}`)
  }
}

const fetchWallThicknessData = async () => {
  try {
    const res = await axios.get('/api/WallThicknessCodeConverted')
    let rows = getRowsFromResponse(res)
    rows.forEach(r => {
      if (r.status === undefined) {
        r.status = true
      } else {
        r.status = toBool(r.status)
      }
    })
    const cfg = configs['wall-thickness-series'] || {
      id: 'wall-thickness-series',
      title: LOCAL_TITLES['wall-thickness-series'] || '壁厚等级',
      selectedRows: [],
      columns: [],
      data: []
    }
    cfg.columns = LOCAL_COLUMNS['wall-thickness-series'] || []
    cfg.data = rows
    configs['wall-thickness-series'] = cfg
  } catch (e) {
    ElMessage.error(`壁厚等级数据接口请求失败：${e?.message || '网络错误'}`)
  }
}

// 初始化
onMounted(() => {
  initializeConfigs()
  fetchBendPipeData()
  fetchBendParameterData()
  fetchWallThicknessData()
  fetchShortCodeMinorData()
})

watch(currentNode, (node) => {
  if (node?.id === 'bend-pipe') {
    fetchBendPipeData()
  } else if (node?.id === 'bend-parameter') {
    fetchBendParameterData()
  } else if (node?.id === 'wall-thickness-series') {
    fetchWallThicknessData()
  } else if (node?.id === 'shortcode') {
    fetchShortCodeMinorData()
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
  transition: width 0.2s ease;
}

.basic-config-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 16px 10px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
  color: #303133;
  background-color: #fafafa;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.collapse-btn {
  margin-left: 8px;
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

:deep(.el-table .disabled-row) {
  background-color: #fafafa;
  color: #c0c4cc;
  text-decoration: line-through;
}
</style>
