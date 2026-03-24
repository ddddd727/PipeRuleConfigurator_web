import AppLayout from '@/layouts/AppLayout.vue'

export default {
  path: '/pipe-spec', // 路径改个名，避免和字典里的 pipe 混淆
  component: AppLayout,
  meta: { title: '管系规格书', icon: 'Reading', alwaysShow: true }, // 对应截图名称
  redirect: '/pipe-spec/index',
  children: [
    {
      path: 'index',
      name: 'PipeSpec',
      component: () => import('@/apps/rule-configurator/features/pipe/pages/PipeSpec.vue'),
      meta: { title: '管系规格书配置' }
    },
    {
      path: 'filter-config',
      name: 'PipeSpecFilterConfig',
      component: () => import('@/apps/rule-configurator/features/pipe/pages/PipeSpecFilterConfig.vue'),
      meta: { title: 'Filter配置页面' }
    }
  ]
}