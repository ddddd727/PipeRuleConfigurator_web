<script setup>
import { ref } from 'vue'

// 树形数据
const treeData = ref([
  {
    label: 'PMC编码',
    children: [
      { label: '1C181AD' },
      { label: '1C181AE' },
      { label: '1C181AJ' },
      { label: '1C181BD' },
      { label: '1C181BE' },
      { label: '1C181BJ' },
      { label: '1C181CE' },
      { label: '1C191DD' }
    ]
  }
])

// 当前选中的树形节点
const currentNode = ref({ label: 'Piping Specification' })

// 处理树形节点点击
const handleNodeClick = (data) => {
  currentNode.value = data
}

// 尺寸信息表格数据
const dimensionData = ref([
  { name: 'NPS', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '', col9: '', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '' },
  { name: 'OD', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '', col9: '', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '' },
  { name: 'Thickness', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '', col9: '', col10: '', col11: '', col12: '', col13: '', col14: '', col15: '' }
])

// 表单数据
const formData = ref({})
</script>

<template>
  <div class="pipe-spec-container">
    <div class="pipe-spec-content">
      <!-- 左侧树形结构 -->
      <div class="pipe-spec-sidebar">
        <div class="sidebar-header">
          <el-select placeholder="船级" style="width: 80px; margin-right: 10px;">
            <el-option label="船级1" value="1" />
            <el-option label="船级2" value="2" />
          </el-select>
          <el-select placeholder="船号" style="width: 80px;">
            <el-option label="船号1" value="1" />
            <el-option label="船号2" value="2" />
          </el-select>
        </div>
        <div class="sidebar-tree">
          <el-tree
            :data="treeData"
            :highlight-current="true"
            @node-click="handleNodeClick">
            <template #default="{ node }">
              <div class="custom-tree-node">
                <span class="tree-label">{{ node.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="pipe-spec-main">
        <!-- 顶部操作条 -->
        <div class="main-header">
          <div class="filter-section">
            <el-button type="primary" style="margin-right: 10px;">查询</el-button>
            <el-button type="info" style="margin-right: 10px;">编辑</el-button>
            <el-button type="success" style="margin-right: 10px;">保存</el-button>
            <el-button type="warning">生成规格书</el-button>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="form-container">
          <h3>Piping Specification</h3>
          <el-form :model="formData" class="spec-form" label-position="left">
            <el-form-item label-width="0" prop="">
              <el-row class="form-section-pmc" :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Service" label-width="80px">
                    <el-input style="width: 200px;" :disabled="true" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="PipingMaterial Class" label-width="auto">
                    <el-input style="width: 200px;" :disabled="true" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="form-section-pmc" :gutter="20">
                <el-col :span="8">
                  <el-form-item label="Material" label-width="80px">
                    <el-input style="width: 200px;" :disabled="true" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Pressure Class" label-width="auto">
                    <el-input style="width: 200px;" :disabled="true" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Wall Thickness" label-width="auto">
                    <el-input style="width: 200px;" :disabled="true" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>

            <!-- 管系规格书的通径外径壁厚对照表格 -->
            <el-form-item label-width="0" prop="">
              <div class="form-section-pmc">
                <el-row>
                  <el-col :span="24">
                    <el-table :data="dimensionData" border style="width: auto;" :show-header="false" id="npd-dataTable">
                      <el-table-column prop="name" label="参数" width="100" align="center">
                        <template #header-cell>
                          <span style="font-weight: bold;"></span>
                        </template>
                      </el-table-column>
                      <el-table-column v-for="i in 15" :key="'col-' + i" :label="i" width="66" align="center">
                        <template #default="{ row, $index }">
                          <span>{{ row['col' + i] || '-' }}</span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>

            <!-- 管件选择 -->
            <el-form-item label-width="0" prop="">
              <div class="form-section">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="PIPE" label-width="80px">
                      <el-input :disabled="true" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="RED" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1"/>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="TEE" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="FLANGE" label-width="80px">  
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="SLEEVE" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Joints" label-width="80px">    
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Blind flange" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Gasket" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Bolts" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Nuts" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Washers" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Crosses" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Saddles" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Caps" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Accessories" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Overpass" label-width="80px">
                      <el-select>
                        <el-option label="选项1" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pipe-spec-container {
  height: 100%;
  padding: 0;
  background-color: #fff;
}

.pipe-spec-content {
  display: flex;
  height: 100%;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}

/* 左侧树形结构 */
.pipe-spec-sidebar {
  width: 240px;
  border-right: 1px solid #e6e8eb;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e6e8eb;
  background-color: #fafafa;
}

.sidebar-tree {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.custom-tree-node {
  display: flex;
  align-items: center;
}

.tree-label {
  font-size: 14px;
}

/* 右侧表单区域 */
.pipe-spec-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
}

.main-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e6e8eb;
  background-color: #fafafa;
}

.filter-section {
  display: flex;
  align-items: center;
}

/* 表单容器 */
.form-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.form-container h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.spec-form {
  background-color: transparent;
  justify-content: center;
}

.form-section {
  margin-bottom: 20px;
  width: 100%;
}

.form-section-pmc{
  margin-bottom: 20px;
}

.form-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

/* ElementPlus表单样式调整 */
.spec-form .el-form {
  margin: 0;
}

.spec-form .el-form-item {
  margin-bottom: 0;
}

/* 调整行间距 */
.spec-form .el-row {
  margin-bottom: 15px;
}

/* 调整列间距 */
.spec-form .el-col {
  margin-bottom: 10px;
}

/* 表单控件基础样式 */
.spec-form .el-input,
.spec-form .el-select {
  /* 默认宽度为100%，但允许通过内联样式或特定类名覆盖 */
  width: 100%;
  max-width: none;
}

/* 允许通过内联style属性控制宽度 */
.spec-form .el-input[style*="width"],
.spec-form .el-select[style*="width"] {
  width: auto;
}
</style>