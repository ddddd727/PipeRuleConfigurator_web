<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// --- Data & State ---

// 1. Ship Selection
const shipTypes = ref([
  { label: '散货船', value: 'bulk' },
  { label: '集装箱船', value: 'container' }
])
const selectedShipType = ref('')
const shipNumbers = ref([]) // 动态加载
const selectedShipNumber = ref('')

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

// 获取规则下拉列表（pipe-limit 改为后端 AB2B3C2 的 RuleName）
const fetchRuleOptions = async (type) => {
  try {
    if (type === 'pipe-limit') {
    //   const res = await axios.get('/api/rules/ab2b3c2')
    //   const arr = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
    //   const names = [...new Set(arr.map(x => x.ruleName).filter(x => x))]
    //   pipeLimitRules.value = names.map(n => ({ label: n, value: n }))
    //   return
      const res = await axios.get(`/api/pmc/rules/list?type=pipe-limit`)
      pipeLimitRules.value = res.data?.data ?? []
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
  fetchRuleOptions('main-material')
  fetchRuleOptions('flange')
  fetchRuleOptions('pipe-limit')
})

// 获取船号
const fetchShipNumbers = async (type) => {
  if (!type) {
    shipNumbers.value = []
    selectedShipNumber.value = ''
    return
  }
  try {
    const res = await axios.get(`/api/pmc/ship-numbers?type=${type}`)
    if (res.data.code === 200) {
      shipNumbers.value = res.data.data
      selectedShipNumber.value = '' // 重置选中
    }
  } catch (error) {
    console.error('Fetch ship numbers failed:', error)
    ElMessage.error('获取船号失败')
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
    const res = await axios.get(`/api/pmc/rules/main-material?ruleCode=${ruleCode}`)
    console.log('Main Material Response:', res.data)
    if (res.data.code === 200) {
      // Mock 返回的数据可能每次变动，这里直接赋值
      // 注意：Mock.mock() 生成的数据在 response.data.data 里
      mainMaterialData.value = res.data.data
    }
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
    const res = await axios.get(`/api/pmc/rules/flange?ruleCode=${ruleCode}`)
    console.log('Flange Response:', res.data)
    if (res.data.code === 200) {
      flangeData.value = res.data.data
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取法兰规则失败')
  }
}

// 获取管材限定规则内容（改为调用后端 AB2B3C2）
const fetchPipeLimitData = async (ruleCode) => {
  console.log('Fetching Pipe Limit Rule (AB2B3C2):', ruleCode)
  if (!ruleCode) {
    pipeLimitData.value = []
    return
  }
  try {
    // const res = await axios.get(`/api/rules/ab2b3c2`)
    // const arr = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
    // const filtered = ruleCode ? arr.filter(x => x.ruleName === ruleCode) : arr
    // pipeLimitData.value = filtered.map(item => ({
    //   id: item.id,
    //   grade: item.pipingClassId,
    //   std: item.pipingStandardId,
    //   gradeCode: item.materialsGradeId,
    //   press: item.pressureRatingId
    // }))
    // 使用 Mock 数据接口，选择规则后再显示
    const res = await axios.get(`/api/pmc/rules/pipe-limit?ruleCode=${ruleCode}`)
    const arr = res.data?.data ?? []
    pipeLimitData.value = arr
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
const optionsA = ref(['I', 'II', 'III', '3'])
const optionsB1 = ref(['碳钢管', '不锈钢管'])
const optionsB2 = ref(['GB/T 8163', 'GB/T 14976'])
const optionsB3 = ref(['20#', '304', '316L'])
const optionsC1 = ref(['GB2506', 'GB/T 9119'])
const optionsC2 = ref(['6bar', '10bar', '16bar', '20bar'])
const optionsD = ref(['SCH40', 'SCH80', 'SCH160'])

// Save Data (API Placeholder)
const saveToApi = () => {
  // Placeholder for saving resultData to backend
  console.log('Saving resultData to API...', resultData.value)
  alert('保存成功')
}

// Refresh Data (API Placeholder)
const refreshData = () => {
  // Placeholder for querying data based on shipType/shipNumber
  console.log(`Refreshing data for ${selectedShipType.value} - ${selectedShipNumber.value}`)
  alert('刷新成功')
}

// Add Button Click -> Open Dialog
const handleAdd = () => {
  dialogTitle.value = '新增 PMC 数据'
  currentEditingId.value = null
  formData.value = { a: '', b1: '', b2: '', b3: '', c1: '', c2: '', d: '' }
  editDialogVisible.value = true
}

// Double Click Row -> Open Edit Dialog
// const handleRowDblClick = (row) => {
//   dialogTitle.value = '编辑 PMC 数据'
//   currentEditingId.value = row.id
//   // Copy row data to form (excluding pmc and id)
//   formData.value = {
//     a: row.a,
//     b1: row.b1,
//     b2: row.b2,
//     b3: row.b3,
//     c1: row.c1,
//     c2: row.c2,
//     d: row.d
//   }
//   editDialogVisible.value = true
// }

// Save Dialog Data
const saveDialogData = () => {
  // Generate PMC Code automatically: A + B1 + B2 + B3 + C1 + C2 + D
  // Note: Using raw values for now. In real scenario, might need code mapping.
  // Assuming the dropdown values ARE the codes or we construct it simply.
  // The requirement says "Auto fill PMC code". Let's concat them.
  // If dropdowns show labels (e.g. "Carbon Steel"), we might need separate value fields.
  // For this mock, we assume the selected value is what goes into the code/table.
  
  const { a, b1, b2, b3, c1, c2, d } = formData.value
  
  // Simple concatenation for PMC generation demo. 
  // Adjust logic if PMC needs specific codes instead of full text (e.g. 'I' vs '1').
  // Based on previous context, PMC seems to use codes. 
  // Since we don't have the mapping here, we'll just concat the values or placeholders.
  // For better UX, let's assume the user selects codes or short values in dropdowns for now.
  const pmcCode = `${a}${b1}${b2}${b3}${c1}${c2}${d}` 

  if (currentEditingId.value === null) {
    // Add New
    const newId = resultData.value.length > 0 ? Math.max(...resultData.value.map(item => item.id)) + 1 : 1
    resultData.value.push({
      id: newId,
      ...formData.value,
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
  // Optionally auto-save to API
  // saveToApi()
}

// Cancel Dialog
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
const generatePmcCode = () => {
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
    // If AB2B3C2 is selected:
    // 1. Extract unique A values (grade)
    aValues = [...new Set(selectedPipeLimitRows.value.map(row => row.grade))]
    
    // 2. Build set of valid combinations for filtering (A, B2, B3, C2)
    selectedPipeLimitRows.value.forEach(row => {
      // Create a unique key for the combination: A|B2|B3|C2
      const key = `${row.grade}|${row.std}|${row.gradeCode}|${row.press}`
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
        if (usePipeLimit) {
          // Check if (A, B2, B3, C2) exists in the selected AB2B3C2 rows
          const key = `${a}|${b2}|${b3}|${c2}`
          if (!validCombinations.has(key)) {
            continue // Skip invalid combination
          }
        }

        // Generate PMC code
        const pmcCode = `${a}${b1}${b2}${b3}${c1}${c2}${d}`

        combinations.push({
          id: id++,
          a: a,
          b1: b1,
          b2: b2,
          b3: b3,
          c1: c1,
          c2: c2,
          d: d,
          pmc: pmcCode
        })
      }
    }
  }

  if (combinations.length === 0) {
    alert('没有符合校验要求的组合数据')
    return
  }

  // Add to resultData
  resultData.value = [...resultData.value, ...combinations]
  alert(`成功生成 ${combinations.length} 条PMC编码`)
}

// Copy Rule Dialog
const copyRuleDialogVisible = ref(false)
const sourceShipNumber = ref('')
const targetShipNumber = ref('')

// Open Copy Rule Dialog
const openCopyRuleDialog = () => {
  copyRuleDialogVisible.value = true
}

// Confirm Copy Rule
const confirmCopyRule = () => {
  // Here you would implement the copy logic
  console.log('Copy rule from', sourceShipNumber.value, 'to', targetShipNumber.value)
  copyRuleDialogVisible.value = false
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
      <div class="toolbar">
        <div class="left-tools">
          <el-select v-model="selectedShipType" placeholder="船型" style="width: 120px; margin-right: 10px;">
            <el-option v-for="item in shipTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="selectedShipNumber" placeholder="船号" style="width: 120px;margin-right: 30px;">
            <el-option v-for="item in shipNumbers" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" plain @click="generatePmcCode">生成7位编码</el-button>
        </div>
        <div class="right-tools">
          <!-- <el-button type="primary" plain>编辑</el-button>
          <el-button type="success" plain>保存</el-button> -->
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
              <el-table :data="mainMaterialData" border stripe size="small" height="200" @selection-change="handleMainMaterialSelectionChange">
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
              <el-table :data="flangeData" border stripe size="small" height="200" @selection-change="handleFlangeSelectionChange">
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
              <el-table :data="pipeLimitData" border stripe size="small" height="200" @selection-change="handlePipeLimitSelectionChange">
                <el-table-column type="selection" width="40" />
                <el-table-column prop="id" label="ID" width="40" />
                <el-table-column prop="grade" label="管材等级编码" />
                <el-table-column prop="std" label="管材标准编码" />
                <el-table-column prop="gradeCode" label="牌号编码" />
                <el-table-column prop="press" label="法兰压力等级编码" align="center"/>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Bottom Section -->
    <div class="section-block bottom-block">
      <!-- Bottom Toolbar -->
      <div class="toolbar">
        <div class="left-tools">
          <el-select v-model="selectedShipType" placeholder="船型" style="width: 120px; margin-right: 10px;">
            <el-option v-for="item in shipTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="selectedShipNumber" placeholder="船号" style="width: 120px; margin-right: 30px;">
            <el-option v-for="item in shipNumbers" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" plain @click="refreshData">刷新</el-button>
          <el-button type="primary" plain @click="handleAdd">增加</el-button>
          <el-button type="primary" plain @click="handleDelete">删除</el-button>
          <el-button type="primary" plain @click="saveToApi">保存</el-button>
          <el-button type="primary" plain @click="openCopyRuleDialog">从其他船号复制规则</el-button>
        </div>
      </div>

      <!-- Main Data Table -->
      <div class="main-table-wrap">
        <el-table 
          :data="resultData" 
          border 
          stripe 
          style="width: 100%" 
          height="400" 
          @selection-change="handleSelectionChange"
          @row-dblclick="handleRowDblClick"
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
          <el-option v-for="opt in optionsA" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="主材料 B1">
        <el-select v-model="formData.b1" placeholder="请选择">
          <el-option v-for="opt in optionsB1" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="管材标准 B2">
        <el-select v-model="formData.b2" placeholder="请选择">
          <el-option v-for="opt in optionsB2" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="牌号 B3">
        <el-select v-model="formData.b3" placeholder="请选择">
          <el-option v-for="opt in optionsB3" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="法兰标准 C1">
        <el-select v-model="formData.c1" placeholder="请选择">
          <el-option v-for="opt in optionsC1" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="法兰压力等级 C2">
        <el-select v-model="formData.c2" placeholder="请选择">
          <el-option v-for="opt in optionsC2" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>
      <el-form-item label="壁厚等级 D">
        <el-select v-model="formData.d" placeholder="请选择">
          <el-option v-for="opt in optionsD" :key="opt" :label="opt" :value="opt" />
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
        <el-select v-model="sourceShipNumber" placeholder="请选择数据源船号" style="width: 200px;">
          <el-option v-for="item in shipNumbers" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="目标船号">
        <el-select v-model="targetShipNumber" placeholder="请选择目标船号" style="width: 200px;">
          <el-option v-for="item in shipNumbers" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
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

console.log(mainMaterialData.value)

<style scoped>
.pmc-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
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
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rule-row {
  margin-bottom: 10px;
}

.rule-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 10px;
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
