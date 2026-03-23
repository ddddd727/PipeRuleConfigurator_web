import AppLayout from '@/layouts/AppLayout.vue'

export default {
  path: '/property',
  component: AppLayout,
  meta: {
    title: '属性管理',
    icon: 'Management'
  },
  redirect: '/property/index',
  children: [
    {
      path: 'index',
      name: 'PropertyManagement',
      component: () => import('@/apps/rule-configurator/features/property/pages/PropertyManagement.vue'),
      meta: { title: '属性管理', keepAlive: true }
    }
  ]
}
