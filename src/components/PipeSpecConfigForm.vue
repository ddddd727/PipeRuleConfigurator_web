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
          <el-option v-for="pt in partTypes" :key="pt" :label="pt" :value="pt" />
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
        >
          <el-option
            v-for="file in standardFilesList"
            :key="file.id"
            :label="file.code"
            :value="file.id"
          />
        </el-select>
        <div class="tip-text">可多选，已选择 {{ form.standardFileIds.length }} 个文件</div>
      </el-form-item>

      <!-- 标准文件与NPD范围对应关系配置 -->
      <el-form-item label="NPD范围配置：" v-if="form.standardFileConfigurations.length > 0">
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
      <el-form-item label="重复通径范围：" v-if="duplicateRanges.length > 0">
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
                @update:model-value="(val) => updateDuplicateRangeDefault(duplicate.overlapMin, duplicate.overlapMax, val)"
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
  effectiveDate: '',
  remarks: '',
  duplicateRangeDefaults: [] // 存储重复通径范围的默认标准文件选择
})

// 表单验证规则
const rules = {
  effectiveDate: [
    { required: true, message: '请选择生效日期', trigger: 'change' }
  ],
  standardFileIds: [
    { required: true, message: '请选择标准文件', trigger: 'change' }
  ]
}

// 标准文件列表
const standardFilesList = ref([])
const standardFilesLoading = ref(false)

// 获取标准文件列表
const fetchStandardFiles = async () => {
  standardFilesLoading.value = true
  try {
    const res = await axios.get('/api/pipe-spec/standard-files')
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

// 过滤后的通径范围（显示所有可用的NPD范围）
const filteredPathRanges = computed(() => props.pathRanges)

// 获取所有可用的NPD值（从filteredPathRanges中提取并去重）
const npdValues = computed(() => {
  const values = []
  filteredPathRanges.value.forEach(range => {
    // 提取所有NPD值
    if (!values.includes(range.minSize)) {
      values.push(range.minSize)
    }
    if (range.maxSize !== range.minSize && !values.includes(range.maxSize)) {
      values.push(range.maxSize)
    }
  })
  // 按升序排序
  return values.sort((a, b) => a - b)
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

// 获取标准文件名称
const getStandardFileName = (fileId) => {
  const file = standardFilesList.value.find(f => f.id === fileId)
  return file ? file.code : ''
}

// 存储重复范围的默认标准文件选择（key: "minNpdValue-maxNpdValue", value: defaultStandardFileId）
const duplicateRangeDefaultsMap = ref({})

// 判断两个范围是否有重叠
const rangesOverlap = (min1, max1, min2, max2) => {
  return min1 <= max2 && min2 <= max1
}

// 检测重复的通径范围（包括完全相同的和部分重叠的）
const duplicateRanges = computed(() => {
  // 收集所有有效的配置
  const validConfigs = form.value.standardFileConfigurations.filter(
    config => config.minNpdValue !== null && config.maxNpdValue !== null
  )
  
  if (validConfigs.length < 2) {
    return []
  }
  
  // 使用并查集的思想，找出所有相互重叠的范围组
  const groups = []
  const processed = new Set()
  
  validConfigs.forEach((config, index) => {
    if (processed.has(index)) return
    
    // 找出所有与当前配置重叠的配置
    const group = [config]
    const groupIndices = [index]
    processed.add(index)
    
    // 递归查找所有与组内任何配置重叠的配置
    let foundNew = true
    while (foundNew) {
      foundNew = false
      validConfigs.forEach((otherConfig, otherIndex) => {
        if (processed.has(otherIndex)) return
        
        // 检查是否与组内任何配置重叠
        const overlapsWithGroup = group.some(groupConfig => 
          rangesOverlap(
            groupConfig.minNpdValue, 
            groupConfig.maxNpdValue,
            otherConfig.minNpdValue,
            otherConfig.maxNpdValue
          )
        )
        
        if (overlapsWithGroup) {
          group.push(otherConfig)
          groupIndices.push(otherIndex)
          processed.add(otherIndex)
          foundNew = true
        }
      })
    }
    
    // 如果组内至少有2个配置，则添加到结果中
    if (group.length > 1) {
      // 计算重叠区域（所有范围的交集）
      const overlapMin = Math.max(...group.map(c => c.minNpdValue))
      const overlapMax = Math.min(...group.map(c => c.maxNpdValue))
      
      // 收集所有涉及的标准文件
      const standardFiles = [...new Set(group.map(c => c.standardFile))]
      
      // 收集所有涉及的范围（用于显示）
      const ranges = group.map(c => ({
        minNpdValue: c.minNpdValue,
        maxNpdValue: c.maxNpdValue,
        standardFile: c.standardFile
      }))
      
      groups.push({
        overlapMin,
        overlapMax,
        standardFiles,
        ranges, // 保存所有原始范围信息
        // 使用重叠区域作为key
        rangeKey: `${overlapMin}-${overlapMax}`
      })
    }
  })
  
  // 为每个重叠组添加默认标准文件ID
  return groups.map(group => {
    const rangeKey = group.rangeKey
    let defaultStandardFileId = duplicateRangeDefaultsMap.value[rangeKey]
    
    // 如果没有设置，尝试从form.duplicateRangeDefaults中恢复
    if (!defaultStandardFileId) {
      const savedDefault = form.value.duplicateRangeDefaults?.find(
        d => d.overlapMin === group.overlapMin && d.overlapMax === group.overlapMax
      )
      if (savedDefault && savedDefault.defaultStandardFileId) {
        defaultStandardFileId = savedDefault.defaultStandardFileId
        duplicateRangeDefaultsMap.value[rangeKey] = defaultStandardFileId
      } else if (group.standardFiles.length > 0) {
        // 默认选择第一个标准文件
        defaultStandardFileId = group.standardFiles[0]
        duplicateRangeDefaultsMap.value[rangeKey] = defaultStandardFileId
      }
    }
    
    return {
      ...group,
      defaultStandardFileId
    }
  })
})

// 更新重复范围的默认标准文件
const updateDuplicateRangeDefault = (minNpdValue, maxNpdValue, defaultStandardFileId) => {
  const rangeKey = `${minNpdValue}-${maxNpdValue}`
  duplicateRangeDefaultsMap.value[rangeKey] = defaultStandardFileId
}



// 提交状态
const submitting = ref(false)
const formRef = ref()

// 可选的部件类型（从后端获取）
const partTypes = ref([])

const fetchPartTypes = async () => {
  try {
    const res = await axios.get('/api/pipe-spec/part-types')
    // 兼容不同 mock 返回字段（code/data 或 msg/data）
    if (res && res.data) {
      const payload = res.data
      partTypes.value = payload.data || []
    }
  } catch (error) {
    console.error('获取部件类型失败:', error)
  }
}

// 监听重复范围变化，同步到 form.duplicateRangeDefaults
watch([duplicateRanges, duplicateRangeDefaultsMap], () => {
  form.value.duplicateRangeDefaults = duplicateRanges.value.map(range => ({
    overlapMin: range.overlapMin,
    overlapMax: range.overlapMax,
    defaultStandardFileId: range.defaultStandardFileId,
    ranges: range.ranges, // 保存所有原始范围信息
    standardFiles: range.standardFiles // 保存涉及的标准文件
  }))
}, { deep: true })

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
      ...form.value,
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
        standardFiles: range.standardFiles // 保存涉及的标准文件
      }))
    }
    
    // 真实API调用
    try {
      const res = await axios.post('/api/pipe-spec/configure', submitData)
      if (res.data.code === 200) {
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
    // 对话框打开时获取标准文件列表
    fetchStandardFiles()
    fetchPartTypes()
  }
})

// 组件挂载时获取标准文件列表
onMounted(() => {
  fetchStandardFiles()
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

/* 配置分隔符样式 */
.config-separator {
  margin: 0 10px;
  color: #c0c4cc;
  font-weight: bold;
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
</style>