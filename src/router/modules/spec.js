import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/spec',
  component: MainLayout,
  meta: { title: 'Spec配置', icon: 'Document' }, // 对应截图名称
  redirect: '/spec/index',
  children: [
    {
      path: 'index',
      name: 'SpecConfig',
      component: () => import('@/views/SpecConfig.vue'),
      meta: { title: 'Spec列表' }
    }
  ]
}