import MainLayout from '@/layout/MainLayout.vue'

export default {
  path: '/library',
  component: MainLayout,
  meta: { title: '基础库', icon: 'Box' },
  redirect: '/library/pipe',
  children: [
    {
      path: 'codelist',
      name: 'CodelistLibrary',
      component: () => import('@/views/BasicLibrary.vue'),
      meta: { title: 'Codelist管理', icon: 'Menu' }
    },
    {
      path: 'pipe',
      name: 'PipeLibrary',
      component: () => import('@/views/BasicLibrary.vue'), 
      meta: { title: '管系专业', icon: 'Menu' }
    },
    {
      path: 'duct',
      name: 'DuctLibrary',
      component: () => import('@/views/BasicLibrary.vue'), 
      meta: { title: '风管专业', icon: 'Menu' }
    },
    {
      path: 'electrical',
      name: 'ElectricalLibrary',
      component: () => import('@/views/BasicLibrary.vue'), 
      meta: { title: '电气专业', icon: 'Menu' }
    },
    {
      path: 'outfitting',
      name: 'OutfittingLibrary',
      component: () => import('@/views/BasicLibrary.vue'), 
      meta: { title: '铁舾&内装专业', icon: 'Menu' }
    }
  ]
}