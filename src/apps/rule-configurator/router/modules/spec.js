import MainLayout from '@/apps/rule-configurator/layouts/MainLayout.vue'

export default {
  path: '/spec',
  component: MainLayout,
  meta: { title: 'Spec配置', icon: 'Document' }, // 对应截图名称
  redirect: '/spec/index',
  children: [
    {
      path: 'index',
      name: 'SpecConfig',
      component: () => import('@/apps/rule-configurator/features/spec/pages/SpecConfig.vue'),
      meta: { title: 'Spec列表', keepAlive: true }
    }
  ]
}
