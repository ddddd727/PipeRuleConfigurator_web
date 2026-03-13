import { createRouter, createWebHistory } from 'vue-router'

import dictRouter from './modules/dict'
import designRouter from './modules/design'
import specRouter from './modules/spec'
import pmcRouter from './modules/pmc'
import pipeRouter from './modules/pipe'
import libraryRouter from './modules/library'
import propertyRouter from './modules/property'
import standardSequenceRouter from './modules/standardsequence'
export const constantRoutes = [
  // 首页重定向到第一个菜单（字典定义的第一个页面）
  { path: '/', redirect: '/dict/attribute/piping-class' },


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
