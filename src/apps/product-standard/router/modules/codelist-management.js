import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: 'data-management',
  component: RouterPassthrough,
  meta: { title: '产品元件标准数据管理', icon: 'Grid', alwaysShow: true },
  redirect: '/product-standard/data-management/s3d-property',
  children: [
    {
      path: 's3d-property',
      name: 'S3dPropertyMgmt',
      component: Stub,
      meta: { title: 'S3D对象属性管理', icon: 'Management', keepAlive: true }
    },
    {
      path: 's3d-dict',
      name: 'S3dDictMgmt',
      component: () => import('@/apps/product-standard/features/codelist-management/pages/codelist.vue'),
      meta: { title: 'S3D数据字典管理', icon: 'Reading', keepAlive: true }
    },
    {
      path: 's3d-rule',
      component: RouterPassthrough,
      meta: { title: 'S3D库规则管理', icon: 'SetUp' },
      redirect: '/product-standard/data-management/s3d-rule/all-common',
      children: [
        {
          path: 'all-common',
          name: 'S3dRuleAllCommon',
          component: Stub,
          meta: { title: 'AllCommon', icon: 'Files' }
        }
      ]
    },
    {
      path: 's3d-template',
      name: 'S3dTemplateMgmt',
      component: Stub,
      meta: { title: 'S3D部件模板映射', icon: 'Copy' }
    },
    {
      path: 's3d-component',
      component: RouterPassthrough,
      meta: { title: 'S3D部件数据管理', icon: 'Box', alwaysShow: true },
      redirect: '/product-standard/data-management/s3d-component/structure',
      children: [
        {
          path: 'structure',
          name: 'S3dCompStructure',
          component: Stub,
          meta: { title: '结构', icon: 'Operation' }
        },
        {
          path: 'piping',
          component: RouterPassthrough,
          meta: { title: '管系', icon: 'Guide' },
          redirect: '/product-standard/data-management/s3d-component/piping/spec',
          children: [
            {
              path: 'spec',
              name: 'S3dCompPipingSpec',
              component: () => import('@/apps/product-standard/features/piping-spec-management/pages/pipingSpec.vue'),
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
        {
          path: 'hvac',
          component: RouterPassthrough,
          meta: { title: '风管', icon: 'Wind' },
          redirect: '/product-standard/data-management/s3d-component/hvac/spec',
          children: [
            {
              path: 'spec',
              name: 'S3dCompHvacSpec',
              component: Stub,
              meta: { title: 'SPEC类', icon: 'Document' }
            },
            {
              path: 'part',
              name: 'S3dCompHvacPart',
              component: Stub,
              meta: { title: 'PART类', icon: 'Box' }
            }
          ]
        },
        {
          path: 'electrical',
          component: RouterPassthrough,
          meta: { title: '电气', icon: 'Lightning' },
          redirect: '/product-standard/data-management/s3d-component/electrical/spec',
          children: [
            {
              path: 'spec',
              name: 'S3dCompElecSpec',
              component: Stub,
              meta: { title: 'SPEC类', icon: 'Document' }
            },
            {
              path: 'part',
              name: 'S3dCompElecPart',
              component: Stub,
              meta: { title: 'PART类', icon: 'Box' }
            }
          ]
        },
        {
          path: 'outfitting',
          component: RouterPassthrough,
          meta: { title: '舾装', icon: 'Ship' },
          redirect: '/product-standard/data-management/s3d-component/outfitting/member',
          children: [
            {
              path: 'member',
              name: 'S3dCompOutfittingMember',
              component: Stub,
              meta: { title: 'Member', icon: 'Grid' }
            },
            {
              path: 'slab',
              name: 'S3dCompOutfittingSlab',
              component: Stub,
              meta: { title: 'Slab', icon: 'Crop' }
            }
          ]
        },
        {
          path: 'interior',
          component: RouterPassthrough,
          meta: { title: '内装/酒店工程', icon: 'House' },
          redirect: '/product-standard/data-management/s3d-component/interior/slab',
          children: [
            {
              path: 'slab',
              name: 'S3dCompInteriorSlab',
              component: Stub,
              meta: { title: 'Slab', icon: 'Crop' }
            }
          ]
        }
      ]
    }
  ]
}
