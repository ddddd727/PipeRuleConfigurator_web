import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/ship',
  component: MainLayout,
  meta: { 
    title: '船型船号', 
    icon: 'Ship' 
  },
  redirect: '/ship/data',
  children: [
    {
      path: 'data',
      name: 'ShipData',
      component: () => import('@/views/ShipData.vue'),
      meta: { title: '船只列表' }
    }
  ]
}