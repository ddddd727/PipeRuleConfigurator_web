import AppLayout from '@/layouts/AppLayout.vue'
import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'
import dictRouter from './modules/dict'
import materialCodeRouter from './modules/material-code'
import specificationRouter from './modules/specification'

export default {
  path: '/pipe-spec',
  component: AppLayout,
  meta: { title: '管系规格书管理', icon: 'Document' },
  redirect: '/pipe-spec/dict/attribute/piping-class',
  children: [
    dictRouter,
    {
      path: 'material-code-rule',
      name: 'MaterialCodeRule',
      component: () => import('@/shared/components/StubPage.vue'),
      meta: { title: '材料编码规则', icon: 'EditPen' }
    },
    materialCodeRouter,
    specificationRouter
  ]
}
