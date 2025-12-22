

<script setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import { Fold, Expand } from '@element-plus/icons-vue'

const route = useRoute()
const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside 
      :width="isCollapsed ? '64px' : '200px'" 
      class="aside-menu"
    >
      <!-- Logo区域 -->
      <div class="logo" :style="{ justifyContent: 'center', padding: '0' }">
        <span 
          style="font-size: 28px;"
          :style="{ marginRight: isCollapsed ? '0' : '5px', marginLeft: isCollapsed ? '0' : '-15px' }"
        >
          ⚙️
        </span>
        <span 
          v-if="!isCollapsed" 
          style="font-weight: bold; font-size: 18px; color: #303133;"
        >
          规则配置器
        </span>
      </div>
      
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon :size="20">
          <Expand v-if="isCollapsed" />
          <Fold v-else />
        </el-icon>
        <span v-if="!isCollapsed" style="margin-left: 4px; font-size: 13px;">收起</span>
      </div>
      
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        router
        :collapse="isCollapsed"
        :collapse-transition="false"
      >
        <el-sub-menu index="/config/dict">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>字典定义</span>
          </template>
          
          <!-- 展开状态下显示分组 -->
          <template v-if="!isCollapsed">
            <el-menu-item-group title="业务属性字典定义">
              <el-menu-item index="/config/dict/grade">管材等级</el-menu-item>
              <el-menu-item index="/config/dict/pipe-std">A-管材标准</el-menu-item>
              <el-menu-item index="/config/dict/main-material">B1-主材料</el-menu-item>
              <el-menu-item index="/config/dict/material-grade">B-牌号</el-menu-item>
              <el-menu-item index="/config/dict/flange-std">C1-法兰标准</el-menu-item>
              <el-menu-item index="/config/dict/flange-pressure">C2-法兰压力等级</el-menu-item>
              <el-menu-item index="/config/dict/wall-thickness">D-壁厚等级</el-menu-item>
              <el-menu-item index="/config/dict/interface-table">接口表</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="标准系列">
              <el-menu-item index="/config/dict/std-gb">国标系列</el-menu-item>
            </el-menu-item-group>
          </template>
          
          <!-- 折叠状态下直接显示子菜单项 -->
          <template v-else>
            <el-menu-item index="/config/dict/grade">管材等级</el-menu-item>
            <el-menu-item index="/config/dict/pipe-std">A-管材标准</el-menu-item>
            <el-menu-item index="/config/dict/main-material">B1-主材料</el-menu-item>
            <el-menu-item index="/config/dict/material-grade">B-牌号</el-menu-item>
            <el-menu-item index="/config/dict/flange-std">C1-法兰标准</el-menu-item>
            <el-menu-item index="/config/dict/flange-pressure">C2-法兰压力等级</el-menu-item>
            <el-menu-item index="/config/dict/wall-thickness">D-壁厚等级</el-menu-item>
            <el-menu-item index="/config/dict/interface-table">接口表</el-menu-item>
            <el-menu-item index="/config/dict/std-gb">国标系列</el-menu-item>
          </template>
        </el-sub-menu>

        <el-menu-item index="/config/basic">
          <el-icon><Setting /></el-icon>
          <span>基础类</span>
        </el-menu-item>

        <el-menu-item index="/config/spec">
          <el-icon><List /></el-icon>
          <span>Spec配置</span>
        </el-menu-item>
        
        <el-menu-item index="/config/pmc">
          <el-icon><Ticket /></el-icon>
          <span>PMC编码</span>
        </el-menu-item>
        
        <el-menu-item index="/config/pipe">
          <el-icon><Files /></el-icon>
          <span>管材规格书配置</span>
        </el-menu-item>
        
        <el-menu-item index="/config/ship">
          <el-icon><Ship /></el-icon>
          <span>基础库</span>
        </el-menu-item>
        
        <el-menu-item index="/config/s3d">
          <el-icon><Monitor /></el-icon>
          <span>S3D属性管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-main class="main-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container { 
  height: 100vh; 
  background-color: #f5f7fa; 
}
.aside-menu {
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}
.logo { 
  display: flex; 
  align-items: center; 
  height: 60px;
  min-height: 60px;
  border-bottom: 1px solid #dcdfe6;
  transition: all 0.3s;
  padding: 0 20px;
  box-sizing: border-box;
}
.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-height: 40px;
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
  width: 100%;
}
.collapse-btn:hover {
  background-color: #f5f7fa;
  color: #409eff;
}
.el-menu-vertical {
  border-right: none;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}
/* 折叠状态下的菜单样式 */
.el-menu--collapse .el-menu-item span,
.el-menu--collapse .el-sub-menu__title span {
  display: none;
}
.el-menu--collapse .el-menu-item .el-icon,
.el-menu--collapse .el-sub-menu__title .el-icon {
  margin-right: 0;
}
.el-menu--collapse .el-sub-menu__title {
  justify-content: center;
  padding: 0 20px !important;
}
.el-menu--collapse .el-menu-item {
  justify-content: center;
  padding: 0 20px !important;
}
.el-menu--collapse .el-sub-menu__title .el-sub-menu__icon-arrow {
  display: none;
}
.main-content { 
  padding: 20px; 
  overflow-y: auto; 
}

/* 自定义滚动条 */
.aside-menu::-webkit-scrollbar,
.el-menu-vertical::-webkit-scrollbar {
  width: 4px;
}
.aside-menu::-webkit-scrollbar-track,
.el-menu-vertical::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.aside-menu::-webkit-scrollbar-thumb,
.el-menu-vertical::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.aside-menu::-webkit-scrollbar-thumb:hover,
.el-menu-vertical::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>