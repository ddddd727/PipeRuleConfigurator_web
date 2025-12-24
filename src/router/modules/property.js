import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/property',
  component: MainLayout,
  meta: { 
    title: '属性管理', 
    icon: 'Management' 
  },
  redirect: '/property/list',
  children: [
    {
      path: 'list',
      name: 'PropertyManagement',
      component: () => import('@/views/PropertyManagement.vue'),
      meta: { title: '属性列表' }
    }
  ]
}
