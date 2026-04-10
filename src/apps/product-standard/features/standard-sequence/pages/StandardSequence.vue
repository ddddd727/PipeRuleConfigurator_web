﻿﻿﻿﻿﻿<template>
  <div class="standard-sequence-container">
    <el-container class="main-layout">
      <!-- 左侧目录树 -->
      <el-aside width="280px" class="tree-aside">
        <div class="tree-title">
          <el-icon><Menu /></el-icon>
          <span>简选系列</span>
        </div>
        <div class="tree-content">
          <div class="tree-header">
            <el-input
              v-if="currentPage === 'config'"
              v-model="configFilterText"
              placeholder="搜索目录..."
              :prefix-icon="Search"
              clearable
              size="small"
            />
            <el-input
              v-else
              v-model="dashboardFilterText"
              placeholder="搜索目录..."
              :prefix-icon="Search"
              clearable
              size="small"
            />
            <div v-if="currentPage === 'config'" class="tree-actions">
              <el-tooltip content="新增" placement="top">
                <span>
                  <el-button link :icon="Plus" @click="openAddNodeDialog" />
                </span>
              </el-tooltip>
              <el-tooltip content="重命名" placement="top">
                <span>
                  <el-button link :icon="Edit" :disabled="!canRenameNode" @click="openRenameDialog" />
                </span>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <span>
                  <el-button link type="danger" :icon="Delete" :disabled="!canDeleteNode" @click="handleDeleteNode" />
                </span>
              </el-tooltip>
              <el-tooltip content="升版" placement="top">
                <span>
                  <el-button link :icon="Upload" :disabled="!canUpgradeNode" @click="handleUpgradeNode" />
                </span>
              </el-tooltip>
            </div>
          </div>
          <div class="tree-wrapper">
            <el-tree
              v-if="currentPage === 'config'"
              ref="configTreeRef"
              :data="configTreeData"
              node-key="id"
              :props="treeProps"
              highlight-current
              :filter-node-method="filterConfigNode"
              @node-click="handleConfigNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <el-icon v-if="data.meta && data.meta.level < 3" class="folder-icon"><Folder /></el-icon>
                  <el-icon v-else class="file-icon"><Document /></el-icon>
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
            <el-tree
              v-else
              ref="dashboardTreeRef"
              :data="dashboardTreeData"
              node-key="id"
              :props="treeProps"
              highlight-current
              :filter-node-method="filterDashboardNode"
              @node-click="handleDashboardNodeClick"
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
        <div class="detail-container">
          <template v-if="currentPage === 'config'">
            <div v-if="isFormNodeSelected" class="content-inner">
              <div class="content-header">
                <div class="title-text">{{ formTitle }}</div>
                <div class="action-btns">
                  <el-button type="primary" size="small" @click="openAddDialog">新增</el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleDeleteRows"
                    :disabled="selectedFormRowIds.length === 0"
                  >
                    删除
                  </el-button>
                </div>
              </div>
              <div class="table-wrapper">
                <el-table
                  :data="formTableRows"
                  border
                  height="100%"
                  style="width: 100%;"
                  @selection-change="handleFormSelectionChange"
                >
                  <el-table-column type="selection" width="48" />
                  <el-table-column type="index" label="ID" width="70" />
                  <el-table-column prop="thicknessLevel" label="壁厚等级编码" min-width="120">
                    <template #default="{ row }">
                      <span>{{ row.thicknessLevel }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="thicknessLevelDescription" label="壁厚等级描述" min-width="140">
                    <template #default="{ row }">
                      <span>{{ row.thicknessLevelDescription || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="nominalDiameter" label="通径" min-width="120">
                    <template #default="{ row }">
                      <span>{{ row.nominalDiameter }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="nominalDiameterUnit" label="通径单位" width="110">
                    <template #default="{ row }">
                      <span>{{ row.nominalDiameterUnit }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="outerDiameter" label="外径" min-width="120">
                    <template #default="{ row }">
                      <span>{{ row.outerDiameter }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="wallThickness" label="壁厚" min-width="120">
                    <template #default="{ row }">
                      <span>{{ row.wallThickness }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="version" label="版本" width="90">
                    <template #default="{ row }">
                      <span>{{ row.version }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="启用" width="90">
                    <template #default="{ row }">
                      {{ row.enabled ? '启用' : '禁用' }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div v-else class="empty-state">
              <el-empty description="请选择第三级标准号或第四级材料牌号" />
            </div>
          </template>
          <template v-else>
            <div class="content-inner">
              <div class="table-wrapper">
                <el-table :data="dashboardTableData" border height="100%" style="width: 100%;" @row-click="handleDashboardRowClick">
                  <el-table-column type="index" label="序号" width="60" />
                  <el-table-column prop="componentName" label="部件名称" />
                  <el-table-column prop="nominalDiameter" label="公称通径" width="140" />
                  <el-table-column prop="materialGrade" label="材料牌号" width="140" />
                  <el-table-column prop="standardNumber" label="标准号" />
                </el-table>
              </div>
            </div>
          </template>
        </div>
      </el-main>
    </el-container>

    <el-dialog
      v-model="addNodeDialogVisible"
      title="新增"
      width="520px"
    >
      <el-form :model="addNodeForm" label-width="110px">
        <el-form-item label="简选系列" required>
          <el-input v-model="addNodeForm.sequenceName" />
        </el-form-item>
        <el-form-item label="物资名称" required>
          <el-input v-model="addNodeForm.name" />
        </el-form-item>
        <el-form-item label="部件类型" required>
          <el-select v-model="addNodeForm.componentType" filterable size="default" style="width: 100%;">
            <el-option v-for="opt in componentTypeOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
        <el-form-item label="标准号" required>
          <el-select v-model="addNodeForm.standard" filterable size="default" style="width: 100%;">
            <el-option v-for="opt in addNodeStandardOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" required>
          <el-input v-model="addNodeForm.sequenceVersion" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addNodeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddNode">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="renameDialogVisible" title="重命名" width="420px">
      <el-form :model="renameForm" label-width="90px">
        <el-form-item label="新名称" required>
          <el-input v-model="renameForm.newLabel" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renameDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="addRowDialogVisible" title="新增数据" width="980px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="font-weight: 600;">
          {{ formTitle }}
        </div>
        <div style="display: flex; gap: 8px;">
          <el-button type="primary" size="small" @click="loadBaseData(false)">加载基础库数据</el-button>
          <el-button size="small" @click="appendNewRow(false)">新增一行</el-button>
          <el-button size="small" @click="appendNewRow(true)" :disabled="newRowRows.length === 0">复制上一行</el-button>
          <el-button type="danger" size="small" @click="removeSelectedNewRows" :disabled="newRowSelection.length === 0">
            删除所选
          </el-button>
        </div>
      </div>
      <el-table
        :data="newRowRows"
        border
        height="420px"
        style="width: 100%;"
        @selection-change="handleNewRowSelectionChange"
        :show-header-overflow-tooltip="true"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column type="index" label="ID" width="60" show-overflow-tooltip />
        <el-table-column prop="materialGrade" label="材料牌号" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <el-select v-model="row.materialGrade" size="small" @change="() => updateOuterDiameterAndWallThickness(row)">
              <el-option
                v-for="option in materialGradeSelectOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="thicknessLevel" label="壁厚等级编码" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <el-select v-model="row.thicknessLevel" size="small" @change="() => updateOuterDiameterAndWallThickness(row)">
              <el-option
                v-for="option in thicknessLevelSelectOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="thicknessLevelDescription" label="壁厚等级描述" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input v-model="row.thicknessLevelDescription" size="small" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="nominalDiameter" label="通径" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <el-select v-model="row.nominalDiameter" size="small" @change="() => updateOuterDiameterAndWallThickness(row)">
              <el-option
                v-for="option in nominalDiameterSelectOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="nominalDiameterUnit" label="通径单位" min-width="90" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input v-model="row.nominalDiameterUnit" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="outerDiameter" label="外径" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input v-model="row.outerDiameter" size="small" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="wallThickness" label="壁厚" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input v-model="row.wallThickness" size="small" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" min-width="80" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <el-switch v-model="row.enabled" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addRowDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmLoadAndSaveRows" :disabled="newRowRows.length === 0">确定导入</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="dashboardDetailDialogVisible" title="明细查看" width="960px" :close-on-click-modal="false">
      <el-table :data="dashboardDetailRows" border height="500px" style="width: 100%;">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="materialGrade" label="材料牌号" min-width="100" />
        <el-table-column prop="thicknessLevel" label="壁厚等级编码" min-width="110" />
        <el-table-column prop="thicknessLevelDescription" label="壁厚等级描述" min-width="120" />
        <el-table-column prop="nominalDiameter" label="通径" min-width="100" />
        <el-table-column prop="nominalDiameterUnit" label="通径单位" width="90" />
        <el-table-column prop="outerDiameter" label="外径" min-width="100" />
        <el-table-column prop="wallThickness" label="壁厚" min-width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            {{ row.enabled ? '启用' : '禁用' }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dashboardDetailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
defineOptions({ name: 'StandardSequence' })
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Document, Edit, Folder, Menu, Plus, Search, Upload } from '@element-plus/icons-vue'
import { fetchThicknessLevelDescriptions } from '@/apps/product-standard/features/standard-sequence/api/standard-sequence'

const route = useRoute()

const currentPage = computed(() => {
  if (route.name === 'StandardSequenceDashboard') return 'dashboard'
  return 'config'
})

const treeProps = {
  children: 'children',
  label: 'label'
}

const componentTypeOptions = ['管材', '管件', '法兰', '阀门']
const standardsByComponentType = {
  管材: ['GB/T 8163', 'GB/T 5312', 'GB/T 14976', 'GB/T 21833.2', 'GB/T 3091'],
  管件: ['GB/T 12459', 'GB/T 13401', 'HG/T 21635'],
  法兰: ['HG/T 20592', 'HG/T 20615', 'GB/T 9112'],
  阀门: ['GB/T 12224', 'GB/T 12237', 'JB/T 7748']
}

const materialGradeOptions = ['20#', 'Q235B', 'Q345B', '304', '316L', '321', '347H', '2205', 'S31803']

const thicknessLevelDescriptionMap = ref({})

const getThicknessLevelDescription = (code) => {
  if (!code) return ''
  return thicknessLevelDescriptionMap.value[code] || ''
}

// Mock 基础库数据接口
const baseLibraryDataMock = {
  'GB/T 8163': [
    { materialGrade: '20#', thicknessLevel: 'D1', nominalDiameter: 10, nominalDiameterUnit: 'mm', outerDiameter: 17.5, wallThickness: 2.4 },
    { materialGrade: '20#', thicknessLevel: 'D1', nominalDiameter: 12, nominalDiameterUnit: 'mm', outerDiameter: 21.3, wallThickness: 2.8 },
    { materialGrade: '20#', thicknessLevel: 'D2', nominalDiameter: 14, nominalDiameterUnit: 'mm', outerDiameter: 22.2, wallThickness: 2.8 },
    { materialGrade: '20#', thicknessLevel: 'D2', nominalDiameter: 16, nominalDiameterUnit: 'mm', outerDiameter: 25.4, wallThickness: 3.2 },
    { materialGrade: 'Q235B', thicknessLevel: 'D1', nominalDiameter: 18, nominalDiameterUnit: 'mm', outerDiameter: 28.6, wallThickness: 3.2 },
    { materialGrade: 'Q235B', thicknessLevel: 'D2', nominalDiameter: 20, nominalDiameterUnit: 'mm', outerDiameter: 30, wallThickness: 3.2 },
    { materialGrade: 'Q345B', thicknessLevel: 'D1', nominalDiameter: 22, nominalDiameterUnit: 'mm', outerDiameter: 33.7, wallThickness: 3.6 },
    { materialGrade: 'Q345B', thicknessLevel: 'D2', nominalDiameter: 25, nominalDiameterUnit: 'mm', outerDiameter: 38, wallThickness: 3.6 },
    { materialGrade: '304', thicknessLevel: 'D1', nominalDiameter: 28, nominalDiameterUnit: 'mm', outerDiameter: 42.7, wallThickness: 3.2 },
    { materialGrade: '304', thicknessLevel: 'D2', nominalDiameter: 32, nominalDiameterUnit: 'mm', outerDiameter: 48.3, wallThickness: 3.6 }
  ],
  'GB/T 5312': [
    { materialGrade: 'Q235B', thicknessLevel: 'D1', nominalDiameter: 10, nominalDiameterUnit: 'mm', outerDiameter: 17.5, wallThickness: 2.0 },
    { materialGrade: 'Q235B', thicknessLevel: 'D2', nominalDiameter: 16, nominalDiameterUnit: 'mm', outerDiameter: 25.4, wallThickness: 2.65 },
    { materialGrade: 'Q345B', thicknessLevel: 'D1', nominalDiameter: 20, nominalDiameterUnit: 'mm', outerDiameter: 30, wallThickness: 2.75 },
    { materialGrade: 'Q345B', thicknessLevel: 'D2', nominalDiameter: 25, nominalDiameterUnit: 'mm', outerDiameter: 38, wallThickness: 3.2 }
  ],
  'GB/T 14976': [
    { materialGrade: '304', thicknessLevel: 'D1', nominalDiameter: 12, nominalDiameterUnit: 'mm', outerDiameter: 16, wallThickness: 1.5 },
    { materialGrade: '304', thicknessLevel: 'D2', nominalDiameter: 16, nominalDiameterUnit: 'mm', outerDiameter: 20, wallThickness: 1.5 },
    { materialGrade: '316L', thicknessLevel: 'D1', nominalDiameter: 20, nominalDiameterUnit: 'mm', outerDiameter: 25, wallThickness: 1.65 },
    { materialGrade: '316L', thicknessLevel: 'D2', nominalDiameter: 25, nominalDiameterUnit: 'mm', outerDiameter: 32, wallThickness: 2.0 }
  ],
  'GB/T 12459': [
    { materialGrade: '20#', thicknessLevel: 'D1', nominalDiameter: 32, nominalDiameterUnit: 'mm', outerDiameter: 45, wallThickness: 3.0 },
    { materialGrade: '20#', thicknessLevel: 'D2', nominalDiameter: 40, nominalDiameterUnit: 'mm', outerDiameter: 53, wallThickness: 3.5 },
    { materialGrade: 'Q235B', thicknessLevel: 'D1', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 63.5, wallThickness: 4.0 },
    { materialGrade: 'Q235B', thicknessLevel: 'D2', nominalDiameter: 65, nominalDiameterUnit: 'mm', outerDiameter: 85, wallThickness: 4.5 }
  ]
}

let rowIdSeed = 1
const createRowId = () => rowIdSeed++

const definitionTableData = ref([
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 1,
    name: '碳钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 8163',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 50,
    nominalDiameterUnit: 'mm',
    outerDiameter: 60.3,
    wallThickness: 3.9,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 1,
    name: '碳钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 8163',
    materialGrade: '20#',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 80,
    nominalDiameterUnit: 'mm',
    outerDiameter: 88.9,
    wallThickness: 5.5,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 1,
    name: '碳钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 5312',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 100,
    nominalDiameterUnit: 'mm',
    outerDiameter: 114.3,
    wallThickness: 6.3,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 1,
    name: '奥氏体不锈钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 14976',
    materialGrade: '304',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 25,
    nominalDiameterUnit: 'mm',
    outerDiameter: 33.4,
    wallThickness: 3.4,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 1,
    name: '奥氏体不锈钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 14976',
    materialGrade: '316L',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 40,
    nominalDiameterUnit: 'mm',
    outerDiameter: 48.3,
    wallThickness: 3.7,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 1,
    name: '奥氏体-铁素体型双相不锈钢管',
    componentType: '管材',
    standard: 'GB/T 21833.2',
    materialGrade: '2205',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 100,
    nominalDiameterUnit: 'mm',
    outerDiameter: 114.3,
    wallThickness: 6.3,
    version: 1,
    enabled: false
  },

  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 2,
    name: '碳钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 8163',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 65,
    nominalDiameterUnit: 'mm',
    outerDiameter: 76.1,
    wallThickness: 4.0,
    version: 2,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 2,
    name: '碳钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 5312',
    materialGrade: '20#',
    thicknessLevel: 'D3',
    thicknessLevelDescription: '重型壁厚',
    nominalDiameter: 150,
    nominalDiameterUnit: 'mm',
    outerDiameter: 168.3,
    wallThickness: 7.1,
    version: 2,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 2,
    name: '奥氏体不锈钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 14976',
    materialGrade: '321',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 80,
    nominalDiameterUnit: 'mm',
    outerDiameter: 88.9,
    wallThickness: 5.5,
    version: 2,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-001',
    sequenceVersion: 2,
    name: '奥氏体-铁素体型双相不锈钢管',
    componentType: '管材',
    standard: 'GB/T 21833.2',
    materialGrade: 'S31803',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 200,
    nominalDiameterUnit: 'mm',
    outerDiameter: 219.1,
    wallThickness: 8.2,
    version: 2,
    enabled: false
  },

  {
    id: createRowId(),
    sequenceName: '50-002',
    sequenceVersion: 1,
    name: '碳钢焊接压力钢管',
    componentType: '管材',
    standard: 'GB/T 3091',
    materialGrade: 'Q235B',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 50,
    nominalDiameterUnit: 'mm',
    outerDiameter: 60.3,
    wallThickness: 3.6,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-002',
    sequenceVersion: 1,
    name: '碳钢焊接压力钢管',
    componentType: '管材',
    standard: 'GB/T 3091',
    materialGrade: 'Q235B',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 100,
    nominalDiameterUnit: 'mm',
    outerDiameter: 114.3,
    wallThickness: 4.5,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-002',
    sequenceVersion: 1,
    name: '碳钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 8163',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 25,
    nominalDiameterUnit: 'mm',
    outerDiameter: 33.4,
    wallThickness: 3.4,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '50-002',
    sequenceVersion: 1,
    name: '碳钢无缝压力钢管',
    componentType: '管材',
    standard: 'GB/T 8163',
    materialGrade: 'Q345B',
    thicknessLevel: 'D3',
    thicknessLevelDescription: '重型壁厚',
    nominalDiameter: 200,
    nominalDiameterUnit: 'mm',
    outerDiameter: 219.1,
    wallThickness: 10.0,
    version: 1,
    enabled: false
  },

  {
    id: createRowId(),
    sequenceName: '60-010',
    sequenceVersion: 1,
    name: '对焊弯头',
    componentType: '管件',
    standard: 'GB/T 12459',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 50,
    nominalDiameterUnit: 'mm',
    outerDiameter: 60.3,
    wallThickness: 3.9,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '60-010',
    sequenceVersion: 1,
    name: '对焊弯头',
    componentType: '管件',
    standard: 'GB/T 12459',
    materialGrade: '20#',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 150,
    nominalDiameterUnit: 'mm',
    outerDiameter: 168.3,
    wallThickness: 7.1,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '60-010',
    sequenceVersion: 1,
    name: '对焊三通',
    componentType: '管件',
    standard: 'GB/T 12459',
    materialGrade: 'Q345B',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 100,
    nominalDiameterUnit: 'mm',
    outerDiameter: 114.3,
    wallThickness: 6.0,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '60-010',
    sequenceVersion: 1,
    name: '对焊异径管',
    componentType: '管件',
    standard: 'GB/T 12459',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 80,
    nominalDiameterUnit: 'mm',
    outerDiameter: 88.9,
    wallThickness: 5.5,
    version: 1,
    enabled: true
  },

  {
    id: createRowId(),
    sequenceName: '70-005',
    sequenceVersion: 1,
    name: '平焊法兰',
    componentType: '法兰',
    standard: 'HG/T 20592',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 50,
    nominalDiameterUnit: 'mm',
    outerDiameter: 60.3,
    wallThickness: 3.9,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '70-005',
    sequenceVersion: 1,
    name: '平焊法兰',
    componentType: '法兰',
    standard: 'HG/T 20592',
    materialGrade: 'Q345B',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 150,
    nominalDiameterUnit: 'mm',
    outerDiameter: 168.3,
    wallThickness: 7.1,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '70-005',
    sequenceVersion: 2,
    name: '平焊法兰',
    componentType: '法兰',
    standard: 'HG/T 20592',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 80,
    nominalDiameterUnit: 'mm',
    outerDiameter: 88.9,
    wallThickness: 5.5,
    version: 2,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '70-005',
    sequenceVersion: 2,
    name: '平焊法兰',
    componentType: '法兰',
    standard: 'GB/T 9112',
    materialGrade: 'Q345B',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 200,
    nominalDiameterUnit: 'mm',
    outerDiameter: 219.1,
    wallThickness: 8.2,
    version: 2,
    enabled: false
  },

  {
    id: createRowId(),
    sequenceName: '80-003',
    sequenceVersion: 1,
    name: '截止阀',
    componentType: '阀门',
    standard: 'GB/T 12224',
    materialGrade: '20#',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 50,
    nominalDiameterUnit: 'mm',
    outerDiameter: 60.3,
    wallThickness: 3.9,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '80-003',
    sequenceVersion: 1,
    name: '球阀',
    componentType: '阀门',
    standard: 'GB/T 12237',
    materialGrade: '316L',
    thicknessLevel: 'D1',
    thicknessLevelDescription: '普通壁厚',
    nominalDiameter: 80,
    nominalDiameterUnit: 'mm',
    outerDiameter: 88.9,
    wallThickness: 5.5,
    version: 1,
    enabled: true
  },
  {
    id: createRowId(),
    sequenceName: '80-003',
    sequenceVersion: 1,
    name: '闸阀',
    componentType: '阀门',
    standard: 'JB/T 7748',
    materialGrade: '304',
    thicknessLevel: 'D2',
    thicknessLevelDescription: '加厚壁厚',
    nominalDiameter: 150,
    nominalDiameterUnit: 'mm',
    outerDiameter: 168.3,
    wallThickness: 7.1,
    version: 1,
    enabled: false
  }
])

const toKeyPart = (value) => String(value ?? '').trim().replace(/[^\w\u4e00-\u9fa5.-]+/g, '_')

const configTreeData = computed(() => {
  const seqMap = new Map()

  const getSeqNode = (sequenceName, sequenceVersion) => {
    const key = `${toKeyPart(sequenceName)}-v-${toKeyPart(sequenceVersion)}`
    if (!seqMap.has(key)) {
      seqMap.set(key, {
        id: `seq-${key}`,
        label: `${sequenceName} V${sequenceVersion}`,
        meta: { level: 1, sequenceName, sequenceVersion },
        children: []
      })
    }
    return seqMap.get(key)
  }

  const getNameNode = (seqNode, name) => {
    const key = toKeyPart(name)
    let node = seqNode.children.find(n => n.id === `${seqNode.id}-name-${key}`)
    if (!node) {
      node = {
        id: `${seqNode.id}-name-${key}`,
        label: name,
        meta: {
          level: 2,
          sequenceName: seqNode.meta.sequenceName,
          sequenceVersion: seqNode.meta.sequenceVersion,
          name
        },
        children: []
      }
      seqNode.children.push(node)
    }
    return node
  }

  const getStandardNode = (nameNode, standard) => {
    const key = toKeyPart(standard)
    let node = nameNode.children.find(n => n.id === `${nameNode.id}-std-${key}`)
    if (!node) {
      node = {
        id: `${nameNode.id}-std-${key}`,
        label: standard,
        meta: {
          level: 3,
          sequenceName: nameNode.meta.sequenceName,
          sequenceVersion: nameNode.meta.sequenceVersion,
          name: nameNode.meta.name,
          standard
        },
        children: []
      }
      nameNode.children.push(node)
    }
    return node
  }

  for (const row of definitionTableData.value) {
    if (!row.sequenceName || !row.sequenceVersion || !row.name || !row.standard) continue
    const seqNode = getSeqNode(row.sequenceName, row.sequenceVersion)
    const nameNode = getNameNode(seqNode, row.name)
    getStandardNode(nameNode, row.standard)
  }

  return Array.from(seqMap.values())
})

const selectedLevel = ref(0)
const selectedMeta = ref(null)
const configTreeRef = ref(null)
const configFilterText = ref('')

watch(configFilterText, (val) => {
  configTreeRef.value?.filter(val)
})

const filterConfigNode = (value, data) => {
  if (!value) return true
  return String(data.label ?? '').includes(value)
}

const clearSelection = () => {
  selectedLevel.value = 0
  selectedMeta.value = null
  selectedFormRowIds.value = []
}

const handleConfigNodeClick = (data, node) => {
  selectedLevel.value = node.level
  selectedMeta.value = data.meta || null
  selectedFormRowIds.value = []
}

const isFormNodeSelected = computed(() => selectedLevel.value === 3)

const formTitle = computed(() => {
  if (!selectedMeta.value) return ''
  const meta = selectedMeta.value
  const parts = [`${meta.sequenceName} V${meta.sequenceVersion}`, meta.name, meta.standard]
  return parts.filter(Boolean).join(' / ')
})

const getRowsInScope = (meta, level) => {
  if (!meta || !level) return []
  return definitionTableData.value.filter(row => {
    if (row.sequenceName !== meta.sequenceName) return false
    if (row.sequenceVersion !== meta.sequenceVersion) return false
    if (level >= 2 && row.name !== meta.name) return false
    if (level >= 3 && row.standard !== meta.standard) return false
    if (level >= 4 && row.materialGrade !== meta.materialGrade) return false
    return true
  })
}

const formViewRows = computed(() => {
  if (!isFormNodeSelected.value || !selectedMeta.value) return []
  const rows = getRowsInScope(selectedMeta.value, selectedLevel.value)
  const compareText = (left, right) =>
    String(left ?? '').localeCompare(String(right ?? ''), 'zh-CN', { numeric: true, sensitivity: 'base' })
  const toNum = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return rows.slice().sort((a, b) => {
    const material = compareText(a.materialGrade, b.materialGrade)
    if (material !== 0) return material
    const thickness = compareText(a.thicknessLevel, b.thicknessLevel)
    if (thickness !== 0) return thickness
    return toNum(a.nominalDiameter) - toNum(b.nominalDiameter)
  })
})

const selectedFormRowIds = ref([])

const formTableRows = computed(() => formViewRows.value)

const handleFormSelectionChange = (rows) => {
  selectedFormRowIds.value = (rows || []).map(r => r.id)
}

const validateNumber = (value, minValue) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return false
  return num >= minValue
}

const normalizeRequiredString = (value) => String(value ?? '').trim()

// Dashboard Logic
const dashboardFilterText = ref('')
const dashboardTreeRef = ref(null)
const selectedDashboardSequence = ref(null)

const dashboardTreeData = computed(() => {
  const seqList = []
  const seen = new Set()
  for (const row of definitionTableData.value) {
    if (!row.sequenceName || !row.sequenceVersion) continue
    const key = `${row.sequenceName}__${row.sequenceVersion}`
    if (seen.has(key)) continue
    seen.add(key)
    seqList.push({
      id: `dashboard-seq-${toKeyPart(row.sequenceName)}-v-${toKeyPart(row.sequenceVersion)}`,
      label: `${row.sequenceName} V${row.sequenceVersion}`,
      meta: { sequenceName: row.sequenceName, sequenceVersion: row.sequenceVersion }
    })
  }
  return seqList
})

watch(dashboardFilterText, (val) => {
  dashboardTreeRef.value?.filter(val)
})

const filterDashboardNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

const handleDashboardNodeClick = (data) => {
  selectedDashboardSequence.value = data.meta || null
}

const formatRange = (minValue, maxValue) => {
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return '-'
  if (minValue === maxValue) return String(minValue)
  return `${minValue}~${maxValue}`
}

const dashboardTableData = computed(() => {
  const seq = selectedDashboardSequence.value
  if (!seq?.sequenceName || !seq?.sequenceVersion) return []
  const rows = definitionTableData.value.filter(
    r => r.sequenceName === seq.sequenceName && r.sequenceVersion === seq.sequenceVersion
  )
  const groupMap = new Map()

  for (const row of rows) {
    const key = String(row.name ?? '')
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        componentName: row.name,
        materialGrades: new Set(),
        standards: new Set(),
        minND: Infinity,
        maxND: -Infinity
      })
    }
    const group = groupMap.get(key)
    group.standards.add(row.standard)
    group.materialGrades.add(row.materialGrade)
    const nd = Number(row.nominalDiameter)
    if (Number.isFinite(nd)) {
      group.minND = Math.min(group.minND, nd)
      group.maxND = Math.max(group.maxND, nd)
    }
  }

  return Array.from(groupMap.values()).map(group => ({
    componentName: group.componentName,
    nominalDiameter: formatRange(group.minND, group.maxND),
    materialGrade: Array.from(group.materialGrades).filter(Boolean).join(','),
    standardNumber: Array.from(group.standards).join(',')
  })).sort((a, b) => String(a.componentName ?? '').localeCompare(String(b.componentName ?? ''), 'zh-CN', { numeric: true }))
})

const dashboardDetailDialogVisible = ref(false)
const dashboardDetailSummary = ref(null)

const dashboardDetailRows = computed(() => {
  if (!dashboardDetailSummary.value) return []
  const summary = dashboardDetailSummary.value
  const seq = selectedDashboardSequence.value
  if (!seq?.sequenceName || !seq?.sequenceVersion) return []

  const rows = definitionTableData.value.filter(
    r =>
      r.sequenceName === seq.sequenceName &&
      r.sequenceVersion === seq.sequenceVersion &&
      r.name === summary.componentName
  )

  const compareText = (left, right) =>
    String(left ?? '').localeCompare(String(right ?? ''), 'zh-CN', { numeric: true, sensitivity: 'base' })
  const toNum = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  return rows.slice().sort((a, b) => {
    const material = compareText(a.materialGrade, b.materialGrade)
    if (material !== 0) return material
    const thickness = compareText(a.thicknessLevel, b.thicknessLevel)
    if (thickness !== 0) return thickness
    return toNum(a.nominalDiameter) - toNum(b.nominalDiameter)
  })
})

const handleDashboardRowClick = (row) => {
  if (!row || !row.componentName) return
  dashboardDetailSummary.value = {
    componentName: row.componentName,
    sequenceName: selectedDashboardSequence.value?.sequenceName || '',
    sequenceVersion: selectedDashboardSequence.value?.sequenceVersion || '',
    nominalDiameter: row.nominalDiameter,
    materialGrade: row.materialGrade,
    standardNumber: row.standardNumber
  }
  dashboardDetailDialogVisible.value = true
}

const addNodeDialogVisible = ref(false)
const addNodeForm = ref({
  sequenceName: '',
  name: '',
  componentType: '',
  standard: '',
  sequenceVersion: 1
})

const addNodeStandardOptions = computed(() => {
  const type = addNodeForm.value.componentType
  return standardsByComponentType[type] || []
})

const getSiblingLabels = (level, meta) => {
  if (!level || !meta) return []
  if (level === 1) {
    return Array.from(
      new Set(
        definitionTableData.value
          .filter(r => r.sequenceVersion === meta.sequenceVersion)
          .map(r => r.sequenceName)
      )
    ).filter(Boolean)
  }
  if (level === 2) {
    return Array.from(
      new Set(
        definitionTableData.value
          .filter(r => r.sequenceName === meta.sequenceName && r.sequenceVersion === meta.sequenceVersion)
          .map(r => r.name)
      )
    ).filter(Boolean)
  }
  if (level === 3) {
    return Array.from(
      new Set(
        definitionTableData.value
          .filter(
            r =>
              r.sequenceName === meta.sequenceName &&
              r.sequenceVersion === meta.sequenceVersion &&
              r.name === meta.name
          )
          .map(r => r.standard)
      )
    ).filter(Boolean)
  }
  return []
}

const canRenameNode = computed(() => selectedLevel.value >= 1 && !!selectedMeta.value)
const canDeleteNode = computed(() => selectedLevel.value >= 1 && !!selectedMeta.value)
const canUpgradeNode = computed(() => selectedLevel.value >= 1 && !!selectedMeta.value)

const openAddNodeDialog = () => {
  const meta = selectedMeta.value
  const level = selectedLevel.value

  const base = {
    sequenceName: '',
    sequenceVersion: 1,
    name: '',
    componentType: componentTypeOptions[0],
    standard: '',
    materialGrade: ''
  }

  if (meta && level >= 1) base.sequenceName = meta.sequenceName || ''
  if (meta && level >= 1) base.sequenceVersion = meta.sequenceVersion || 1
  if (meta && level >= 2) base.name = meta.name || ''
  if (meta && level >= 3) base.standard = meta.standard || ''

  const found = definitionTableData.value.find(r => {
    if (base.sequenceName && r.sequenceName !== base.sequenceName) return false
    if (base.sequenceVersion && r.sequenceVersion !== base.sequenceVersion) return false
    if (base.name && r.name !== base.name) return false
    return true
  })
  if (found?.componentType) base.componentType = found.componentType

  addNodeForm.value = { ...base }
  addNodeDialogVisible.value = true
}

const confirmAddNode = () => {
  const form = addNodeForm.value
  const seq = normalizeRequiredString(form.sequenceName)
  const sequenceVersion = Number(form.sequenceVersion)
  const name = normalizeRequiredString(form.name)
  const type = normalizeRequiredString(form.componentType)
  const standard = normalizeRequiredString(form.standard)

  if (!seq || !Number.isFinite(sequenceVersion) || sequenceVersion < 1 || !name || !type || !standard) {
    ElMessage.warning('请填写必填项')
    return
  }

  const exists = definitionTableData.value.some(
    r =>
      r.sequenceName === seq &&
      r.sequenceVersion === sequenceVersion &&
      r.name === name &&
      r.standard === standard
  )
  if (exists) {
    ElMessage.warning('该标准号节点已存在')
    return
  }

  definitionTableData.value.push({
    id: createRowId(),
    sequenceName: seq,
    sequenceVersion,
    name,
    componentType: type,
    standard,
    thicknessLevel: 'D1',
    thicknessLevelDescription: getThicknessLevelDescription('D1'),
    nominalDiameter: 0,
    nominalDiameterUnit: 'mm',
    outerDiameter: 0,
    wallThickness: 0,
    version: sequenceVersion,
    enabled: true
  })

  addNodeDialogVisible.value = false
  ElMessage.success('新增成功')
}

const renameDialogVisible = ref(false)
const renameForm = ref({ newLabel: '' })

const openRenameDialog = () => {
  if (!selectedMeta.value || !selectedLevel.value) return
  if (selectedLevel.value === 1) renameForm.value.newLabel = selectedMeta.value.sequenceName
  if (selectedLevel.value === 2) renameForm.value.newLabel = selectedMeta.value.name
  if (selectedLevel.value === 3) renameForm.value.newLabel = selectedMeta.value.standard
  renameDialogVisible.value = true
}

const confirmRename = () => {
  const level = selectedLevel.value
  const meta = selectedMeta.value
  if (!level || !meta) return

  const newLabel = normalizeRequiredString(renameForm.value.newLabel)
  if (!newLabel) {
    ElMessage.warning('新名称必填')
    return
  }

  const siblings = getSiblingLabels(level, meta)
  const currentLabel =
    level === 1 ? meta.sequenceName : level === 2 ? meta.name : level === 3 ? meta.standard : meta.materialGrade
  if (newLabel !== currentLabel && siblings.includes(newLabel)) {
    ElMessage.warning('同级节点名称已存在')
    return
  }

  if (level === 1) {
    for (const row of definitionTableData.value) {
      if (row.sequenceName === meta.sequenceName && row.sequenceVersion === meta.sequenceVersion) row.sequenceName = newLabel
    }
  } else if (level === 2) {
    for (const row of definitionTableData.value) {
      if (
        row.sequenceName === meta.sequenceName &&
        row.sequenceVersion === meta.sequenceVersion &&
        row.name === meta.name
      ) {
        row.name = newLabel
      }
    }
  } else if (level === 3) {
    for (const row of definitionTableData.value) {
      if (
        row.sequenceName === meta.sequenceName &&
        row.sequenceVersion === meta.sequenceVersion &&
        row.name === meta.name &&
        row.standard === meta.standard
      ) {
        row.standard = newLabel
      }
    }
  }

  renameDialogVisible.value = false
  clearSelection()
  ElMessage.success('重命名成功')
}

const handleDeleteNode = async () => {
  const level = selectedLevel.value
  const meta = selectedMeta.value
  if (!level || !meta) return

  try {
    await ElMessageBox.confirm('将删除当前节点及其子节点对应的数据，是否继续？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  definitionTableData.value = definitionTableData.value.filter(row => {
    if (row.sequenceName !== meta.sequenceName) return true
    if (row.sequenceVersion !== meta.sequenceVersion) return true
    if (level >= 2 && row.name !== meta.name) return true
    if (level >= 3 && row.standard !== meta.standard) return true
    return false
  })

  clearSelection()
  ElMessage.success('删除成功')
}

const handleUpgradeNode = async () => {
  const level = selectedLevel.value
  const meta = selectedMeta.value
  if (!level || !meta) return

  const seqRows = definitionTableData.value.filter(
    r => r.sequenceName === meta.sequenceName && r.sequenceVersion === meta.sequenceVersion
  )
  if (seqRows.length === 0) {
    ElMessage.warning('当前节点无可升版数据')
    return
  }

  let nextVersion = null
  try {
    const { value } = await ElMessageBox.prompt('请输入新版本号', '升版', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: String(Number(meta.sequenceVersion) + 1),
      inputPattern: /^[1-9]\d*$/,
      inputErrorMessage: '请输入正整数'
    })
    nextVersion = Number(value)
  } catch {
    return
  }

  if (!Number.isFinite(nextVersion) || nextVersion < 1) {
    ElMessage.warning('请输入正确的版本号')
    return
  }

  const exists = definitionTableData.value.some(
    r => r.sequenceName === meta.sequenceName && r.sequenceVersion === nextVersion
  )
  if (exists) {
    ElMessage.warning('该版本已存在')
    return
  }

  const copies = seqRows.map(r => ({
    ...r,
    id: createRowId(),
    sequenceVersion: nextVersion,
    version: nextVersion,
    thicknessLevelDescription: getThicknessLevelDescription(r.thicknessLevel)
  }))
  definitionTableData.value.push(...copies)

  clearSelection()
  ElMessage.success('升版成功')
}

const addRowDialogVisible = ref(false)
let newRowLocalIdSeed = 1
const createNewRowLocalId = () => `new-${Date.now()}-${newRowLocalIdSeed++}`

const newRowRows = ref([])
const newRowSelection = ref([])

// 下拉选项数据
const materialGradeSelectOptions = ref([])
const thicknessLevelSelectOptions = ref([])
const nominalDiameterSelectOptions = ref([])
const specMappingData = ref({}) // 用于快速查找外径和壁厚

const createEmptyNewRow = (meta) => {
  const existedMaterial = formViewRows.value[0]?.materialGrade
  return {
    __localId: createNewRowLocalId(),
    materialGrade: existedMaterial || '',
    thicknessLevel: '',
    nominalDiameter: 0,
    nominalDiameterUnit: 'mm',
    outerDiameter: 0,
    wallThickness: 0,
    enabled: true
  }
}

const openAddDialog = () => {
  if (!selectedMeta.value) return
  addRowDialogVisible.value = true
}

const loadBaseData = async (openDialog = true) => {
  if (!selectedMeta.value) return
  const meta = selectedMeta.value
  const standard = meta.standard

  const baseData = baseLibraryDataMock[standard] || []

  if (baseData.length === 0) {
    ElMessage.warning(`没有找到标准号 ${standard} 的基础库数据`)
    return
  }

  const sortedData = baseData.slice().sort((a, b) => {
    const materialCompare = String(a.materialGrade ?? '').localeCompare(String(b.materialGrade ?? ''), 'zh-CN')
    if (materialCompare !== 0) return materialCompare

    const thicknessCompare = String(a.thicknessLevel ?? '').localeCompare(String(b.thicknessLevel ?? ''), 'zh-CN')
    if (thicknessCompare !== 0) return thicknessCompare

    return Number(a.nominalDiameter ?? 0) - Number(b.nominalDiameter ?? 0)
  })

  const materialSet = new Set(sortedData.map(item => item.materialGrade))
  const thicknessSet = new Set(sortedData.map(item => item.thicknessLevel))
  const diameterSet = new Set(sortedData.map(item => item.nominalDiameter))

  materialGradeSelectOptions.value = Array.from(materialSet).map(val => ({ label: val, value: val }))
  thicknessLevelSelectOptions.value = Array.from(thicknessSet).map(val => ({ label: val, value: val }))
  nominalDiameterSelectOptions.value = Array.from(diameterSet)
    .sort((a, b) => Number(a) - Number(b))
    .map(val => ({ label: String(val), value: val }))

  specMappingData.value = {}
  sortedData.forEach(item => {
    const key = `${item.materialGrade}|${item.thicknessLevel}|${item.nominalDiameter}`
    specMappingData.value[key] = {
      outerDiameter: item.outerDiameter,
      wallThickness: item.wallThickness
    }
  })

  newRowRows.value = sortedData.map(item => ({
    __localId: createNewRowLocalId(),
    materialGrade: item.materialGrade,
    thicknessLevel: item.thicknessLevel,
    nominalDiameter: item.nominalDiameter,
    nominalDiameterUnit: item.nominalDiameterUnit,
    outerDiameter: item.outerDiameter,
    wallThickness: item.wallThickness,
    enabled: true
  }))

  newRowSelection.value = newRowRows.value.slice()

  try {
    const thicknessCodes = Array.from(thicknessSet)
    const descriptions = await fetchThicknessLevelDescriptions(thicknessCodes)
    thicknessLevelDescriptionMap.value = descriptions
  } catch (error) {
    console.error('获取壁厚等级描述失败:', error)
    ElMessage.warning('获取壁厚等级描述失败，将显示编码')
  }

  if (openDialog) {
    addRowDialogVisible.value = true
  }
}

const openLoadBaseDataDialog = () => {
  loadBaseData(true)
}

const handleNewRowSelectionChange = (rows) => {
  newRowSelection.value = rows || []
}

const appendNewRow = (copyLast) => {
  if (!selectedMeta.value) return
  const meta = selectedMeta.value
  const last = newRowRows.value[newRowRows.value.length - 1]
  if (copyLast && last) {
    newRowRows.value.push({ ...last, __localId: createNewRowLocalId() })
    return
  }
  newRowRows.value.push(createEmptyNewRow(meta))
}

const updateOuterDiameterAndWallThickness = (row) => {
  // 根据选择的材料牌号、壁厚等级、通径，自动填充外径和壁厚
  if (!row.materialGrade || !row.thicknessLevel || !row.nominalDiameter) {
    return
  }

  const key = `${row.materialGrade}|${row.thicknessLevel}|${row.nominalDiameter}`
  const spec = specMappingData.value[key]

  if (spec) {
    row.outerDiameter = spec.outerDiameter
    row.wallThickness = spec.wallThickness
  }
}

const removeNewRowAt = (index) => {
  newRowRows.value.splice(index, 1)
  const current = new Set(newRowRows.value.map(r => r.__localId))
  newRowSelection.value = newRowSelection.value.filter(r => current.has(r.__localId))
}

const removeSelectedNewRows = () => {
  if (newRowSelection.value.length === 0) return
  const toRemove = new Set(newRowSelection.value.map(r => r.__localId))
  newRowRows.value = newRowRows.value.filter(r => !toRemove.has(r.__localId))
  newRowSelection.value = []
}

const confirmAddRows = () => {
  if (!selectedMeta.value) return

  const meta = selectedMeta.value
  const base = formViewRows.value[0] || getRowsInScope(meta, selectedLevel.value)[0]
  const componentType = base?.componentType || addNodeForm.value.componentType || componentTypeOptions[0]

  const pendingRows = []
  const localKeys = new Set()

  for (let i = 0; i < newRowRows.value.length; i++) {
    const input = newRowRows.value[i]
    const row = {
      id: createRowId(),
      materialGrade: normalizeRequiredString(input.materialGrade),
      thicknessLevel: normalizeRequiredString(input.thicknessLevel),
      thicknessLevelDescription: getThicknessLevelDescription(input.thicknessLevel),
      nominalDiameter: Number(input.nominalDiameter),
      nominalDiameterUnit: normalizeRequiredString(input.nominalDiameterUnit),
      outerDiameter: Number(input.outerDiameter),
      wallThickness: Number(input.wallThickness),
      version: Number(meta.sequenceVersion),
      enabled: !!input.enabled
    }

    if (!row.thicknessLevel || !row.nominalDiameterUnit) {
      ElMessage.warning(`第 ${i + 1} 行：请填写必填项`)
      return
    }
    if (
      !validateNumber(row.nominalDiameter, 0) ||
      !validateNumber(row.outerDiameter, 0) ||
      !validateNumber(row.wallThickness, 0)
    ) {
      ElMessage.warning(`第 ${i + 1} 行：数值字段必须为非负数`)
      return
    }

    const key = [
      meta.sequenceName,
      meta.sequenceVersion,
      meta.name,
      meta.standard,
      row.materialGrade,
      row.thicknessLevel,
      row.nominalDiameter,
      row.nominalDiameterUnit,
      row.outerDiameter,
      row.wallThickness,
      row.version
    ].join('|')

    if (localKeys.has(key)) {
      ElMessage.warning(`第 ${i + 1} 行：与本次新增的其他行重复`)
      return
    }
    localKeys.add(key)

    const exists = definitionTableData.value.some(r => {
      return (
        r.sequenceName === meta.sequenceName &&
        r.sequenceVersion === meta.sequenceVersion &&
        r.name === meta.name &&
        r.standard === meta.standard &&
        r.materialGrade === row.materialGrade &&
        normalizeRequiredString(r.thicknessLevel) === row.thicknessLevel &&
        Number(r.nominalDiameter) === row.nominalDiameter &&
        normalizeRequiredString(r.nominalDiameterUnit) === row.nominalDiameterUnit &&
        Number(r.outerDiameter) === row.outerDiameter &&
        Number(r.wallThickness) === row.wallThickness &&
        Number(r.version) === row.version
      )
    })
    if (exists) {
      ElMessage.warning(`第 ${i + 1} 行：该行已存在`)
      return
    }

    pendingRows.push({
      ...row,
      sequenceName: meta.sequenceName,
      sequenceVersion: meta.sequenceVersion,
      name: meta.name,
      componentType,
      standard: meta.standard,
      materialGrade: row.materialGrade
    })
  }

  definitionTableData.value.push(...pendingRows)
  addRowDialogVisible.value = false
  ElMessage.success(`新增并保存成功（${pendingRows.length}行）`)
}

const confirmLoadAndSaveRows = async () => {
  if (!selectedMeta.value) return

  const meta = selectedMeta.value
  const base = formViewRows.value[0] || getRowsInScope(meta, selectedLevel.value)[0]
  const componentType = base?.componentType || addNodeForm.value.componentType || componentTypeOptions[0]

  if (newRowSelection.value.length === 0) {
    ElMessage.warning('请选择要导入的数据')
    return
  }

  const pendingRows = []
  const localKeys = new Set()
  const duplicateRows = [] // 记录重复的行

  for (let i = 0; i < newRowSelection.value.length; i++) {
    const input = newRowSelection.value[i]
    const row = {
      id: createRowId(),
      materialGrade: normalizeRequiredString(input.materialGrade),
      thicknessLevel: normalizeRequiredString(input.thicknessLevel),
      thicknessLevelDescription: getThicknessLevelDescription(input.thicknessLevel),
      nominalDiameter: Number(input.nominalDiameter),
      nominalDiameterUnit: normalizeRequiredString(input.nominalDiameterUnit),
      outerDiameter: Number(input.outerDiameter),
      wallThickness: Number(input.wallThickness),
      version: Number(meta.sequenceVersion),
      enabled: !!input.enabled
    }

    const key = [
      meta.sequenceName,
      meta.sequenceVersion,
      meta.name,
      meta.standard,
      row.materialGrade,
      row.thicknessLevel,
      row.nominalDiameter,
      row.nominalDiameterUnit,
      row.outerDiameter,
      row.wallThickness,
      row.version
    ].join('|')

    if (localKeys.has(key)) {
      ElMessage.warning(`第 ${i + 1} 行：与本次导入的其他行重复`)
      return
    }
    localKeys.add(key)

    const existingIndex = definitionTableData.value.findIndex(r => {
      return (
        r.sequenceName === meta.sequenceName &&
        r.sequenceVersion === meta.sequenceVersion &&
        r.name === meta.name &&
        r.standard === meta.standard &&
        r.materialGrade === row.materialGrade &&
        normalizeRequiredString(r.thicknessLevel) === row.thicknessLevel &&
        Number(r.nominalDiameter) === row.nominalDiameter &&
        normalizeRequiredString(r.nominalDiameterUnit) === row.nominalDiameterUnit &&
        Number(r.outerDiameter) === row.outerDiameter &&
        Number(r.wallThickness) === row.wallThickness &&
        Number(r.version) === row.version
      )
    })

    if (existingIndex >= 0) {
      duplicateRows.push({ index: i, row, existingId: definitionTableData.value[existingIndex].id })
      continue
    }

    pendingRows.push({
      ...row,
      sequenceName: meta.sequenceName,
      sequenceVersion: meta.sequenceVersion,
      name: meta.name,
      componentType,
      standard: meta.standard,
      materialGrade: row.materialGrade
    })
  }

  // 如果有重复的行，弹出选择框让用户选择覆盖或跳过
  if (duplicateRows.length > 0) {
    const duplicateInfo = duplicateRows.map((item, idx) => {
      return `第 ${item.index + 1} 行：${item.row.materialGrade} / ${item.row.thicknessLevel} / ${item.row.nominalDiameter}`
    }).join('\n')

    try {
      await ElMessageBox.confirm(`检测到 ${duplicateRows.length} 行重复数据：\n\n${duplicateInfo}\n\n是否覆盖现有数据？`, '发现重复数据', {
        confirmButtonText: '覆盖',
        cancelButtonText: '跳过',
        type: 'warning'
      })
      // 用户选择"覆盖"
      duplicateRows.forEach(item => {
        const existingIndex = definitionTableData.value.findIndex(r => r.id === item.existingId)
        if (existingIndex >= 0) {
          definitionTableData.value[existingIndex] = {
            ...definitionTableData.value[existingIndex],
            materialGrade: item.row.materialGrade,
            thicknessLevel: item.row.thicknessLevel,
            thicknessLevelDescription: getThicknessLevelDescription(item.row.thicknessLevel),
            nominalDiameter: item.row.nominalDiameter,
            nominalDiameterUnit: item.row.nominalDiameterUnit,
            outerDiameter: item.row.outerDiameter,
            wallThickness: item.row.wallThickness,
            version: item.row.version,
            enabled: item.row.enabled
          }
        }
      })
    } catch {
      // 用户选择"跳过"，不处理重复行
    }
  }

  if (pendingRows.length > 0) {
    definitionTableData.value.push(...pendingRows)
  }

  const totalCount = pendingRows.length + duplicateRows.length
  addRowDialogVisible.value = false
  ElMessage.success(`导入并保存成功（新增 ${pendingRows.length} 行，覆盖 ${duplicateRows.length} 行）`)
}

const handleDeleteRows = async () => {
  if (selectedFormRowIds.value.length === 0) return

  try {
    await ElMessageBox.confirm('将删除选中的行，是否继续？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  const toDelete = new Set(selectedFormRowIds.value)
  definitionTableData.value = definitionTableData.value.filter(r => !toDelete.has(r.id))
  selectedFormRowIds.value = []
  ElMessage.success('删除并保存成功')
}

watch(
  () => route.name,
  () => {
    clearSelection()
  }
)
</script>

<style scoped>
.standard-sequence-container {
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
  gap: 6px;
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

.content-inner {
  background: #fff;
  border: 1px solid #ebeef5;
  flex: 1;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.title-text {
  font-weight: 600;
  font-size: 14px;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
}

.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border: 1px solid #ebeef5;
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
</style>
