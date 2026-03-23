<template>
  <div class="app-container" style="padding: 20px;">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="简选序列" name="definition">
          <div style="margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px;">
            <el-button
              type="primary"
              size="small"
              @click="openAddDialog"
              :disabled="isDefinitionEditing"
            >
              新增
            </el-button>
            <el-button
              size="small"
              @click="handleEditDefinition"
              :disabled="isDefinitionEditing"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleSaveDefinition"
              :disabled="!isDefinitionEditing"
            >
              保存
            </el-button>
          </div>
          <el-table :data="definitionTableData" border style="width: 100%">
            <el-table-column prop="sequenceName" label="简选序列">
              <template #default="{ row }">
                <span v-if="!isDefinitionEditing">{{ row.sequenceName }}</span>
                <el-input v-else v-model="row.sequenceName" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="部件名称">
              <template #default="{ row }">
                <span v-if="!isDefinitionEditing">{{ row.name }}</span>
                <el-input v-else v-model="row.name" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="componentType" label="部件类型">
              <template #default="{ row }">
                <span v-if="!isDefinitionEditing">{{ row.componentType }}</span>
                <el-input v-else v-model="row.componentType" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="standard" label="标准">
              <template #default="{ row }">
                <span v-if="!isDefinitionEditing">{{ row.standard }}</span>
                <el-input v-else v-model="row.standard" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="technicalRequirement" label="技术要求">
              <template #default="{ row }">
                <span v-if="!isDefinitionEditing">{{ row.technicalRequirement }}</span>
                <el-input v-else v-model="row.technicalRequirement" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="version" label="版本" width="80">
              <template #default="{ row }">
                <span v-if="!isDefinitionEditing">{{ row.version }}</span>
                <el-input v-else v-model="row.version" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="是否启用" width="110">
              <template #default="{ row }">
                <template v-if="!isDefinitionEditing">
                  {{ row.enabled ? '启用' : '禁用' }}
                </template>
                <el-button
                  v-else
                  :type="row.enabled ? 'success' : 'info'"
                  size="small"
                  @click="row.enabled = !row.enabled"
                >
                  {{ row.enabled ? '启用' : '禁用' }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column v-if="isDefinitionEditing" label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="deleteDefinition($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="序列配置" name="detail">
          <div style="height: 500px; display: flex;">
            <div
              style="
                width: 260px;
                border-right: 1px solid #ebeef5;
                padding-right: 16px;
                display: flex;
                flex-direction: column;
              "
            >
          <el-tree
            :data="treeData"
            node-key="id"
            :props="treeProps"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
            style="flex: 1; overflow: auto;"
          />
        </div>
        <div
          style="
            flex: 1;
            padding-left: 16px;
            display: flex;
            flex-direction: column;
            height: 100%;
          "
        >
          <div
            v-if="isThirdLevelSelected"
            style="
              display: flex;
              flex-direction: column;
              height: 100%;
            "
          >
            <div
              style="
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <div style="font-weight: 600;">
                几何标准：{{ selectedLeafNode?.label }}
              </div>
              <div style="display: flex; gap: 8px;">
                <el-button
                  size="small"
                  @click="handleEditDetail"
                  :disabled="isEditing"
                >
                  编辑
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleSaveDetail"
                  :disabled="!isEditing"
                >
                  保存
                </el-button>
              </div>
            </div>
            <el-table
              :data="detailTableData"
              border
              height="100%"
              style="width: 100%;"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="thicknessLevel" label="壁厚等级">
                <template #default="{ row }">
                  <span v-if="!isEditing">{{ row.thicknessLevel }}</span>
                  <el-input
                    v-else
                    v-model="row.thicknessLevel"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="nominalDiameter" label="通径">
                <template #default="{ row }">
                  <span v-if="!isEditing">{{ row.nominalDiameter }}</span>
                  <el-input-number
                    v-else
                    v-model="row.nominalDiameter"
                    :min="0"
                    size="small"
                    controls-position="right"
                    style="width: 100%;"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="nominalDiameterUnit" label="通径单位" width="90">
                <template #default="{ row }">
                  <span v-if="!isEditing">{{ row.nominalDiameterUnit }}</span>
                  <el-input
                    v-else
                    v-model="row.nominalDiameterUnit"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="outerDiameter" label="外经">
                <template #default="{ row }">
                  <span v-if="!isEditing">{{ row.outerDiameter }}</span>
                  <el-input-number
                    v-else
                    v-model="row.outerDiameter"
                    :min="0"
                    size="small"
                    controls-position="right"
                    style="width: 100%;"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="wallThickness" label="壁厚">
                <template #default="{ row }">
                  <span v-if="!isEditing">{{ row.wallThickness }}</span>
                  <el-input-number
                    v-else
                    v-model="row.wallThickness"
                    :min="0"
                    size="small"
                    controls-position="right"
                    style="width: 100%;"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="version" label="版本" width="80">
                <template #default="{ row }">
                  <span v-if="!isEditing">{{ row.version }}</span>
                  <el-input-number
                    v-else
                    v-model="row.version"
                    :min="1"
                    size="small"
                    controls-position="right"
                    style="width: 100%;"
                  />
                </template>
              </el-table-column>
              <el-table-column label="是否启用" width="110">
                <template #default="{ row }">
                  <template v-if="!isEditing">
                    {{ row.enabled ? '启用' : '禁用' }}
                  </template>
                  <el-button
                    v-else
                    :type="row.enabled ? 'success' : 'info'"
                    size="small"
                    @click="row.enabled = !row.enabled"
                  >
                    {{ row.enabled ? '启用' : '禁用' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div
            v-else
            style="
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <el-empty description="请选择第三级几何标准节点" />
          </div>
        </div>
      </div>
        </el-tab-pane>
        <el-tab-pane label="看板" name="dashboard">
          <div style="height: 500px; display: flex;">
            <div
              style="
                width: 260px;
                border-right: 1px solid #ebeef5;
                padding-right: 16px;
                display: flex;
                flex-direction: column;
              "
            >
              <el-input
                v-model="dashboardFilterText"
                placeholder="筛选简选序列"
                size="small"
                style="margin-bottom: 8px;"
              />
              <el-tree
                ref="dashboardTreeRef"
                :data="dashboardTreeData"
                node-key="id"
                :props="treeProps"
                default-expand-all
                highlight-current
                :filter-node-method="filterDashboardNode"
                @node-click="handleDashboardNodeClick"
                style="flex: 1; overflow: auto;"
              />
            </div>
            <div
              style="
                flex: 1;
                padding-left: 16px;
                display: flex;
                flex-direction: column;
                height: 100%;
              "
            >
              <el-table
                :data="dashboardTableData"
                border
                height="100%"
                style="width: 100%;"
              >
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="componentName" label="部件名称" />
                <el-table-column prop="nominalDiameter" label="公称通径" />
                <el-table-column prop="materialGrade" label="材料牌号" />
                <el-table-column prop="standardNumber" label="标准号" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="addDialogVisible"
      title="新增简选序列"
      width="500px"
    >
      <el-form :model="newDefinitionForm" label-width="100px">
        <el-form-item label="简选序列" required>
          <el-input v-model="newDefinitionForm.sequenceName" />
        </el-form-item>
        <el-form-item label="部件名称" required>
          <el-input v-model="newDefinitionForm.name" />
        </el-form-item>
        <el-form-item label="部件类型" required>
          <el-input v-model="newDefinitionForm.componentType" />
        </el-form-item>
        <el-form-item label="标准" required>
          <el-input v-model="newDefinitionForm.standard" />
        </el-form-item>
        <el-form-item label="技术要求">
          <el-input v-model="newDefinitionForm.technicalRequirement" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="newDefinitionForm.version" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddDefinition">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
defineOptions({ name: 'StandardSequence' })
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('definition')
const isDefinitionEditing = ref(false)

const addDialogVisible = ref(false)
const newDefinitionForm = ref({
  sequenceName: '',
  name: '',
  componentType: '',
  standard: '',
  technicalRequirement: '',
  version: ''
})

const openAddDialog = () => {
  newDefinitionForm.value = {
    sequenceName: '',
    name: '',
    componentType: '',
    standard: '',
    technicalRequirement: '',
    version: ''
  }
  addDialogVisible.value = true
}

const confirmAddDefinition = () => {
  if (!newDefinitionForm.value.sequenceName || !newDefinitionForm.value.name || !newDefinitionForm.value.standard) {
    ElMessage.warning('请填写必填项')
    return
  }
  definitionTableData.value.push({
    ...newDefinitionForm.value,
    enabled: true
  })
  addDialogVisible.value = false
  ElMessage.success('添加成功')
}

const deleteDefinition = (index) => {
  definitionTableData.value.splice(index, 1)
  ElMessage.success('删除成功')
}

// Dashboard Logic
const dashboardFilterText = ref('')
const dashboardTreeRef = ref(null)
const dashboardTableData = ref([])

const dashboardTreeData = computed(() => {
  const tree = []
  definitionTableData.value.forEach(item => {
    if (!item.sequenceName) return
    
    // Level 1: sequenceName
    let seqNode = tree.find(n => n.label === item.sequenceName)
    if (!seqNode) {
      seqNode = {
        id: `dashboard-seq-${item.sequenceName}`,
        label: item.sequenceName
      }
      tree.push(seqNode)
    }
  })
  return tree
})

watch(dashboardFilterText, (val) => {
  dashboardTreeRef.value?.filter(val)
})

const filterDashboardNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

const handleDashboardNodeClick = (data, node) => {
  // Filter definitionTableData based on the selected sequenceName
  const sequenceName = data.label
  const items = definitionTableData.value.filter(item => item.sequenceName === sequenceName)

  // Group by component name to aggregate standards and calculate nominal diameter range
  const groupedItems = {}
  items.forEach(item => {
    if (!groupedItems[item.name]) {
      groupedItems[item.name] = {
        name: item.name,
        standards: new Set(),
        minDiameter: Infinity,
        maxDiameter: -Infinity
      }
    }
    groupedItems[item.name].standards.add(item.standard)
    
    // Mock logic for diameter range based on component type/standard if real data isn't available
    // In a real scenario, you'd query the detail table or have this data in definitionTableData
    // For this mock, we'll assign random ranges to demonstrate the format "10~400"
    const mockMin = 10
    const mockMax = 400
    if (mockMin < groupedItems[item.name].minDiameter) groupedItems[item.name].minDiameter = mockMin
    if (mockMax > groupedItems[item.name].maxDiameter) groupedItems[item.name].maxDiameter = mockMax
  })

  dashboardTableData.value = Object.values(groupedItems).map(group => ({
    componentName: group.name,
    nominalDiameter: `${group.minDiameter}~${group.maxDiameter}`,
    materialGrade: '20#', // Mock data
    standardNumber: Array.from(group.standards).join(',')
  }))
}

const definitionTableData = ref([
  { sequenceName: '50-001', name: '碳钢无缝压力钢管', componentType: '管材', standard: 'GB/T 8163', technicalRequirement: 'N/A', version: '1.0', enabled: true },
  { sequenceName: '50-001', name: '碳钢无缝压力钢管', componentType: '管材', standard: 'GB/T 5312', technicalRequirement: 'N/A', version: '1.0', enabled: true },
  { sequenceName: '50-001', name: '奥氏体不锈钢无缝压力钢管', componentType: '管材', standard: 'GB/T 14976', technicalRequirement: 'N/A', version: '1.0', enabled: true },
  { sequenceName: '50-001', name: '碳钢焊接压力钢管', componentType: '管材', standard: 'GB/T 3091', technicalRequirement: 'N/A', version: '1.0', enabled: true },
  { sequenceName: '50-001', name: '奥氏体-铁素体型双相不锈钢管', componentType: '管材', standard: 'GB/T 21833.2', technicalRequirement: 'N/A', version: '1.0', enabled: false }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

const selectedNode = ref(null)
const selectedLevel = ref(0)
const selectedLeafNode = ref(null)
const detailTableData = ref([])
const isEditing = ref(false)

const treeData = computed(() => {
  const tree = []
  definitionTableData.value.forEach(item => {
    if (!item.sequenceName || !item.name || !item.standard) return
    
    // Level 1: sequenceName
    let seqNode = tree.find(n => n.label === item.sequenceName)
    if (!seqNode) {
      seqNode = {
        id: `seq-${item.sequenceName}`,
        label: item.sequenceName,
        children: []
      }
      tree.push(seqNode)
    }

    // Level 2: name
    let nameNode = seqNode.children.find(n => n.label === item.name)
    if (!nameNode) {
      nameNode = {
        id: `seq-${item.sequenceName}-name-${item.name}`,
        label: item.name,
        children: []
      }
      seqNode.children.push(nameNode)
    }

    // Level 3: standard
    let standardNode = nameNode.children.find(n => n.label === item.standard)
    if (!standardNode) {
      standardNode = {
        id: `seq-${item.sequenceName}-name-${item.name}-std-${item.standard}`,
        label: item.standard
      }
      nameNode.children.push(standardNode)
    }
  })
  return tree
})

const handleNodeClick = (data, node) => {
  selectedNode.value = data
  selectedLevel.value = node.level
  isEditing.value = false
  if (node.level === 3) {
    selectedLeafNode.value = data
    detailTableData.value = [
      {
        id: 1,
        thicknessLevel: 'D1',
        nominalDiameter: 50,
        nominalDiameterUnit: 'DN',
        outerDiameter: 60.3,
        wallThickness: 3.9,
        version: 1,
        enabled: true
      },
      {
        id: 2,
        thicknessLevel: 'D2',
        nominalDiameter: 80,
        nominalDiameterUnit: 'DN',
        outerDiameter: 88.9,
        wallThickness: 5.5,
        version: 1,
        enabled: true
      },
      {
        id: 3,
        thicknessLevel: 'D3',
        nominalDiameter: 100,
        nominalDiameterUnit: 'DN',
        outerDiameter: 114.3,
        wallThickness: 6.3,
        version: 2,
        enabled: false
      }
    ]
  } else {
    selectedLeafNode.value = null
    detailTableData.value = []
  }
}

const isThirdLevelSelected = computed(() => selectedLevel.value === 3 && !!selectedLeafNode.value)

const handleSaveDetail = () => {
  if (!isThirdLevelSelected.value) {
    ElMessage.warning('请选择第三级几何标准节点')
    return
  }
  ElMessage.success('保存成功（当前为前端示例数据）')
  isEditing.value = false
}

const handleEditDetail = () => {
  if (!isThirdLevelSelected.value) {
    ElMessage.warning('请选择第三级几何标准节点')
    return
  }
  isEditing.value = true
}

const handleEditDefinition = () => {
  isDefinitionEditing.value = true
}

const handleSaveDefinition = () => {
  ElMessage.success('简选序列保存成功（当前为前端示例数据）')
  isDefinitionEditing.value = false
}
</script>
