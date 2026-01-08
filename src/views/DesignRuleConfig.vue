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
                type="danger" 
                @click="handleDeleteRows(currentConfig.id)"
                :disabled="currentConfig.selectedRows.length === 0"
              >
                <el-icon><Delete /></el-icon>
                删除 ({{ currentConfig.selectedRows.length }})
              </el-button>

              <el-button 
                size="small" 
                type="primary" 
                @click="handleAddRow(currentConfig.id)"
                :disabled="!currentConfig.editMode"
              >
                <el-icon><Plus /></el-icon>
                新增
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
                    <template v-if="currentConfig.editMode">
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

const refreshConfigData = async (configId) => {
  if (configId === 'bend-pipe') {
    await fetchBendPipeData()
    return
  }
  try {
    const res = await axios.get(`/api/dict/${configId}`)
    if (res?.data?.code === 200) {
      const mockData = res.data.data || {}
      const cfg = configs[configId] || {
        id: configId,
        title: mockData.title || configId,
        editMode: false,
        selectedRows: [],
        columns: [],
        data: []
      }
      cfg.columns = (mockData.columns || []).map(col => ({
        ...col,
        editable: col.editable !== false
      }))
      cfg.data = mockData.data || []
      configs[configId] = cfg
    } else {
      ElMessage.error(res?.data?.message || '数据获取失败')
    }
  } catch (e) {
    ElMessage.error(e?.message || '网络错误')
  }
}

const toggleEditMode = async (configId) => {
  const config = configs[configId]
  if (!config) return
  if (!config.editMode) {
    config.editMode = true
    return
  }
  ElMessageBox.confirm(
    `确定要取消所有更改吗？`,
    '取消确认',
    { confirmButtonText: '确定', cancelButtonText: '保留', type: 'warning' }
  ).then(async () => {
    await refreshConfigData(configId)
    config.editMode = false
    config.selectedRows = []
    ElMessage.info('已取消更改并刷新数据')
  }).catch(() => {
    // 用户选择保留，不做任何操作，继续停留在编辑模式
  })
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

  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap') 
                      || document.querySelector('.el-table__body-wrapper')
    if (tableBody) {
      tableBody.scrollTop = tableBody.scrollHeight
    }
  }, 100)
}

 

const handleSave = async (configId) => {
  const config = configs[configId]
  if (!config) return
  
  ElMessageBox.confirm(
    `确定要保存所有更改吗？`,
    '保存确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
  ).then(async () => {
    try {
      // 这里可以添加保存到服务器的逻辑
      console.log('保存数据:', config)
      
      ElMessage.success(`保存成功`)
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

const fetchBendPipeData = async () => {
  try {
    const res = await axios.get('/api/DspSpmcDictPipingBend')
    if (res?.data?.code === 200) {
      const rows = Array.isArray(res.data.data) ? res.data.data : []
      const cfg = configs['bend-pipe'] || {
        id: 'bend-pipe',
        title: '弯管数据',
        editMode: false,
        selectedRows: [],
        columns: [],
        data: []
      }
      cfg.columns = [
        { prop: 'outSideDiameter', label: '通径DN', editable: false },
        { prop: 'outSideDiameterUnit', label: '通径单位', editable: false },
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
.app-container {
  padding: 20px;
}
</style>