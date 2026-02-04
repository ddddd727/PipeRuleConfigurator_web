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
          <el-option v-for="pt in partTypes" :key="pt.componentTypeName" :label="pt.componentTypeDescription || pt.componentTypeName" :value="pt.componentTypeName" />
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

      <!-- 标准文件对应材料配置 -->
      <el-form-item label="材料配置：" v-if="form.partType && form.standardFileConfigurations.length > 0">
        <div class="configuration-container">
          <div v-for="config in form.standardFileConfigurations" :key="config.standardFile" class="config-item" style="margin-bottom: 10px; display: flex; align-items: center;">
            <div class="config-file-info" style="width: 120px; margin-right: 10px;">
              <el-tag size="small" type="info">{{ getStandardFileName(config.standardFile) }}</el-tag>
            </div>
            <div class="config-controls" style="display: flex; align-items: center;">
              <div class="material-selector">
                <el-select
                  v-model="config.material"
                  placeholder="选择材料"
                  style="width: 200px"
                >
                  <el-option
                    v-for="material in props.materials"
                    :key="material.id"
                    :label="material.name"
                    :value="material.id"
                  />
                </el-select>
              </div>
              <div class="bend-radius-multiple" v-if="form.partType === 'Bend'" style="margin-left: 10px;">
                <el-input
                  v-model="config.bendRadiusMultiple"
                  placeholder="弯管半径倍数"
                  style="width: 150px"
                />
              </div>
            </div>
          </div>
          <div class="bend-radius-hint" v-if="form.partType === 'Bend'" style="margin-top: 5px; color: #909399; font-size: 12px;">填写的值为弯管半径的倍数</div>
        </div>
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
  duplicateRangeDefaults: [] // 简化模式下该字段通常为空或仅包含基本默认值
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

// 监听部件类型变化，重置标准文件配置并重新获取标准文件列表
watch(() => form.value.partType, (newPartType, oldPartType) => {
  if (newPartType === oldPartType) return
  form.value.standardFileIds = []
  form.value.standardFileConfigurations = []
  form.value.duplicateRangeDefaults = []
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
      // 简化模式下，如果没有复杂的重复范围逻辑，传递空数组或基本默认值
      // 由于我们移除了重复范围检测，这里我们不构造复杂的duplicateRangeDefaults
      duplicateRangeDefaults: []
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
      
      // 简化模式下不恢复重复范围配置
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
}

/* 配置控制区域样式 */
.config-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
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

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>