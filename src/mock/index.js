import Mock from 'mockjs'

Mock.setup({
  timeout: '200-600'
})

const db = {
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
    columns: [
      // { prop: 'id', label: '序号', width: 80 },
      { prop: 'diameter', label: '通径DN', editable: true },
      { prop: 'unit', label: '通径单位', editable: true },
      { prop: 'material', label: '主材料', editable: true },
      { prop: 'l1', label: '前夹长L1', editable: true },
      { prop: 'l2', label: '后夹长L2', editable: true }
    ],
    'data|5': [{
      'id|+1': 1,
      'diameter|1': ['DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50'],
      'unit': 'mm',
      'material|1': ['304不锈钢', '碳钢', '316不锈钢', 'PVC'],
      'l1|100-500': 1,
      'l2|100-500': 1
    }]
  },

  // 2. 壁厚系列 (wall-thickness-series)
  'wall-thickness-series': {
    title: '部件库名称：PlainPipingGenericData',
    columns: [
      // { prop: 'id', label: '序号', width: 80 },
      { prop: 'diameter', label: '通径DN', editable: true },
      { prop: 'unit', label: '通径单位', editable: true },
      { prop: 'standard', label: '管材标准EndStandard', editable: true },
      { prop: 'series', label: '壁厚系列', editable: true },
      { prop: 'outer', label: '外径', editable: true },
      { prop: 'value', label: '壁厚值', editable: true }
    ],
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
    columns: [
      // { prop: 'id', label: '序号', width: 80 },
      { prop: 'type', label: 'ShortCodeHierarchyType', editable: true },
      { prop: 'shortcode', label: 'ShortCode', editable: true }
    ],
    'data|5': [{
      'id|+1': 1,
      'type|1': ['PIPE', 'VALVE', 'FLANGE', 'FITTING', 'INSTRUMENT', 'EQUIPMENT'],
      'shortcode|1': ['管道', '阀门', '法兰', '管件', '仪表', '设备']
    }]
  },

    // 4. Spec (spec)
  'spec': {
    title: '部件库名称：PipingCommodityFilter',
    columns: [
      // { prop: 'id', label: '序号', width: 80 },
      { prop: 'shortcode', label: 'ShortCode', editable: true },
      { prop: 'type', label: 'GeometricIndustryStandard', editable: true },
      { prop: 'type', label: 'CommodityCode', editable: true }
    ],
    'data|5': [{
      'id|+1': 1,
      'shortcode|1': ['管道', '阀门', '法兰', '管件', '仪表', '设备']
    }]
  },
}

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

// 添加一个专门为 BasicClass 的 API 拦截器
Mock.mock(/\/api\/basic-class\/([\w-]+)/, 'get', (options) => {
  console.log('BasicClass Mock拦截:', options.url)
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
      data: { 
        title: '未定义', 
        columns: [], 
        data: [] 
      }
    }
  }
})

// 为 BasicClass 添加保存接口
Mock.mock(/\/api\/basic-class\/save/, 'post', (options) => {
  console.log('BasicClass 保存数据:', options.body)
  const data = JSON.parse(options.body)
  
  return {
    code: 200,
    message: '保存成功',
    data: data
  }
})

// 导出 db 对象供其他模块使用
export { db }