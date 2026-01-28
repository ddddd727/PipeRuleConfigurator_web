import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // 👇 核心配置：添加代理转发
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5022',
        changeOrigin: true,
        secure: false, // 如果是https接口，需要配置这个参数
      }
    }
  }
})