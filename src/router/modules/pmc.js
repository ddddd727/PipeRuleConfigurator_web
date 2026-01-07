import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/pmc',
  component: MainLayout,
  meta: { 
    title: 'PMC编码规则', 
    icon: 'Connection' 
  },
  redirect: '/pmc/rules',
  children: [
    {
      path: 'rules',
      name: 'PmcCode',
      component: () => import('@/views/PmcCode.vue'),
      meta: { title: '编码规则' }
    }
  ]
}