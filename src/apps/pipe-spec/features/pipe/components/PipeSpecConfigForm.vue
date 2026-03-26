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
        <el-select 
          v-model="form.componentTypeId" 
          placeholder="部件类型" 
          size="small" 
          style="width:160px"
          @change="handleComponentTypeChange"
        >
          <el-option 
            v-for="pt in partTypes" 
            :key="pt.id" 
            :label="pt.componentTypeDescription || pt.componentTypeName" 
            :value="pt.id" 
          />
        </el-select>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="right">
      <!-- 标准选择 -->
      <el-form-item label="标准：" prop="standardNames">
        <el-select
          v-model="form.standardNames"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择标准"
          style="width: 100%"
          :teleported="false"
          @change="handleStandardChange"
          :loading="specsLoading"
          :disabled="!form.componentTypeId"
        >
          <el-option
            v-for="spec in pipeFittingSpecs"
            :key="spec.standardName"
            :label="spec.standardName"
            :value="spec.standardName"
          />
        </el-select>
        <div class="tip-text" v-if="!form.componentTypeId">请先选择部件类型，再选择标准</div>
        <div class="tip-text" v-else>可多选，已选择 {{ form.standardNames.length }} 个标准</div>
      </el-form-item>

      <!-- 标准对应材料配置 -->
      <el-form-item label="材料配置：" v-if="form.componentTypeId && form.standardConfigurations.length > 0">
        <div class="configuration-container">
          <div v-for="config in form.standardConfigurations" :key="config.standardName" class="config-item" style="margin-bottom: 10px; display: flex; align-items: center;">
            <div class="config-file-info" style="width: 120px; margin-right: 10px;">
              <el-tag size="small" type="info">{{ config.standardName }}</el-tag>
            </div>
            <div class="config-controls" style="display: flex; align-items: center;">
              <div class="material-selector">
                <el-select
                  v-model="config.materialName"
                  placeholder="选择材料"
                  style="width: 200px"
                >
                  <el-option
                    v-for="material in getMaterialsForStandard(config.standardName)"
                    :key="material"
                    :label="material"
                    :value="material"
                  />
                </el-select>
              </div>
              <!-- 根据简化契约，移除弯管半径倍数配置 -->
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确认提交
        </el-button>
        <el-button @click="handleReset" type="warning" plain style="float: left">重置配置</el-button>
        <el-button @click="handleClose">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pipeSpecConfigStore } from '@/apps/pipe-spec/features/pipe/constants/PipeSpec-item'

const props = defineProps({
  modelValue: Boolean,
  buttonLabel: {
    type: String,
    default: ''
  },
  initialConfig: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单数据
  const form = ref({
    standardNames: [], // 选择的标准名称数组
    standardConfigurations: [], // 每个元素包含standardName、materialName等
    componentTypeId: null, // 部件类型ID
    partType: '' // 部件类型名称（兼容旧逻辑）
  })

  // 表单验证规则
  const rules = {
    componentTypeId: [
      { required: true, message: '请选择部件类型', trigger: 'change' }
    ],
    standardNames: [
      { required: true, message: '请选择标准', trigger: 'change' }
    ]
  }

  // 标准规格列表 (包含标准名)
  const pipeFittingSpecs = ref([])
  const specsLoading = ref(false)

  // 材料列表 (从后端获取的统一列表)
  const materialsList = ref([])

  // 获取材料列表
  const fetchMaterials = async () => {
    try {
      const res = await axios.get('/api/PmcSpec/MaterialsGrades')
      if (res.data.code === 200) {
        materialsList.value = res.data.data || []
      } else {
        ElMessage.error(res.data.message || '获取材料列表失败')
      }
    } catch (error) {
      console.error('获取材料列表错误:', error)
      ElMessage.error('网络错误，获取材料列表失败')
    }
  }

  // 获取管附件规格列表
  const fetchPipeFittingSpecs = async () => {
    if (!form.value.componentTypeId) {
      pipeFittingSpecs.value = []
      return
    }
    specsLoading.value = true
    try {
      const res = await axios.get('/api/PmcSpec/PipeFittingSpec', {
        params: { 
          componentTypeId: form.value.componentTypeId,
          componentTypeName: form.value.partType // 兼容性保留
        }
      })
      if (res.data.code === 200) {
        // 后端返回的是字符串数组，需转换为对象结构以保持兼容
        const standards = res.data.data || []
        pipeFittingSpecs.value = standards.map(std => ({
          standardName: std,
          // materialList 不再从此处获取，而是使用统一的 materialsList
        }))
      } else {
        ElMessage.error(res.data.message || '获取管附件规格失败')
      }
    } catch (error) {
      console.error('获取管附件规格错误:', error)
      ElMessage.error('网络错误，获取管附件规格失败')
    } finally {
      specsLoading.value = false
    }
  }

// NPD logic removed

// 处理标准选择变化
const handleStandardChange = (value) => {
  if (!form.value.partType) {
    form.value.standardNames = []
    form.value.standardConfigurations = []
    return
  }
  // 更新选择的标准名称数组
  form.value.standardNames = value
  
  // 初始化标准配置
  const newConfigurations = []
  
  // 保留已存在的配置
  value.forEach(stdName => {
    const existingConfig = form.value.standardConfigurations.find(config => config.standardName === stdName)
    if (existingConfig) {
      newConfigurations.push(existingConfig)
    } else {
      // 查找对应标准的默认材料（取全局材料列表第一个）
      const defaultMaterial = materialsList.value.length > 0 ? materialsList.value[0] : ''
      
      newConfigurations.push({
        standardName: stdName,
        materialName: defaultMaterial
      })
    }
  })
  
  form.value.standardConfigurations = newConfigurations
}

// 获取指定标准的材料列表（统一使用全局材料列表）
const getMaterialsForStandard = (standardName) => {
  return materialsList.value
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

// 处理部件类型变更
const handleComponentTypeChange = (val) => {
  // 逻辑已移至 watch 统一处理
}

// 监听部件类型ID变化，重置标准配置并重新获取规格列表
watch(() => form.value.componentTypeId, async (newId, oldId) => {
  if (newId === oldId) return
  
  // 同步更新 partType 名称
  const pt = partTypes.value.find(p => p.id === newId)
  if (pt) {
    form.value.partType = pt.componentTypeName
  } else {
    form.value.partType = ''
  }

  form.value.standardNames = []
  form.value.standardConfigurations = []
  
  if (newId) {
    await fetchPipeFittingSpecs()
    
    // 尝试从存储中加载已有配置 (基于 partType 名称)
    if (form.value.partType && dialogVisible.value) {
      const existingConfig = pipeSpecConfigStore.getConfigByPartType(form.value.partType)
      
      if (existingConfig) {
        await nextTick()
        form.value.standardNames = [...(existingConfig.standardNames || [])]
        form.value.standardConfigurations = (existingConfig.standardConfigurations || []).map(config => ({
          ...config
        }))
      }
    }
  } else {
    pipeFittingSpecs.value = []
  }
})

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 首先验证部件类型是否已选择
    if (!form.value.componentTypeId) {
      ElMessage.error('请选择部件类型')
      return
    }
    
    // 表单基本验证
    await formRef.value.validate()
    
    submitting.value = true
    
    // 准备提交数据
    const submitData = {
      componentTypeId: form.value.componentTypeId, // 新增 ID
      partType: form.value.partType,
      // 传递完整配置
      configurations: form.value.standardConfigurations.map(config => {
        return {
          standardFileName: config.standardName, // 契约示例中使用 standardFileName
          materialName: config.materialName
        }
      }),
      // 内部使用的字段
      standardNames: form.value.standardNames,
      standardConfigurations: form.value.standardConfigurations
    }
    
    // 本地确认，不直接调用后端（由父组件处理最终保存）
    emit('confirm', submitData)
    dialogVisible.value = false
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单逻辑
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.value.standardNames = []
  form.value.standardConfigurations = []
  form.value.componentTypeId = null
  form.value.partType = ''
  pipeFittingSpecs.value = []
}

// 处理重置按钮点击
const handleReset = () => {
  ElMessageBox.confirm(
    '确定要清空当前所有配置项吗？此操作将清除已选的标准和材料配置。',
    '确认重置',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    resetForm()
    ElMessage.success('配置已重置')
  }).catch(() => {})
}

// 关闭对话框
const handleClose = () => {
  resetForm()
  dialogVisible.value = false
}

// 监听对话框显示/隐藏
watch(dialogVisible, async (val) => {
  if (val) {
    // 获取部件类型列表
    await fetchPartTypes()
    // 获取材料列表
    await fetchMaterials()
    
    // 如果有初始配置，进行回填
    if (props.initialConfig) {
      // 使用 nextTick 确保在 watch 的潜在干扰之后执行
      nextTick(async () => {
        const config = JSON.parse(JSON.stringify(props.initialConfig))
        
        // 1. 设置部件类型 ID
        if (config.componentTypeId) {
          form.value.componentTypeId = config.componentTypeId
        } else if (config.partType) {
          // 如果只有名称，尝试查找 ID
          const pt = partTypes.value.find(p => p.componentTypeName === config.partType)
          if (pt) form.value.componentTypeId = pt.id
        }
        
        // 2. 等待 watch 及其内部逻辑执行
        await nextTick()
        await nextTick()
        
        // 3. 强制回填标准名称和配置
        // 优先使用配置中的 standardNames，如果没有则从 configurations 推导
        if (config.standardNames && config.standardNames.length > 0) {
            form.value.standardNames = config.standardNames
        } else if (config.configurations && config.configurations.length > 0) {
            form.value.standardNames = [...new Set(config.configurations.map(c => c.standardFileName))]
        } else {
            form.value.standardNames = []
        }
        
        // 恢复配置详情
        if (config.configurations && config.configurations.length > 0) {
           form.value.standardConfigurations = config.configurations.map(c => ({
             standardName: c.standardFileName,
             materialName: c.materialName
           }))
        } else {
           form.value.standardConfigurations = []
        }
      })
    } else {
      // 没有初始配置，执行重置
      resetForm()
    }
  }
})

// 组件挂载时获取部件类型
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