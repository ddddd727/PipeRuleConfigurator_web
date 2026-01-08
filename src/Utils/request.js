import axios from 'axios';

const request = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
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
    const res = response.data;

    // 统一处理成功响应
    if (res.code === 200) {
      return res.data;
    }

    // 业务错误处理
    const errorMap = {
      401: "未登录或登录已过期",
      403: "没有权限访问",
      404: "请求的资源不存在",
      500: "服务器内部错误",
    };

    const message = res.message || errorMap[res.code] || "请求失败";

    // 统一错误提示
    ElMessage.error({
      message: `${message} (${res.traceId})`,
      duration: 5000,
    });

    // 401跳转到登录页
    if (res.code === 401) {
      router.push("/login");
    }

    return Promise.reject(new Error(message));
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