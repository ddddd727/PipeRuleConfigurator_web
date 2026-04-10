<template>
  <div class="piping-spec-page">
    <el-container class="main-layout">
      <el-aside :width="isTreeCollapsed ? '0px' : '280px'" :class="['tree-aside', { collapsed: isTreeCollapsed }]">
        <div class="tree-title">
          <el-icon><Menu /></el-icon>
          <span>{{ currentTitle }}</span>
        </div>

        <div class="tree-content" v-loading="treeLoading" element-loading-text="加载中...">
          <div class="tree-header">
            <el-input
              v-model="filterText"
              placeholder="搜索目录..."
              clearable
              :prefix-icon="Search"
            />
            <div class="tree-actions">
              <el-button text class="tree-action-button">+</el-button>
              <el-button text class="tree-action-button" :icon="CopyDocument" />
            </div>
          </div>

          <div class="tree-wrapper">
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="defaultProps"
              node-key="fullPath"
              highlight-current
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <el-icon v-if="data.children?.length" class="folder-icon"><Folder /></el-icon>
                  <el-icon v-else class="file-icon"><Document /></el-icon>
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>
      </el-aside>

      <el-main class="content-main">
        <div v-if="selectedNode" class="detail-container">
          <el-card shadow="never" class="info-card">
            <template #header>
              <div class="card-header">
                <div class="header-title-group">
                  <div class="collapse-trigger" @click="toggleTreePanel">
                    <el-icon :size="16">
                      <component :is="isTreeCollapsed ? Expand : Fold" />
                    </el-icon>
                  </div>
                  <div class="header-main">
                    <span class="title">部件类型基础</span>
                    <span class="subtitle">筛选条件默认展示当前节点首条基础数据</span>
                  </div>
                </div>
                <div class="header-actions">
                  <el-button type="primary" plain :icon="Upload">导入</el-button>
                  <el-button type="primary" plain :icon="Download">导出</el-button>
                  <el-button type="primary" :icon="Plus" @click="openSaveAsDialog">新增</el-button>
                </div>
              </div>
            </template>

            <div class="info-form-container">
              <el-form :model="filterForm" label-width="180px" class="info-form">
                <el-row :gutter="20">
                  <el-col v-for="field in baseFormFields" :key="field.key" :span="8">
                    <el-form-item :label="field.label">
                      <el-select
                        v-if="field.control === 'select'"
                        v-model="filterForm[field.modelKey]"
                        class="base-field-control"
                      >
                        <el-option
                          v-for="opt in field.options"
                          :key="opt"
                          :label="opt"
                          :value="opt"
                        />
                      </el-select>
                      <el-input v-else class="base-field-control" :model-value="currentBaseRow[field.key] ?? ''" readonly />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-card>

          <div class="tables-panel">
            <section v-if="showAppearanceGroup" class="data-section data-section-full">
              <div class="data-section-header">
                <div class="data-section-title">外形重量重心描述</div>
                <div class="data-section-actions">
                  <el-button type="primary" :icon="Plus" @click="handleAddRow('appearance')">新增</el-button>
                  <el-button type="warning" :icon="Edit" @click="handleEditAppearanceRow">修改</el-button>
                  <el-button :type="appearanceStatusActionType" :icon="appearanceStatusActionIcon" @click="handleAppearanceStatusAction">
                    {{ appearanceStatusActionText }}
                  </el-button>
                </div>
              </div>
              <div class="table-wrapper" v-loading="appearanceLoading" element-loading-text="加载中...">
                <el-table
                  ref="appearanceTableRef"
                  :data="appearanceData"
                  border
                  height="100%"
                  :row-class-name="tableRowClassName"
                  @row-click="handleAppearanceRowClick"
                  @selection-change="handleAppearanceSelectionChange"
                >
                  <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                  <el-table-column
                    v-for="col in visibleAppearanceColumns"
                    :key="col.prop"
                    :prop="col.prop"
                    :label="col.label"
                    :min-width="col.minWidth || 140"
                    show-overflow-tooltip
                  />
                </el-table>
              </div>
            </section>
            <section v-else class="data-section data-section-full">
              <el-empty description="当前节点暂无外形重量重心描述数据" />
            </section>
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty description="请选择左侧目录查看详情" />
        </div>
      </el-main>
    </el-container>

    <el-dialog v-model="saveAsDialogVisible" title="另存为部件类型基础" width="720px">
      <el-form :model="saveAsForm" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准">
              <el-select v-model="saveAsForm.manufacturingStd" style="width: 100%">
                <el-option v-for="opt in baseOptions.manufacturingStdOptions" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="IndustryCommodityCode">
              <el-select v-model="saveAsForm.IndustryCommodityCode" style="width: 100%">
                <el-option v-for="opt in baseOptions.ccCodeOptions" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12" v-if="hasScheduleThicknessFilter">
            <el-form-item label="ScheduleThickness">
              <el-select v-model="saveAsForm.scheduleThickness" style="width: 100%">
                <el-option v-for="opt in baseOptions.scheduleThicknessOptions" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="MaterialGrade">
              <el-select v-model="saveAsForm.material" style="width: 100%">
                <el-option v-for="opt in baseOptions.materialGradeOptions" :key="opt" :label="opt" :value="opt" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSaveAs">保存</el-button>
          <el-button @click="saveAsDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="appearanceAddDialogVisible" :title="appearanceDialogTitle" width="920px">
      <el-form :model="appearanceAddForm" label-width="180px" class="appearance-add-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="IndustryCommodityCode">
              <el-select v-model="appearanceAddForm.IndustryCommodityCode" style="width: 100%" :filterable="false" :allow-create="false">
                <el-option
                  v-for="opt in appearanceFieldOptions.IndustryCommodityCode"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-for="(row, rowIndex) in appearancePairRows" :key="`pair-${rowIndex}`" :gutter="20">
          <el-col v-for="field in row" :key="field.key" :span="12">
            <el-form-item :label="field.label">
              <el-input
                v-if="field.control === 'input'"
                :model-value="appearanceAddForm[field.key]"
                type="text"
                :inputmode="field.inputmode"
                @update:model-value="handleAppearancePairFieldChange(field.key, $event)"
              />
              <el-select
                v-else
                :model-value="appearanceAddForm[field.key]"
                style="width: 100%"
                :filterable="false"
                :allow-create="false"
                @update:model-value="handleAppearancePairFieldChange(field.key, $event)"
              >
                <el-option
                  v-for="opt in appearanceFieldOptions[field.key] || []"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-for="(row, rowIndex) in appearanceDialogRows" :key="`normal-${rowIndex}`" :gutter="20">
          <el-col v-for="field in row" :key="field.key" :span="12">
            <el-form-item :label="field.label">
              <el-input
                v-if="field.control === 'input'"
                v-model="appearanceAddForm[field.key]"
                type="text"
                :inputmode="field.inputmode"
              />
              <el-select v-else v-model="appearanceAddForm[field.key]" style="width: 100%" :filterable="false" :allow-create="false">
                <el-option
                  v-for="opt in appearanceFieldOptions[field.key] || []"
                  :key="opt"
                  :label="opt"
                  :value="opt"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitAppearanceDialog">保存</el-button>
          <el-button @click="appearanceAddDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  CircleClose,
  CopyDocument,
  Document,
  Download,
  Edit,
  Expand,
  Fold,
  Folder,
  Menu,
  Plus,
  RefreshRight,
  Search,
  Upload
} from '@element-plus/icons-vue'
import {
  disablePipingRows,
  getPipingBaseOptions,
  getPipingComponentAppearanceData,
  getPipingComponentBaseData,
  getPipingSpecTree,
  savePipingComponentBase
} from '@/apps/product-standard/features/piping-spec-management/api/pipingSpecAPI'

const route = useRoute()
const currentTitle = computed(() => route.meta.title || 'S3D部件数据管理')

const treeRef = ref(null)
const appearanceTableRef = ref(null)

const filterText = ref('')
const treeLoading = ref(false)
const appearanceLoading = ref(false)

const treeData = ref([])
const selectedNode = ref(null)
const selectedCategory = ref('')
const baseRows = ref([])
const appearanceData = ref([])
const appearanceSelection = ref([])
const isTreeCollapsed = ref(false)

const filterForm = ref({
  IndustryCommodityCode: '/',
  scheduleThickness: '/',
  materialGrade: '/'
})

const baseOptions = ref({
  manufacturingStdOptions: [],
  ccCodeOptions: [],
  scheduleThicknessOptions: [],
  materialGradeOptions: []
})

const saveAsDialogVisible = ref(false)
const saveAsForm = ref({
  manufacturingStd: '',
  IndustryCommodityCode: '',
  scheduleThickness: '',
  material: ''
})
const appearanceAddDialogVisible = ref(false)
const appearanceDialogMode = ref('add')
const appearanceAddForm = ref({})
const appearanceLocalRows = ref({})
const appearanceEditTarget = ref(null)

const defaultProps = {
  children: 'children',
  label: 'label'
}

const toggleTreePanel = () => {
  isTreeCollapsed.value = !isTreeCollapsed.value
}

const appearanceFieldOrderMap = {
  pipe: [
    'IndustryCommodityCode',
    'NPD[1]',
    'NpdUnitType[1]',
    'NPD[2]',
    'NpdUnitType[2]',
    'EndPreparation[1]',
    'ScheduleThickness[1]',
    'EndPreparation[2]',
    'ScheduleThickness[2]',
    'Density',
    'PurchaseLength',
    'MinimumPipeLength',
    'MaximumPipeLength',
    'WeightPerUnitLength',
    'PartDescription',
    'MaterialsMgmtIdent'
  ],
  pipeComponent: [
    'IndustryCommodityCode',
    'NPD[1]',
    'NpdUnitType[1]',
    'NPD[2]',
    'NpdUnitType[2]',
    'EndPreparation[1]',
    'ScheduleThickness[1]',
    'EndPreparation[2]',
    'ScheduleThickness[2]',
    'DryWeight',
    'DryCogX',
    'DryCogY',
    'DryCogZ',
    'PartDescription',
    'MaterialsMgmtIdent',
    'BendRadius'
  ]
}

const numericAppearanceFields = new Set([
  'NPD[1]',
  'NPD[2]',
  'Density',
  'PurchaseLength',
  'MinimumPipeLength',
  'MaximumPipeLength',
  'WeightPerUnitLength',
  'DryWeight',
  'DryCogX',
  'DryCogY',
  'DryCogZ',
  'BendRadius'
])

const appearanceTextInputFields = new Set(['PartDescription'])

const appearanceFieldOptionPresets = {
  IndustryCommodityCode: ['PIPE001', 'PIPE002', 'PIPE003', 'PCELB45-001', 'PCELB45-002', 'PCSLEEV-001', 'PCSLEEV-002'],
  'NpdUnitType[1]': ['mm', 'inch'],
  'NpdUnitType[2]': ['mm', 'inch'],
  'EndPreparation[1]': ['BW', 'SW', 'THD'],
  'EndPreparation[2]': ['BW', 'SW', 'THD'],
  'ScheduleThickness[1]': ['Sch.40', 'Sch.80', 'STD', 'XS'],
  'ScheduleThickness[2]': ['Sch.40', 'Sch.80', 'STD', 'XS'],
  MaterialsMgmtIdent: ['MAT-PIPE-001', 'MAT-PIPE-002', 'MAT-ELB-001', 'MAT-SLEEV-001']
}

const appearanceFieldLabelMap = {
  IndustryCommodityCode: 'IndustryCommodityCode',
  'NPD[1]': 'NPD[1]',
  'NpdUnitType[1]': 'NpdUnitType[1]',
  'NPD[2]': 'NPD[2]',
  'NpdUnitType[2]': 'NpdUnitType[2]',
  'EndPreparation[1]': 'EndPreparation[1]',
  'EndPreparation[2]': 'EndPreparation[2]',
  'ScheduleThickness[1]': 'ScheduleThickness[1]',
  'ScheduleThickness[2]': 'ScheduleThickness[2]',
  Density: 'Density',
  PurchaseLength: 'PurchaseLength',
  MinimumPipeLength: 'MinimumPipeLength',
  MaximumPipeLength: 'MaximumPipeLength',
  WeightPerUnitLength: 'WeightPerUnitLength',
  PartDescription: 'PartDescription',
  MaterialsMgmtIdent: 'MaterialsMgmtIdent',
  DryWeight: 'DryWeight',
  DryCogX: 'DryCogX',
  DryCogY: 'DryCogY',
  DryCogZ: 'DryCogZ',
  BendRadius: 'BendRadius'
}

const buildAppearanceFieldMeta = (key) => ({
  key,
  label: appearanceFieldLabelMap[key] || key,
  control: numericAppearanceFields.has(key) || appearanceTextInputFields.has(key) ? 'input' : 'select',
  inputmode: numericAppearanceFields.has(key) ? 'decimal' : undefined
})

const detailFields = computed(() => {
  const hidden = new Set(['status'])
  const row = currentBaseRow.value
  return Object.keys(row)
    .filter((key) => !hidden.has(key) && !['IndustryCommodityCode', 'ScheduleThickness', 'MaterialGrade'].includes(key))
    .slice(0, 9)
    .map((key) => ({ key, label: key }))
})

const baseFormFields = computed(() => {
  const fields = [
    {
      key: 'IndustryCommodityCode',
      label: 'IndustryCommodityCode',
      control: 'select',
      modelKey: 'IndustryCommodityCode',
      options: industryCommodityCodeOptions.value
    }
  ]

  if (hasScheduleThicknessFilter.value) {
    fields.push({
      key: 'ScheduleThickness',
      label: 'ScheduleThickness',
      control: 'select',
      modelKey: 'scheduleThickness',
      options: scheduleThicknessOptions.value
    })
  }

  fields.push({
    key: 'MaterialGrade',
    label: 'MaterialGrade',
    control: 'select',
    modelKey: 'materialGrade',
    options: materialGradeOptions.value
  })

  return [...fields, ...detailFields.value.map((field) => ({ ...field, control: 'input' }))]
})

const currentBaseRow = computed(() => {
  if (!baseRows.value.length) return {}
  const targetCode = filterForm.value.IndustryCommodityCode
  const targetMaterial = filterForm.value.materialGrade
  const targetSchedule = filterForm.value.scheduleThickness

  return baseRows.value.find((row) => {
    const codeOk = !targetCode || targetCode === '/' || row.IndustryCommodityCode === targetCode
    const materialOk = !targetMaterial || targetMaterial === '/' || row.MaterialGrade === targetMaterial
    const scheduleOk = !targetSchedule || targetSchedule === '/' || row.ScheduleThickness === targetSchedule
    return codeOk && materialOk && scheduleOk
  }) || baseRows.value[0]
})

const industryCommodityCodeOptions = computed(() => {
  const values = Array.from(new Set(baseRows.value.map((row) => row.IndustryCommodityCode).filter(Boolean)))
  return ['/', ...values]
})

const scheduleThicknessOptions = computed(() => {
  const values = Array.from(new Set(baseRows.value.map((row) => row.ScheduleThickness).filter(Boolean)))
  return ['/', ...values]
})

const materialGradeOptions = computed(() => {
  const values = Array.from(new Set(baseRows.value.map((row) => row.MaterialGrade).filter(Boolean)))
  return ['/', ...values]
})

const hasScheduleThicknessFilter = computed(() => scheduleThicknessOptions.value.length > 1)

const showAppearanceGroup = computed(() => ['pipe', 'pipeComponent'].includes(selectedCategory.value))

const isAppearanceRestoreMode = computed(
  () => appearanceSelection.value.length > 0 && appearanceSelection.value.every((row) => row.status === 0)
)

const appearanceStatusActionText = computed(() => (isAppearanceRestoreMode.value ? '恢复' : '禁用'))
const appearanceStatusActionType = computed(() => (isAppearanceRestoreMode.value ? 'success' : 'danger'))
const appearanceStatusActionIcon = computed(() => (isAppearanceRestoreMode.value ? RefreshRight : CircleClose))
const appearanceDialogTitle = computed(() => (appearanceDialogMode.value === 'edit' ? '修改外形重量重心描述' : '新增外形重量重心描述'))

const visibleAppearanceColumns = computed(() => {
  if (!appearanceData.value.length) return []
  return Object.keys(appearanceData.value[0])
    .filter((key) => !['status', 'GeometricIndustryStandard'].includes(key))
    .map((key) => ({ prop: key, label: key }))
})

const appearanceRowSeed = computed(() => appearanceSelection.value[0] || appearanceData.value[0] || {})

const appearanceFieldOptions = computed(() => {
  const optionMap = {}
  const rows = [...appearanceData.value, ...(appearanceLocalRows.value[getAppearanceStorageKey()] || [])]
  Object.keys(appearanceFieldOptionPresets).forEach((key) => {
    optionMap[key] = [...appearanceFieldOptionPresets[key]]
  })

  rows.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || key === 'status') return
      if (!optionMap[key]) optionMap[key] = []
      if (!optionMap[key].includes(String(value))) optionMap[key].push(String(value))
    })
  })

  if (currentBaseRow.value?.IndustryCommodityCode) {
    optionMap.IndustryCommodityCode = optionMap.IndustryCommodityCode || []
    if (!optionMap.IndustryCommodityCode.includes(currentBaseRow.value.IndustryCommodityCode)) {
      optionMap.IndustryCommodityCode.unshift(currentBaseRow.value.IndustryCommodityCode)
    }
  }

  return optionMap
})

const appearanceDialogRows = computed(() => {
  const seedKeys = Object.keys(appearanceRowSeed.value || {})
  const pairedKeys = new Set()
  ;(appearanceFieldOrderMap[selectedCategory.value] || []).forEach((key) => {
    if (/\[(1|2)\]$/.test(key)) pairedKeys.add(key)
  })

  const order = (appearanceFieldOrderMap[selectedCategory.value] || []).filter(
    (key) => seedKeys.length === 0 || key === 'IndustryCommodityCode' || seedKeys.includes(key)
  ).filter(
    (key) => !['IndustryCommodityCode', 'status'].includes(key) && !pairedKeys.has(key)
  )

  const fields = order.map(buildAppearanceFieldMeta)

  const rows = []
  for (let i = 0; i < fields.length; i += 2) {
    rows.push(fields.slice(i, i + 2))
  }
  return rows
})

const appearancePairRows = computed(() => {
  const seedKeys = Object.keys(appearanceRowSeed.value || {})
  const order = appearanceFieldOrderMap[selectedCategory.value] || []
  const pairBases = []
  const seenBases = new Set()

  order.forEach((key) => {
    const match = key.match(/^(.*)\[(1|2)\]$/)
    if (!match) return
    const base = match[1]
    if (seenBases.has(base)) return
    const key1 = `${base}[1]`
    const key2 = `${base}[2]`
    const hasKey1 = seedKeys.length === 0 || seedKeys.includes(key1)
    const hasKey2 = seedKeys.length === 0 || seedKeys.includes(key2)
    if (hasKey1 || hasKey2) {
      pairBases.push([key1, key2])
      seenBases.add(base)
    }
  })

  return pairBases.map((pair) => pair.map(buildAppearanceFieldMeta))
})

const transformPathsToTree = (paths) => {
  const root = []

  paths.forEach((item) => {
    const parts = [item.level1, item.level2, item.level3, item.level4].filter(Boolean)
    if (!parts.length) return

    let nodes = root
    let fullPath = ''

    parts.forEach((part, index) => {
      fullPath = fullPath ? `${fullPath}|${part}` : part
      let node = nodes.find((entry) => entry.label === part)
      if (!node) {
        node = { label: part, fullPath, children: [] }
        nodes.push(node)
      }
      if (index === parts.length - 1) node.raw = item
      nodes = node.children
    })
  })

  return root
}

const filterNode = (value, data) => {
  if (!value) return true
  return String(data.label || '').toLowerCase().includes(value.toLowerCase())
}

const getAppearanceStorageKey = () => `${selectedNode.value?.fullPath || ''}::${selectedCategory.value || ''}`

const filterAppearanceRows = (rows) => {
  const filters = buildQueryFilters()
  return (rows || []).filter((row) => {
    if (filters.IndustryCommodityCode && row.IndustryCommodityCode !== filters.IndustryCommodityCode) return false
    if (filters.scheduleThickness) {
      const value1 = row['ScheduleThickness[1]']
      const value2 = row['ScheduleThickness[2]']
      if ((value1 || value2) && value1 !== filters.scheduleThickness && value2 !== filters.scheduleThickness) return false
    }
    return true
  })
}

const buildAppearanceFormDefaults = (seed = {}) => {
  const form = {}
  const order = appearanceFieldOrderMap[selectedCategory.value] || []

  order.forEach((key) => {
    form[key] = seed[key] ?? ''
  })

  return form
}

const normalizeAppearanceRow = (form) => {
  const normalized = {}
  Object.entries(form).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      normalized[key] = ''
      return
    }
    normalized[key] = numericAppearanceFields.has(key) ? Number(value) : value
  })
  normalized.status = 1
  return normalized
}

const handleAppearancePairFieldChange = (key, value) => {
  const normalizedValue = value ?? ''
  if (!/\[1\]$/.test(key)) {
    appearanceAddForm.value[key] = normalizedValue
    return
  }

  const pairedKey = key.replace(/\[1\]$/, '[2]')
  const previousValue = appearanceAddForm.value[key] ?? ''
  const pairedValue = appearanceAddForm.value[pairedKey] ?? ''
  const shouldSyncPair = pairedValue === '' || pairedValue === previousValue

  appearanceAddForm.value[key] = normalizedValue

  if (shouldSyncPair) {
    appearanceAddForm.value[pairedKey] = normalizedValue
  }
}

const loadTreeData = async () => {
  treeLoading.value = true
  try {
    const res = await getPipingSpecTree()
    treeData.value = transformPathsToTree(res || [])
  } catch (error) {
    console.error('加载管系专业目录树失败:', error)
    treeData.value = []
  } finally {
    treeLoading.value = false
  }
}

const loadBaseOptions = async () => {
  try {
    const res = await getPipingBaseOptions()
    Object.assign(baseOptions.value, res || {})
  } catch (error) {
    console.error('加载基础选项失败:', error)
  }
}

const buildQueryFilters = () => {
  const params = {}
  if (filterForm.value.IndustryCommodityCode && filterForm.value.IndustryCommodityCode !== '/') {
    params.IndustryCommodityCode = filterForm.value.IndustryCommodityCode
  }
  if (filterForm.value.scheduleThickness && filterForm.value.scheduleThickness !== '/') {
    params.scheduleThickness = filterForm.value.scheduleThickness
  }
  return params
}

const syncFilterForm = () => {
  const row = baseRows.value[0]
  if (!row) return
  filterForm.value = {
    IndustryCommodityCode: row.IndustryCommodityCode || '/',
    scheduleThickness: row.ScheduleThickness || '/',
    materialGrade: row.MaterialGrade || '/'
  }
}

const loadBaseData = async () => {
  if (!selectedNode.value) return
  try {
    const res = await getPipingComponentBaseData(selectedNode.value.label, selectedCategory.value)
    baseRows.value = res || []
    syncFilterForm()
  } catch (error) {
    console.error('加载基础数据失败:', error)
    baseRows.value = []
  }
}

const loadAppearanceData = async () => {
  if (!selectedNode.value || !showAppearanceGroup.value) {
    appearanceData.value = []
    return
  }
  appearanceLoading.value = true
  try {
    const res = await getPipingComponentAppearanceData(selectedNode.value.label, selectedCategory.value, buildQueryFilters())
    const localRows = filterAppearanceRows(appearanceLocalRows.value[getAppearanceStorageKey()] || [])
    appearanceData.value = [...(res || []), ...localRows]
  } catch (error) {
    console.error('加载外形重量重心数据失败:', error)
    appearanceData.value = []
  } finally {
    appearanceLoading.value = false
  }
}

const handleNodeClick = async (data) => {
  if (data.children?.length) return
  selectedNode.value = { label: data.label, fullPath: data.fullPath }
  selectedCategory.value = String(data.raw?.category || '')
  await loadBaseData()
  await loadAppearanceData()
}

const openSaveAsDialog = () => {
  const row = currentBaseRow.value || {}
  saveAsForm.value = {
    manufacturingStd: row.GeometricIndustryStandard || '',
    IndustryCommodityCode: row.IndustryCommodityCode || '',
    scheduleThickness: row.ScheduleThickness || '',
    material: row.MaterialGrade || ''
  }
  saveAsDialogVisible.value = true
}

const handleSaveAs = async () => {
  if (!selectedNode.value) return
  try {
    await savePipingComponentBase({
      isSaveAs: true,
      oldNodeLabel: selectedNode.value.fullPath,
      category: selectedCategory.value,
      newNodeData: {
        manufacturingStd: saveAsForm.value.manufacturingStd,
        IndustryCommodityCode: saveAsForm.value.IndustryCommodityCode,
        ccCode: saveAsForm.value.IndustryCommodityCode,
        scheduleThickness: saveAsForm.value.scheduleThickness,
        material: saveAsForm.value.material
      }
    })
    ElMessage.success('保存成功')
    await loadTreeData()
  } catch (error) {
    console.error('另存为失败:', error)
  }
}
const handleAddRow = (section) => {
  if (section !== 'appearance') {
    ElMessage.info('当前数据的新增功能先保留为展示入口，后续可继续补充表单')
    return
  }
  appearanceDialogMode.value = 'add'
  appearanceEditTarget.value = null
  appearanceAddForm.value = buildAppearanceFormDefaults(appearanceSelection.value[0] || {})
  appearanceAddDialogVisible.value = true
}

const handleEditAppearanceRow = () => {
  if (appearanceSelection.value.length !== 1) {
    ElMessage.warning('请选中一行数据进行修改')
    return
  }
  appearanceDialogMode.value = 'edit'
  appearanceEditTarget.value = appearanceSelection.value[0]
  appearanceAddForm.value = buildAppearanceFormDefaults(appearanceSelection.value[0])
  appearanceAddDialogVisible.value = true
}

const handleSaveAppearanceAdd = () => {
  const newRow = normalizeAppearanceRow(appearanceAddForm.value)
  const storageKey = getAppearanceStorageKey()
  const currentRows = appearanceLocalRows.value[storageKey] || []
  appearanceLocalRows.value = {
    ...appearanceLocalRows.value,
    [storageKey]: [...currentRows, newRow]
  }

  if (filterAppearanceRows([newRow]).length) {
    appearanceData.value = [...appearanceData.value, newRow]
  }

  appearanceAddDialogVisible.value = false
  appearanceEditTarget.value = null
  ElMessage.success('新增成功')
}

const handleSaveAppearanceEdit = () => {
  if (!appearanceEditTarget.value) {
    ElMessage.warning('请先选择一行要修改的数据')
    return
  }
  const status = appearanceEditTarget.value.status
  const updatedRow = {
    ...normalizeAppearanceRow(appearanceAddForm.value),
    status
  }
  Object.assign(appearanceEditTarget.value, updatedRow)
  appearanceAddDialogVisible.value = false
  appearanceTableRef.value?.clearSelection()
  appearanceSelection.value = []
  appearanceEditTarget.value = null
  ElMessage.success('修改成功')
}

const handleSubmitAppearanceDialog = () => {
  if (appearanceDialogMode.value === 'edit') {
    handleSaveAppearanceEdit()
    return
  }
  handleSaveAppearanceAdd()
}

const handleAppearanceStatusAction = async () => {
  const rows = appearanceSelection.value
  if (!rows.length) {
    ElMessage.warning('请至少选择一行数据')
    return
  }

  if (isAppearanceRestoreMode.value) {
    rows.forEach((row) => {
      row.status = 1
    })
    appearanceTableRef.value?.clearSelection()
    appearanceSelection.value = []
    ElMessage.success('恢复成功')
    return
  }

  const activeRows = rows.filter((row) => row.status !== 0)
  if (!activeRows.length) {
    ElMessage.warning('请至少选择一行可禁用的数据')
    return
  }

  await disablePipingRows(activeRows)
  activeRows.forEach((row) => {
    row.status = 0
  })
  appearanceTableRef.value?.clearSelection()
  appearanceSelection.value = []
  ElMessage.success('禁用成功')
}

const handleAppearanceSelectionChange = (rows) => {
  appearanceSelection.value = rows
}

const handleAppearanceRowClick = (row) => {
  appearanceTableRef.value?.toggleRowSelection(row)
}

const checkSelectable = (row) => Boolean(row)

const tableRowClassName = ({ row }) => (row.status === 0 ? 'is-disabled-row' : '')

onMounted(() => {
  loadTreeData()
  loadBaseOptions()
})

watch(filterText, (value) => {
  treeRef.value?.filter(value)
})

watch(
  () => [filterForm.value.IndustryCommodityCode, filterForm.value.scheduleThickness],
  () => {
    if (!selectedNode.value) return
    loadAppearanceData()
  }
)
</script>

<style scoped>
.piping-spec-page {
  height: 100%;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.main-layout {
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.tree-aside {
  border-right: 1px solid #ebeef5;
  background: #fff;
  min-height: 0;
  overflow: hidden;
  transition: width 0.2s ease, border-color 0.2s ease;
}

.tree-aside.collapsed {
  border-right-color: transparent;
}

.tree-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
}

.tree-content {
  height: calc(100% - 57px);
  display: flex;
  flex-direction: column;
}

.tree-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.tree-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 2px;
  margin-bottom: -8px;
}

.tree-action-button {
  padding: 0;
  min-height: auto;
  min-width: auto;
  font-size: 18px;
  line-height: 1;
  color: #606266;
}

.tree-action-button:hover {
  color: #409eff;
}

.tree-wrapper {
  flex: 1;
  overflow: auto;
  padding: 12px 8px 16px;
}

.custom-tree-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.folder-icon,
.file-icon {
  color: #409eff;
}

.content-main {
  background: #f7f8fa;
  min-height: 0;
  overflow: hidden;
  padding: 10px;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
}

.info-card {
  flex: 0 0 auto;
}

.info-card :deep(.el-card__header) {
  padding: 12px 14px;
}

.info-card :deep(.el-card__body) {
  padding: 10px 14px 12px;
}

.info-form-container {
  padding-top: 2px;
}

.base-field-control {
  width: 90%;
}

.tables-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.data-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 10px 8px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  background: #fff;
}

.data-section-full {
  height: 100%;
}

.data-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.data-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.data-section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
}

.table-wrapper :deep(.el-table th.el-table__cell) {
  background: #f2f6fc;
  text-align: center;
}

.table-wrapper :deep(.el-table td.el-table__cell) {
  text-align: center;
}

.table-wrapper :deep(.el-table .cell) {
  text-align: center;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.header-title-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.collapse-trigger {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: #606266;
}

.collapse-trigger:hover {
  background-color: rgba(64, 158, 255, 0.12);
  color: #409eff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-right: 10px;
}

.subtitle {
  color: #909399;
  font-size: 13px;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.is-disabled-row) {
  color: #b1b3b8;
  background: #f5f7fa;
}
</style>
