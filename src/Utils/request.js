import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一处理API响应格式
request.interceptors.response.use(
  (response) => {
    const { config } = response;

    // 文件下载等二进制响应直接透传，方便外层解析 headers
    if (config?.responseType === 'blob') {
      return response;
    }

    const res = response.data ?? {};

    if (typeof res.code === 'number') {
      if (res.code === 200) {
        return res.data;
      }

      const errorMap = {
        401: "未登录或登录已过期",
        403: "没有权限访问",
        404: "请求的资源不存在",
        500: "服务器内部错误",
      };

      const traceId = res.traceId ? ` (${res.traceId})` : '';
      const message = res.message || errorMap[res.code] || "请求失败";

      ElMessage.error({
        message: `${message}${traceId}`,
        duration: 5000,
      });

      if (res.code === 401) {
        router.push("/login");
      }

      return Promise.reject(new Error(message));
    }

    // 兼容没有封装 code 的普通 REST 响应
    return res;
  },
  (error) => {
    // 网络错误处理
    if (!error.response) {
      ElMessage.error("网络连接失败，请检查网络设置");
    }

    return Promise.reject(error);
  }
);

export default request;