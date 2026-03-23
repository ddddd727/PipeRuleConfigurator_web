import AppLayout from '@/layouts/AppLayout.vue'

export default {
  path: '/design',
  component: AppLayout,
  redirect: '/design/index',
  children: [
    {
      path: 'rule-config',
      name: 'DesignRuleConfig',
      component: () => import('@/apps/rule-configurator/features/design/pages/DesignRuleConfig.vue'),
      meta: { title: '设计规则类', icon: 'Guide', keepAlive: true }
    }
  ]
}
