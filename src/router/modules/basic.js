import MainLayout from '@/layout/MainLayout.vue'
import BasicClass from '@/views/BasicClass.vue'

export default {
  path: '/basic',
  component: MainLayout,
  meta: { 
    title: '设计规则类', 
    icon: 'Grid',
    // alwaysShow: true // 如果你想即使只有一个子菜单，也显示父级文件夹，请解开此注释
  },
  // 默认跳转到列表页
  redirect: '/basic/list',
  children: [
    {
      path: 'list',
      name: 'BasicClass',
      component: BasicClass,
      meta: { title: '设计规则类' } // 如果父级显示为文件夹，这里就是子菜单名称
    },
    // 未来可以在这里轻松添加：
    // { path: 'detail/:id', component: ..., meta: { title: '详情', hidden: true } }
  ]
}