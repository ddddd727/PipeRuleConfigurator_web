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
                :data="componentTypeData"
                border
                size="small"
                height="100%"
                highlight-current-row
                empty-text="暂无数据"
                @row-click="handleComponentTypeRowClick"
              >
                <el-table-column width="56" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedComponentTypeId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="部件类型" min-width="180" header-align="center" align="center" />
                <el-table-column label="启用" width="86" header-align="center" align="center">
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
            <div class="table-shell">
              <el-table
                :data="productStandardData"
                border
                size="small"
                height="100%"
                highlight-current-row
                empty-text="待后续接入"
                @row-click="handleProductStandardRowClick"
              >
                <el-table-column width="56" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedProductStandardId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="标准" min-width="160" header-align="center" align="center" />
                <el-table-column label="启用" width="86" header-align="center" align="center">
                  <template #default="{ row }">
                    <el-switch :model-value="row.enabled" size="small" class="compact-switch" disabled />
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
              <el-button type="primary" :icon="Plus" @click="handleAddStandardCatalog">新增标准目录</el-button>
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
                <el-table-column width="56" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedComponentTypeCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="部件类型" min-width="180" header-align="center" align="center" />
              </el-table>
            </div>
          </article>

          <article class="list-card">
            <div class="list-card-title">自定义类目录</div>
            <div class="table-shell">
              <el-table
                :data="customCatalogData"
                border
                size="small"
                height="100%"
                highlight-current-row
                empty-text="待后续接入"
                @row-click="handleCustomCatalogRowClick"
              >
                <el-table-column width="56" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedCustomCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="用户自定义类" min-width="180" header-align="center" align="center" />
              </el-table>
            </div>
          </article>

          <article class="list-card">
            <div class="list-card-title">产品元件标准目录</div>
            <div class="table-shell">
              <el-table
                :data="productStandardCatalogData"
                border
                size="small"
                height="100%"
                highlight-current-row
                empty-text="待后续接入"
                @row-click="handleProductStandardCatalogRowClick"
              >
                <el-table-column width="56" align="center" header-align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedStandardCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="标准" min-width="160" header-align="center" align="center" />
                <el-table-column label="启用" width="86" header-align="center" align="center">
                  <template #default="{ row }">
                    <el-switch :model-value="row.enabled" size="small" class="compact-switch" disabled />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, RefreshLeft } from '@element-plus/icons-vue'
import {
  getStandardCatalogComponentTypes,
  getStandardCatalogDisciplines,
  updateStandardCatalogComponentTypeStatus
} from '@/apps/product-standard/features/standard-catalog-definition/api/standardCatalogDefinitionAPI'

const DEFAULT_DISCIPLINE = '管系'

const professionalOptions = ref([])
const selectedProfessional = ref(DEFAULT_DISCIPLINE)
const componentTypeRows = ref([])
const componentTypeLoading = ref(false)
const statusUpdatingIds = ref([])

const selectedComponentTypeId = ref('')
const selectedProductStandardId = ref('')
const selectedComponentTypeCatalogId = ref('')
const selectedCustomCatalogId = ref('')
const selectedStandardCatalogId = ref('')

const productStandardData = ref([])
const customCatalogData = ref([])
const productStandardCatalogData = ref([])

const componentTypeData = computed(() => componentTypeRows.value)
const componentTypeCatalogData = computed(() => componentTypeRows.value.filter((item) => item.enabled))

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
syncSelectionWithRows(() => productStandardData.value, selectedProductStandardId)
syncSelectionWithRows(() => componentTypeCatalogData.value, selectedComponentTypeCatalogId)
syncSelectionWithRows(() => customCatalogData.value, selectedCustomCatalogId)
syncSelectionWithRows(() => productStandardCatalogData.value, selectedStandardCatalogId)

const isStatusUpdating = (id) => statusUpdatingIds.value.includes(id)

const normalizeComponentTypes = (rows = []) =>
  rows.map((item) => ({
    id: item.id,
    discipline: item.discipline || '',
    name: item.componentType || '',
    enabled: Boolean(item.enabled)
  }))

const resetChildSelections = () => {
  selectedComponentTypeId.value = ''
  selectedProductStandardId.value = ''
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

const handleComponentTypeStatusChange = async (row, enabled) => {
  const originalValue = row.enabled
  row.enabled = enabled
  statusUpdatingIds.value = [...statusUpdatingIds.value, row.id]

  try {
    await updateStandardCatalogComponentTypeStatus(row.id, enabled)
    ElMessage.success(enabled ? '启用成功' : '禁用成功')
  } catch {
    row.enabled = originalValue
  } finally {
    statusUpdatingIds.value = statusUpdatingIds.value.filter((item) => item !== row.id)
  }
}

const handleComponentTypeRowClick = (row) => {
  selectedComponentTypeId.value = row.id
}

const handleProductStandardRowClick = (row) => {
  selectedProductStandardId.value = row.id
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
  ElMessage.info('新增部件类型功能待后续开发')
}

const handleBindStandard = () => {
  ElMessage.info('标准-部件类型绑定功能待后续开发')
}

const handleAddStandardCatalog = () => {
  ElMessage.info('新增标准目录功能待后续开发')
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
  grid-template-columns: 1fr 1.15fr;
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
}

.table-shell :deep(.el-table) {
  --el-table-border-color: #dbe2ea;
  --el-table-header-bg-color: #f3f6fa;
  --el-table-row-hover-bg-color: #eef5ff;
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
}
</style>
