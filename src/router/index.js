import { createRouter, createWebHistory } from 'vue-router'

// 1. 引入所有独立的路由模块
import dictRouter from './modules/dict'
import basicRouter from './modules/basic'
import specRouter from './modules/spec'
import pmcRouter from './modules/pmc'
import shipRouter from './modules/ship'
import pipeRouter from './modules/pipe'

// 2. 组装路由表
// 这里的顺序决定了左侧菜单栏的显示顺序
export const constantRoutes = [
  // 根路径默认重定向
  { path: '/', redirect: '/dict/business/grade' },

  dictRouter,   // 字典模块
  basicRouter,  // 基础类模块
  specRouter,   // Spec模块
  pmcRouter,    // PMC模块
  shipRouter,   // 船型模块
  pipeRouter,   // 管材模块

  // 404 页面
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

export default router