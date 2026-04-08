import AppLayout from '@/layouts/AppLayout.vue'
import dictRouter from './modules/dict'
import materialCodeRuleRouter from './modules/material-code-rule'
import materialCodeRouter from './modules/material-code'
import specificationRouter from './modules/specification'

export default {
  path: '/pipe-spec',
  component: AppLayout,
  meta: { title: '管系规格书管理', icon: 'Document' },
  redirect: '/pipe-spec/dict/attribute/piping-class',
  children: [
    dictRouter,
    materialCodeRuleRouter,
    materialCodeRouter,
    specificationRouter
  ]
}
