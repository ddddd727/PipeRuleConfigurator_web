<script setup>
</script>

<template>
  <div class="dict-wrapper">
    <RouterView />
  </div>
</template>

<style scoped>
.dict-wrapper {
  height: 100%;
  width: 100%;
  background-color: #fff; /* 白色背景 */
  padding: 20px;          /* 内边距 */
  box-sizing: border-box;
  overflow: auto;         /* 内容溢出滚动 */
}
</style>