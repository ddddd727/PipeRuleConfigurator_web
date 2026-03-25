import AppLayout from '@/layouts/AppLayout.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: '/component-ci',
  component: AppLayout,
  meta: { title: '组件持续集成系统', icon: 'Connection' },
  redirect: '/component-ci/rapid-deploy',
  children: [
    {
      path: 'rapid-deploy',
      name: 'RapidDeploy',
      component: Stub,
      meta: { title: '二次开发快速部署', icon: 'Promotion' }
    },
    {
      path: 'operation-guide',
      name: 'OperationGuide',
      component: Stub,
      meta: { title: '二次开发操作速查', icon: 'QuestionFilled' }
    },
    {
      path: 'usage-statistics',
      name: 'UsageStatistics',
      component: Stub,
      meta: { title: '使用频次统计看板', icon: 'TrendCharts' }
    }
  ]
}
