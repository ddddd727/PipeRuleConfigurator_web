import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const defaultErrorMap = {
  400: '请求参数错误',
  401: '未登录或登录已过期',
  403: '没有权限访问',
  404: '请求的资源不存在',
  409: '数据冲突',
  500: '服务器内部错误'
}

const buildErrorText = (payload, status) => {
  const code = typeof payload?.code === 'number' ? payload.code : status
  const traceId = payload?.traceId || payload?.data?.traceId || ''

  let message = ''
  if (typeof payload === 'string') {
    message = payload
  } else if (typeof payload?.message === 'string' && payload.message.trim()) {
    message = payload.message.trim()
  } else if (typeof payload?.title === 'string' && payload.title.trim()) {
    message = payload.title.trim()
  } else if (typeof payload?.error === 'string' && payload.error.trim()) {
    message = payload.error.trim()
  }

  const fallback = defaultErrorMap[code] || (status ? `请求失败 (${status})` : '请求失败')
  return {
    code,
    traceId,
    message: message || fallback
  }
}

const showErrorMessage = ({ message, traceId }) => {
  const fullMessage = traceId ? `${message} (${traceId})` : message
  ElMessage.error({
    message: fullMessage,
    duration: 5000
  })
}

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const { config } = response

    if (config?.responseType === 'blob') {
      return response
    }

    const res = response.data ?? {}

    if (typeof res.code === 'number') {
      if (res.code >= 200 && res.code < 300) {
        return res.data
      }

      const errorInfo = buildErrorText(res, response.status)
      showErrorMessage(errorInfo)

      if (errorInfo.code === 401) {
        router.push('/login')
      }

      const error = new Error(errorInfo.message)
      error.code = errorInfo.code
      error.traceId = errorInfo.traceId
      return Promise.reject(error)
    }

    return res
  },
  (error) => {
    if (!error.response) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const errorInfo = buildErrorText(data, status)
    showErrorMessage(errorInfo)

    if (errorInfo.code === 401 || status === 401) {
      router.push('/login')
    }

    error.message = errorInfo.message
    error.code = errorInfo.code
    error.traceId = errorInfo.traceId
    return Promise.reject(error)
  }
)

export default request
