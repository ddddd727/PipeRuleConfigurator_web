import Mock from 'mockjs'

// 精简并统一对 PipeSpec.vue 使用到的接口 mock

// 物料数据
Mock.mock(/\/api\/pipe-spec\/material/, 'get', () => ({
  code: 200,
  msg: 'success',
  data: [
    { id: 1, name: '碳钢 (CS)' },
    { id: 2, name: '不锈钢 (SS304)' },
    { id: 3, name: '不锈钢 (SS316)' },
    { id: 4, name: '合金钢 (Alloy Steel)' },
    { id: 5, name: '铜合金 (Copper Alloy)' },
    { id: 6, name: '铝合金 (Aluminum Alloy)' },
    { id: 7, name: '钛合金 (Titanium Alloy)' }
  ]
}))

// 尺寸数据（通径/外径/壁厚表格）
Mock.mock(/\/api\/pipe-spec\/dimension/, 'get', () => {
  const generateColumnData = (cols = 20) => {
    const data = []
    const npdRow = { id: 1, name: 'NPD' }
    const paramNames = ['OD', 'Thickness']

    paramNames.forEach((name, idx) => {
      const row = { id: idx + 2, name }
      for (let i = 1; i <= cols; i++) {
        row[`col${i}`] = Mock.mock('@float(1, 500, 0, 0)')
      }
      data.push(row)
    })

    for (let i = 1; i <= cols; i++) {
      npdRow[`col${i}`] = 5 * i
    }
    data.unshift(npdRow)
    return data
  }

  return { code: 200, msg: 'success', data: generateColumnData() }
})

// 标准文件列表（支持 partType 参数）
Mock.mock(/\/api\/pipe-spec\/standard-files/, 'get', (options) => {
  // 解析查询参数 partType
  let partType = null
  if (options.url && options.url.includes('partType=')) {
    const match = options.url.match(/partType=([^&]+)/)
    partType = match ? decodeURIComponent(match[1]) : null
  }
  
  // 根据不同的部件类型返回不同的标准文件
  const standardFilesByType = {
    'Pipe': [
      { id: 1, code: 'GB/T 8163-2018' },
      { id: 2, code: 'GB/T 5312-2009' },
      { id: 3, code: 'ASTM A106' },
      { id: 4, code: 'ASTM A53' },
      { id: 5, code: 'GB/T 14976-2012' }
    ],
    'Bend': [
      { id: 10, code: 'GB/T 12459-2017' },
      { id: 11, code: 'ASME B16.9' },
      { id: 12, code: 'GB/T 13401-2017' }
    ],
    'Elbow': [
      { id: 20, code: 'GB/T 12459-2017' },
      { id: 21, code: 'ASME B16.9' },
      { id: 22, code: 'GB/T 13401-2017' }
    ],
    'Flange': [
      { id: 30, code: 'GB/T 9119-2010' },
      { id: 31, code: 'ASME B16.5' },
      { id: 32, code: 'HG/T 20615-2009' }
    ],
    'Tee': [
      { id: 40, code: 'GB/T 12459-2017' },
      { id: 41, code: 'ASME B16.9' }
    ],
    'Red': [
      { id: 50, code: 'GB/T 12459-2017' },
      { id: 51, code: 'ASME B16.9' }
    ],
    'Sleeve': [
      { id: 60, code: 'GB/T 12459-2017' }
    ],
    'Bosses': [
      { id: 70, code: 'GB/T 12459-2017' }
    ],
    'Saddles': [
      { id: 80, code: 'GB/T 12459-2017' }
    ],
    'Caps': [
      { id: 90, code: 'GB/T 12459-2017' },
      { id: 91, code: 'ASME B16.9' }
    ],
    'Overpass': [
      { id: 100, code: 'GB/T 12459-2017' }
    ],
    'BlindFlange': [
      { id: 110, code: 'GB/T 9119-2010' },
      { id: 111, code: 'ASME B16.5' }
    ],
    'Accessories': [
      { id: 120, code: 'General Accessories Std' }
    ],
    'Bolt': [
      { id: 130, code: 'ISO 4014' },
      { id: 131, code: 'ASME B18.2.1' }
    ],
    'Gasket': [
      { id: 140, code: 'ASME B16.20' },
      { id: 141, code: 'ASME B16.21' }
    ],
    'Joints': [
      { id: 150, code: 'Manufacturer Std' }
    ],
    'Nut': [
      { id: 160, code: 'ISO 4032' },
      { id: 161, code: 'ASME B18.2.2' }
    ],
    'Washer': [
      { id: 170, code: 'ISO 7089' },
      { id: 171, code: 'ASME B18.21.1' }
    ]
  }
  
  // 如果指定了部件类型，返回对应的标准文件，否则返回通用列表
  const files = partType && standardFilesByType[partType] 
    ? standardFilesByType[partType]
    : Mock.mock({
        'list|9-15': [
          {
            'id|+1': 1,
            code: /GB\/T \d{4}-\d{4}/
          }
        ]
      }).list
  
  return {
    code: 200,
    msg: 'success',
    data: files
  }
})

// 优选规则列表
Mock.mock(/\/api\/pipe-spec\/preferred-rules/, 'get', () => ({
  code: 200,
  msg: 'success',
  data: [
    { label: '规则-按标准优先', value: 'rule-standard' },
    { label: '规则-按材料优先', value: 'rule-material' },
    { label: '规则-按通径优先', value: 'rule-npd' }
  ]
}))

// 保存配置
Mock.mock(/\/api\/pipe-spec\/configure/, 'post', () => ({
  code: 200,
  msg: 'success',
  data: { id: Mock.mock('@integer(1000,9999)'), success: true }
}))

// 获取标准化的 pipe-spec 规格（按 id）
Mock.mock(/\/api\/pipe-spec\/specification\//, 'get', (options) => {
  const urlParts = options.url.split('/')
  const id = urlParts[urlParts.length - 1]
  return {
    code: 200,
    msg: 'success',
    data: {
      id: parseInt(id) || Mock.mock('@integer(1,100)'),
      name: Mock.mock('@ctitle(8, 15)'),
      description: Mock.mock('@cparagraph(1,3)')
    }
  }
})

// 管件配置详情
Mock.mock(/\/api\/pipe-spec\/fitting-config/, 'get', (options) => {
  return {
    code: 200,
    msg: 'success',
    data: Mock.mock({
      'data|6-10': [
        {
          'id|+1': 1,
          fittingName: '@ctitle(4,8)',
          fittingType: '@ctitle(2,5)',
          material: '@ctitle(4,8)',
          dimension: '@float(0,100,1,2)',
          standard: '@ctitle(6,12)'
        }
      ]
    }).data
  }
})

// 4.6 获取管附件规格
// 接口: /api/PmcSpec/PipeFittingSpec?componentTypeName=...
Mock.mock(/\/api\/PmcSpec\/PipeFittingSpec/, 'get', (options) => {
  // 解析查询参数 componentTypeName
  let componentTypeName = null
  if (options.url && options.url.includes('componentTypeName=')) {
    const match = options.url.match(/componentTypeName=([^&]+)/)
    componentTypeName = match ? decodeURIComponent(match[1]) : null
  }

  // 复用 standardFilesByType 数据结构 (模拟数据库中的标准)
  // 注意：这里的数据必须与 API 契约中的 PipeFittingSpec 类型一致
  // interface PipeFittingSpec {
  //   standardName: string;     // 标准名称
  //   materialList: string[];   // 材料列表
  // }
  
  const standardFilesByType = {
    'Pipe': [
      { id: 1, code: 'GB/T 8163-2018' },
      { id: 2, code: 'GB/T 5312-2009' },
      { id: 3, code: 'ASTM A106' },
      { id: 4, code: 'ASTM A53' },
      { id: 5, code: 'GB/T 14976-2012' }
    ],
    'Bend': [
      { id: 10, code: 'GB/T 12459-2017' },
      { id: 11, code: 'ASME B16.9' },
      { id: 12, code: 'GB/T 13401-2017' }
    ],
    'Elbow': [
      { id: 20, code: 'GB/T 12459-2017' },
      { id: 21, code: 'ASME B16.9' },
      { id: 22, code: 'GB/T 13401-2017' }
    ],
    'Flange': [
      { id: 30, code: 'GB/T 9119-2010' },
      { id: 31, code: 'ASME B16.5' },
      { id: 32, code: 'HG/T 20615-2009' }
    ],
    'Tee': [
      { id: 40, code: 'GB/T 12459-2017' },
      { id: 41, code: 'ASME B16.9' }
    ],
    'Red': [
      { id: 50, code: 'GB/T 12459-2017' },
      { id: 51, code: 'ASME B16.9' }
    ],
    'Sleeve': [
      { id: 60, code: 'GB/T 12459-2017' }
    ],
    'Bosses': [
      { id: 70, code: 'GB/T 12459-2017' }
    ],
    'Saddles': [
      { id: 80, code: 'GB/T 12459-2017' }
    ],
    'Caps': [
      { id: 90, code: 'GB/T 12459-2017' },
      { id: 91, code: 'ASME B16.9' }
    ],
    'Overpass': [
      { id: 100, code: 'GB/T 12459-2017' }
    ],
    'BlindFlange': [
      { id: 110, code: 'GB/T 9119-2010' },
      { id: 111, code: 'ASME B16.5' }
    ],
    'Accessories': [
      { id: 120, code: 'General Accessories Std' }
    ],
    'Bolt': [
      { id: 130, code: 'ISO 4014' },
      { id: 131, code: 'ASME B18.2.1' }
    ],
    'Gasket': [
      { id: 140, code: 'ASME B16.20' },
      { id: 141, code: 'ASME B16.21' }
    ],
    'Joints': [
      { id: 150, code: 'Manufacturer Std' }
    ],
    'Nut': [
      { id: 160, code: 'ISO 4032' },
      { id: 161, code: 'ASME B18.2.2' }
    ],
    'Washer': [
      { id: 170, code: 'ISO 7089' },
      { id: 171, code: 'ASME B18.21.1' }
    ]
  }

  // 根据部件类型获取标准列表
  const standards = componentTypeName && standardFilesByType[componentTypeName]
    ? standardFilesByType[componentTypeName]
    : []

  // 转换为契约定义的 PipeFittingSpec 格式
  const data = standards.map(std => ({
    standardName: std.code,
    materialList: [
      'Carbon Steel',
      'Stainless Steel 304',
      'Stainless Steel 316',
      'Alloy Steel',
      'Copper Alloy'
    ] // 模拟材料列表
  }))

  return {
    code: 200,
    message: '获取管附件规格成功',
    data: data,
    timestamp: new Date().toISOString(),
    traceId: Mock.mock('@guid')
  }
})
