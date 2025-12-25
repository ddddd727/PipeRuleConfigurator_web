import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/s3d',
  component: MainLayout,
  meta: { title: 'S3D属性管理', icon: 'SetUp' }, // 对应截图名称
  redirect: '/s3d/index',
  children: [
    {
      path: 'index',
      name: 'S3DManager',
      // 如果没有这个页面，先用个临时组件占位
      component: () => import('@'), 
      meta: { title: '属性列表' }
    }
  ]
}