<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarItem from './components/SidebarItem.vue'
import TagsView from './components/TagsView.vue' // 1. 引入新组件
import { constantRoutes } from '@/router/index'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const menuList = computed(() => {
  return constantRoutes.filter(item => !item.hidden && item.path !== '/' && item.path !== '/:pathMatch(.*)*')
})

const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta && item.meta.title)
})
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-wrap">
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        router
        unique-opened
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/" class="logo-item">
          <el-icon><Platform /></el-icon>
          <template #title>
            <b style="font-size: 16px;">规则配置器</b>
          </template>
        </el-menu-item>

        <sidebar-item 
          v-for="route in menuList" 
          :key="route.path" 
          :item="route" 
          :basePath="''"  
        />
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header-wrap">
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="20">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>

        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
            <span v-if="index === breadcrumbs.length - 1">{{ item.meta.title }}</span>
            <a v-else @click.prevent="router.push(item.path)">{{ item.meta.title }}</a>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>

      <tags-view />

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside-wrap {
  background-color: #304156;
  transition: width 0.3s;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}

.el-menu-vertical-demo {
  border-right: none;
  height: 100%;
}

.logo-item {
  background-color: #2b2f3a !important;
  color: #fff !important;
  pointer-events: none;
}

.header-wrap {
  height: 50px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.collapse-btn {
  margin-right: 20px;
  cursor: pointer;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  /* 3. 调整高度计算：头部50 + 标签栏41 (34高+6padding+1border) ≈ 92px */
  height: calc(100vh - 92px);
  overflow-y: auto;
}
</style>