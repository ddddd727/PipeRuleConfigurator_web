<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Tools } from '@element-plus/icons-vue'

const route = useRoute()
const title = computed(() => route.meta?.title || '功能开发中')
</script>

<template>
  <div class="stub-page">
    <el-empty :description="`「${title}」功能开发中`">
      <template #image>
        <el-icon :size="64" style="color: #c0c4cc"><Tools /></el-icon>
      </template>
    </el-empty>
  </div>
</template>

<style scoped>
.stub-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}
</style>
