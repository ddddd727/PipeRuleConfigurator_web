export const appNavigationRegistry = [
  {
    id: 'product-standard',
    name: '产品元件标准数据管理',
    entry: '/product-standard/catalog-definition/standard/piping',
    enabled: true,
    order: 1
  },
  {
    id: 'pipe-spec',
    name: '管系规格书管理',
    entry: '/pipe-spec/dict/attribute/piping-class',
    enabled: true,
    order: 2
  },
  {
    id: 'design-rule',
    name: '设计规则管理',
    entry: '/design-rule/design/rule-config',
    enabled: true,
    order: 3
  },
  {
    id: 'engineering',
    name: '工程基础管理',
    entry: '/engineering/s3d-env-config',
    enabled: true,
    order: 4
  },
  {
    id: 'component-ci',
    name: '组件持续集成系统',
    entry: '/component-ci/rapid-deploy',
    enabled: true,
    order: 5
  }
]
