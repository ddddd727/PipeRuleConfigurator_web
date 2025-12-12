<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeTopTab = ref('dict')

// 1. 路由同步 Tab：根据当前 URL，高亮对应的 Tab
// 例如：访问 /config/spec，Tab 自动变成 spec
watch(() => route.path, (newPath) => {
  const path = newPath.split('/')
  // 假设路径是 /config/dict/grade，取第2个部分 'dict'
  if (path[2]) {
    activeTopTab.value = path[2]
  }
}, { immediate: true })

// 2. Tab 切换逻辑：点击 Tab 跳转到对应模块的默认页
const handleTabClick = (tab) => {
  const name = tab.paneName
  
  if (name === 'dict') {
    router.push('/config/dict/grade') // 字典默认跳到管材等级
  } else {
    // 其他页面直接跳 /config/xxx
    router.push(`/config/${name}`)
  }
}
</script>

<template>
  <div class="main-layout">
    <div class="top-tabs">
      <el-tabs v-model="activeTopTab" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="字典定义" name="dict"></el-tab-pane>
        <el-tab-pane label="基础类" name="basic"></el-tab-pane>
        <el-tab-pane label="Spec配置" name="spec"></el-tab-pane>
        <el-tab-pane label="PMC编码" name="pmc"></el-tab-pane>
        <el-tab-pane label="船型船号基础数据" name="ship"></el-tab-pane>
        <el-tab-pane label="管材规格书配置" name="pipe"></el-tab-pane>
      </el-tabs>
    </div>

    <div class="content-body">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.main-layout { height: 100vh; display: flex; flex-direction: column; background: #fff; }
.top-tabs { padding: 10px 20px 0 20px; border-bottom: 1px solid #dcdfe6; }
:deep(.el-tabs__content) { display: none; } /* 隐藏 Tab 自带的内容区 */
:deep(.el-tabs__header) { margin-bottom: 0; }
.content-body { flex: 1; overflow: hidden; }
</style>