<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarItem from './components/SidebarItem.vue'
import TagsView from './components/TagsView.vue'
import PMCAIAssistant from '@/components/PMCAIAssistant.vue'
import { constantRoutes } from '@/router/index'
import { Expand, Fold, Platform, Cpu } from '@element-plus/icons-vue'
import { useTagsViewStore } from '@/stores/tagsView'

const route = useRoute()
// router 未使用可以移除，如果后续需要跳转可保留
// const router = useRouter() 

const isCollapse = ref(false)
const showAI = ref(false)

const tagsStore = useTagsViewStore()
// [新增] 获取缓存列表
const cachedViews = computed(() => tagsStore.cachedViews)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleAI = () => {
  showAI.value = !showAI.value
}

const menuList = computed(() => {
  return constantRoutes.filter(item => !item.hidden && item.path !== '/' && item.path !== '/:pathMatch(.*)*')
})
</script>

<template>
  <div class="app-wrapper">
    
    <el-container class="layout-container">
      
      <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-wrap">
        <div class="sidebar-header">
          <div v-if="!isCollapse" class="header-content expanded">
            <div class="logo-area">
              <el-icon :size="18"><Platform /></el-icon>
              <span class="app-title">规则配置器</span>
            </div>
            <div class="collapse-trigger" @click="toggleCollapse">
              <el-icon :size="16"><Fold /></el-icon>
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
            v-for="route in menuList"
            :key="route.path"
            :item="route"
            :basePath="''"
          />
        </el-menu>
      </el-aside>

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
            <router-view v-slot="{ Component }">
             <transition name="fade" mode="out-in">
           <keep-alive :include="cachedViews">
         <component :is="Component" :key="route.fullPath" />
          </keep-alive>
           </transition>
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
      <span>***管系规格配置器  版权所有  ***有限公司</span>
    </div>

  </div>
</template>

<style scoped>
/* 1. APP 根容器 */
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
  background-color: #264f7b;
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
  padding: 10px 10px 0 10px;
  box-sizing: border-box;
  gap: 10px;
  overflow: hidden; 
  margin-bottom: 0;
}

/* --- 侧边栏 --- */
.aside-wrap {
  background-color: #ffffff !important;
  transition: width 0.3s;
  flex-shrink: 0;
  z-index: 2000;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column; /* 垂直排列 Header 和 Menu */
}

/* 新增：侧边栏头部样式 */
.sidebar-header {
  height: 50px;
  background-color: #264f7b; /* 与旧版 logo 背景一致 */
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
  background-color: rgba(255,255,255,0.1);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
}

.collapse-trigger {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.collapse-trigger:hover {
  background-color: rgba(255,255,255,0.2);
}

/* 菜单样式微调 */
.el-menu-vertical-demo {
  border-right: none;
  flex: 1; /* 占满剩余高度 */
  overflow-y: auto;
}
.el-menu-vertical-demo:not(.el-menu--collapse) { width: 200px; }

/* 菜单交互 */
:deep(.el-menu-item:hover), 
:deep(.el-sub-menu__title:hover) {
  background-color: #264f7b !important; 
  color: #ffffff !important;             
}
:deep(.el-menu-item:hover i),
:deep(.el-sub-menu__title:hover i) {
  color: #ffffff !important;
}
:deep(.el-menu-item.is-active) {
  background-color: #264f7b !important; 
  color: #ffffff !important;             
}
:deep(.el-menu-item.is-active i) {
  color: #ffffff !important;
}

/* --- 工作区 --- */
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
  
  /* 【关键修改】：高度 50px，无 padding */
  padding: 0; 
  height: 50px; 
  
  box-shadow: 0 1px 4px rgba(0,21,41,0.04);
  overflow: hidden;
}

.tags-section {
  flex: 1; 
  overflow: hidden;
  height: 100%; /* 撑满高度 */
}

.tools-section {
  flex-shrink: 0;
  padding: 0 10px; /* 工具栏内部保留一点间距 */
  border-left: 1px solid #f0f0f0; 
  height: 100%;    /* 高度撑满，分割线才好看 */
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
  background: #f4f4f5; /* 默认浅灰底，显眼一点 */
}

.ai-trigger:hover { background-color: #e6f7ff; color: #409EFF; }
.ai-trigger.active {
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  color: #409EFF;
  border-color: #c6e2ff;
  box-shadow: 0 0 6px rgba(64, 158, 255, 0.25);
}

.main-content {
  background-color: #fff;        
  border-radius: 12px;           
  padding: 20px;
  flex: 1;
  overflow-y: auto;              
  box-shadow: 0 1px 4px rgba(0,21,41,0.04);
  margin-bottom: 10px; 
}

.ai-sidebar-wrap {
  width: 360px;
  height: 100%; 
  background-color: #fff;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  margin-bottom: 10px; 
}

.slide-width-enter-active,
.slide-width-leave-active {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  overflow: hidden;
}
.slide-width-enter-from,
.slide-width-leave-to { width: 0; opacity: 0; }
</style>