import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: 'standard-selection',
  component: RouterPassthrough,
  meta: { title: '标准简选定义', icon: 'Tickets', alwaysShow: true },
  redirect: '/product-standard/standard-selection/definition',
  children: [
    {
      path: 'definition',
      name: 'StdSelectionDefinition',
      component: () => import('@/apps/rule-configurator/features/standard-sequence/pages/StandardSequence.vue'),
      meta: { title: '简选标准定义', icon: 'List', keepAlive: true }
    },
    {
      path: 'data-structure',
      name: 'StdSelectionDataStructure',
      component: Stub,
      meta: { title: '简选标准数据结构定义', icon: 'DataLine' }
    },
    {
      path: 'data-definition',
      name: 'StdSelectionDataDefinition',
      component: Stub,
      meta: { title: '简选标准数据定义', icon: 'DocumentChecked' }
    }
  ]
}
