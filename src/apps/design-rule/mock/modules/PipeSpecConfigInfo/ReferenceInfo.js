import Mock from 'mockjs'

// 精简并统一对 PipeSpec.vue 使用到的接口 mock

// 物料数据 - 已移除 Mock，使用真实接口
/*
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
*/

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

// 标准文件列表（支持 partType 参数） - 已移除 Mock，使用真实接口
/*
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

  // 根据部件类型获取标准列表
  const standards = partType && standardFilesByType[partType] 
    ? standardFilesByType[partType] 
    : []

  return {
    code: 200,
    msg: 'success',
    data: standards
  }
})
*/

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

// // 接受审核
// Mock.mock(/\/api\/PmcSpec\/AcceptReview/, 'post', (options) => {
//   const body = JSON.parse(options.body)
//   return {
//     code: 200,
//     msg: '审核提交成功',
//     data: {
//       pmcCode: body.pmcCode,
//       status: 'approved'
//     }
//   }
// })

// 4.6 获取管附件规格 - 已移除 Mock，使用真实接口
// 接口: /api/PmcSpec/PipeFittingSpec?componentTypeName=...&componentTypeId=...
/*
Mock.mock(/\/api\/PmcSpec\/PipeFittingSpec/, 'get', (options) => {
  // 解析查询参数
  let componentTypeName = null
  let componentTypeId = null
  
  if (options.url) {
    const typeNameMatch = options.url.match(/componentTypeName=([^&]+)/)
    componentTypeName = typeNameMatch ? decodeURIComponent(typeNameMatch[1]) : null
    
    const typeIdMatch = options.url.match(/componentTypeId=([^&]+)/)
    componentTypeId = typeIdMatch ? parseInt(typeIdMatch[1]) : null
  }

  // 模拟部件类型数据，用于 ID 到 Name 的映射
  const componentTypesData = [
    { id: 1, componentTypeName: 'Pipe' },
    { id: 2, componentTypeName: 'Bend' },
    { id: 3, componentTypeName: 'Elbow' },
    { id: 4, componentTypeName: 'Flange' },
    { id: 5, componentTypeName: 'Tee' },
    { id: 6, componentTypeName: 'Red' },
    { id: 7, componentTypeName: 'Sleeve' },
    { id: 8, componentTypeName: 'Bosses' },
    { id: 9, componentTypeName: 'Saddles' },
    { id: 10, componentTypeName: 'Caps' },
    { id: 11, componentTypeName: 'Overpass' },
    { id: 12, componentTypeName: 'BlindFlange' },
    { id: 13, componentTypeName: 'Accessories' },
    { id: 14, componentTypeName: 'Bolt' },
    { id: 15, componentTypeName: 'Gasket' },
    { id: 16, componentTypeName: 'Joints' },
    { id: 17, componentTypeName: 'Nut' },
    { id: 18, componentTypeName: 'Washer' }
  ]

  // 如果提供了 componentTypeId，优先使用 ID 查找对应的 Name
  if (componentTypeId) {
    const componentType = componentTypesData.find(ct => ct.id === componentTypeId)
    if (componentType) {
      componentTypeName = componentType.componentTypeName
    }
  }

  // 复用 standardFilesByType 数据结构 (模拟数据库中的标准)
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
*/
