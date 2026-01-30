import Mock from 'mockjs'
// 导入管道规格配置相关的Mock数据
// 已禁用 PipeSpec 相关的 mock，使用真实 API
import './modules/PipeSpecConfigInfo/ReferenceInfo.js'

Mock.setup({
  timeout: '200-600'
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
