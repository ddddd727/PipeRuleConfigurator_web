<template>
  <div class="app-container" style="padding: 20px;">
    <el-card shadow="never">
      <template #header>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: bold;">ShortCode 规则定义</span>
          <el-button type="warning" size="small">生成规则</el-button>
        </div>
      </template>

      <div style="min-height: 500px; border: 1px dashed #ddd; padding: 20px;">
        <h3>同事负责区域：ShortCode</h3>
        <p>布局需求：规则逻辑定义，复杂表单。</p>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 逻辑写这里
</script>