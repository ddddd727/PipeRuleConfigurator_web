import MainLayout from '@/layout/MainLayout.vue'
// 引入中间层容器 (如果你之前删了，请看第二步补回来)
import DictLayout from '@/views/DictLayout.vue' 
import DictTable from '@/components/DictTable.vue'

export default {
  path: '/dict',
  component: MainLayout,
  meta: { title: '字典定义', icon: 'Reading' },
  // 重定向到第一个子菜单的第一个页面
  redirect: '/dict/business/grade',
  children: [
    // --- 分组1：业务属性 (二级) ---
    {
      path: 'business',
      component: DictLayout, // 使用中间容器渲染子路由
      meta: { title: '业务属性', icon: 'Menu' },
      redirect: '/dict/business/grade',
      children: [
        // (三级菜单)
        { 
          path: 'grade', 
          component: DictTable, 
          meta: { title: '管材等级', icon: 'Medal' }, 
          props: { dictId: 'grade' } 
        },
        { 
          path: 'pipe-std', 
          component: DictTable, 
          meta: { title: 'A-管材标准', icon: 'Collection' }, 
          props: { dictId: 'pipe-std' } 
        },
        { 
          path: 'main-material', 
          component: DictTable, 
          meta: { title: 'B1-主材料', icon: 'Box' }, 
          props: { dictId: 'main-material' } 
        },
        { 
          path: 'material-grade', 
          component: DictTable, 
          meta: { title: 'B-牌号', icon: 'Ticket' }, 
          props: { dictId: 'material-grade' } 
        },
        { 
          path: 'flange-std', 
          component: DictTable, 
          meta: { title: 'C1-法兰标准', icon: 'CircleCheck' }, 
          props: { dictId: 'flange-std' } 
        },
        { 
          path: 'flange-pressure', 
          component: DictTable, 
          meta: { title: 'C2-法兰压力等级', icon: 'Odometer' }, 
          props: { dictId: 'flange-pressure' } 
        },
        { 
          path: 'wall-thickness', 
          component: DictTable, 
          meta: { title: 'D-壁厚等级', icon: 'CopyDocument' }, 
          props: { dictId: 'wall-thickness' } 
        },
        { 
          path: 'interface-table', 
          component: DictTable, 
          meta: { title: '接口表', icon: 'Link' }, 
          props: { dictId: 'interface-table' } 
        }
      ]
    },

    // --- 分组2：标准系列 (二级) ---
    {
      path: 'std',
      component: DictLayout,
      meta: { title: '标准系列', icon: 'Files' },
      redirect: '/dict/std/gb',
      children: [
        { 
          path: 'gb', 
          component: DictTable, 
          meta: { title: '国标系列', icon: 'Flag' }, 
          props: { dictId: 'std-gb' } 
        }
      ]
    }
  ]
}