import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/pipe-spec', // 路径改个名，避免和字典里的 pipe 混淆
  component: MainLayout,
  meta: { title: '管系规格书', icon: 'Reading', alwaysShow: true }, // 对应截图名称
  redirect: '/pipe-spec/index',
  children: [
    {
      path: 'index',
      name: 'PipeSpec',
      component: () => import('@/views/PipeSpec.vue'),
      meta: { title: '管系规格书配置' }
    }
  ]
}