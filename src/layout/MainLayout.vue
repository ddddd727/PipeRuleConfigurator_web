<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarItem from './components/SidebarItem.vue'
import TagsView from './components/TagsView.vue'
import PMCAIAssistant from '@/components/PMCAIAssistant.vue'
import { constantRoutes } from '@/router/index'
import { Expand, Fold, Platform, Cpu } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const showAI = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleAI = () => {
  showAI.value = !showAI.value
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

    <div class="workspace-wrapper">
      
      <el-container class="center-container">
        <el-header class="header-wrap">
          <div class="left-panel">
            <div class="collapse-btn" @click="toggleCollapse">
              <el-icon :size="20">
                <component :is="isCollapse ? Expand : Fold" />
              </el-icon>
            </div>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
                <span v-if="index === breadcrumbs.length - 1">{{ item.meta.title }}</span>
                <a v-else @click.prevent="router.push(item.path)">{{ item.meta.title }}</a>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="right-panel">
            <el-tooltip content="开启 PMC AI 助手" placement="bottom">
              <div 
                class="ai-trigger" 
                :class="{ 'active': showAI }"
                @click="toggleAI"
              >
                <el-icon :size="18"><Cpu /></el-icon>
                <span style="margin-left: 6px; font-weight: 600;">AI 助手</span>
              </div>
             </el-tooltip>
          </div>
        </el-header>

        <tags-view />

        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>

      <transition name="slide-width">
        <div v-if="showAI" class="ai-sidebar-wrap">
          <PMCAIAssistant />
        </div>
      </transition>

    </div>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
  display: flex;
}

.aside-wrap {
  background-color: #304156;
  transition: width 0.3s;
  flex-shrink: 0;
  z-index: 2000;
}

/* 核心布局修改：Workspace 是一个 Flex Row */
.workspace-wrapper {
  flex: 1; /* 占满除了 Menu 之外的所有宽度 */
  display: flex; /* 左右排列 */
  flex-direction: row; 
  height: 100vh;
  overflow: hidden;
}

/* 中间容器：Header + Content 是 Flex Column */
.center-container {
  flex: 1; /* 自动占据剩余空间 */
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0; /* 防止 Flex 子项溢出 */
  transition: all 0.3s ease; /* 增加挤压动画 */
}

/* AI 侧边栏：高度由父级(100vh)决定，不再受 Header 限制 */
.ai-sidebar-wrap {
  width: 360px;
  height: 100%; 
  background-color: #fff;
  flex-shrink: 0;
  border-left: 1px solid #dcdfe6;
  z-index: 1000;
  box-shadow: -2px 0 5px rgba(0,0,0,0.05); /* 加点阴影更有层次感 */
}

/* 保持原有样式 */
.el-menu-vertical-demo:not(.el-menu--collapse) { width: 200px; }
.el-menu-vertical-demo { border-right: none; height: 100%; }
.logo-item { background-color: #2b2f3a !important; color: #fff !important; pointer-events: none; }

.header-wrap {
  height: 50px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  flex-shrink: 0;
  background-color: #fff; /* 确保背景色，防止透视 */
}

.left-panel, .right-panel { display: flex; align-items: center; }
.collapse-btn { margin-right: 20px; cursor: pointer; display: flex; align-items: center; }

.ai-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
  color: #606266;
  border: 1px solid transparent;
  user-select: none;
}

.ai-trigger:hover { background-color: #f0f2f5; color: #409EFF; }
.ai-trigger.active {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  color: #409EFF;
  border-color: #c6e2ff;
  box-shadow: 0 0 6px rgba(64, 158, 255, 0.25);
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  flex: 1;
}

/* 动画 */
.slide-width-enter-active,
.slide-width-leave-active {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  overflow: hidden;
}

.slide-width-enter-from,
.slide-width-leave-to {
  width: 0;
  opacity: 0;
}
</style>