<template>
  <div class="app-container" style="padding: 20px;">
    <el-card shadow="never">
      <template #header>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: bold;">壁厚系列 (Wall Thickness)</span>
          <el-button type="success" size="small">保存配置</el-button>
        </div>
      </template>

      <div style="min-height: 500px; border: 1px dashed #ddd; padding: 20px;">
        <h3>同事负责区域：壁厚系列</h3>
        <p>布局需求：矩阵式配置，或者特殊表格。</p>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 逻辑写这里
</script>