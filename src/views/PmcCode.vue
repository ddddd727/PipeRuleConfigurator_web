<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Check } from '@element-plus/icons-vue'

// --- Data & State ---

// 1. Ship Selection
const allShipInfos = ref([]) // 存储所有船型船号信息
const shipTypes = ref([])
const selectedShipType = ref('')
const shipNumbers = ref([]) // 动态加载
const selectedShipNumber = ref('')
const sourceShipType = ref('')
const targetShipType = ref('')
const sourceShipNumber = ref('')
const targetShipNumber = ref('')
const sourceShipNumbers = ref([])
const targetShipNumbers = ref([])

// 2. Rules Selection (Mock下拉选项，实际可能也是接口)
const mainMaterialRules = ref([])
const selectedMainMaterialRule = ref('')

const flangeRules = ref([])
const selectedFlangeRule = ref('')

const pipeLimitRules = ref([])
const selectedPipeLimitRule = ref('')

// 3. Rule Tables Data (从后端加载)
const mainMaterialData = ref([])
const flangeData = ref([])
const pipeLimitData = ref([])

// --- API Methods ---

// 获取规则下拉列表（pipe-limit 由后端提供 RuleName）
const fetchRuleOptions = async (type) => {
  try {
    if (type === 'pipe-limit') {
      const res = await axios.get(`/api/pmc/rules/pipe-limit`)
      const names = Array.isArray(res.data?.data) ? res.data.data : []
      pipeLimitRules.value = names.map(n => ({ label: n, value: n }))
      return
    }
    if (type === 'main-material') {
      const res = await axios.get(`/api/pmc/rules/main-material`)
      const names = Array.isArray(res.data?.data) ? res.data.data : []
      mainMaterialRules.value = names.map(n => ({ label: n, value: n }))
      return
    }
    if (type === 'flange') {
      const res = await axios.get(`/api/pmc/rules/flange`)
      const names = Array.isArray(res.data?.data) ? res.data.data : []
      flangeRules.value = names.map(n => ({ label: n, value: n }))
      return
    }
    const res = await axios.get(`/api/pmc/rules/list?type=${type}`)
    if (res.data.code === 200) {
      if (type === 'main-material') {
        mainMaterialRules.value = res.data.data
      } else if (type === 'flange') {
        flangeRules.value = res.data.data
      }
    }
  } catch (error) {
    console.error(`Fetch rule options for ${type} failed:`, error)
  }
}

// 页面加载时初始化
onMounted(() => {
  fetchAllShipInfos()
  fetchRuleOptions('main-material')
  fetchRuleOptions('flange')
  fetchRuleOptions('pipe-limit')
})

// 获取所有船型船号信息
const fetchAllShipInfos = async () => {
  try {
    const res = await axios.get('/api/pmc/pmccode/ShipInfos')
    if (res.data.code === 200) {
      allShipInfos.value = res.data.data || []
      // 提取所有不重复的船型
      const types = new Set(allShipInfos.value.map(item => item.shipType))
      shipTypes.value = Array.from(types).map(t => ({ label: t, value: t }))
    }
  } catch (error) {
    console.error('Fetch ship infos failed:', error)
    ElMessage.error('获取船型船号信息失败')
  }
}

// 获取船号 (本地过滤)
const fetchShipNumbers = (type) => {
  if (!type) {
    shipNumbers.value = []
    selectedShipNumber.value = ''
    return
  }
  const filtered = allShipInfos.value.filter(item => item.shipType === type)
  shipNumbers.value = filtered.map(item => ({ label: item.shipNumber, value: item.shipNumber }))
  selectedShipNumber.value = '' // 重置选中
}

// 获取复制规则弹窗用的船号 (本地过滤)
const fetchCopyShipNumbers = (type, target) => {
  if (!type) {
    if (target === 'source') {
      sourceShipNumbers.value = []
      sourceShipNumber.value = ''
    } else if (target === 'target') {
      targetShipNumbers.value = []
      targetShipNumber.value = ''
    }
    return
  }
  
  const filtered = allShipInfos.value.filter(item => item.shipType === type)
  const numbers = filtered.map(item => ({ label: item.shipNumber, value: item.shipNumber }))

  if (target === 'source') {
    sourceShipNumbers.value = numbers
    sourceShipNumber.value = ''
  } else if (target === 'target') {
    targetShipNumbers.value = numbers
    targetShipNumber.value = ''
  }
}

// 获取主材料规则内容
const fetchMainMaterialData = async (ruleCode) => {
  console.log('Fetching Main Material Rule:', ruleCode)
  if (!ruleCode) {
    mainMaterialData.value = []
    return
  }
  try {
    const res = await axios.get(`/api/pmc/rules/main-material/${encodeURIComponent(ruleCode)}`)
    console.log('Main Material Response:', res.data)
    const list = res.data?.data || []
    
    // Map backend DTO to frontend table fields
    mainMaterialData.value = list.map((d, index) => ({
      id: index + 1,
      code: d.materialsCategoryCode,      // MaterialsCategoryCode -> code
      std: d.pipingStandardCode,          // PipingStandardCode -> std
      grade: d.materialsGradeCode,        // MaterialsGradeCode -> grade
      thickness: d.scheduleThicknessCode  // ScheduleThicknessCode -> thickness
    }))
  } catch (error) {
    console.error(error)
    ElMessage.error('获取主材料规则失败')
  }
}

// 获取法兰规则内容
const fetchFlangeData = async (ruleCode) => {
  console.log('Fetching Flange Rule:', ruleCode)
  if (!ruleCode) {
    flangeData.value = []
    return
  }
  try {
    const res = await axios.get(`/api/pmc/rules/flange/${encodeURIComponent(ruleCode)}`)
    console.log('Flange Response:', res.data)
    const list = res.data?.data || []
    
    // Map backend DTO to frontend table fields
    flangeData.value = list.map((d, index) => ({
      id: index + 1,
      std: d.flangeStandardCode,      // FlangeStandardCode -> std
      press: d.pressureRatingCode     // PressureRatingCode -> press
    }))
  } catch (error) {
    console.error(error)
    ElMessage.error('获取法兰规则失败')
  }
}

// 获取管材限定规则内容（后端 VW_S3D_Rule_AB2B3C2_WithCodes）
const fetchPipeLimitData = async (ruleCode) => {
  console.log('Fetching Pipe Limit Rule (AB2B3C2):', ruleCode)
  if (!ruleCode) {
    pipeLimitData.value = []
    return
  }
  try {
    const res = await axios.get(`/api/pmc/rules/pipe-limit/${encodeURIComponent(ruleCode)}`)
    const list = res.data?.data || []
    
    // Process list: map fields and auto-generate ID (1, 2, 3...)
    pipeLimitData.value = list.map((d, index) => ({
      id: index + 1, // Auto-increment ID on frontend
      pipingClassCode: d.pipingClassCode,
      pipingStandardCode: d.pipingStandardCode,
      materialsGradeCode: d.materialsGradeCode,
      pressureRatingCode: d.pressureRatingCode
    }))
  } catch (error) {
    console.error('Fetch AB2B3C2 failed:', error)
    ElMessage.error('获取管材限定规则失败')
  }
}

// --- Watchers ---

// 监听船型变化 -> 加载船号
watch(selectedShipType, (newVal) => {
  fetchShipNumbers(newVal)
})

// 监听复制规则弹窗中的船型变化 -> 各自加载对应船号
watch(sourceShipType, (newVal) => {
  fetchCopyShipNumbers(newVal, 'source')
})

watch(targetShipType, (newVal) => {
  fetchCopyShipNumbers(newVal, 'target')
})

// 监听规则下拉变化 -> 加载对应表格数据
watch(selectedMainMaterialRule, (newVal) => {
  fetchMainMaterialData(newVal)
})

watch(selectedFlangeRule, (newVal) => {
  fetchFlangeData(newVal)
})

watch(selectedPipeLimitRule, (newVal) => {
  fetchPipeLimitData(newVal)
})


// Bottom Table Data
const resultData = ref([
  { id: 1, a: 'I', b1: '碳钢管', b2: 'GB/T 8163', b3: '20#', c1: 'GB2506', c2: '6bar', d: 'SCH40', pmc: '1C1B1AD' },
  { id: 2, a: 'I', b1: '碳钢管', b2: 'GB/T 8163', b3: '20#', c1: 'GB2506', c2: '6bar', d: 'SCH80', pmc: '1C1B1AE' },
  { id: 3, a: 'I', b1: '碳钢管', b2: 'GB/T 8163', b3: '20#', c1: 'GB2506', c2: '6bar', d: 'SCH160', pmc: '1C1B1AJ' },
  { id: 4, a: 'I', b1: '碳钢管', b2: 'GB/T 8163', b3: '20#', c1: 'GB2506', c2: '10bar', d: 'SCH40', pmc: '1C1B1BD' },
])

const selectedRows = ref([])

// Edit/Add Dialog State
const editDialogVisible = ref(false)
const dialogTitle = ref('')
const currentEditingId = ref(null) // null means adding new, otherwise editing existing ID
const formData = ref({
  a: '',
  b1: '',
  b2: '',
  b3: '',
  c1: '',
  c2: '',
  d: ''
})

// Mock Dropdown Options (to be replaced by API)
const optionsA = ref([])
const optionsB1 = ref([])
const optionsB2 = ref([])
const optionsB3 = ref([])
const optionsC1 = ref([])
const optionsC2 = ref([])
const optionsD = ref([])

// 动态获取下拉选项
const fetchAddOptions = async (type, parentDesc = null) => {
  try {
    const res = await axios.get('/api/pmc/pmccode/add', {
      params: { type, parentDesc }
    })
    if (res.data?.code === 200) {
      return res.data.data || []
    }
  } catch (error) {
    console.error(`Fetch options for ${type} failed:`, error)
  }
  return []
}

// 监听 B1 变化 -> 加载 B2
watch(() => formData.value.b1, async (newVal) => {
  formData.value.b2 = '' // Reset B2
  if (newVal) {
    optionsB2.value = await fetchAddOptions('b2', newVal)
  } else {
    optionsB2.value = []
  }
})

// Add Button Click -> Open Dialog
const handleAdd = async () => {
  dialogTitle.value = '新增 PMC 数据'
  currentEditingId.value = null
  formData.value = { a: '', b1: '', b2: '', b3: '', c1: '', c2: '', d: '' }
  
  // Load initial options
  optionsA.value = await fetchAddOptions('a')
  optionsB1.value = await fetchAddOptions('b1')
  optionsB3.value = await fetchAddOptions('b3')
  optionsC1.value = await fetchAddOptions('c1')
  optionsC2.value = await fetchAddOptions('c2')
  optionsD.value = await fetchAddOptions('d')
  
  editDialogVisible.value = true
}

// Save Dialog Data
const saveDialogData = () => {
  // 查找各个字段对应的 Code
  const getCode = (val, options) => {
    const found = options.find(o => o.label === val)
    return found ? found.value : '' // value is Code
  }

  const { a, b1, b2, b3, c1, c2, d } = formData.value

  const codeA = getCode(a, optionsA.value)
  const codeB1 = getCode(b1, optionsB1.value)
  const codeB2 = getCode(b2, optionsB2.value)
  const codeB3 = getCode(b3, optionsB3.value)
  const codeC1 = getCode(c1, optionsC1.value)
  const codeC2 = getCode(c2, optionsC2.value)
  const codeD = getCode(d, optionsD.value)

  // 校验所有选项是否都有对应的 Code
  if (!codeA || !codeB1 || !codeB2 || !codeB3 || !codeC1 || !codeC2 || !codeD) {
    ElMessage.error('请完整选择所有必填项，并确保选项有效')
    return
  }

  // Generate PMC Code
  const pmcCode = `${codeA}${codeB1}${codeB2}${codeB3}${codeC1}${codeC2}${codeD}`

  // Check Duplicate
  const isDuplicate = resultData.value.some(item => {
    // 如果是编辑模式，跳过当前行
    if (currentEditingId.value !== null && item.id === currentEditingId.value) {
      return false
    }
    return item.pmc === pmcCode
  })

  if (isDuplicate) {
    ElMessage.error(`当前生成的 PMC 编码 ${pmcCode} 已存在！`)
    return
  }

  if (currentEditingId.value === null) {
    // Add New
    const newId = resultData.value.length > 0 ? Math.max(...resultData.value.map(item => item.id)) + 1 : 1
    resultData.value.push({
      id: newId,
      ...formData.value, // Stores descriptions
      pmc: pmcCode
    })
  } else {
    // Edit Existing
    const index = resultData.value.findIndex(item => item.id === currentEditingId.value)
    if (index !== -1) {
      resultData.value[index] = {
        ...resultData.value[index],
        ...formData.value,
        pmc: pmcCode
      }
    }
  }
  
  editDialogVisible.value = false
}

// 保存PMC编码到后端
const saveToApi = async () => {
  if (!selectedShipType.value || !selectedShipNumber.value) {
    ElMessage.error('请填写船型船号')
    return
  }

  // 检查是否有勾选的行
  if (selectedRows.value.length === 0) {
    ElMessage.error('请勾选需要保存的行')
    return
  }

  const payload = {
    shipType: selectedShipType.value,
    shipNo: selectedShipNumber.value,
    items: selectedRows.value.map(row => ({
      pmcCode: row.pmc,
      pipingClassName: row.a,
      materialsCategoryName: row.b1,
      pipingStandardName: row.b2,
      materialsGradeName: row.b3,
      flangeStandardName: row.c1,
      pressureRatingName: row.c2,
      scheduleThicknessName: row.d
    }))
  }

  try {
    const res = await axios.post('/api/pmc/pmccode/save', payload)
    if (res?.data?.code === 200) {
      ElMessage.success(res.data.message || '保存成功')
    } else {
      ElMessage.error(res?.data?.message || '保存失败')
    }
  } catch (error) {
    console.error('保存PMC编码失败', error)
    ElMessage.error('保存PMC编码失败')
  }
}

// Refresh Data
const refreshData = async () => {
  if (!selectedShipType.value || !selectedShipNumber.value) {
    ElMessage.error('请填写船型船号')
    return
  }

  try {
    const res = await axios.get('/api/pmc/pmccode/query', {
      params: {
        shipType: selectedShipType.value,
        shipNo: selectedShipNumber.value
      }
    })

    if (res.data?.code === 200) {
      const list = res.data.data || []
      resultData.value = list.map((item, index) => ({
        id: index + 1,
        pmc: item.pmcCode,
        a: item.pipingClassName,
        b1: item.materialsCategoryName,
        b2: item.pipingStandardName,
        b3: item.materialsGradeName,
        c1: item.flangeStandardName,
        c2: item.pressureRatingName,
        d: item.scheduleThicknessName
      }))
      ElMessage.success(`刷新成功，共 ${list.length} 条数据`)
    } else {
      ElMessage.error(res.data?.message || '刷新失败')
    }
  } catch (error) {
    console.error('Refresh failed:', error)
    ElMessage.error('刷新失败')
  }
}
const cancelDialog = () => {
  editDialogVisible.value = false
}

// Delete API Placeholder
const deleteFromApi = (ids) => {
  console.log('Deleting IDs from API:', ids)
  // In real app: await api.deletePmc(ids)
}

// Delete Button Click
const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    alert('请先选择要删除的数据')
    return
  }
  // Show confirmation dialog
  if (confirm(`确定要删除选中的 ${selectedRows.value.length} 行吗？`)) {
    const selectedIds = selectedRows.value.map(row => row.id)
    resultData.value = resultData.value.filter(item => !selectedIds.includes(item.id))
    selectedRows.value = []
    
    // Call API placeholder
    deleteFromApi(selectedIds)
    // alert('删除成功 (预留接口)')
  }
}

const resultTableRef = ref(null)
const mainMaterialTableRef = ref(null)
const flangeTableRef = ref(null)
const pipeLimitTableRef = ref(null)

// Handle Row Click
const handleRowClick = (row, tableInstance) => {
  if (tableInstance) {
    tableInstance.toggleRowSelection(row)
  }
}

// Table Selection Change
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// Table Selections for Rule Tables
const selectedMainMaterialRows = ref([])
const selectedFlangeRows = ref([])
const selectedPipeLimitRows = ref([])

// Handle Selection Change for Rule Tables
const handleMainMaterialSelectionChange = (val) => {
  selectedMainMaterialRows.value = val
}

const handleFlangeSelectionChange = (val) => {
  selectedFlangeRows.value = val
}

const handlePipeLimitSelectionChange = (val) => {
  selectedPipeLimitRows.value = val
}

// Generate 7-digit PMC Code
const generatePmcCode = async () => {
  // Check if main material and flange rows are selected
  if (selectedMainMaterialRows.value.length === 0 || selectedFlangeRows.value.length === 0) {
    alert('请先在B1B2B3D组合数据和C1C2组合数据表格中选择至少一行数据')
    return
  }

  // Generate all combinations
  const combinations = []
  let id = resultData.value.length > 0 ? Math.max(...resultData.value.map(item => item.id)) + 1 : 1

  // Determine A values and validation rules
  const usePipeLimit = selectedPipeLimitRows.value.length > 0
  let aValues = []
  let validCombinations = new Set()

  if (usePipeLimit) {
    aValues = selectedPipeLimitRows.value.map(row => row.pipingClassCode)

    selectedPipeLimitRows.value.forEach(row => {
      const key = `${row.pipingClassCode}|${row.pipingStandardCode}|${row.materialsGradeCode}|${row.pressureRatingCode}`
      validCombinations.add(key)
    })
  } else {
    // If not selected, A is '3', no validation
    aValues = ['3']
  }

  // Iterate through Cartesian product
  for (const a of aValues) {
    for (const mainMaterial of selectedMainMaterialRows.value) {
      for (const flange of selectedFlangeRows.value) {
        // Construct the candidate parts
        const b1 = mainMaterial.code
        const b2 = mainMaterial.std
        const b3 = mainMaterial.grade
        const c1 = flange.std
        const c2 = flange.press
        const d = mainMaterial.thickness

        // Validation Logic
        if (usePipeLimit && a !== '3') {
          const key = `${a}|${b2}|${b3}|${c2}`
          if (!validCombinations.has(key)) {
            continue
          }
        }

        // Generate PMC code (7 digits)
        const pmcCode = `${a}${b1}${b2}${b3}${c1}${c2}${d}`

        combinations.push({
          id: id++,
          a,
          b1,
          b2,
          b3,
          c1,
          c2,
          d,
          pmc: pmcCode
        })
      }
    }
  }

  if (combinations.length === 0) {
    alert('没有符合校验要求的组合数据')
    return
  }

  // 去重：以PMC为唯一键
  const existingCodes = new Set(resultData.value.map(item => item.pmc))
  const pmcList = []
  const baseRows = []

  combinations.forEach(item => {
    if (!existingCodes.has(item.pmc)) {
      existingCodes.add(item.pmc)
      pmcList.push(item.pmc)
      baseRows.push(item)
    }
  })

  if (pmcList.length === 0) {
    alert('所有生成的PMC编码均已存在，未新增数据')
    return
  }

  try {
    const res = await axios.post('/api/pmc/pmccode/generate', {
      pmcCodes: pmcList
    })

    const data = Array.isArray(res.data?.data) ? res.data.data : []
    const descMap = new Map()
    data.forEach(d => {
      if (d.pmc) {
        descMap.set(d.pmc, d)
      }
    })

    const newRows = baseRows.map(row => {
      const desc = descMap.get(row.pmc) || {}
      return {
        ...row,
        a: desc.aDesc || row.a,
        b1: desc.b1Desc || row.b1,
        b2: desc.b2Desc || row.b2,
        b3: desc.b3Desc || row.b3,
        c1: desc.c1Desc || row.c1,
        c2: desc.c2Desc || row.c2,
        d: desc.dDesc || row.d
      }
    })

    resultData.value = [...resultData.value, ...newRows]
    alert(`成功生成 ${newRows.length} 条PMC编码（已自动去重并填充中文描述）`)
  } catch (error) {
    console.error('生成PMC编码失败', error)
    ElMessage.error('生成PMC编码失败')
  }
}

// Copy Rule Dialog
const copyRuleDialogVisible = ref(false)

// Open Copy Rule Dialog
const openCopyRuleDialog = () => {
  sourceShipType.value = ''
  targetShipType.value = ''
  sourceShipNumber.value = ''
  targetShipNumber.value = ''
  sourceShipNumbers.value = []
  targetShipNumbers.value = []
  copyRuleDialogVisible.value = true
}

// Confirm Copy Rule
const confirmCopyRule = async () => {
  if (!sourceShipType.value || !sourceShipNumber.value || !targetShipType.value || !targetShipNumber.value) {
    ElMessage.error('请完整选择源船型船号和目标船型船号')
    return
  }
  
  // 检查是否相同
  if (sourceShipType.value === targetShipType.value && sourceShipNumber.value === targetShipNumber.value) {
    ElMessage.error('源船号和目标船号不能相同')
    return
  }

  try {
    const payload = {
      sourceShipType: sourceShipType.value,
      sourceShipNo: sourceShipNumber.value,
      targetShipType: targetShipType.value,
      targetShipNo: targetShipNumber.value
    }

    const res = await axios.post('/api/pmc/pmccode/copy', payload)
    
    if (res.data.code === 200) {
      ElMessage.success(res.data.message || '复制成功')
      copyRuleDialogVisible.value = false
      // 如果当前主界面选中的是目标船号，可以刷新一下
      if (selectedShipType.value === targetShipType.value && selectedShipNumber.value === targetShipNumber.value) {
        refreshData()
      }
    } else {
      ElMessage.error(res.data.message || '复制失败')
    }
  } catch (error) {
    console.error('Copy rule failed:', error)
    ElMessage.error('复制规则失败: ' + (error.response?.data?.message || error.message))
  }
}

// Cancel Copy Rule
const cancelCopyRule = () => {
  copyRuleDialogVisible.value = false
}

</script>

<template>
  <div class="pmc-container">
    <!-- Top Section -->
    <div class="section-block">
      <!-- Top Toolbar -->
      <div class="table-header">
        <div class="title-area">
          <el-select v-model="selectedShipType" placeholder="船型" style="width: 120px;">
            <el-option v-for="item in shipTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="selectedShipNumber" placeholder="船号" style="width: 120px;">
            <el-option v-for="item in shipNumbers" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="actions">
          <el-button type="primary" @click="generatePmcCode">生成7位编码</el-button>
        </div>
      </div>

      <!-- Rule Tables Row -->
      <el-row :gutter="20" class="rule-row">
        <!-- Col 1 -->
        <el-col :span="8">
          <div class="rule-card">
            <div class="rule-header">
              <span>主材料规则：</span>
              <el-select v-model="selectedMainMaterialRule" size="small" style="width: 150px;">
                <el-option v-for="item in mainMaterialRules" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div class="rule-table-wrap">
              <div class="table-title">B1B2B3D组合数据</div>
              <el-table 
                ref="mainMaterialTableRef"
                :data="mainMaterialData" 
                border 
                stripe 
                size="small" 
                height="200" 
                @selection-change="handleMainMaterialSelectionChange"
                @row-click="(row) => handleRowClick(row, mainMaterialTableRef)"
              >
                <el-table-column type="selection" width="40" />
                <el-table-column prop="id" label="ID" width="40" />
                <el-table-column prop="code" label="主材料编码" />
                <el-table-column prop="std" label="管材标准编码" />
                <el-table-column prop="grade" label="牌号编码" />
                <el-table-column prop="thickness" label="壁厚等级编码" />
              </el-table>
            </div>
          </div>
        </el-col>

        <!-- Col 2 -->
        <el-col :span="8">
          <div class="rule-card">
            <div class="rule-header">
              <span>法兰规则：</span>
              <el-select v-model="selectedFlangeRule" size="small" style="width: 150px;">
                <el-option v-for="item in flangeRules" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div class="rule-table-wrap">
              <div class="table-title">C1C2组合数据</div>
              <el-table 
                ref="flangeTableRef"
                :data="flangeData" 
                border 
                stripe 
                size="small" 
                height="200" 
                @selection-change="handleFlangeSelectionChange"
                @row-click="(row) => handleRowClick(row, flangeTableRef)"
              >
                <el-table-column type="selection" width="40" />
                <el-table-column prop="id" label="ID" width="40" />
                <el-table-column prop="std" label="法兰标准编码" />
                <el-table-column prop="press" label="法兰压力等级编码" />
              </el-table>
            </div>
          </div>
        </el-col>

        <!-- Col 3 -->
        <el-col :span="8">
          <div class="rule-card">
            <div class="rule-header">
              <span>管材一二级限定规则：</span>
              <el-select v-model="selectedPipeLimitRule" size="small" style="width: 150px;">
                <el-option v-for="item in pipeLimitRules" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div class="rule-table-wrap">
              <div class="table-title">AB2B3C2组合数据</div>
              <el-table 
                ref="pipeLimitTableRef"
                :data="pipeLimitData" 
                border 
                stripe 
                size="small" 
                height="200" 
                @selection-change="handlePipeLimitSelectionChange"
                @row-click="(row) => handleRowClick(row, pipeLimitTableRef)"
              >
                <el-table-column type="selection" width="40" />
                <el-table-column prop="id" label="ID" width="40" />
                <el-table-column prop="pipingClassCode" label="管材等级编码 A" />
                <el-table-column prop="pipingStandardCode" label="管材标准编码 B2" />
                <el-table-column prop="materialsGradeCode" label="牌号编码 B3" />
                <el-table-column prop="pressureRatingCode" label="法兰压力等级编码 C2" align="center"/>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Bottom Section -->
    <div class="section-block bottom-block">
      <!-- Bottom Toolbar -->
      <div class="table-header">
        <div class="title-area">
          <el-select v-model="selectedShipType" placeholder="船型" style="width: 120px;">
            <el-option v-for="item in shipTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="selectedShipNumber" placeholder="船号" style="width: 120px;">
            <el-option v-for="item in shipNumbers" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="actions">
          <el-button @click="refreshData">刷新</el-button>
          <el-button @click="openCopyRuleDialog">从其他船号复制规则</el-button>
          <el-button type="primary" icon="Plus" @click="handleAdd">增加</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="selectedRows.length === 0" @click="handleDelete">删除</el-button>
          <el-button type="primary" icon="Check" @click="saveToApi">保存</el-button>
        </div>
      </div>

      <!-- Main Data Table -->
      <div class="main-table-wrap">
        <el-table 
          ref="resultTableRef"
          :data="resultData" 
          border 
          stripe 
          style="width: 100%" 
          height="400" 
          @selection-change="handleSelectionChange"
          @row-click="(row) => handleRowClick(row, resultTableRef)"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" width="60" align="center">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="a" label="管材等级 A" align="center" />
          <el-table-column prop="b1" label="主材料 B1" align="center" />
          <el-table-column prop="b2" label="管材标准 B2" align="center" />
          <el-table-column prop="b3" label="牌号 B3" align="center" />
          <el-table-column prop="c1" label="法兰标准 C1" align="center" />
          <el-table-column prop="c2" label="法兰压力等级 C2" align="center" />
          <el-table-column prop="d" label="壁厚等级 D" align="center" />
          <el-table-column prop="pmc" label="PMC" align="center" />
        </el-table>
      </div>
    </div>
  </div>

  <!-- Edit/Add Dialog -->
  <el-dialog :title="dialogTitle" v-model="editDialogVisible" width="500px">
    <el-form :model="formData" label-width="140px">
      <el-form-item label="管材等级 A">
        <el-select v-model="formData.a" placeholder="请选择">
          <el-option v-for="opt in optionsA" :key="opt.value" :label="opt.label" :value="opt.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="主材料 B1">
        <el-select v-model="formData.b1" placeholder="请选择">
          <el-option v-for="opt in optionsB1" :key="opt.value" :label="opt.label" :value="opt.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="管材标准 B2">
        <el-select v-model="formData.b2" placeholder="请选择">
          <el-option v-for="opt in optionsB2" :key="opt.value" :label="opt.label" :value="opt.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="牌号 B3">
        <el-select v-model="formData.b3" placeholder="请选择">
          <el-option v-for="opt in optionsB3" :key="opt.value" :label="opt.label" :value="opt.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="法兰标准 C1">
        <el-select v-model="formData.c1" placeholder="请选择">
          <el-option v-for="opt in optionsC1" :key="opt.value" :label="opt.label" :value="opt.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="法兰压力等级 C2">
        <el-select v-model="formData.c2" placeholder="请选择">
          <el-option v-for="opt in optionsC2" :key="opt.value" :label="opt.label" :value="opt.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="壁厚等级 D">
        <el-select v-model="formData.d" placeholder="请选择">
          <el-option v-for="opt in optionsD" :key="opt.value" :label="opt.label" :value="opt.label" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" @click="saveDialogData">保存</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- Copy Rule Dialog -->
  <el-dialog title="从其他船号复制规则" v-model="copyRuleDialogVisible" width="40%" :before-close="cancelCopyRule">
    <el-form label-width="120px" style="max-width: 500px; margin: 0 auto;">
      <el-form-item label="数据源船号">
        <div style="display: flex; gap: 12px;">
          <el-select v-model="sourceShipType" placeholder="数据源船型" style="width: 120px;">
            <el-option v-for="item in shipTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="sourceShipNumber" placeholder="数据源船号" style="width: 140px;">
            <el-option v-for="item in sourceShipNumbers" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="目标船号">
        <div style="display: flex; gap: 12px;">
          <el-select v-model="targetShipType" placeholder="目标船型" style="width: 120px;">
            <el-option v-for="item in shipTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="targetShipNumber" placeholder="目标船号" style="width: 140px;">
            <el-option v-for="item in targetShipNumbers" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelCopyRule">取消</el-button>
        <el-button type="primary" @click="confirmCopyRule">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped>
.pmc-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.section-block {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
}

.bottom-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-row {
  margin-bottom: 10px;
  overflow-x: auto;
}

.rule-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.rule-table-wrap {
  border: 1px solid #ebeef5;
}

.table-title {
  background-color: #f5f7fa;
  padding: 5px 10px;
  font-weight: bold;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
}

.main-table-wrap {
  flex: 1;
  overflow: auto;
}

.main-table-wrap :deep(.el-table) {
  min-width: 900px;
}

:deep(.el-table__header) th {
  background-color: #eef1f6 !important;
  color: #606266;
  font-weight: bold;
  text-align: center !important;
}

:deep(.el-table__body) td {
  text-align: center !important;
}

:deep(.el-input__inner) {
  text-align: center;
}
</style>
