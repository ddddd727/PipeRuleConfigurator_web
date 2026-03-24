import { createRouter, createWebHistory } from 'vue-router'

import dictRouter from './modules/dict'
import designRouter from './modules/design'
import specRouter from './modules/spec'
import pmcRouter from './modules/pmc'
import pipeRouter from './modules/pipe'
import libraryRouter from './modules/library'
import propertyRouter from './modules/property'
import standardSequenceRouter from './modules/standardsequence'
import PortalLayout from '@/layout/PortalLayout.vue'
export const constantRoutes = [
  // 首页直接进入门户页面，不再跳转到字典页
  { path: '/', component: PortalLayout, hidden: true },


  dictRouter,
  designRouter,
  specRouter,
  pmcRouter,
  pipeRouter,
  libraryRouter,
  propertyRouter,
  standardSequenceRouter,
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

export default router
