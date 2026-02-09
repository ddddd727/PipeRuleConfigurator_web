<script setup>
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'
import { Delete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tagsStore = useTagsViewStore()

const activePath = ref(route.path)
const visitedViews = computed(() => tagsStore.visitedViews)

const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref({})

watch(() => route.path, (newPath) => {
  activePath.value = newPath
  tagsStore.addView(route)
}, { immediate: true })

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

const handleTabClick = (tab) => {
  router.push(tab.props.name)
}

const handleTabRemove = (targetPath) => {
  const view = visitedViews.value.find(v => v.path === targetPath)
  if (!view) return
  tagsStore.delView(view)
  if (activePath.value === targetPath) {
    const latestView = visitedViews.value.slice(-1)[0]
    router.push(latestView ? latestView.path : '/')
  }
}

const openMenu = (tag, e) => {
  const menuMinWidth = 105
  const maxLeft = window.innerWidth - menuMinWidth 
  const leftPos = e.clientX + 5
  left.value = leftPos > maxLeft ? maxLeft : leftPos
  top.value = e.clientY
  visible.value = true
  selectedTag.value = tag
}

const closeMenu = () => {
  visible.value = false
}

const togglePin = () => {
  tagsStore.togglePinView(selectedTag.value)
}

const closeOthers = () => {
  router.push(selectedTag.value.path)
  tagsStore.delOthersViews(selectedTag.value)
}

const closeAll = () => {
  tagsStore.delAllViews()
  const latestView = tagsStore.visitedViews.slice(-1)[0]
  router.push(latestView ? latestView.path : '/')
}
</script>

<template>
  <div class="tags-container">
    <div class="close-all-wrapper" @click="closeAll">
      <el-tooltip content="关闭所有非固定标签" placement="bottom">
        <el-icon><Delete /></el-icon>
      </el-tooltip>
    </div>

    <div class="tabs-wrapper">
      <el-tabs
        v-model="activePath"
        type="card"
        class="tags-tabs"
        @tab-click="handleTabClick"
        @tab-remove="handleTabRemove"
      >
        <el-tab-pane
          v-for="item in visitedViews"
          :key="item.path"
          :name="item.path"
          :closable="true" 
        >
          <template #label>
            <span 
              class="tab-label-content" 
              :class="{ 'is-pinned-label': item.pinned }"
              @contextmenu.prevent="openMenu(item, $event)"
            >
              {{ item.title }}
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="togglePin">
        {{ selectedTag.pinned ? '取消固定' : '固定当前' }}
      </li>
      <li @click="closeOthers">关闭其他</li>
      <li @click="closeAll">关闭所有</li>
    </ul>
  </div>
</template>

<style scoped>
/* 1. 根容器 */
.tags-container {
  height: 100%;
  width: 100%;
  background: #fff;
  display: flex;
  align-items: flex-end;
  padding: 0;
  /* 【修改】底部边框加粗到 2px */
  border-bottom: 2px solid #dcdfe6; 
  box-sizing: border-box;
}

/* 2. 左侧按钮 */
.close-all-wrapper {
  width: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  opacity: 0;
  transition: opacity 0.3s;
  background: #fff;
  z-index: 10;
  
  /* 【修改】默认透明，hover时显示 2px 边框 */
  border-right: 2px solid transparent; 
  transition: border-color 0.3s, opacity 0.3s;
}
.close-all-wrapper:hover { color: #F56C6C; }
.tags-container:hover .close-all-wrapper { 
  opacity: 1; 
  border-right-color: #dcdfe6; /* 2px 灰色 */
}

/* 3. 标签页容器 */
.tabs-wrapper {
  flex: 1;
  width: 0;
  height: 100%;
}

/* --- Element Plus 样式覆盖 --- */
.tags-tabs { height: 100%; border: none !important; }
:deep(.el-tabs__header) { margin: 0; border: none !important; height: 100%; }
:deep(.el-tabs__nav-wrap) { height: 100%; margin: 0; padding: 0; }
:deep(.el-tabs__nav-scroll) { height: 100%; }
:deep(.el-tabs__nav) { 
  border: none !important; 
  height: 100%; 
  display: flex;
  align-items: flex-end; 
}

/* --- 标签项：默认状态 --- */
:deep(.el-tabs__item) {
  height: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  padding: 0 20px !important;
  
  background: #fff;
  color: #606266;
  font-size: 13px;
  
  border: none !important;
  
  /* 【修改】默认 2px 透明右边框 */
  border-right: 2px solid transparent !important; 
  
  border-radius: 0 !important;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  box-sizing: border-box;
  position: relative;
}

/* 鼠标进入组件时，显示 2px 分割线 */
.tags-container:hover :deep(.el-tabs__item) {
  border-right-color: #dcdfe6 !important;
}

/* --- 标签项：选中状态 --- */
:deep(.el-tabs__item.is-active) {
  background-color: #264f7b !important;
  color: #fff !important;
  border-radius: 8px 8px 0 0 !important;
  
  /* 选中时无边框 */
  border: none !important; 

  /* 【修改】高度和下边距调整以覆盖 2px 底线 */
  /* 高度 = 100% + 2px */
  height: calc(100% + 2px) !important; 
  /* 向下偏移 2px */
  margin-bottom: -2px !important;      
  
  z-index: 2;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

/* 图标等样式保持不变 */
:deep(.el-tabs__item.is-active .el-icon-close) {
  color: #fff !important;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  vertical-align: middle;
  transform-origin: center;
}
:deep(.el-tabs__item.is-active .el-icon-close:hover) {
  background-color: rgba(255,255,255,0.25);
  color: #fff;
}

.tab-label-content { display: inline-flex; align-items: center; }
.is-pinned-label::before { content: ''; display: inline-block; width: 6px; height: 6px; background-color: #E6A23C; border-radius: 50%; margin-right: 8px; }
:deep(.el-tabs__item.is-active) .is-pinned-label::before { background-color: #fff; }

.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 100px;
}
.contextmenu li { margin: 0; padding: 7px 16px; cursor: pointer; }
.contextmenu li:hover { background: #ecf5ff; color: #409EFF; }
</style>