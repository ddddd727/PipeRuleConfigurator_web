import MainLayout from '@/apps/rule-configurator/layouts/MainLayout.vue'

export default {
  path: '/library',
  component: MainLayout,
  meta: { title: '基础库', icon: 'Box' },
  redirect: '/library/pipe',
  children: [
    {
      path: 'codelist',
      name: 'CodelistLibrary',
      component: () => import('@/apps/rule-configurator/features/library/pages/BasicLibrary.vue'),
      meta: { title: 'Codelist管理', icon: 'Menu', keepAlive: true }
    },
    {
      path: 'pipe',
      name: 'PipeLibrary',
      component: () => import('@/apps/rule-configurator/features/library/pages/BasicLibrary.vue'), 
      meta: { title: '管系专业', icon: 'Menu', keepAlive: true }
    },
    {
      path: 'duct',
      name: 'DuctLibrary',
      component: () => import('@/apps/rule-configurator/features/library/pages/BasicLibrary.vue'), 
      meta: { title: '风管专业', icon: 'Menu', keepAlive: true }
    },
    {
      path: 'electrical',
      name: 'ElectricalLibrary',
      component: () => import('@/apps/rule-configurator/features/library/pages/BasicLibrary.vue'), 
      meta: { title: '电气专业', icon: 'Menu', keepAlive: true }
    },
    {
      path: 'outfitting',
      name: 'OutfittingLibrary',
      component: () => import('@/apps/rule-configurator/features/library/pages/BasicLibrary.vue'), 
      meta: { title: '铁舾&内装专业', icon: 'Menu', keepAlive: true }
    }
  ]
}
