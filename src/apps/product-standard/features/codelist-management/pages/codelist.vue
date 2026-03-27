<template>
  <div class="basic-library-container">
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
          <el-card v-if="selectedNode.category === '3'" shadow="never" class="codelist-card">
            <template #header>
              <div class="card-header codelist-header">
                <div class="header-left">
                  <span class="title">{{ selectedNode.label }}</span>
                  <span class="subtitle">三层 Codelist</span>
                </div>
                <div class="header-right">
                  <el-button :icon="Back" :disabled="currentLevel === 1" @click="handleBackLevel">返回上一级</el-button>
                  <el-button type="info" plain :icon="Download">导出</el-button>
                </div>
              </div>
            </template>

            <div class="filter-section" v-loading="codelistUiLoading" element-loading-text="加载中...">
              <el-form label-width="180px" class="filter-form">
                <el-form-item :label="`${levelNames.level1} :`">
                  <el-select v-model="layerFilters.practice" placeholder="/" style="width: 50%" @change="recomputeCodelistView">
                    <el-option label="/" value="/" />
                    <el-option
                      v-for="opt in practiceOptions"
                      :key="opt.shortDesc"
                      :label="opt.shortDesc"
                      :value="opt.shortDesc"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item :label="`${levelNames.level2} :`">
                  <el-select v-model="layerFilters.category" placeholder="/" style="width: 50%" @change="recomputeCodelistView">
                    <el-option label="/" value="/" />
                    <el-option
                      v-for="opt in categoryOptions"
                      :key="opt.shortDesc"
                      :label="opt.shortDesc"
                      :value="opt.shortDesc"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="Codelist Number :">
                  <el-input v-model="currentCodelistNumber" style="width: 50%" readonly />
                </el-form-item>
              </el-form>
            </div>

            <div class="table-section-container">
              <div class="table-section-header">
                <div class="header-left">
                  <span class="table-title">{{ currentTableTitle }}</span>
                </div>
                <div class="header-right">
                  <el-input
                    v-model="codelistFilterText"
                    class="search-input"
                    style="width: 250px; margin-right: 10px"
                    placeholder="搜索查找内容"
                  >
                    <template #append>
                      <el-button :icon="Search" />
                    </template>
                  </el-input>
                  <el-button type="primary" :icon="Plus" :disabled="currentLevel !== 3" @click="openCodelistAddDialog">新增</el-button>
                  <el-button :type="statusButtonType" :icon="statusButtonIcon" @click="handleToggleStatus">{{ statusButtonText }}</el-button>
                </div>
              </div>
              <div class="table-wrapper" v-loading="codelistUiLoading" element-loading-text="加载中...">
                <el-table
                  ref="codelistTableRef"
                  :data="filteredCodelistTableData"
                  border
                  height="100%"
                  :row-class-name="tableRowClassName"
                  @row-click="handleCodelistRowClick"
                  @row-dblclick="handleCodelistRowDblClick"
                  @selection-change="handleCodelistSelectionChange"
                >
                  <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                  <el-table-column prop="shortDesc" label="ShortDescription" min-width="250" />
                  <el-table-column prop="longDesc" label="LongDescription" min-width="300" />
                  <el-table-column prop="codeNum" label="Codelist Number" width="150" />
                </el-table>
              </div>
            </div>
          </el-card>

          <el-card v-else-if="selectedNode.category === '2'" shadow="never" class="codelist-card">
            <template #header>
              <div class="card-header codelist-header">
                <div class="header-left">
                  <span class="title">{{ selectedNode.label }}</span>
                  <span class="subtitle">两层 Codelist</span>
                </div>
                <div class="header-right">
                  <el-button :icon="Back" :disabled="currentLevel === 1" @click="handleBackLevel">返回上一级</el-button>
                  <el-button type="info" plain :icon="Download">导出</el-button>
                </div>
              </div>
            </template>

            <div class="filter-section" v-loading="codelistUiLoading" element-loading-text="加载中...">
              <el-form label-width="180px" class="filter-form">
                <el-form-item :label="`${levelNames.level1} :`">
                  <el-select v-model="layerFilters.practice" placeholder="/" style="width: 50%" @change="recomputeCodelistView">
                    <el-option label="/" value="/" />
                    <el-option
                      v-for="opt in practiceOptions"
                      :key="opt.shortDesc"
                      :label="opt.shortDesc"
                      :value="opt.shortDesc"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="Codelist Number :">
                  <el-input v-model="currentCodelistNumber" style="width: 50%" readonly />
                </el-form-item>
              </el-form>
            </div>

            <div class="table-section-container">
              <div class="table-section-header">
                <div class="header-left">
                  <span class="table-title">{{ currentTableTitle }}</span>
                </div>
                <div class="header-right">
                  <el-input
                    v-model="codelistFilterText"
                    class="search-input"
                    style="width: 250px; margin-right: 10px"
                    placeholder="搜索查找内容"
                  >
                    <template #append>
                      <el-button :icon="Search" />
                    </template>
                  </el-input>
                  <el-button type="primary" :icon="Plus" :disabled="currentLevel !== 2" @click="openCodelistAddDialog">新增</el-button>
                  <el-button :type="statusButtonType" :icon="statusButtonIcon" @click="handleToggleStatus">{{ statusButtonText }}</el-button>
                </div>
              </div>
              <div class="table-wrapper" v-loading="codelistUiLoading" element-loading-text="加载中...">
                <el-table
                  ref="codelistTableRef"
                  :data="filteredCodelistTableData"
                  border
                  height="100%"
                  :row-class-name="tableRowClassName"
                  @row-click="handleCodelistRowClick"
                  @row-dblclick="handleCodelistRowDblClick"
                  @selection-change="handleCodelistSelectionChange"
                >
                  <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                  <el-table-column prop="shortDesc" label="ShortDescription" min-width="250" />
                  <el-table-column prop="longDesc" label="LongDescription" min-width="300" />
                  <el-table-column prop="codeNum" label="Codelist Number" width="150" />
                </el-table>
              </div>
            </div>
          </el-card>

          <el-card v-else-if="selectedNode.category === '1'" shadow="never" class="codelist-card">
            <template #header>
              <div class="card-header codelist-header">
                <div class="header-left">
                  <span class="title">{{ selectedNode.label }}</span>
                  <span class="subtitle">单层 Codelist</span>
                </div>
                <div class="header-center">
                  <el-input
                    v-model="codelistFilterText"
                    class="search-input"
                    style="width: 250px; margin-right: 10px"
                    placeholder="搜索查找内容"
                  >
                    <template #append>
                      <el-button :icon="Search" />
                    </template>
                  </el-input>
                </div>
                <div class="header-right">
                  <el-button type="primary" :icon="Plus" @click="openCodelistAddDialog">新增</el-button>
                  <el-button :type="statusButtonType" :icon="statusButtonIcon" @click="handleToggleStatus">{{ statusButtonText }}</el-button>
                  <el-button type="info" plain :icon="Download">导出</el-button>
                </div>
              </div>
            </template>

            <div class="table-wrapper" v-loading="codelistUiLoading" element-loading-text="加载中...">
              <el-table
                ref="codelistTableRef"
                :data="filteredCodelistTableData"
                border
                height="100%"
                :row-class-name="tableRowClassName"
                @row-click="handleCodelistRowClick"
                @row-dblclick="handleCodelistRowDblClick"
                @selection-change="handleCodelistSelectionChange"
              >
                <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                <el-table-column prop="shortDesc" label="ShortDescription" min-width="180" />
                <el-table-column prop="longDesc" label="LongDescription" min-width="300" />
                <el-table-column prop="codeNum" label="Codelist Number" width="150" />
              </el-table>
            </div>
          </el-card>

          <div v-else class="empty-state">
            <el-empty description="当前节点未配置 Codelist 展示" />
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty description="请选择左侧目录查看详情" />
        </div>
      </el-main>

      <el-dialog v-model="codelistAddDialogVisible" title="新增 Codelist" width="600px">
        <el-form :model="codelistAddForm" label-width="120px">
          <el-form-item label="父级：">
            <el-input v-model="codelistAddForm.parent" readonly />
          </el-form-item>
        <el-form-item label="短描述：">
          <el-input v-model="codelistAddForm.shortDesc" />
        </el-form-item>
        <el-form-item label="长描述：">
          <el-input v-model="codelistAddForm.longDesc" />
        </el-form-item>
          <el-form-item label="Codelist值：">
            <el-input v-model="codelistAddForm.codeNum" :placeholder="codelistAddPlaceholder" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="handleSaveCodelistAdd">保存</el-button>
            <el-button @click="codelistAddDialogVisible = false">取消</el-button>
          </div>
        </template>
      </el-dialog>
    </el-container>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Back,
  CircleClose,
  Document,
  Download,
  Folder,
  Menu,
  Plus,
  RefreshLeft,
  Search
} from '@element-plus/icons-vue'
import {
  disableRows,
  enableRows,
  getCodelistChildData,
  getCodelistTableData,
  getCodelistTree,
  getNextCodelistNumber,
  saveCodelistItem
} from '@/apps/product-standard/features/codelist-management/api/codelistAPI'

const route = useRoute()
const currentTitle = computed(() => route.meta.title || 'S3D数据字典管理')

const treeRef = ref(null)
const codelistTableRef = ref(null)

const filterText = ref('')
const codelistFilterText = ref('')
const treeLoading = ref(false)
const codelistLoading = ref(false)

const treeData = ref([])
const selectedNode = ref(null)
const currentLevel = ref(1)
const levelNames = ref({ level1: 'Level1', level2: 'Level2', level3: 'Level3' })
const currentCodelistNumber = ref('/')

const layerFilters = ref({
  practice: '/',
  category: '/'
})

const practiceOptions = ref([])
const categoryOptions = ref([])
const codelistRows = ref([])
const codelistSelection = ref([])

const codelistAddDialogVisible = ref(false)
const codelistAddPlaceholder = ref('自动推荐一个可用编码，例如 10001')
const codelistAddForm = ref({
  parent: '/',
  longDesc: '',
  shortDesc: '',
  codeNum: ''
})

const codelistUiLoading = computed(() => codelistLoading.value || !selectedNode.value)

const defaultProps = {
  children: 'children',
  label: 'label'
}

const filteredCodelistTableData = computed(() => {
  const keyword = codelistFilterText.value.trim().toLowerCase()
  if (!keyword) return codelistRows.value
  return codelistRows.value.filter((row) => {
    const shortDesc = String(row.shortDesc || '').toLowerCase()
    const longDesc = String(row.longDesc || '').toLowerCase()
    const codeNum = String(row.codeNum || '').toLowerCase()
    return shortDesc.includes(keyword) || longDesc.includes(keyword) || codeNum.includes(keyword)
  })
})

const currentTableTitle = computed(() => {
  if (!selectedNode.value) return ''
  if (currentLevel.value === 1) return levelNames.value.level1 || 'Level1'
  if (currentLevel.value === 2) return levelNames.value.level2 || 'Level2'
  return levelNames.value.level3 || 'Level3'
})

const statusButtonText = computed(() => {
  if (!codelistSelection.value.length) return '禁用'
  return codelistSelection.value.every((row) => row.status === 0) ? '启用' : '禁用'
})

const statusButtonType = computed(() => {
  if (!codelistSelection.value.length) return 'danger'
  return codelistSelection.value.every((row) => row.status === 0) ? 'warning' : 'danger'
})

const statusButtonIcon = computed(() => (
  codelistSelection.value.length && codelistSelection.value.every((row) => row.status === 0)
    ? RefreshLeft
    : CircleClose
))

const majorLabelMap = {
  C: '通用',
  P: '管系',
  E: '电气'
}

const majorDisplayOrder = ['C', 'P', 'E']

const getMajorLabel = (major) => {
  const majorCode = String(major || '').trim().toUpperCase()
  return majorLabelMap[majorCode] || majorCode || '未分类'
}

const buildCatalogTree = (catalogs = []) => {
  const groupedMap = new Map()

  catalogs.forEach((item) => {
    const majorCode = String(item.major || '').trim().toUpperCase() || 'UNKNOWN'
    const tableName = String(item.codeListTableName || '').trim()
    if (!tableName) return

    if (!groupedMap.has(majorCode)) {
      groupedMap.set(majorCode, {
        label: getMajorLabel(majorCode),
        fullPath: majorCode,
        major: majorCode,
        children: []
      })
    }

    groupedMap.get(majorCode).children.push({
      label: tableName,
      fullPath: `${majorCode}|${tableName}`,
      raw: item
    })
  })

  return Array.from(groupedMap.entries())
    .sort(([majorA], [majorB]) => {
      const indexA = majorDisplayOrder.indexOf(majorA)
      const indexB = majorDisplayOrder.indexOf(majorB)
      const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA
      const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB
      if (safeIndexA !== safeIndexB) return safeIndexA - safeIndexB
      return majorA.localeCompare(majorB)
    })
    .map(([, group]) => ({
      ...group,
      children: group.children.sort((a, b) => a.label.localeCompare(b.label))
    }))
}

const filterNode = (value, data) => {
  if (!value) return true
  return String(data.label || '').toLowerCase().includes(value.toLowerCase())
}

const buildCodelistOptions = (rows = []) => rows
  .filter((row) => row.status !== 0)
  .map((row) => ({
    shortDesc: row.shortDesc,
    longDesc: row.longDesc,
    codeNum: row.codeNum
  }))

const applyCodelistLevelData = (rows, level, parentShortDesc = '') => {
  codelistRows.value = rows
  currentLevel.value = level

  if (level === 1) {
    practiceOptions.value = buildCodelistOptions(rows)
    categoryOptions.value = []
    currentCodelistNumber.value = '/'
    return
  }

  if (level === 2) {
    categoryOptions.value = buildCodelistOptions(rows)
    const practice = practiceOptions.value.find((item) => item.shortDesc === parentShortDesc)
    currentCodelistNumber.value = practice ? String(practice.codeNum ?? '/') : '/'
    return
  }

  const category = categoryOptions.value.find((item) => item.shortDesc === parentShortDesc)
  currentCodelistNumber.value = category ? String(category.codeNum ?? '/') : '/'
}

const loadTreeData = async () => {
  treeLoading.value = true
  try {
    const res = await getCodelistTree()
    treeData.value = buildCatalogTree(res || [])
  } catch (error) {
    console.error('加载 Codelist 树失败:', error)
    treeData.value = []
  } finally {
    treeLoading.value = false
  }
}

const loadCodelistLevelData = async (level, parentShortDesc = '') => {
  if (!selectedNode.value) return
  codelistLoading.value = true
  try {
    let rows = []

    if (level === 1) {
      const res = await getCodelistTableData(selectedNode.value.label)
      rows = res?.levelData || []
    } else if (level === 2) {
      const res = await getCodelistChildData(parentShortDesc)
      rows = res?.levelData || []
    } else if (level === 3) {
      const res = await getCodelistChildData(parentShortDesc)
      rows = res?.levelData || []
    }

    applyCodelistLevelData(rows, level, parentShortDesc)
  } catch (error) {
    console.error(`加载第 ${level} 层 Codelist 数据失败:`, error)
    codelistRows.value = []
  } finally {
    codelistLoading.value = false
  }
}

const recomputeCodelistView = async () => {
  if (!selectedNode.value) return

  const category = String(selectedNode.value.category || '1')
  if (category === '1') {
    await loadCodelistLevelData(1)
    return
  }

  if (category === '2') {
    if (!layerFilters.value.practice || layerFilters.value.practice === '/') {
      await loadCodelistLevelData(1)
    } else {
      await loadCodelistLevelData(2, layerFilters.value.practice)
    }
    return
  }

  if (!layerFilters.value.practice || layerFilters.value.practice === '/') {
    await loadCodelistLevelData(1)
  } else if (!layerFilters.value.category || layerFilters.value.category === '/') {
    await loadCodelistLevelData(2, layerFilters.value.practice)
  } else {
    await loadCodelistLevelData(3, layerFilters.value.category)
  }
}

const handleNodeClick = async (data) => {
  if (data.children?.length) return

  selectedNode.value = {
    label: data.raw?.codeListTableName || data.label,
    fullPath: data.fullPath,
    major: data.raw?.major || '',
    category: '1'
  }

  layerFilters.value = { practice: '/', category: '/' }
  practiceOptions.value = []
  categoryOptions.value = []
  codelistSelection.value = []
  codelistFilterText.value = ''

  codelistLoading.value = true
  try {
    const res = await getCodelistTableData(data.raw?.codeListTableName || data.label)
    selectedNode.value.category = String(res?.count || 1)
    levelNames.value = {
      level1: res?.level1 || 'Level1',
      level2: res?.level2 || 'Level2',
      level3: res?.level3 || 'Level3'
    }
    applyCodelistLevelData(res?.levelData || [], 1)
  } catch (error) {
    console.error('加载节点数据失败:', error)
    codelistRows.value = []
  } finally {
    codelistLoading.value = false
  }
}

const handleBackLevel = async () => {
  if (currentLevel.value === 3) {
    layerFilters.value.category = '/'
    await loadCodelistLevelData(2, layerFilters.value.practice)
  } else if (currentLevel.value === 2) {
    layerFilters.value.practice = '/'
    layerFilters.value.category = '/'
    await loadCodelistLevelData(1)
  }
}

const handleCodelistSelectionChange = (rows) => {
  codelistSelection.value = rows
}

const handleCodelistRowClick = (row) => {
  nextTick(() => {
    codelistTableRef.value?.toggleRowSelection(row)
  })
}

const handleCodelistRowDblClick = async (row) => {
  if (!selectedNode.value || row.status === 0) return

  const category = String(selectedNode.value.category || '1')
  if (category === '2' && currentLevel.value === 1) {
    layerFilters.value.practice = row.shortDesc
    await recomputeCodelistView()
    return
  }

  if (category === '3') {
    if (currentLevel.value === 1) {
      layerFilters.value.practice = row.shortDesc
      layerFilters.value.category = '/'
      await recomputeCodelistView()
    } else if (currentLevel.value === 2) {
      layerFilters.value.category = row.shortDesc
      await recomputeCodelistView()
    }
  }
}

const computeCodelistParent = () => {
  if (!selectedNode.value) return '/'
  const category = String(selectedNode.value.category || '1')
  if (category === '1') return '/'
  if (category === '2') return currentLevel.value === 2 ? (layerFilters.value.practice || '/') : '/'
  if (currentLevel.value === 2) return layerFilters.value.practice || '/'
  if (currentLevel.value === 3) return layerFilters.value.category || '/'
  return '/'
}

const openCodelistAddDialog = async () => {
  codelistAddForm.value = {
    parent: computeCodelistParent(),
    longDesc: '',
    shortDesc: '',
    codeNum: ''
  }
  codelistAddDialogVisible.value = true

  try {
    const res = await getNextCodelistNumber()
    if (res?.nextCodeNum !== undefined && res?.nextCodeNum !== null) {
      codelistAddForm.value.codeNum = String(res.nextCodeNum)
      codelistAddPlaceholder.value = ''
    } else {
      codelistAddPlaceholder.value = '自动推荐一个可用编码，例如 10001'
    }
  } catch (error) {
    codelistAddPlaceholder.value = '自动推荐一个可用编码，例如 10001'
  }
}

const handleSaveCodelistAdd = async () => {
  const shortDesc = String(codelistAddForm.value.shortDesc || '').trim()
  const longDesc = String(codelistAddForm.value.longDesc || '').trim()
  const codeNum = String(codelistAddForm.value.codeNum || '').trim()
  const parsedCodeNum = Number(codeNum)

  if (!shortDesc) {
    ElMessage.warning('Please enter short description')
    return
  }
  if (!codeNum) {
    ElMessage.warning('Please enter or confirm the codelist value')
    return
  }
  if (Number.isNaN(parsedCodeNum)) {
    ElMessage.warning('Codelist value must be a number')
    return
  }

  const payload = {
    codeListTableName: selectedNode.value?.label || '',
    parentShortStringValue: computeCodelistParent() === '/' ? '' : computeCodelistParent(),
    shortStringValue: shortDesc,
    longStringValue: longDesc,
    codeListNumber: parsedCodeNum,
    status: true
  }

  try {
    await saveCodelistItem(payload)
    codelistAddDialogVisible.value = false
    ElMessage.success('Saved successfully')

    if (currentLevel.value === 1) {
      await loadCodelistLevelData(1)
    } else if (currentLevel.value === 2) {
      await loadCodelistLevelData(2, layerFilters.value.practice)
    } else {
      await loadCodelistLevelData(3, layerFilters.value.category)
    }
  } catch (error) {
    console.error('保存 Codelist 失败:', error)
  }
}

const handleToggleStatus = async () => {
  if (!codelistSelection.value.length) {
    ElMessage.warning('Please select at least one row')
    return
  }

  const enableMode = codelistSelection.value.every((row) => row.status === 0)
  try {
    if (enableMode) {
      await enableRows(codelistSelection.value)
      codelistSelection.value.forEach((row) => {
        row.status = 1
      })
      ElMessage.success('Enabled successfully')
    } else {
      await disableRows(codelistSelection.value)
      codelistSelection.value.forEach((row) => {
        row.status = 0
      })
      ElMessage.success('Disabled successfully')
    }
  } catch (error) {
    console.error('切换状态失败:', error)
  }
}

const checkSelectable = (row) => Boolean(row)

const tableRowClassName = ({ row }) => {
  return row.status === 0 ? 'is-disabled-row' : ''
}

onMounted(() => {
  loadTreeData()
})

watch(filterText, (value) => {
  treeRef.value?.filter(value)
})
</script>

<style scoped>
.basic-library-container {
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
  padding: 16px;
  overflow: hidden;
  min-height: 0;
}

.detail-container,
.codelist-card,
.table-section-container,
.table-wrapper {
  height: 100%;
}

.detail-container,
.codelist-card,
.table-section-container {
  min-height: 0;
}

.card-header,
.table-section-header,
.codelist-header,
.header-left,
.header-right,
.header-center {
  display: flex;
  align-items: center;
}

.card-header,
.table-section-header,
.codelist-header {
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0;
}

.header-left {
  gap: 10px;
}

.header-right {
  gap: 8px;
}

.header-center {
  flex: none;
  justify-content: flex-end;
  margin-left: auto;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.subtitle {
  color: #909399;
  font-size: 13px;
}

.filter-section {
  padding: 16px 18px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  background: #fafafa;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.filter-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.table-section-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 8px 16px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  background: #ffffff;
}

.table-section-header {
  padding: 4px 0 12px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  flex: none;
  padding-top: 10px;
  padding-bottom: 10px;
}

:deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.is-disabled-row) {
  color: #b1b3b8;
  background: #f5f7fa;
}
</style>
