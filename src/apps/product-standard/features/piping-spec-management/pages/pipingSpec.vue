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
            <section class="data-section">
              <div class="data-section-header">
                <div class="data-section-title">公用端面数据</div>
                <div class="data-section-actions">
                  <el-button type="primary" :icon="Plus" @click="handleAddRow('common')">新增</el-button>
                  <el-button type="warning" :icon="Edit">修改</el-button>
                </div>
              </div>
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
            </section>
            <section v-if="showAppearanceGroup" class="data-section">
              <div class="data-section-header">
                <div class="data-section-title">外形重量重心描述</div>
                <div class="data-section-actions">
                  <el-button type="primary" :icon="Plus" @click="handleAddRow('appearance')">新增</el-button>
                  <el-button type="warning" :icon="Edit">修改</el-button>
                  <el-button type="danger" :icon="CircleClose" @click="handleDisableRows('appearance')">禁用</el-button>
                </div>
              </div>
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

const defaultProps = {
  children: 'children',
  label: 'label'
}

const toggleTreePanel = () => {
  isTreeCollapsed.value = !isTreeCollapsed.value
}

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
    ElMessage.success('保存成功')
    await loadTreeData()
  } catch (error) {
    console.error('另存为失败:', error)
  }
}
const handleAddRow = (section) => {
  const sectionName = section === 'appearance' ? '外形重量重心描述' : '公用端面数据'
  ElMessage.info(`${sectionName} 的新增功能先保留为展示入口，后续可继续补充表单`)
}

const handleDisableRows = async (section = 'appearance') => {
  const rows = section === 'appearance' ? appearanceSelection.value : commonSelection.value
  if (!rows.length) {
    ElMessage.warning('请至少选择一行数据')
    return
  }
  await disablePipingRows(rows)
  rows.forEach((row) => {
    row.status = 0
  })
  ElMessage.success('禁用成功')
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
