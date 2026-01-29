import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layout/MainLayout.vue'
import StandardSequence from '@/views/StandardSequence.vue'

import dictRouter from './modules/dict'
import designRouter from './modules/design'
import specRouter from './modules/spec'
import pmcRouter from './modules/pmc'
import pipeRouter from './modules/pipe'
import libraryRouter from './modules/library'
import propertyRouter from './modules/property'
export const constantRoutes = [
  // 首页重定向到第一个菜单（字典定义的第一个页面）
  { path: '/', redirect: '/dict/attribute/std-series' },


  dictRouter,
  designRouter,
  specRouter,
  pmcRouter,
  pipeRouter,
  libraryRouter,
  propertyRouter,
  {
    path: '/standard-sequence',
    component: MainLayout,
    meta: {
      title: '标准序列',
      icon: 'List'
    },
    redirect: '/standard-sequence/index',
    children: [
      {
        path: 'index',
        name: 'StandardSequence',
        component: StandardSequence,
        meta: {
          title: '标准序列'
        }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

export default router
