<template>
  <div class="standard-catalog-page">
    <div class="module-layout">
      <section class="module-card">
        <div class="module-header">
          <h2 class="module-title">部件类型-标准配置模块</h2>
          <div class="module-toolbar">
            <div class="toolbar-filter">
              <span class="toolbar-label">专业</span>
              <el-select v-model="selectedProfessional" class="toolbar-select" placeholder="请选择">
                <el-option
                  v-for="item in professionalOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="toolbar-actions">
              <el-button type="primary" :icon="Plus" @click="handleAddComponentType">新增部件类型</el-button>
              <el-button type="primary" :icon="RefreshLeft" @click="handleBindStandard">标准-部件类型绑定</el-button>
            </div>
          </div>
        </div>

        <div class="list-grid list-grid-left">
          <article class="list-card">
            <div class="list-card-title">部件类型</div>
            <div class="table-shell" v-loading="componentTypeLoading" element-loading-text="加载中...">
              <el-table
                ref="componentTypeTableRef"
                :data="componentTypeData"
                border
                size="small"
                height="100%"
                highlight-current-row
                empty-text="暂无数据"
                @row-click="handleComponentTypeRowClick"
              >
                <el-table-column width="48" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedComponentTypeId" :label="row.id" :disabled="!row.enabled" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="部件类型" min-width="120" show-overflow-tooltip header-align="center" align="center" />
                <el-table-column label="启用" width="72" header-align="center" align="center">
                  <template #default="{ row }">
                    <el-switch
                      :model-value="row.enabled"
                      size="small"
                      class="compact-switch"
                      :loading="isStatusUpdating(row.id)"
                      @click.stop
                      @change="(value) => handleComponentTypeStatusChange(row, value)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </article>

          <article class="list-card">
            <div class="list-card-title">产品元件标准</div>
            <div class="table-shell" v-loading="productStandardLoading" element-loading-text="加载中...">
              <el-table
                ref="productStandardTableRef"
                :data="productStandardData"
                border
                size="small"
                height="100%"
                :empty-text="selectedComponentTypeId ? '暂无数据' : '请选择部件类型'"
              >
                <el-table-column prop="code" label="标准" min-width="120" show-overflow-tooltip header-align="center" align="center" />
                <el-table-column label="启用" width="72" header-align="center" align="center">
                  <template #default="{ row }">
                    <el-switch
                      :model-value="row.enabled"
                      size="small"
                      class="compact-switch"
                      :loading="isProductStandardStatusUpdating(row.id)"
                      @click.stop
                      @change="(value) => handleProductStandardStatusChange(row, value)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </article>
        </div>
      </section>

      <section class="module-card">
        <div class="module-header">
          <h2 class="module-title">产品元件标准目录管理模块</h2>
          <div class="module-toolbar">
            <div class="toolbar-filter">
              <span class="toolbar-label">专业</span>
              <el-select v-model="selectedProfessional" class="toolbar-select" placeholder="请选择">
                <el-option
                  v-for="item in professionalOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="toolbar-actions">
              <el-button type="primary" :icon="Plus" @click="handleAddCustomCatalog">新增自定义类目录</el-button>
              <el-button type="primary" :icon="Plus" @click="handleAddStandardCatalog">新增标准目录</el-button>
              <el-button type="primary" :icon="RefreshLeft" @click="handleConfigureCommodityType">配置CommodityType</el-button>
            </div>
          </div>
        </div>

        <div class="list-grid list-grid-right">
          <article class="list-card">
            <div class="list-card-title">部件类型目录</div>
            <div class="table-shell" v-loading="componentTypeLoading" element-loading-text="加载中...">
              <el-table
                :data="componentTypeCatalogData"
                border
                size="small"
                height="100%"
                highlight-current-row
                empty-text="暂无启用数据"
                @row-click="handleComponentTypeCatalogRowClick"
              >
                <el-table-column width="48" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedComponentTypeCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="部件类型" min-width="120" show-overflow-tooltip header-align="center" align="center" />
              </el-table>
            </div>
          </article>

          <article class="list-card">
            <div class="list-card-title">自定义类目录</div>
            <div class="table-shell" v-loading="customCatalogLoading" element-loading-text="加载中...">
              <el-table
                :data="customCatalogData"
                border
                size="small"
                height="100%"
                highlight-current-row
                :empty-text="selectedComponentTypeCatalogId ? '暂无数据' : '请选择部件类型目录'"
                @row-click="handleCustomCatalogRowClick"
              >
                <el-table-column width="48" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedCustomCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="用户自定义类" min-width="120" show-overflow-tooltip header-align="center" align="center" />
              </el-table>
            </div>
          </article>

          <article class="list-card">
            <div class="list-card-title">产品元件标准目录</div>
            <div class="table-shell" v-loading="productStandardCatalogLoading" element-loading-text="加载中...">
              <el-table
                :data="productStandardCatalogData"
                border
                size="small"
                height="100%"
                highlight-current-row
                :empty-text="selectedCustomCatalogId ? '暂无数据' : '请选择自定义类目录'"
                @row-click="handleProductStandardCatalogRowClick"
              >
                <el-table-column width="48" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedStandardCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="标准" min-width="120" show-overflow-tooltip header-align="center" align="center" />
                <el-table-column label="启用" width="72" header-align="center" align="center">
                  <template #default="{ row }">
                    <el-switch
                      :model-value="row.enabled"
                      size="small"
                      class="compact-switch"
                      :loading="isProductStandardCatalogStatusUpdating(row.id)"
                      @click.stop
                      @change="(value) => handleProductStandardCatalogStatusChange(row, value)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </article>
        </div>
      </section>
    </div>

    <el-dialog
      v-model="componentTypeDialogVisible"
      width="360px"
      destroy-on-close
      :close-on-click-modal="false"
      class="component-type-dialog"
    >
      <template #header>
        <div class="component-type-dialog__header">
          <div class="component-type-dialog__title">新增部件类型</div>
          <div class="component-type-dialog__discipline">专业：{{ componentTypeForm.discipline || '-' }}</div>
        </div>
      </template>

      <el-form
        ref="componentTypeFormRef"
        :model="componentTypeForm"
        :rules="componentTypeFormRules"
        label-width="124px"
        class="component-type-dialog__form"
      >
        <el-form-item label="部件类型" prop="componentTypeDescription">
          <el-input v-model="componentTypeForm.componentTypeDescription" placeholder="如：管材" clearable />
        </el-form-item>
        <el-form-item label="部件类型描述" prop="componentTypeName">
          <el-input v-model="componentTypeForm.componentTypeName" placeholder="如：Pipe" clearable />
        </el-form-item>
        <el-form-item v-if="showConnectTypeField" label="连接类型" prop="connectType">
          <el-input v-model="componentTypeForm.connectType" placeholder="如：焊接" clearable />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="component-type-dialog__footer">
          <el-button type="primary" :loading="componentTypeDialogSubmitting" @click="submitComponentTypeForm">保存</el-button>
          <el-button @click="componentTypeDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="customCatalogDialogVisible"
      width="420px"
      destroy-on-close
      :close-on-click-modal="false"
      class="custom-catalog-dialog"
    >
      <template #header>
        <div class="custom-catalog-dialog__header">
          <div class="custom-catalog-dialog__title">新增自定义类目录</div>
          <div class="custom-catalog-dialog__component-type">部件类型：{{ customCatalogDialogComponentTypeName || '-' }}</div>
        </div>
      </template>

      <div class="custom-catalog-dialog__body">
        <div class="custom-catalog-dialog__list">
          <div v-for="(item, index) in customCatalogFormRows" :key="item.key" class="custom-catalog-dialog__row">
            <el-input
              v-model="item.name"
              :placeholder="`请输入自定义类目录 ${index + 1}`"
              clearable
              maxlength="255"
            />
            <el-button
              type="danger"
              plain
              :icon="Delete"
              :disabled="customCatalogFormRows.length === 1"
              @click="removeCustomCatalogFormRow(item.key)"
            />
          </div>
        </div>

        <div class="custom-catalog-dialog__add-row">
          <el-button type="primary" plain :icon="Plus" @click="addCustomCatalogFormRow">新增一行</el-button>
        </div>
      </div>

      <template #footer>
        <div class="custom-catalog-dialog__footer">
          <el-button type="primary" :loading="customCatalogDialogSubmitting" @click="submitCustomCatalogDialog">保存</el-button>
          <el-button @click="customCatalogDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="standardCatalogDialogVisible"
      width="680px"
      destroy-on-close
      :close-on-click-modal="false"
      class="bind-standard-dialog standard-directory-dialog"
    >
      <template #header>
        <div class="bind-standard-dialog__header">
          <div class="bind-standard-dialog__title">新增标准目录</div>
          <div class="bind-standard-dialog__component-type">用户自定义类：{{ standardCatalogComponentSubTypeName || '-' }}</div>
        </div>
      </template>

      <div v-loading="standardCatalogDialogLoading" class="bind-standard-dialog__body">
        <div class="bind-standard-dialog__panel-layout">
          <section class="bind-standard-dialog__panel">
            <div class="bind-standard-dialog__panel-head">
              <div class="bind-standard-dialog__panel-title">已配置标准</div>
              <el-input
                v-model="standardCatalogConfiguredKeyword"
                placeholder="搜索已配置标准"
                clearable
                class="bind-standard-dialog__search"
              >
                <template #append>
                  <el-button :icon="Search" />
                </template>
              </el-input>
            </div>
            <el-scrollbar class="bind-standard-dialog__scroll">
              <el-checkbox-group v-model="standardCatalogConfiguredChecked" class="bind-standard-dialog__checkbox-group">
                <el-checkbox v-for="item in filteredStandardCatalogConfigured" :key="item" :label="item">
                  {{ item }}
                </el-checkbox>
              </el-checkbox-group>
            </el-scrollbar>
          </section>

          <div class="bind-standard-dialog__move-actions">
            <el-button type="primary" plain :disabled="!standardCatalogConfiguredChecked.length" @click="moveConfiguredStandardsToDirectory">&gt;</el-button>
            <el-button type="primary" plain :disabled="!standardCatalogSelectedChecked.length" @click="moveDirectoryStandardsToConfigured">&lt;</el-button>
          </div>

          <section class="bind-standard-dialog__panel">
            <div class="bind-standard-dialog__panel-head">
              <div class="bind-standard-dialog__panel-title">标准目录</div>
              <el-input
                v-model="standardCatalogSelectedKeyword"
                placeholder="搜索标准目录"
                clearable
                class="bind-standard-dialog__search"
              >
                <template #append>
                  <el-button :icon="Search" />
                </template>
              </el-input>
            </div>
            <el-scrollbar class="bind-standard-dialog__scroll">
              <el-checkbox-group v-model="standardCatalogSelectedChecked" class="bind-standard-dialog__checkbox-group">
                <el-checkbox v-for="item in filteredStandardCatalogSelected" :key="item" :label="item">
                  {{ item }}
                </el-checkbox>
              </el-checkbox-group>
            </el-scrollbar>
          </section>
        </div>
      </div>

      <template #footer>
        <div class="bind-standard-dialog__footer">
          <el-button type="primary" :loading="standardCatalogDialogSubmitting" @click="submitStandardCatalogDialog">保存</el-button>
          <el-button @click="standardCatalogDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="bindStandardDialogVisible"
      width="680px"
      destroy-on-close
      :close-on-click-modal="false"
      class="bind-standard-dialog"
    >
      <template #header>
        <div class="bind-standard-dialog__header">
          <div class="bind-standard-dialog__title">部件类型-标准绑定</div>
          <div class="bind-standard-dialog__component-type">部件类型：{{ bindStandardComponentTypeName || '-' }}</div>
        </div>
      </template>

      <div v-loading="bindStandardDialogLoading" class="bind-standard-dialog__body">
        <div class="bind-standard-dialog__panel-layout">
          <section class="bind-standard-dialog__panel">
            <div class="bind-standard-dialog__panel-head">
              <div class="bind-standard-dialog__panel-title">标准库</div>
              <el-input
                v-model="bindStandardLibraryKeyword"
                placeholder="搜索标准库"
                clearable
                class="bind-standard-dialog__search"
              >
                <template #append>
                  <el-button :icon="Search" />
                </template>
              </el-input>
            </div>
            <el-scrollbar class="bind-standard-dialog__scroll">
              <el-checkbox-group v-model="bindStandardLibraryChecked" class="bind-standard-dialog__checkbox-group">
                <el-checkbox v-for="item in filteredStandardLibrary" :key="item" :label="item">
                  {{ item }}
                </el-checkbox>
              </el-checkbox-group>
            </el-scrollbar>
          </section>

          <div class="bind-standard-dialog__move-actions">
            <el-button type="primary" plain :disabled="!bindStandardLibraryChecked.length" @click="moveStandardsToConfig">&gt;</el-button>
            <el-button type="primary" plain :disabled="!bindStandardSelectedChecked.length" @click="moveStandardsToLibrary">&lt;</el-button>
          </div>

          <section class="bind-standard-dialog__panel">
            <div class="bind-standard-dialog__panel-head">
              <div class="bind-standard-dialog__panel-title">标准配置</div>
              <el-input
                v-model="bindStandardSelectedKeyword"
                placeholder="搜索标准配置"
                clearable
                class="bind-standard-dialog__search"
              >
                <template #append>
                  <el-button :icon="Search" />
                </template>
              </el-input>
            </div>
            <el-scrollbar class="bind-standard-dialog__scroll">
              <el-checkbox-group v-model="bindStandardSelectedChecked" class="bind-standard-dialog__checkbox-group">
                <el-checkbox v-for="item in filteredSelectedStandards" :key="item" :label="item">
                  {{ item }}
                </el-checkbox>
              </el-checkbox-group>
            </el-scrollbar>
          </section>
        </div>
      </div>

      <template #footer>
        <div class="bind-standard-dialog__footer">
          <el-button type="primary" :loading="bindStandardDialogSubmitting" @click="submitBindStandardDialog">保存</el-button>
          <el-button @click="bindStandardDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus, RefreshLeft, Search } from '@element-plus/icons-vue'
import {
  checkStandardCatalogComponentTypeDescriptionExists,
  createStandardCatalogCustomCatalogs,
  createStandardCatalogComponentType,
  getStandardCatalogBindingDialog,
  getStandardCatalogCustomCatalogs,
  getStandardCatalogDirectoryDialog,
  getStandardCatalogIndustryStandards,
  getStandardCatalogComponentTypes,
  getStandardCatalogDisciplines,
  getStandardCatalogProductStandardCatalogs,
  saveStandardCatalogBindings,
  saveStandardCatalogDirectory,
  updateStandardCatalogIndustryStandardStatus,
  updateStandardCatalogProductStandardCatalogStatus,
  updateStandardCatalogComponentTypeStatus
} from '@/apps/product-standard/features/standard-catalog-definition/api/standardCatalogDefinitionAPI'

const DEFAULT_DISCIPLINE = '管系'

const professionalOptions = ref([])
const selectedProfessional = ref(DEFAULT_DISCIPLINE)
const componentTypeRows = ref([])
const componentTypeLoading = ref(false)
const productStandardLoading = ref(false)
const customCatalogLoading = ref(false)
const productStandardCatalogLoading = ref(false)
const statusUpdatingIds = ref([])
const productStandardStatusUpdatingIds = ref([])
const productStandardCatalogStatusUpdatingIds = ref([])
const componentTypeDialogVisible = ref(false)
const componentTypeDialogSubmitting = ref(false)
const customCatalogDialogVisible = ref(false)
const customCatalogDialogSubmitting = ref(false)
const standardCatalogDialogVisible = ref(false)
const standardCatalogDialogLoading = ref(false)
const standardCatalogDialogSubmitting = ref(false)
const bindStandardDialogVisible = ref(false)
const bindStandardDialogLoading = ref(false)
const bindStandardDialogSubmitting = ref(false)

const selectedComponentTypeId = ref('')
const selectedComponentTypeCatalogId = ref('')
const selectedCustomCatalogId = ref('')
const selectedStandardCatalogId = ref('')

const componentTypeTableRef = ref(null)
const productStandardTableRef = ref(null)
const componentTypeFormRef = ref(null)

const productStandardData = ref([])
const customCatalogData = ref([])
const productStandardCatalogData = ref([])
const bindStandardComponentTypeName = ref('')
const bindStandardLibrary = ref([])
const bindStandardSelected = ref([])
const bindStandardLibraryChecked = ref([])
const bindStandardSelectedChecked = ref([])
const bindStandardLibraryKeyword = ref('')
const bindStandardSelectedKeyword = ref('')
const standardCatalogComponentSubTypeName = ref('')
const standardCatalogAllConfigured = ref([])
const standardCatalogSelected = ref([])
const standardCatalogConfiguredChecked = ref([])
const standardCatalogSelectedChecked = ref([])
const standardCatalogConfiguredKeyword = ref('')
const standardCatalogSelectedKeyword = ref('')
const customCatalogDialogComponentTypeName = ref('')
const componentTypeForm = reactive({
  discipline: DEFAULT_DISCIPLINE,
  componentTypeDescription: '',
  componentTypeName: '',
  connectType: ''
})
const customCatalogFormRows = ref([])
let customCatalogRowSeed = 0
const showConnectTypeField = computed(() => componentTypeForm.discipline === DEFAULT_DISCIPLINE)
const componentTypeFormRules = computed(() => {
  const rules = {
    componentTypeDescription: [{ required: true, message: '请输入部件类型', trigger: 'blur' }],
    componentTypeName: [{ required: true, message: '请输入部件类型描述', trigger: 'blur' }]
  }

  if (showConnectTypeField.value) {
    rules.connectType = [{ required: true, message: '请输入连接类型', trigger: 'blur' }]
  }

  return rules
})

const componentTypeData = computed(() => componentTypeRows.value)
const componentTypeCatalogData = computed(() => componentTypeRows.value.filter((item) => item.enabled))
const selectedComponentTypeRow = computed(() => componentTypeRows.value.find((item) => item.id === selectedComponentTypeId.value) || null)
const selectedComponentTypeCatalogRow = computed(() => componentTypeRows.value.find((item) => item.id === selectedComponentTypeCatalogId.value) || null)
const selectedCustomCatalogRow = computed(() => customCatalogData.value.find((item) => item.id === selectedCustomCatalogId.value) || null)
const availableStandardLibrary = computed(() =>
  bindStandardLibrary.value.filter((item) => !bindStandardSelected.value.includes(item))
)
const filteredStandardLibrary = computed(() => {
  const keyword = bindStandardLibraryKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return availableStandardLibrary.value
  }

  return availableStandardLibrary.value.filter((item) => item.toLowerCase().includes(keyword))
})
const filteredSelectedStandards = computed(() => {
  const keyword = bindStandardSelectedKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return bindStandardSelected.value
  }

  return bindStandardSelected.value.filter((item) => item.toLowerCase().includes(keyword))
})
const availableStandardCatalogConfigured = computed(() =>
  standardCatalogAllConfigured.value.filter((item) => !standardCatalogSelected.value.includes(item))
)
const filteredStandardCatalogConfigured = computed(() => {
  const keyword = standardCatalogConfiguredKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return availableStandardCatalogConfigured.value
  }

  return availableStandardCatalogConfigured.value.filter((item) => item.toLowerCase().includes(keyword))
})
const filteredStandardCatalogSelected = computed(() => {
  const keyword = standardCatalogSelectedKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return standardCatalogSelected.value
  }

  return standardCatalogSelected.value.filter((item) => item.toLowerCase().includes(keyword))
})

const syncSelectionWithRows = (rowsGetter, selectedIdRef) => {
  watch(
    rowsGetter,
    (rows) => {
      if (!rows.length) {
        selectedIdRef.value = ''
        return
      }

      if (!rows.some((item) => item.id === selectedIdRef.value)) {
        selectedIdRef.value = ''
      }
    },
    { immediate: true }
  )
}

syncSelectionWithRows(() => componentTypeData.value, selectedComponentTypeId)
syncSelectionWithRows(() => componentTypeCatalogData.value, selectedComponentTypeCatalogId)
syncSelectionWithRows(() => customCatalogData.value, selectedCustomCatalogId)
syncSelectionWithRows(() => productStandardCatalogData.value, selectedStandardCatalogId)

const isStatusUpdating = (id) => statusUpdatingIds.value.includes(id)
const isProductStandardStatusUpdating = (id) => productStandardStatusUpdatingIds.value.includes(id)
const isProductStandardCatalogStatusUpdating = (id) => productStandardCatalogStatusUpdatingIds.value.includes(id)

const normalizeComponentTypes = (rows = []) =>
  rows.map((item) => ({
    id: item.id,
    discipline: item.discipline || '',
    name: item.componentType || '',
    enabled: Boolean(item.enabled)
  }))

const normalizeIndustryStandards = (rows = []) =>
  rows.map((item) => ({
    id: item.id,
    geometricIndustryStandardCl: item.geometricIndustryStandardCl,
    code: item.standardName || '',
    enabled: Boolean(item.enabled)
  }))

const normalizeCustomCatalogs = (rows = []) =>
  rows.map((item) => ({
    id: item.id,
    name: item.componentSubType || ''
  }))

const normalizeProductStandardCatalogs = (rows = []) =>
  rows.map((item) => ({
    id: item.id,
    geometricIndustryStandardCl: item.geometricIndustryStandardCl,
    code: item.standardName || '',
    enabled: Boolean(item.enabled)
  }))

const createCustomCatalogFormRow = (name = '') => ({
  key: `custom-catalog-${customCatalogRowSeed++}`,
  name
})

const sortStandardNames = (rows = []) => [...rows].sort((left, right) => left.localeCompare(right, 'zh-Hans-CN'))

const sortStandardsByLibraryOrder = (rows = []) => {
  const orderMap = new Map(bindStandardLibrary.value.map((item, index) => [item, index]))
  return [...rows].sort((left, right) => {
    const leftIndex = orderMap.get(left) ?? Number.MAX_SAFE_INTEGER
    const rightIndex = orderMap.get(right) ?? Number.MAX_SAFE_INTEGER

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex
    }

    return left.localeCompare(right, 'zh-Hans-CN')
  })
}

const resetChildSelections = () => {
  selectedComponentTypeId.value = ''
  selectedComponentTypeCatalogId.value = ''
  selectedCustomCatalogId.value = ''
  selectedStandardCatalogId.value = ''
}

const loadProfessionalOptions = async () => {
  const rows = await getStandardCatalogDisciplines()
  professionalOptions.value = rows.map((item) => ({
    label: item.label,
    value: item.value
  }))

  if (!professionalOptions.value.length) {
    selectedProfessional.value = ''
    return
  }

  const hasDefaultDiscipline = professionalOptions.value.some((item) => item.value === DEFAULT_DISCIPLINE)
  const hasCurrentDiscipline = professionalOptions.value.some((item) => item.value === selectedProfessional.value)

  if (hasDefaultDiscipline) {
    selectedProfessional.value = DEFAULT_DISCIPLINE
    return
  }

  if (!hasCurrentDiscipline) {
    selectedProfessional.value = professionalOptions.value[0].value
  }
}

const loadComponentTypes = async () => {
  componentTypeLoading.value = true
  try {
    const rows = await getStandardCatalogComponentTypes({
      discipline: selectedProfessional.value || undefined
    })
    componentTypeRows.value = normalizeComponentTypes(rows)
  } finally {
    componentTypeLoading.value = false
  }
}

const loadIndustryStandards = async () => {
  if (!selectedComponentTypeId.value) {
    productStandardData.value = []
    return
  }

  productStandardLoading.value = true
  try {
    const rows = await getStandardCatalogIndustryStandards(selectedComponentTypeId.value)
    productStandardData.value = normalizeIndustryStandards(rows)
  } finally {
    productStandardLoading.value = false
  }
}

const loadCustomCatalogs = async () => {
  if (!selectedComponentTypeCatalogId.value) {
    customCatalogData.value = []
    productStandardCatalogData.value = []
    return
  }

  customCatalogLoading.value = true
  try {
    const rows = await getStandardCatalogCustomCatalogs(selectedComponentTypeCatalogId.value)
    customCatalogData.value = normalizeCustomCatalogs(rows)
  } finally {
    customCatalogLoading.value = false
  }
}

const loadProductStandardCatalogs = async () => {
  if (!selectedComponentTypeCatalogId.value || !selectedCustomCatalogRow.value?.name) {
    productStandardCatalogData.value = []
    return
  }

  productStandardCatalogLoading.value = true
  try {
    const rows = await getStandardCatalogProductStandardCatalogs(
      selectedComponentTypeCatalogId.value,
      selectedCustomCatalogRow.value.name
    )
    productStandardCatalogData.value = normalizeProductStandardCatalogs(rows)
  } finally {
    productStandardCatalogLoading.value = false
  }
}

const handleComponentTypeStatusChange = async (row, enabled) => {
  const originalValue = row.enabled
  row.enabled = enabled
  statusUpdatingIds.value = [...statusUpdatingIds.value, row.id]

  try {
    await updateStandardCatalogComponentTypeStatus(row.id, enabled)

    if (!enabled && selectedComponentTypeId.value === row.id) {
      componentTypeTableRef.value?.setCurrentRow?.(null)
      selectedComponentTypeId.value = ''
    }

    ElMessage.success(enabled ? '启用成功' : '禁用成功')
  } catch {
    row.enabled = originalValue
  } finally {
    statusUpdatingIds.value = statusUpdatingIds.value.filter((item) => item !== row.id)
  }
}

const handleProductStandardStatusChange = async (row, enabled) => {
  const originalValue = row.enabled
  row.enabled = enabled
  productStandardStatusUpdatingIds.value = [...productStandardStatusUpdatingIds.value, row.id]

  try {
    await updateStandardCatalogIndustryStandardStatus(row.id, enabled)
    ElMessage.success(enabled ? '启用成功' : '禁用成功')
  } catch {
    row.enabled = originalValue
  } finally {
    productStandardStatusUpdatingIds.value = productStandardStatusUpdatingIds.value.filter((item) => item !== row.id)
  }
}

const handleProductStandardCatalogStatusChange = async (row, enabled) => {
  if (!selectedComponentTypeCatalogId.value || !selectedCustomCatalogRow.value?.name) {
    ElMessage.warning('请先选择自定义类目录')
    return
  }

  const originalValue = row.enabled
  row.enabled = enabled
  productStandardCatalogStatusUpdatingIds.value = [...productStandardCatalogStatusUpdatingIds.value, row.id]

  try {
    await updateStandardCatalogProductStandardCatalogStatus(selectedComponentTypeCatalogId.value, {
      componentSubType: selectedCustomCatalogRow.value.name,
      geometricIndustryStandardCl: row.geometricIndustryStandardCl,
      enabled
    })
    ElMessage.success(enabled ? '启用成功' : '禁用成功')
    await loadCustomCatalogs()
    await loadProductStandardCatalogs()
  } catch {
    row.enabled = originalValue
  } finally {
    productStandardCatalogStatusUpdatingIds.value = productStandardCatalogStatusUpdatingIds.value.filter((item) => item !== row.id)
  }
}

const handleComponentTypeRowClick = (row) => {
  if (!row.enabled) {
    componentTypeTableRef.value?.setCurrentRow?.(null)
    return
  }

  selectedComponentTypeId.value = row.id
}

const handleComponentTypeCatalogRowClick = (row) => {
  selectedComponentTypeCatalogId.value = row.id
}

const handleCustomCatalogRowClick = (row) => {
  selectedCustomCatalogId.value = row.id
}

const handleProductStandardCatalogRowClick = (row) => {
  selectedStandardCatalogId.value = row.id
}

const handleAddComponentType = () => {
  if (!selectedProfessional.value) {
    ElMessage.warning('请先选择专业')
    return
  }

  componentTypeForm.discipline = selectedProfessional.value
  componentTypeForm.componentTypeDescription = ''
  componentTypeForm.componentTypeName = ''
  componentTypeForm.connectType = ''
  componentTypeDialogVisible.value = true

  nextTick(() => {
    componentTypeFormRef.value?.clearValidate?.()
  })
}

const handleBindStandard = async () => {
  if (!selectedComponentTypeRow.value) {
    ElMessage.warning('请先选择部件类型')
    return
  }

  bindStandardDialogLoading.value = true
  bindStandardComponentTypeName.value = selectedComponentTypeRow.value.name
  bindStandardLibraryChecked.value = []
  bindStandardSelectedChecked.value = []
  bindStandardLibraryKeyword.value = ''
  bindStandardSelectedKeyword.value = ''

  try {
    const result = await getStandardCatalogBindingDialog(selectedComponentTypeRow.value.id)
    bindStandardComponentTypeName.value = result.componentType || selectedComponentTypeRow.value.name
    bindStandardLibrary.value = Array.isArray(result.standardLibrary) ? result.standardLibrary : []
    bindStandardSelected.value = sortStandardsByLibraryOrder(Array.isArray(result.selectedStandards) ? result.selectedStandards : [])
    bindStandardDialogVisible.value = true
  } catch {
    bindStandardDialogVisible.value = false
  } finally {
    bindStandardDialogLoading.value = false
  }
}

const handleAddStandardCatalog = () => {
  if (!selectedComponentTypeCatalogId.value || !selectedCustomCatalogRow.value?.name) {
    ElMessage.warning('请先选择部件类型目录和自定义类目录')
    return
  }

  standardCatalogDialogLoading.value = true
  standardCatalogComponentSubTypeName.value = selectedCustomCatalogRow.value.name
  standardCatalogConfiguredChecked.value = []
  standardCatalogSelectedChecked.value = []
  standardCatalogConfiguredKeyword.value = ''
  standardCatalogSelectedKeyword.value = ''

  getStandardCatalogDirectoryDialog(selectedComponentTypeCatalogId.value, selectedCustomCatalogRow.value.name)
    .then((result) => {
      standardCatalogComponentSubTypeName.value = result.componentSubType || selectedCustomCatalogRow.value?.name || ''
      const configuredStandards = Array.isArray(result.configuredStandards) ? result.configuredStandards : []
      const standardCatalogs = Array.isArray(result.standardCatalogs) ? result.standardCatalogs : []

      standardCatalogAllConfigured.value = sortStandardNames([
        ...new Set([...configuredStandards, ...standardCatalogs])
      ])
      standardCatalogSelected.value = sortStandardNames(standardCatalogs)
      standardCatalogDialogVisible.value = true
    })
    .catch(() => {
      standardCatalogDialogVisible.value = false
    })
    .finally(() => {
      standardCatalogDialogLoading.value = false
    })
}

const handleAddCustomCatalog = () => {
  if (!selectedComponentTypeCatalogId.value) {
    ElMessage.warning('请先选择部件类型目录')
    return
  }

  customCatalogDialogComponentTypeName.value = selectedComponentTypeCatalogRow.value?.name || ''
  customCatalogFormRows.value = [createCustomCatalogFormRow()]
  customCatalogDialogVisible.value = true
}

const handleConfigureCommodityType = () => {
  if (!selectedComponentTypeCatalogId.value || !selectedCustomCatalogRow.value?.name || !selectedStandardCatalogId.value) {
    ElMessage.warning('请先选择部件类型目录、自定义类目录和产品元件标准目录')
    return
  }

  ElMessage.info('配置CommodityType功能待后续开发')
}

const addCustomCatalogFormRow = () => {
  customCatalogFormRows.value = [...customCatalogFormRows.value, createCustomCatalogFormRow()]
}

const removeCustomCatalogFormRow = (key) => {
  if (customCatalogFormRows.value.length === 1) {
    return
  }

  customCatalogFormRows.value = customCatalogFormRows.value.filter((item) => item.key !== key)
}

const submitCustomCatalogDialog = async () => {
  if (!selectedComponentTypeCatalogId.value) {
    ElMessage.warning('当前部件类型目录不存在')
    return
  }

  const normalizedNames = customCatalogFormRows.value
    .map((item) => item.name.trim())
    .filter(Boolean)

  if (!normalizedNames.length) {
    ElMessage.warning('请至少填写一条自定义类目录')
    return
  }

  const duplicateNames = normalizedNames.filter((item, index) => normalizedNames.findIndex((current) => current === item) !== index)
  if (duplicateNames.length) {
    ElMessage.warning('输入内容存在重复，请检查')
    return
  }

  customCatalogDialogSubmitting.value = true
  try {
    await createStandardCatalogCustomCatalogs(selectedComponentTypeCatalogId.value, {
      componentSubTypes: normalizedNames
    })

    customCatalogDialogVisible.value = false
    await loadCustomCatalogs()
    ElMessage.success('新增成功')
  } finally {
    customCatalogDialogSubmitting.value = false
  }
}

const moveStandardsToConfig = () => {
  if (!bindStandardLibraryChecked.value.length) {
    return
  }

  bindStandardSelected.value = sortStandardsByLibraryOrder([
    ...new Set([...bindStandardSelected.value, ...bindStandardLibraryChecked.value])
  ])
  bindStandardLibraryChecked.value = []
}

const moveStandardsToLibrary = () => {
  if (!bindStandardSelectedChecked.value.length) {
    return
  }

  bindStandardSelected.value = bindStandardSelected.value.filter((item) => !bindStandardSelectedChecked.value.includes(item))
  bindStandardSelectedChecked.value = []
}

const moveConfiguredStandardsToDirectory = () => {
  if (!standardCatalogConfiguredChecked.value.length) {
    return
  }

  standardCatalogSelected.value = sortStandardNames([
    ...new Set([...standardCatalogSelected.value, ...standardCatalogConfiguredChecked.value])
  ])
  standardCatalogConfiguredChecked.value = []
}

const moveDirectoryStandardsToConfigured = () => {
  if (!standardCatalogSelectedChecked.value.length) {
    return
  }

  standardCatalogSelected.value = standardCatalogSelected.value.filter((item) => !standardCatalogSelectedChecked.value.includes(item))
  standardCatalogSelectedChecked.value = []
}

const submitComponentTypeForm = async () => {
  try {
    await componentTypeFormRef.value?.validate?.()
  } catch {
    return
  }

  const normalizedComponentTypeDescription = componentTypeForm.componentTypeDescription.trim()

  componentTypeDialogSubmitting.value = true
  try {
    const exists = await checkStandardCatalogComponentTypeDescriptionExists({
      discipline: componentTypeForm.discipline || undefined,
      componentTypeDescription: normalizedComponentTypeDescription
    })

    if (exists) {
      ElMessage.warning('该部件类型已存在，请重新输入')
      return
    }

    await createStandardCatalogComponentType({
      discipline: componentTypeForm.discipline,
      componentTypeDescription: normalizedComponentTypeDescription,
      componentTypeName: componentTypeForm.componentTypeName.trim(),
      connectType: showConnectTypeField.value ? componentTypeForm.connectType.trim() : ''
    })

    componentTypeDialogVisible.value = false
    await loadComponentTypes()
    ElMessage.success('新增成功')
  } finally {
    componentTypeDialogSubmitting.value = false
  }
}

const submitBindStandardDialog = async () => {
  if (!selectedComponentTypeRow.value) {
    ElMessage.warning('当前部件类型不存在')
    return
  }

  bindStandardDialogSubmitting.value = true
  try {
    await saveStandardCatalogBindings({
      discipline: selectedComponentTypeRow.value.discipline || selectedProfessional.value,
      componentTypeDescription: selectedComponentTypeRow.value.name,
      standardNames: bindStandardSelected.value
    })

    bindStandardDialogVisible.value = false
    await loadIndustryStandards()
    ElMessage.success('绑定保存成功')
  } finally {
    bindStandardDialogSubmitting.value = false
  }
}

const submitStandardCatalogDialog = async () => {
  if (!selectedComponentTypeCatalogId.value || !selectedCustomCatalogRow.value?.name) {
    ElMessage.warning('当前用户自定义类不存在')
    return
  }

  standardCatalogDialogSubmitting.value = true
  try {
    await saveStandardCatalogDirectory(selectedComponentTypeCatalogId.value, {
      componentSubType: selectedCustomCatalogRow.value.name,
      standardNames: standardCatalogSelected.value
    })

    standardCatalogDialogVisible.value = false
    await loadProductStandardCatalogs()
    ElMessage.success('标准目录保存成功')
  } finally {
    standardCatalogDialogSubmitting.value = false
  }
}

watch(
  selectedProfessional,
  async (value, oldValue) => {
    if (value === oldValue) {
      return
    }

    resetChildSelections()
    await loadComponentTypes()
  }
)

watch(selectedProfessional, (value) => {
  if (componentTypeDialogVisible.value) {
    componentTypeForm.discipline = value || ''
    if (!showConnectTypeField.value) {
      componentTypeForm.connectType = ''
    }
  }
})

watch(
  selectedComponentTypeId,
  async () => {
    await loadIndustryStandards()
  }
)

watch(
  selectedComponentTypeCatalogId,
  async () => {
    selectedCustomCatalogId.value = ''
    selectedStandardCatalogId.value = ''
    productStandardCatalogData.value = []
    await loadCustomCatalogs()
  }
)

watch(
  selectedCustomCatalogId,
  async () => {
    selectedStandardCatalogId.value = ''
    await loadProductStandardCatalogs()
  }
)

onMounted(async () => {
  await loadProfessionalOptions()
  await loadComponentTypes()
})
</script>

<style scoped>
.standard-catalog-page {
  height: 100%;
  min-height: 0;
  padding: 14px;
  box-sizing: border-box;
  background: #f3f5f8;
  overflow: hidden;
}

.module-layout {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 14px;
}

.module-card {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #dde3ea;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.06);
}

.module-header {
  padding: 18px 18px 12px;
  border-bottom: 1px solid #e8edf3;
}

.module-title {
  margin: 0 0 14px;
  font-size: 18px;
  font-weight: 700;
  color: #18222f;
}

.module-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-label {
  font-size: 14px;
  font-weight: 600;
  color: #3b4754;
}

.toolbar-select {
  width: 160px;
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;
}

.list-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  gap: 12px;
  padding: 12px;
}

.list-grid-left {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.list-grid-right {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.list-card {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e3e8ef;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(180deg, #fcfdff 0%, #f7f9fc 100%);
}

.list-card-title {
  padding: 10px 12px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2d3d;
  border-bottom: 1px solid #e3e8ef;
  background: #f8fafc;
  text-align: left;
}

.table-shell {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-shell :deep(.el-table) {
  --el-table-border-color: #dbe2ea;
  --el-table-header-bg-color: #f3f6fa;
  --el-table-row-hover-bg-color: #eef5ff;
  width: 100%;
}

.table-shell :deep(.el-table th.el-table__cell) {
  padding: 8px 12px;
  color: #314252;
  font-weight: 700;
  text-align: center;
}

.table-shell :deep(.el-table td.el-table__cell) {
  padding: 8px 0;
  text-align: center;
}

.table-shell :deep(.el-table .cell) {
  padding: 0 8px;
}

.table-shell :deep(.el-table__body-wrapper) {
  overflow-x: hidden;
}

.table-shell :deep(.el-radio) {
  margin-right: 0;
}

.table-shell :deep(.el-radio__label) {
  display: none;
}

.table-shell :deep(.el-table__body tr > td.el-table__cell) {
  background: #fff;
  transition: background-color 0.18s ease;
}

.table-shell :deep(.el-table__body tr:hover > td.el-table__cell),
.table-shell :deep(.el-table__body tr.hover-row > td.el-table__cell) {
  background: #eef5ff !important;
}

.table-shell :deep(.el-table__row) {
  cursor: pointer;
}

.table-shell :deep(.el-table .current-row > td.el-table__cell) {
  background: #e8f2ff !important;
}

.table-shell :deep(.el-table__body tr.current-row:hover > td.el-table__cell),
.table-shell :deep(.el-table__body tr.hover-row.current-row > td.el-table__cell) {
  background: #e8f2ff !important;
}

.table-shell :deep(.compact-switch) {
  transform: scale(0.82);
  transform-origin: center center;
}

.component-type-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px 8px;
}

.component-type-dialog :deep(.el-dialog__body) {
  padding: 8px 24px 12px;
}

.component-type-dialog :deep(.el-dialog__footer) {
  padding: 8px 24px 22px;
}

.component-type-dialog__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.component-type-dialog__title {
  font-size: 24px;
  font-weight: 700;
  color: #17212d;
  line-height: 1.1;
}

.component-type-dialog__discipline {
  font-size: 13px;
  font-weight: 600;
  color: #5a6b7d;
  align-self: flex-end;
}

.component-type-dialog__footer {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.component-type-dialog__form {
  padding-right: 6px;
}

.custom-catalog-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 18px 22px 10px;
}

.custom-catalog-dialog :deep(.el-dialog__body) {
  padding: 8px 22px 12px;
}

.custom-catalog-dialog :deep(.el-dialog__footer) {
  padding: 10px 22px 20px;
}

.custom-catalog-dialog__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.custom-catalog-dialog__title {
  font-size: 24px;
  font-weight: 700;
  color: #17212d;
  line-height: 1.1;
}

.custom-catalog-dialog__component-type {
  font-size: 13px;
  font-weight: 600;
  color: #5a6b7d;
  align-self: flex-end;
}

.custom-catalog-dialog__body {
  min-height: 220px;
}

.custom-catalog-dialog__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-catalog-dialog__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 40px;
  gap: 10px;
  align-items: center;
}

.custom-catalog-dialog__add-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.custom-catalog-dialog__footer {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.bind-standard-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 18px 16px 10px;
}

.bind-standard-dialog :deep(.el-dialog__body) {
  padding: 6px 14px 10px;
}

.bind-standard-dialog :deep(.el-dialog__footer) {
  padding: 10px 16px 20px;
}

.bind-standard-dialog__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.bind-standard-dialog__title {
  font-size: 28px;
  font-weight: 700;
  color: #17212d;
  line-height: 1.1;
}

.bind-standard-dialog__component-type {
  font-size: 15px;
  font-weight: 700;
  color: #435568;
  align-self: flex-end;
}

.bind-standard-dialog__body {
  min-height: 460px;
}

.bind-standard-dialog__panel-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
}

.bind-standard-dialog__panel {
  min-width: 0;
}

.bind-standard-dialog__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.bind-standard-dialog__panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2d3d;
  flex-shrink: 0;
}

.bind-standard-dialog__panel-type {
  font-size: 12px;
  font-weight: 600;
  color: #607285;
}

.bind-standard-dialog__search {
  width: 160px;
}

.bind-standard-dialog__scroll {
  height: 390px;
  padding: 10px 12px;
  border: 1px solid #d7dee8;
  border-radius: 8px;
  background: #fff;
}

.bind-standard-dialog__checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bind-standard-dialog__move-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.bind-standard-dialog__move-actions :deep(.el-button) {
  width: 30px;
  height: 30px;
  font-size: 22px;
  font-weight: 700;
  margin-left: 0;
}

.bind-standard-dialog__footer {
  display: flex;
  justify-content: center;
  gap: 14px;
}

@media (max-width: 1680px) {
  .module-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .standard-catalog-page {
    overflow: auto;
  }

  .module-layout {
    height: auto;
  }

  .list-grid-left,
  .list-grid-right {
    grid-template-columns: 1fr;
  }

  .list-card {
    min-height: 320px;
  }

  .bind-standard-dialog__panel-layout {
    grid-template-columns: 1fr;
  }

  .bind-standard-dialog__move-actions {
    flex-direction: row;
  }
}
</style>
