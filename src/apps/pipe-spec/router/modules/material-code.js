import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'

export default {
  path: 'material-code',
  component: RouterPassthrough,
  meta: { title: '材料编码', icon: 'Cpu' },
  redirect: '/pipe-spec/material-code/index',
  children: [
    {
      path: 'index',
      name: 'PmcMaterialCode',
      component: () => import('@/apps/rule-configurator/features/pmc/pages/PmcCode.vue'),
      meta: { title: 'PMC规则', icon: 'List', keepAlive: true }
    }
  ]
}
