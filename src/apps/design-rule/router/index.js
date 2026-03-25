import AppLayout from '@/layouts/AppLayout.vue'
import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: '/design-rule',
  component: AppLayout,
  meta: { title: '设计规则管理', icon: 'SetUp' },
  redirect: '/design-rule/design/rule-config',
  children: [
    // 设计规则
    {
      path: 'design',
      component: RouterPassthrough,
      meta: { title: '设计规则', icon: 'Guide', alwaysShow: true },
      redirect: '/design-rule/design/rule-config',
      children: [
        {
          path: 'rule-config',
          name: 'DesignRuleConfig',
          component: () => import('@/apps/rule-configurator/features/design/pages/DesignRuleConfig.vue'),
          meta: { title: '设计规则类', icon: 'Guide', keepAlive: true }
        },
        {
          path: 'spec-list',
          name: 'DesignSpecList',
          component: () => import('@/apps/rule-configurator/features/spec/pages/SpecConfig.vue'),
          meta: { title: 'Spec列表', icon: 'List', keepAlive: true }
        }
      ]
    },

    // 生产规则
    {
      path: 'production',
      component: RouterPassthrough,
      meta: { title: '生产规则', icon: 'Cpu', alwaysShow: true },
      redirect: '/design-rule/production/index',
      children: [
        {
          path: 'index',
          name: 'ProductionRule',
          component: Stub,
          meta: { title: '生产规则配置', icon: 'Cpu' }
        }
      ]
    }
  ]
}
