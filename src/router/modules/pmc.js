import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/pmc',
  component: MainLayout,
  meta: { title: 'PMC编码', icon: 'Cpu' }, // 对应截图名称
  redirect: '/pmc/index',
  children: [
    {
      path: 'index',
      name: 'PmcCode',
      component: () => import('@/views/PmcCode.vue'),
      meta: { title: 'PMC规则' }
    }
  ]
}