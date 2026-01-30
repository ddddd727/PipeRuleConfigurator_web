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
  <div class="app-wrapper">
    
    <el-container class="layout-container">
      
      <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-wrap">
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
          <el-menu-item index="/" class="logo-item">
            <el-icon :color="'#ffffff'"><Platform /></el-icon>
            <template #title>
              <b style="font-size: 16px; color: #ffffff;">规则配置器</b>
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

          <div class="tags-view-wrapper">
            <tags-view />
          </div>

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
  margin: 0;
  padding: 0;
}

/* 2. 底部栏样式：强制直角，铺满宽度 */
.global-footer {
  width: 100%;
  height: 32px;
  background-color: #264f7b; /* 深蓝背景 */
  color: #ffffff; /* 白字 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  letter-spacing: 1px;
  border-radius: 0 !important; /* 强制无圆角 */
  margin: 0;
  padding: 0;
  box-shadow: none; /* 去掉阴影，看起来更平整 */
}

/* 3. 中间主体容器 */
.layout-container {
  flex: 1; /* 占据剩余空间 */
  display: flex;
  flex-direction: row;
  padding: 10px 10px 0 10px; /* 上左右有间距，底部紧贴 footer 或留点空隙均可，这里保留一点空隙给 footer 上方 */
  box-sizing: border-box;
  gap: 10px;
  overflow: hidden; 
  margin-bottom: 0; /* 确保没有额外边距 */
}

/* --- 以下保持原有样式 --- */

/* 侧边栏 */
.aside-wrap {
  background-color: #ffffff !important;
  transition: width 0.3s;
  flex-shrink: 0;
  z-index: 2000;
  height: 100%;
  border-radius: 12px; /* 侧边栏保持圆角 */     
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
}

/* Logo */
.logo-item { 
  background-color: #264f7b !important; 
  border-bottom: 1px solid rgba(255,255,255,0.1);
  pointer-events: none; 
}

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

/* 工作区结构 */
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

.header-wrap {
  height: 50px;
  background-color: #ffffff;    
  border-radius: 12px;           
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,21,41,0.04); 
}

.tags-view-wrapper {
  background-color: #fff;        
  border-radius: 12px;           
  flex-shrink: 0;                
  overflow: hidden;              
  box-shadow: 0 1px 4px rgba(0,21,41,0.04);
  min-height: 34px;              
  display: flex;
  align-items: center;           
}

.main-content {
  background-color: #fff;        
  border-radius: 12px;           
  padding: 20px;
  flex: 1;
  overflow-y: auto;              
  box-shadow: 0 1px 4px rgba(0,21,41,0.04);
  /* 确保内容区底部和 footer 之间有一点距离，或者直接贴合，看 padding 设置 */
  margin-bottom: 10px; /* 在内容区和底部 footer 之间留 10px 空隙 */
}

.ai-sidebar-wrap {
  width: 360px;
  height: 100%; 
  background-color: #fff;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  margin-bottom: 10px; /* 同步留空隙 */
}

.el-menu-vertical-demo:not(.el-menu--collapse) { width: 200px; }
.el-menu-vertical-demo { border-right: none; height: 100%; }

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

.slide-width-enter-active,
.slide-width-leave-active {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  overflow: hidden;
}
.slide-width-enter-from,
.slide-width-leave-to { width: 0; opacity: 0; }
</style>