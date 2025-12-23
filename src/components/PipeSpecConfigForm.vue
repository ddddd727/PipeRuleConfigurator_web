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
      <!-- 标准文件选择 - 使用虚拟滚动节省空间 -->
      <el-form-item label="标准文件：" prop="standardFiles">
        <el-select
          v-model="form.standardFiles"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择标准文件"
          style="width: 100%"
          :teleported="false"
        >
          <el-option
            v-for="file in standardFilesList"
            :key="file.id"
            :label="file.name"
            :value="file.id"
          />
        </el-select>
        <div class="tip-text">可多选，已选择 {{ form.standardFiles.length }} 个文件</div>
      </el-form-item>

      <!-- 作用范围选择 -->
      <el-form-item label="作用范围：" prop="pathRangeIds">
        <div class="path-range-selector">
          <!-- 范围选择表格 -->
          <el-table
            :data="filteredPathRanges"
            height="200"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="通径名称" width="150" />
            <el-table-column prop="minSize" label="最小通径" width="100">
              <template #default="{ row }">
                {{ row.minSize }} mm
              </template>
            </el-table-column>
            <el-table-column prop="maxSize" label="最大通径" width="100">
              <template #default="{ row }">
                {{ row.maxSize }} mm
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 已选摘要 -->
          <div v-if="selectedPaths.length > 0" class="selection-summary">
            <el-tag
              v-for="path in selectedPaths"
              :key="path.id"
              size="small"
              type="info"
              closable
              @close="removePath(path.id)"
            >
              {{ path.minSize }} - {{ path.maxSize }} mm
            </el-tag>
          </div>
          <div v-else class="selection-summary empty">
            未选择任何通径范围
          </div>
        </div>
      </el-form-item>

      <!-- 额外配置 -->
      <el-form-item label="生效日期：" prop="effectiveDate">
        <el-date-picker
          v-model="form.effectiveDate"
          type="date"
          placeholder="选择生效日期"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="备注信息：" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="200"
          show-word-limit
        />
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
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单数据
const form = ref({
  standardFiles: [],
  pathRangeIds: [],
  effectiveDate: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  standardFiles: [
    { required: true, message: '请至少选择一个标准文件', trigger: 'change' }
  ],
  pathRangeIds: [
    { required: true, message: '请至少选择一个作用范围', trigger: 'change' }
  ],
  effectiveDate: [
    { required: true, message: '请选择生效日期', trigger: 'change' }
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

// 表格选择相关
const tableSelection = ref([])
const selectedPaths = computed(() => tableSelection.value)

// 过滤后的通径范围（可根据需要添加搜索功能）
const filteredPathRanges = computed(() => props.pathRanges)

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  tableSelection.value = selection
  form.value.pathRangeIds = selection.map(item => item.id)
}

// 保持removePath函数，用于已选摘要的关闭按钮
const removePath = (id) => {
  const index = form.value.pathRangeIds.indexOf(id)
  if (index > -1) {
    form.value.pathRangeIds.splice(index, 1)
    const pathIndex = tableSelection.value.findIndex(item => item.id === id)
    if (pathIndex > -1) {
      tableSelection.value.splice(pathIndex, 1)
    }
  }
}

// 提交状态
const submitting = ref(false)
const formRef = ref()

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('confirm', {
      ...form.value,
      selectedFiles: standardFilesList.value.filter(file => 
        form.value.standardFiles.includes(file.id)
      ),
      selectedPaths: tableSelection.value
    })
    
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
  formRef.value?.resetFields()
  tableSelection.value = []
  dialogVisible.value = false
}

// 监听对话框显示/隐藏
watch(dialogVisible, (val) => {
  if (val) {
    // 对话框打开时重置表单
    nextTick(() => {
      formRef.value?.resetFields()
      tableSelection.value = []
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

.path-range-selector {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background-color: #fafafa;
}

.quick-actions {
  margin-bottom: 10px;
}

.quick-actions .el-button {
  margin-right: 8px;
  margin-bottom: 5px;
}

.selection-summary {
  margin-top: 10px;
  padding: 8px;
  border-top: 1px dashed #dcdfe6;
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}

.selection-summary.empty {
  color: #c0c4cc;
  font-style: italic;
}

.selection-summary .el-tag {
  margin: 2px;
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