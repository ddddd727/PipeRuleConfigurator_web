<script setup>
import { ref, computed } from 'vue'
import PipeSpecConfigForm from '@/components/PipeSpecConfigForm.vue'    // 导入 PipeSpecConfigForm 组件，用于配置按钮的弹窗实现

// 树形数据
const treeData = ref([
  {
    label: 'PMC编码',
    children: [
      {label : '主材料',
      children: [{
        label: '管材标准',
        children:[{ label: '1C181AD' },
                  { label: '1C181AE' },
                  { label: '1C181AJ' },
                  { label: '1C181BD' },
                  { label: '1C181BE' },
                  { label: '1C181BJ' },
                  { label: '1C181CE' },
                  { label: '1C191DD' }]
              }]}
    ]
  }
])

// 当前选中的树形节点
const currentNode = ref({ label: 'Piping Specification' })

// 处理树形节点点击
const handleNodeClick = (data) => {
  currentNode.value = data
}

// 处理表格单元格点击
const handleCellClick = (row, column, cell, event) => {
  if (row.name !== 'NPD') return
  
  const value = parseInt(row[column.property])
  
  // 第一次点击设置最小值，第二次点击设置最大值
  if (selectedMin.value === null) {
    selectedMin.value = value
    selectedMax.value = null
  } else if (selectedMax.value === null) {
    if (value < selectedMin.value) {
      selectedMax.value = selectedMin.value
      selectedMin.value = value
    } else {
      selectedMax.value = value
    }
  } else {
    // 重置选择
    selectedMin.value = value
    selectedMax.value = null
  }
}

// 计算单元格背景色
const getCellBackgroundColor = (row, column) => {
  if (row.name !== 'NPD') return ''
  
  const value = parseInt(row[column.property])
  
  if (selectedMin.value !== null && selectedMax.value !== null) {
    if (value >= selectedMin.value && value <= selectedMax.value) {
      return '#90EE90' // 浅绿色
    } else {
      return '#FFFFE0' // 淡黄色
    }
  } else if (selectedMin.value !== null && value === selectedMin.value) {
    return '#90EE90' // 浅绿色
  }
  
  return '#FFFFE0' // 默认淡黄色
}

// 管材通道通径、外径、壁厚数据
const dimensionData = ref([
   { name: 'NPD', col1: '4', col2: '5', col3: '6', col4: '8', col5: '10', col6: '15', col7: '20', col8: '25', col9: '32', col10: '40', col11: '50', col12: '65', col13: '80', col14: '100', col15: '125' },
  { name: 'OD', col1: '6', col2: '8', col3: '10', col4: '12', col5: '15', col6: '20', col7: '25', col8: '88.9', col9: '114.3', col10: '141.3', col11: '168.3', col12: '219.1', col13: '273.0', col14: '323.9', col15: '355.6' },
  { name: 'Thickness', col1: '1.2', col2: '1.2', col3: '1.2', col4: '1.5', col5: '1.5', col6: '1.5', col7: '1.8', col8: '5.49', col9: '6.02', col10: '6.55', col11: '7.11', col12: '8.18', col13: '9.27', col14: '10.31', col15: '10.31' },
])

// 选择范围变量
const selectedMin = ref(null)
const selectedMax = ref(null)

const showDialog = ref(false)

// 当前选中的按钮Label
const currentButtonLabel = ref('')

// 计算属性：根据NPD表格选中的范围生成过滤后的通径范围数据
const filteredNpdRanges = computed(() => {
  if (selectedMin.value === null || selectedMax.value === null) {
    return []
  }
  
  // 生成唯一的ID
  const id = Date.now()
  
  // 返回包含最小和最大通径的范围数据
  return [
    {
      id: id,
      minSize: selectedMin.value,
      maxSize: selectedMax.value,
      name: `通径范围: ${selectedMin.value} - ${selectedMax.value}`
    }
  ]
})

// 处理配置确认
const handleConfirm = (data) => {
  console.log('配置确认:', data)
}

// 处理配置按钮点击
const handleConfigClick = (label) => {
  currentButtonLabel.value = label
  showDialog.value = true
}
</script>

<template>
  <div class="pipe-spec-container">
    <div class="pipe-spec-content">
      <!-- 左侧PMC编码选择树形结构 -->
      <div class="pipe-spec-sidebar">
        <div class="sidebar-header">
          <el-select placeholder="船级" style="width: 90px; margin-right: 10px;">
            <el-option label="船级1" value="1" />
            <el-option label="船级2" value="2" />
          </el-select>
          <el-select placeholder="船号" style="width: 90px;">
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
                <el-col :span="8">
                  <el-form-item label="Service" label-width="80px">
                    <el-input style="width: 200px;" :disabled="true" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="PipingMaterial Class" label-width="150px">
                    <el-input style="width: 200px;" :disabled="true" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Pipe" label-width="150px">
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
                  <el-form-item label="Pressure Class" label-width="150px">
                    <el-input style="width: 200px;" :disabled="true" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Wall Thickness" label-width="150px">
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
                    <el-table 
                      :data="dimensionData" 
                      style="width: auto;" 
                      :show-header="false" 
                      id="npd-dataTable"
                      @cell-click="handleCellClick"
                    >
                      <el-table-column prop="name" label="参数" width="100">
                        <template #header-cell>
                          <span style="font-weight: bold;"></span>
                        </template>
                        <template #default="{ row }">
                          <span>{{ row.name }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column v-for="i in 15" :key="'col-' + i" :label="i" :prop="'col' + i" width="66">
                        <template #default="{ row, column }">
                          <span 
                            :style="{ 
                              backgroundColor: getCellBackgroundColor(row, column),
                              cursor: row.name === 'NPD' ? 'pointer' : 'default',
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              padding: '8px 0',
                              textAlign: 'center'
                            }"
                          >
                            {{ row[column.property] || '-' }}
                          </span>
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
                    <el-form-item label="BEND" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button type="primary" @click="handleConfigClick('BEND')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="RED" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('RED')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="TEE" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('TEE')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="FLANGE" label-width="80px">  
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('FLANGE')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="SLEEVE" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('SLEEVE')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Joints" label-width="80px">    
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Joints')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Blind flange" label-width="100px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Blind flange')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Gasket" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Gasket')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Bolts" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Bolts')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Nuts" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Nuts')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Washers" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Washers')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Crosses" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Crosses')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Saddles" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Saddles')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Caps" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Caps')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="Accessories" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Accessories')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="Overpass" label-width="80px">
                      <div style="display: flex; align-items: flex-start;">
                        <el-input type="textarea" :rows="3" :disabled="true" style="flex: 1; margin-right: 10px;" placeholder="多行文本显示" />
                        <el-button @click="handleConfigClick('Overpass')">配置</el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <PipeSpecConfigForm
      v-model:modelValue="showDialog"
      :pathRanges="filteredNpdRanges"
      :buttonLabel="currentButtonLabel"
      @confirm="handleConfirm"
    />
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