<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  dimensionData: {
    type: Array,
    default: () => []
  },
  columnCount: {
    type: Number,
    default: 15
  },
  preferredRule: {
    type: [String, Number, Object],
    default: null
  },
  preferredRuleLoading: {
    type: Boolean,
    default: false
  },
  preferredRuleOptions: {
    type: Array,
    default: () => []
  },
  getCellStyle: {
    type: Function,
    required: true
  },
  handleCellClick: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:preferredRule'])

const handleRuleChange = (val) => {
  emit('update:preferredRule', val)
}
</script>

<template>
  <div class="form-section-pmc">
    <el-row class="form-section-pmc" :gutter="20">
      <el-col :span="8">
        <el-form-item label="优选规则" label-width="80px">
          <el-select
            :model-value="preferredRule"
            @update:model-value="handleRuleChange"
            placeholder="请选择优选规则"
            size="small"
            clearable
            :loading="preferredRuleLoading"
            style="width: 200px"
          >
            <el-option
              v-for="rule in preferredRuleOptions"
              :key="rule.value"
              :label="rule.label"
              :value="rule.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div style="width: 95%; overflow-x: auto; max-width: 95%;">
          <el-table 
            :data="dimensionData" 
            style="width: 100%; min-width: 1000px;" 
            :show-header="false" 
            id="npd-dataTable"
            @cell-click="handleCellClick"
          >
            <el-table-column prop="name" label="参数" width="100" fixed="left">
              <template #header-cell>
                <span style="font-weight: bold;"></span>
              </template>
              <template #default="{ row }">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column v-for="i in columnCount" :key="'col-' + i" :label="String(i)" :prop="'col' + i" width="66">
              <template #default="{ row, column }">
                <span 
                  :style="getCellStyle(row, column)"
                >
                  {{ row[column.property] || '-' }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.form-section-pmc {
  margin-bottom: 20px;
}

/* 通径外径壁厚对照表格样式 - 实现颜色连续跨越和圆角效果 */
#npd-dataTable :deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

/* 表格单元格基础样式 */
#npd-dataTable :deep(.el-table__body td) {
  padding: 0 !important;
  border-right: 1px solid #ebeef5;
  position: relative;
  vertical-align: middle;
}

/* 确保单元格内容容器可定位 */
#npd-dataTable :deep(.el-table__body td .el-table__cell) {
  padding: 0 !important;
  height: 100%;
  position: relative;
}

/* 所有span元素基础样式 */
#npd-dataTable :deep(.el-table__body td .el-table__cell > span) {
  display: block;
  min-height: 40px;
  line-height: 40px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}

/* 对于选中范围内的单元格（有负边距的），使用绝对定位覆盖边框 */
#npd-dataTable :deep(.el-table__body td .el-table__cell > span[style*="margin-right: -1px"]),
#npd-dataTable :deep(.el-table__body td .el-table__cell > span[style*="marginRight: -1px"]) {
  position: absolute !important;
  top: 0;
  left: 0;
  right: -1px; /* 延伸到下一个单元格，覆盖边框 */
  width: auto !important;
  height: 100%;
  z-index: 2;
  margin-right: 0 !important; /* 移除负边距，改用right定位 */
}

/* 第一个选中单元格，左侧圆角 */
#npd-dataTable :deep(.el-table__body td .el-table__cell > span[style*="border-radius: 4px 0 0 4px"]),
#npd-dataTable :deep(.el-table__body td .el-table__cell > span[style*="borderRadius: 4px 0 0 4px"]) {
  left: 0;
  right: -1px;
}

/* 最后一个选中单元格，右侧圆角 */
#npd-dataTable :deep(.el-table__body td .el-table__cell > span[style*="border-radius: 0 4px 4px 0"]),
#npd-dataTable :deep(.el-table__body td .el-table__cell > span[style*="borderRadius: 0 4px 4px 0"]) {
  left: 0;
  right: 0;
}

/* 单个选中单元格，四个角都圆角 */
#npd-dataTable :deep(.el-table__body td .el-table__cell > span[style*="border-radius: 4px"]),
#npd-dataTable :deep(.el-table__body td .el-table__cell > span[style*="borderRadius: 4px"]) {
  left: 0;
  right: 0;
}
</style>
