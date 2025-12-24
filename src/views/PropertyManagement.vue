<template>
  <div class="property-page">
    <!-- 页面标题 -->
    <h2>🏷️ 属性管理（Smart3D 设计）</h2>
    
    <!-- 说明提示 -->
    <el-alert 
      title="在此页面可以对 Smart3D 设计的属性进行增删改操作" 
      type="info" 
      show-icon 
      style="margin-bottom: 20px;" 
    />

    <!-- 操作按钮 -->
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="handleAdd">➕ 新增属性</el-button>
      <el-button @click="loadData">🔄 刷新</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table 
      :data="propertyList" 
      border 
      style="width: 100%"
      stripe
    >
      <!-- 序号列 -->
      <el-table-column type="index" label="序号" width="80" />
      
      <!-- 属性名称列 -->
      <el-table-column prop="name" label="属性名称" />
      
      <!-- 属性类型列 -->
      <el-table-column prop="type" label="属性类型" />
      
      <!-- 默认值列 -->
      <el-table-column prop="defaultValue" label="默认值" />
      
      <!-- 备注列 -->
      <el-table-column prop="remark" label="备注" />
      
      <!-- 操作列 -->
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            link 
            type="primary" 
            @click="handleEdit(row)"
          >
            ✏️ 编辑
          </el-button>
          <el-button 
            link 
            type="danger" 
            @click="handleDelete(row)"
          >
            🗑️ 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑/新增 对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑属性' : '新增属性'"
      width="500px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="属性名称">
          <el-input v-model="formData.name" placeholder="请输入属性名称" />
        </el-form-item>
        
        <el-form-item label="属性类型">
          <el-select v-model="formData.type" placeholder="请选择属性类型">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="默认值">
          <el-input v-model="formData.defaultValue" placeholder="请输入默认值" />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            placeholder="请输入备注"
            rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 数据列表
const propertyList = ref([
  {
    id: 1,
    name: '位置X',
    type: 'number',
    defaultValue: '0',
    remark: '物体在X轴的位置'
  },
  {
    id: 2,
    name: '位置Y',
    type: 'number',
    defaultValue: '0',
    remark: '物体在Y轴的位置'
  },
  {
    id: 3,
    name: '是否可见',
    type: 'boolean',
    defaultValue: 'true',
    remark: '控制物体的显示/隐藏'
  }
])

// 对话框显示控制
const dialogVisible = ref(false)
const isEdit = ref(false)

// 表单数据
const formData = ref({
  id: null,
  name: '',
  type: '',
  defaultValue: '',
  remark: ''
})

// 新增属性
const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    id: null,
    name: '',
    type: '',
    defaultValue: '',
    remark: ''
  }
  dialogVisible.value = true
}

// 编辑属性
const handleEdit = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

// 删除属性
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定删除属性 "${row.name}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 从列表中删除
      const index = propertyList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        propertyList.value.splice(index, 1)
      }
      ElMessage.success('删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 保存属性
const handleSave = () => {
  if (!formData.value.name || !formData.value.type) {
    ElMessage.warning('属性名称和类型不能为空')
    return
  }

  if (isEdit.value) {
    // 更新现有属性
    const index = propertyList.value.findIndex(item => item.id === formData.value.id)
    if (index > -1) {
      propertyList.value[index] = { ...formData.value }
    }
    ElMessage.success('更新成功')
  } else {
    // 新增属性
    const newProperty = {
      id: Math.max(...propertyList.value.map(p => p.id), 0) + 1,
      ...formData.value
    }
    propertyList.value.push(newProperty)
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
}

// 加载数据（示例）
const loadData = () => {
  ElMessage.info('数据已刷新')
}
</script>

<style scoped>
.property-page {
  padding: 24px;
}

h2 {
  margin-bottom: 16px;
  color: #303133;
}
</style>
