import request from '@/utils/request'

// 获取配置数据
export function getBasicClassConfig(id) {
  return request({
    url: `/api/basic-class/${id}`,
    method: 'get'
  })
}

// 保存配置数据
export function saveBasicClassConfig(config) {
  return request({
    url: '/api/basic-class/save',
    method: 'post',
    data: config
  })
}