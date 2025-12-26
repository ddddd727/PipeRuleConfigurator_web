<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import PipeSpecConfigForm from '@/components/PipeSpecConfigForm.vue'    // 导入 PipeSpecConfigForm 组件，用于配置按钮的弹窗实现

// 树形数据
const treeData = ref([])
const treeLoading = ref(false)

// 获取树形数据
const fetchTreeData = async () => {
  treeLoading.value = true
  try {
    const res = await axios.get('/api/pipe-spec/tree')
    if (res.data.code === 200) {
      treeData.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取树形数据失败')
    }
  } catch (error) {
    console.error('获取树形数据错误:', error)
    ElMessage.error('网络错误，获取树形数据失败')
  } finally {
    treeLoading.value = false
  }
}

// 当前选中的树形节点
const currentNode = ref({ label: 'Piping Specification' })

// 右侧表单数据
const formData = ref({
  service: '',
  pipingMaterialClass: '',
  pipe: '',
  material: '',
  pressureClass: '',
  wallThickness: ''
})

// 船级列表
const shipClasses = ref([])
const shipClassesLoading = ref(false)

// 船号列表
const shipNumbers = ref([])
const shipNumbersLoading = ref(false)

// 当前选中的船级和船号
const selectedShipClass = ref(null)
const selectedShipNumber = ref(null)

// 获取船级列表
const fetchShipClasses = async () => {
  shipClassesLoading.value = true
  try {
    const res = await axios.get('/api/pipe-spec/ship-classes')
    if (res.data.code === 200) {
      shipClasses.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取船级列表失败')
    }
  } catch (error) {
    console.error('获取船级列表错误:', error)
    ElMessage.error('网络错误，获取船级列表失败')
  } finally {
    shipClassesLoading.value = false
  }
}

// 获取船号列表
const fetchShipNumbers = async (shipClassId) => {
  shipNumbersLoading.value = true
  try {
    const params = shipClassId ? { shipClassId } : {}
    const res = await axios.get('/api/pipe-spec/ship-numbers', { params })
    if (res.data.code === 200) {
      shipNumbers.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取船号列表失败')
    }
  } catch (error) {
    console.error('获取船号列表错误:', error)
    ElMessage.error('网络错误，获取船号列表失败')
  } finally {
    shipNumbersLoading.value = false
  }
}

// 获取编码详细信息
const fetchPmcCodeDetails = async (code) => {
  try {
    const res = await axios.get(`/api/pipe-spec/pmc-details/${code}`)
    if (res.data.code === 200) {
      formData.value = {
        service: res.data.data.service,
        pipingMaterialClass: res.data.data.pipingMaterialClass,
        pipe: res.data.data.pipe,
        material: res.data.data.material,
        pressureClass: res.data.data.pressureClass,
        wallThickness: res.data.data.wallThickness
      }
    } else {
      ElMessage.error(res.data.msg || '获取编码详情失败')
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

// 管件配置结果变量 - 存储每个管件类型的配置结果
const bendConfigResult = ref('')
const redConfigResult = ref('')
const teeConfigResult = ref('')
const flangeConfigResult = ref('')
const sleeveConfigResult = ref('')
const jointsConfigResult = ref('')
const blindFlangeConfigResult = ref('')
const gasketConfigResult = ref('')
const boltsConfigResult = ref('')
const nutsConfigResult = ref('')
const washersConfigResult = ref('')
const crossesConfigResult = ref('')

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

// 监听船级变化，自动获取船号列表
watch(selectedShipClass, async (newVal) => {
  selectedShipNumber.value = null // 重置船号选择
  await fetchShipNumbers(newVal)
})

// 在组件挂载后初始化数据
onMounted(async () => {
  // 并行获取所有数据
  await Promise.all([
    fetchTreeData(),
    fetchMaterialsData(),
    fetchDimensionData(),
    fetchShipClasses()
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
  const configStr = data.configurations.map(item => 
    `${item.standardFileName} - ${item.materialName} - ${item.npdRange[0]}~${item.npdRange[1]}mm`
  ).join('\n')
  
  // 根据当前按钮标签更新对应的配置结果变量
  switch(currentButtonLabel.value) {
    case 'BEND':
      bendConfigResult.value = configStr
      break
    case 'RED':
      redConfigResult.value = configStr
      break
    case 'TEE':
      teeConfigResult.value = configStr
      break
    case 'FLANGE':
      flangeConfigResult.value = configStr
      break
    case 'SLEEVE':
      sleeveConfigResult.value = configStr
      break
    case 'Joints':
      jointsConfigResult.value = configStr
      break
    case 'Blind flange':
      blindFlangeConfigResult.value = configStr
      break
    case 'Gasket':
      gasketConfigResult.value = configStr
      break
    case 'Bolts':
      boltsConfigResult.value = configStr
      break
    case 'Nuts':
      nutsConfigResult.value = configStr
      break
    case 'Washers':
      washersConfigResult.value = configStr
      break
    case 'Crosses':
      crossesConfigResult.value = configStr
      break
    default:
      break
  }
}

// 处理配置按钮点击
const handleConfigClick = (label) => {
  currentButtonLabel.value = label
  showDialog.value = true
}
</script>

<template>
  <div class="pipe-spec-container">
    <div class="pipe-spec-content">
      <!-- 左侧PMC编码选择树形结构 -->
      <div class="pipe-spec-sidebar">
        <div class="sidebar-header">
          <el-select 
            v-model="selectedShipClass" 
            placeholder="船级" 
            style="width: 90px; margin-right: 10px;"
            :loading="shipClassesLoading"
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
            :loading="shipNumbersLoading"
          >
            <el-option 
              v-for="numberItem in shipNumbers" 
              :key="numberItem.id" 
              :label="numberItem.name" 
              :value="numberItem.id" 
            />
          </el-select>
        </div>
        <div class="sidebar-tree">
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
        <!-- 顶部操作条 -->
        <div class="main-header">
          <div class="filter-section">
            <el-button type="primary" style="margin-right: 10px;">查询</el-button>
            <el-button type="info" style="margin-right: 10px;">编辑</el-button>
            <el-button type="success" style="margin-right: 10px;">保存</el-button>
            <el-button type="warning">生成规格书</el-button>
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

            <!-- 管件选择 -->
            <el-form-item label-width="0" prop="">
              <div class="form-section">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="BEND" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="bendConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('BEND')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="RED" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="redConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示"/>
                        <el-button @click="handleConfigClick('RED')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="TEE" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="teeConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('TEE')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="FLANGE" label-width="80px">  
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="flangeConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('FLANGE')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="SLEEVE" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="sleeveConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('SLEEVE')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Joints" label-width="80px">    
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="jointsConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Joints')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Blind flange" label-width="100px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="blindFlangeConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Blind flange')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Gasket" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="gasketConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Gasket')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Bolts" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="boltsConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Bolts')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Nuts" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="nutsConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Nuts')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Washers" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="washersConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Washers')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Crosses" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input v-model="crossesConfigResult" type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Crosses')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Saddles" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Saddles')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Caps" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Caps')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Accessories" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Accessories')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Overpass" label-width="80px">
                      <div style="display: flex; align-items: flex-start; flex:0.8">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Overpass')">配置</el-button>
                      </div>
                    </el-form-item>
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
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e6e8eb;
  background-color: #fafafa;
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
</style>