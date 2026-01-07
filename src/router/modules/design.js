import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/design',
  component: MainLayout,
  meta: { title: '设计规则类', icon: 'Guide' }, // [一级菜单]
  redirect: '/design/rules/bend',
  children: [
    {
      // [二级菜单]：设计规则类
      path: 'rules',
      component: () => import('@/views/design/Layout.vue'),
      meta: { title: '设计规则类', icon: 'FolderChecked' },
      redirect: '/design/rules/bend',
      children: [
        // [三级菜单]：已添加 Icon
        {
          path: 'bend',
          name: 'BendData',
          component: () => import('@/views/design/BendData.vue'),
          // RefreshLeft: 形状像一个弯管（90度弯头）
          meta: { title: '弯管数据', icon: 'RefreshLeft' } 
        },
        {
          path: 'wall-thk',
          name: 'WallThkSeries',
          component: () => import('@/views/design/WallThkSeries.vue'),
          // CopyDocument: 多层叠加的形状，代表壁厚/层级
          meta: { title: '壁厚系列', icon: 'CopyDocument' } 
        },
        {
          path: 'short-code',
          name: 'ShortCode',
          component: () => import('@/views/design/ShortCode.vue'),
          // Ticket: 像一个代码标签或票据
          meta: { title: 'ShortCode', icon: 'Ticket' } 
        }
      ]
    }
  ]
}