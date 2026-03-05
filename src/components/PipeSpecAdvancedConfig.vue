<template>
  <div class="advanced-config">
    <!-- NPD范围配置 -->
    <div class="config-section" v-if="configurations && configurations.length > 0">
      <h3>NPD范围配置</h3>
      <div class="configuration-container">
        <div v-for="(config, index) in configurations" :key="config.standardFile || index" class="config-item">
          <div class="config-file-info">
            <el-tag size="small" type="info">{{ getStandardFileName(config.standardFile) }}</el-tag>
          </div>
          <div class="config-controls">
            <div class="npd-range-selectors">
              <el-select
                v-model="config.minNpdValue"
                placeholder="选择最小NPD"
                style="width: 120px; margin-right: 10px"
              >
                <el-option
                  v-for="value in npdValues"
                  :key="value"
                  :label="`${value} mm`"
                  :value="value"
                />
              </el-select>
              <span class="range-separator">-</span>
              <el-select
                v-model="config.maxNpdValue"
                placeholder="选择最大NPD"
                style="width: 120px; margin-left: 10px"
              >
                <el-option
                  v-for="value in npdValues"
                  :key="value"
                  :label="`${value} mm`"
                  :value="value"
                />
              </el-select>
            </div>
            <div class="bend-radius-multiple" v-if="partType === 'Bend'">
              <el-input
                v-model="config.bendRadiusMultiple"
                placeholder="弯管半径倍数"
                style="width: 150px"
              />
            </div>
          </div>
          <div class="bend-radius-hint" v-if="partType === 'Bend'">填写的值为弯管半径的倍数</div>
        </div>
      </div>
      <div class="tip-text">请为每个选择的标准文件配置对应的NPD范围</div>
    </div>

    <!-- 重复通径范围配置 -->
    <div class="config-section" v-if="duplicateRanges.length > 0">
      <h3>重复通径范围</h3>
      <div class="duplicate-ranges-container">
        <div v-for="duplicate in duplicateRanges" :key="duplicate.rangeKey" class="duplicate-range-item">
          <div class="duplicate-range-info">
            <el-tag type="warning" size="small">
              重叠区域：{{ duplicate.overlapMin }} mm - {{ duplicate.overlapMax }} mm
            </el-tag>
            <span class="duplicate-count">（{{ duplicate.standardFiles.length }} 个标准文件）</span>
          </div>
          <div class="duplicate-ranges-list">
            <span class="duplicate-label">涉及的范围：</span>
            <div class="ranges-list">
              <el-tag
                v-for="(range, idx) in duplicate.ranges"
                :key="`${range.standardFile}-${idx}`"
                size="small"
                type="info"
                style="margin-right: 8px; margin-bottom: 4px"
              >
                {{ getStandardFileName(range.standardFile) }}: {{ range.minNpdValue }} mm - {{ range.maxNpdValue }} mm
              </el-tag>
            </div>
          </div>
          <div class="duplicate-standard-files">
            <span class="duplicate-label">涉及的标准文件：</span>
            <el-tag
              v-for="fileId in duplicate.standardFiles"
              :key="fileId"
              size="small"
              type="info"
              style="margin-right: 8px; margin-bottom: 4px"
            >
              {{ getStandardFileName(fileId) }}
            </el-tag>
          </div>
          <div class="default-standard-selector">
            <span class="duplicate-label">默认匹配标准：</span>
            <el-select
              :model-value="duplicate.defaultStandardFileId"
              @update:model-value="(val) => updateDuplicateRangeDefault(duplicate.rangeKey, val)"
              placeholder="请选择默认标准文件"
              style="width: 200px"
            >
              <el-option
                v-for="fileId in duplicate.standardFiles"
                :key="fileId"
                :label="getStandardFileName(fileId)"
                :value="fileId"
              />
            </el-select>
          </div>
        </div>
      </div>
      <div class="tip-text warning-text">检测到多个标准文件配置了重叠的通径范围，请为每个重叠范围选择默认匹配的标准文件</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  configurations: {
    type: Array,
    required: true,
    default: () => []
  },
  pathRanges: {
    type: Array,
    default: () => []
  },
  partType: {
    type: String,
    default: ''
  },
  standardFilesList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:configurations', 'update:duplicateDefaults'])

// 存储重复范围的默认标准文件选择（key: "minNpdValue-maxNpdValue", value: defaultStandardFileId）
const duplicateRangeDefaultsMap = ref({})

// 获取所有可用的NPD值
const npdValues = computed(() => {
  const valueSet = new Set()
  props.pathRanges.forEach(range => {
    valueSet.add(range.minSize)
    if (range.maxSize !== range.minSize) {
      valueSet.add(range.maxSize)
    }
  })
  return Array.from(valueSet).sort((a, b) => a - b)
})

// 标准文件ID -> 名称映射
const standardFilesMap = computed(() => {
  const map = new Map()
  props.standardFilesList.forEach(file => {
    map.set(file.id, file.code)
  })
  return map
})

// 获取标准文件名称
const getStandardFileName = (fileId) => {
  return standardFilesMap.value.get(fileId) || ''
}

// 检查一个范围是否覆盖了某个区间
const rangeCovers = (rangeMin, rangeMax, intervalMin, intervalMax) => {
  return rangeMin <= intervalMin && rangeMax >= intervalMax
}

// 检测重复的通径范围
const duplicateRanges = computed(() => {
  const validConfigs = props.configurations.filter(
    config => config.minNpdValue !== null && config.maxNpdValue !== null
  )
  
  if (validConfigs.length < 2) {
    return []
  }
  
  const endpoints = new Set()
  validConfigs.forEach(config => {
    endpoints.add(config.minNpdValue)
    endpoints.add(config.maxNpdValue)
  })
  
  const sortedEndpoints = Array.from(endpoints).sort((a, b) => a - b)
  const duplicateIntervals = []
  
  for (let i = 0; i < sortedEndpoints.length - 1; i++) {
    const intervalMin = sortedEndpoints[i]
    const intervalMax = sortedEndpoints[i + 1]
    
    const coveringStandards = validConfigs.filter(config => 
      rangeCovers(config.minNpdValue, config.maxNpdValue, intervalMin, intervalMax)
    )
    
    if (coveringStandards.length >= 2) {
      const standardFiles = [...new Set(coveringStandards.map(c => c.standardFile))]
      const ranges = coveringStandards.map(c => ({
        minNpdValue: c.minNpdValue,
        maxNpdValue: c.maxNpdValue,
        standardFile: c.standardFile
      }))
      
      const rangeKey = `${intervalMin}-${intervalMax}-${[...standardFiles].sort().join(',')}`
      
      duplicateIntervals.push({
        overlapMin: intervalMin,
        overlapMax: intervalMax,
        standardFiles,
        ranges,
        rangeKey
      })
    }
  }
  
  return duplicateIntervals.map(interval => {
    const rangeKey = interval.rangeKey
    let defaultStandardFileId = duplicateRangeDefaultsMap.value[rangeKey]
    
    if (!defaultStandardFileId && interval.standardFiles.length > 0) {
      defaultStandardFileId = interval.standardFiles[0]
      duplicateRangeDefaultsMap.value[rangeKey] = defaultStandardFileId
    }
    
    return {
      ...interval,
      defaultStandardFileId
    }
  })
})

const updateDuplicateRangeDefault = (rangeKey, defaultStandardFileId) => {
  duplicateRangeDefaultsMap.value[rangeKey] = defaultStandardFileId
}

// 监听重复范围变化，触发事件
watch([duplicateRanges, duplicateRangeDefaultsMap], () => {
  const duplicateDefaults = duplicateRanges.value.map(range => ({
    overlapMin: range.overlapMin,
    overlapMax: range.overlapMax,
    defaultStandardFileId: range.defaultStandardFileId,
    ranges: range.ranges,
    standardFiles: range.standardFiles,
    rangeKey: range.rangeKey
  }))
  emit('update:duplicateDefaults', duplicateDefaults)
}, { deep: true })

</script>

<style scoped>
.config-section {
  margin-bottom: 20px;
}

.config-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.configuration-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
  margin-bottom: 10px;
}

.config-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  padding: 8px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-file-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
  overflow: hidden;
}

.config-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

.npd-range-selectors {
  display: flex;
  align-items: center;
  min-width: 260px;
}

.range-separator {
  margin: 0 5px;
  color: #606266;
  font-weight: bold;
}

.bend-radius-multiple {
  display: flex;
  align-items: center;
}

.bend-radius-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.duplicate-ranges-container {
  border: 1px solid #f0c78a;
  border-radius: 4px;
  padding: 15px;
  background-color: #fef9e7;
  margin-bottom: 10px;
}

.duplicate-range-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  padding: 12px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #f0c78a;
}

.duplicate-range-item:last-child {
  margin-bottom: 0;
}

.duplicate-range-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 500;
}

.duplicate-count {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.duplicate-ranges-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.ranges-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
}

.duplicate-standard-files {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px;
  background-color: #fafafa;
  border-radius: 4px;
}

.duplicate-label {
  font-size: 13px;
  color: #606266;
  margin-right: 8px;
  font-weight: 500;
}

.default-standard-selector {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.warning-text {
  color: #e6a23c;
  font-weight: 500;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 为el-tag添加溢出处理 */
:deep(.el-tag) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-select__tags) {
  flex-wrap: nowrap;
  overflow: hidden;
}

:deep(.el-select__tags-text) {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
