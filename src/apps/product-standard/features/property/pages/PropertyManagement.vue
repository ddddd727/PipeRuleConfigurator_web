<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty as deletePropertyApi,
  fetchObjectTypes,
  createObjectType,
  addInterfaceToObjectType,
  removeInterfaceFromObjectType,
  deleteObjectType as deleteObjectTypeApi,
  exportPropertyData
} from '@/apps/product-standard/features/property/api/property'

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

// 分页状态（后台支持分页，前端当前按单页展示）
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 对象类型列表（从现有数据提取）
const objectTypeList = computed(() =>
  objectTypeConfigList.value.map(item => item.objectType).sort()
)

// 根据选中的对象类型获取接口列表
const interfaceList = computed(() => {
  if (!formData.value.objectType) return []
  const matched = objectTypeConfigList.value.find(
    item => item.objectType === formData.value.objectType
  )
  return matched ? [...matched.interfaces] : []
})

// 根据当前选中的Interface推导所属对象类型（用于API过滤）
const selectedObjectType = computed(() => {
  if (!selectedInterface.value) return ''
  const matched = objectTypeConfigList.value.find(item =>
    Array.isArray(item.interfaces) && item.interfaces.includes(selectedInterface.value)
  )
  return matched?.objectType || ''
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
  symbolParameter: '',
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
 * 构建目录树数据：优先使用对象类型配置中的Interface列表
 */
function buildTreeData() {
  const propertyMap = new Map()
  propertyList.value.forEach(item => {
    const interfaceName = item.interfaceName || 'UnknownInterface'
    if (!propertyMap.has(interfaceName)) {
      propertyMap.set(interfaceName, [])
    }
    propertyMap.get(interfaceName).push(item)
  })

  let propertyNodeSeed = 0
  const buildPropertyNodes = (objectType, interfaceName, props = []) =>
    props.map(prop => {
      const suffix = prop.id ?? `${interfaceName}-${propertyNodeSeed++}`
      return {
        id: `${objectType}-${interfaceName}-${suffix}`,
        label: prop.attributeUserName || prop.attributeName || `属性 ${suffix}`
      }
    })

  if (objectTypeConfigList.value.length) {
    const coveredInterfaces = new Set()
    const tree = objectTypeConfigList.value
      .slice()
      .sort((a, b) => (a.objectType || '').localeCompare(b.objectType || ''))
      .map(typeItem => {
        const typeName = typeItem.objectType || 'UnknownObjectType'
        const interfaces = Array.isArray(typeItem.interfaces)
          ? typeItem.interfaces.filter(Boolean)
          : []
        const interfaceChildren = interfaces
          .sort((a, b) => a.localeCompare(b))
          .map(iface => {
            coveredInterfaces.add(iface)
            const relatedProps = propertyMap.get(iface) || []
            return {
              id: `${typeName}-${iface}`,
              label: relatedProps.length ? `${iface} (${relatedProps.length})` : iface,
              children: buildPropertyNodes(typeName, iface, relatedProps)
            }
          })

        return {
          id: typeName,
          label: `${typeName} (${interfaceChildren.length})`,
          children: interfaceChildren
        }
      })

    const extraInterfaces = []
    propertyMap.forEach((props, iface) => {
      if (!coveredInterfaces.has(iface)) {
        extraInterfaces.push({
          id: `Other-${iface}`,
          label: props.length ? `${iface} (${props.length})` : iface,
          children: buildPropertyNodes('Other', iface, props)
        })
      }
    })

    if (extraInterfaces.length) {
      extraInterfaces.sort((a, b) => a.label.localeCompare(b.label))
      tree.push({
        id: 'Other',
        label: `Other (${extraInterfaces.length})`,
        children: extraInterfaces
      })
    }

    treeData.value = tree
    return
  }

  const fallbackMap = new Map()
  propertyList.value.forEach(item => {
    const objectType = item.interfaceName?.replace(/^IJ/, '') || 'Other'
    if (!fallbackMap.has(objectType)) {
      fallbackMap.set(objectType, new Map())
    }
    const interfaceMap = fallbackMap.get(objectType)
    if (!interfaceMap.has(item.interfaceName)) {
      interfaceMap.set(item.interfaceName, [])
    }
    interfaceMap.get(item.interfaceName).push(item)
  })

  const tree = []
  Array.from(fallbackMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([objectType, interfaceMap]) => {
      const interfaceChildren = []
      Array.from(interfaceMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([interfaceName, properties]) => {
          interfaceChildren.push({
            id: `${objectType}-${interfaceName}`,
            label: properties.length ? `${interfaceName} (${properties.length})` : interfaceName,
            children: buildPropertyNodes(objectType, interfaceName, properties)
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
 * 加载数据（使用真实 API）
 */
async function loadData() {
  loading.value = true
  try {
    const data = await fetchProperties({
      interfaceName: selectedInterface.value || undefined,
      objectType: selectedObjectType.value || undefined,
      search: searchText.value || undefined,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      sortBy: 'id',
      order: 'asc'
    })

    propertyList.value = (data?.items || []).map(normalizeProperty)
    pagination.value = {
      page: data?.pageIndex ?? data?.page ?? pagination.value.page,
      pageSize: data?.pageSize ?? pagination.value.pageSize,
      total: data?.totalCount ?? data?.total ?? (data?.items?.length || 0)
    }

    buildTreeData()
  } catch (error) {
    console.error('加载属性失败', error)
    ElMessage.error('加载属性失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 归一化后端属性数据到前端字段
 */
function normalizeProperty(item) {
  if (!item) return {}
  const type = item.type || item.dataType || ''
  return {
    id: item.id,
    interfaceId: item.interfaceId,
    interfaceName: item.interfaceName,
    categoryName: item.categoryName,
    attributeName: item.attributeName,
    attributeUserName: item.attributeUserName || item.attributeName,
    type,
    unitsType: item.unitsType || '',
    primaryUnits: item.primaryUnits || '',
    codelist: item.codelist ?? item.codelistName ?? '',
    codelistNamespace: item.codelistNamespace || '',
    onPropertyPage: Boolean(item.onPropertyPage),
    readOnly: Boolean(item.readOnly),
    symbolParameter: Boolean(item.symbolParameter),
    version: item.version ?? 1,
    createdTime: item.createdTime || item.createdAt || '',
    updatedTime: item.updatedTime || item.updatedAt || '',
    modifier: item.modifier || item.createdBy || ''
  }
}

/**
 * 加载对象类型配置
 */
async function loadObjectTypes() {
  try {
    const data = await fetchObjectTypes()
    objectTypeConfigList.value = Array.isArray(data) ? data : []
    buildTreeData()
  } catch (error) {
    console.error('加载对象类型失败', error)
    ElMessage.error('加载对象类型失败，请稍后重试')
  }
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
    .then(async ({ value }) => {
      try {
        await createObjectType({ objectType: value })
        ElMessage.success('添加成功')
        loadObjectTypes()
      } catch (error) {
        console.error('新增对象类型失败', error)
        ElMessage.error('新增对象类型失败，请稍后重试')
      }
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
    .then(async ({ value }) => {
      try {
        await addInterfaceToObjectType(objectType, { interfaceName: value })
        ElMessage.success('添加成功')
        loadObjectTypes()
      } catch (error) {
        console.error('添加接口失败', error)
        ElMessage.error('添加接口失败，请稍后重试')
      }
    })
    .catch(() => {})
}

/**
 * 移除接口
 */
function handleRemoveInterface(objectType, iface) {
  removeInterfaceFromObjectType(objectType, iface)
    .then(() => {
      ElMessage.success('删除成功')
      loadObjectTypes()
    })
    .catch(error => {
      console.error('删除接口失败', error)
      ElMessage.error('删除接口失败，请稍后重试')
    })
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
    .then(async () => {
      try {
        await deleteObjectTypeApi(objectType)
        ElMessage.success('删除成功')
        loadObjectTypes()
      } catch (error) {
        console.error('删除对象类型失败', error)
        ElMessage.error('删除对象类型失败，请稍后重试')
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
    symbolParameter: '',
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
    .then(async () => {
      loading.value = true
      try {
        await deletePropertyApi(row.id)
        propertyList.value = propertyList.value.filter(item => item.id !== row.id)
        buildTreeData()
        ElMessage.success('删除成功')
      } catch (error) {
        console.error('删除失败', error)
        ElMessage.error('删除失败，请稍后重试')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

/**
 * 保存属性
 */
function handleSave() {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    const payload = {
      interfaceName: formData.value.interfaceName,
      categoryName: formData.value.categoryName,
      attributeName: formData.value.attributeName,
      attributeUserName: formData.value.attributeUserName,
      type: formData.value.type,
      unitsType: formData.value.unitsType,
      primaryUnits: formData.value.primaryUnits,
      codelist: formData.value.codelist,
      codelistNamespace: formData.value.codelistNamespace,
      onPropertyPage: formData.value.onPropertyPage,
      readOnly: formData.value.readOnly,
      symbolParameter: formData.value.symbolParameter,
      modifier: formData.value.modifier,
      version: formData.value.version
    }

    try {
      if (isEdit.value) {
        const updated = await updateProperty(formData.value.id, payload)
        const normalized = normalizeProperty(updated || formData.value)
        const index = propertyList.value.findIndex(item => item.id === normalized.id)
        if (index > -1) {
          propertyList.value.splice(index, 1, normalized)
        } else {
          propertyList.value.unshift(normalized)
        }
        ElMessage.success('更新成功')
      } else {
        const created = await createProperty(payload)
        propertyList.value.unshift(normalizeProperty(created))
        ElMessage.success('新增成功')
      }

      buildTreeData()
      loadObjectTypes()
      dialogVisible.value = false
    } catch (error) {
      console.error('保存失败', error)
      ElMessage.error('保存失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}

function extractExportFileName(disposition) {
  const fallback = `properties_${Date.now()}.csv`
  if (!disposition) return fallback
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  const asciiMatch = /filename="?([^";]+)"?/i.exec(disposition)
  const raw = utfMatch?.[1] || asciiMatch?.[1]
  if (!raw) return fallback
  try {
    return decodeURIComponent(raw.replace(/"/g, ''))
  } catch (error) {
    console.warn('文件名解析失败，使用默认名称', error)
    return fallback
  }
}

/**
 * 导出为Excel（使用 fetch 绕过 mockjs 对 XHR/blob 的干扰）
 */
async function handleExport() {
  try {
    const { blob, contentDisposition } = await exportPropertyData({
      interfaceName: selectedInterface.value || undefined,
      objectType: selectedObjectType.value || undefined,
      search: searchText.value || undefined,
      sortBy: 'id',
      order: 'asc'
    })
    const fileName = extractExportFileName(contentDisposition)

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error(error?.message || '导出失败，请稍后重试')
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
  loadObjectTypes()
})
</script>

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
          <el-input v-model="formData.symbolParameter" placeholder="请输入symbolParameter"/>
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
