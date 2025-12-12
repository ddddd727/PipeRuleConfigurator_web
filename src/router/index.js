import { createRouter, createWebHistory } from 'vue-router'

// 1. 引入组件
import RuleConfig from '../views/RuleConfig.vue'
import DictLayout from '../views/DictLayout.vue'
import BasicClass from '../views/BasicClass.vue'
import PmcCode from '../views/PmcCode.vue'
import DictTable from '../components/DictTable.vue'

// 暂时复用 BasicClass，后面你建好文件了再改
import SpecConfig from '../views/BasicClass.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/config/dict/grade' },

    {
      path: '/config',
      component: RuleConfig, // 顶部 Menu 在这里
      children: [
        // 1. 字典模块
        {
          path: 'dict',
          component: DictLayout, // 白色背景容器
          redirect: '/config/dict/grade',
          children: [
            // :id 对应 grade, material 等
            { path: ':id', component: DictTable } 
          ]
        },
        
        // 2. 其他独立模块
        { path: 'basic', component: BasicClass },
        { path: 'spec', component: SpecConfig },
        { path: 'pmc', component: PmcCode },
        { path: 'ship', component: BasicClass },
        { path: 'pipe', component: BasicClass }
      ]
    }
  ]
})

export default router