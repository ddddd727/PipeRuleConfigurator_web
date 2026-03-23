import AppLayout from '@/layouts/AppLayout.vue'

export default {
  path: '/pmc',
  component: AppLayout,
  meta: { title: 'PMC编码', icon: 'Cpu' }, // 对应截图名称
  redirect: '/pmc/index',
  children: [
    {
      path: 'index',
      name: 'PmcCode',
      component: () => import('@/apps/rule-configurator/features/pmc/pages/PmcCode.vue'),
      meta: { title: 'PMC规则', keepAlive: true }
    }
  ]
}
