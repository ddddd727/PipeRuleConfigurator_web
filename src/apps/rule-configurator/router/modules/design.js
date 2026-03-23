import MainLayout from '@/apps/rule-configurator/layouts/MainLayout.vue'

export default {
  path: '/design',
  component: MainLayout,
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
