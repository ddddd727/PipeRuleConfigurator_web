import AppLayout from '@/layouts/AppLayout.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: '/engineering',
  component: AppLayout,
  meta: { title: 'S3D工程基础管理', icon: 'Monitor' },
  redirect: '/engineering/s3d-env-config',
  children: [
    {
      path: 's3d-env-config',
      name: 'S3dEnvConfig',
      component: Stub,
      meta: { title: 'S3D工程环境配置', icon: 'Setting' }
    },
    {
      path: 's3d-server-dashboard',
      name: 'S3dServerDashboard',
      component: Stub,
      meta: { title: 'S3D项目服务器资源看板', icon: 'DataAnalysis' }
    }
  ]
}
