<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
:root {
  /* 核心主题色 #264f7b */
  --primary-color: #264f7b; 
  /* 悬停色，稍微亮一点，用于交互反馈 */
  --primary-hover: #3a6b9c; 
  /* 激活/点击色，更深一点 */
  --primary-active: #1e3f63; 
  --el-color-primary: var(--primary-color);
  --el-color-primary-light-3: #4070a0;
  --el-color-primary-light-9: #eef3f8;
  /* 辅助背景色 */
  --bg-color-page: #f0f2f5;
  --bg-color-white: #ffffff;
}
  
/* 全局样式重置 */
html, body { margin: 0; padding: 0; height: 100%; font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif; }
#app { height: 100%; }
/* src/App.vue */

/* ... 原有样式 ... */


</style>