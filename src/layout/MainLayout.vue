<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 控制侧边栏折叠
const isCollapse = ref(false)
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 【核心逻辑】动态生成面包屑
const breadcrumbs = computed(() => {
  // 1. 获取当前路由匹配到的所有嵌套记录
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  
  // 2. 如果你需要手动加一个“首页”在最前面，可以解开下面的注释
  /*
  const first = matched[0]
  if (first && first.path !== '/') {
    matched = [{ path: '/', meta: { title: '首页' } }].concat(matched)
  }
  */
  
  return matched
})
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside-menu">
      <div class="logo-area">
        <span class="logo-icon">⚙️</span>
        <span v-show="!isCollapse" class="logo-text">规则配置器</span>
      </div>

      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
        unique-opened
        :collapse-transition="false"
      >
        <el-sub-menu index="/dict" :popper-offset="16">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>字典定义</span>
          </template>
          
          <el-sub-menu index="dict-business" :popper-offset="16" class="nest-menu">
            <template #title>业务属性</template>
            
            <el-menu-item index="/dict/grade">
              <el-icon><Medal /></el-icon>
              <span>管材等级</span>
            </el-menu-item>
            <el-menu-item index="/dict/pipe-std">
              <el-icon><Collection /></el-icon>
              <span>A-管材标准</span>
            </el-menu-item>
            <el-menu-item index="/dict/main-material">
              <el-icon><Box /></el-icon>
              <span>B1-主材料</span>
            </el-menu-item>
            <el-menu-item index="/dict/material-grade">
              <el-icon><Ticket /></el-icon>
              <span>B-牌号</span>
            </el-menu-item>
            <el-menu-item index="/dict/flange-std">
              <el-icon><CircleCheck /></el-icon>
              <span>C1-法兰标准</span>
            </el-menu-item>
            <el-menu-item index="/dict/flange-pressure">
              <el-icon><Odometer /></el-icon>
              <span>C2-法兰压力</span>
            </el-menu-item>
            <el-menu-item index="/dict/wall-thickness">
              <el-icon><CopyDocument /></el-icon>
              <span>D-壁厚等级</span>
            </el-menu-item>
            <el-menu-item index="/dict/interface-table">
              <el-icon><Link /></el-icon>
              <span>接口表</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="dict-std" :popper-offset="16" class="nest-menu">
             <template #title>标准系列</template>
             <el-menu-item index="/dict/std-gb">
               <el-icon><Flag /></el-icon>
               <span>国标系列</span>
             </el-menu-item>
          </el-sub-menu>
        </el-sub-menu>

        <el-menu-item index="/basic">
          <el-icon><Grid /></el-icon>
          <template #title>基础类配置</template>
        </el-menu-item>

        <el-menu-item index="/spec">
          <el-icon><Tools /></el-icon>
          <template #title>Spec规格书</template>
        </el-menu-item>

        <el-menu-item index="/pmc">
          <el-icon><Connection /></el-icon>
          <template #title>PMC编码</template>
        </el-menu-item>

        <el-menu-item index="/ship">
          <el-icon><Ship /></el-icon>
          <template #title>船型船号</template>
        </el-menu-item>

        <el-menu-item index="/pipe">
          <el-icon><Document /></el-icon>
          <template #title>管材规格书</template>
        </el-menu-item>

      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header-wrap">
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="20">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>

        <el-breadcrumb separator="/" class="breadcrumb-inner">
          <transition-group name="breadcrumb">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
              <span v-if="index === breadcrumbs.length - 1" class="no-redirect">{{ item.meta.title }}</span>
              <a v-else @click.prevent="router.push(item.path)">{{ item.meta.title }}</a>
            </el-breadcrumb-item>
          </transition-group>
        </el-breadcrumb>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
/* --- 布局基础 --- */
.layout-container { height: 100vh; display: flex; }
.aside-menu { background-color: #304156; transition: width 0.28s; overflow-x: hidden; display: flex; flex-direction: column; }
.logo-area { height: 50px; line-height: 50px; text-align: center; background-color: #2b2f3a; color: #fff; flex-shrink: 0; overflow: hidden; }
.logo-icon { font-size: 20px; vertical-align: middle; }
.logo-text { font-size: 16px; font-weight: bold; margin-left: 10px; vertical-align: middle; }
.el-menu-vertical { border-right: none; width: 100%; }

/* --- 菜单阶梯样式 --- */
:deep(.el-menu-vertical > .el-menu-item),
:deep(.el-menu-vertical > .el-sub-menu > .el-sub-menu__title) {
  font-size: 16px !important; 
  font-weight: bold !important;
}

:deep(.nest-menu > .el-sub-menu__title) {
  background-color: #1f2d3d !important;
  font-size: 14px !important;
  font-weight: normal !important;
}

:deep(.nest-menu .el-menu-item) {
  background-color: #001528 !important;
  font-size: 12px !important;
  height: 45px !important;
  line-height: 45px !important;
}

:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

:deep(.el-menu-item.is-active) {
  color: #409EFF !important;
  background-color: #001528 !important;
  font-weight: bold !important;
}

/* --- Header & 面包屑样式 --- */
.header-wrap { background-color: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; height: 50px; padding: 0 15px; }
.collapse-btn { margin-right: 20px; cursor: pointer; display: flex; align-items: center; }
.collapse-btn:hover { color: #409EFF; }

/* 面包屑文字样式 */
.breadcrumb-inner { font-size: 14px; line-height: 50px; display: inline-block; }
.breadcrumb-inner .no-redirect { color: #97a8be; cursor: text; }
.breadcrumb-inner a { font-weight: normal; cursor: pointer; color: #666; }
.breadcrumb-inner a:hover { color: #409EFF; }

/* 面包屑切换动画 */
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}
.breadcrumb-enter-from,
.breadcrumb-leave-active {
  opacity: 0;
  transform: translateX(20px);
}
.breadcrumb-leave-active {
  position: absolute;
}

/* --- Main 内容 --- */
.main-content { background-color: #f0f2f5; padding: 20px; overflow-y: auto; }
.fade-transform-enter-active, .fade-transform-leave-active { transition: all 0.3s; }
.fade-transform-enter-from { opacity: 0; transform: translateX(-10px); }
.fade-transform-leave-to { opacity: 0; transform: translateX(10px); }
</style>