import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'

export default {
  path: 'standard-selection',
  component: RouterPassthrough,
  meta: { title: '标准简选定义', icon: 'Tickets', alwaysShow: true },
  redirect: '/product-standard/standard-selection/definition',
  children: [
    {
      path: 'definition',
      name: 'StdSelectionDefinition',
      component: () => import('@/apps/product-standard/features/standard-sequence/pages/StandardSequence.vue'),
      meta: { title: '简选标准定义', icon: 'List', keepAlive: true }
    },
    {
      path: 'preview-dashboard',
      name: 'StandardSequenceDashboard',
      component: () => import('@/apps/product-standard/features/standard-sequence/pages/StandardSequence.vue'),
      meta: { title: '简选标准预览看板', icon: 'DataBoard', keepAlive: true }
    }
  ]
}
