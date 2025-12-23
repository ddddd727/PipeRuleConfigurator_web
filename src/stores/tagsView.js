import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagsViewStore = defineStore('tagsView', () => {
  const visitedViews = ref([])

  // 添加标签
  const addView = (view) => {
    // 去重
    if (visitedViews.value.some(v => v.path === view.path)) return
    // 只有带标题的路由才添加
    if (view.meta && view.meta.title) {
      visitedViews.value.push({
        path: view.path,
        title: view.meta.title,
        name: view.name // 用于 keep-alive
      })
    }
  }

  // 删除标签
  const delView = (path) => {
    const index = visitedViews.value.findIndex(v => v.path === path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  return { visitedViews, addView, delView }
})