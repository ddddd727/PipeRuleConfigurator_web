<script setup>
import { ref } from 'vue'
import { Cpu, RefreshRight, Rank, Setting } from '@element-plus/icons-vue'

const streamlitUrl = ref(localStorage.getItem('pmc_ai_url') || 'http://10.8.98.105:8501')
const iframeRef = ref(null)
const showSetting = ref(false)
const inputUrl = ref('')

const openSetting = () => {
  inputUrl.value = streamlitUrl.value
  showSetting.value = true
}

const confirmSetting = () => {
  let url = inputUrl.value.trim()
  if (!url) return
  // 没有协议头自动补上
  if (!/^https?:\/\//.test(url)) url = 'http://' + url
  streamlitUrl.value = url
  localStorage.setItem('pmc_ai_url', url)
  showSetting.value = false
}

const reloadFrame = () => {
  const currentSrc = iframeRef.value.src
  iframeRef.value.src = ''
  setTimeout(() => {
    iframeRef.value.src = currentSrc
  }, 200)
}

const openInNewWindow = () => {
  window.open(streamlitUrl.value, '_blank')
}
</script>

<template>
  <div class="pmc-ai-container">
    <div class="ai-header">
      <div class="header-left">
        <el-icon class="brand-icon" :size="20"><Cpu /></el-icon>
        <span class="title">PMC AI 助手</span>
        <span class="current-url">{{ streamlitUrl }}</span>
      </div>
      <div class="header-right">
        <el-tooltip content="配置地址" placement="bottom">
          <el-button link :icon="Setting" @click="openSetting" />
        </el-tooltip>
        <el-tooltip content="在新窗口打开" placement="bottom">
          <el-button link :icon="Rank" @click="openInNewWindow" />
        </el-tooltip>
        <el-tooltip content="重新加载" placement="bottom">
          <el-button link :icon="RefreshRight" @click="reloadFrame" />
        </el-tooltip>
      </div>
    </div>

    <div class="iframe-wrapper">
      <iframe
        ref="iframeRef"
        :src="streamlitUrl"
        class="ai-iframe"
        title="PMC AI"
      ></iframe>
    </div>

    <!-- 配置弹窗 -->
    <el-dialog v-model="showSetting" title="配置 AI 助手地址" width="420px" :close-on-click-modal="false">
      <el-form label-width="80px" @submit.prevent="confirmSetting">
        <el-form-item label="访问地址">
          <el-input
            v-model="inputUrl"
            placeholder="例：http://localhost:8501"
            clearable
            autofocus
          />
        </el-form-item>
        <el-form-item label="">
          <el-text type="info" size="small">
            支持 IP 或域名，如不填协议头默认补 http://
          </el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSetting = false">取消</el-button>
        <el-button type="primary" @click="confirmSetting">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.pmc-ai-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-left: 1px solid #dcdfe6;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

.ai-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #f0f2f5;
  background-color: #fbfcfe;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.brand-icon {
  color: #409eff;
  flex-shrink: 0;
}

.title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  flex-shrink: 0;
}

.current-url {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.iframe-wrapper {
  flex: 1;
  width: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
  position: relative;
}

.ai-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>