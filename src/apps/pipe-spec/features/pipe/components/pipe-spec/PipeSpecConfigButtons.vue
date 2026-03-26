<script setup>
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  configButtons: {
    type: Array,
    required: true
  },
  handleConfigClick: {
    type: Function,
    required: true
  }
})

// 计算行数，每行2个按钮
const rows = computed(() => {
  return Math.ceil(props.configButtons.length / 2)
})
</script>

<template>
  <div class="form-section-pmc" style="flex:1">
    <el-row :gutter="20" v-for="row in rows" :key="row" class="config-row">
      <el-col :span="12" v-for="i in 2" :key="i">
        <div v-if="configButtons[(row-1)*2 + (i-1)]" class="config-cell">
          <div v-if="configButtons[(row-1)*2 + (i-1)].configResult" class="config-result-container frosted">
            <div v-if="configButtons[(row-1)*2 + (i-1)].type" class="config-type-label">{{ configButtons[(row-1)*2 + (i-1)].type }}</div>
            <div class="config-result-scroll">
              <div v-for="(line, index) in configButtons[(row-1)*2 + (i-1)].configResult.split('\n')" :key="index" class="config-result-line">{{ line }}</div>
            </div>
            <el-button 
              type="primary" plain
              size="small" 
              class="reconfig-btn"
              @click="handleConfigClick(configButtons[(row-1)*2 + (i-1)].id)"
            >
              重新配置
            </el-button>
          </div>
          <el-button 
            v-else
            type="primary" 
            round 
            size="large" 
            class="config-add-btn frosted"
            @click="handleConfigClick(configButtons[(row-1)*2 + (i-1)].id)"
          >
            <div class="config-add-content">
              <el-icon class="plus-icon"><Plus /></el-icon>
              <div class="config-add-text">配置</div>
            </div>
          </el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
/* CSS变量定义 - 局部作用域 */
.form-section-pmc {
  --config-cell-height: 140px;
  --config-cell-padding: 6px;
  --config-row-gap: 24px;
}

.config-row {
  margin-bottom: var(--config-row-gap);
}

.config-cell {
  padding: var(--config-cell-padding);
  box-sizing: border-box;
  height: var(--config-cell-height);
  min-height: var(--config-cell-height);
  max-height: var(--config-cell-height);
}

.config-result-container {
  background-color: #f0f9ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: calc(100% - 12px);
  overflow: hidden;
  position: relative;
}

.config-result-scroll {
  overflow-y: auto;
  flex-grow: 1;
  min-height: 0;
  padding-right: 6px;
  padding-top: 24px;
}

.config-result-line {
  margin-bottom: 6px;
  font-size: 12px;
  word-break: break-word;
}

.reconfig-btn {
  align-self: flex-end;
  margin-top: 8px;
}

.config-add-btn {
  width: 100%;
  height: 140px;
  padding: 18px 0;
}

.config-add-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.config-add-text { font-size: 14px; }

/* 毛玻璃效果 */
.frosted {
  background: rgba(224, 242, 255, 0.55);
  backdrop-filter: blur(6px) saturate(120%);
  -webkit-backdrop-filter: blur(6px) saturate(120%);
  box-shadow: 0 6px 16px rgba(11, 40, 80, 0.06);
  border: 1px solid rgba(170, 200, 230, 0.45);
  color: #033a66;
}

.config-result-container.frosted {
  background: rgba(220, 235, 255, 0.6);
  border: 1px solid rgba(150, 185, 230, 0.45);
  color: #033a66;
}

.config-add-btn.frosted {
  background: rgba(220, 235, 255, 0.6);
  border: 1px solid rgba(150, 185, 230, 0.45);
  color: #033a66;
}

.config-add-btn.frosted,
.config-add-btn.frosted .el-icon,
.config-add-btn.frosted .config-add-text {
  color: #033a66 !important;
}

.config-type-label {
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 2;
  font-size: 12px;
  font-weight: 600;
  background: rgba(230, 245, 255, 0.9);
  color: #033a66;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(140,170,210,0.35);
}
</style>
