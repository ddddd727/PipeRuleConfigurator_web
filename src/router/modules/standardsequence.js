import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/standard-sequence',
  component: MainLayout,
  meta: { title: '标准简选', icon: 'List' },
  redirect: '/standard-sequence/index',
  children: [
    {
      path: 'index',
      name: 'StandardSequence',
      component: () => import('@/views/StandardSequence.vue'),
      meta: { title: '标准简选', keepAlive: true }
    }
  ]
}
