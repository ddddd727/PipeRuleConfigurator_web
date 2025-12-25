import { createRouter, createWebHistory } from 'vue-router'

// 1. 引入所有独立的路由模块
import dictRouter from './modules/dict'
import designRouter from './modules/design'
import specRouter from './modules/spec'
import pmcRouter from './modules/pmc'
import pipeRouter from './modules/pipe'
import libraryRouter from './modules/library'
import s3dRouter from './modules/s3d'

export const constantRoutes = [
  // 首页重定向到第一个菜单（字典定义的第一个页面）
  { path: '/', redirect: '/dict/attribute/std-series' },

  // ===================================
  // 按照截图顺序排列 7 个一级菜单
  // ===================================
  dictRouter,     // 1. 字典定义
  designRouter,   // 2. 设计规则类
  specRouter,     // 3. Spec配置
  pmcRouter,      // 4. PMC编码
  pipeRouter,     // 5. 管材规格书配置
  libraryRouter,  // 6. 基础库
  s3dRouter,      // 7. S3D属性管理

  // 404 页面
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

export default router