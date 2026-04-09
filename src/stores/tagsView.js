import { defineStore } from 'pinia'

const getAppRoot = (path = '') => {
  if (!path || path === '/') return '/'
  const seg = path.split('/').filter(Boolean)[0]
  return seg ? `/${seg}` : '/'
}

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [],
    cachedViews: [] // [新增] 用于 keep-alive 缓存
  }),
  actions: {
    addView(view) {
      const appRoot = view?.meta?.appRoot || getAppRoot(view?.path)
      const viewPayload = Object.assign({}, view, {
        title: view.meta.title || 'no-name',
        pinned: false,
        appRoot
      })

      // 1. 处理 visitedViews (原有逻辑保持，但在 push 时增加 pinned 字段)
      if (!this.visitedViews.some(v => v.path === view.path)) {
        this.visitedViews.push(viewPayload)
      }
      
      // [新增] 2. 排序：固定的排前面
      this.visitedViews.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

      // [新增] 3. 处理 cachedViews (根据组件 name 缓存)
      if (view.name && !view.meta.noCache && !this.cachedViews.includes(view.name)) {
        this.cachedViews.push(view.name)
      }
    },

    delView(view) {
      const i = this.visitedViews.findIndex(v => v.path === view.path)
      if (i > -1) this.visitedViews.splice(i, 1)

      const name = view.name
      if (name && !this.visitedViews.some(v => v.name === name)) {
        const index = this.cachedViews.indexOf(name)
        if (index > -1) this.cachedViews.splice(index, 1)
      }
    },

    // [新增] 下面是新增加的方法
    delOthersViews(view) {
      this.visitedViews = this.visitedViews.filter(v => v.pinned || v.path === view.path)
      const set = new Set(this.visitedViews.map(v => v.name).filter(Boolean))
      this.cachedViews = Array.from(set)
    },
    delAllViews() {
      const pinned = this.visitedViews.filter(v => v.pinned)
      this.visitedViews = pinned
      const set = new Set(pinned.map(v => v.name).filter(Boolean))
      this.cachedViews = Array.from(set)
    },
    togglePinView(view) {
      const v = this.visitedViews.find(i => i.path === view.path)
      if (v) {
        v.pinned = !v.pinned
        // 重新排序
        this.visitedViews.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
      }
    }
  }
})
