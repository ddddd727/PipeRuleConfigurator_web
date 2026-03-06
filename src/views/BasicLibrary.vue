<template>
  <div class="basic-library-container" :class="{ 'aside-collapsed': isAsideCollapsed }">
    <el-container class="main-layout">
      <!-- 左侧目录树 -->
      <el-aside :width="isAsideCollapsed ? '0px' : '280px'" class="tree-aside">
        <div class="tree-title">
          <el-icon><Menu /></el-icon>
          <span v-show="!isAsideCollapsed">{{ currentTitle }}</span>
        </div>
        <div v-if="isPipeProfessional || isCodelistLibrary" class="tree-content">
          <div class="tree-header">
            <el-input
              v-show="!isAsideCollapsed"
              v-model="filterText"
              placeholder="搜索目录..."
              prefix-icon="Search"
              clearable
            />
            <div class="tree-actions">
              <el-button link :icon="Plus" />
              <el-button link :icon="FolderAdd" />
              <el-button link :icon="CopyDocument" />
            </div>
          </div>
          <div class="tree-wrapper">
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="defaultProps"
              :filter-node-method="filterNode"
              node-key="id"
              highlight-current
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <el-icon v-if="data.children" class="folder-icon"><Folder /></el-icon>
                  <el-icon v-else class="file-icon"><Document /></el-icon>
                  <span v-show="!isAsideCollapsed">{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </div>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="content-main">
        <template v-if="isPipeProfessional || isCodelistLibrary">
          <div v-if="selectedNode" class="detail-container">
            <!-- Codelist 专用界面 -->
            <template v-if="isCodelistLibrary">
              <el-card v-if="selectedNode.label === 'FlowDirection'" shadow="never" class="codelist-card">
                <template #header>
                  <div class="card-header codelist-header">
                    <div class="header-left">
                      <span class="title">{{ selectedNode.label }}</span>
                      <span class="subtitle">*本codelist表共1层关系</span>
                    </div>
                    <div class="header-center">
                      <el-input
                        v-model="codelistFilterText"
                        placeholder=""
                        class="search-input"
                      >
                        <template #append>
                          <el-button :icon="Search" />
                        </template>
                      </el-input>
                    </div>
                    <div class="header-right">
                      <el-button type="primary" :icon="Plus">新增</el-button>
                      <el-button type="danger" :icon="CircleClose">禁用</el-button>
                      <el-button type="info" plain :icon="Download">导出</el-button>
                    </div>
                  </div>
                </template>
                
                <div class="table-wrapper">
                  <el-table 
                    ref="codelistTableRef"
                    :data="codelistTableData" 
                    border 
                    stripe 
                    height="100%"
                    :row-class-name="tableRowClassName"
                    @row-click="handleCodelistRowClick"
                  >
                    <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                    <el-table-column prop="shortDesc" label="ShortDescription" min-width="150" />
                    <el-table-column prop="longDesc" label="LongDescription" min-width="300" />
                    <el-table-column prop="codeNum" label="Codelist Number" width="150" />
                  </el-table>
                </div>
              </el-card>
              <div v-else class="empty-state">
                <el-empty description="暂未配置该Codelist类型的界面" />
              </div>
            </template>

            <!-- 管系专业 界面 -->
            <template v-else-if="isPipeProfessional">
              <!-- 部件类型基础 -->
              <el-card shadow="never" class="info-card">
                <template #header>
                <div class="card-header">
                  <el-button link @click="toggleAside" class="aside-toggle-button">
                    <el-icon><Fold v-if="!isAsideCollapsed" /><Expand v-else /></el-icon>
                  </el-button>
                  <span class="title">部件类型基础</span>
                  <span class="subtitle">*筛选条件默认为主端口1</span>
                  <div class="header-btns">
                    <el-button type="primary" plain :icon="Plus" @click="handleAddBase">新增</el-button>
                    <el-button type="primary" plain :icon="Upload">导入</el-button>
                    <el-button type="primary" plain :icon="Download">导出</el-button>
                  </div>
                </div>
              </template>
              
              <div class="info-form-container">
                <el-form :model="componentDetails" label-width="140px" class="info-form">
                  <el-row :gutter="20">
                    <el-col v-for="item in firstRowItems" :key="item.key" :span="6">
                      <el-form-item :label="item.label + '：'">
                        <template v-if="item.type === 'filter'">
                          <el-select 
                            :model-value="filterForm[item.modelKey]" 
                            @update:model-value="val => filterForm[item.modelKey] = val"
                            style="width: 100%;"
                          >
                            <el-option v-for="opt in item.options" :key="opt" :label="opt" :value="opt" />
                          </el-select>
                        </template>
                        <template v-else>
                          <el-input v-model="componentDetails[item.key]" readonly />
                        </template>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="6" v-for="field in remainingDetailsFields" :key="field.key">
                      <el-form-item :label="field.label + '：'">
                        <el-input v-model="componentDetails[field.key]" readonly />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
            </el-card>
            </template>

            <!-- 数据页签 -->
            <template v-if="isPipeProfessional">
            <div class="tabs-container">
              <el-tabs v-model="activeTab" class="data-tabs" type="border-card">
                <el-tab-pane label="公用端面数据" name="common">
                  <div class="table-wrapper">
                    <el-table 
                    ref="commonTableRef"
                    :data="commonData" 
                    border 
                    stripe 
                    height="100%"
                    :row-class-name="tableRowClassName"
                    @row-click="handleRowClick"
                    @selection-change="handleCommonSelectionChange"
                    :cell-style="cellStyle"
                  >
                    <el-table-column type="selection" width="55" />
                    <el-table-column
                      v-for="col in visibleCommonColumns"
                      :key="col.prop"
                      :prop="col.prop"
                      :label="col.label"
                      :width="col.width"
                      :min-width="col.minWidth"
                      show-overflow-tooltip
                    />
                  </el-table>
                </div>
              </el-tab-pane>
              <el-tab-pane v-if="showAppearanceGroup" label="外形重量重心描述" name="appearance">
                <div class="table-wrapper">
                  <el-table 
                    ref="appearanceTableRef"
                    :data="appearanceData" 
                    border 
                    stripe 
                    height="100%"
                    :row-class-name="tableRowClassName"
                    @row-click="handleAppearanceRowClick"
                    @selection-change="handleAppearanceSelectionChange"
                    :cell-style="cellStyle"
                  >
                    <el-table-column type="selection" width="55" />
                    <el-table-column
                      v-for="col in visibleAppearanceColumns"
                      :key="col.prop"
                      :prop="col.prop"
                      :label="col.label"
                      :width="col.width"
                      :min-width="col.minWidth"
                      show-overflow-tooltip
                    />
                  </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
              <!-- 公用端面数据 tab 页的按钮 -->
              <div class="tab-header-actions" v-if="activeTab === 'common'">
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
                <el-button :type="statusButtonType" :icon="statusButtonIcon" @click="handleToggleStatus">{{ statusButtonText }}</el-button>
                <el-button type="warning" :icon="Edit">修改</el-button>
              </div>
              <!-- 外形重量重心描述 tab 页的按钮 -->
              <div class="tab-header-actions" v-if="activeTab === 'appearance' && showAppearanceGroup">
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
                <el-button :type="statusButtonType" :icon="statusButtonIcon" @click="handleToggleStatus">{{ statusButtonText }}</el-button>
                <el-button type="warning" :icon="Edit">修改</el-button>
              </div>
            </div>
            </template>
          </div>
          <div v-else class="empty-state">
            <el-empty description="请选择目录查看详情" />
          </div>
        </template>
        <div v-else class="empty-state">
          <el-empty :description="currentTitle + '模块 - 暂无内容'" />
        </div>
      </el-main>
      <!-- 新增部件类型基础弹窗 -->
      <el-dialog v-model="addBaseDialogVisible" title="新增部件类型基础" width="35%">
        <el-form :model="addBaseForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标准号">
                <el-input v-model="addBaseForm.manufacturingStd" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="CC码">
                <el-input v-model="addBaseForm.ccCode" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12" v-if="hasScheduleThicknessFilter">
              <el-form-item label="壁厚等级">
                <el-input v-model="addBaseForm.scheduleThickness" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="材料">
                <el-input v-model="addBaseForm.material" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="handleSaveAddBase">保存</el-button>
            <el-button @click="addBaseDialogVisible = false">取消</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 新增弹窗 -->
      <el-dialog v-model="addDialogVisible" :title="activeTab === 'common' ? '新增公用端面数据' : '新增外形重量重心描述'" width="35%">
        <el-form :model="addForm" label-width="140px">
          <el-row v-for="(row, idx) in addFormRows" :key="idx" :gutter="20">
            <el-col v-for="field in row" :key="field.prop" :span="row.length > 1 ? 12 : 24">
              <el-form-item :label="field.label">
                <el-select 
                  v-if="field.prop === 'IndustryCommodityCode'"
                  v-model="addForm[field.prop]"
                  style="width: 100%;"
                  placeholder="请选择CC码"
                >
                  <el-option 
                    v-for="opt in ccCodeOptions" 
                    :key="opt" 
                    :label="opt === '/' ? '请选择' : opt" 
                    :value="opt === '/' ? '' : opt" 
                  />
                </el-select>
                <el-input v-else v-model="addForm[field.prop]" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="handleSaveAdd">保存</el-button>
            <el-button @click="addDialogVisible = false">取消</el-button>
          </div>
        </template>
      </el-dialog>
    </el-container>
  </div>
</template>

<script setup>
defineOptions({ name: 'BasicLibrary' })
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Search, Plus, FolderAdd, Folder, Document, 
  Upload, Download, CircleClose, Edit, Menu, CopyDocument, RefreshLeft,
  Fold, Expand
} from '@element-plus/icons-vue'
import { getLibraryTree, getCodelistTree, getComponentFullData, getCodelistTableData, disableRows, enableRows } from '@/api/library'

const route = useRoute()
const filterText = ref('')
const codelistFilterText = ref('')
const treeRef = ref(null)
const selectedNode = ref(null)
const activeTab = ref('common')
const treeData = ref([])
const componentDetails = ref({})
// const tableData = ref([]) // Removed shared tableData
const selectedCategory = ref('')
const commonColumns = ref([])
const appearanceColumns = ref([])
const commonData = ref([])
const appearanceData = ref([])
const filterOptions = ref({
  ccCodes: [],
  scheduleThicknesses: [],
  materialGrades: []
})
const filterForm = ref({
  ccCode: '/',
  scheduleThickness: '/',
  materialGrade: '/'
})
const codelistTableData = ref([])
const commonTableRef = ref(null)
const appearanceTableRef = ref(null)
const codelistTableRef = ref(null)
const commonSelection = ref([])
const appearanceSelection = ref([])
const isAsideCollapsed = ref(false)

const toggleAside = () => {
  isAsideCollapsed.value = !isAsideCollapsed.value
}

const addDialogVisible = ref(false)
const addBaseDialogVisible = ref(false)
const addBaseForm = ref({
  manufacturingStd: '',
  ccCode: '',
  scheduleThickness: '',
  material: ''
})
const addForm = ref({})

// 将列按 [1] [2] 分组显示逻辑
const addFormRows = computed(() => {
  const columns = activeTab.value === 'common' ? visibleCommonColumns.value : visibleAppearanceColumns.value
  const rows = []
  const processedProps = new Set()
  const singleFields = []

  // 首先，提取所有成对的字段并将其放入行中
  columns.forEach(col => {
    if (processedProps.has(col.prop)) return
    const { base, index } = getPropBaseAndIndex(col.prop)
    if (index === 1) {
      const pairProp = `${base}[2]`
      const pairCol = columns.find(c => c.prop === pairProp)
      if (pairCol) {
        rows.push([col, pairCol])
        processedProps.add(col.prop)
        processedProps.add(pairProp)
      } else {
        singleFields.push(col)
        processedProps.add(col.prop)
      }
    } else if (!processedProps.has(col.prop)) {
      singleFields.push(col)
      processedProps.add(col.prop)
    }
  })

  // 现在，将剩余的单个字段分组到每行两个
  for (let i = 0; i < singleFields.length; i += 2) {
    if (i + 1 < singleFields.length) {
      rows.push([singleFields[i], singleFields[i + 1]])
    } else {
      rows.push([singleFields[i]])
    }
  }

  // 根据活动选项卡对行进行排序
  if (activeTab.value === 'common') {
    rows.sort((a, b) => {
      const aIsCC = a[0].prop === 'IndustryCommodityCode'
      const bIsCC = b[0].prop === 'IndustryCommodityCode'
      if (aIsCC) return -1
      if (bIsCC) return 1
      return 0
    })
  } else if (activeTab.value === 'appearance') {
    rows.sort((a, b) => {
      const aHasNumericSuffix = a[0].prop.includes('[')
      const bHasNumericSuffix = b[0].prop.includes('[')

      if (aHasNumericSuffix && !bHasNumericSuffix) return 1
      if (!aHasNumericSuffix && bHasNumericSuffix) return -1

      const aIsCC = a[0].prop === 'IndustryCommodityCode'
      const bIsCC = b[0].prop === 'IndustryCommodityCode'
      if (aIsCC) return -1
      if (bIsCC) return 1

      return 0
    })
  }

  return rows
})

const currentTitle = computed(() => route.meta.title || '基础库')
const isPipeProfessional = computed(() => route.name === 'PipeLibrary')
const isCodelistLibrary = computed(() => route.name === 'CodelistLibrary')

const defaultProps = {
  children: 'children',
  label: 'label',
}

// 递归处理树节点，添加唯一ID和继承的category
const processTreeData = (nodes, parentPath = '', parentCategory = '') => {
  return nodes.map(node => {
    // 构建唯一路径ID，格式：Parent-Child-Grandchild
    const currentPath = parentPath ? `${parentPath}-${node.label}` : node.label
    // 继承 category
    const currentCategory = node.category || parentCategory
    
    const newNode = {
      ...node,
      id: currentPath, // 使用全路径作为唯一ID
      fullPath: currentPath,
      category: currentCategory
    }
    if (node.children) {
      newNode.children = processTreeData(node.children, currentPath, currentCategory)
    }
    return newNode
  })
}

// 初始化加载目录树
const loadTreeData = async () => {
  if (isPipeProfessional.value) {
    try {
      const data = await getLibraryTree()
      treeData.value = processTreeData(data)
    } catch (error) {
      console.error('加载目录树失败:', error)
    }
  } else if (isCodelistLibrary.value) {
    try {
      const data = await getCodelistTree()
      treeData.value = processTreeData(data)
    } catch (error) {
      console.error('加载Codelist目录树失败:', error)
    }
  }
}

onMounted(() => {
  loadTreeData()
})

watch(() => route.name, () => {
  loadTreeData()
  selectedNode.value = null
})

watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

// 字段映射表
const fieldLabels = {
  IndustryCommodityCode: 'CC码',
  ScheduleThickness: '壁厚等级',
  CommodityType: 'CommodityType',
  GeometricIndustryStandard: '标准号',
  MaterialGrade: '材料',
  GeometryType: 'GeometryType',
  BentAngle: '弯曲角度',
  PartDataBasis: 'PartDataBasis',
  PartClassName: 'PartClassName',
  UserClassName: 'UserClassName',
  BoltType: '螺栓类型',
  NominalDiameterFrom: '公称直径起始',
  NominalDiameterTo: '公称直径结束',
  NominalDiameter: '公称直径',
  NpdUnitType: '通径单位类型',
  GasketType: '垫片类型',
  ThicknessFor3DModel: '3D模型壁厚',
  ProcurementThickness: '采购壁厚',
  GasketOutsideDiameter: '垫片外径',
  GasketInsideDiameter: '垫片内径',
  FlangeFacing: '法兰密封面',
  NutType: '螺母类型',
  NutHeight: '螺母高度',
  WasherType: '垫圈类型',
  WasherThickness: '垫圈厚度'
}

// 需要隐藏的字段
const hiddenFields = ['GeometricIndustryStandard', 'GeometricindustryStandard']
const baseFilterFields = new Set(['IndustryCommodityCode', 'ScheduleThickness', 'MaterialGrade'])

const componentDetailsFields = computed(() => {
  if (!componentDetails.value) return []
  return Object.keys(componentDetails.value)
    .filter(key => !hiddenFields.includes(key) && !baseFilterFields.has(key) && fieldLabels[key])
    .map(key => ({
      key,
      label: fieldLabels[key] || key,
      value: componentDetails.value[key]
    }))
})

const normalizeOptionList = (list) => {
  const normalized = (list || [])
    .map(v => (v === null || v === undefined) ? '' : String(v).trim())
    .filter(v => v.length > 0 && v !== '/')
  return ['/', ...Array.from(new Set(normalized))]
}

const ccCodeOptions = computed(() => normalizeOptionList(filterOptions.value.ccCodes))
const scheduleThicknessOptions = computed(() => normalizeOptionList(filterOptions.value.scheduleThicknesses))
const materialGradeOptions = computed(() => normalizeOptionList(filterOptions.value.materialGrades))

const hasCcCodeFilter = computed(() => ccCodeOptions.value.length > 1)
const hasScheduleThicknessFilter = computed(() => scheduleThicknessOptions.value.length > 1)
const hasMaterialGradeFilter = computed(() => materialGradeOptions.value.length > 1)

const firstRowItems = computed(() => {
  const items = []
  if (hasCcCodeFilter.value) {
    items.push({
      type: 'filter',
      key: 'IndustryCommodityCode',
      label: 'CC码',
      modelKey: 'ccCode',
      options: ccCodeOptions.value
    })
  }
  if (hasScheduleThicknessFilter.value) {
    items.push({
      type: 'filter',
      key: 'ScheduleThickness',
      label: '壁厚等级',
      modelKey: 'scheduleThickness',
      options: scheduleThicknessOptions.value
    })
  }
  if (hasMaterialGradeFilter.value) {
    items.push({
      type: 'filter',
      key: 'MaterialGrade',
      label: '材料',
      modelKey: 'materialGrade',
      options: materialGradeOptions.value
    })
  }
  const remainSlots = Math.max(0, 4 - items.length)
  const extraFields = componentDetailsFields.value.slice(0, remainSlots).map(f => ({
    type: 'field',
    key: f.key,
    label: f.label
  }))
  return [...items, ...extraFields]
})

const remainingDetailsFields = computed(() => {
  const usedFieldKeys = new Set(firstRowItems.value.filter(i => i.type === 'field').map(i => i.key))
  return componentDetailsFields.value.filter(f => !usedFieldKeys.has(f.key))
})

const showAppearanceGroup = computed(() => {
  return selectedCategory.value === 'pipe' || selectedCategory.value === 'pipeComponent'
})

watch(showAppearanceGroup, (val) => {
  if (!val && activeTab.value === 'appearance') {
    activeTab.value = 'common'
  }
})

const getFilterParams = () => {
  const params = {}
  if (filterForm.value.ccCode && filterForm.value.ccCode !== '/') params.ccCode = filterForm.value.ccCode
  if (filterForm.value.scheduleThickness && filterForm.value.scheduleThickness !== '/') params.scheduleThickness = filterForm.value.scheduleThickness
  if (filterForm.value.materialGrade && filterForm.value.materialGrade !== '/') params.materialGrade = filterForm.value.materialGrade
  return params
}

const lastRequestContext = ref({ nodeLabel: '', category: '' })

const loadFullData = async ({ nodeLabel, category, resetFilters = false }) => {
  if (!nodeLabel) return
  if (resetFilters) {
    filterForm.value.ccCode = '/'
    filterForm.value.scheduleThickness = '/'
    filterForm.value.materialGrade = '/'
  }
  const res = await getComponentFullData(nodeLabel, category, getFilterParams())
  selectedCategory.value = res?.category || category || ''
  componentDetails.value = res?.base || {}
  filterOptions.value = res?.filters || { ccCodes: [], scheduleThicknesses: [], materialGrades: [] }

  const tableConfig = res?.table || {}
  const groups = tableConfig?.groups || {}
  commonColumns.value = groups?.common?.columns || []
  commonData.value = JSON.parse(JSON.stringify(groups?.common?.data || []))
  appearanceColumns.value = groups?.appearance?.columns || []
  appearanceData.value = JSON.parse(JSON.stringify(groups?.appearance?.data || []))
  if (!showAppearanceGroup.value) {
    appearanceColumns.value = []
    appearanceData.value = []
  }
}

watch(
  () => [filterForm.value.ccCode, filterForm.value.scheduleThickness, filterForm.value.materialGrade],
  async () => {
    if (!lastRequestContext.value.nodeLabel || !lastRequestContext.value.category) return
    try {
      await loadFullData({ nodeLabel: lastRequestContext.value.nodeLabel, category: lastRequestContext.value.category })
    } catch (error) {
      console.error('筛选加载失败:', error)
      ElMessage.error('筛选加载失败')
    }
  }
)

const excludedTableFieldBases = new Set(['JsonData', 'GeometricIndustryStandard', 'GeometricindustryStandard'])

const getPropBaseAndIndex = (prop) => {
  const match = typeof prop === 'string' ? prop.match(/^(.*)\[(\d+)\]$/) : null
  if (!match) return { base: prop, index: 0 }
  return { base: match[1], index: Number(match[2]) }
}

const normalizeColumns = (columns) => {
  const groups = new Map()
  const baseOrder = []

  ;(columns || []).forEach((col) => {
    const prop = col?.prop
    const { base, index } = getPropBaseAndIndex(prop)
    if (!groups.has(base)) {
      groups.set(base, [])
      baseOrder.push(base)
    }
    groups.get(base).push({ ...col, __index: index })
  })

  return baseOrder.flatMap((base) => {
    const cols = groups.get(base) || []
    return cols.sort((a, b) => (a.__index || 0) - (b.__index || 0)).map(({ __index, ...rest }) => rest)
  })
}

const isEmptyValue = (val) => {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') return val.trim() === ''
  return false
}

const isColumnAllEmpty = (prop, rows) => {
  if (!prop) return true
  if (!rows || rows.length === 0) return false
  return rows.every((row) => isEmptyValue(row?.[prop]))
}

const getVisibleColumns = (columns, rows) => {
  return normalizeColumns(columns)
    .filter((col) => {
      const prop = col?.prop
      const { base } = getPropBaseAndIndex(prop)
      return prop && !excludedTableFieldBases.has(base)
    })
    // .filter((col) => !isColumnAllEmpty(col.prop, rows))
    .map((col) => ({
      ...col,
      label: col.label || col.prop,
      minWidth: col.minWidth || 140
    }))
}

const emptyCommonColumnProps = computed(() => {
  const emptyProps = new Set()
  if (!commonData.value || commonData.value.length === 0) return emptyProps
  visibleCommonColumns.value.forEach(col => {
    if (isColumnAllEmpty(col.prop, commonData.value)) {
      emptyProps.add(col.prop)
    }
  })
  return emptyProps
})

const emptyAppearanceColumnProps = computed(() => {
  const emptyProps = new Set()
  if (!appearanceData.value || appearanceData.value.length === 0) return emptyProps
  visibleAppearanceColumns.value.forEach(col => {
    if (isColumnAllEmpty(col.prop, appearanceData.value)) {
      emptyProps.add(col.prop)
    }
  })
  return emptyProps
})

const cellStyle = ({ column }) => {
  if (emptyCommonColumnProps.value.has(column.property) || emptyAppearanceColumnProps.value.has(column.property)) {
    return { backgroundColor: '#f5f7fa' } 
  }
  return null
}


const visibleCommonColumns = computed(() => getVisibleColumns(commonColumns.value, commonData.value))
const visibleAppearanceColumns = computed(() => getVisibleColumns(appearanceColumns.value, appearanceData.value))

const currentSelection = computed(() => {
  return activeTab.value === 'common' ? commonSelection.value : appearanceSelection.value
})

const isAllDisabled = computed(() => {
  if (!currentSelection.value || currentSelection.value.length === 0) return false
  return currentSelection.value.every(row => row.disabled)
})

const statusButtonText = computed(() => isAllDisabled.value ? '恢复' : '禁用')
const statusButtonIcon = computed(() => isAllDisabled.value ? RefreshLeft : CircleClose)
const statusButtonType = computed(() => isAllDisabled.value ? 'success' : 'danger')

const handleNodeClick = async (data, node) => {
  if (!data.children) {
    selectedNode.value = data
    if (isPipeProfessional.value) {
      try {
        // 使用预处理好的唯一路径ID
        const fullPath = data.fullPath || data.id
        const category = data.category
        lastRequestContext.value = { nodeLabel: fullPath, category }
        await loadFullData({ nodeLabel: fullPath, category, resetFilters: true })
      } catch (error) {
        console.error('加载节点详情失败:', error)
        selectedCategory.value = ''
        filterOptions.value = { ccCodes: [], scheduleThicknesses: [], materialGrades: [] }
        filterForm.value = { ccCode: '/', scheduleThickness: '/', materialGrade: '/' }
        commonColumns.value = []
        appearanceColumns.value = []
        componentDetails.value = {}
        commonData.value = []
        appearanceData.value = []
        ElMessage.error('加载节点详情失败')
      }
    } else if (isCodelistLibrary.value) {
      try {
        const table = await getCodelistTableData(data.label)
        codelistTableData.value = table
      } catch (error) {
        console.error('加载Codelist表格失败:', error)
        codelistTableData.value = []
      }
    } else {
      // 其他专业暂无数据加载逻辑
      componentDetails.value = {}
      selectedCategory.value = ''
      commonColumns.value = []
      appearanceColumns.value = []
      commonData.value = []
      appearanceData.value = []
    }
  }
}

const handleRowClick = (row) => {
  commonTableRef.value?.toggleRowSelection(row)
}

const handleAppearanceRowClick = (row) => {
  appearanceTableRef.value?.toggleRowSelection(row)
}

const handleCodelistRowClick = (row) => {
  codelistTableRef.value?.toggleRowSelection(row)
}

const handleCommonSelectionChange = (selection) => {
  commonSelection.value = selection
}

const handleAppearanceSelectionChange = (selection) => {
  appearanceSelection.value = selection
}

const tableRowClassName = ({ row }) => {
  if (row.disabled) {
    return 'disabled-row'
  }
  return ''
}

const handleToggleStatus = async () => {
  let tableRef = null
  let selection = []
  
  if (activeTab.value === 'common') {
    tableRef = commonTableRef.value
    selection = commonSelection.value
  } else {
    tableRef = appearanceTableRef.value
    selection = appearanceSelection.value
  }
  
  if (!selection || selection.length === 0) {
    ElMessage.warning('请先选择要操作的行')
    return
  }
  
  if (isAllDisabled.value) {
    // 恢复操作
    try {
      await enableRows(selection)
      selection.forEach(row => row.disabled = false)
      ElMessage.success('恢复成功')
    } catch (error) {
      console.error('恢复失败:', error)
      ElMessage.error('恢复失败')
    }
  } else {
    // 禁用操作
    try {
      await disableRows(selection)
      selection.forEach(row => row.disabled = true)
      ElMessage.success('禁用成功')
    } catch (error) {
      console.error('禁用失败:', error)
      ElMessage.error('禁用失败')
    }
  }
  
  // 清除选择状态
  tableRef.clearSelection()
}

const handleAddBase = () => {
  addBaseForm.value = {
    manufacturingStd: componentDetails.value.GeometricIndustryStandard || '',
    ccCode: filterForm.value.ccCode !== '/' ? filterForm.value.ccCode : '',
    scheduleThickness: filterForm.value.scheduleThickness !== '/' ? filterForm.value.scheduleThickness : '',
    material: filterForm.value.materialGrade !== '/' ? filterForm.value.materialGrade : ''
  }
  addBaseDialogVisible.value = true
}

const handleSaveAddBase = () => {
  ElMessage.success('新增部件类型基础成功')
  addBaseDialogVisible.value = false
}

const handleAdd = () => {
  let selectedRows = []
  const columns = activeTab.value === 'common' ? visibleCommonColumns.value : visibleAppearanceColumns.value
  
  if (activeTab.value === 'common' && commonTableRef.value) {
    selectedRows = commonTableRef.value.getSelectionRows()
  } else if (activeTab.value === 'appearance' && appearanceTableRef.value) {
    selectedRows = appearanceTableRef.value.getSelectionRows()
  }

  const newForm = {}
  // 初始化所有列的 key
  columns.forEach(col => {
    newForm[col.prop] = ''
  })

  if (selectedRows && selectedRows.length > 0) {
    // 预填充选中行数据
    const row = selectedRows[0]
    Object.keys(newForm).forEach(key => {
      newForm[key] = row[key] ?? ''
    })
  } else {
    // 设置默认 CC 码
    if (filterForm.value.ccCode && filterForm.value.ccCode !== '/') {
      newForm.IndustryCommodityCode = filterForm.value.ccCode
    }
  }

  addForm.value = newForm
  addDialogVisible.value = true
}

const handleSaveAdd = () => {
  // Push new data to the correct table based on active tab
  if (activeTab.value === 'common') {
    commonData.value.push({ ...addForm.value })
  } else if (activeTab.value === 'appearance') {
    appearanceData.value.push({ ...addForm.value })
  }
  addDialogVisible.value = false
}
</script>

<style scoped>
.basic-library-container {
  height: calc(100vh - 120px);
  background-color: #f5f7fa;
  margin: -20px;
}

.main-layout {
  height: 100%;
}

.tree-aside {
  background: #f8f9fb;
  border-right: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
}

.tree-title {
  padding: 12px 15px;
  background-color: #f2f3f5;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.tree-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.tree-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.tree-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 0;
}

.custom-tree-node {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  white-space: normal;
  word-break: break-all;
  line-height: 1.4;
  padding: 4px 0;
}

.custom-tree-node span {
  flex: 1;
}

:deep(.el-tree-node__content) {
  height: auto;
  align-items: flex-start;
  padding-top: 2px;
  padding-bottom: 2px;
}

.folder-icon {
  margin-right: 6px;
  color: #e6a23c;
}

.file-icon {
  margin-right: 6px;
  color: #909399;
}

.content-main {
  padding: 10px;
  background-color: #f5f7fa;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
}

.card-header .title {
  font-weight: bold;
  font-size: 16px;
}

.aside-toggle-button {
  margin-right: 8px;
  font-size: 18px;
  color: #606266;
}

.card-header .subtitle {
  font-size: 12px;
  color: #909399;
  margin-left: 15px;
}

.header-btns {
  margin-left: auto;
}

.info-card {
  margin-bottom: 10px;
  flex-shrink: 0;
}

:deep(.el-card__header) {
  padding: 8px 15px;
}

:deep(.el-card__body) {
  padding: 5px 0;
}

.info-form-container {
  background-color: #f8f9fb;
  padding: 10px 20px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.info-form :deep(.el-form-item) {
  margin-bottom: 6px;
}

.info-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.tab-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.tab-actions {
  display: flex;
  gap: 10px;
}

.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tabs-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.data-tabs {
  background: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-tabs__item) {
  font-weight: bold;
  font-size: 16px;
  color: #000000;
}

:deep(.el-tabs__content) {
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
}

.tab-header-actions {
  position: absolute;
  top: 5px;
  right: 15px;
  z-index: 10;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.dialog-extra-action {
  text-align: center;
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

:deep(.el-table .disabled-row) {
  background-color: #e4e7ed !important; /* 加深背景色 */
  color: #909399 !important;
  cursor: not-allowed;
}

:deep(.el-table .disabled-row td.el-table__cell) {
  background-color: #e4e7ed !important;
  color: #909399 !important;
}

/* 禁用行复选框样式增强 - 模拟禁止符号 */
:deep(.el-table .disabled-row .el-checkbox__input.is-disabled .el-checkbox__inner) {
  background-color: transparent !important;
  border: 2px solid #909399 !important;
  border-radius: 50%; /* 变成圆形 */
  width: 16px;
  height: 16px;
  position: relative;
  box-sizing: border-box;
}

/* 隐藏原有的勾选标记 */
:deep(.el-table .disabled-row .el-checkbox__input.is-disabled .el-checkbox__inner::after) {
  display: none;
}

/* 添加斜杠 */
:deep(.el-table .disabled-row .el-checkbox__input.is-disabled .el-checkbox__inner::before) {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 2px;
  background-color: #909399;
  transform: translate(-50%, -50%) rotate(-45deg);
}

:deep(.el-table .disabled-row .el-checkbox__input.is-disabled) {
  cursor: not-allowed;
}
.codelist-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.codelist-card .el-card__body) {
  flex: 1;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.codelist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
  margin: 0 20px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 100%;
}
</style>
