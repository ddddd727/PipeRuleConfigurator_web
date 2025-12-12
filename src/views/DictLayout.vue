<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <el-container style="height: 100%;">
    <el-aside width="240px" class="left-menu">
      <el-menu :default-active="route.path" router default-expand-all class="custom-menu">
        <el-sub-menu index="1">
          <template #title><span>📂 业务属性字典定义</span></template>
          <el-menu-item index="/config/dict/grade">A-管材等级</el-menu-item>
          <el-menu-item index="/config/dict/material">B1-主材料</el-menu-item>
          <el-menu-item index="/config/dict/interface">接口表</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title><span>📂 标准系列配置</span></template>
          <el-menu-item index="/config/dict/std-gb">国标系列</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-main style="padding: 0;">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.left-menu { border-right: 1px solid #e6e6e6; background: #fcfcfc; }
.custom-menu { border-right: none; background: transparent; }
</style>