import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'

const Stub = () => import('@/shared/components/StubPage.vue')

export default {
  path: 'catalog-definition',
  component: RouterPassthrough,
  meta: { title: '产品元件标准目录定义', icon: 'FolderOpened', alwaysShow: true },
  redirect: '/product-standard/catalog-definition/standard/piping',
  children: [
    // ① 定义产品元件标准
    {
      path: 'standard',
      component: RouterPassthrough,
      meta: { title: '定义产品元件标准', icon: 'Setting' },
      redirect: '/product-standard/catalog-definition/standard/piping',
      children: [
        { path: 'piping',     name: 'CatalogStdPiping',    component: Stub, meta: { title: '管系',         icon: 'Guide' } },
        { path: 'hvac',       name: 'CatalogStdHvac',      component: Stub, meta: { title: '冷空通',       icon: 'Wind' } },
        { path: 'electrical', name: 'CatalogStdElectrical', component: Stub, meta: { title: '电气',         icon: 'Lightning' } },
        { path: 'outfitting', name: 'CatalogStdOutfitting', component: Stub, meta: { title: '舾装',         icon: 'Ship' } },
        { path: 'interior',   name: 'CatalogStdInterior',  component: Stub, meta: { title: '内舾/酒店工程', icon: 'House' } }
      ]
    },

    // ② 定义产品元件标准的分类
    {
      path: 'classification',
      component: RouterPassthrough,
      meta: { title: '定义标准分类', icon: 'Menu' },
      redirect: '/product-standard/catalog-definition/classification/business',
      children: [
        { path: 'business', name: 'CatalogClassBusiness', component: Stub, meta: { title: '业务分类', icon: 'Briefcase' } },
        {
          path: 's3d',
          component: RouterPassthrough,
          meta: { title: '基于S3D的分类', icon: 'Connection' },
          redirect: '/product-standard/catalog-definition/classification/s3d/piping',
          children: [
            { path: 'piping', name: 'CatalogClassS3dPiping', component: Stub, meta: { title: '管系', icon: 'Guide' } }
          ]
        }
      ]
    },

    // ③ 定义产品元件标准的目录层级
    {
      path: 'hierarchy',
      component: RouterPassthrough,
      meta: { title: '定义目录层级', icon: 'List' },
      redirect: '/product-standard/catalog-definition/hierarchy/piping',
      children: [
        { path: 'piping',     name: 'HierarchyPiping',    component: Stub, meta: { title: '管系',         icon: 'Guide' } },
        { path: 'hvac',       name: 'HierarchyHvac',      component: Stub, meta: { title: '冷空通',       icon: 'Wind' } },
        { path: 'electrical', name: 'HierarchyElectrical', component: Stub, meta: { title: '电气',         icon: 'Lightning' } },
        { path: 'outfitting', name: 'HierarchyOutfitting', component: Stub, meta: { title: '舾装',         icon: 'Ship' } },
        { path: 'interior',   name: 'HierarchyInterior',  component: Stub, meta: { title: '内舾/酒店工程', icon: 'House' } }
      ]
    }
  ]
}
