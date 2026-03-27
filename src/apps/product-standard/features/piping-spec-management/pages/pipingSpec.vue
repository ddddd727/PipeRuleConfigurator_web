<template>
  <div class="piping-spec-page">
    <el-container class="main-layout">
      <el-aside width="280px" class="tree-aside">
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
                <div>
                  <span class="title">部件类型基础</span>
                  <span class="subtitle">筛选条件默认展示当前节点首条基础数据</span>
                </div>
                <div class="header-actions">
                  <el-button type="primary" plain :icon="Upload">导入</el-button>
                  <el-button type="primary" plain :icon="Download">导出</el-button>
                  <el-button type="primary" :icon="Plus" @click="openSaveAsDialog">另存为</el-button>
                </div>
              </div>
            </template>

            <div class="info-form-container">
              <el-form :model="filterForm" label-width="150px" class="info-form">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="IndustryCommodityCode">
                      <el-select v-model="filterForm.IndustryCommodityCode" style="width: 100%">
                        <el-option v-for="opt in industryCommodityCodeOptions" :key="opt" :label="opt" :value="opt" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8" v-if="hasScheduleThicknessFilter">
                    <el-form-item label="ScheduleThickness">
                      <el-select v-model="filterForm.scheduleThickness" style="width: 100%">
                        <el-option v-for="opt in scheduleThicknessOptions" :key="opt" :label="opt" :value="opt" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="MaterialGrade">
                      <el-select v-model="filterForm.materialGrade" style="width: 100%">
                        <el-option v-for="opt in materialGradeOptions" :key="opt" :label="opt" :value="opt" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col v-for="field in detailFields" :key="field.key" :span="8">
                    <el-form-item :label="field.label">
                      <el-input :model-value="currentBaseRow[field.key] ?? ''" readonly />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-card>

          <div class="tabs-container">
            <el-tabs v-model="activeTab" class="data-tabs" type="border-card">
              <el-tab-pane label="公用端面数据" name="common">
                <div class="table-wrapper" v-loading="commonLoading" element-loading-text="加载中...">
                  <el-table
                    ref="commonTableRef"
                    :data="commonData"
                    border
                    height="100%"
                    :row-class-name="tableRowClassName"
                    @selection-change="handleCommonSelectionChange"
                  >
                    <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                    <el-table-column
                      v-for="col in visibleCommonColumns"
                      :key="col.prop"
                      :prop="col.prop"
                      :label="col.label"
                      :min-width="col.minWidth || 140"
                      show-overflow-tooltip
                    />
                  </el-table>
                </div>
              </el-tab-pane>
              <el-tab-pane v-if="showAppearanceGroup" label="外形重量重心描述" name="appearance">
                <div class="table-wrapper" v-loading="appearanceLoading" element-loading-text="加载中...">
                  <el-table
                    ref="appearanceTableRef"
                    :data="appearanceData"
                    border
                    height="100%"
                    :row-class-name="tableRowClassName"
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
              </el-tab-pane>
            </el-tabs>

            <div class="tab-header-actions" v-if="activeTab === 'common'">
              <el-button type="primary" :icon="Plus" @click="handleAddRow">新增</el-button>
              <el-button type="warning" :icon="Edit">修改</el-button>
            </div>
            <div class="tab-header-actions" v-else-if="activeTab === 'appearance'">
              <el-button type="primary" :icon="Plus" @click="handleAddRow">新增</el-button>
              <el-button type="danger" :icon="CircleClose" @click="handleDisableRows">禁用</el-button>
              <el-button type="warning" :icon="Edit">修改</el-button>
            </div>
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
            <el-form-item label="制造标准">
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  CircleClose,
  Document,
  Download,
  Edit,
  Folder,
  Menu,
  Plus,
  Search,
  Upload
} from '@element-plus/icons-vue'
import {
  disablePipingRows,
  getPipingBaseOptions,
  getPipingComponentAppearanceData,
  getPipingComponentBaseData,
  getPipingComponentCommonData,
  getPipingSpecTree,
  savePipingComponentBase
} from '@/apps/product-standard/features/piping-spec-management/api/pipingSpecAPI'

const route = useRoute()
const currentTitle = computed(() => route.meta.title || 'S3D部件数据管理')

const treeRef = ref(null)
const commonTableRef = ref(null)
const appearanceTableRef = ref(null)

const filterText = ref('')
const treeLoading = ref(false)
const commonLoading = ref(false)
const appearanceLoading = ref(false)

const treeData = ref([])
const selectedNode = ref(null)
const selectedCategory = ref('')
const baseRows = ref([])
const commonData = ref([])
const appearanceData = ref([])
const commonSelection = ref([])
const appearanceSelection = ref([])
const activeTab = ref('common')

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

const defaultProps = {
  children: 'children',
  label: 'label'
}

const detailFields = computed(() => {
  const hidden = new Set(['status'])
  const row = currentBaseRow.value
  return Object.keys(row)
    .filter((key) => !hidden.has(key) && !['IndustryCommodityCode', 'ScheduleThickness', 'MaterialGrade'].includes(key))
    .slice(0, 9)
    .map((key) => ({ key, label: key }))
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

const visibleCommonColumns = computed(() => {
  if (!commonData.value.length) return []
  return Object.keys(commonData.value[0])
    .filter((key) => key !== 'status')
    .map((key) => ({ prop: key, label: key }))
})

const visibleAppearanceColumns = computed(() => {
  if (!appearanceData.value.length) return []
  return Object.keys(appearanceData.value[0])
    .filter((key) => key !== 'status')
    .map((key) => ({ prop: key, label: key }))
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

const loadTreeData = async () => {
  treeLoading.value = true
  try {
    const res = await getPipingSpecTree()
    treeData.value = transformPathsToTree(res || [])
  } catch (error) {
    console.error('加载管系专业树失败:', error)
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

const loadCommonData = async () => {
  if (!selectedNode.value) return
  commonLoading.value = true
  try {
    const res = await getPipingComponentCommonData(selectedNode.value.label, selectedCategory.value, buildQueryFilters())
    commonData.value = res || []
  } catch (error) {
    console.error('加载公用端面数据失败:', error)
    commonData.value = []
  } finally {
    commonLoading.value = false
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
    appearanceData.value = res || []
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
  activeTab.value = 'common'
  await loadBaseData()
  await loadCommonData()
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
    saveAsDialogVisible.value = false
    ElMessage.success('Saved successfully')
    await loadTreeData()
  } catch (error) {
    console.error('另存为失败:', error)
  }
}

const handleAddRow = () => {
  ElMessage.info('当前先保留为展示入口，后续可以继续补新增表单')
}

const handleDisableRows = async () => {
  const rows = activeTab.value === 'appearance' ? appearanceSelection.value : commonSelection.value
  if (!rows.length) {
    ElMessage.warning('Please select at least one row')
    return
  }
  await disablePipingRows(rows)
  rows.forEach((row) => {
    row.status = 0
  })
  ElMessage.success('Disabled successfully')
}

const handleCommonSelectionChange = (rows) => {
  commonSelection.value = rows
}

const handleAppearanceSelectionChange = (rows) => {
  appearanceSelection.value = rows
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
    loadCommonData()
    loadAppearanceData()
  }
)
</script>

<style scoped>
.piping-spec-page {
  height: 100%;
}

.main-layout {
  height: calc(100vh - 120px);
}

.tree-aside {
  border-right: 1px solid #ebeef5;
  background: #fff;
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
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.info-card,
.tabs-container,
.table-wrapper {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

.tab-header-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
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
