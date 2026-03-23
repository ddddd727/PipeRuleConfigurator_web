import MainLayout from '@/apps/rule-configurator/layouts/MainLayout.vue'

export default {
  path: '/property',
  component: MainLayout,
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
