<script setup>
import { ref, onMounted, computed, watch, reactive, onUnmounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight, Setting, Plus, Ship } from '@element-plus/icons-vue'
import PipeSpecConfigForm from '@/components/PipeSpecConfigForm.vue'    // 导入 PipeSpecConfigForm 组件，用于配置按钮的弹窗实现
import PipeSpecPreviewForm from '@/components/PipeSpecPreviewForm.vue'  // 导入规格书预览窗口组件
import PipeSpecNpdTable from '@/components/pipe-spec/PipeSpecNpdTable.vue'
import PipeSpecConfigButtons from '@/components/pipe-spec/PipeSpecConfigButtons.vue'
import PipeSpecTreeSearch from '@/components/pipe-spec/PipeSpecTreeSearch.vue'
import { pipeSpecConfigStore } from '@/constants/PipeSpec-item'  // 导入管道规格配置存储
import { usePmcTree } from '@/composables/usePmcTree'
import { usePmcDetails } from '@/composables/usePmcDetails'
import { useNpdTable } from '@/composables/useNpdTable'
import { usePreferredRule } from '@/composables/usePreferredRule'

// 树形数据 / 规则 / 表格 / 表单 逻辑
const {
  treeData,
  treeLoading,
  shipInfosLoading,
  selectedShipClass,
  selectedShipNumber,
  shipClasses,
  shipNumbers,
  fetchShipInfos
} = usePmcTree()

const {
  dimensionData,
  dimensionLoading,
  baseDimensionCache,
  columnCount,
  filteredNpdRanges,
  fetchDimensionData,
  setDimensionData,
  clearDimensionData,
  getCellStyle,
  handleCellClick
} = useNpdTable()

// 右键菜单相关状态
const contextMenuVisible = ref(false)
const contextMenuPosition = reactive({ x: 0, y: 0 })
const contextMenuTargetNode = ref(null)

// 计算属性：是否允许提交审核
const canSubmitReview = computed(() => {
  return contextMenuTargetNode.value && contextMenuTargetNode.value.status === 'review'
})

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 处理树节点右键点击
const handleNodeContextMenu = (event, data, node, component) => {
  // 仅对叶子节点（PMC编码）且有状态的节点显示菜单
  if (!data.status) {
    return
  }
  
  // 阻止默认浏览器菜单
  event.preventDefault()
  
  contextMenuTargetNode.value = data
  contextMenuPosition.x = event.clientX
  contextMenuPosition.y = event.clientY
  contextMenuVisible.value = true
}

// 提交审核
const handleSubmitReview = async () => {
  if (!canSubmitReview.value) return
  
  const nodeData = contextMenuTargetNode.value
  
  try {
    // 调用审核接口
    const res = await axios.post('/api/PmcSpec/AcceptReview', {
      pmcCode: nodeData.label,
      currentStatus: nodeData.status,
      shipType: nodeData.shipType,
      shipNumber: nodeData.shipNumber
    })
    
    if (res.data.code === 200) {
      ElMessage.success('审核提交成功')
      // 更新节点状态
      nodeData.status = res.data.data.status || 'approved'
      // 关闭菜单
      closeContextMenu()
    } else {
      ElMessage.error(res.data.msg || '审核提交失败')
    }
  } catch (error) {
    console.error('提交审核错误:', error)
    ElMessage.error('网络错误，提交审核失败')
  }
}

// 监听全局点击以关闭菜单
onMounted(() => {
  window.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', closeContextMenu)
})

const preferredRule = ref(null)

const {
  currentNode,
  formData,
  fetchPmcCodeDetails,
  handleNodeClick,
  configurations
} = usePmcDetails({
  fetchDimensionData,
  preferredRule,
  clearDimensionData
})

// 监听从后端获取的配置信息，更新界面
watch(configurations, (newConfigs) => {
  // 先清空现有配置
  pipeSpecConfigStore.clearAll()
  configButtons.value.forEach(btn => {
    btn.type = ''
    btn.typeId = null // 新增：重置 ID
    btn.configResult = ''
    btn.configData = null
  })

  if (newConfigs && newConfigs.length > 0) {
    newConfigs.forEach((config, index) => {
      // 构造符合前端存储结构的数据
      const configData = {
        componentTypeId: config.componentTypeId, // 新增：存储 componentTypeId
        partType: config.componentType,
        standardNames: [], 
        standardConfigurations: [],
        configurations: []
      }
      
      // 映射 fullConfig.standardFileConfigs 到前端 configurations
      if (config.fullConfig && config.fullConfig.standardFileConfigs) {
         configData.configurations = config.fullConfig.standardFileConfigs.map(s => ({
             standardFileName: s.standardFile, // 对应 API 的 standardFile (名称)
             materialName: s.material          // 对应 API 的 material (名称)
         }))
         
         // 同时填充标准配置和标准名称，以便表单回显
         configData.standardNames = config.fullConfig.standardFileConfigs.map(s => s.standardFile)
         configData.standardConfigurations = config.fullConfig.standardFileConfigs.map(s => ({
             standardName: s.standardFile,
             materialName: s.material
         }))
      }
      
      // 添加到存储
      pipeSpecConfigStore.addConfig(configData)
      
      // 更新按钮显示
      // 确保有足够的按钮
      if (index >= configButtons.value.length) {
        const newId = Math.max(...configButtons.value.map(btn => btn.id)) + 1
        configButtons.value.push({ id: newId, type: '', typeId: null, configResult: '' })
      }
      
      // 找到第 index 个按钮并更新
      const buttonId = configButtons.value[index].id
      updateConfigButton(configData, buttonId)
    })
  }
})

const {
  preferredRuleOptions,
  preferredRuleLoading,
  fetchPreferredRules
} = usePreferredRule({
  formData,
  fetchDimensionData,
  baseDimensionCache,
  setDimensionData,
  preferredRule
})

// 树形搜索相关
const filterText = ref('')
const treeRef = ref(null)

watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 使用computed缓存船型和船号名称，避免模板中重复计算
const currentShipClassName = computed(() => {
  if (!selectedShipClass.value || !shipClasses.value.length) return '-'
  return shipClasses.value.find(item => item.id === selectedShipClass.value)?.name || '-'
})

const currentShipNumberName = computed(() => {
  if (!selectedShipNumber.value || !shipNumbers.value.length) return '-'
  return shipNumbers.value.find(item => item.id === selectedShipNumber.value)?.name || '-'
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 配置按钮列表
const configButtons = ref([
  { id: 1, type: '', typeId: null, configResult: '', configData: null },
  { id: 2, type: '', typeId: null, configResult: '', configData: null },
  { id: 3, type: '', typeId: null, configResult: '', configData: null },
  { id: 4, type: '', typeId: null, configResult: '', configData: null }
])

// 当前选中的按钮ID
const currentButtonId = ref(null)

// 在组件挂载后初始化数据
onMounted(async () => {
  // 并行获取所有数据（树形数据在船号选择时加载，尺寸数据需要 Pipe 和 Wall Thickness 参数，在获取编码详情后加载）
  await Promise.all([
    fetchShipInfos(),
    fetchPreferredRules()
  ])
})

const showDialog = ref(false)
const currentConfigData = ref(null)

// 当前选中的按钮Label
const currentButtonLabel = ref('')

// 处理配置确认
const handleConfirm = (data) => {
  // 获取当前按钮的原有配置
  const currentButton = configButtons.value.find(btn => btn.id === currentButtonId.value)
  // 使用 componentTypeId 判断是否是对当前按钮的重新配置
  const isCurrentButtonReconfig = currentButton && 
                                  currentButton.typeId === data.componentTypeId && 
                                  currentButton.configResult
  
  // 检查部件类型是否已配置（排除当前正在编辑的按钮）
  // 使用 componentTypeId 进行匹配，更准确
  const existingButton = configButtons.value.find(btn => {
    return btn.typeId === data.componentTypeId && 
           btn.configResult && 
           btn.id !== currentButtonId.value
  })
  
  // 只有在其他按钮已配置了相同部件类型时才提示
  if (existingButton) {
    // 部件类型已配置在其他按钮上，询问用户是否重新配置
    ElMessageBox.confirm(
      `部件类型 "${data.partType}" 已经配置过了，是否重新配置该部件类型？`,
      '提示',
      {
        confirmButtonText: '重新配置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 用户确认重新配置
      const existingButtonIndex = configButtons.value.findIndex(btn => btn.id === existingButton.id)
      if (existingButtonIndex !== -1) {
        // 更新存储中的配置 - 使用 ID 更新
        pipeSpecConfigStore.updateConfigByComponentTypeId(data.componentTypeId, {
          partType: data.partType, // 确保名称也更新
          standardNames: data.standardNames || [],
          standardConfigurations: data.standardConfigurations || [],
          configurations: data.configurations
        })
        
        // 更新已存在的配置按钮
        updateConfigButton(data, existingButton.id)
        
        // 清空当前按钮
        const currentButtonIndex = configButtons.value.findIndex(btn => btn.id === currentButtonId.value)
        if (currentButtonIndex !== -1 && currentButtonId.value !== existingButton.id) {
          // 如果当前按钮有配置数据，从存储中删除
          const currentButton = configButtons.value[currentButtonIndex]
          if (currentButton.typeId && currentButton.configData && currentButton.typeId !== data.componentTypeId) {
            pipeSpecConfigStore.deleteConfigByComponentTypeId(currentButton.typeId)
          }
          configButtons.value[currentButtonIndex].type = ''
          configButtons.value[currentButtonIndex].typeId = null
          configButtons.value[currentButtonIndex].configResult = ''
          configButtons.value[currentButtonIndex].configData = null
        }
      }
      
      // 关闭对话框
      showDialog.value = false
      ElMessage.success('重新配置成功，已更新该部件类型的配置')
    }).catch(() => {
      // 用户取消，不做任何操作
      ElMessage.info('已取消操作')
    })
  } else {
    // 当前按钮是第一次配置或重新配置自己
    if (isCurrentButtonReconfig) {
      // 当前按钮重新配置，更新存储
      pipeSpecConfigStore.updateConfigByComponentTypeId(data.componentTypeId, {
        partType: data.partType,
        standardNames: data.standardNames || [],
        standardConfigurations: data.standardConfigurations || [],
        configurations: data.configurations
      })
    } else {
      // 全新配置，添加到存储
      pipeSpecConfigStore.addConfig({
        componentTypeId: data.componentTypeId, // 新增 ID
        partType: data.partType,
        standardNames: data.standardNames || [],
        standardConfigurations: data.standardConfigurations || [],
        configurations: data.configurations
      })
    }
    
    // 更新当前按钮
    updateConfigButton(data, currentButtonId.value)
    
    // 关闭对话框
    showDialog.value = false
  }
}

// 更新配置按钮的辅助方法
const updateConfigButton = (data, buttonId) => {
  // 将配置数据转换为指定格式的字符串
  const configStr = data.configurations.map(item => {
    // 基础配置信息
    return `${item.standardFileName} - ${item.materialName}`
  }).join('\n')
  
  // 根据按钮ID更新配置结果
  if (buttonId) {
    const buttonIndex = configButtons.value.findIndex(btn => btn.id === buttonId)
    if (buttonIndex !== -1) {
      configButtons.value[buttonIndex].type = data.partType
      configButtons.value[buttonIndex].typeId = data.componentTypeId // 新增：存储 ID
      configButtons.value[buttonIndex].configResult = configStr
      
      // 将按钮ID与配置存储中的ID关联
      // 存储完整的配置数据到按钮对象中，方便后续使用
      configButtons.value[buttonIndex].configData = {
        componentTypeId: data.componentTypeId, // 新增：存储 ID
        partType: data.partType,
        standardNames: data.standardNames || [],
        standardConfigurations: data.standardConfigurations || [],
        configurations: data.configurations
      }
      
      // 检查是否需要添加新按钮
      const hasEmptyButton = configButtons.value.some(btn => !btn.type && !btn.configResult)
      if (!hasEmptyButton) {
        const newId = Math.max(...configButtons.value.map(btn => btn.id)) + 1
        configButtons.value.push({ id: newId, type: '', typeId: null, configResult: '' })
      }
    }
  }
}

// 检查部件类型是否已配置
const isPartTypeConfigured = (partType) => {
  if (!partType) return false
  return configButtons.value.some(btn => btn.type === partType && btn.configResult)
}

// 获取已配置的部件类型对应的按钮
const getConfiguredButtonByPartType = (partType) => {
  return configButtons.value.find(btn => btn.type === partType && btn.configResult)
}

// 处理配置按钮点击
const handleConfigClick = (buttonId) => {
  // 检查是否选择了有效的PMC编码（7位编码）
  if (!currentNode.value.label || currentNode.value.label.length !== 7) {
    ElMessage.warning('请先在左侧PMC编码列表中选择对应的PMC编码')
    return
  }
  
  currentButtonId.value = buttonId
  
  // 获取当前按钮的配置数据并传递给子组件
  const btn = configButtons.value.find(b => b.id === buttonId)
  if (btn && btn.configData) {
    currentConfigData.value = JSON.parse(JSON.stringify(btn.configData))
  } else {
    currentConfigData.value = null
  }
  
  showDialog.value = true
}

// 规格书预览窗口显示状态
const showPreviewDialog = ref(false)

// 处理生成规格书按钮点击
const handleGenerateSpecification = () => {
  showPreviewDialog.value = true
}

// 处理保存规格书按钮点击
const handleSaveSpecification = async () => {
  // 校验必填项：船型、船号、PMC编码
  if (!selectedShipClass.value) {
    ElMessage.warning('请选择船型')
    return
  }
  if (!selectedShipNumber.value) {
    ElMessage.warning('请选择船号')
    return
  }
  if (!currentNode.value.label) {
    ElMessage.warning('请选择有效的PMC编码')
    return
  }

  // 检查是否有已配置的部件类型
  const configuredButtons = configButtons.value.filter(btn => btn.type && btn.configResult)
  
  if (configuredButtons.length === 0) {
    ElMessage.warning('请先配置至少一个部件类型')
    return
  }
  
  try {
    // 从存储中获取所有配置的完整数据
    const allStoredConfigs = pipeSpecConfigStore.getAllConfigs()
    
    // 准备保存数据，包含完整的配置信息
    // 按照 SavePipeSpecRequest 接口契约构造数据
    const saveData = {
      shipType: selectedShipClass.value ? shipClasses.value.find(item => item.id === selectedShipClass.value)?.name : '',
      shipNumber: selectedShipNumber.value ? shipNumbers.value.find(item => item.id === selectedShipNumber.value)?.name : '',
      pmcCode: currentNode.value.label || '',
      configurations: configuredButtons.map(btn => {
        // 优先使用按钮中存储的完整配置数据
        const fullConfigData = btn.configData || 
                               allStoredConfigs.find(config => config.componentTypeId === btn.typeId) || 
                               allStoredConfigs.find(config => config.partType === btn.type)
        
        // 映射 fullConfigData 到 contract 的 ComponentFullConfiguration 结构
        // standardFileConfigs: Array<{ standardFile, material }>
        const standardFileConfigs = fullConfigData && fullConfigData.configurations ? fullConfigData.configurations.map(cfg => ({
          standardFile: cfg.standardFileName, // 使用 standardFileName 对应 contract 中的 standardFile
          material: cfg.materialName          // 使用 materialName 对应 contract 中的 material
        })) : []

        return {
          componentTypeId: btn.typeId, // 新增：传递 componentTypeId
          componentType: btn.type, // 对应 contract 中的 componentType
          configResult: btn.configResult,
          standards: standardFileConfigs // 对应 contract 中的 standards
        }
      })
    }
    
    // 调用保存接口 (Interface 4.7)
    const res = await axios.post('/api/PmcSpec/SpecRules', saveData)
    
    if (res.data.code === 200) {
      ElMessage.success('规格书保存成功！')
    } else {
      ElMessage.error(res.data.msg || '规格书保存失败')
    }
  } catch (error) {
    console.error('保存规格书错误:', error)
    ElMessage.error('网络错误，规格书保存失败')
  }
}

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    'pending': '待配置',
    'review': '待审核',
    'approved': '已审核'
  }
  return statusMap[status] || status
}

// 获取所有存储的配置（用于调试或导出）
const getAllStoredConfigs = () => {
  const allConfigs = pipeSpecConfigStore.getAllConfigs()
  console.log('当前存储的所有配置:', allConfigs)
  console.log('配置数量:', pipeSpecConfigStore.getCount())
  return allConfigs
}

// 清空所有存储的配置
const clearAllStoredConfigs = () => {
  pipeSpecConfigStore.clearAll()
  // 同时清空按钮配置
  configButtons.value.forEach(btn => {
    btn.type = ''
    btn.typeId = null
    btn.configResult = ''
    btn.configData = null
  })
  ElMessage.success('已清空所有配置')
}
</script>

<template>
  <div class="pipe-spec-container">
    <div class="pipe-spec-content">
      <!-- 左侧PMC编码选择树形结构 -->
      <div class="pipe-spec-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <el-icon v-show="sidebarCollapsed" class="config-icon"><Ship /></el-icon>
          <el-select 
            v-model="selectedShipClass" 
            placeholder="船型" 
            style="width: 90px; margin-right: 10px;"
            :loading="shipInfosLoading"
          >
            <el-option 
              v-for="classItem in shipClasses" 
              :key="classItem.id" 
              :label="classItem.name" 
              :value="classItem.id" 
            />
          </el-select>
          <el-select 
            v-model="selectedShipNumber" 
            placeholder="船号" 
            style="width: 90px;"
            :loading="shipInfosLoading"
          >
            <el-option 
              v-for="numberItem in shipNumbers" 
              :key="numberItem.id" 
              :label="numberItem.name" 
              :value="numberItem.id" 
            />
          </el-select>
        </div>
        <div class="sidebar-header-title">
          <span v-show="!sidebarCollapsed">PMC编码列表</span>
          <el-button 
            class="collapse-btn" 
            @click="toggleSidebar"
            circle
            size="small"
          >
            <el-icon><ArrowLeft v-if="!sidebarCollapsed" /><ArrowRight v-else /></el-icon>
          </el-button>
        </div>
        <!-- 搜索框 -->
        <PipeSpecTreeSearch 
          v-model="filterText" 
          v-show="!sidebarCollapsed"
        />
        <!-- 状态颜色图例 -->
        <div class="status-legend" v-show="!sidebarCollapsed">
          <div class="legend-item">
            <span class="legend-dot pending"></span>
            <span class="legend-text">待配置</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot review"></span>
            <span class="legend-text">待审核</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot approved"></span>
            <span class="legend-text">已审核</span>
          </div>
        </div>
        <div class="sidebar-tree" v-show="!sidebarCollapsed">
          <el-tree
            ref="treeRef"
            :data="treeData"
            :highlight-current="true"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            @node-contextmenu="handleNodeContextMenu"
            v-loading="treeLoading">
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span class="tree-label">{{ node.label }}</span>
                <!-- 只有编码节点（第四级）才显示状态指示器 -->
                <span v-if="data?.status" class="status-indicator" :class="`status-${data.status}`" :title="getStatusLabel(data.status)">
                  {{ getStatusLabel(data.status) }}
                </span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="pipe-spec-main">
        <!-- 顶部操作条 -->
        <div class="main-header">
          <!-- 左侧：标题或状态信息 -->
          <div class="header-left">
            <div class="header-title">管系规格书配置</div>
            <div class="header-status" v-if="selectedShipClass && selectedShipNumber">
              <span class="status-item">
                <span class="status-label">船型：</span>
                <span class="status-value">{{ currentShipClassName }}</span>
              </span>
              <span class="status-item">
                <span class="status-label">船号：</span>
                <span class="status-value">{{ currentShipNumberName }}</span>
              </span>
              <span class="status-item" v-if="currentNode.label && currentNode.label.length === 7">
                <span class="status-label">PMC编码：</span>
                <span class="status-value">{{ currentNode.label }}</span>
              </span>
            </div>
          </div>
          <!-- 右侧：搜索框（可选）与所有功能按钮 -->
          <div class="header-right">
            <!-- 搜索框（可选，暂时不显示） -->
            <!-- <el-input
              v-model="searchKeyword"
              placeholder="搜索..."
              style="width: 200px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input> -->
            <!-- 辅助按钮 -->
            <el-button type="success"  @click="handleSaveSpecification">保存规格书</el-button>
            <!-- 主操作 -->
            <el-button type="primary"  @click="handleGenerateSpecification">生成规格书</el-button>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="form-container">
          <h3>Piping Specification</h3>
          <el-form :model="formData" class="spec-form" label-position="left">
            <el-form-item label-width="0" prop="">
              <el-row class="form-section-pmc" :gutter="20">
                <el-col :span="8">
                  <el-form-item label="Service" label-width="80px">
                    <el-input style="width: 200px;" :disabled="true" v-model="formData.service" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="PipingMaterial Class" label-width="150px">
                    <el-input style="width: 200px;" :disabled="true" v-model="formData.pipingMaterialClass" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Pipe" label-width="150px">
                    <el-input style="width: 200px;" :disabled="true" v-model="formData.pipe" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="form-section-pmc" :gutter="20">
                <el-col :span="8">
                  <el-form-item label="Material" label-width="80px">
                    <el-input style="width: 200px;" :disabled="true" v-model="formData.material" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Pressure Class" label-width="150px">
                    <el-input style="width: 200px;" :disabled="true" v-model="formData.pressureClass" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Wall Thickness" label-width="150px">
                    <el-input style="width: 200px;" :disabled="true" v-model="formData.wallThickness" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>

            <!-- 管系规格书的通径外径壁厚对照表格 -->
            <el-form-item label-width="0" prop="">
              <PipeSpecNpdTable
                :dimensionData="dimensionData"
                :columnCount="columnCount"
                v-model:preferredRule="preferredRule"
                :preferredRuleLoading="preferredRuleLoading"
                :preferredRuleOptions="preferredRuleOptions"
                :getCellStyle="getCellStyle"
                :handleCellClick="handleCellClick"
              />
            </el-form-item>

            <!-- 配置按钮区域 -->
            <el-form-item label-width="0" prop="">
              <PipeSpecConfigButtons
                :configButtons="configButtons"
                :handleConfigClick="handleConfigClick"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <PipeSpecConfigForm
      v-model:modelValue="showDialog"
      :pathRanges="filteredNpdRanges"
      :buttonLabel="currentButtonLabel"
      :initial-config="currentConfigData"
      @confirm="handleConfirm"
    />
    <PipeSpecPreviewForm
      v-model:modelValue="showPreviewDialog"
      :pmcCode="currentNode.label"
      template-id="Pipe-Spec"
    />
    
    <!-- 右键菜单 -->
    <div 
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
      @click.stop
    >
      <div 
        class="context-menu-item" 
        :class="{ disabled: !canSubmitReview }"
        @click="handleSubmitReview"
        title="仅待审核状态可提交"
      >
        提交审核
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 右键菜单样式 */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  border-radius: 4px;
  padding: 5px 0;
  min-width: 120px;
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.2s;
}

.context-menu-item:hover:not(.disabled) {
  background-color: #f5f7fa;
  color: #409eff;
}

.context-menu-item.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  background-color: #f5f7fa;
}

/* 
 * 样式结构概览：
 * --------------------------------------------------------------------------
 * 1. 整体布局 (Layout)
 *    采用 Flex 容器实现左右分栏结构：左侧为资源树(Sidebar)，右侧为配置表单(Main)。
 * 
 * 2. 侧边栏 (Sidebar)
 *    包含船型船号选择、PMC编码树形导航、搜索过滤及折叠交互逻辑。
 * 
 * 3. 状态系统 (Status System)
 *    定义了 Pending(蓝色)、Review(橙色)、Approved(绿色) 三种状态的视觉反馈，
 *    应用于图例说明和树节点状态标记。
 * 
 * 4. 主工作区 (Main Content)
 *    包含顶部状态栏/操作按钮区和底部的滚动表单容器。
 * 
 * 5. 组件适配 (Component Overrides)
 *    针对 Element Plus 的 Form、Input、Select 等组件进行了特定的宽带和布局调整，
 *    以适应紧凑的工程配置界面需求。
 * --------------------------------------------------------------------------
 */

/* CSS变量定义 - 统一管理样式值 */


.pipe-spec-container {
  height: 100%;
  padding: 0;
  background-color: #fff;
}

.pipe-spec-content {
  display: flex;
  height: 100%;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

/* 左侧树形结构 */
.pipe-spec-sidebar {
  width: 280px;
  border-right: 1px solid #e6e8eb;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  transition: width 0.3s ease;
}

.pipe-spec-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e6e8eb;
  background-color: #fafafa;
}

.config-icon {
  font-size: 20px;
  color: #333;
  margin-right: 8px;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.pipe-spec-sidebar.collapsed .sidebar-header .el-select {
  display: none;
}

.pipe-spec-sidebar.collapsed .config-icon {
  margin-right: 0;
  border-color: #e6e8eb;
}

.sidebar-header-title {
  padding: 12px 15px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e8eb;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pipe-spec-sidebar.collapsed .sidebar-header-title {
  border-bottom: none;
}

.collapse-btn {
  flex-shrink: 0;
}

.sidebar-tree {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.custom-tree-node {
  display: flex;
  align-items: center;
}

.tree-label {
  font-size: 14px;
}

/* 状态颜色图例 */
.status-legend {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 12px 15px;
  background-color: #f9fafc;
  border-bottom: 1px solid #e6e8eb;
  font-size: 12px;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.pending {
  background-color: #409eff;
}

.legend-dot.review {
  background-color: #e6a23c;
}

.legend-dot.approved {
  background-color: #67c23a;
}

.legend-text {
  color: #606266;
}

/* 树节点状态指示器 */
.status-indicator {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-pending {
  background-color: #e6f7ff;
  color: #0050b3;
}

.status-review {
  background-color: #fff7e6;
  color: #ad6800;
}

.status-approved {
  background-color: #f6ffed;
  color: #274a17;
}

/* 右侧表单区域 */
.pipe-spec-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
}

.main-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e6e8eb;
  background-color: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 左侧：标题或状态信息 */
.header-left {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 20px;
  flex: 1;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #909399;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-label {
  color: #909399;
}

.status-value {
  color: #606266;
  font-weight: normal;
}

/* 右侧：搜索框与功能按钮 */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 表单容器 */
.form-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

.form-container h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.spec-form {
  background-color: transparent;
  justify-content: center;
}

.form-section {
  margin-bottom: 20px;
  width: 100%;
}

.form-section-pmc{
  margin-bottom: 20px;
}

/* 通径外径壁厚对照表格样式 - 已移动到组件 */

.form-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

/* ElementPlus表单样式调整 */
.spec-form .el-form {
  margin: 0;
}

.spec-form .el-form-item {
  margin-bottom: 0;
}

/* 调整行间距 */
.spec-form .el-row {
  margin-bottom: 15px;
}

/* 调整列间距 */
.spec-form .el-col {
  margin-bottom: 10px;
}

/* 表单控件基础样式 */
.spec-form .el-input,
.spec-form .el-select {
  /* 默认宽度为100%，但允许通过内联样式或特定类名覆盖 */
  width: 100%;
  max-width: none;
}

/* 允许通过内联style属性控制宽度 */
.spec-form .el-input[style*="width"],
.spec-form .el-select[style*="width"] {
  width: auto;
}

/* 修复 el-form-item 内容区域宽度问题 */
.spec-form :deep(.el-form-item__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 确保表单控件占满内容区域 */
.spec-form :deep(.el-form-item__content .el-input),
.spec-form :deep(.el-form-item__content .el-select) {
  width: 100%;
}

/* 表格/自定义容器也占满宽度 */
.spec-form :deep(.el-form-item__content > div) {
  width: 100%;
}

/* 配置按钮区域样式 - 已移动到组件 */
</style>