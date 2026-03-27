<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarItem from '@/layouts/components/SidebarItem.vue'
import TagsView from '@/layouts/components/TagsView.vue'
import AppRail from '@/layouts/components/AppRail.vue'
import PMCAIAssistant from '@/shared/components/PMCAIAssistant.vue'
import {
  Expand,
  Fold,
  Cpu,
  House,
  Document,
  Collection,
  SetUp,
  Tools,
  DataLine
} from '@element-plus/icons-vue'
import { useTagsViewStore } from '@/stores/tagsView'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)
const showAI = ref(false)

const RAIL_OPEN_DELAY = 100
const RAIL_CLOSE_DELAY = 150
const RAIL_STATE = {
  IDLE: 'idle',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing'
}
const railState = ref(RAIL_STATE.IDLE)
const showAppRail = computed(() => railState.value !== RAIL_STATE.IDLE)

let railTimer = null

const tagsStore = useTagsViewStore()

const clearRailTimer = () => {
  if (railTimer) {
    clearTimeout(railTimer)
    railTimer = null
  }
}

const scheduleRailOpen = () => {
  if (railState.value === RAIL_STATE.OPEN || railState.value === RAIL_STATE.OPENING) return
  clearRailTimer()
  railState.value = RAIL_STATE.OPENING
  railTimer = setTimeout(() => {
    railState.value = RAIL_STATE.OPEN
    railTimer = null
  }, RAIL_OPEN_DELAY)
}

const scheduleRailClose = () => {
  if (railState.value === RAIL_STATE.IDLE || railState.value === RAIL_STATE.CLOSING) return
  clearRailTimer()
  railState.value = RAIL_STATE.CLOSING
  railTimer = setTimeout(() => {
    railState.value = RAIL_STATE.IDLE
    railTimer = null
  }, RAIL_CLOSE_DELAY)
}

const handleRailTriggerByPointer = (event) => {
  const container = leftNavGroupRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const triggerStartX = rect.left - RAIL_TRIGGER_LEFT_DISTANCE
  const shouldOpen = event.clientX >= triggerStartX && event.clientX <= rect.left

  if (shouldOpen) {
    scheduleRailOpen()
  } else if (event.clientX > rect.right || event.clientX < triggerStartX) {
    scheduleRailClose()
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleRailTriggerByPointer)
})

onBeforeUnmount(() => {
  clearRailTimer()
  window.removeEventListener('mousemove', handleRailTriggerByPointer)
})

const toggleCollapse = () => { isCollapse.value = !isCollapse.value }
const toggleAI = () => { showAI.value = !showAI.value }

const APP_PREFIXES = [
  '/pipe-spec',
  '/product-standard',
  '/design-rule',
  '/engineering',
  '/component-ci'
]

const APP_CONFIG = {
  '/pipe-spec': {
    title: '管系规格书管理',
    footer: '管系规格书管理系统 · 外高桥造船有限公司',
    logo: Document
  },
  '/product-standard': {
    title: '产品元件标准数据管理',
    footer: '产品元件标准数据管理系统 · 外高桥造船有限公司',
    logo: Collection
  },
  '/design-rule': {
    title: '设计规则管理',
    footer: '设计规则管理系统 · 外高桥造船有限公司',
    logo: SetUp
  },
  '/engineering': {
    title: '工程基础管理',
    footer: '工程基础管理系统 · 外高桥造船有限公司',
    logo: Tools
  },
  '/component-ci': {
    title: '组件持续集成系统',
    footer: '组件持续集成系统 · 外高桥造船有限公司',
    logo: DataLine
  }
}

const currentAppPath = computed(() =>
  APP_PREFIXES.find(p => route.path.startsWith(p)) ?? null
)

const cachedViews = computed(() =>
  tagsStore.cachedViews.filter(name =>
    tagsStore.visitedViews.some(view => view.name === name && view.appRoot === currentAppPath.value)
  )
)

const appTitle = computed(() => APP_CONFIG[currentAppPath.value]?.title ?? '规则配置器')
const appFooter = computed(() => APP_CONFIG[currentAppPath.value]?.footer ?? '设计规则驱动管理系统 · 外高桥造船有限公司')
const currentAppLogo = computed(() => APP_CONFIG[currentAppPath.value]?.logo ?? House)

const menuList = computed(() => {
  const appPath = currentAppPath.value
  if (!appPath) return []
  const appRoute = router.options.routes.find(r => r.path === appPath)
  return (appRoute?.children || []).filter(c => !c.meta?.hidden)
})

const appOptions = computed(() =>
  APP_PREFIXES.map(path => ({
    path,
    title: APP_CONFIG[path]?.title || path,
    logo: APP_CONFIG[path]?.logo || House
  }))
)

const handleAppSwitch = (path) => {
  if (!path || path === currentAppPath.value) return
  router.push(path)
}

const gotoPortal = () => {
  if (route.path === '/') return
  router.push('/')
}
</script>

<template>
  <div class="app-wrapper">
    <el-container class="layout-container">
      <div class="left-nav-group" @mouseenter="scheduleRailOpen" @mouseleave="scheduleRailClose">
        <app-rail
          :visible="showAppRail"
          :collapsed="isCollapse"
          :is-portal-active="route.path === '/'"
          :current-app-path="currentAppPath"
          :app-options="appOptions"
          @switch-app="handleAppSwitch"
          @go-portal="gotoPortal"
        />

        <el-aside
          :width="isCollapse ? '64px' : '200px'"
          class="aside-wrap"
        >
        <div class="sidebar-header">
          <div v-if="!isCollapse" class="header-content expanded">
            <div class="logo-area">
              <span class="logo-chip">
                <el-icon :size="16"><component :is="currentAppLogo" /></el-icon>
              </span>
              <span class="app-title">{{ appTitle }}</span>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <div class="collapse-trigger" @click="toggleCollapse">
                <el-icon :size="16"><Fold /></el-icon>
              </div>
            </div>
          </div>

          <div v-else class="header-content collapsed" @click="toggleCollapse">
            <el-icon :size="20"><Expand /></el-icon>
          </div>
        </div>

        <el-menu
          :default-active="route.path"
          class="el-menu-vertical-demo"
          :collapse="isCollapse"
          router
          unique-opened
          background-color="#ffffff"
          text-color="#303133"
          active-text-color="#ffffff"
        >
          <sidebar-item
            v-for="item in menuList"
            :key="item.path"
            :item="item"
            :basePath="currentAppPath"
          />
        </el-menu>
        </el-aside>
      </div>

      <div class="workspace-wrapper">
        <el-container class="center-container">
          <div class="navbar-container">
            <div class="tags-section">
              <tags-view />
            </div>

            <div class="tools-section">
              <el-tooltip content="开启 PMC AI 助手" placement="bottom">
                <div
                  class="ai-trigger"
                  :class="{ 'active': showAI }"
                  @click="toggleAI"
                >
                  <el-icon :size="16"><Cpu /></el-icon>
                  <span style="margin-left: 4px; font-weight: 600; font-size: 13px;">AI 助手</span>
                </div>
              </el-tooltip>
            </div>
          </div>

          <el-main class="main-content">
            <router-view v-slot="{ Component, route }">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="route.fullPath" />
              </keep-alive>
            </router-view>
          </el-main>
        </el-container>

        <transition name="slide-width">
          <div v-if="showAI" class="ai-sidebar-wrap">
            <PMCAIAssistant />
          </div>
        </transition>
      </div>
    </el-container>

    <div class="global-footer">
      <span>{{ appFooter }}</span>
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f0f2f5;
  overflow: hidden;
}

.global-footer {
  width: 100%;
  height: 32px;
  background-color: var(--primary-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  letter-spacing: 1px;
}

.layout-container {
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 10px;
  box-sizing: border-box;
  gap: 10px;
  overflow: hidden;
  margin-bottom: 0;
}

.left-nav-group {
  display: flex;
  flex-direction: row;
  height: 100%;
  margin-bottom: 0;
  gap: 8px;
  flex-shrink: 0;
  align-items: stretch;
}

.aside-wrap {
  background-color: #ffffff !important;
  transition: width 0.3s;
  flex-shrink: 0;
  z-index: 2000;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  height: 50px;
  background-color: var(--primary-color);
  color: #fff;
  flex-shrink: 0;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.header-content.expanded {
  justify-content: space-between;
}

.header-content.collapsed {
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.header-content.collapsed:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
}

.logo-chip {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.app-title {
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff;
}

.collapse-trigger {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.collapse-trigger:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.el-menu-vertical-demo {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.el-menu-vertical-demo::-webkit-scrollbar {
  display: none;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: var(--primary-color) !important;
  color: #ffffff !important;
}

:deep(.el-menu-item:hover i),
:deep(.el-sub-menu__title:hover i) {
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--primary-color) !important;
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active i) {
  color: #ffffff !important;
}

.workspace-wrapper {
  flex: 1;
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
  gap: 10px;
}

.center-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  gap: 10px;
  overflow: hidden;
}

.navbar-container {
  background-color: #fff;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0;
  height: 50px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  overflow: hidden;
}

.tags-section {
  flex: 1;
  overflow: hidden;
  height: 100%;
}

.tools-section {
  flex-shrink: 0;
  padding: 0 10px;
  border-left: 1px solid #f0f0f0;
  height: 100%;
  display: flex;
  align-items: center;
}

.ai-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 16px;
  transition: all 0.3s;
  color: #606266;
  border: 1px solid transparent;
  user-select: none;
  background: #f4f4f5;
}

.ai-trigger:hover {
  background-color: #e6f7ff;
  color: #409eff;
}

.ai-trigger.active {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  color: #409eff;
  border-color: #c6e2ff;
  box-shadow: 0 0 6px rgba(64, 158, 255, 0.25);
}

.main-content {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
}

.ai-sidebar-wrap {
  width: 360px;
  height: 100%;
  background-color: #fff;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

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
