<template>
  <div class="property-page">
    <div class="page-container">
      <!-- 左侧目录树 -->
      <div class="sidebar-panel">
        <div class="sidebar-content">
          <div class="sidebar-title">Interface 列表</div>
          <el-input
            v-model="treeSearchText"
            placeholder="搜索接口/类别/属性..."
            clearable
            prefix-icon="Search"
            style="margin-bottom: 10px;"
          />
          <div class="tree-wrapper">
            <el-tree
              ref="treeRef"
              :data="treeData"
              :props="{ children: 'children', label: 'label' }"
              node-key="id"
              :expand-on-click-node="false"
              @node-click="handleTreeNodeClick"
              :filter-node-method="filterTreeNode"
              highlight-current
            />
          </div>
        </div>
      </div>

      <!-- 右侧主要内容 -->
      <div class="main-panel">
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="tabs-container">
          <!-- 属性管理标签页 -->
          <el-tab-pane label="属性管理" name="property">
            <div class="property-table-container">
              <!-- 顶部工具栏 -->
              <div class="table-header">
                <div class="title-area">
                  <h3>属性管理</h3>
                  <el-tag v-if="selectedInterface" type="primary" effect="plain" class="ml-2">
                    {{ selectedInterface }}
                  </el-tag>
                </div>
                
                <div class="actions">
                  <el-input 
                    v-model="searchText" 
                    placeholder="搜索属性..."
                    prefix-icon="Search"
                    clearable
                    @input="onSearch"
                    style="width: 200px; margin-right: 12px;"
                  />
              <el-button-group>
                <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
                <el-button icon="Refresh" @click="loadData">刷新</el-button>
                <el-button icon="Download" @click="handleExport">导出</el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 属性表格 -->
          <el-table 
            :data="filteredPropertyList" 
            border 
            stripe
            style="width: 100%; flex: 1;"
            v-loading="loading"
            height="100%"
            :default-sort="{ prop: 'id', order: 'ascending' }"
          >
          <!-- 展开行 -->
          <el-table-column type="expand" min-width="45">
            <template #default="{ row }">
              <div class="expand-content">
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Category Name:</span>
                      <span class="detail-value">{{ row.categoryName }}</span>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Attribute Name:</span>
                      <span class="detail-value">{{ row.attributeName }}</span>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Units Type:</span>
                      <span class="detail-value">{{ row.unitsType || '-' }}</span>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Primary Units:</span>
                      <span class="detail-value">{{ row.primaryUnits || '-' }}</span>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Codelist:</span>
                      <span class="detail-value">{{ row.codelist || '-' }}</span>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">CodeList Namespace:</span>
                      <span class="detail-value">{{ row.codelistNamespace || '-' }}</span>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">OnPropertyPage:</span>
                      <el-tag :type="row.onPropertyPage ? 'success' : 'info'" size="small">
                        {{ row.onPropertyPage ? '是' : '否' }}
                      </el-tag>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">ReadOnly:</span>
                      <el-tag :type="row.readOnly ? 'danger' : 'success'" size="small">
                        {{ row.readOnly ? '是' : '否' }}
                      </el-tag>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">SymbolParameter:</span>
                      <el-tag :type="row.symbolParameter ? 'warning' : 'info'" size="small">
                        {{ row.symbolParameter ? '是' : '否' }}
                      </el-tag>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Version:</span>
                      <el-tag type="success" size="small">v{{ row.version || 1 }}</el-tag>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Modifier:</span>
                      <span class="detail-value">{{ row.modifier || '-' }}</span>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Created:</span>
                      <span class="detail-value">{{ row.createdTime || '-' }}</span>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="8">
                    <div class="detail-item">
                      <span class="detail-label">Updated:</span>
                      <span class="detail-value">{{ row.updatedTime || '-' }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </template>
          </el-table-column>
          
          <!-- 序号列 -->
          <el-table-column type="index" label="序号" min-width="60" />
          
          <!-- Interface Name -->
          <el-table-column 
            prop="interfaceName" 
            label="Interface Name"
            min-width="150"
            show-overflow-tooltip
          />
          
          <!-- Attribute UserName -->
          <el-table-column 
            prop="attributeUserName" 
            label="Attribute UserName"
            min-width="180"
            show-overflow-tooltip
          />
          
          <!-- Type -->
          <el-table-column 
            prop="type" 
            label="Type"
            min-width="100"
            show-overflow-tooltip
          />
          
          <!-- Codelist -->
          <el-table-column 
            prop="codelist" 
            label="Codelist"
            min-width="130"
            show-overflow-tooltip
          />
          
          <!-- 操作列 -->
          <el-table-column 
            label="操作" 
            min-width="120" 
            fixed="right"
            align="center"
          >
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  link 
                  icon="Edit"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button 
                  type="danger" 
                  link 
                  icon="Delete"
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
            </div>
          </el-tab-pane>

          <!-- 维护Object Type和Interface的标签页 -->
          <el-tab-pane label="维护配置" name="config">
            <div class="config-container">
              <div class="config-header">
                <h3>对象类型与接口维护</h3>
                <el-button type="primary" icon="Plus" @click="handleAddObjectType">新增对象类型</el-button>
              </div>

              <el-table :data="objectTypeConfigList" border stripe style="width: 100%; margin-top: 20px;">
                <el-table-column prop="objectType" label="对象类型" width="200" />
                <el-table-column prop="interfaces" label="关联接口" min-width="300">
                  <template #default="{ row }">
                    <el-space wrap>
                      <el-tag v-for="iface in row.interfaces" :key="iface" closable @close="handleRemoveInterface(row.objectType, iface)">
                        {{ iface }}
                      </el-tag>
                      <el-button type="primary" link size="small" @click="handleAddInterface(row.objectType)">
                        添加接口
                      </el-button>
                    </el-space>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                  <template #default="{ row }">
                    <el-button type="danger" link icon="Delete" @click="handleDeleteObjectType(row.objectType)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 编辑/新增 对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑属性' : '新增属性'"
      width="60%"
    >
      <el-form 
        :model="formData" 
        label-width="180px"
        :rules="rules"
        ref="formRef"
      >
        <el-form-item label="Object Type" prop="objectType">
          <el-select v-model="formData.objectType" placeholder="请选择对象类型" clearable>
            <el-option v-for="type in objectTypeList" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>

        <el-form-item label="Interface Name" prop="interfaceName">
          <el-select v-model="formData.interfaceName" placeholder="请选择接口" clearable :disabled="!formData.objectType">
            <el-option v-for="iface in interfaceList" :key="iface" :label="iface" :value="iface" />
          </el-select>
        </el-form-item>

        <el-form-item label="Category Name" prop="categoryName">
          <el-input v-model="formData.categoryName" placeholder="请输入Category Name" />
        </el-form-item>

        <el-form-item label="Attribute Name" prop="attributeName">
          <el-input v-model="formData.attributeName" placeholder="请输入Attribute Name" />
        </el-form-item>

        <el-form-item label="Attribute UserName" prop="attributeUserName">
          <el-input v-model="formData.attributeUserName" placeholder="请输入Attribute UserName" />
        </el-form-item>

        <el-form-item label="Type" prop="type">
          <el-input v-model="formData.type" placeholder="请输入Type" />
        </el-form-item>

        <el-form-item label="Units Type" prop="unitsType">
          <el-input v-model="formData.unitsType" placeholder="请输入Units Type" />
        </el-form-item>

        <el-form-item label="Primary Units" prop="primaryUnits">
          <el-input v-model="formData.primaryUnits" placeholder="请输入Primary Units" />
        </el-form-item>

        <el-form-item label="Codelist" prop="codelist">
          <el-input v-model="formData.codelist" placeholder="请输入Codelist" />
        </el-form-item>

        <el-form-item label="CodeList Namespace" prop="codelistNamespace">
          <el-input v-model="formData.codelistNamespace" placeholder="请输入CodeList table namespace" />
        </el-form-item>

        <el-form-item label="OnPropertyPage" prop="onPropertyPage">
          <el-switch v-model="formData.onPropertyPage" />
        </el-form-item>

        <el-form-item label="ReadOnly" prop="readOnly">
          <el-switch v-model="formData.readOnly" />
        </el-form-item>

        <el-form-item label="SymbolParameter" prop="symbolParameter">
          <el-switch v-model="formData.symbolParameter" />
        </el-form-item>

        <!-- 版本管理信息（仅读） -->
        <el-divider>版本管理</el-divider>
        <el-form-item label="Version">
          <el-input :value="`v${formData.version || 1}`" disabled />
        </el-form-item>
        <el-form-item label="Modifier">
          <el-input v-model="formData.modifier" :placeholder="isEdit ? '修改人信息自动更新' : '创建者（可编辑）'" />
        </el-form-item>
        <el-form-item label="Created Time">
          <el-input v-model="formData.createdTime" disabled />
        </el-form-item>
        <el-form-item label="Updated Time">
          <el-input v-model="formData.updatedTime" disabled />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">{{ isEdit ? '更新（版本号自动升级）' : '新增' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'

// 属性列表
const propertyList = ref([])

// 目录树数据
const treeData = ref([])

// 树组件引用
const treeRef = ref(null)

// 树搜索文本
const treeSearchText = ref('')

// 标签页激活状态
const activeTab = ref('property')

// 映射Object Type和Interface的配置数据
const objectTypeConfigList = ref([])

// 搜索文本
const searchText = ref('')

// 加载状态
const loading = ref(false)

// 当前选中的Interface
const selectedInterface = ref('')

// 对象类型列表（从现有数据提取）
const objectTypeList = computed(() => {
  const types = new Set()
  propertyList.value.forEach(item => {
    const objectType = item.interfaceName.replace(/^IJ/, '') || 'Other'
    types.add(objectType)
  })
  return Array.from(types).sort()
})

// 根据选中的对象类型获取接口列表
const interfaceList = computed(() => {
  if (!formData.value.objectType) return []
  const interfaces = new Set()
  propertyList.value.forEach(item => {
    const objectType = item.interfaceName.replace(/^IJ/, '') || 'Other'
    if (objectType === formData.value.objectType) {
      interfaces.add(item.interfaceName)
    }
  })
  return Array.from(interfaces).sort()
})

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
const formData = ref({
  id: null,
  objectType: '',
  interfaceName: '',
  categoryName: '',
  attributeName: '',
  attributeUserName: '',
  type: '',
  unitsType: '',
  primaryUnits: '',
  codelist: '',
  codelistNamespace: '',
  onPropertyPage: false,
  readOnly: false,
  symbolParameter: false,
  version: 1,
  createdTime: '',
  updatedTime: '',
  modifier: 'admin'
})

// 表单验证规则
const rules = {
  interfaceName: [{ required: true, message: '请输入Interface Name', trigger: 'blur' }],
  attributeName: [{ required: true, message: '请输入Attribute Name', trigger: 'blur' }],
  type: [{ required: true, message: '请输入Type', trigger: 'blur' }]
}

// 过滤后的属性列表
const filteredPropertyList = computed(() => {
  let list = propertyList.value
  
  // 先按选中的Interface过滤
  if (selectedInterface.value) {
    list = list.filter(item => item.interfaceName === selectedInterface.value)
  }
  
  // 再按搜索文本过滤
  if (!searchText.value) return list
  return list.filter(item => {
    const text = searchText.value.toLowerCase()
    return (
      item.interfaceName.toLowerCase().includes(text) ||
      item.categoryName.toLowerCase().includes(text) ||
      item.attributeName.toLowerCase().includes(text) ||
      item.attributeUserName.toLowerCase().includes(text) ||
      item.type.toLowerCase().includes(text)
    )
  })
})

// 统计数据
const totalCount = computed(() => propertyList.value.length)

const enabledCount = computed(() => 
  propertyList.value.filter(p => p.onPropertyPage).length
)

const readOnlyCount = computed(() => 
  propertyList.value.filter(p => p.readOnly).length
)

const symbolCount = computed(() => 
  propertyList.value.filter(p => p.symbolParameter).length
)

const interfaceCount = computed(() => {
  const interfaces = new Set(propertyList.value.map(p => p.interfaceName))
  return interfaces.size
})

const typeCount = computed(() => {
  const types = new Set(propertyList.value.map(p => p.type))
  return types.size
})

/**
 * 搜索处理
 */
function onSearch() {
  // 计算属性会自动更新
}

/**
 * 树节点过滤方法
 */
function filterTreeNode(value, data) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

/**
 * 监听树搜索文本变化
 */
watch(treeSearchText, (val) => {
  treeRef.value?.filter(val)
})

/**
 * 构建树形结构数据 - 三层结构：对象类型 -> 接口 -> 属性
 */
function buildTreeData() {
  const objectTypeMap = new Map()
  
  propertyList.value.forEach(item => {
    // 从interfaceName提取objectType（去掉'IJ'前缀）
    const objectType = item.interfaceName.replace(/^IJ/, '') || 'Other'
    
    if (!objectTypeMap.has(objectType)) {
      objectTypeMap.set(objectType, new Map())
    }
    const interfaceMap = objectTypeMap.get(objectType)
    if (!interfaceMap.has(item.interfaceName)) {
      interfaceMap.set(item.interfaceName, [])
    }
    interfaceMap.get(item.interfaceName).push(item)
  })
  
  const tree = []
  // 按对象类型排序
  Array.from(objectTypeMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([objectType, interfaceMap]) => {
      const interfaceChildren = []
      // 按接口名排序
      Array.from(interfaceMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([interfaceName, properties]) => {
          interfaceChildren.push({
            id: `${objectType}-${interfaceName}`,
            label: interfaceName,
            children: properties.map((p, index) => ({
              id: `${objectType}-${interfaceName}-${index}`,
              label: p.attributeUserName || p.attributeName
            }))
          })
        })
      tree.push({
        id: objectType,
        label: `${objectType} (${interfaceMap.size})`,
        children: interfaceChildren
      })
    })
  
  treeData.value = tree
}

/**
 * 树节点点击事件 - 三层结构处理
 */
function handleTreeNodeClick(data) {
  const parts = data.id.split('-')
  if (parts.length === 2) {
    // 点击的是接口层（objectType-interfaceName）
    const interfaceName = parts[1]
    selectedInterface.value = interfaceName === selectedInterface.value ? '' : interfaceName
  } else if (parts.length > 2) {
    // 点击的是属性层或其他层，则选择对应的Interface
    const interfaceName = parts[1]
    selectedInterface.value = interfaceName
  } else {
    // 点击的是对象类型层，清空选择
    selectedInterface.value = ''
  }
}

/**
 * 加载数据
 */
function loadData() {
  propertyList.value = [
    {
      id: 1,
      interfaceName: 'IJPipeRun',
      categoryName: 'BasicInfo',
      attributeName: 'RunID',
      attributeUserName: 'Run ID',
      type: 'Integer',
      unitsType: '',
      primaryUnits: '',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false,
      version: 1,
      createdTime: '2026-01-01 10:00:00',
      updatedTime: '2026-01-01 10:00:00'
    },
    {
      id: 2,
      interfaceName: 'IJPipeRun',
      categoryName: 'BasicInfo',
      attributeName: 'RunName',
      attributeUserName: 'Run Name',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false,
      version: 1,
      createdTime: '2026-01-01 10:05:00',
      updatedTime: '2026-01-01 10:05:00'
    },
    {
      id: 3,
      interfaceName: 'IJPipeRun',
      categoryName: 'Specifications',
      attributeName: 'NominalSize',
      attributeUserName: 'Nominal Size',
      type: 'Double',
      unitsType: 'Length',
      primaryUnits: 'mm',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: true,
      symbolParameter: true
    },
    {
      id: 4,
      interfaceName: 'IJPipeRun',
      categoryName: 'Specifications',
      attributeName: 'WallThickness',
      attributeUserName: 'Wall Thickness',
      type: 'Double',
      unitsType: 'Length',
      primaryUnits: 'mm',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: true,
      symbolParameter: true
    },
    {
      id: 5,
      interfaceName: 'IJMaterial',
      categoryName: 'Properties',
      attributeName: 'MaterialGrade',
      attributeUserName: 'Material Grade',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: 'MaterialGrades',
      codelistNamespace: 'com.smartplant.materials',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 6,
      interfaceName: 'IJEquipment',
      categoryName: 'Identification',
      attributeName: 'EquipmentNumber',
      attributeUserName: 'Equipment No.',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: true,
      symbolParameter: false
    },
    {
      id: 7,
      interfaceName: 'IJPipeRun',
      categoryName: 'Specifications',
      attributeName: 'OuterDiameter',
      attributeUserName: 'Outer Diameter',
      type: 'Double',
      unitsType: 'Length',
      primaryUnits: 'mm',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: true
    },
    {
      id: 8,
      interfaceName: 'IJPipeRun',
      categoryName: 'Specifications',
      attributeName: 'PipeSchedule',
      attributeUserName: 'Pipe Schedule',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: 'PipeSchedule',
      codelistNamespace: 'com.smartplant.piping',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 9,
      interfaceName: 'IJPipeRun',
      categoryName: 'Design',
      attributeName: 'DesignPressure',
      attributeUserName: 'Design Pressure',
      type: 'Double',
      unitsType: 'Pressure',
      primaryUnits: 'MPa',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 10,
      interfaceName: 'IJPipeRun',
      categoryName: 'Design',
      attributeName: 'DesignTemperature',
      attributeUserName: 'Design Temperature',
      type: 'Double',
      unitsType: 'Temperature',
      primaryUnits: '°C',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 11,
      interfaceName: 'IJMaterial',
      categoryName: 'Properties',
      attributeName: 'MaterialSpec',
      attributeUserName: 'Material Spec',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: 'MaterialSpec',
      codelistNamespace: 'com.smartplant.materials',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 12,
      interfaceName: 'IJMaterial',
      categoryName: 'Properties',
      attributeName: 'Density',
      attributeUserName: 'Density',
      type: 'Double',
      unitsType: 'Density',
      primaryUnits: 'kg/m³',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: true,
      symbolParameter: false
    },
    {
      id: 13,
      interfaceName: 'IJMaterial',
      categoryName: 'Thermal',
      attributeName: 'ThermalExpansion',
      attributeUserName: 'Thermal Expansion',
      type: 'Double',
      unitsType: 'Coefficient',
      primaryUnits: '1/°C',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: true,
      symbolParameter: false
    },
    {
      id: 14,
      interfaceName: 'IJEquipment',
      categoryName: 'Identification',
      attributeName: 'EquipmentTag',
      attributeUserName: 'Equipment Tag',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 15,
      interfaceName: 'IJEquipment',
      categoryName: 'Design',
      attributeName: 'RatedCapacity',
      attributeUserName: 'Rated Capacity',
      type: 'Double',
      unitsType: 'Volume',
      primaryUnits: 'm³',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 16,
      interfaceName: 'IJEquipment',
      categoryName: 'Design',
      attributeName: 'OperatingPressure',
      attributeUserName: 'Operating Pressure',
      type: 'Double',
      unitsType: 'Pressure',
      primaryUnits: 'MPa',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 17,
      interfaceName: 'IJValve',
      categoryName: 'BasicInfo',
      attributeName: 'ValveType',
      attributeUserName: 'Valve Type',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: 'ValveType',
      codelistNamespace: 'com.smartplant.piping',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: true
    },
    {
      id: 18,
      interfaceName: 'IJValve',
      categoryName: 'BasicInfo',
      attributeName: 'ValveSize',
      attributeUserName: 'Valve Size',
      type: 'Double',
      unitsType: 'Length',
      primaryUnits: 'mm',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: true
    },
    {
      id: 19,
      interfaceName: 'IJValve',
      categoryName: 'Specifications',
      attributeName: 'EndConnection',
      attributeUserName: 'End Connection',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: 'EndConnection',
      codelistNamespace: 'com.smartplant.piping',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 20,
      interfaceName: 'IJValve',
      categoryName: 'Specifications',
      attributeName: 'PressureRating',
      attributeUserName: 'Pressure Rating',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: 'PressureRating',
      codelistNamespace: 'com.smartplant.piping',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 21,
      interfaceName: 'IJFitting',
      categoryName: 'BasicInfo',
      attributeName: 'FittingType',
      attributeUserName: 'Fitting Type',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: 'FittingType',
      codelistNamespace: 'com.smartplant.piping',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: true
    },
    {
      id: 22,
      interfaceName: 'IJFitting',
      categoryName: 'BasicInfo',
      attributeName: 'FittingSize',
      attributeUserName: 'Fitting Size',
      type: 'Double',
      unitsType: 'Length',
      primaryUnits: 'mm',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: true
    },
    {
      id: 23,
      interfaceName: 'IJFitting',
      categoryName: 'Geometry',
      attributeName: 'BendRadius',
      attributeUserName: 'Bend Radius',
      type: 'Double',
      unitsType: 'Length',
      primaryUnits: 'mm',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 24,
      interfaceName: 'IJFitting',
      categoryName: 'Geometry',
      attributeName: 'BendAngle',
      attributeUserName: 'Bend Angle',
      type: 'Double',
      unitsType: 'Angle',
      primaryUnits: '°',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 25,
      interfaceName: 'IJInstrument',
      categoryName: 'Identification',
      attributeName: 'TagNumber',
      attributeUserName: 'Tag Number',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 26,
      interfaceName: 'IJInstrument',
      categoryName: 'Identification',
      attributeName: 'ServiceDescription',
      attributeUserName: 'Service Description',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 27,
      interfaceName: 'IJInstrument',
      categoryName: 'Specifications',
      attributeName: 'MeasurementRange',
      attributeUserName: 'Measurement Range',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: '',
      codelistNamespace: '',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    },
    {
      id: 28,
      interfaceName: 'IJInstrument',
      categoryName: 'Specifications',
      attributeName: 'SignalType',
      attributeUserName: 'Signal Type',
      type: 'String',
      unitsType: '',
      primaryUnits: '',
      codelist: 'SignalType',
      codelistNamespace: 'com.smartplant.instrument',
      onPropertyPage: true,
      readOnly: false,
      symbolParameter: false
    }
  ]
  
  // 为所有记录添加版本管理字段
  const now = new Date()
  propertyList.value = propertyList.value.map((item, index) => {
    const timestamp = new Date(now.getTime() - (propertyList.value.length - index) * 60000)
    return {
      ...item,
      version: item.version || 1,
      createdTime: item.createdTime || timestamp.toISOString().slice(0, 19).replace('T', ' '),
      updatedTime: item.updatedTime || timestamp.toISOString().slice(0, 19).replace('T', ' '),
      modifier: item.modifier || 'admin'
    }
  })
  
  // 构建 Object Type 配置映射
  buildObjectTypeConfig()
  
  buildTreeData()
  ElMessage.success('数据已加载')
}

/**
 * 构建 Object Type 配置映射
 */
function buildObjectTypeConfig() {
  const configMap = new Map()
  
  propertyList.value.forEach(item => {
    const objectType = item.interfaceName.replace(/^IJ/, '') || 'Other'
    if (!configMap.has(objectType)) {
      configMap.set(objectType, new Set())
    }
    configMap.get(objectType).add(item.interfaceName)
  })
  
  objectTypeConfigList.value = Array.from(configMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([objectType, interfaces]) => ({
      objectType: objectType,
      interfaces: Array.from(interfaces).sort()
    }))
}

/**
 * 添加新的Object Type
 */
function handleAddObjectType() {
  ElMessageBox.prompt('请输入新的对象类型名称', '添加对象类型', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
    inputErrorMessage: '对象类型名仅能为字母数字'
  })
    .then(({ value }) => {
      const exists = objectTypeConfigList.value.some(item => item.objectType === value)
      if (exists) {
        ElMessage.warning('该对象类型已存在')
        return
      }
      objectTypeConfigList.value.push({ objectType: value, interfaces: [] })
      objectTypeConfigList.value.sort((a, b) => a.objectType.localeCompare(b.objectType))
      ElMessage.success('添加成功')
    })
    .catch(() => {})
}

/**
 * 为对象类型添加接口
 */
function handleAddInterface(objectType) {
  ElMessageBox.prompt('请输入接口名称（应以IJ开头）', `为 ${objectType} 添加接口`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^IJ[a-zA-Z0-9]*$/,
    inputErrorMessage: '接口名必须以IJ开头'
  })
    .then(({ value }) => {
      const config = objectTypeConfigList.value.find(item => item.objectType === objectType)
      if (config) {
        if (config.interfaces.includes(value)) {
          ElMessage.warning('该接口已经存在')
          return
        }
        config.interfaces.push(value)
        config.interfaces.sort()
        ElMessage.success('添加成功')
      }
    })
    .catch(() => {})
}

/**
 * 移除接口
 */
function handleRemoveInterface(objectType, iface) {
  const config = objectTypeConfigList.value.find(item => item.objectType === objectType)
  if (config) {
    const index = config.interfaces.indexOf(iface)
    if (index > -1) {
      config.interfaces.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }
}

/**
 * 删除Object Type
 */
function handleDeleteObjectType(objectType) {
  ElMessageBox.confirm(`确定删除对象类型 "${objectType}" 吗?会同时删除其下所有接口`, '会议', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = objectTypeConfigList.value.findIndex(item => item.objectType === objectType)
      if (index > -1) {
        objectTypeConfigList.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

/**
 * 新增属性
 */
function handleAdd() {
  isEdit.value = false
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  formData.value = {
    id: null,
    objectType: '',
    interfaceName: '',
    categoryName: '',
    attributeName: '',
    attributeUserName: '',
    type: '',
    unitsType: '',
    primaryUnits: '',
    codelist: '',
    codelistNamespace: '',
    onPropertyPage: false,
    readOnly: false,
    symbolParameter: false,
    version: 1,
    createdTime: now,
    updatedTime: now,
    modifier: 'admin'
  }
  dialogVisible.value = true
}

/**
 * 编辑属性
 */
function handleEdit(row) {
  isEdit.value = true
  const objectType = row.interfaceName.replace(/^IJ/, '') || 'Other'
  formData.value = { 
    ...row,
    objectType: objectType
  }
  dialogVisible.value = true
}

/**
 * 删除属性
 */
function handleDelete(row) {
  ElMessageBox.confirm(
    `确定删除属性 "${row.attributeUserName}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      const index = propertyList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        propertyList.value.splice(index, 1)
        buildTreeData()
      }
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

/**
 * 保存属性
 */
function handleSave() {
  formRef.value.validate((valid) => {
    if (!valid) return
    
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    if (isEdit.value) {
      // 更新现有属性 - 增加版本号并更新修改人
      const index = propertyList.value.findIndex(item => item.id === formData.value.id)
      if (index > -1) {
        const updated = { 
          ...formData.value,
          version: (formData.value.version || 1) + 1,
          updatedTime: now,
          modifier: formData.value.modifier || 'admin'
        }
        propertyList.value[index] = updated
        buildTreeData()
      }
      ElMessage.success('更新成功，版本已升级')
    } else {
      // 新增属性
      const newProperty = {
        id: Math.max(...propertyList.value.map(p => p.id || 0), 0) + 1,
        ...formData.value,
        version: 1,
        createdTime: now,
        updatedTime: now,
        modifier: formData.value.modifier || 'admin'
      }
      propertyList.value.push(newProperty)
      buildTreeData()
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
  })
}

/**
 * 导出为Excel
 */
function handleExport() {
  try {
    // 准备导出数据
    const exportData = propertyList.value.map(item => ({
      'Interface Name': item.interfaceName,
      'Category Name': item.categoryName,
      'Attribute Name': item.attributeName,
      'Attribute UserName': item.attributeUserName,
      'Type': item.type,
      'Units Type': item.unitsType,
      'Primary Units': item.primaryUnits,
      'Codelist': item.codelist,
      'CodeList Namespace': item.codelistNamespace,
      'OnPropertyPage': item.onPropertyPage ? '是' : '否',
      'ReadOnly': item.readOnly ? '是' : '否',
      'SymbolParameter': item.symbolParameter ? '是' : '否'
    }))

    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '属性列表')

    // 设置列宽
    const columnWidths = [
      { wch: 15 },  // Interface Name
      { wch: 15 },  // Category Name
      { wch: 15 },  // Attribute Name
      { wch: 15 },  // Attribute UserName
      { wch: 12 },  // Type
      { wch: 12 },  // Units Type
      { wch: 12 },  // Primary Units
      { wch: 12 },  // Codelist
      { wch: 20 },  // CodeList Namespace
      { wch: 12 },  // OnPropertyPage
      { wch: 10 },  // ReadOnly
      { wch: 15 }   // SymbolParameter
    ]
    worksheet['!cols'] = columnWidths

    // 导出文件
    const fileName = `属性列表_${new Date().getTime()}.xlsx`
    XLSX.writeFile(workbook, fileName)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.property-page {
  height: 100%;
  background-color: #f0f2f5;
  overflow: hidden;
  box-sizing: border-box;
}

.page-container {
  display: flex;
  height: 100%;
  gap: 1vw;
  padding: 1vh 1vw;
  box-sizing: border-box;
  overflow: hidden;
}

/* 左侧面板 - 响应式宽度 */
.sidebar-panel {
  width: clamp(240px, 20vw, 320px);
  flex-shrink: 0;
  min-width: 200px;
  height: 100%;
}

.sidebar-content {
  background: #fff;
  border-radius: 4px;
  padding: clamp(12px, 1.2vw, 20px);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.sidebar-title {
  font-size: clamp(14px, 1vw, 18px);
  font-weight: 600;
  color: #303133;
  margin-bottom: clamp(8px, 0.8vh, 16px);
}

.tree-wrapper {
  flex: 1;
  overflow-y: auto;
  margin-top: clamp(6px, 0.5vh, 12px);
}

/* 统一滚动条样式 */
.tree-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tree-wrapper::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.tree-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}

.tree-wrapper::-webkit-scrollbar-track {
  background-color: #f5f7fa;
  border-radius: 3px;
}

/* 主要内容区域 - 自适应 */
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  height: 100%;
}

/* 标签页容器 */
.tabs-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

:deep(.el-tab-pane) {
  height: 100%;
}

/* 属性表格容器 */
.property-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: clamp(12px, 1.2vw, 20px);
  border-radius: 4px;
  box-sizing: border-box;
}

/* 配置维护容器 */
.config-container {
  padding: clamp(12px, 1.2vw, 20px);
  background: #fff;
  border-radius: 4px;
  box-sizing: border-box;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.config-header h3 {
  margin: 0;
  font-size: clamp(16px, 1.2vw, 20px);
  color: #303133;
  font-weight: 600;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(12px, 1vh, 20px);
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 12px;
}

.title-area {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.title-area h3 {
  margin: 0;
  font-size: clamp(16px, 1.2vw, 20px);
  color: #303133;
  font-weight: 600;
}

.ml-2 {
  margin-left: clamp(4px, 0.5vw, 10px);
}

.actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .sidebar-panel {
    width: clamp(200px, 18vw, 280px);
  }
}

@media (max-width: 1024px) {
  .sidebar-panel {
    width: clamp(180px, 25vw, 240px);
  }
  
  .page-container {
    gap: 0.8vw;
    padding: 0.8vh 0.8vw;
  }
}

@media (max-width: 768px) {
  .page-container {
    flex-direction: column;
  }
  
  .sidebar-panel {
    width: 100%;
    height: 30vh;
    min-height: 200px;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions {
    width: 100%;
    justify-content: flex-start;
  }
}

:deep(.new-row-highlight) {
  background-color: #f0f9eb !important;
}

/* 确保el-input和el-button也能响应式缩放 */
:deep(.el-input) {
  font-size: clamp(12px, 0.9vw, 14px);
}

:deep(.el-button) {
  font-size: clamp(12px, 0.9vw, 14px);
  padding: clamp(6px, 0.6vw, 10px) clamp(12px, 1vw, 16px);
}

:deep(.el-table) {
  font-size: clamp(12px, 0.85vw, 14px);
}

/* 让表格内层包装自适应卡片宽度 */
:deep(.el-table__inner-wrapper),
:deep(.el-table__body-wrapper),
:deep(.el-table__header-wrapper) {
  width: 100% !important;
  max-width: 100%;
}

:deep(.el-table__row) {
  height: 32px;
}

:deep(.el-table td.el-table__cell) {
  padding: 4px 0;
}

:deep(.el-tree-node__content) {
  font-size: clamp(12px, 0.85vw, 14px);
  height: clamp(24px, 2vh, 32px);
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.expand-content {
  padding: 20px;
  background-color: #f5f7fa;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 600;
  color: #606266;
  min-width: 120px;
  font-size: 12px;
}

.detail-value {
  color: #303133;
  word-break: break-word;
  font-size: 12px;
}
</style>
