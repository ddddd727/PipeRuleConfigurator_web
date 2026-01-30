<template>
  <el-dialog
  v-model="dialogVisible"
  width="700px"
  :close-on-click-modal="false"
  @close="handleClose"
>
    <template #title>
      <div style="display:flex; align-items:center; gap:12px;">
        <span>{{ buttonLabel ? buttonLabel + ' - ' : '' }}标准文件选择与配置</span>
        <el-select v-model="form.partType" placeholder="部件类型" size="small" style="width:160px">
          <el-option v-for="pt in partTypes" :key="pt.componentTypeName" :label="pt.componentTypeName" :value="pt.componentTypeName" />
        </el-select>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="right">
      <!-- 标准文件选择 -->
      <el-form-item label="标准文件：">
        <el-select
          v-model="form.standardFileIds"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择标准文件"
          style="width: 100%"
          :teleported="false"
          @change="handleStandardFileChange"
          :loading="standardFilesLoading"
          :disabled="!form.partType"
        >
          <el-option
            v-for="file in standardFilesList"
            :key="file.id"
            :label="file.code"
            :value="file.id"
          />
        </el-select>
        <div class="tip-text" v-if="!form.partType">请先选择部件类型，再选择标准文件</div>
        <div class="tip-text" v-else>可多选，已选择 {{ form.standardFileIds.length }} 个文件</div>
      </el-form-item>

      <!-- 标准文件与NPD范围对应关系配置 -->
      <el-form-item label="NPD范围配置：" v-if="form.partType && form.standardFileConfigurations.length > 0">
        <div class="configuration-container">
          <div v-for="config in form.standardFileConfigurations" :key="config.standardFile" class="config-item">
            <div class="config-file-info">
              <el-tag size="small" type="info">{{ getStandardFileName(config.standardFile) }}</el-tag>
            </div>
            <div class="config-controls">
              <div class="material-selector">
                <el-select
                  v-model="config.material"
                  placeholder="选择材料"
                  style="width: 150px; margin-right: 10px"
                >
                  <el-option
                    v-for="material in props.materials"
                    :key="material.id"
                    :label="material.name"
                    :value="material.id"
                  />
                </el-select>
              </div>
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
              <div class="bend-radius-multiple" v-if="form.partType === 'Bend'">
                <el-input
                  v-model="config.bendRadiusMultiple"
                  placeholder="弯管半径倍数"
                  style="width: 150px"
                />
              </div>
            </div>
            <div class="bend-radius-hint" v-if="form.partType === 'Bend'">填写的值为弯管半径的倍数</div>
          </div>
        </div>
        <div class="tip-text">请为每个选择的标准文件配置对应的NPD范围</div>
      </el-form-item>

      <!-- 重复通径范围配置 -->
      <el-form-item label="重复通径范围：" v-if="form.partType && duplicateRanges.length > 0">
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
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确认提交
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { pipeSpecConfigStore } from '@/constants/PipeSpec-item'

const props = defineProps({
  modelValue: Boolean,
  pathRanges: {
    type: Array,
    default: () => []
  },
  buttonLabel: {
    type: String,
    default: ''
  },
  materials: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单数据 - 支持标准文件与NPD范围的一一对应
const form = ref({
  standardFileIds: [], // 选择的标准文件ID数组
  standardFileConfigurations: [], // 每个元素包含standardFile、minNpdValue和maxNpdValue
  partType: '',
  duplicateRangeDefaults: [] // 存储重复通径范围的默认标准文件选择
})

// 表单验证规则
const rules = {
  standardFileIds: [
    { required: true, message: '请选择标准文件', trigger: 'change' }
  ]
}

// 标准文件列表
const standardFilesList = ref([])
const standardFilesLoading = ref(false)

// 获取标准文件列表
const fetchStandardFiles = async () => {
  if (!form.value.partType) {
    standardFilesList.value = []
    return
  }
  standardFilesLoading.value = true
  try {
    const res = await axios.get('/api/pipe-spec/standard-files', {
      params: { partType: form.value.partType }
    })
    if (res.data.code === 200) {
      standardFilesList.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取标准文件列表失败')
    }
  } catch (error) {
    console.error('获取标准文件列表错误:', error)
    ElMessage.error('网络错误，获取标准文件列表失败')
  } finally {
    standardFilesLoading.value = false
  }
}

// 获取所有可用的NPD值（从pathRanges中提取并去重）
const npdValues = computed(() => {
  const valueSet = new Set()
  props.pathRanges.forEach(range => {
    valueSet.add(range.minSize)
    if (range.maxSize !== range.minSize) {
      valueSet.add(range.maxSize)
    }
  })
  // 按升序排序
  return Array.from(valueSet).sort((a, b) => a - b)
})

// 获取最小和最大NPD值
const minNpdValue = computed(() => {
  const values = npdValues.value
  return values.length > 0 ? values[0] : null
})

const maxNpdValue = computed(() => {
  const values = npdValues.value
  return values.length > 0 ? values[values.length - 1] : null
})

// 处理标准文件选择变化
const handleStandardFileChange = (value) => {
  if (!form.value.partType) {
    form.value.standardFileIds = []
    form.value.standardFileConfigurations = []
    return
  }
  // 更新选择的文件ID数组
  form.value.standardFileIds = value
  
  // 初始化标准文件配置
  const newConfigurations = []
  
  // 保留已存在的配置
  value.forEach(fileId => {
    const existingConfig = form.value.standardFileConfigurations.find(config => config.standardFile === fileId)
    if (existingConfig) {
      newConfigurations.push(existingConfig)
    } else {
      newConfigurations.push({
        standardFile: fileId,
        material: props.materials.length > 0 ? props.materials[0].id : null,
        minNpdValue: minNpdValue.value,
        maxNpdValue: maxNpdValue.value,
        bendRadiusMultiple: null
      })
    }
  })
  
  form.value.standardFileConfigurations = newConfigurations
}

// 标准文件ID -> 名称映射，减少重复查找
const standardFilesMap = computed(() => {
  const map = new Map()
  standardFilesList.value.forEach(file => {
    map.set(file.id, file.code)
  })
  return map
})

// 获取标准文件名称
const getStandardFileName = (fileId) => {
  return standardFilesMap.value.get(fileId) || ''
}

// 存储重复范围的默认标准文件选择（key: "minNpdValue-maxNpdValue", value: defaultStandardFileId）
const duplicateRangeDefaultsMap = ref({})

// 检查一个范围是否覆盖了某个区间
const rangeCovers = (rangeMin, rangeMax, intervalMin, intervalMax) => {
  // 范围覆盖区间，当且仅当：rangeMin <= intervalMin && rangeMax >= intervalMax
  return rangeMin <= intervalMin && rangeMax >= intervalMax
}

// 检测重复的通径范围（找出所有有多个标准覆盖的子区间）
const duplicateRanges = computed(() => {
  // 收集所有有效的配置
  const validConfigs = form.value.standardFileConfigurations.filter(
    config => config.minNpdValue !== null && config.maxNpdValue !== null
  )
  
  if (validConfigs.length < 2) {
    return []
  }
  
  // 找出所有范围的端点（最小值和最大值）
  const endpoints = new Set()
  validConfigs.forEach(config => {
    endpoints.add(config.minNpdValue)
    endpoints.add(config.maxNpdValue)
  })
  
  // 将端点排序
  const sortedEndpoints = Array.from(endpoints).sort((a, b) => a - b)
  
  // 找出所有有多个标准覆盖的区间
  const duplicateIntervals = []
  
  // 遍历每两个相邻端点之间的区间
  for (let i = 0; i < sortedEndpoints.length - 1; i++) {
    const intervalMin = sortedEndpoints[i]
    const intervalMax = sortedEndpoints[i + 1]
    
    // 检查哪些标准文件覆盖了这个区间
    const coveringStandards = validConfigs.filter(config => 
      rangeCovers(config.minNpdValue, config.maxNpdValue, intervalMin, intervalMax)
    )
    
    // 只保留有2个或以上标准文件覆盖的区间
    if (coveringStandards.length >= 2) {
      // 收集涉及的标准文件ID
      const standardFiles = [...new Set(coveringStandards.map(c => c.standardFile))]
      
      // 收集涉及的范围（用于显示）
      const ranges = coveringStandards.map(c => ({
        minNpdValue: c.minNpdValue,
        maxNpdValue: c.maxNpdValue,
        standardFile: c.standardFile
      }))
      
      // 生成唯一标识
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
  
  // 为每个重叠区间添加默认标准文件ID
  return duplicateIntervals.map(interval => {
    const rangeKey = interval.rangeKey
    let defaultStandardFileId = duplicateRangeDefaultsMap.value[rangeKey]
    
    // 如果没有设置，尝试从form.duplicateRangeDefaults中恢复
    if (!defaultStandardFileId) {
      const savedDefault = form.value.duplicateRangeDefaults?.find(
        d => d.rangeKey === interval.rangeKey
      )
      if (savedDefault && savedDefault.defaultStandardFileId) {
        defaultStandardFileId = savedDefault.defaultStandardFileId
        duplicateRangeDefaultsMap.value[rangeKey] = defaultStandardFileId
      } else if (interval.standardFiles.length > 0) {
        // 默认选择第一个标准文件
        defaultStandardFileId = interval.standardFiles[0]
        duplicateRangeDefaultsMap.value[rangeKey] = defaultStandardFileId
      }
    }
    
    return {
      ...interval,
      defaultStandardFileId
    }
  })
})

// 更新重复范围的默认标准文件
const updateDuplicateRangeDefault = (rangeKey, defaultStandardFileId) => {
  duplicateRangeDefaultsMap.value[rangeKey] = defaultStandardFileId
}



// 提交状态
const submitting = ref(false)
const formRef = ref()

// 可选的部件类型（从后端获取）
const partTypes = ref([])

const fetchPartTypes = async () => {
  try {
    const res = await axios.get('/api/PmcSpec/ComponentTypes')
    if (res && res.data && res.data.code === 200) {
      partTypes.value = res.data.data || []
    } else {
      ElMessage.error(res.data?.message || '获取部件类型失败')
    }
  } catch (error) {
    console.error('获取部件类型失败:', error)
    ElMessage.error('网络错误，获取部件类型失败')
  }
}

// 监听重复范围变化，同步到 form.duplicateRangeDefaults
watch([duplicateRanges, duplicateRangeDefaultsMap], () => {
  form.value.duplicateRangeDefaults = duplicateRanges.value.map(range => ({
    overlapMin: range.overlapMin,
    overlapMax: range.overlapMax,
    defaultStandardFileId: range.defaultStandardFileId,
    ranges: range.ranges, // 保存所有原始范围信息
    standardFiles: range.standardFiles, // 保存涉及的标准文件
    rangeKey: range.rangeKey // 保存唯一标识
  }))
}, { deep: true })

// 监听部件类型变化，重置标准文件配置并重新获取标准文件列表
watch(() => form.value.partType, (newPartType, oldPartType) => {
  if (newPartType === oldPartType) return
  form.value.standardFileIds = []
  form.value.standardFileConfigurations = []
  form.value.duplicateRangeDefaults = []
  duplicateRangeDefaultsMap.value = {}
  if (newPartType) {
    fetchStandardFiles()
  } else {
    standardFilesList.value = []
  }
})

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 首先验证部件类型是否已选择
    if (!form.value.partType) {
      ElMessage.error('请选择部件类型')
      return
    }
    
    // 表单基本验证
    await formRef.value.validate()
    
    // 验证每个标准文件是否都选择了有效的NPD范围
    const invalidConfigs = form.value.standardFileConfigurations.filter(
      config => config.minNpdValue === null || config.maxNpdValue === null || config.minNpdValue > config.maxNpdValue
    )
    
    if (invalidConfigs.length > 0) {
      ElMessage.error('请为所有选择的标准文件配置有效的NPD范围（最小值不能大于最大值）')
      return
    }
    
    // 验证重复通径范围是否都选择了默认标准文件
    const unselectedDefaults = duplicateRanges.value.filter(
      range => !range.defaultStandardFileId
    )
    
    if (unselectedDefaults.length > 0) {
      ElMessage.error('请为所有重复的通径范围选择默认匹配的标准文件')
      return
    }
    
    submitting.value = true
    
    // 准备提交数据 - 简化参数传递
    const submitData = {
      partType: form.value.partType,
      standardFileIds: form.value.standardFileIds,
      standardFileConfigurations: form.value.standardFileConfigurations,
      // 转换为更友好的格式，传递数组即可
      configurations: form.value.standardFileConfigurations.map(config => {
        const material = props.materials.find(m => m.id === config.material)
        return {
          standardFileId: config.standardFile,
          standardFileName: getStandardFileName(config.standardFile),
          materialId: config.material,
          materialName: material ? material.name : '',
          npdRange: [config.minNpdValue, config.maxNpdValue],
          bendRadiusMultiple: config.bendRadiusMultiple
        }
      }),
      // 包含重复通径范围的默认标准配置
      duplicateRangeDefaults: duplicateRanges.value.map(range => ({
        overlapMin: range.overlapMin,
        overlapMax: range.overlapMax,
        defaultStandardFileId: range.defaultStandardFileId,
        defaultStandardFileName: getStandardFileName(range.defaultStandardFileId),
        ranges: range.ranges, // 保存所有原始范围信息
        standardFiles: range.standardFiles, // 保存涉及的标准文件
        rangeKey: range.rangeKey // 保存唯一标识
      }))
    }
    
    // 真实API调用
    try {
      const res = await axios.post('/api/pipe-spec/configure', submitData)
      if (res.data.code === 200) {
        // 不在这里保存到本地存储，由父组件 PipeSpec.vue 统一管理
        emit('confirm', submitData)
        dialogVisible.value = false
        ElMessage.success('配置已保存！')
      } else {
        ElMessage.error(res.data.msg || '配置保存失败')
      }
    } catch (error) {
      console.error('配置保存错误:', error)
      ElMessage.error('网络错误，配置保存失败')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 清空选择的文件和配置
  form.value.standardFileIds = []
  form.value.standardFileConfigurations = []
  form.value.duplicateRangeDefaults = []
  duplicateRangeDefaultsMap.value = {}
  dialogVisible.value = false
}

// 监听对话框显示/隐藏
watch(dialogVisible, (val) => {
  if (val) {
    // 对话框打开时重置表单
    nextTick(() => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
      // 确保配置数组为空
      form.value.standardFileConfigurations = []
      form.value.duplicateRangeDefaults = []
      duplicateRangeDefaultsMap.value = {}
    })
    fetchPartTypes()
  }
})

// 监听部件类型变化，尝试从存储中加载已有配置
watch(() => form.value.partType, async (newPartType) => {
  if (newPartType && dialogVisible.value) {
    // 尝试从存储中获取该部件类型的已有配置
    const existingConfig = pipeSpecConfigStore.getConfigByPartType(newPartType)
    
    if (existingConfig) {
      // 如果存在已有配置，恢复到表单中
      await nextTick()
      
      // 恢复标准文件选择
      form.value.standardFileIds = [...existingConfig.standardFileIds]
      
      // 恢复标准文件配置
      form.value.standardFileConfigurations = existingConfig.standardFileConfigurations.map(config => ({
        ...config
      }))
      
      // 恢复重复范围默认配置
      if (existingConfig.duplicateRangeDefaults && existingConfig.duplicateRangeDefaults.length > 0) {
        existingConfig.duplicateRangeDefaults.forEach(defaultConfig => {
          duplicateRangeDefaultsMap.value[defaultConfig.rangeKey] = defaultConfig.defaultStandardFileId
        })
      }
    }
  }
})

// 组件挂载时获取标准文件列表
onMounted(() => {
  fetchPartTypes()
})
</script>

<style scoped>
.tip-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}



/* 配置容器样式 */
.configuration-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
  margin-bottom: 10px;
}

/* 配置项样式 */
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

/* 配置文件信息样式 */
.config-file-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;
  overflow: hidden;
}

/* 配置控制区域样式 */
.config-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}

/* 材料选择器样式 */
.material-selector {
  display: flex;
  align-items: center;
}

/* 为el-tag添加溢出处理 */
:deep(.el-tag) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* NPD范围选择器容器 */
.npd-range-selectors {
  display: flex;
  align-items: center;
  min-width: 260px;
}

/* 范围分隔符 */
.range-separator {
  margin: 0 5px;
  color: #606266;
  font-weight: bold;
}

/* 弯管半径倍数样式 */
.bend-radius-multiple {
  display: flex;
  align-items: center;
}

/* 弯管半径提示文字 */
.bend-radius-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
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

/* 重复通径范围容器样式 */
.duplicate-ranges-container {
  border: 1px solid #f0c78a;
  border-radius: 4px;
  padding: 15px;
  background-color: #fef9e7;
  margin-bottom: 10px;
}

/* 重复范围项样式 */
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

/* 重复范围信息样式 */
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

/* 涉及的范围列表样式 */
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

/* 涉及的标准文件列表样式 */
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

/* 默认标准选择器样式 */
.default-standard-selector {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

/* 警告提示文字样式 */
.warning-text {
  color: #e6a23c;
  font-weight: 500;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>