import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/basic',
  component: MainLayout,
  meta: { 
    title: '基础类配置', 
    icon: 'Grid',
    // alwaysShow: true // 如果你想即使只有一个子菜单，也显示父级文件夹，请解开此注释
  },
  // 默认跳转到列表页
  redirect: '/basic/list',
  children: [
    {
      path: 'list',
      name: 'BasicClass',
      component: () => import('@/views/BasicClass.vue'),
      meta: { title: '基础类列表' } // 如果父级显示为文件夹，这里就是子菜单名称
    },
    // 未来可以在这里轻松添加：
    // { path: 'detail/:id', component: ..., meta: { title: '详情', hidden: true } }
  ]
}