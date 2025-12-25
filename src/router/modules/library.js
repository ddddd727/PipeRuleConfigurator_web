import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/library',
  component: MainLayout,
  meta: { title: '基础库', icon: 'Box' }, // 对应截图名称
  redirect: '/library/index',
  children: [
    {
      path: 'index',
      name: 'BasicLibrary',
      // 如果没有这个页面，先用个临时组件占位，或者指向 BasicClass
      component: () => import('@/views/BasicClass.vue'), 
      meta: { title: '基础库列表' }
    }
  ]
}