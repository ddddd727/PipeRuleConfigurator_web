import AppLayout from '@/layouts/AppLayout.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: '/code-management',
  component: AppLayout,
  meta: { title: 'S3D-编码平台集成管理', icon: 'DataAnalysis' },
  redirect: '/code-management/code-config',
  children: [
    {
      path: 'code-config',
      name: 'CodeConfig',
      component: Stub,
      meta: { title: '编码配置', icon: 'Setting' }
    },
    {
      path: 'code-query',
      name: 'CodeQuery',
      component: Stub,
      meta: { title: '编码查询', icon: 'Search' }
    }
  ]
}
