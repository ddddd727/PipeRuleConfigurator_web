import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'

export default {
  path: 'specification',
  component: RouterPassthrough,
  meta: { title: '管系规格书', icon: 'Document', alwaysShow: true },
  redirect: '/pipe-spec/specification/spec-list',
  children: [
    {
      path: 'spec-list',
      name: 'PipeSpecList',
      component: () => import('@/apps/rule-configurator/features/spec/pages/SpecConfig.vue'),
      meta: { title: 'Spec列表', icon: 'List', keepAlive: true }
    },
    {
      path: 'config',
      name: 'PipeSpecConfig',
      component: () => import('@/apps/rule-configurator/features/pipe/pages/PipeSpec.vue'),
      meta: { title: '管系规格书配置', icon: 'Setting', keepAlive: true }
    },
    {
      path: 'pcf-rule',
      name: 'PipeSpecPcfRule',
      component: () => import('@/apps/rule-configurator/features/pipe/pages/PipeSpecFilterConfig.vue'),
      meta: { title: 'PCF规则配置', icon: 'Filter', keepAlive: true }
    }
  ]
}
