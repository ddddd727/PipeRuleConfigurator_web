import { createRouter, createWebHistory } from 'vue-router'

// 1. 布局
import MainLayout from '../layout/MainLayout.vue'

// 2. 业务页面
import DictLayout from '../views/DictLayout.vue'
import BasicClass from '../views/BasicClass.vue'
import PmcCode from '../views/PmcCode.vue'
import SpecConfig from '../views/SpecConfig.vue'
import ShipData from '../views/ShipData.vue'
import PipeSpec from '../views/PipeSpec.vue'

// 3. 组件
import DictTable from '../components/DictTable.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 默认重qy定向到第一个业务页面
    { path: '/', redirect: '/dict/grade' },

    {
      path: '/',
      component: MainLayout,
      // 这里的 children 就是你的一级标题内容
      children: [
        // --- 1. 字典模块 (一级标题：字典定义) ---
        {
          path: 'dict',
          component: DictLayout,
          meta: { title: '字典定义' },
          redirect: '/dict/grade', // 默认去管材等级
          children: [
            // 这里的 :id 对应具体的 tab 页（如 grade, pipe-std）
            { 
              path: ':id', 
              component: DictTable,
              meta: { title: '字典详情' } 
            }
          ]
        },
        
        // --- 2. 独立业务模块 (一级标题：基础类、Spec、PMC等) ---
        { 
          path: 'basic', 
          component: BasicClass, 
          meta: { title: '基础类配置' } 
        },
        { 
          path: 'spec', 
          component: SpecConfig, 
          meta: { title: 'Spec规格书' } 
        },
        { 
          path: 'pmc', 
          component: PmcCode, 
          meta: { title: 'PMC编码规则' } 
        },
        { 
          path: 'ship', 
          component: ShipData, 
          meta: { title: '船型船号' } 
        },
        { 
          path: 'pipe', 
          component: PipeSpec, 
          meta: { title: '管材规格书' } 
        }
      ]
    },

    // 404
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

export default router