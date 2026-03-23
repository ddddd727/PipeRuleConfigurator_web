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
  return (props.basePath + separator + routePath).replace(/\/+$/g, '').replace(/\/+/g, '/')
}

const hasOneShowingChild = (children = [], parent) => {
  const showingChildren = children.filter(item => {
    if (item.meta?.hidden) {
      return false
    } else {
      onlyOneChild.value = item
      return true
    }
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

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
