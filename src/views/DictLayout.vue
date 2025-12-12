<script setup>
// 这里的逻辑已经空了，因为导航逻辑全在顶部的 MainLayout 里
</script>

<template>
  <div class="dict-module-container">
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style scoped>
.dict-module-container {
  /* 填满父容器 (MainLayout 的 el-main) */
  height: 100%;
  width: 100%;
  
  /* 视觉样式：白色卡片 */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  
  /* 布局：内边距 */
  padding: 24px;
  box-sizing: border-box;
  
  /* 内部滚动：如果表格太长，滚动条出现在这个白色卡片里 */
  overflow: auto;
}

/* 简单的淡入淡出动画，让切换感觉更丝滑 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>