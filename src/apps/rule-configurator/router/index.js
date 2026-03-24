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
  dictRouter,
  designRouter,
  specRouter,
  pmcRouter,
  pipeRouter,
  libraryRouter,
  propertyRouter,
  standardSequenceRouter
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

export default router
