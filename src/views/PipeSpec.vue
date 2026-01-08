<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Setting, Plus, Ship } from '@element-plus/icons-vue'
import PipeSpecConfigForm from '@/components/PipeSpecConfigForm.vue'    // 导入 PipeSpecConfigForm 组件，用于配置按钮的弹窗实现

// 树形数据
const treeData = ref([])
const treeLoading = ref(false)

// 当前选中的树形节点
const currentNode = ref({ label: 'Piping Specification' })

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 右侧表单数据
const formData = ref({
  service: '',
  pipingMaterialClass: '',
  pipe: '',
  material: '',
  pressureClass: '',
  wallThickness: ''
})

// 船型船号数据
const shipInfos = ref([])
const shipInfosLoading = ref(false)

// 当前选中的船型和船号
const selectedShipClass = ref(null)
const selectedShipNumber = ref(null)

// 船型列表（从后端数据中提取唯一的船型）
const shipClasses = computed(() => {
  const uniqueTypes = [...new Set(shipInfos.value.map(item => item.shipType))]
  return uniqueTypes.map((type, index) => ({
    id: index + 1,
    name: type
  }))
})

// 船号列表（根据选中的船型过滤）
const shipNumbers = computed(() => {
  if (!selectedShipClass.value) return []
  const shipType = shipClasses.value.find(item => item.id === selectedShipClass.value)?.name
  if (!shipType) return []
  
  return shipInfos.value
    .filter(item => item.shipType === shipType)
    .map((item, index) => ({
      id: index + 1,
      name: item.shipNumber
    }))
})

// 获取船型船号信息
const fetchShipInfos = async () => {
  shipInfosLoading.value = true
  try {
    const res = await axios.get('/api/PmcSpec/ShipInfos')
    if (res.data.code === 200) {
      shipInfos.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取船型船号信息失败')
    }
  } catch (error) {
    console.error('获取船型船号信息错误:', error)
    ElMessage.error('网络错误，获取船型船号信息失败')
  } finally {
    shipInfosLoading.value = false
  }
}

// 获取船号的 PMC 规则数据
const fetchPmcRules = async (shipNumber) => {
  treeLoading.value = true
  try {
    const res = await axios.get(`/api/PmcSpec/PmcRules/${shipNumber}`)
    if (res.data.code === 200) {
      treeData.value = transformToTreeStructure(res.data.data)
    } else {
      ElMessage.error(res.data.message || '获取PMC规则数据失败')
    }
  } catch (error) {
    console.error('获取PMC规则数据错误:', error)
    ElMessage.error('网络错误，获取PMC规则数据失败')
  } finally {
    treeLoading.value = false
  }
}

// 将后端返回的数据转换为树形结构
const transformToTreeStructure = (data) => {
  if (!data || data.length === 0) {
    return []
  }

  const materialMap = new Map()

  data.forEach(item => {
    const material = item.material
    const pipeStandard = item.pipeStadard
    const pmcCode = item.pmcCode

    if (!materialMap.has(material)) {
      materialMap.set(material, {
        label: material,
        children: new Map()
      })
    }

    const materialNode = materialMap.get(material)
    
    if (!materialNode.children.has(pipeStandard)) {
      materialNode.children.set(pipeStandard, {
        label: pipeStandard,
        children: []
      })
    }

    const pipeStandardNode = materialNode.children.get(pipeStandard)
    pipeStandardNode.children.push({
      label: pmcCode,
      shipNumber: item.shipNumber,
      material: item.material,
      pipeStandard: item.pipeStadard,
      status: item.status
    })
  })

  const result = []
  materialMap.forEach((value, key) => {
    const children = []
    value.children.forEach((childValue) => {
      children.push(childValue)
    })
    result.push({
      label: value.label,
      children: children
    })
  })

  return result
}

// 获取编码详细信息
const fetchPmcCodeDetails = async (code) => {
  try {
    const res = await axios.get(`/api/PmcSpec/Analyze/${code}`)
    if (res.data.code === 200) {
      const data = res.data.data
      formData.value = {
        service: data.service || '',
        pipingMaterialClass: data.pipingMaterialClass || code,
        pipe: data.pipeStandard || '',
        material: data.materialGrade || '',
        pressureClass: data.pressureRating || '',
        wallThickness: data.wallThickness || ''
      }
    } else {
      ElMessage.error(res.data.message || '获取编码详情失败')
    }
  } catch (error) {
    console.error('获取编码详情错误:', error)
    ElMessage.error('网络错误，获取编码详情失败')
  }
}

// 处理树形节点点击
const handleNodeClick = (data) => {
  currentNode.value = data
  
  // 判断是否为第四级节点（没有children且label为7位字母数字）
  if (!data.children && data.label && data.label.length === 7) {
    fetchPmcCodeDetails(data.label)
  } else {
    // 清空右侧表单
    formData.value = {
      service: '',
      pipingMaterialClass: '',
      pipe: '',
      material: '',
      pressureClass: '',
      wallThickness: ''
    }
  }
}

// 处理表格单元格点击
const handleCellClick = (row, column, cell, event) => {
  if (row.name !== 'NPD') return
  
  const value = parseInt(row[column.property])
  
  // 第一次点击设置最小值，第二次点击设置最大值
  if (selectedMin.value === null) {
    selectedMin.value = value
    selectedMax.value = null
  } else if (selectedMax.value === null) {
    if (value < selectedMin.value) {
      selectedMax.value = selectedMin.value
      selectedMin.value = value
    } else {
      selectedMax.value = value
    }
  } else {
    // 重置选择
    selectedMin.value = value
    selectedMax.value = null
  }
}

// 计算单元格背景色
const getCellBackgroundColor = (row, column) => {
  if (row.name !== 'NPD') return ''
  
  const value = parseInt(row[column.property])
  
  if (selectedMin.value !== null && selectedMax.value !== null) {
    if (value >= selectedMin.value && value <= selectedMax.value) {
      return '#90EE90' // 浅绿色
    } else {
      return '#FFFFE0' // 淡黄色
    }
  } else if (selectedMin.value !== null && value === selectedMin.value) {
    return '#90EE90' // 浅绿色
  }
  
  return '#FFFFE0' // 默认淡黄色
}

// 管材通道通径、外径、壁厚数据
const dimensionData = ref([])
const dimensionLoading = ref(false)

// 获取管材规格数据
const fetchDimensionData = async () => {
  dimensionLoading.value = true
  try {
    const res = await axios.get('/api/pipe-spec/dimension')
    if (res.data.code === 200) {
      dimensionData.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取管材规格数据失败')
    }
  } catch (error) {
    console.error('获取管材规格数据错误:', error)
    ElMessage.error('网络错误，获取管材规格数据失败')
  } finally {
    dimensionLoading.value = false
  }
}

// 配置按钮列表
const configButtons = ref([
  { id: 1, type: '', configResult: '' },
  { id: 2, type: '', configResult: '' },
  { id: 3, type: '', configResult: '' },
  { id: 4, type: '', configResult: '' }
])

// 当前选中的按钮ID
const currentButtonId = ref(null)

// 获取所有NPD值并计算最小和最大值
const getAllNpdValues = () => {
  const npdRow = dimensionData.value.find(row => row.name === 'NPD')
  if (!npdRow) return []
  
  const values = []
  // 直接获取所有以col开头的属性，不依赖columnCount
  for (const key in npdRow) {
    if (key.startsWith('col')) {
      const value = parseInt(npdRow[key])
      if (!isNaN(value)) {
        values.push(value)
      }
    }
  }
  return values.sort((a, b) => a - b)
}

// 获取最小NPD值
const getMinNpdValue = () => {
  const values = getAllNpdValues()
  return values.length > 0 ? values[0] : null
}

// 获取最大NPD值
const getMaxNpdValue = () => {
  const values = getAllNpdValues()
  return values.length > 0 ? values[values.length - 1] : null
}

// 选择范围变量 - 默认选中所有NPD
const selectedMin = ref(null)
const selectedMax = ref(null)

// 监听船型变化，自动重置船号选择
watch(selectedShipClass, (newVal) => {
  selectedShipNumber.value = null // 重置船号选择
  treeData.value = [] // 清空树形数据
})

// 监听船号变化，自动获取 PMC 规则数据
watch(selectedShipNumber, async (newVal) => {
  if (newVal) {
    const shipNumber = shipNumbers.value.find(item => item.id === newVal)?.name
    if (shipNumber) {
      await fetchPmcRules(shipNumber)
    }
  } else {
    treeData.value = [] // 清空树形数据
  }
})

// 在组件挂载后初始化数据
onMounted(async () => {
  // 并行获取所有数据（树形数据在船号选择时加载）
  await Promise.all([
    fetchMaterialsData(),
    fetchDimensionData(),
    fetchShipInfos()
  ])
  
  // 数据加载完成后初始化NPD默认选择范围
  if (dimensionData.value.length > 0) {
    selectedMin.value = getMinNpdValue()
    selectedMax.value = getMaxNpdValue()
  }
})

const showDialog = ref(false)

// 当前选中的按钮Label
const currentButtonLabel = ref('')

// 材料数据
const materials = ref([])
const materialsLoading = ref(false)

// 获取材料数据
const fetchMaterialsData = async () => {
  materialsLoading.value = true
  try {
    const res = await axios.get('/api/pipe-spec/material')
    if (res.data.code === 200) {
      materials.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取材料数据失败')
    }
  } catch (error) {
    console.error('获取材料数据错误:', error)
    ElMessage.error('网络错误，获取材料数据失败')
  } finally {
    materialsLoading.value = false
  }
}

// 计算属性：根据NPD表格选中的范围生成所有可能的单个范围选项
const filteredNpdRanges = computed(() => {
  if (selectedMin.value === null || selectedMax.value === null) {
    return []
  }
  
  // 从dimensionData中获取NPD行的数据
  const npdRow = dimensionData.value.find(row => row.name === 'NPD')
  if (!npdRow) {
    return []
  }
  
  // 提取所有NPD值并过滤出选中范围内的值
  const npdValues = []
  for (let i = 1; i <= columnCount.value; i++) {
    const value = parseInt(npdRow[`col${i}`])
    if (!isNaN(value) && value >= selectedMin.value && value <= selectedMax.value) {
      npdValues.push(value)
    }
  }
  
  // 为每个NPD值生成一个单独的范围选项
  return npdValues.map((value, index) => ({
    id: `${value}-${Date.now()}`,
    minSize: value,
    maxSize: value,
    name: `通径 ${value} mm`
  }))
})

// 计算属性：动态计算表格列数
const columnCount = computed(() => {
  if (!dimensionData.value || dimensionData.value.length === 0) {
    return 15 // 默认最小15列
  }
  
  // 获取第一行数据的属性数量，减去name属性
  const firstRow = dimensionData.value[0]
  const cols = Object.keys(firstRow).filter(key => key.startsWith('col')).length
  
  // 返回最大的列数，最小为15列
  return Math.max(cols, 15)
})

// 处理配置确认
const handleConfirm = (data) => {
  // 将配置数据转换为指定格式的字符串
  const configStr = data.configurations.map(item => {
    // 基础配置信息
    let configLine = `${item.standardFileName} - ${item.materialName} - ${item.npdRange[0]}~${item.npdRange[1]}mm`
    
    // 如果是Bend配置且有弯管半径倍数信息，则添加
    if (data.partType === 'Bend' && item.bendRadiusMultiple) {
      configLine += ` - 弯管半径倍数: ${item.bendRadiusMultiple}`
    }
    
    return configLine
  }).join('\n')
  
  // 根据当前选中的按钮ID更新配置结果
  if (currentButtonId.value) {
    const buttonIndex = configButtons.value.findIndex(btn => btn.id === currentButtonId.value)
    if (buttonIndex !== -1) {
      configButtons.value[buttonIndex].type = data.partType
      configButtons.value[buttonIndex].configResult = configStr
      
      // 检查是否需要添加新按钮
      const hasEmptyButton = configButtons.value.some(btn => !btn.type && !btn.configResult)
      if (!hasEmptyButton) {
        const newId = Math.max(...configButtons.value.map(btn => btn.id)) + 1
        configButtons.value.push({ id: newId, type: '', configResult: '' })
      }
    }
  }
}

// 处理配置按钮点击
const handleConfigClick = (buttonId) => {
  currentButtonId.value = buttonId
  showDialog.value = true
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
        <div class="sidebar-tree" v-show="!sidebarCollapsed">
          <el-tree
            :data="treeData"
            :highlight-current="true"
            @node-click="handleNodeClick"
            v-loading="treeLoading">
            <template #default="{ node }">
              <div class="custom-tree-node">
                <span class="tree-label">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="pipe-spec-main">
        <!-- 顶部操作条（已移除 查询/编辑/保存 按钮） -->
        <div class="main-header">
          <div class="filter-section">
            <el-button type="primary" plain>生成规格书</el-button>
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
              <div class="form-section-pmc">
                <el-row>
                  <el-col :span="24">
                    <div style="width: 95%; overflow-x: auto; max-width: 95%;">
                    <el-table 
                      :data="dimensionData" 
                      style="width: 100%; min-width: 1000px;" 
                      :show-header="false" 
                      id="npd-dataTable"
                      @cell-click="handleCellClick"
                    >
                    <el-table-column prop="name" label="参数" width="100" fixed="left">
                      <template #header-cell>
                        <span style="font-weight: bold;"></span>
                      </template>
                      <template #default="{ row }">
                        <span>{{ row.name }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column v-for="i in columnCount" :key="'col-' + i" :label="i" :prop="'col' + i" width="66">
                      <template #default="{ row, column }">
                        <span 
                          :style="{ 
                            backgroundColor: getCellBackgroundColor(row, column),
                            cursor: row.name === 'NPD' ? 'pointer' : 'default',
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            padding: '8px 0',
                            textAlign: 'center'
                          }"
                        >
                          {{ row[column.property] || '-' }}
                            </span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>

            <!-- 配置按钮区域 -->
            <el-form-item label-width="0" prop="">
              <div class="form-section-pmc" style="flex:1">
                <el-row :gutter="20" v-for="row in Math.ceil(configButtons.length / 2)" :key="row" class="config-row">
                  <el-col :span="12" v-for="i in 2" :key="i">
                    <div v-if="configButtons[(row-1)*2 + (i-1)]" class="config-cell">
                      <div v-if="configButtons[(row-1)*2 + (i-1)].configResult" class="config-result-container frosted">
                        <div v-if="configButtons[(row-1)*2 + (i-1)].type" class="config-type-label">{{ configButtons[(row-1)*2 + (i-1)].type }}</div>
                        <div class="config-result-scroll">
                          <div v-for="(line, index) in configButtons[(row-1)*2 + (i-1)].configResult.split('\n')" :key="index" class="config-result-line">{{ line }}</div>
                        </div>
                        <el-button 
                          type="primary" 
                          size="small" 
                          class="reconfig-btn"
                          @click="handleConfigClick(configButtons[(row-1)*2 + (i-1)].id)"
                        >
                          重新配置
                        </el-button>
                      </div>
                      <el-button 
                        v-else
                        type="primary" 
                        round 
                        size="large" 
                        class="config-add-btn frosted"
                        @click="handleConfigClick(configButtons[(row-1)*2 + (i-1)].id)"
                      >
                        <div class="config-add-content">
                          <el-icon class="plus-icon"><Plus /></el-icon>
                          <div class="config-add-text">配置</div>
                        </div>
                      </el-button>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <PipeSpecConfigForm
      v-model:modelValue="showDialog"
      :pathRanges="filteredNpdRanges"
      :buttonLabel="currentButtonLabel"
      :materials="materials"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped>
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
  width: 240px;
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
}

.filter-section {
  display: flex;
  align-items: center;
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

/* 配置按钮区域样式，避免已配置内容遮挡其他控件 */
.config-row {
  margin-bottom: 24px;
}


.config-cell {
  padding: 6px;
  box-sizing: border-box;
  height: 140px; /* 固定高度，保证按钮与显示区域高度一致 */
}

.config-result-container {
  background-color: #f0f9ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: calc(100% - 12px); /* 保证容器在父项内有固定高度 */
  overflow: hidden;
  position: relative;
}

.config-result-scroll {
  overflow-y: auto; /* 内容超出时滚动显示 */
  flex-grow: 1;
  min-height: 0;
  padding-right: 6px;
  padding-top: 24px; /* 给顶部的类型标签留出空间，不随内容滚动 */
}

.config-result-line {
  margin-bottom: 6px;
  font-size: 12px;
  word-break: break-word;
}

.reconfig-btn {
  align-self: flex-end;
  margin-top: 8px;
}

.config-type-label {
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 2;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255,255,255,0.85);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.06);
}

.config-add-btn {
  width: 100%;
  height: 140px; /* 与已配置项高度一致 */
  padding: 18px 0;
}

.config-add-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.config-add-text { font-size: 14px; }

/* 毛玻璃效果（浅蓝色基调）用于配置按钮和已配置项背景 */
.frosted {
  background: rgba(224, 242, 255, 0.55); /* 浅蓝色半透明 */
  backdrop-filter: blur(6px) saturate(120%);
  -webkit-backdrop-filter: blur(6px) saturate(120%);
  box-shadow: 0 6px 16px rgba(11, 40, 80, 0.06);
  border: 1px solid rgba(170, 200, 230, 0.45);
  color: #033a66; /* 默认文字颜色为深蓝，保证可见 */
}

.config-result-container.frosted {
  background: rgba(220, 235, 255, 0.6);
  border: 1px solid rgba(150, 185, 230, 0.45);
  color: #033a66;
}

.config-add-btn.frosted {
  background: rgba(220, 235, 255, 0.6);
  border: 1px solid rgba(150, 185, 230, 0.45);
  color: #033a66;
}

/* 确保按钮内部文字和图标可见，覆盖 ElementPlus 默认样式 */
.config-add-btn.frosted,
.config-add-btn.frosted .el-icon,
.config-add-btn.frosted .config-add-text {
  color: #033a66 !important;
}

.reconfig-btn {
  align-self: flex-end;
  margin-top: 8px;
  color: #033a66; /* 小按钮文字为深蓝色 */
}

.config-type-label {
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 2;
  font-size: 12px;
  font-weight: 600;
  background: rgba(230, 245, 255, 0.9);
  color: #033a66;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(140,170,210,0.35);
}
</style>