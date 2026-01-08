<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'

const route = useRoute()
const router = useRouter()
const tagsStore = useTagsViewStore()

// 绑定 el-tabs 的 v-model，对应当前路由的 path
const activePath = ref(route.path)

const visitedViews = computed(() => tagsStore.visitedViews)

// 1. 监听路由变化 -> 添加标签 & 选中当前标签
watch(() => route.path, (newPath) => {
  activePath.value = newPath
  tagsStore.addView(route)
}, { immediate: true })

// 2. 点击标签 -> 跳转路由
const handleTabClick = (tab) => {
  router.push(tab.props.name)
}

// 3. 点击关闭 -> 移除标签 & 智能跳转
const handleTabRemove = (targetPath) => {
  const tabs = visitedViews.value
  let activeName = activePath.value

  // 如果关闭的是当前激活的 tab，需要找下一个激活的
  if (activeName === targetPath) {
    tabs.forEach((tab, index) => {
      if (tab.path === targetPath) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.path
        } else {
          // 如果删完了，跳回首页
          activeName = '/' 
        }
      }
    })
    router.push(activeName)
  }
  
  // 从 store 中移除
  tagsStore.delView(targetPath)
}
</script>

<template>
  <div class="tags-container">
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
        :label="item.title"
        :name="item.path"
        :closable="visitedViews.length > 1"
      />
      </el-tabs>
  </div>
</template>

<style scoped>
.tags-container {
  background: #fff;
  padding: 6px 15px 0 15px; /* 顶部留点空隙 */
  border-bottom: 1px solid #d8dce5;
}

/* 微调 Element Plus 原生样式，让它紧贴底部边框 */
:deep(.el-tabs__header) {
  margin: 0; /* 去掉默认的底部 huge margin */
  border-bottom: none; /* 去掉 tabs 自己的边框，使用容器的边框 */
}

:deep(.el-tabs__nav) {
  border: none !important; /* 去掉外边框，看起来更干净 */
}

:deep(.el-tabs__item) {
  height: 34px;
  line-height: 34px;
  border-bottom: none !important; /* 激活时不需要底边框，像文件夹标签一样 */
}
</style>