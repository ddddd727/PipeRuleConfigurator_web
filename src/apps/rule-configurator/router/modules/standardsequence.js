import AppLayout from '@/layouts/AppLayout.vue'

export default {
  path: '/standard-sequence',
  component: AppLayout,
  meta: { title: '标准简选', icon: 'List' },
  redirect: '/standard-sequence/config',
  children: [
    {
      path: 'config',
      name: 'StandardSequenceConfig',
      component: () => import('@/apps/rule-configurator/features/standard-sequence/pages/StandardSequence.vue'),
      meta: { title: '简选序列配置', keepAlive: true }
    },
    {
      path: 'dashboard',
      name: 'StandardSequenceDashboard',
      component: () => import('@/apps/rule-configurator/features/standard-sequence/pages/StandardSequence.vue'),
      meta: { title: '看板', keepAlive: true }
    }
  ]
}
