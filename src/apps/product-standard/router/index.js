import AppLayout from '@/layouts/AppLayout.vue'
import catalogDefinitionRouter from './modules/catalog-definition'
import dataStructureRouter from './modules/data-structure'
import dataManagementRouter from './modules/data-management'
import standardSelectionRouter from './modules/standard-selection'

export default {
  path: '/product-standard',
  component: AppLayout,
  meta: { title: '产品元件标准数据管理', icon: 'Box' },
  redirect: '/product-standard/catalog-definition/standard/piping',
  children: [
    catalogDefinitionRouter,
    dataStructureRouter,
    dataManagementRouter,
    standardSelectionRouter
  ]
}
