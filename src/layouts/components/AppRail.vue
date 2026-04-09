<script setup>
import { computed } from 'vue'
import { House } from '@element-plus/icons-vue'
import { appNavigationRegistry } from '@/navigation'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  isPortalActive: {
    type: Boolean,
    default: false
  },
  currentAppPath: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['switch-app', 'go-portal'])

const appOptions = computed(() => appNavigationRegistry.sort((a, b) => a.order - b.order))

</script>

<template>
  <transition name="slide-rail-width">
    <aside
      v-show="visible"
      class="app-rail-panel"
      :class="{ 'collapsed-mode': collapsed }"
    >
      <el-tooltip content="返回主门户" placement="right">
        <button
          class="rail-item"
          :class="{ active: isPortalActive }"
          type="button"
          @click="emit('go-portal')"
        >
          <el-icon :size="18"><House /></el-icon>
        </button>
      </el-tooltip>

      <el-tooltip
        v-for="app in appOptions"
        :key="app.id"
        :content="app.name"
        placement="right"
      >
        <button
          class="rail-item"
          :class="{ active: app.entry === currentAppPath }"
          type="button"
          @click="emit('switch-app', app.entry)"
        >
          <el-icon :size="18"><component :is="app.logo" /></el-icon>
        </button>
      </el-tooltip>
    </aside>
  </transition>
</template>

<style scoped>
.app-rail-panel {
  --rail-top-space: 12px;
  --rail-bottom-space: 14px;
  --rail-header-offset: 50px;
  width: 56px;
  height: 100%;
  border-radius: 14px;
  background: var(--primary-color);
  box-shadow: 0 10px 22px rgba(38, 79, 123, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: calc(var(--rail-top-space) + var(--rail-header-offset)) 8px var(--rail-bottom-space);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  flex-shrink: 0;
  overflow: hidden;
}

.app-rail-panel.collapsed-mode {
  gap: 14px;
}

.slide-rail-width-enter-active,
.slide-rail-width-leave-active {
  transition: width 0.24s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
  overflow: hidden;
}

.slide-rail-width-enter-from,
.slide-rail-width-leave-to {
  width: 0;
  opacity: 0;
  padding-left: 0;
  padding-right: 0;
  border-width: 0;
  margin-right: 0;
}

.rail-item {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rail-item:hover {
  background: rgba(255, 255, 255, 0.26);
  transform: translateX(2px);
}

.rail-item.active {
  background: #ffffff;
  border-color: #ffffff;
  color: var(--primary-color);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}
</style>
