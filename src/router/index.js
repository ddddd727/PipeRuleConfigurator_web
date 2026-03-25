import { createRouter, createWebHistory } from 'vue-router'
import PortalLayout from '@/layouts/PortalLayout.vue'
import pipeSpecRoute from '@/apps/pipe-spec/router'
import productStandardRoute from '@/apps/product-standard/router'
import designRuleRoute from '@/apps/design-rule/router'
import engineeringRoute from '@/apps/engineering/router'
import componentCiRoute from '@/apps/component-ci/router'

export const constantRoutes = [
  {
    path: '/',
    name: 'PortalHome',
    component: PortalLayout,
    hidden: true,
    meta: { title: '系统门户', hidden: true }
  },
  pipeSpecRoute,
  productStandardRoute,
  designRuleRoute,
  engineeringRoute,
  componentCiRoute,
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

export default router
