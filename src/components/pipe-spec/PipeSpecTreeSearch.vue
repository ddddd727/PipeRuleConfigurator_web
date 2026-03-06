<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="tree-search-container">
    <el-input
      :model-value="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      placeholder="搜索PMC编码..."
      clearable
      size="small"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
  </div>
</template>

<style scoped>
.tree-search-container {
  padding: 10px 15px 0 15px;
  background-color: #fff;
}
</style>
