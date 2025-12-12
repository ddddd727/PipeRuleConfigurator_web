import { createRouter, createWebHistory } from 'vue-router'

// 1. 引入所有页面组件
import RuleConfig from '../views/RuleConfig.vue'     // 顶层 Tab 框
import DictLayout from '../views/DictLayout.vue'     // Tab1: 字典 (带侧边栏)
import BasicClass from '../views/BasicClass.vue'     // Tab2: 基础类
import PmcCode from '../views/PmcCode.vue'           // Tab4: PMC
import DictTable from '../components/DictTable.vue'  // 字典里具体的表格

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/config/dict/grade' },
    
    // Level 1: 顶层 Tab 框架
    {
      path: '/config',
      component: RuleConfig,
      children: [
        // Tab 1: 字典定义 (它自己又是一个带侧边栏的布局)
        {
          path: 'dict', 
          component: DictLayout,
          children: [
            // 字典内部的动态表格
            { path: ':id', component: DictTable } 
          ]
        },
        
        // Tab 2: 基础类 (独立页面)
        { path: 'basic', component: BasicClass },
        
        // Tab 3: Spec 配置 (独立页面)
        { path: 'spec', component: SpecConfig },
        
        // Tab 4: PMC 编码 (独立页面)
        { path: 'pmc', component: PmcCode },
        
        // 其他 Tab 暂时留空或重定向
        { path: 'ship', component: BasicClass }, // 暂时复用
        { path: 'pipe', component: BasicClass }  // 暂时复用
      ]
    }
  ]
})

export default router