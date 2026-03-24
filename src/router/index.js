import { createRouter, createWebHistory } from 'vue-router'
import PortalLayout from '@/layouts/PortalLayout.vue'
import { constantRoutes as appRoutes } from '@/apps/rule-configurator/router'

export const constantRoutes = [
  {
    path: '/',
    name: 'PortalHome',
    component: PortalLayout,
    hidden: true,
    meta: { title: '系统门户', hidden: true }
  },
  ...appRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

export default router
