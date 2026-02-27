<template>
  <div class="basic-library-container">
    <el-container class="main-layout">
      <!-- 左侧目录树 -->
      <el-aside width="280px" class="tree-aside">
        <div class="tree-title">
          <el-icon><Menu /></el-icon>
          <span>{{ currentTitle }}</span>
        </div>
        <div v-if="isPipeProfessional || isCodelistLibrary" class="tree-content">
          <div class="tree-header">
            <el-input
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
              node-key="label"
              highlight-current
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <el-icon v-if="data.children" class="folder-icon"><Folder /></el-icon>
                  <el-icon v-else class="file-icon"><Document /></el-icon>
                  <span>{{ node.label }}</span>
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
                  <span class="title">部件类型基础</span>
                  <span class="subtitle">*筛选条件默认为主端口1</span>
                  <div class="header-btns">
                    <el-button type="primary" plain :icon="Upload">导入</el-button>
                    <el-button type="primary" plain :icon="Download">导出</el-button>
                  </div>
                </div>
              </template>
              
              <div class="info-form-container">
                <el-form :model="componentDetails" label-width="130px" class="info-form">
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-form-item label="CC码：">
                        <el-select v-model="componentDetails.ccCode" style="width: 100%;">
                          <el-option label="PCSSA23" value="PCSSA23" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="壁厚：">
                        <el-select v-model="componentDetails.wallThickness" style="width: 100%;">
                          <el-option label="Sch.40" value="Sch.40" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="材料：">
                        <el-select v-model="componentDetails.material" style="width: 100%;">
                          <el-option label="20#" value="20#" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="PartClassName：">
                        <el-input v-model="componentDetails.partClassName" readonly />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-form-item label="几何类别：">
                        <el-input v-model="componentDetails.geometryCategory" readonly />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="部件分类：">
                        <el-input v-model="componentDetails.partCategory" readonly />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="Symbol方法：">
                        <el-input v-model="componentDetails.symbolMethod" readonly />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="UserClassName：">
                        <el-input v-model="componentDetails.userClassName" readonly />
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
                  >
                    <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                    <el-table-column prop="ccCode" label="CC码" width="120" />
                    <el-table-column prop="endStd1" label="端面标准1" min-width="180" />
                    <el-table-column prop="endStd2" label="端面标准2" min-width="180" />
                    <el-table-column prop="connType1" label="端面连接形式1" width="140" />
                    <el-table-column prop="connType2" label="端面连接形式2" width="140" />
                    <el-table-column prop="port1Size" label="端口1通径" width="120" />
                    <el-table-column prop="port2Size" label="端口2通径" width="120" />
                    <el-table-column prop="wallThickness1" label="壁厚1" width="100" />
                    <el-table-column prop="wallThickness2" label="壁厚2" width="100" />
                    <el-table-column prop="flowDirection1" label="流向1" width="100" />
                    <el-table-column prop="flowDirection2" label="流向2" width="100" />
                  </el-table>
                </div>
              </el-tab-pane>
              <el-tab-pane label="外形重量重心描述" name="appearance">
                <div class="table-wrapper">
                  <el-table 
                    ref="appearanceTableRef"
                    :data="appearanceData" 
                    border 
                    stripe 
                    height="100%"
                    :row-class-name="tableRowClassName"
                    @row-click="handleAppearanceRowClick"
                  >
                    <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                    <el-table-column prop="ccCode" label="CC码" width="120" />
                    <el-table-column prop="connType1" label="端面连接形式1" width="140" />
                    <el-table-column prop="connType2" label="端面连接形式2" width="140" />
                    <el-table-column prop="port1Size" label="端口1通径" width="120" />
                    <el-table-column prop="port2Size" label="端口2通径" width="120" />
                    <el-table-column prop="wallThickness1" label="壁厚1" width="100" />
                    <el-table-column prop="wallThickness2" label="壁厚2" width="100" />
                    <el-table-column prop="weight" label="重量" width="100" />
                    <el-table-column prop="dryCogX" label="DryCogX" width="100" />
                    <el-table-column prop="dryCogY" label="DryCogY" width="100" />
                    <el-table-column prop="dryCogZ" label="DryCogZ" width="100" />
                    <el-table-column prop="materialCode" label="物资编码" width="180" />
                    <el-table-column prop="materialDesc" label="物资描述" min-width="400" show-overflow-tooltip />
                  </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
              <!-- 公用端面数据 tab 页的按钮 -->
              <div class="tab-header-actions" v-if="activeTab === 'common'">
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
                <el-button type="danger" :icon="CircleClose" @click="handleDisable">禁用</el-button>
                <el-button type="warning" :icon="Edit">修改</el-button>
              </div>
              <!-- 外形重量重心描述 tab 页的按钮 -->
              <div class="tab-header-actions" v-if="activeTab === 'appearance'">
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
                <el-button type="danger" :icon="CircleClose" @click="handleDisable">禁用</el-button>
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
      <!-- 新增弹窗 -->
      <el-dialog v-model="addDialogVisible" title="新增部件" width="80%">
        <el-form :model="addForm" label-width="120px">
          <!-- 共同字段 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="CC码">
                <el-input v-model="addForm.ccCode" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="制作标准">
                <el-input v-model="addForm.manufacturingStd" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="部件分类">
                <el-input v-model="addForm.partCategory" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="材料">
                <el-input v-model="addForm.material" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="弯曲角度">
                <el-input v-model="addForm.bendingAngle" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="部分数据库">
                <el-input v-model="addForm.partialDatabase" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="几何类别">
                <el-input v-model="addForm.geometryCategory" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="activeTab === 'common'">
              <el-form-item label="端面标准1">
                <el-input v-model="addForm.endStd1" />
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="activeTab === 'common'">
              <el-form-item label="端面标准2">
                <el-input v-model="addForm.endStd2" />
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="activeTab === 'appearance'">
              <el-form-item label="端面连接形式1">
                <el-input v-model="addForm.connType1" />
              </el-form-item>
            </el-col>
            <el-col :span="8" v-if="activeTab === 'appearance'">
              <el-form-item label="端面连接形式2">
                <el-input v-model="addForm.connType2" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 公用端面数据独有字段 -->
          <template v-if="activeTab === 'common'">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="端面连接形式1">
                  <el-input v-model="addForm.connType1" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="端口1通径">
                  <el-input v-model="addForm.port1Size" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="壁厚1">
                  <el-input v-model="addForm.wallThickness1" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="端面连接形式2">
                  <el-input v-model="addForm.connType2" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="端口2通径">
                  <el-input v-model="addForm.port2Size" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="壁厚2">
                  <el-input v-model="addForm.wallThickness2" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="流向1">
                  <el-input v-model="addForm.flowDirection1" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="流向2">
                  <el-input v-model="addForm.flowDirection2" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>

          <!-- 外形重量重心描述独有字段 -->
          <template v-if="activeTab === 'appearance'">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="端口1通径">
                  <el-input v-model="addForm.port1Size" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="端口2通径">
                  <el-input v-model="addForm.port2Size" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="壁厚1">
                  <el-input v-model="addForm.wallThickness1" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="壁厚2">
                  <el-input v-model="addForm.wallThickness2" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="重量">
                  <el-input v-model="addForm.weight" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="DryCogX">
                  <el-input v-model="addForm.dryCogX" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="DryCogY">
                  <el-input v-model="addForm.dryCogY" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="DryCogZ">
                  <el-input v-model="addForm.dryCogZ" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="物资编码">
                  <el-input v-model="addForm.materialCode" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="16">
                <el-form-item label="物资描述">
                  <el-input v-model="addForm.materialDesc" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="handleSaveAdd">保存</el-button>
            <el-button @click="addDialogVisible = false">取消</el-button>
          </div>
          <div class="dialog-extra-action">
            <el-button link type="primary">批量新增点此导出模版表</el-button>
          </div>
        </template>
      </el-dialog>
    </el-container>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Search, Plus, FolderAdd, Folder, Document, 
  Upload, Download, CircleClose, Edit, Menu, CopyDocument 
} from '@element-plus/icons-vue'
import { getLibraryTree, getCodelistTree, getComponentDetails, getTableData, getCodelistTableData, disableRows } from '@/api/library'

const route = useRoute()
const filterText = ref('')
const codelistFilterText = ref('')
const treeRef = ref(null)
const selectedNode = ref(null)
const activeTab = ref('common')
const treeData = ref([])
const componentDetails = ref({})
// const tableData = ref([]) // Removed shared tableData
const commonData = ref([])
const appearanceData = ref([])
const codelistTableData = ref([])
const commonTableRef = ref(null)
const appearanceTableRef = ref(null)
const codelistTableRef = ref(null)

const addDialogVisible = ref(false)
const addForm = ref({
  ccCode: '',
  manufacturingStd: '',
  partCategory: '',
  material: '',
  bendingAngle: '',
  partialDatabase: '',
  endStd1: '',
  endStd2: '',
  geometryCategory: '',
  connType1: '',
  port1Size: '',
  wallThickness1: '',
  connType2: '',
  port2Size: '',
  wallThickness2: '',
  flowDirection1: '',
  flowDirection2: '',
  weight: '',
  dryCogX: '',
  dryCogY: '',
  dryCogZ: '',
  materialCode: '',
  materialDesc: ''
})

const currentTitle = computed(() => route.meta.title || '基础库')
const isPipeProfessional = computed(() => route.name === 'PipeLibrary')
const isCodelistLibrary = computed(() => route.name === 'CodelistLibrary')

const defaultProps = {
  children: 'children',
  label: 'label',
}

// 初始化加载目录树
const loadTreeData = async () => {
  if (isPipeProfessional.value) {
    try {
      const data = await getLibraryTree()
      treeData.value = data
    } catch (error) {
      console.error('加载目录树失败:', error)
    }
  } else if (isCodelistLibrary.value) {
    try {
      const data = await getCodelistTree()
      treeData.value = data
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

const handleNodeClick = async (data) => {
  if (!data.children) {
    selectedNode.value = data
    if (isPipeProfessional.value) {
      try {
        const details = await getComponentDetails(data.label)
        const table = await getTableData(data.label)
        componentDetails.value = details
        // Initialize both tables with deep copy to ensure independence
        commonData.value = JSON.parse(JSON.stringify(table))
        appearanceData.value = JSON.parse(JSON.stringify(table))
      } catch (error) {
        console.error('加载节点详情失败:', error)
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

const checkSelectable = (row) => {
  return !row.disabled
}

const tableRowClassName = ({ row }) => {
  if (row.disabled) {
    return 'disabled-row'
  }
  return ''
}

const handleDisable = async () => {
  let tableRef = null
  if (activeTab.value === 'common') {
    tableRef = commonTableRef.value
  } else {
    tableRef = appearanceTableRef.value
  }
  
  const selectedRows = tableRef?.getSelectionRows()
  
  if (!selectedRows || selectedRows.length === 0) {
    ElMessage.warning('请先选择要禁用的行')
    return
  }
  
  // 标记行为禁用并取消选择
  selectedRows.forEach(row => {
    row.disabled = true
    tableRef.toggleRowSelection(row, false)
  })
  
  try {
    await disableRows(selectedRows)
    ElMessage.success('禁用成功')
  } catch (error) {
    console.error('禁用失败:', error)
    ElMessage.error('禁用失败')
  }
}

const handleAdd = () => {
  // Determine which table is active and get selection
  let selectedRows = []
  if (activeTab.value === 'common' && commonTableRef.value) {
    selectedRows = commonTableRef.value.getSelectionRows()
  } else if (activeTab.value === 'appearance' && appearanceTableRef.value) {
    selectedRows = appearanceTableRef.value.getSelectionRows()
  }

  // Set default manufacturing standard from tree selection
  const defaultStd = selectedNode.value ? selectedNode.value.label : ''
  
  if (selectedRows && selectedRows.length > 0) {
    // Clone the first selected row
    const row = selectedRows[0]
    addForm.value = {
      ccCode: row.ccCode || '',
      manufacturingStd: defaultStd,
      partCategory: componentDetails.value.partCategory || '',
      material: componentDetails.value.material || '',
      bendingAngle: '', // Not in tableData usually
      partialDatabase: '', // Not in tableData usually
      endStd1: row.endStd1 || '',
      endStd2: row.endStd2 || '',
      geometryCategory: componentDetails.value.geometryCategory || '',
      connType1: row.connType1 || '',
      port1Size: row.port1Size || '',
      wallThickness1: row.wallThickness1 || '',
      connType2: row.connType2 || '',
      port2Size: row.port2Size || '',
      wallThickness2: row.wallThickness2 ?? '',
      flowDirection1: row.flowDirection1 ?? '',
      flowDirection2: row.flowDirection2 ?? '',
      weight: row.weight ?? '',
      dryCogX: row.dryCogX ?? '',
      dryCogY: row.dryCogY ?? '',
      dryCogZ: row.dryCogZ ?? '',
      materialCode: row.materialCode ?? '',
      materialDesc: row.materialDesc ?? ''
    }
  } else {
    // Empty form with default standard
    addForm.value = {
      ccCode: '',
      manufacturingStd: defaultStd,
      partCategory: '',
      material: '',
      bendingAngle: '',
      partialDatabase: '',
      endStd1: '',
      endStd2: '',
      geometryCategory: '',
      connType1: '',
      port1Size: '',
      wallThickness1: '',
      connType2: '',
      port2Size: '',
      wallThickness2: '',
      flowDirection1: '',
      flowDirection2: '',
      weight: '',
      dryCogX: '',
      dryCogY: '',
      dryCogZ: '',
      materialCode: '',
      materialDesc: ''
    }
  }
  
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