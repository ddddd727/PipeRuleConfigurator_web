import { createRouter, createWebHistory } from 'vue-router'

// 1. 布局
import MainLayout from '../layout/MainLayout.vue'

// 2. 业务页面
import DictLayout from '../views/DictLayout.vue'
import BasicClass from '../views/BasicClass.vue'
import PmcCode from '../views/PmcCode.vue'
import SpecConfig from '../views/SpecConfig.vue' // 已修复的 Spec 页面
import ShipData from '../views/ShipData.vue'     // 新增
import PipeSpec from '../views/PipeSpec.vue'     // 新增

// 3. 组件
import DictTable from '../components/DictTable.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/config/dict/grade' },

    {
      path: '/config',
      component: MainLayout,
      children: [
        // --- 1. 字典模块 (动态路由) ---
        {
          path: 'dict',
          component: DictLayout,
          redirect: '/config/dict/grade',
          children: [
            // :id 匹配 /config/dict/xxx，例如 grade, material, interface
            { path: ':id', component: DictTable }
          ]
        },
        
        // --- 2. 独立业务模块 ---
        { path: 'basic', component: BasicClass }, // 基础类
        { path: 'spec', component: SpecConfig },  // Spec配置
        { path: 'pmc', component: PmcCode },      // PMC编码
        { path: 'ship', component: ShipData },    // 船型船号 (新)
        { path: 'pipe', component: PipeSpec }     // 管材规格书 (新)
      ]
    },

    // --- 404 捕获 ---
    // 匹配所有未定义的路径，重定向回首页或显示404组件
    { path: '/:pathMatch(.*)*', redirect: '/config/dict/grade' }
  ]
})

export default router