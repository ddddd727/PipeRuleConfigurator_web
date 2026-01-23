<template>
  <el-dialog
    v-model="isVisible"
    title="管系规格书预览"
    width="90%"
    top="2vh"
    destroy-on-close
    class="pipe-spec-preview-dialog"
  >
    <!-- 工具条 -->
    <div class="toolbar">
      <div class="toolbar-buttons">
        <el-button type="primary" plain>
          规格书信息确认
        </el-button>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-content">
      <!-- 暂时空白占位，用于展示管系规格书内容 -->
      <div class="preview-placeholder">
        <ExcelPreview :template-id="selectedTemplate" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import ExcelPreview from '@/components/excel/ExcelPreview.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedTemplate = ref('piping_spec_v1')

const isVisible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<style scoped>
.pipe-spec-preview-dialog {
  --el-dialog-margin-top: 2vh;
}

/* 对话框内容容器样式 */
:deep(.el-dialog__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 80vh;
}

/* 工具条样式 */
.toolbar {
  background-color: #f5f7fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e6e8eb;
  flex-shrink: 0;
}

.toolbar-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 预览内容区域 */
.preview-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #ffffff;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 16px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #f9fafc;
}

.preview-placeholder p {
  margin: 0;
}
</style>
