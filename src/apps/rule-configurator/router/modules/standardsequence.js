import MainLayout from '@/apps/rule-configurator/layouts/MainLayout.vue'

export default {
  path: '/standard-sequence',
  component: MainLayout,
  meta: { title: '标准简选', icon: 'List' },
  redirect: '/standard-sequence/index',
  children: [
    {
      path: 'index',
      name: 'StandardSequence',
      component: () => import('@/apps/rule-configurator/features/standard-sequence/pages/StandardSequence.vue'),
      meta: { title: '标准简选', keepAlive: true }
    }
  ]
}
