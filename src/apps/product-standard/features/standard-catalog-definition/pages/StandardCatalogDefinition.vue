<template>
  <div class="standard-catalog-page">
    <div class="module-layout">
      <section class="module-card">
        <div class="module-header">
          <h2 class="module-title">标准-部件类型配置模块</h2>
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
            <div class="table-shell">
              <el-table
                :data="componentTypeData"
                border
                size="small"
                height="100%"
                highlight-current-row
                @row-click="handleComponentTypeRowClick"
              >
                <el-table-column width="56" align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedComponentTypeId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="部件类型" min-width="150" align="center" />
                <el-table-column label="启用" width="86" align="center">
                  <template #default="{ row }">
                    <el-switch v-model="row.enabled" size="small" class="compact-switch" />
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
                @row-click="handleProductStandardRowClick"
              >
                <el-table-column width="56" align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedProductStandardId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="标准" min-width="140" align="center" />
                <el-table-column label="启用" width="86" align="center">
                  <template #default="{ row }">
                    <el-switch v-model="row.enabled" size="small" class="compact-switch" />
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
            <div class="table-shell">
              <el-table
                :data="componentTypeCatalogData"
                border
                size="small"
                height="100%"
                highlight-current-row
                @row-click="handleComponentTypeCatalogRowClick"
              >
                <el-table-column width="56" align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedComponentTypeCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="部件类型" min-width="150" align="center" />
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
                @row-click="handleCustomCatalogRowClick"
              >
                <el-table-column width="56" align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedCustomCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="用户自定义类" min-width="160" align="center" />
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
                @row-click="handleProductStandardCatalogRowClick"
              >
                <el-table-column width="56" align="center">
                  <template #default="{ row }">
                    <el-radio v-model="selectedStandardCatalogId" :label="row.id" @click.stop>
                      <span></span>
                    </el-radio>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="标准" min-width="140" align="center" />
                <el-table-column label="启用" width="86" align="center">
                  <template #default="{ row }">
                    <el-switch v-model="row.enabled" size="small" class="compact-switch" />
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
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, RefreshLeft } from '@element-plus/icons-vue'
import { createStandardCatalogMockData } from '@/apps/product-standard/features/standard-catalog-definition/mock/standardCatalogMock'

const mockData = reactive(createStandardCatalogMockData())

const professionalOptions = mockData.professionals
const selectedProfessional = ref(professionalOptions[0]?.value ?? '')

const selectedComponentTypeId = ref('')
const selectedProductStandardId = ref('')
const selectedComponentTypeCatalogId = ref('')
const selectedCustomCatalogId = ref('')
const selectedStandardCatalogId = ref('')

const currentProfessionalData = computed(() => {
  return mockData.professionalCatalogMap[selectedProfessional.value] ?? {
    leftComponentTypes: [],
    rightComponentTypeCatalogs: []
  }
})

const componentTypeData = computed(() => currentProfessionalData.value.leftComponentTypes)

const selectedComponentType = computed(() => {
  return componentTypeData.value.find((item) => item.id === selectedComponentTypeId.value) ?? null
})

const productStandardData = computed(() => selectedComponentType.value?.productStandards ?? [])

const componentTypeCatalogData = computed(() => currentProfessionalData.value.rightComponentTypeCatalogs)

const selectedComponentTypeCatalog = computed(() => {
  return componentTypeCatalogData.value.find((item) => item.id === selectedComponentTypeCatalogId.value) ?? null
})

const customCatalogData = computed(() => selectedComponentTypeCatalog.value?.customCatalogs ?? [])

const selectedCustomCatalog = computed(() => {
  return customCatalogData.value.find((item) => item.id === selectedCustomCatalogId.value) ?? null
})

const productStandardCatalogData = computed(() => selectedCustomCatalog.value?.standardCatalogs ?? [])

const syncSelectionWithRows = (rowsGetter, selectedIdRef) => {
  watch(
    rowsGetter,
    (rows) => {
      if (!rows.length) {
        selectedIdRef.value = ''
        return
      }

      const hasSelectedRow = rows.some((item) => item.id === selectedIdRef.value)
      if (!hasSelectedRow) {
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
  ElMessage.success('新增部件类型')
}

const handleBindStandard = () => {
  ElMessage.success('标准-部件类型绑定')
}

const handleAddStandardCatalog = () => {
  ElMessage.success('新增标准目录')
}
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
  width: 120px;
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
  padding: 0;
}

.table-shell :deep(.el-table) {
  --el-table-border-color: #dbe2ea;
  --el-table-header-bg-color: #f3f6fa;
  --el-table-row-hover-bg-color: #eef5ff;
}

.table-shell :deep(.el-table th.el-table__cell) {
  color: #314252;
  font-weight: 700;
}

.table-shell :deep(.el-table td.el-table__cell),
.table-shell :deep(.el-table th.el-table__cell) {
  padding: 8px 0;
  text-align: center;
}

.table-shell :deep(.el-table__body tr > td.el-table__cell) {
  background: #fff;
  transition: background-color 0.18s ease;
}

.table-shell :deep(.el-table__body tr:hover > td.el-table__cell),
.table-shell :deep(.el-table__body tr.hover-row > td.el-table__cell) {
  background: #eef5ff !important;
}

.table-shell :deep(.el-radio) {
  margin-right: 0;
}

.table-shell :deep(.el-radio__label) {
  display: none;
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

  .list-grid-right {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
