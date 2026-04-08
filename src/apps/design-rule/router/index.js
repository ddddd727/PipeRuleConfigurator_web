import AppLayout from '@/layouts/AppLayout.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: '/design-rule',
  component: AppLayout,
  meta: { title: '设计规则管理', icon: 'SetUp' },
  redirect: '/design-rule/rule-config',
  children: [
    {
      path: 'rule-config',
      name: 'DesignRuleConfig',
      component: () => import('@/apps/design-rule/features/design/pages/DesignRuleConfig.vue'),
      meta: { title: '设计规则', icon: 'Guide', keepAlive: true }
    },
    {
      path: 'production',
      name: 'ProductionRule',
      component: Stub,
      meta: { title: '生产规则', icon: 'Cpu' }
    }
  ]
}
