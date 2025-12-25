<template>
  <div class="property-page">
    <div style="display: flex; gap: 0; height: 100vh;">
      <!-- 左侧目录树 -->
      <div style="width: 250px; background: #f5f7fa; border-right: 1px solid #dcdfe6; overflow-y: auto; padding: 15px;">
        <div style="margin-bottom: 15px; font-weight: bold; font-size: 14px;">Interface 列表</div>
        <el-tree
          :data="treeData"
          :props="{ children: 'children', label: 'label' }"
          node-key="id"
          :expand-on-click-node="false"
          @node-click="handleTreeNodeClick"
          highlight-current
        />
      </div>

      <!-- 右侧主要内容 -->
      <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;">
        <!-- 顶部工具栏 -->
        <div style="display: flex; gap: 10px; margin: 20px 20px 15px 20px; align-items: center; flex-shrink: 0;">
          <el-button type="primary" @click="handleAdd">➕ 新增属性</el-button>
          <el-button @click="loadData">🔄 刷新</el-button>
          <el-input 
            v-model="searchText" 
            placeholder="搜索属性..."
            style="width: 250px;"
            clearable
            @input="onSearch"
          />
        </div>

        <!-- 属性表格 -->
        <el-table 
          :data="filteredPropertyList" 
          border 
          stripe
          style="width: 100%; margin: 0 20px 10px 20px; flex: 1; overflow-y: auto;"
          :default-sort="{ prop: 'id', order: 'ascending' }"
          max-height="calc(100vh - 380px)"
        >
          <!-- 序号列 -->
          <el-table-column type="index" label="序号" width="60" />
          
          <!-- Interface Name -->
          <el-table-column 
            prop="interfaceName" 
            label="Interface Name"
            width="180"
            show-overflow-tooltip
          />
          
          <!-- Category Name -->
          <el-table-column 
            prop="categoryName" 
            label="Category Name"
            width="150"
            show-overflow-tooltip
          />
          
          <!-- Attribute Name -->
          <el-table-column 
            prop="attributeName" 
            label="Attribute Name"
            width="150"
            show-overflow-tooltip
          />
          
          <!-- Attribute UserName -->
          <el-table-column 
            prop="attributeUserName" 
            label="Attribute UserName"
            width="150"
            show-overflow-tooltip
          />
          
          <!-- Type -->
          <el-table-column 
            prop="type" 
            label="Type"
            width="100"
          />
          
          <!-- Units Type -->
          <el-table-column 
            prop="unitsType" 
            label="Units Type"
            width="120"
            show-overflow-tooltip
          />
          
          <!-- Primary Units -->
          <el-table-column 
            prop="primaryUnits" 
            label="Primary Units"
            width="120"
            show-overflow-tooltip
          />
          
          <!-- Codelist -->
          <el-table-column 
            prop="codelist" 
            label="Codelist"
            width="100"
            show-overflow-tooltip
          />
          
          <!-- CodeList table namespace -->
          <el-table-column 
            prop="codelistNamespace" 
            label="CodeList Namespace"
            width="150"
            show-overflow-tooltip
          />
          
          <!-- OnPropertyPage -->
          <el-table-column 
            prop="onPropertyPage" 
            label="OnPropertyPage"
            width="130"
          >
            <template #default="{ row }">
              <el-tag :type="row.onPropertyPage ? 'success' : 'info'">
                {{ row.onPropertyPage ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <!-- ReadOnly -->
          <el-table-column 
            prop="readOnly" 
            label="ReadOnly"
            width="100"
          >
            <template #default="{ row }">
              <el-tag :type="row.readOnly ? 'danger' : 'success'">
                {{ row.readOnly ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <!-- SymbolParameter -->
          <el-table-column 
            prop="symbolParameter" 
            label="SymbolParameter"
            width="130"
          >
            <template #default="{ row }">
              <el-tag :type="row.symbolParameter ? 'warning' : 'info'">
                {{ row.symbolParameter ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <!-- 操作列 -->
          <el-table-column 
            label="操作" 
            width="150" 
            fixed="right"
            align="center"
          >
            <template #default="{ row }">
              <el-button 
                link 
                type="primary" 
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-divider direction="vertical" />
              <el-button 
                link 
                type="danger" 
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 统计信息 - 紧凑底部栏 -->
        <div style="background: white; border-top: 1px solid #dcdfe6; padding: 10px 20px; display: flex; gap: 15px; flex-shrink: 0; overflow-x: auto;">
          <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="color: #606266; font-size: 12px;">总数:</span>
            <span style="color: #667eea; font-weight: bold; font-size: 14px;">{{ totalCount }}</span>
          </div>
          <div style="width: 1px; background: #dcdfe6;"></div>
          <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="color: #606266; font-size: 12px;">启用:</span>
            <span style="color: #f5576c; font-weight: bold; font-size: 14px;">{{ enabledCount }}</span>
          </div>
          <div style="width: 1px; background: #dcdfe6;"></div>
          <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="color: #606266; font-size: 12px;">只读:</span>
            <span style="color: #00f2fe; font-weight: bold; font-size: 14px;">{{ readOnlyCount }}</span>
          </div>
          <div style="width: 1px; background: #dcdfe6;"></div>
          <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="color: #606266; font-size: 12px;">符号:</span>
            <span style="color: #38f9d7; font-weight: bold; font-size: 14px;">{{ symbolCount }}</span>
          </div>
          <div style="width: 1px; background: #dcdfe6;"></div>
          <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="color: #606266; font-size: 12px;">接口:</span>
            <span style="color: #fee140; font-weight: bold; font-size: 14px;">{{ interfaceCount }}</span>
          </div>
          <div style="width: 1px; background: #dcdfe6;"></div>
          <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="color: #606266; font-size: 12px;">类型:</span>
            <span style="color: #fed6e3; font-weight: bold; font-size: 14px;">{{ typeCount }}</span>
          </div>
        </div>
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
        <el-form-item label="Interface Name" prop="interfaceName">
          <el-input v-model="formData.interfaceName" placeholder="请输入Interface Name" />
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
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 属性列表
const propertyList = ref([])

// 目录树数据
const treeData = ref([])

// 搜索文本
const searchText = ref('')

// 当前选中的Interface
const selectedInterface = ref('')

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 表单数据
const formData = ref({
  id: null,
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
  symbolParameter: false
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
 * 构建树形结构数据
 */
function buildTreeData() {
  const interfaceMap = new Map()
  
  propertyList.value.forEach(item => {
    if (!interfaceMap.has(item.interfaceName)) {
      interfaceMap.set(item.interfaceName, new Map())
    }
    const categoryMap = interfaceMap.get(item.interfaceName)
    if (!categoryMap.has(item.categoryName)) {
      categoryMap.set(item.categoryName, [])
    }
    categoryMap.get(item.categoryName).push(item)
  })
  
  const tree = []
  interfaceMap.forEach((categoryMap, interfaceName) => {
    const children = []
    categoryMap.forEach((properties, categoryName) => {
      children.push({
        id: `${interfaceName}-${categoryName}`,
        label: `${categoryName} (${properties.length})`,
        children: properties.map(p => ({
          id: `${interfaceName}-${categoryName}-${p.id}`,
          label: p.attributeUserName || p.attributeName
        }))
      })
    })
    tree.push({
      id: interfaceName,
      label: interfaceName,
      children: children
    })
  })
  
  treeData.value = tree
}

/**
 * 树节点点击事件
 */
function handleTreeNodeClick(data) {
  if (data.id && data.id.includes('-')) {
    // 点击的是类别或属性，则选择对应的Interface
    const interfaceName = data.id.split('-')[0]
    selectedInterface.value = interfaceName
  } else {
    // 点击的是Interface
    selectedInterface.value = data.id === selectedInterface.value ? '' : data.id
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
      symbolParameter: false
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
      symbolParameter: false
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
    }
  ]
  buildTreeData()
  ElMessage.success('数据已加载')
}

/**
 * 新增属性
 */
function handleAdd() {
  isEdit.value = false
  formData.value = {
    id: null,
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
    symbolParameter: false
  }
  dialogVisible.value = true
}

/**
 * 编辑属性
 */
function handleEdit(row) {
  isEdit.value = true
  formData.value = { ...row }
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

    if (isEdit.value) {
      // 更新现有属性
      const index = propertyList.value.findIndex(item => item.id === formData.value.id)
      if (index > -1) {
        propertyList.value[index] = { ...formData.value }
        buildTreeData()
      }
      ElMessage.success('更新成功')
    } else {
      // 新增属性
      const newProperty = {
        id: Math.max(...propertyList.value.map(p => p.id || 0), 0) + 1,
        ...formData.value
      }
      propertyList.value.push(newProperty)
      buildTreeData()
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.property-page {
  padding: 0;
  background-color: #f0f2f5;
  height: 100vh;
  overflow: hidden;
}
</style>
