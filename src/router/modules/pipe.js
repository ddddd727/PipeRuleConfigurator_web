import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/pipe',
  component: MainLayout,
  meta: { 
    title: '管材规格书', 
    icon: 'Document' 
  },
  redirect: '/pipe/spec',
  children: [
    {
      path: 'spec',
      name: 'PipeSpec',
      component: () => import('@/views/PipeSpec.vue'),
      meta: { title: '管材数据' }
    }
  ]
}