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
</template>

<style scoped>
/* 全局背景 */
.layout-container {
  height: 100vh;
  width: 100%;
  display: flex;
  background-color: #f0f2f5;
  padding: 10px;             /* 外围 10px */
  box-sizing: border-box;
  gap: 10px;                 /* 左右大区域间距 10px */
}

/* 左侧菜单 */
.aside-wrap {
  background-color: #304156;
  transition: width 0.3s;
  flex-shrink: 0;
  z-index: 2000;
  height: 100%;
  border-radius: 12px;       /* 统一圆角 */
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
}

.workspace-wrapper {
  flex: 1; 
  display: flex; 
  flex-direction: row; 
  height: 100%;
  overflow: hidden;
  gap: 10px;                 /* 中间 和 AI 之间的间距 */
}

/* --- 中间容器核心修改开始 --- */

.center-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background-color: transparent; /* 去掉之前的统一白色背景 */
  border-radius: 0;              /* 去掉之前的统一圆角 */
  box-shadow: none;              /* 去掉阴影 */
  gap: 10px;                     /* 关键：Header、Tags、Main 之间的垂直间距 */
  overflow: hidden;              /* 确保子元素溢出处理 */
}

/* 1. Header 卡片 */
.header-wrap {
  height: 50px;
  background-color: #fff;        /* 独立背景 */
  border-radius: 12px;           /* 独立圆角 */
  border-bottom: none;           /* 不需要底边框了，因为有 gap 分隔 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,21,41,0.04); /* 轻微阴影 */
}

/* 2. Tags 卡片包裹层 */
.tags-view-wrapper {
  background-color: #fff;        /* 独立背景 */
  border-radius: 12px;           /* 独立圆角 */
  flex-shrink: 0;                /* 防止被压缩 */
  overflow: hidden;              /* 保持圆角 */
  box-shadow: 0 1px 4px rgba(0,21,41,0.04);
  /* 如果 tags-view 组件本身有阴影或下边距，需要去组件里调整，这里做容器 */
  min-height: 34px;              /* 根据你的 tags view 高度调整 */
  display: flex;
  align-items: center;           /* 垂直居中 */
}

/* 3. Main Content 卡片 */
.main-content {
  background-color: #fff;        /* 独立背景 */
  border-radius: 12px;           /* 独立圆角 */
  padding: 20px;
  height: 100%;                  /* 占满剩余高度 */
  overflow-y: auto;              /* 内容过多时内部滚动 */
  flex: 1;
  box-shadow: 0 1px 4px rgba(0,21,41,0.04);
}

/* --- 中间容器核心修改结束 --- */

.ai-sidebar-wrap {
  width: 360px;
  height: 100%; 
  background-color: #fff;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

/* 保持其他原有样式 */
.el-menu-vertical-demo:not(.el-menu--collapse) { width: 200px; }
.el-menu-vertical-demo { border-right: none; height: 100%; }
.logo-item { background-color: #2b2f3a !important; color: #fff !important; pointer-events: none; }

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

/* 动画 */
.slide-width-enter-active,
.slide-width-leave-active {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  overflow: hidden;
}
.slide-width-enter-from,
.slide-width-leave-to { width: 0; opacity: 0; }
</style>