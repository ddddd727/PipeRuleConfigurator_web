<template>
  <el-dialog
  v-model="dialogVisible"
  :title="`${buttonLabel ? buttonLabel + ' - ' : ''}标准文件选择与配置`"
  width="700px"
  :close-on-click-modal="false"
  @close="handleClose"
>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="right"
    >
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
        >
          <el-option
            v-for="file in standardFilesList"
            :key="file.id"
            :label="file.name"
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
            </div>
          </div>
        </div>
        <div class="tip-text">请为每个选择的标准文件配置对应的NPD范围</div>
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
import { ref, computed, watch, nextTick } from 'vue'
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
  effectiveDate: '',
  remarks: ''
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

// 模拟的标准文件列表
const standardFilesList = ref([
  { id: 1, name: 'GB/T 12459-2017 钢制对焊管件' },
  { id: 2, name: 'GB/T 13401-2017 钢板制对焊管件' },
  { id: 3, name: 'ASME B16.9-2018 工厂制造的锻钢对焊管件' },
  { id: 4, name: 'HG/T 21635-1987 碳钢、低合金钢无缝对焊管件' },
  { id: 5, name: 'SH/T 3408-2012 石油化工钢制对焊管件' },
  { id: 6, name: 'DL/T 695-2014 电站钢制对焊管件' },
  { id: 7, name: 'SY/T 0510-2010 钢制对焊管件规范' },
  { id: 8, name: 'JB/T 4710-2005 钢制塔式容器' },
  { id: 9, name: 'NB/T 47002-2019 压力容器用爆炸焊接复合板' }
])

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
        material: props.materials.length > 0 ? props.materials[0].id : null, // 默认选择第一个材料
        minNpdValue: minNpdValue.value, // 默认选择最小值
        maxNpdValue: maxNpdValue.value  // 默认选择最大值
      })
    }
  })
  
  form.value.standardFileConfigurations = newConfigurations
}

// 获取标准文件名称
const getStandardFileName = (fileId) => {
  const file = standardFilesList.value.find(f => f.id === fileId)
  return file ? file.name : ''
}



// 提交状态
const submitting = ref(false)
const formRef = ref()

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
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
          npdRange: [config.minNpdValue, config.maxNpdValue] // 简化为传递数组
        }
      })
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('confirm', submitData)
    
    dialogVisible.value = false
    ElMessage.success('配置已保存！')
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
    })
  }
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
  width: 100%;
}

/* 材料选择器样式 */
.material-selector {
  display: flex;
  align-items: center;
  margin-right: 15px;
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