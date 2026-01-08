<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  basePath: { type: String, default: '' }
})

const onlyOneChild = ref(null)

const resolvePath = (routePath) => {
  if (!routePath) return props.basePath
  if (/^(https?:|mailto:|tel:)/.test(routePath)) {
    return routePath
  }
  const separator = props.basePath.endsWith('/') ? '' : '/'
  return (props.basePath + separator + routePath).replace(/\/+/g, '/')
}

/**
 * 核心判断逻辑：
 * 判断是否只有一个需要显示的子路由。
 * 如果是，我们将渲染这个子路由（作为一级菜单），而不是渲染父级目录。
 */
const hasOneShowingChild = (children = [], parent) => {
  const showingChildren = children.filter(item => {
    if (item.meta?.hidden) {
      return false
    } else {
      // 暂存该子路由
      onlyOneChild.value = item
      return true
    }
  })

  // 1. 只有一个子路由 -> 显示该子路由 (例如 /pipe/index)
  if (showingChildren.length === 1) {
    return true
  }

  // 2. 没有子路由 -> 显示父路由自己 (例如 /basic/list，有些写法是把 list 写在 children 里但没有 path)
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  // 3. 有多个子路由 -> 显示父路由为目录
  return false
}
</script>

<template>
  <template v-if="!item.meta?.hidden">
    
    <el-menu-item 
      v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.meta?.alwaysShow"
      :index="resolvePath(item.path + '/' + onlyOneChild.path)"
    >
      <el-icon v-if="onlyOneChild.meta?.icon || (item.meta && item.meta.icon)">
        <component :is="onlyOneChild.meta?.icon || (item.meta && item.meta.icon)" />
      </el-icon>
      <template #title>
        <span>{{ onlyOneChild.meta?.title }}</span>
      </template>
    </el-menu-item>

    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span v-if="item.meta?.title">{{ item.meta.title }}</span>
      </template>
      
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :basePath="resolvePath(item.path)"
      />
    </el-sub-menu>

  </template>
</template>