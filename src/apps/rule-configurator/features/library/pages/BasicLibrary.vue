<template>
  <div class="basic-library-container">
    <el-container class="main-layout">
      <!-- 左侧目录树 -->
      <el-aside width="280px" class="tree-aside">
        <div class="tree-title">
          <el-icon><Menu /></el-icon>
          <span>{{ currentTitle }}</span>
        </div>
          <div v-if="isPipeProfessional || isCodelistLibrary" class="tree-content" v-loading="treeLoading" element-loading-text="加载中...">
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
                  <el-icon v-if="isFolder(node, data)" class="folder-icon"><Folder /></el-icon>
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
              <!-- 3层关系界面 (MaterialsGrade 等) -->
              <el-card v-if="selectedNode.category === '3'" shadow="never" class="codelist-card three-layer-card">
                <template #header>
                  <div class="card-header codelist-header">
                    <div class="header-left">
                      <span class="title">{{ selectedNode.label }}</span>
                      <span class="subtitle">*本codelist表共3层关系</span>
                    </div>
                    <div class="header-right">
                      <el-button :icon="Back" @click="handleBackLevel" :disabled="currentLevel === 1">返回上一级</el-button>
                      <el-button type="info" plain :icon="Download">导出</el-button>
                    </div>
                  </div>
                </template>

                <!-- 筛选区 -->
                <div class="filter-section" v-loading="codelistUiLoading" element-loading-text="加载中...">
                  <el-form label-width="180px" class="filter-form">
                    <el-form-item :label="(levelNames.level1) + ' :'">
                      <el-select v-model="layerFilters.practice" placeholder="/" style="width: 100%" @change="recomputeCodelistView">
                        <el-option label="/" value="/" />
                        <el-option v-for="opt in practiceOptions" :key="opt.shortDesc" :label="opt.shortDesc" :value="opt.shortDesc" />
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="(levelNames.level2) + ' :'">
                      <el-select v-model="layerFilters.category" placeholder="/" style="width: 100%" @change="recomputeCodelistView">
                        <el-option label="/" value="/" />
                        <el-option v-for="opt in categoryOptions" :key="opt.shortDesc" :label="opt.shortDesc" :value="opt.shortDesc" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="Codelist Number :">
                      <el-input v-model="currentCodelistNumber" readonly class="read-only-input" />
                    </el-form-item>
                  </el-form>
                </div>

                <!-- 表格区 -->
                <div class="table-section-container">
                  <div class="table-section-header">
                    <div class="header-left">
                      <span class="table-title">{{ currentTableTitle }}</span>
                    </div>
                    <div class="header-right">
                      <el-input
                        v-model="codelistFilterText"
                        placeholder=""
                        class="search-input"
                        style="width: 250px; margin-right: 10px;"
                        @keyup.enter="handleCodelistSearch"
                      >
                        <template #append>
                          <el-button :icon="Search" @click="handleCodelistSearch" />
                        </template>
                      </el-input>
                      <el-button type="primary" :icon="Plus" :disabled="currentLevel !== 3" @click="openCodelistAddDialog">新增</el-button>
                      <el-button :type="statusButtonType" :icon="statusButtonIcon" @click="handleToggleStatus">{{ statusButtonText }}</el-button>
                    </div>
                  </div>
                  <div class="table-wrapper" v-loading="codelistUiLoading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.65)">
                    <el-table 
                      ref="codelistTableRef"
                      :data="codelistTableData" 
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

              <!-- 2层关系界面 (PressureRating 等) -->
              <el-card v-else-if="selectedNode.category === '2'" shadow="never" class="codelist-card three-layer-card">
                <template #header>
                  <div class="card-header codelist-header">
                    <div class="header-left">
                      <span class="title">{{ selectedNode.label }}</span>
                      <span class="subtitle">*本codelist表共2层关系</span>
                    </div>
                    <div class="header-right">
                      <el-button :icon="Back" @click="handleBackLevel" :disabled="currentLevel === 1">返回上一级</el-button>
                      <el-button type="info" plain :icon="Download">导出</el-button>
                    </div>
                  </div>
                </template>

                <!-- 筛选区（仅第一层） -->
                <div class="filter-section" v-loading="codelistUiLoading" element-loading-text="加载中...">
                  <el-form label-width="180px" class="filter-form">
                    <el-form-item :label="(levelNames.level1) + ' :'">
                      <el-select v-model="layerFilters.practice" placeholder="/" style="width: 100%" @change="recomputeCodelistView">
                        <el-option label="/" value="/" />
                        <el-option v-for="opt in practiceOptions" :key="opt.shortDesc" :label="opt.shortDesc" :value="opt.shortDesc" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="Codelist Number :">
                      <el-input v-model="currentCodelistNumber" readonly class="read-only-input" />
                    </el-form-item>
                  </el-form>
                </div>

                <!-- 表格区 -->
                <div class="table-section-container">
                  <div class="table-section-header">
                    <div class="header-left">
                      <span class="table-title">{{ currentTableTitle }}</span>
                    </div>
                    <div class="header-right">
                      <el-input
                        v-model="codelistFilterText"
                        placeholder=""
                        class="search-input"
                        style="width: 250px; margin-right: 10px;"
                        @keyup.enter="handleCodelistSearch"
                      >
                        <template #append>
                          <el-button :icon="Search" @click="handleCodelistSearch" />
                        </template>
                      </el-input>
                      <el-button type="primary" :icon="Plus" :disabled="currentLevel !== 2" @click="openCodelistAddDialog">新增</el-button>
                      <el-button :type="statusButtonType" :icon="statusButtonIcon" @click="handleToggleStatus">{{ statusButtonText }}</el-button>
                    </div>
                  </div>
                  <div class="table-wrapper" v-loading="codelistUiLoading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.65)">
                    <el-table 
                      ref="codelistTableRef"
                      :data="codelistTableData" 
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

              <!-- 单层 Codelist 界面 (FlowDirection/BoltType 等) -->
              <el-card v-else-if="selectedNode.category === '1'" shadow="never" class="codelist-card">
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
                        @keyup.enter="handleCodelistSearch"
                      >
                        <template #append>
                          <el-button :icon="Search" @click="handleCodelistSearch" />
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
                
                <div class="table-wrapper" v-loading="codelistUiLoading" element-loading-text="加载中..." element-loading-background="rgba(255, 255, 255, 0.65)">
                  <el-table 
                    ref="codelistTableRef"
                    :data="codelistTableData" 
                    border 
                    height="100%"
                    :row-class-name="tableRowClassName"
                    @row-click="handleCodelistRowClick"
                    @row-dblclick="handleCodelistRowDblClick"
                    @selection-change="handleCodelistSelectionChange"
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
                <el-form :model="filterForm" label-width="130px" class="info-form">
                  <!-- 第一行：混合了筛选器（CC码/壁厚等级/材料）和部分字段 -->
                  <el-row :gutter="20">
                    <el-col v-for="item in firstRowItems" :key="item.key" :span="6">
                      <el-form-item :label="item.label + '：'">
                        <el-select 
                          v-if="item.type === 'filter'" 
                          v-model="filterForm[item.modelKey]" 
                          style="width: 100%;"
                        >
                          <el-option 
                            v-for="opt in item.options" 
                            :key="opt" 
                            :label="opt" 
                            :value="opt" 
                          />
                        </el-select>
                        <el-input 
                          v-else 
                          :value="componentDetails[item.key]" 
                          readonly 
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <!-- 剩余字段：每行4列 -->
                  <template v-if="remainingDetailsFields.length > 0">
                    <el-row 
                      v-for="rowIdx in Math.ceil(remainingDetailsFields.length / 4)" 
                      :key="rowIdx" 
                      :gutter="20"
                    >
                      <el-col 
                        v-for="field in remainingDetailsFields.slice((rowIdx-1)*4, rowIdx*4)" 
                        :key="field.key" 
                        :span="6"
                      >
                        <el-form-item :label="field.label + '：'">
                          <el-input :value="componentDetails[field.key]" readonly />
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </template>
                </el-form>
              </div>
            </el-card>
            </template>

            <!-- 数据页签 -->
            <template v-if="isPipeProfessional">
            <div class="tabs-container">
              <el-tabs v-model="activeTab" class="data-tabs" type="border-card">
                <el-tab-pane label="公用端面数据" name="common">
                  <div
                    class="table-wrapper"
                    v-loading="commonLoading"
                    element-loading-text="加载中..."
                    element-loading-background="rgba(255, 255, 255, 0.65)"
                  >
                    <el-table 
                    ref="commonTableRef"
                    :data="commonData" 
                    v-show="commonReady"
                    border 
                    height="100%"
                    :row-class-name="tableRowClassName"
                    @row-click="handleRowClick"
                  >
                    <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                    <el-table-column 
                      v-for="col in visibleCommonColumns" 
                      :key="col.prop"
                      :prop="col.prop"
                      :label="col.label"
                      :min-width="col.minWidth"
                      show-overflow-tooltip
                    />
                  </el-table>
                </div>
              </el-tab-pane>
              <el-tab-pane v-if="showAppearanceGroup" label="外形重量重心描述" name="appearance">
                <div
                  class="table-wrapper"
                  v-loading="appearanceLoading"
                  element-loading-text="加载中..."
                  element-loading-background="rgba(255, 255, 255, 0.65)"
                >
                  <el-table 
                    ref="appearanceTableRef"
                    :data="appearanceData" 
                    v-show="appearanceReady"
                    border 
                    height="100%"
                    :row-class-name="tableRowClassName"
                    @row-click="handleAppearanceRowClick"
                  >
                    <el-table-column type="selection" width="55" :selectable="checkSelectable" />
                    <el-table-column 
                      v-for="col in visibleAppearanceColumns" 
                      :key="col.prop"
                      :prop="col.prop"
                      :label="col.label"
                      :min-width="col.minWidth"
                      show-overflow-tooltip
                    />
                  </el-table>
                </div>
              </el-tab-pane>
            </el-tabs>
              <!-- 公用端面数据 tab 页的按钮 -->
              <div class="tab-header-actions" v-if="activeTab === 'common'">
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
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
            <el-col :span="12">
              <el-form-item label="标准号">
                <el-select v-model="addBaseForm.manufacturingStd" placeholder="请选择标准号" style="width: 100%">
                  <el-option 
                    v-for="opt in (globalBaseOptions.manufacturingStdOptions || [])" 
                    :key="opt" :label="opt" :value="opt" 
                  />
                  <el-option v-if="!(globalBaseOptions.manufacturingStdOptions?.length)" label="加载中..." value="" disabled />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="CC码">
                <el-select v-model="addBaseForm.ccCode" placeholder="请选择CC码" style="width: 100%">
                  <el-option 
                    v-for="opt in globalBaseOptions.ccCodeOptions" 
                    :key="opt" :label="opt" :value="opt" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12" v-if="hasScheduleThicknessFilter">
              <el-form-item label="壁厚等级">
                <el-select v-model="addBaseForm.scheduleThickness" placeholder="请选择壁厚等级" style="width: 100%">
                  <el-option 
                    v-for="opt in globalBaseOptions.scheduleThicknessOptions" 
                    :key="opt" :label="opt" :value="opt" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="材料">
                <el-select v-model="addBaseForm.material" placeholder="请选择材料" style="width: 100%">
                  <el-option 
                    v-for="opt in globalBaseOptions.materialGradeOptions" 
                    :key="opt" :label="opt" :value="opt" 
                  />
                </el-select>
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
      <!-- Codelist 新增弹窗 -->
      <el-dialog v-model="codelistAddDialogVisible" title="新增 Codelist" width="600px">
        <el-form :model="codelistAddForm" label-width="120px">
          <el-form-item label="父级：">
            <el-input v-model="codelistAddForm.parent" readonly />
          </el-form-item>
          <el-form-item label="长描述：">
            <el-input v-model="codelistAddForm.longDesc" />
          </el-form-item>
          <el-form-item label="短描述：">
            <el-input v-model="codelistAddForm.shortDesc" />
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
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Search, Plus, FolderAdd, Folder, Document, 
  Upload, Download, CircleClose, Edit, Menu, CopyDocument, RefreshLeft,
  Fold, Expand, Back
} from '@element-plus/icons-vue'
import { 
  getLibraryTree, getCodelistTree, getComponentBaseData, getComponentCommonData, getComponentAppearanceData, 
  getCodelistTableData, disableRows, enableRows, getBaseOptions, saveComponentBase, getNextCodelistNumber
} from '@/apps/rule-configurator/features/library/api/library'

const route = useRoute()
const filterText = ref('')
const codelistFilterText = ref('')
const treeRef = ref(null)
const selectedNode = ref(null)
const activeTab = ref('common')
const treeData = ref([])
const treeLoading = ref(false)
const componentDetails = ref({})
const selectedCategory = ref('')
const commonColumns = ref([])
const appearanceColumns = ref([])
const commonData = ref([])
const appearanceData = ref([])
const baseRows = ref([])
const filterForm = ref({
  ccCode: '/',
  scheduleThickness: '/',
  materialGrade: '/'
})
const codelistTableData = ref([])
const commonTableRef = ref(null)
const appearanceTableRef = ref(null)
const codelistTableRef = ref(null)
const commonSelection = ref([])
const appearanceSelection = ref([])
const codelistSelection = ref([])
const isAsideCollapsed = ref(false)
const codelistLoading = ref(false)
const codelistUiLoading = computed(() => codelistLoading.value || !selectedNode.value)

// Codelist 新增弹窗相关
const codelistAddDialogVisible = ref(false)
const codelistAddForm = ref({ parent: '/', longDesc: '', shortDesc: '', codeNum: '' })
const codelistAddPlaceholder = ref('自动推荐一个空值，例如10001')

const computeCodelistParent = () => {
  if (!isCodelistLibrary.value || !selectedNode.value) return '/'
  const cat = String(selectedNode.value.category || '')
  if (cat === '1') return '/'
  if (cat === '2') {
    return currentLevel.value === 2 ? (layerFilters.value.practice || '/') : '/'
  }
  if (cat === '3') {
    if (currentLevel.value === 2) return layerFilters.value.practice || '/'
    if (currentLevel.value === 3) return layerFilters.value.category || '/'
    return '/'
  }
  return '/'
}

const openCodelistAddDialog = async () => {
  codelistAddForm.value = { parent: computeCodelistParent(), longDesc: '', shortDesc: '', codeNum: '' }
  codelistAddDialogVisible.value = true
  try {
    const res = await getNextCodelistNumber(selectedNode.value?.label || '', String(selectedNode.value?.category || ''), codelistAddForm.value.parent === '/' ? '' : codelistAddForm.value.parent)
    const nextNum = typeof res === 'object' && res?.nextCodeNum !== undefined ? res.nextCodeNum : res
    if (nextNum !== undefined && nextNum !== null) {
      codelistAddForm.value.codeNum = String(nextNum)
      codelistAddPlaceholder.value = ''
    } else {
      codelistAddPlaceholder.value = '自动推荐一个空值，例如10001'
    }
  } catch (error) {
    codelistAddPlaceholder.value = '自动推荐一个空值，例如10001'
  }
}

const handleSaveCodelistAdd = () => {
  const shortDesc = String(codelistAddForm.value.shortDesc || '').trim()
  const codeNum = String(codelistAddForm.value.codeNum || '').trim()
  if (!shortDesc) {
    ElMessage.warning('请填写短描述')
    return
  }
  if (!codeNum) {
    ElMessage.warning('请填写或确认 Codelist 值')
    return
  }
  const newRow = {
    shortDesc,
    longDesc: String(codelistAddForm.value.longDesc || '').trim(),
    codeNum,
    status: 1
  }
  
  // 根据当前层级将新项添加到正确的位置
  if (isCodelistLibrary.value && selectedNode.value) {
    const cat = String(selectedNode.value.category || '')
    // 如果不需要前端本地维护全量数据，只要刷新当前层级的表格即可
    codelistTableData.value = [...(codelistTableData.value || []), newRow]
    
    // 注意：在实际项目中，这里应该调用保存接口后，重新获取列表数据
    // await fetchCodelistDataForLevel(currentLevel.value, parent)
  } else {
    // 其他情况直接添加到表格
    codelistTableData.value = [...(codelistTableData.value || []), newRow]
  }
  
  codelistAddDialogVisible.value = false
  ElMessage.success('新增成功')
}
// 新增：全局基础选项（用于新增部件类型基础时的下拉限制）
const globalBaseOptions = ref({
  manufacturingStdOptions: [],
  ccCodeOptions: [],
  scheduleThicknessOptions: [],
  materialGradeOptions: []
})

const fetchGlobalBaseOptions = async () => {
  try {
    const res = await getBaseOptions()
    if (res) {
      Object.assign(globalBaseOptions.value, res)
    }
  } catch (error) {
    console.error('获取基础库全局选项失败:', error)
  }
}

// Codelist 3层关系逻辑
const currentLevel = ref(1)
const layerFilters = ref({
  practice: '/',
  category: '/'
})
const currentCodelistNumber = ref('/')
const practiceOptions = ref([])
const categoryOptions = ref([])
const levelNames = ref({ level1: 'Level1', level2: 'Level2', level3: 'Level3' })
// 废弃 hierarchyData，改为按需请求
// const hierarchyData = ref([])
const currentTableTitle = computed(() => {
  if (!selectedNode.value) return ''
  if (currentLevel.value === 1) return levelNames.value.level1 || 'Level1'
  if (currentLevel.value === 2) return levelNames.value.level2 || 'Level2'
  return levelNames.value.level3 || 'Level3'
})

const handleBackLevel = async () => {
  if (currentLevel.value === 3) {
    layerFilters.value.category = '/'
    // 返回第2层，需要重新请求第2层数据
    await fetchCodelistDataForLevel(2, layerFilters.value.practice)
  } else if (currentLevel.value === 2) {
    layerFilters.value.practice = '/'
    layerFilters.value.category = '/'
    // 返回第1层，重新请求第1层数据
    await fetchCodelistDataForLevel(1)
  }
}

// 获取指定层级的 Codelist 数据
const fetchCodelistDataForLevel = async (level, parentShortDesc = '') => {
  if (!selectedNode.value) return
  codelistLoading.value = true
  try {
    const res = await getCodelistTableData(selectedNode.value.label, parentShortDesc, level)
    if (res) {
      const rows = res.levelData || []
      codelistTableData.value = rows
      currentLevel.value = level
      
      // 更新下拉框选项
      if (level === 1) {
        practiceOptions.value = rows.filter(r => r.status !== 0).map(r => ({
          shortDesc: r.shortDesc,
          longDesc: r.longDesc,
          codeNum: r.codeNum
        }))
        categoryOptions.value = []
        currentCodelistNumber.value = '/'
      } else if (level === 2) {
        // 如果是第2层，更新第2层的下拉选项（即 categoryOptions）
        categoryOptions.value = rows.filter(r => r.status !== 0).map(r => ({
          shortDesc: r.shortDesc,
          longDesc: r.longDesc,
          codeNum: r.codeNum
        }))
        // 设置第1层下拉框对应的 Codelist Number
        const practice = practiceOptions.value.find(p => p.shortDesc === parentShortDesc)
        currentCodelistNumber.value = practice ? String(practice.codeNum ?? '/') : '/'
      } else if (level === 3) {
        // 设置第2层下拉框对应的 Codelist Number
        const category = categoryOptions.value.find(c => c.shortDesc === parentShortDesc)
        currentCodelistNumber.value = category ? String(category.codeNum ?? '/') : '/'
      }
    } else {
      codelistTableData.value = []
    }
  } catch (error) {
    console.error(`加载第${level}层Codelist数据失败:`, error)
    codelistTableData.value = []
  } finally {
    codelistLoading.value = false
  }
}

const toggleAside = () => {
  isAsideCollapsed.value = !isAsideCollapsed.value
}

const addDialogVisible = ref(false)
const addBaseDialogVisible = ref(false)
const addBaseForm = ref({
  manufacturingStd: '',
  ccCode: '',
  scheduleThickness: '',
  material: ''
})
const addForm = ref({})

// 将列按 [1] [2] 分组显示逻辑
const addFormRows = computed(() => {
  const columns = activeTab.value === 'common' ? visibleCommonColumns.value : visibleAppearanceColumns.value
  const rows = []
  const processedProps = new Set()
  const singleFields = []

  // 首先，提取所有成对的字段并将其放入行中
  columns.forEach(col => {
    if (processedProps.has(col.prop)) return
    const { base, index } = getPropBaseAndIndex(col.prop)
    if (index === 1) {
      const pairProp = `${base}[2]`
      const pairCol = columns.find(c => c.prop === pairProp)
      if (pairCol) {
        rows.push([col, pairCol])
        processedProps.add(col.prop)
        processedProps.add(pairProp)
      } else {
        singleFields.push(col)
        processedProps.add(col.prop)
      }
    } else if (!processedProps.has(col.prop)) {
      singleFields.push(col)
      processedProps.add(col.prop)
    }
  })

  // 现在，将剩余的单个字段分组到每行两个
  for (let i = 0; i < singleFields.length; i += 2) {
    if (i + 1 < singleFields.length) {
      rows.push([singleFields[i], singleFields[i + 1]])
    } else {
      rows.push([singleFields[i]])
    }
  }

  // 根据活动选项卡对行进行排序
  if (activeTab.value === 'common') {
    rows.sort((a, b) => {
      const aIsCC = a[0].prop === 'IndustryCommodityCode'
      const bIsCC = b[0].prop === 'IndustryCommodityCode'
      if (aIsCC) return -1
      if (bIsCC) return 1
      return 0
    })
  } else if (activeTab.value === 'appearance') {
    rows.sort((a, b) => {
      const aHasNumericSuffix = a[0].prop.includes('[')
      const bHasNumericSuffix = b[0].prop.includes('[')

      if (aHasNumericSuffix && !bHasNumericSuffix) return 1
      if (!aHasNumericSuffix && bHasNumericSuffix) return -1

      const aIsCC = a[0].prop === 'IndustryCommodityCode'
      const bIsCC = b[0].prop === 'IndustryCommodityCode'
      if (aIsCC) return -1
      if (bIsCC) return 1

      return 0
    })
  }

  return rows
})

const currentTitle = computed(() => route.meta.title || '基础库')
const isPipeProfessional = computed(() => route.name === 'PipeLibrary')
const isCodelistLibrary = computed(() => route.name === 'CodelistLibrary')

const defaultProps = {
  children: 'children',
  label: 'label',
}

// 将扁平路径数据转换为树结构
const transformPathsToTree = (paths) => {
  const root = []

  paths.forEach(item => {
    let fullPathStr = ''
    if (typeof item === 'string') {
      fullPathStr = item
    } else if (item.fullPath) {
      fullPathStr = item.fullPath
    } else if (item.level1) {
      fullPathStr = [item.level1, item.level2, item.level3, item.level4].filter(Boolean).join('|')
      item.fullPath = fullPathStr
    }

    if (!fullPathStr) return

    const parts = fullPathStr.split('|')
    let currentLevel = root
    let currentPathAccumulator = ''

    parts.forEach((partLabel, index) => {
      currentPathAccumulator = currentPathAccumulator ? `${currentPathAccumulator}|${partLabel}` : partLabel
      
      let existingNode = currentLevel.find(node => node.label === partLabel)
      
      if (!existingNode) {
        // Create new node
        existingNode = {
          label: partLabel,
          id: currentPathAccumulator,
          fullPath: currentPathAccumulator,
          children: []
        }
        
        // If it's the leaf node (last part), merge properties from the item
        if (index === parts.length - 1 && typeof item === 'object') {
           Object.assign(existingNode, item)
           // Ensure label and id are not overwritten if item has them differently (though usually they shouldn't)
           existingNode.label = partLabel
           existingNode.id = currentPathAccumulator
           // Ensure children is array
           if (!existingNode.children) existingNode.children = []
        }
        
        currentLevel.push(existingNode)
      }
      
      // Inherit category from item to all ancestors if not present
      if (typeof item === 'object' && item.category) {
          if (!existingNode.category) {
              existingNode.category = item.category
          }
      }

      currentLevel = existingNode.children
    })
  })

  // Recursive cleanup of empty children
  const cleanChildren = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        cleanChildren(node.children)
      }
    })
  }
  cleanChildren(root)

  // Handle root level empty children if root itself is empty (unlikely but safe)
  // No additional logic needed as cleanChildren handles the tree recursively from root items
  
  return root
}

// 初始化加载目录树
const loadTreeData = async () => {
  if (isPipeProfessional.value) {
    try {
      treeLoading.value = true
      const res = await getLibraryTree()
      if (Array.isArray(res) && res.length > 0) {
         treeData.value = transformPathsToTree(res)
      }
    } catch (error) {
      console.error('加载目录树失败:', error)
    } finally {
      treeLoading.value = false
    }
  } else if (isCodelistLibrary.value) {
    try {
      treeLoading.value = true
      const res = await getCodelistTree()
      if (Array.isArray(res) && res.length > 0) {
        treeData.value = transformPathsToTree(res)
      }
    } catch (error) {
      console.error('加载Codelist目录树失败:', error)
    } finally {
      treeLoading.value = false
    }
  }
}

onMounted(() => {
  loadTreeData()
  fetchGlobalBaseOptions()
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

// 字段映射表
const fieldLabels = {
  IndustryCommodityCode: 'CC码',
  ScheduleThickness: '壁厚等级',
  CommodityType: 'CommodityType',
  GeometricIndustryStandard: '标准号',
  MaterialGrade: '材料',
  GeometryType: 'GeometryType',
  BentAngle: '弯曲角度',
  PartDataBasis: 'PartDataBasis',
  PartClassName: 'PartClassName',
  UserClassName: 'UserClassName',
  BoltType: '螺栓类型',
  NominalDiameterFrom: '公称直径起始',
  NominalDiameterTo: '公称直径结束',
  NominalDiameter: '公称直径',
  NpdUnitType: '通径单位类型',
  GasketType: '垫片类型',
  ThicknessFor3DModel: '3D模型壁厚',
  ProcurementThickness: '采购壁厚',
  GasketOutsideDiameter: '垫片外径',
  GasketInsideDiameter: '垫片内径',
  FlangeFacing: '法兰密封面',
  NutType: '螺母类型',
  NutHeight: '螺母高度',
  WasherType: '垫圈类型',
  WasherThickness: '垫圈厚度'
}

const hiddenFields = ['GeometricIndustryStandard', 'GeometricindustryStandard']
const baseFilterFields = new Set(['IndustryCommodityCode', 'ScheduleThickness', 'MaterialGrade'])

const isBlankValue = (val) => {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') return val.trim() === ''
  return false
}

const componentDetailsFields = computed(() => {
  const rows = baseRows.value || []
  if (rows.length === 0) return []

  const getRowFieldLocal = (row, key) => {
    if (!row) return undefined
    if (row[key] !== undefined) return row[key]
    const target = String(key).toLowerCase()
    const found = Object.keys(row).find(k => String(k).toLowerCase() === target)
    return found ? row[found] : undefined
  }

  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach(k => set.add(k))
      return set
    }, new Set())
  )

  return keys
    .filter((key) => !hiddenFields.includes(key) && !baseFilterFields.has(key) && fieldLabels[key])
    .filter((key) => rows.some((r) => !isBlankValue(getRowFieldLocal(r, key))))
    .map((key) => ({
      key,
      label: fieldLabels[key] || key,
      value: componentDetails.value?.[key] ?? ''
    }))
})

const normalizeOptionList = (list) => {
  const normalized = (list || [])
    .map(v => (v === null || v === undefined) ? '' : String(v).trim())
    .filter(v => v.length > 0 && v !== '/')
  return ['/', ...Array.from(new Set(normalized))]
}

const getRowField = (row, key) => {
  if (!row) return undefined
  if (row[key] !== undefined) return row[key]
  const target = String(key).toLowerCase()
  const found = Object.keys(row).find(k => String(k).toLowerCase() === target)
  return found ? row[found] : undefined
}

const dedupeList = (arr) => Array.from(new Set((arr || [])
  .map(v => (v === null || v === undefined) ? '' : String(v).trim())
  .filter(v => v.length > 0 && v !== '/')))

const ccCodeOptions = computed(() => normalizeOptionList(dedupeList(baseRows.value.map(r => getRowField(r, 'IndustryCommodityCode')))))
const scheduleThicknessOptions = computed(() => normalizeOptionList(dedupeList(baseRows.value.map(r => getRowField(r, 'ScheduleThickness')))))
const materialGradeOptions = computed(() => normalizeOptionList(dedupeList(baseRows.value.map(r => getRowField(r, 'MaterialGrade')))))

const hasCcCodeFilter = computed(() => ccCodeOptions.value.length > 1)
const hasScheduleThicknessFilter = computed(() => scheduleThicknessOptions.value.length > 1)
const hasMaterialGradeFilter = computed(() => materialGradeOptions.value.length > 1)

const resolveBaseRow = () => {
  const rows = baseRows.value || []
  if (rows.length === 0) return {}

  const cc = filterForm.value.ccCode
  const st = filterForm.value.scheduleThickness
  const mg = filterForm.value.materialGrade

  let matched = rows
  if (cc && cc !== '/') matched = matched.filter(r => String(getRowField(r, 'IndustryCommodityCode') ?? '') === String(cc))
  if (st && st !== '/') matched = matched.filter(r => String(getRowField(r, 'ScheduleThickness') ?? '') === String(st))
  if (mg && mg !== '/') matched = matched.filter(r => String(getRowField(r, 'MaterialGrade') ?? '') === String(mg))

  const exact = matched[0]
  if (exact) return exact

  const templateKeys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach(k => set.add(k))
      return set
    }, new Set(['IndustryCommodityCode', 'ScheduleThickness', 'MaterialGrade']))
  )
  const result = {}
  templateKeys.forEach(k => { result[k] = '' })
  if (cc && cc !== '/') result.IndustryCommodityCode = cc
  else result.IndustryCommodityCode = getRowField(rows[0], 'IndustryCommodityCode') ?? ''
  if (st && st !== '/') result.ScheduleThickness = st
  else result.ScheduleThickness = getRowField(rows[0], 'ScheduleThickness') ?? ''
  if (mg && mg !== '/') result.MaterialGrade = mg
  else result.MaterialGrade = getRowField(rows[0], 'MaterialGrade') ?? ''
  return result
}

const firstRowItems = computed(() => {
  const items = []
  if (hasCcCodeFilter.value) {
    items.push({
      type: 'filter',
      key: 'IndustryCommodityCode',
      label: 'CC码',
      modelKey: 'ccCode',
      options: ccCodeOptions.value
    })
  }
  if (hasScheduleThicknessFilter.value) {
    items.push({
      type: 'filter',
      key: 'ScheduleThickness',
      label: '壁厚等级',
      modelKey: 'scheduleThickness',
      options: scheduleThicknessOptions.value
    })
  }
  if (hasMaterialGradeFilter.value) {
    items.push({
      type: 'filter',
      key: 'MaterialGrade',
      label: '材料',
      modelKey: 'materialGrade',
      options: materialGradeOptions.value
    })
  }
  const remainSlots = Math.max(0, 4 - items.length)
  const extraFields = componentDetailsFields.value.slice(0, remainSlots).map(f => ({
    type: 'field',
    key: f.key,
    label: f.label
  }))
  return [...items, ...extraFields]
})

const remainingDetailsFields = computed(() => {
  const usedFieldKeys = new Set(firstRowItems.value.filter(i => i.type === 'field').map(i => i.key))
  return componentDetailsFields.value.filter(f => !usedFieldKeys.has(f.key))
})

// 公用端面数据：前端固定列（与 SeamlessPipe 一致）
const COMMON_COLUMNS_STATIC = [
  { prop: 'IndustryCommodityCode', label: 'CC码' },
  { prop: 'NPD[1]', label: '端口1' },
  { prop: 'NpdUnitType[1]', label: '端口1单位' },
  { prop: 'PressureRating[1]', label: '压力1' },
  { prop: 'EndPreparation[1]', label: '端面连接形式1' },
  { prop: 'EndStandard[1]', label: '端面标准1' },
  { prop: 'ScheduleThickness[1]', label: '壁厚等级1' },
  { prop: 'FlowDirection[1]', label: '流向1' },
  { prop: 'NPD[2]', label: '端口2' },
  { prop: 'NpdUnitType[2]', label: '端口2单位' },
  { prop: 'PressureRating[2]', label: '压力2' },
  { prop: 'EndPreparation[2]', label: '端面连接形式2' },
  { prop: 'EndStandard[2]', label: '端面标准2' },
  { prop: 'ScheduleThickness[2]', label: '壁厚等级2' },
  { prop: 'FlowDirection[2]', label: '流向2' },
  { prop: 'GeometricIndustryStandard', label: '几何工业标准' }
]

// 外形重量重心描述：前端固定列
const APPEARANCE_COLUMNS_PIPE = [
  { prop: 'IndustryCommodityCode', label: 'CC码' },
  { prop: 'NPD[1]', label: '端口1' },
  { prop: 'NpdUnitType[1]', label: '端口1单位' },
  { prop: 'EndPreparation[1]', label: '端面连接形式1' },
  { prop: 'ScheduleThickness[1]', label: '壁厚等级1' },
  { prop: 'NPD[2]', label: '端口2' },
  { prop: 'NpdUnitType[2]', label: '端口2单位' },
  { prop: 'EndPreparation[2]', label: '端面连接形式2' },
  { prop: 'ScheduleThickness[2]', label: '壁厚等级2' },
  { prop: 'Density', label: '密度' },
  { prop: 'PurchaseLength', label: '采购长度' },
  { prop: 'MinimumPipeLength', label: '最小管长' },
  { prop: 'MaximumPipeLength', label: '最大管长' },
  { prop: 'WeightPerUnitLength', label: '单位长度重量' },
  { prop: 'PartDescription', label: '物资描述' },
  { prop: 'MaterialsMgmtIdent', label: '物资编码' }
]

const APPEARANCE_COLUMNS_PIPE_COMPONENT = [
  { prop: 'IndustryCommodityCode', label: 'CC码' },
  { prop: 'NPD[1]', label: '端口1' },
  { prop: 'NpdUnitType[1]', label: '端口1单位' },
  { prop: 'EndPreparation[1]', label: '端面连接形式1' },
  { prop: 'ScheduleThickness[1]', label: '壁厚等级1' },
  { prop: 'NPD[2]', label: '端口2' },
  { prop: 'NpdUnitType[2]', label: '端口2单位' },
  { prop: 'EndPreparation[2]', label: '端面连接形式2' },
  { prop: 'ScheduleThickness[2]', label: '壁厚等级2' },
  { prop: 'DryWeight', label: '干重' },
  { prop: 'DryCogX', label: 'DryCogX' },
  { prop: 'DryCogY', label: 'DryCogY' },
  { prop: 'DryCogZ', label: 'DryCogZ' },
  { prop: 'PartDescription', label: '物资描述' },
  { prop: 'MaterialsMgmtIdent', label: '物资编码' },
  { prop: 'BendRadius', label: '弯曲半径' }
]

const showAppearanceGroup = computed(() => {
  return selectedCategory.value === 'pipe' || selectedCategory.value === 'pipeComponent'
})

watch(showAppearanceGroup, (val) => {
  if (!val && activeTab.value === 'appearance') {
    activeTab.value = 'common'
  }
})

const getFilterParams = () => {
  const params = {}
  if (filterForm.value.ccCode && filterForm.value.ccCode !== '/') params.ccCode = filterForm.value.ccCode
  if (filterForm.value.scheduleThickness && filterForm.value.scheduleThickness !== '/') params.scheduleThickness = filterForm.value.scheduleThickness
  return params
}

const lastRequestContext = ref({ nodeLabel: '', category: '' })
const isApplyingFilterDefaults = ref(false)
const commonReady = ref(false)
const appearanceReady = ref(false)
const commonLoading = computed(() => !commonReady.value)
const appearanceLoading = computed(() => showAppearanceGroup.value && !appearanceReady.value)

const loadFullData = async ({ nodeLabel, category, resetFilters = false }) => {
  if (!nodeLabel) return
  
  // Set category immediately so showAppearanceGroup works
  selectedCategory.value = category || ''
  commonReady.value = false
  appearanceReady.value = false
  commonData.value = []
  appearanceData.value = []
  
  // Base Data
  const baseRes = await getComponentBaseData(nodeLabel, category)
  const rows = Array.isArray(baseRes) ? baseRes : (baseRes ? [baseRes] : [])
  baseRows.value = JSON.parse(JSON.stringify(rows))

  if (resetFilters) {
    const ccList = dedupeList(rows.map(r => getRowField(r, 'IndustryCommodityCode'))).filter(v => v && v !== '/')
    const stList = dedupeList(rows.map(r => getRowField(r, 'ScheduleThickness'))).filter(v => v && v !== '/')
    const mgList = dedupeList(rows.map(r => getRowField(r, 'MaterialGrade'))).filter(v => v && v !== '/')
    isApplyingFilterDefaults.value = true
    filterForm.value = {
      ccCode: ccList[0] ?? '/',
      scheduleThickness: stList[0] ?? '/',
      materialGrade: mgList[0] ?? '/'
    }
  }
  componentDetails.value = resolveBaseRow()
  
  const commonPromise = getComponentCommonData(nodeLabel, category, getFilterParams())
  const appearancePromise = showAppearanceGroup.value
    ? getComponentAppearanceData(nodeLabel, category, getFilterParams())
    : Promise.resolve(null)
  const [commonRes, appearanceRes] = await Promise.all([commonPromise, appearancePromise])
  isApplyingFilterDefaults.value = false

  // Common Data
  commonColumns.value = JSON.parse(JSON.stringify(COMMON_COLUMNS_STATIC))
  // 兼容后端仅返回 data 数组
  const commonRows = Array.isArray(commonRes) ? commonRes : (commonRes?.data || [])
  commonData.value = JSON.parse(JSON.stringify(commonRows))
  commonReady.value = true
  
  // Appearance Data (conditional)
  if (showAppearanceGroup.value) {
    // 固定列
    appearanceColumns.value = selectedCategory.value === 'pipe'
      ? JSON.parse(JSON.stringify(APPEARANCE_COLUMNS_PIPE))
      : JSON.parse(JSON.stringify(APPEARANCE_COLUMNS_PIPE_COMPONENT))
    // 兼容仅返回 data 数组
    const apRows = Array.isArray(appearanceRes) ? appearanceRes : (appearanceRes?.data || [])
    appearanceData.value = JSON.parse(JSON.stringify(apRows))
    appearanceReady.value = true
  } else {
    appearanceColumns.value = []
    appearanceData.value = []
    appearanceReady.value = false
  }
}

watch(
  () => [filterForm.value.ccCode, filterForm.value.scheduleThickness],
  async () => {
    if (isApplyingFilterDefaults.value) return
    if (!lastRequestContext.value.nodeLabel || !lastRequestContext.value.category) return
    try {
      await loadFullData({ nodeLabel: lastRequestContext.value.nodeLabel, category: lastRequestContext.value.category })
    } catch (error) {
      console.error('筛选加载失败:', error)
      ElMessage.error('筛选加载失败')
    }
  }
)

watch(
  () => filterForm.value.materialGrade,
  () => {
    if (isApplyingFilterDefaults.value) return
    componentDetails.value = resolveBaseRow()
  }
)

const excludedTableFieldBases = new Set(['JsonData', 'GeometricIndustryStandard', 'GeometricindustryStandard'])

const getPropBaseAndIndex = (prop) => {
  const match = typeof prop === 'string' ? prop.match(/^(.*)\[(\d+)\]$/) : null
  if (!match) return { base: prop, index: 0 }
  return { base: match[1], index: Number(match[2]) }
}

const normalizeColumns = (columns) => {
  const groups = new Map()
  const baseOrder = []

  ;(columns || []).forEach((col) => {
    const prop = col?.prop
    const { base, index } = getPropBaseAndIndex(prop)
    if (!groups.has(base)) {
      groups.set(base, [])
      baseOrder.push(base)
    }
    groups.get(base).push({ ...col, __index: index })
  })

  return baseOrder.flatMap((base) => {
    const cols = groups.get(base) || []
    return cols.sort((a, b) => (a.__index || 0) - (b.__index || 0)).map(({ __index, ...rest }) => rest)
  })
}

const isEmptyValue = (val) => {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') return val.trim() === ''
  return false
}

const isColumnAllEmpty = (prop, rows) => {
  if (!prop) return true
  if (!rows || rows.length === 0) return false
  return rows.every((row) => isEmptyValue(row?.[prop]))
}

const getVisibleColumns = (columns, rows) => {
  return normalizeColumns(columns)
    .filter((col) => {
      const prop = col?.prop
      const { base } = getPropBaseAndIndex(prop)
      return prop && !excludedTableFieldBases.has(base)
    })
    .map((col) => ({
      ...col,
      label: col.label || col.prop,
      minWidth: col.minWidth || 140
    }))
}

const emptyCommonColumnProps = computed(() => {
  const emptyProps = new Set()
  if (!commonData.value || commonData.value.length === 0) return emptyProps
  visibleCommonColumns.value.forEach(col => {
    if (isColumnAllEmpty(col.prop, commonData.value)) {
      emptyProps.add(col.prop)
    }
  })
  return emptyProps
})

const emptyAppearanceColumnProps = computed(() => {
  const emptyProps = new Set()
  if (!appearanceData.value || appearanceData.value.length === 0) return emptyProps
  visibleAppearanceColumns.value.forEach(col => {
    if (isColumnAllEmpty(col.prop, appearanceData.value)) {
      emptyProps.add(col.prop)
    }
  })
  return emptyProps
})

const cellStyle = ({ row, column }) => {
  if (row.status === 0) {
    return null
  }
  return null
}


const visibleCommonColumns = computed(() => getVisibleColumns(commonColumns.value, commonData.value))
const visibleAppearanceColumns = computed(() => getVisibleColumns(appearanceColumns.value, appearanceData.value))

const isAllDisabled = computed(() => {
  if (isCodelistLibrary.value) {
    if (codelistSelection.value.length === 0) return false
    return codelistSelection.value.every(row => row.status === 0)
  }
  // 管系专业仅 外形重量重心描述 页签有禁用按钮
  if (isPipeProfessional.value && activeTab.value === 'appearance') {
    if (appearanceSelection.value.length === 0) return false
    return appearanceSelection.value.every(row => row.status === 0)
  }
  return false
})

const statusButtonText = computed(() => isAllDisabled.value ? '恢复' : '禁用')
const statusButtonIcon = computed(() => isAllDisabled.value ? RefreshLeft : CircleClose)
const statusButtonType = computed(() => isAllDisabled.value ? 'success' : 'danger')

const isFolder = (node, data) => {
  if (isCodelistLibrary.value) {
    // Codelist 1层为文件夹，2层为叶子
    return node.level < 2
  }
  if (isPipeProfessional.value) {
    // 管系专业 1, 2, 3层为文件夹，4层为叶子
    return node.level < 4
  }
  return !!data.children
}

const handleNodeClick = async (data, node) => {
  // 只有叶子节点可以点击加载数据
  if (!isFolder(node, data)) {
    selectedNode.value = data
    if (isPipeProfessional.value) {
      try {
        // 使用预处理好的唯一路径ID
        const fullPath = data.fullPath || data.id
        const category = data.category
        lastRequestContext.value = { nodeLabel: fullPath, category }
        await loadFullData({ nodeLabel: fullPath, category, resetFilters: true })
      } catch (error) {
        console.error('加载节点详情失败:', error)
        selectedCategory.value = ''
        baseRows.value = []
        filterForm.value = { ccCode: '/', scheduleThickness: '/', materialGrade: '/' }
        commonColumns.value = []
        appearanceColumns.value = []
        componentDetails.value = {}
        commonData.value = []
        appearanceData.value = []
        ElMessage.error('加载节点详情失败')
      }
    } else if (isCodelistLibrary.value) {
      try {
        codelistLoading.value = true
        
        const res = await getCodelistTableData(data.label, '', 1)
        if (res) {
          const count = res.count || 1
          data.category = String(count) // 同步更新树节点的category，以匹配UI判断
          
          if (count === 3 || count === 2) {
            levelNames.value = { 
              level1: res.level1 || 'Level1', 
              level2: res.level2 || 'Level2', 
              level3: res.level3 || 'Level3' 
            }
            layerFilters.value = { practice: '/', category: '/' }
            currentCodelistNumber.value = '/'
            
            const rows = res.levelData || []
            codelistTableData.value = rows
            practiceOptions.value = rows.filter(r => r.status !== 0).map(r => ({ shortDesc: r.shortDesc, longDesc: r.longDesc, codeNum: r.codeNum }))
            categoryOptions.value = []
            currentLevel.value = 1
          } else {
            codelistTableData.value = res.levelData || []
          }
        } else {
          codelistTableData.value = []
        }
      } catch (error) {
        console.error('加载Codelist表格失败:', error)
        codelistTableData.value = []
      } finally {
        codelistLoading.value = false
      }
    } else {
      // 其他专业暂无数据加载逻辑
      componentDetails.value = {}
      selectedCategory.value = ''
      commonColumns.value = []
      appearanceColumns.value = []
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

const handleCodelistSearch = async () => {
  const tableRef = codelistTableRef.value
  if (!tableRef) return

  tableRef.clearSelection()

  const keyword = String(codelistFilterText.value ?? '').trim()
  if (!keyword) return

  const rows = codelistTableData.value || []
  const needle = keyword.toLowerCase()
  const matches = rows.filter((r) => {
    if (r.status === 0) return false
    const s = String(r?.shortDesc ?? '').toLowerCase()
    const l = String(r?.longDesc ?? '').toLowerCase()
    const c = String(r?.codeNum ?? '').toLowerCase()
    return s.includes(needle) || l.includes(needle) || c.includes(needle)
  })

  if (matches.length === 0) {
    ElMessage.warning('未找到匹配行')
    return
  }

  matches.forEach((r) => {
    tableRef.toggleRowSelection(r, true)
  })
  tableRef.setCurrentRow(matches[0])

  await nextTick()
  const tableEl = tableRef.$el
  const bodyWrapper = tableEl?.querySelector?.('.el-table__body-wrapper tbody')
  const rowEls = bodyWrapper?.querySelectorAll?.('tr')
  const targetIndex = rows.indexOf(matches[0])
  const targetEl = targetIndex >= 0 ? rowEls?.[targetIndex] : null
  targetEl?.scrollIntoView?.({ block: 'center' })
}

const handleCodelistRowDblClick = (row) => {
  if (!row) return
  if (!isCodelistLibrary.value) return
  if (!selectedNode.value) return

  const nodeCategory = String(selectedNode.value.category ?? '')
  if (nodeCategory !== '2' && nodeCategory !== '3') return

  const shortDesc = String(row.shortDesc ?? '').trim()
  if (!shortDesc || shortDesc === '/') return

  if (currentLevel.value === 1) {
    layerFilters.value.practice = shortDesc
    return
  }

  if (currentLevel.value === 2 && nodeCategory === '3') {
    layerFilters.value.category = shortDesc
  }
}

const handleCommonSelectionChange = (selection) => {
  commonSelection.value = selection
}

const handleAppearanceSelectionChange = (selection) => {
  appearanceSelection.value = selection
}

const handleCodelistSelectionChange = (selection) => {
  codelistSelection.value = selection
}

const tableRowClassName = ({ row }) => {
  if (row.status === 0) {
    return 'disabled-row'
  }
  return ''
}

// 根据筛选重算 options 与表格 (废弃本地全量过滤，改为调接口)
const recomputeCodelistView = async () => {
  if (!selectedNode.value) return
  const nodeCategory = String(selectedNode.value.category ?? '')
  if (nodeCategory !== '2' && nodeCategory !== '3') return

  if (!layerFilters.value.practice || layerFilters.value.practice === '/') {
    layerFilters.value.category = '/'
    await fetchCodelistDataForLevel(1)
    return
  }
  
  if (!layerFilters.value.category || layerFilters.value.category === '/') {
    await fetchCodelistDataForLevel(2, layerFilters.value.practice)
    return
  }
  
  if (nodeCategory === '3') {
    await fetchCodelistDataForLevel(3, layerFilters.value.category)
  }
}

// 废弃 watch layerFilters 的自动更新（通过 select 的 change 事件触发）
// watch(() => [layerFilters.value.practice, layerFilters.value.category], () => {
//   if (selectedNode.value && isCodelistLibrary.value && (selectedNode.value.category === '3' || selectedNode.value.category === '2')) {
//     recomputeCodelistView()
//   }
// })

const handleToggleStatus = async () => {
  let tableRef = null
  let selection = []
  
  if (isCodelistLibrary.value) {
    tableRef = codelistTableRef.value
    selection = codelistSelection.value
  } else if (activeTab.value === 'appearance') {
    tableRef = appearanceTableRef.value
    selection = appearanceSelection.value
  }
  
  if (!selection || selection.length === 0) {
    ElMessage.warning('请先选择要操作的行')
    return
  }

  const isAllDisabledCurrent = selection.every(row => row.status === 0)
  
  if (isAllDisabledCurrent) {
    // 恢复操作
    try {
      if (isCodelistLibrary.value) {
        // Mock 禁用接口暂不支持 Codelist，仅前端模拟
        selection.forEach(row => { row.status = 1 })
        // 由于改为按需加载，这里仅更新当前表格数据即可
        codelistTableData.value = [...codelistTableData.value]
      } else if (activeTab.value === 'appearance') {
        await enableRows(selection)
        selection.forEach(row => {
          row.status = 1
        })
        appearanceData.value = [...appearanceData.value]
        appearanceTableRef.value?.doLayout()
      }
      ElMessage.success('恢复成功')
    } catch (error) {
      console.error('恢复失败:', error)
      ElMessage.error('恢复失败')
    }
  } else {
    // 禁用操作
    try {
      if (isCodelistLibrary.value) {
        selection.forEach(row => { row.status = 0 })
        codelistTableData.value = [...codelistTableData.value]
      } else if (activeTab.value === 'appearance') {
        await disableRows(selection)
        selection.forEach(row => {
          row.status = 0
        })
        appearanceData.value = [...appearanceData.value]
        appearanceTableRef.value?.doLayout()
      }
      ElMessage.success('禁用成功')
    } catch (error) {
      console.error('禁用失败:', error)
      ElMessage.error('禁用失败')
    }
  }
  
  // 清除选择状态
  if (tableRef) tableRef.clearSelection()
}

const handleAddBase = () => {
  addBaseForm.value = {
    manufacturingStd: componentDetails.value.GeometricIndustryStandard || '',
    ccCode: filterForm.value.ccCode !== '/' ? filterForm.value.ccCode : '',
    scheduleThickness: filterForm.value.scheduleThickness !== '/' ? filterForm.value.scheduleThickness : '',
    material: filterForm.value.materialGrade !== '/' ? filterForm.value.materialGrade : ''
  }
  addBaseDialogVisible.value = true
}

const handleSaveAddBase = async () => {
  if (!addBaseForm.value.manufacturingStd) {
    ElMessage.warning('请选择标准号')
    return
  }

  const oldStd = componentDetails.value.GeometricIndustryStandard || ''
  const isSaveAs = oldStd && oldStd !== addBaseForm.value.manufacturingStd

  try {
    const payload = {
      isSaveAs,
      newNodeData: addBaseForm.value,
      oldNodeLabel: selectedNode.value?.fullPath || selectedNode.value?.label || '',
      category: selectedNode.value?.category || ''
    }

    const res = await saveComponentBase(payload)
    
    if (isSaveAs) {
      ElMessage.success('标准号已变更，已为您另存为新记录并复制相关数据')
      // 重新加载目录树以显示新路径
      await loadTreeData()
      addBaseDialogVisible.value = false
      // 另存为后，建议清除当前选中，让用户去新路径查看
      selectedNode.value = null
    } else {
      ElMessage.success('新增部件类型基础成功')
      // 刷新当前数据
      if (selectedNode.value) {
        await loadFullData({ 
          nodeLabel: selectedNode.value.fullPath || selectedNode.value.label, 
          category: selectedNode.value.category 
        })
      }
      addBaseDialogVisible.value = false
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleAdd = () => {
  let selectedRows = []
  const columns = activeTab.value === 'common' ? visibleCommonColumns.value : visibleAppearanceColumns.value
  
  if (activeTab.value === 'common' && commonTableRef.value) {
    selectedRows = commonTableRef.value.getSelectionRows()
  } else if (activeTab.value === 'appearance' && appearanceTableRef.value) {
    selectedRows = appearanceTableRef.value.getSelectionRows()
  }

  const newForm = {}
  // 初始化所有列的 key
  columns.forEach(col => {
    newForm[col.prop] = ''
  })

  if (selectedRows && selectedRows.length > 0) {
    // 预填充选中行数据
    const row = selectedRows[0]
    Object.keys(newForm).forEach(key => {
      newForm[key] = row[key] ?? ''
    })
  } else {
    // 设置默认 CC 码
    if (filterForm.value.ccCode && filterForm.value.ccCode !== '/') {
      newForm.IndustryCommodityCode = filterForm.value.ccCode
    }
  }

  addForm.value = newForm
  addDialogVisible.value = true
}

const handleSaveAdd = () => {
  // Push new data to the correct table based on active tab
  if (activeTab.value === 'common') {
    commonData.value.push({ ...addForm.value, status: 1 })
  } else if (activeTab.value === 'appearance') {
    appearanceData.value.push({ ...addForm.value, status: 1 })
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

.aside-toggle-button {
  margin-right: 8px;
  font-size: 18px;
  color: #606266;
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
  cursor: not-allowed;
  color: #909399;
}

:deep(.el-table .el-table__row.disabled-row td.el-table__cell) {
  background-color: #e4e7ed;
}

:deep(.el-table .el-table__row.disabled-row:hover td.el-table__cell) {
  background-color: #e4e7ed;
}

:deep(.el-table .el-table__row:not(.disabled-row):hover td.el-table__cell) {
  background-color: #f5f7fa;
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

.three-layer-card {
  display: flex;
  flex-direction: column;
}

.filter-section {
  background-color: #f5f7fa; /* 灰色背景 */
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.filter-form {
  max-width: 800px;
}

.read-only-input :deep(.el-input__wrapper) {
  background-color: #ffffff;
  box-shadow: none !important;
  border: 1px solid #dcdfe6;
}

.read-only-input :deep(.el-input__inner) {
  cursor: default;
  color: #606266;
}

.table-section-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 10px;
}

.table-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 5px;
}

.table-title {
  font-weight: bold;
  font-size: 15px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}
</style>
