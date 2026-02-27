import Mock from 'mockjs'
// 导入管道规格配置相关的Mock数据
// 已禁用 PipeSpec 相关的 mock，使用真实 API
// import './modules/PipeSpecConfigInfo/ReferenceInfo.js'

Mock.setup({
  timeout: '200-600'
})

export const db = {
  // 1. A-管材等级 (grade)
  'grade': {
    title: 'A-管材等级配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'code', label: '等级代码' },
      // 【关键点】开启筛选
      { prop: 'name', label: '等级名称', filterable: true },
      { prop: 'desc', label: '说明' },
      // 【关键点】开启筛选
      { prop: 'status', label: '状态', filterable: true, width: 100 }
    ],
    'data|5-10': [{
      'id|+1': 1,
      'code': /CL[1-9]00/,
      'name|1': ['普通级', '高级', '特级', '核一级'],
      'desc': '@csentence(5, 10)',
      'status|1': ['启用', '停用']
    }]
  },

  // 2. A-管材标准 (pipe-std) —— 你专门提到的例子
  'pipe-std': {
    title: 'A-管材标准配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      // 【关键点】标准号下拉筛选
      { prop: 'stdNo', label: '标准号', filterable: true },
      { prop: 'name', label: '标准名称' },
      // 【关键点】年份下拉筛选
      { prop: 'year', label: '年份版本', filterable: true, width: 120 }
    ],
    'data|15-20': [{ // 生成多一点数据方便测试筛选
      'id|+1': 1,
      'stdNo|1': ['ASTM A106', 'ASTM A53', 'API 5L', 'ASTM A333'],
      'name': '@ctitle(4, 8)',
      'year|1': ['2018', '2019', '2020', '2021', '2022']
    }]
  },

  // 3. B1-主材料 (main-material)
  'main-material': {
    title: 'B1-主材料配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'name', label: '材料名称', filterable: true },
      { prop: 'type', label: '材料类型', filterable: true },
      { prop: 'density', label: '密度 (g/cm³)' }
    ],
    'data|10': [{
      'id|+1': 1,
      'name|1': ['碳钢', '不锈钢', '合金钢', '铜', '铝合金'],
      'type|1': ['金属', '非金属'],
      'density': '@float(2, 9, 2, 2)'
    }]
  },

  // 4. B-牌号 (material-grade)
  'material-grade': {
    title: 'B-牌号配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'grade', label: '牌号', filterable: true },
      { prop: 'carbon', label: '碳含量(%)' },
      { prop: 'tensile', label: '抗拉强度(MPa)' }
    ],
    'data|10': [{
      'id|+1': 1,
      'grade': /[A-Z]{2,3}-\d{2,3}/,
      'carbon': '@float(0.1, 0.5, 2, 2)',
      'tensile': '@integer(300, 600)'
    }]
  },

  // 5. C1-法兰标准 (flange-std)
  'flange-std': {
    title: 'C1-法兰标准配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'stdCode', label: '标准代码', filterable: true },
      { prop: 'system', label: '体系', filterable: true },
      { prop: 'faceType', label: '密封面类型', filterable: true }
    ],
    'data|8': [{
      'id|+1': 1,
      'stdCode|1': ['ASME B16.5', 'EN 1092-1', 'JIS B2220', 'GB/T 9119'],
      'system|1': ['美标', '欧标', '日标', '国标'],
      'faceType|1': ['RF', 'FF', 'RTJ', 'MFM']
    }]
  },

  // 6. C2-法兰压力等级 (flange-pressure)
  'flange-pressure': {
    title: 'C2-法兰压力等级',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'class', label: '压力等级', filterable: true },
      { prop: 'pn', label: 'PN值 (MPa)' },
      { prop: 'desc', label: '备注' }
    ],
    'data|6': [{
      'id|+1': 1,
      'class|+1': ['150LB', '300LB', '600LB', '900LB', '1500LB', '2500LB'],
      'pn': '@float(1, 42, 1, 1)',
      'desc': '@ctitle(2, 5)'
    }]
  },

  // 7. D-壁厚等级 (wall-thickness)
  'wall-thickness': {
    title: 'D-壁厚等级配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'sch', label: 'Schedule', filterable: true },
      { prop: 'thickness', label: '壁厚 (mm)' },
      { prop: 'stdRef', label: '参考标准' }
    ],
    'data|10': [{
      'id|+1': 1,
      'sch|+1': ['Sch10', 'Sch20', 'Sch30', 'STD', 'Sch40', 'Sch60', 'XS', 'Sch80', 'Sch120', 'Sch160'],
      'thickness': '@float(2, 30, 1, 2)',
      'stdRef': 'ASME B36.10M'
    }]
  },

  // 8. 接口表 (interface-table)
  'interface-table': {
    title: '系统接口定义表',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'name', label: '接口名称' },
      { prop: 'source', label: '源系统', filterable: true },
      { prop: 'target', label: '目标系统', filterable: true },
      { prop: 'method', label: '交互方式', filterable: true }
    ],
    'data|5': [{
      'id|+1': 1,
      'name': '@ctitle(4, 10)接口',
      'source|1': ['PDM', 'ERP', 'MES'],
      'target|1': ['RuleConfig', 'SAP', 'CAD'],
      'method|1': ['REST API', 'SOAP', 'DB Link']
    }]
  },

  // 9. 国标系列 (std-gb)
  'std-gb': {
    title: 'GB 国标系列配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'gbNo', label: '国标号', filterable: true },
      { prop: 'name', label: '中文名称' },
      { prop: 'status', label: '现行状态', filterable: true }
    ],
    'data|5-10': [{
      'id|+1': 1,
      'gbNo': /GB\/T \d{4}-\d{4}/,
      'name': '@ctitle(5, 12)',
      'status|1': ['现行', '废止', '即将实施']
    }]
  },

  // 1. 弯管数据 (bend-pipe)
  'bend-pipe': {
    title: '部件库名称：PlainPipingGenericData',
    'data|5': [{
      'id|+1': 1,
      'diameter|1': ['DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50'],
      'unit': 'mm',
      'l1|100-500': 1,
      'l2|100-500': 1
    }]
  },

  // 2. 壁厚系列 (wall-thickness-series)
  'wall-thickness-series': {
    title: '部件库名称：PlainPipingGenericData',
    'data|5': [{
      'id|+1': 1,
      'diameter|1': ['DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50'],
      'unit': 'mm',
      'standard|1': ['ASTM A106', 'GB/T 8163', 'ASTM A53'],
      'series|1': ['Sch10', 'Sch20', 'Sch40', 'Sch80', 'Sch160'],
      'outer|20-200': 1,
      'value|1.0-10.0': 1
    }]
  },

  // 3. ShortCode (shortcode)
  'shortcode': {
    title: '部件库名称：ShortCodeHierarchyRule',
    'data|5': [{
      'id|+1': 1,
      'type|1': ['PIPE', 'VALVE', 'FLANGE', 'FITTING', 'INSTRUMENT', 'EQUIPMENT'],
      'shortcode|1': ['管道', '阀门', '法兰', '管件', '仪表', '设备']
    }]
  },

  // 4. Spec (spec)
  'spec': {
    title: '部件库名称：PipingCommodityFilter',
    'data|5': [{
      'id|+1': 1,
      'shortcode|1': ['管道', '阀门', '法兰', '管件', '仪表', '设备']
    }]
  },

  // 基础库 mock 数据
  'library-tree': {
    data: [
      {
        label: '01 管材',
        children: [
          { label: '不锈钢管', children: [{ label: 'GB/T 14976-2012' }, { label: '双相不锈钢管' }] },
          { label: '铜管' },
          { label: '无缝钢管' },
          { label: '有缝钢管' }
        ]
      },
      {
        label: '02 弯头',
        children: [
          { label: '承插弯头' },
          { label: '对焊弯头' },
          { label: '排气管虾壳弯' }
        ]
      },
      { label: '03 异径' },
      { label: '04 法兰' },
      { label: '05 三通' },
      { label: '06 垫片' },
      { label: '07 紧固件' },
      { label: '08 阀附件' },
      { label: '09 漏水口' },
      { label: '10 漏油口' },
      { label: '11 套管', children: [
        { 
          label: '连接套管', 
          children: [
            { label: 'Q/SWS 34-010-2021 ConnectionSleeve' },
            { label: 'Q/SWS 34-071-2021' },
            { label: 'Q/SWS 34-077-2021' }
          ]
        },
        { label: '单头套管' },
        { label: '保护套管' },
        { label: '合拢套管' },
        { label: '承插插头' },
        { label: '直通接头' }
      ]},
      { label: '12 设备' },
      { label: '13 膨胀节' },
      { label: '14 焊接座' },
      { label: '15 通岸接头' }
    ]
  },
  'codelist-tree': {
    data: [
      {
        label: 'Allcodelist',
        children: [
          { label: 'BoltingRequirements' },
          { label: 'BoltOption' },
          { label: 'BoltType' },
          { label: 'CoatingType' },
          { label: 'CommodityOption' },
          { label: 'ControlPointSubType' },
          { label: 'ControlPointType' },
          { label: 'EndPreparation' },
          { label: 'EndStandard' },
          { label: 'FabricationType' },
          { label: 'FlowDirection' },
          { label: 'GasketOption' },
          { label: 'GeometricIndustryStandard' },
          { label: 'MaterialsGrade' },
          { label: 'PipingCommodityType' },
          { label: 'PressureRating' },
          { label: 'ScheduleThickness' }
        ]
      }
    ]
  },
  'library-component-details': {
    ccCode: 'PCSSA23',
    wallThickness: 'Sch.40',
    material: '20#',
    partClassName: 'ConnectionSleeve',
    geometryCategory: 'Linear, full size',
    partCategory: 'CPL',
    symbolMethod: 'Coupling,Ing',
    userClassName: 'ConnectionSleeve'
  },
  'library-table-data': [
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '10mm', port2Size: '10mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.1,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*50 20#钢'
    },
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '15mm', port2Size: '15mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.15,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A6B55X11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA32*4.5*50 20#钢'
    },
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '20mm', port2Size: '20mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.2,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A7B77X11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA38*5*50 20#钢'
    },
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '25mm', port2Size: '25mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.31,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A9B88X11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA48*6*50 20#钢'
    },
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '32mm', port2Size: '32mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.4,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23AAB99X11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA57*6.5*50 20#钢'
    },
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '40mm', port2Size: '40mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.49,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23ABBAAX11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA63.5*7*50 20#钢'
    },
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '50mm', port2Size: '50mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.6,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23ABBBBX11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA76*7*50 20#钢'
    },
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '65mm', port2Size: '65mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.91,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23AEBCCX11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA95*8.5*50 20#钢'
    },
    { 
      ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '80mm', port2Size: '80mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 2.1,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23AJDDDX11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA114*11*75 20#钢'
    }
  ],
  'codelist-table-data': [
    { shortDesc: 'Undefined', longDesc: 'Undefined', codeNum: 0 },
    { shortDesc: 'Out', longDesc: 'Flow leaves this port', codeNum: 1 },
    { shortDesc: 'In', longDesc: 'Flow enters this port', codeNum: 2 },
    { shortDesc: 'Bi-directional', longDesc: 'Flow may enter or leave this port', codeNum: 3 },
    { shortDesc: 'No Flow', longDesc: 'No flow at this port', codeNum: 4 }
  ]
}

// 基础库相关接口
Mock.mock(/\/api\/library\/tree/, 'get', () => {
  return { code: 200, data: db['library-tree'].data, message: 'success' }
})

Mock.mock(/\/api\/library\/codelist-tree/, 'get', () => {
  return { code: 200, data: db['codelist-tree'].data, message: 'success' }
})

Mock.mock(/\/api\/library\/component-details/, 'get', () => {
  return { code: 200, data: db['library-component-details'], message: 'success' }
})

Mock.mock(/\/api\/library\/table-data/, 'get', () => {
  return { code: 200, data: db['library-table-data'], message: 'success' }
})

Mock.mock(/\/api\/library\/codelist-table-data/, 'get', () => {
  return { code: 200, data: db['codelist-table-data'], message: 'success' }
})

// 拦截请求
Mock.mock(/\/api\/dict\/[\w-]+/, 'get', (options) => {
  console.log('Mock拦截:', options.url)
  // 兼容带 - 的 id
  const urlParts = options.url.split('/')
  const id = urlParts[urlParts.length - 1]

  const result = db[id]

  if (result) {
    return {
      code: 200,
      message: 'success',
      data: Mock.mock(result)
    }
  } else {
    return {
      code: 404,
      message: `未找到 [${id}] 的配置数据`,
      data: { title: '未定义', columns: [], data: [] }
    }
  }
})

// --- PMC 模块 Mock ---

// 1. 获取船号
Mock.mock(/\/api\/pmc\/ship-numbers/, 'get', (options) => {
  console.log('Mock拦截: 获取船号', options.url)
  // 解析 query 参数 (简单解析)
  const matchType = options.url.match(/type=([^&]+)/)
  const type = matchType ? matchType[1] : undefined
  
  if (type === 'bulk') {
    return {
      code: 200,
      data: [
        { label: 'H1560 (散货)', value: 'H1560' },
        { label: 'H1561 (散货)', value: 'H1561' },
        { label: 'H1562 (散货)', value: 'H1562' }
      ]
    }
  } else if (type === 'container') {
    return {
      code: 200,
      data: [
        { label: 'H2001 (集装箱)', value: 'H2001' },
        { label: 'H2002 (集装箱)', value: 'H2002' }
      ]
    }
  } else {
    return { code: 200, data: [] }
  }
})

// 2. 主材料规则内容 (B1, B2, B3, D) - 已迁移至后端
// Mock.mock(/\/api\/pmc\/rules\/main-material/, 'get', (options) => { ... })

// 3. 法兰规则内容 (C1, C2) - 已迁移至后端
// Mock.mock(/\/api\/pmc\/rules\/flange/, 'get', (options) => { ... })


// 5. 获取规则下拉列表 (主材料、法兰、管材限定)
Mock.mock(/\/api\/pmc\/rules\/list/, 'get', (options) => {
  console.log('Mock拦截: 获取规则列表', options.url)
  const matchType2 = options.url.match(/type=([^&]+)/)
  const type = matchType2 ? matchType2[1] : undefined
  
  if (type === 'main-material') {
    return {
      code: 200,
      data: [
        { label: '501001-碳钢管规则 (Mock)', value: '501001' },
        { label: '501002-不锈钢管规则 (Mock)', value: '501002' },
        { label: '501003-合金钢管规则 (Mock)', value: '501003' }
      ]
    }
  } else if (type === 'flange') {
    return {
      code: 200,
      data: [
        { label: '502001-国标法兰规则 (Mock)', value: '502001' },
        { label: '502002-美标法兰规则 (Mock)', value: '502002' }
      ]
    }
  } else if (type === 'pipe-limit') {
    return {
      code: 200,
      data: [
        { label: '503001-等级限定规则A (Mock)', value: '503001' },
        { label: '503002-等级限定规则B (Mock)', value: '503002' }
      ]
    }
  } else {
    return { code: 200, data: [] }
  }
})
