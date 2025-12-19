<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta && item.meta.title)
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
        <el-sub-menu index="/dict">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>字典定义</span>
          </template>
          
          <el-sub-menu index="dict-business">
            <template #title>业务属性</template>
            <el-menu-item index="/dict/grade">管材等级</el-menu-item>
            <el-menu-item index="/dict/pipe-std">A-管材标准</el-menu-item>
            <el-menu-item index="/dict/main-material">B1-主材料</el-menu-item>
            <el-menu-item index="/dict/material-grade">B-牌号</el-menu-item>
            <el-menu-item index="/dict/flange-std">C1-法兰标准</el-menu-item>
            <el-menu-item index="/dict/flange-pressure">C2-法兰压力等级</el-menu-item>
            <el-menu-item index="/dict/wall-thickness">D-壁厚等级</el-menu-item>
            <el-menu-item index="/dict/interface-table">接口表</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="dict-std">
             <template #title>标准系列</template>
             <el-menu-item index="/dict/std-gb">国标系列</el-menu-item>
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
          <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
            <span v-if="index === breadcrumbs.length - 1" class="no-redirect">{{ item.meta.title }}</span>
            <a v-else @click.prevent="router.push(item.path)">{{ item.meta.title }}</a>
          </el-breadcrumb-item>
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
/* 样式保持不变 */
.layout-container { height: 100vh; display: flex; }
.aside-menu { background-color: #304156; transition: width 0.28s; overflow-x: hidden; display: flex; flex-direction: column; }
.logo-area { height: 50px; line-height: 50px; text-align: center; background-color: #2b2f3a; color: #fff; flex-shrink: 0; overflow: hidden; }
.logo-icon { font-size: 20px; vertical-align: middle; }
.logo-text { font-size: 16px; font-weight: bold; margin-left: 10px; vertical-align: middle; }
.el-menu-vertical { border-right: none; width: 100%; }

.header-wrap { background-color: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; height: 50px; padding: 0 15px; }
.collapse-btn { margin-right: 20px; cursor: pointer; display: flex; align-items: center; }
.collapse-btn:hover { color: #409EFF; }
.breadcrumb-inner { font-size: 14px; line-height: 50px; }
.no-redirect { color: #97a8be; cursor: text; }
.breadcrumb-inner a { font-weight: normal; cursor: pointer; }
.breadcrumb-inner a:hover { color: #409EFF; }

.main-content { background-color: #f0f2f5; padding: 20px; overflow-y: auto; }
.fade-transform-enter-active, .fade-transform-leave-active { transition: all 0.3s; }
.fade-transform-enter-from { opacity: 0; transform: translateX(-10px); }
.fade-transform-leave-to { opacity: 0; transform: translateX(10px); }

/* 额外优化：让嵌套菜单的背景色稍微深一点，增强层次感 
  注意：Element Plus 的暗色模式菜单处理起来比较自动，
  如果觉得层次感不够，可以取消注释下面的样式
*/
/*
:deep(.el-sub-menu .el-menu-item),
:deep(.el-sub-menu .el-sub-menu__title) {
  background-color: #1f2d3d !important;
}
:deep(.el-menu-item:hover) {
  background-color: #001528 !important;
}
*/
</style>