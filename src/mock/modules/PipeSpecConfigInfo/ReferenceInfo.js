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
    const paramNames = ['DN', 'Thickness']

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

// 标准文件列表
Mock.mock(/\/api\/pipe-spec\/standard-files/, 'get', () => ({
  code: 200,
  msg: 'success',
  data: Mock.mock({
    'list|9-15': [
      {
        'id|+1': 1,
        name: '@ctitle(6, 12)',
        code: /GB\/T \d{4}-\d{4}/
      }
    ]
  }).list
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

// 船型与船号信息（PipeSpec.vue 使用 /api/PmcSpec/ShipInfos）
Mock.mock(/\/api\/PmcSpec\/ShipInfos/, 'get', () => ({
  code: 200,
  message: '获取船型船号信息成功',
  data: [
    { shipNumber: 'H1508', shipType: '邮轮' },
    { shipNumber: 'H1509', shipType: '邮轮' },
    { shipNumber: 'H1403', shipType: '民船' },
    { shipNumber: 'H1404', shipType: '民船' },
    { shipNumber: 'H1301', shipType: '货船' },
    { shipNumber: 'H1603', shipType: '民船' }
  ],
  timestamp: '0001-01-01T00:00:00',
  traceId: '40000004-0009-fd00-b63f-84710c7967bb'
}))

// PMC 规则树（根据船号返回）
Mock.mock(/\/api\/PmcSpec\/PmcRules\//, 'get', (options) => {
  const urlParts = options.url.split('/')
  const shipNumber = urlParts[urlParts.length - 1]

  // 返回扁平数组，字段与 PipeSpec.vue 中 transformToTreeStructure 期望一致
  const data = [
    { material: '碳钢管', pipeStadard: 'GB/T 8163', pmcCode: '1C181AD', shipNumber, status: 'active' },
    { material: '碳钢管', pipeStadard: 'GB/T 8163', pmcCode: '1C181AE', shipNumber, status: 'active' },
    { material: '碳钢管', pipeStadard: 'GB/T 8163', pmcCode: '1C181AJ', shipNumber, status: 'active' },
    { material: '碳钢管', pipeStadard: 'GB/T 5312', pmcCode: '1C281AD', shipNumber, status: 'active' },
    { material: '碳钢管', pipeStadard: 'GB/T 5312', pmcCode: '1C281AE', shipNumber, status: 'active' },
    { material: '碳钢管', pipeStadard: 'GB/T 5312', pmcCode: '1C281AJ', shipNumber, status: 'inactive' },
    { material: '不锈钢', pipeStadard: 'GB/T 14976', pmcCode: '1S181AD', shipNumber, status: 'active' },
    { material: '不锈钢', pipeStadard: 'GB/T 14976', pmcCode: '1S181AE', shipNumber, status: 'active' },
    { material: '不锈钢', pipeStadard: 'GB/T 14976', pmcCode: '1S181AJ', shipNumber, status: 'active' }
  ]

  return {
    code: 200,
    msg: 'success',
    data
  }
})

// PMC 编码详情
Mock.mock(/\/api\/PmcSpec\/Analyze\//, 'get', (options) => {
  const urlParts = options.url.split('/')
  const code = urlParts[urlParts.length - 1]
  return {
    code: 200,
    msg: 'success',
    data: {
      code,
      service: Mock.mock('@ctitle(6,12)'),
      pipingMaterialClass: Mock.mock('@ctitle(4,8)'),
      pipeStandard: Mock.mock('@ctitle(6,12)'),
      materialGrade: Mock.mock('@ctitle(4,8)'),
      pressureRating: Mock.mock('@ctitle(2,6)'),
      wallThickness: Mock.mock('@float(1,50,1,2)') + ' mm'
    }
  }
})

// 部件类型列表（用于配置对话框）
Mock.mock(/\/api\/pipe-spec\/part-types/, 'get', () => ({
  code: 200,
  msg: 'success',
  data: ['Pipe', 'Bend',
    'Elbow', 'Red', 'Tee',
    'Sleeve', 'Bosses', 'Saddles',
    'Caps', 'Overpass',
    'Flange', 'Blind Flange']
}))