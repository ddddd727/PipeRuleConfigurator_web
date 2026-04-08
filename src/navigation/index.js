import {
  Box, Document, SetUp, Monitor, Connection, Management
} from '@element-plus/icons-vue'

export const appNavigationRegistry = [
  {
    id: 'product-standard',
    name: '产品元件标准数据管理',
    entry: '/product-standard/catalog-definition/standard/piping',
    enabled: true,
    order: 1,
    desc: '覆盖目录定义、分类层级、标准元件数据结构与S3D基础库维护。',
    logo: Box,
    links: [
      { label: 'S3D对象属性管理', path: '/product-standard/data-management/s3d-property' },
      { label: 'S3D部件数据(管系)', path: '/product-standard/data-management/s3d-component/piping/spec' }
    ]
  },
  {
    id: 'pipe-spec',
    name: '管系规格书管理',
    entry: '/pipe-spec/dict/attribute/piping-class',
    enabled: true,
    order: 2,
    desc: '管理业务属性字典、材料编码规则、管系规格书配置与PCF规则。',
    logo: Document,
    links: [
      { label: '业务属性定义', path: '/pipe-spec/dict/attribute/piping-class' },
      { label: '材料编码', path: '/pipe-spec/material-code/index' }
    ]
  },
  {
    id: 'design-rule',
    name: '设计规则管理',
    entry: '/design-rule/rule-config',
    enabled: true,
    order: 3,
    desc: '对设计规则和生产规则进行统一配置与持续演进。',
    logo: SetUp,
    links: [
      { label: '设计规则', path: '/design-rule/rule-config' },
      { label: '生产规则', path: '/design-rule/production' }
    ]
  },
  {
    id: 'engineering',
    name: '工程基础管理',
    entry: '/engineering/s3d-env-config',
    enabled: true,
    order: 4,
    desc: '工程环境配置与S3D项目服务器资源监控看板。',
    logo: Monitor,
    links: [
      { label: 'S3D工程环境配置', path: '/engineering/s3d-env-config' },
      { label: '服务器资源看板', path: '/engineering/s3d-server-dashboard' }
    ]
  },
  {
    id: 'component-ci',
    name: '组件持续集成系统',
    entry: '/component-ci/rapid-deploy',
    enabled: true,
    order: 5,
    desc: '二次开发快速部署、操作速查手册与使用频次统计看板。',
    logo: Connection,
    links: [
      { label: '快速部署', path: '/component-ci/rapid-deploy' },
      { label: '操作速查', path: '/component-ci/operation-guide' }
    ]
  },
  {
    id: 'code-management',
    name: '编码管理平台',
    entry: '/code-management/code-config',
    enabled: true,
    order: 6,
    desc: '统一管理和维护各类编码规则、编码配置与编码查询。',
    logo: Management,
    links: [
      { label: '编码配置', path: '/code-management/code-config' },
      { label: '编码查询', path: '/code-management/code-query' }
    ]
  }
]
