import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 👇 核心配置：添加代理转发
  server: {
    proxy: {
      '/api': {
        // 这里填你的 Apifox 云端 Mock 基础地址 (不要带后面的 /api/dict/...)
        target: 'https://m1.apifoxmock.com/m1/7605679-7344432-default', 
        changeOrigin: true,
        //Apifox 的 Mock 地址通常包含 /api 路径，如果你的接口定义里已经有 /api，就不需要 rewrite
      }
    }
  }
})