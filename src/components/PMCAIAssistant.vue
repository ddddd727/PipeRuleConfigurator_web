<script setup>
import { ref } from 'vue'
import { Cpu, RefreshRight, Rank } from '@element-plus/icons-vue'

// 这里预留给同事填写的 Streamlit 地址
// 如果是本地开发，通常是 http://localhost:8501
const streamlitUrl = ref('http://localhost:8501') 
const iframeRef = ref(null)

// 简单的刷新功能
const reloadFrame = () => {
  const currentSrc = iframeRef.value.src
  iframeRef.value.src = ''
  setTimeout(() => {
    iframeRef.value.src = currentSrc
  }, 200)
}

// 在新窗口打开
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
      </div>
      <div class="header-right">
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
  </div>
</template>

<style scoped>
.pmc-ai-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-left: 1px solid #dcdfe6;
  box-shadow: -2px 0 8px rgba(0,0,0,0.05);
}

.ai-header {
  height: 40px; /* 稍微紧凑一点 */
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
}

.brand-icon {
  color: #409EFF;
}

.title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.iframe-wrapper {
  flex: 1;
  width: 100%;
  height: 100%;
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