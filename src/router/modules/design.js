import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/design',
  component: MainLayout,
  redirect: '/design/index',
  children: [
    {
      path: 'rule-config',
      name: 'DesignRuleConfig',
      component: () => import('@/views/DesignRuleConfig.vue'),
      meta: { title: '设计规则类', icon: 'Guide' }
    }
  ]
}