<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  basePath: { type: String, default: '' }
})

const resolvePath = (routePath) => {
  if (!routePath) return props.basePath
  const separator = props.basePath.endsWith('/') ? '' : '/'
  return (props.basePath + separator + routePath).replace(/\/+/g, '/')
}

const hasChildren = (item) => {
  const showingChildren = item.children?.filter(child => !child.meta?.hidden)
  return showingChildren && showingChildren.length > 0
}
</script>

<template>
  <template v-if="!item.meta?.hidden">
    
    <el-menu-item v-if="!hasChildren(item)" :index="resolvePath(item.path)">
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <template #title>
        <span>{{ item.meta.title }}</span>
      </template>
    </el-menu-item>

    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta.title }}</span>
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