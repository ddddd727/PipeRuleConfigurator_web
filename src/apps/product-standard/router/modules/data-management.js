import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: 'data-management',
  component: RouterPassthrough,
  meta: { title: '产品元件标准数据管理', icon: 'Grid', alwaysShow: true },
  redirect: '/product-standard/data-management/s3d-property',
  children: [
    // S3D对象属性管理
    {
      path: 's3d-property',
      name: 'S3dPropertyMgmt',
      component: Stub,
      meta: { title: 'S3D对象属性管理', icon: 'Management', keepAlive: true }
    },

    // S3D数据字典管理
    {
      path: 's3d-dict',
      name: 'S3dDictMgmt',
      component: Stub,
      meta: { title: 'S3D数据字典管理', icon: 'Reading' }
    },

    // S3D库规则管理
    {
      path: 's3d-rule',
      component: RouterPassthrough,
      meta: { title: 'S3D库规则管理', icon: 'SetUp' },
      redirect: '/product-standard/data-management/s3d-rule/all-common',
      children: [
        { path: 'all-common', name: 'S3dRuleAllCommon', component: Stub, meta: { title: 'AllCommon', icon: 'Files' } }
      ]
    },

    // S3D部件模板映射
    {
      path: 's3d-template',
      name: 'S3dTemplateMgmt',
      component: Stub,
      meta: { title: 'S3D部件模板映射', icon: 'Copy' }
    },

    // S3D部件数据管理
    {
      path: 's3d-component',
      component: RouterPassthrough,
      meta: { title: 'S3D部件数据管理', icon: 'Box', alwaysShow: true },
      redirect: '/product-standard/data-management/s3d-component/structure',
      children: [
        // 结构
        { path: 'structure', name: 'S3dCompStructure', component: Stub, meta: { title: '结构', icon: 'Operation' } },

        // 管系
        {
          path: 'piping',
          component: RouterPassthrough,
          meta: { title: '管系', icon: 'Guide' },
          redirect: '/product-standard/data-management/s3d-component/piping/spec',
          children: [
            {
              path: 'spec',
              name: 'S3dCompPipingSpec',
              component: Stub,
              meta: { title: 'SPEC类', icon: 'Document', keepAlive: true }
            },
            {
              path: 'part',
              name: 'S3dCompPipingPart',
              component: Stub,
              meta: { title: 'PART类', icon: 'Box', keepAlive: true }
            }
          ]
        },

        // 冷空通
        {
          path: 'hvac',
          component: RouterPassthrough,
          meta: { title: '冷空通', icon: 'Wind' },
          redirect: '/product-standard/data-management/s3d-component/hvac/spec',
          children: [
            { path: 'spec', name: 'S3dCompHvacSpec', component: Stub, meta: { title: 'SPEC类', icon: 'Document' } },
            { path: 'part', name: 'S3dCompHvacPart', component: Stub, meta: { title: 'PART类', icon: 'Box' } }
          ]
        },

        // 电气
        {
          path: 'electrical',
          component: RouterPassthrough,
          meta: { title: '电气', icon: 'Lightning' },
          redirect: '/product-standard/data-management/s3d-component/electrical/spec',
          children: [
            { path: 'spec', name: 'S3dCompElecSpec', component: Stub, meta: { title: 'SPEC类', icon: 'Document' } },
            { path: 'part', name: 'S3dCompElecPart', component: Stub, meta: { title: 'PART类', icon: 'Box' } }
          ]
        },

        // 舾装
        {
          path: 'outfitting',
          component: RouterPassthrough,
          meta: { title: '舾装', icon: 'Ship' },
          redirect: '/product-standard/data-management/s3d-component/outfitting/member',
          children: [
            { path: 'member', name: 'S3dCompOutfittingMember', component: Stub, meta: { title: 'Member', icon: 'Grid' } },
            { path: 'slab',   name: 'S3dCompOutfittingSlab',   component: Stub, meta: { title: 'Slab',   icon: 'Crop' } }
          ]
        },

        // 内舾/酒店工程
        {
          path: 'interior',
          component: RouterPassthrough,
          meta: { title: '内舾/酒店工程', icon: 'House' },
          redirect: '/product-standard/data-management/s3d-component/interior/slab',
          children: [
            { path: 'slab', name: 'S3dCompInteriorSlab', component: Stub, meta: { title: 'Slab', icon: 'Crop' } }
          ]
        }
      ]
    }
  ]
}
