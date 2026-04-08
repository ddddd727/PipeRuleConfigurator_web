import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './apps/design-rule/mock/index.js'
import './apps/product-standard/features/codelist-management/mock/codelistMock.js'
import './apps/product-standard/features/piping-spec-management/mock/pipingSpecMock.js'
import { createPinia } from 'pinia'
import './assets/dirty-status.css'
// 寮€鍙戠幆澧冧笅鍚敤鏈湴 mock 鏁版嵁
if (import.meta.env.DEV) {
  // 鍔ㄦ€佸鍏ヤ互閬垮厤鍦ㄧ敓浜х幆澧冧腑鎵撳寘 mock
  import('./apps/design-rule/mock')
}

const app = createApp(App)
const pinia = createPinia()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

