<!-- <script setup>
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
const route = useRoute()
</script>

// 控制基础类配置是否展开
const basicConfigActive = ref(false)

// 当前激活的基础配置项
const activeBasicConfig = ref('wall-thickness-series')

// 点击基础类菜单的处理函数
const handleBasicConfigClick = () => {
  basicConfigActive.value = !basicConfigActive.value
}

// 计算当前是否在基础配置相关路由
const isBasicConfigRoute = computed(() => {
  return route.path.includes('/config/dict/bend-pipe') || 
         route.path.includes('/config/dict/wall-thickness-series')
})

<template>
  <el-container class="layout-container">
    <el-header class="header-wrap">
      <div class="logo">
        <span style="font-size: 24px; margin-right: 8px;">⚙️</span>
        <span style="font-weight: bold; font-size: 18px; color: #303133;">规则配置器</span>
      </div>

      <el-menu
        :default-active="route.path"
        mode="horizontal"
        router
        :ellipsis="false"
        class="header-menu"
      >
        <el-sub-menu index="/config/dict">
           <template #title>字典定义</template>
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
        </el-sub-menu>
        <el-menu-item index="/config/basic">基础类</el-menu-item>
        <el-menu-item index="/config/spec">Spec配置</el-menu-item>
        <el-menu-item index="/config/pmc">PMC编码</el-menu-item>
        <el-menu-item index="/config/ship">船型船号</el-menu-item>
        <el-menu-item index="/config/pipe">管材规格书</el-menu-item>
      </el-menu>
    </el-header>

    <el-main class="main-content">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout-container { height: 100vh; background-color: #ffffff; }
.header-wrap { display: flex; align-items: center; border-bottom: solid 1px var(--el-menu-border-color); padding: 0 20px; }
.logo { display: flex; align-items: center; margin-right: 40px; flex-shrink: 0; }
.header-menu { flex: 1; border-bottom: none !important; }
.main-content { background-color: #f5f7fa; padding: 20px; overflow: hidden; }
</style> -->

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="aside-menu">
      <div class="logo">
        <span style="font-size: 24px; margin-right: 5px; margin-left: -65px;">⚙️</span>
        <span style="font-weight: bold; font-size: 18px; color: #303133;">规则配置器</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        router
      >
        <el-sub-menu index="/config/dict">
           <template #title>
             <span>字典定义</span>
           </template>
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
        </el-sub-menu>

        <el-menu-item index="/config/basic">
          <span>基础类</span>
        </el-menu-item>

        <el-menu-item index="/config/spec">
          <span>Spec配置</span>
        </el-menu-item>
        
        <el-menu-item index="/config/pmc">
          <span>PMC编码</span>
        </el-menu-item>
        
        <el-menu-item index="/config/pipe">
          <span>管材规格书配置</span>
        </el-menu-item>
        
        <el-menu-item index="/config/ship">
          <span>基础库</span>
        </el-menu-item>
        
        <el-menu-item index="/config/s3d">
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
}
.logo { 
  display: flex; 
  align-items: center; 
  justify-content: center;
  height: 60px;
  border-bottom: 1px solid #dcdfe6;
}
.el-menu-vertical {
  border-right: none;
  flex: 1;
}
.main-content { 
  padding: 20px; 
  overflow-y: auto; 
}
</style>