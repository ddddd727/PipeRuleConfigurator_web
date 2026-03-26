export default {
  path: 'specification',
  component: () => import('@/layouts/components/RouterPassthrough.vue'),
  meta: { title: '管系规格书', icon: 'Document', alwaysShow: true },
  redirect: '/pipe-spec/specification/config',
  children: [
    {
      path: 'config',
      name: 'PipeSpecConfig',
      component: () => import('@/apps/pipe-spec/features/pipe/pages/PipeSpec.vue'),
      meta: { title: '管系规格书配置', icon: 'Setting', keepAlive: true }
    },
    {
      path: 'pcf-rule',
      name: 'PipeSpecPcfRule',
      component: () => import('@/apps/pipe-spec/features/pipe/pages/PipeSpecFilterConfig.vue'),
      meta: { title: 'PCF规则配置', icon: 'Filter', keepAlive: true }
    }
  ]
}
