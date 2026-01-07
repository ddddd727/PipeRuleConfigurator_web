import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/spec',
  component: MainLayout,
  meta: { 
    title: 'Spec规格书', 
    icon: 'Tools' 
  },
  redirect: '/spec/manager',
  children: [
    {
      path: 'manager',
      name: 'SpecConfig',
      component: () => import('@/views/SpecConfig.vue'),
      meta: { title: '规格书管理' }
    }
  ]
}