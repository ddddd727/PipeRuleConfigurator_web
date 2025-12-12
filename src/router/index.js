import { createRouter, createWebHistory } from 'vue-router'

// 1. 引入布局组件 (作为父级容器)
import MainLayout from '../layout/MainLayout.vue'

// 2. 引入业务页面 (直接在 views 目录下，不搞 modules 子文件夹)
import DictLayout from '../views/DictLayout.vue'
import BasicClass from '../views/BasicClass.vue'
import PmcCode from '../views/PmcCode.vue'

// 3. 引入通用组件
import DictTable from '../components/DictTable.vue'

// 暂时复用 BasicClass
import SpecConfig from '../views/BasicClass.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/config/dict/grade' },

    {
      path: '/config',
      component: MainLayout, // 这一层是顶部导航骨架
      children: [
        // 1. 字典模块
        {
          path: 'dict',
          component: DictLayout, // 这一层是白色内容容器
          redirect: '/config/dict/grade',
          children: [
            // 这一层是具体表格
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