import Mock from 'mockjs'

// 设置全局延时，模拟真实接口的 200-600ms 网络延迟
Mock.setup({
  timeout: '200-600'
})

// --- 模拟数据库数据 ---
// 这里的 Key 对应 URL 里的 id
const db = {
  'grade': {
    title: 'A-管材等级配置',
    columns: [
      { prop: 'id', label: 'ID', width: 60 },
      { prop: 'grade', label: '管材等级' },
      { prop: 'code', label: '管材等级编码' },
      { prop: 'status', label: '状态' }
    ],
    // Mock.js 强大的地方：可以随机生成数据
    'data|5-10': [ // 随机生成 5 到 10 条数据
      {
        'id|+1': 1, // id 自增
        'grade|1': ['I', 'II', 'III', 'IV'], // 从数组里随机取
        'code|1-100': 1, // 1-100 的随机数字
        'status|1': ['启用', '停用']
      }
    ]
  },
  'material': {
    title: 'B1-主材料配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'name', label: '材料名称' },
      { prop: 'std', label: '执行标准' },
      { prop: 'density', label: '密度' }
    ],
    'data|3-8': [
      {
        'id|+1': 1,
        'name': '@ctitle(2, 4)', // 随机生成 2-4 个字的中文标题
        'std': /ASTM A\d{3}/,    // 正则生成标准号
        'density': '@float(7, 8, 2, 2)' // 7.00-8.99 的小数
      }
    ]
  }
}

// --- 核心拦截逻辑 ---
// 拦截所有形如 /api/dict/xxx 的 GET 请求
Mock.mock(/\/api\/dict\/\w+/, 'get', (options) => {
  console.log('Mock拦截到了请求:', options.url)
  
  // 从 URL 中解析出 id (比如 grade, material)
  // URL 可能是 /api/dict/grade?t=123
  const urlParts = options.url.split('/')
  const id = urlParts[urlParts.length - 1] // 获取最后一部分

  const result = db[id]

  if (result) {
    // 利用 Mock.mock 生成最终的随机数据
    return {
      code: 200,
      message: 'success',
      data: Mock.mock(result)
    }
  } else {
    return {
      code: 404,
      message: '未找到该分类配置',
      data: { title: '未定义', columns: [], data: [] }
    }
  }
})