<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const route = useRoute()

// 表格配置和数据
const tableConfig = ref({
  title: '',
  columns: [], 
  data: []
})
const loading = ref(false)

// 🔍 1. 搜索关键词
const searchKeyword = ref('')

// 🔍 2. 核心：计算最终显示的数据 (实现全局搜索)
// Element Plus 的筛选是基于当前 :data 的，所以我们先做搜索过滤，再传给 Table 做列筛选
const displayData = computed(() => {
  const rawData = tableConfig.value.data || []
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) return rawData

  // 简单的全字段模糊搜索：只要某一行有任何字段包含关键词，就显示该行
  return rawData.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(keyword)
    )
  })
})

// 🔽 3. 核心：动态生成列筛选选项 (自动去重)
// 这个函数会扫描当前列的所有数据，生成 {text: 'ASTM A106', value: 'ASTM A106'} 这样的数组
const getColumnFilters = (prop) => {
  const rawData = tableConfig.value.data || []
  // 提取该列所有值
  const values = rawData.map(item => item[prop])
  // 去重 (Set)
  const uniqueValues = [...new Set(values)]
  // 过滤掉空值，并映射为 Element Plus 需要的格式
  return uniqueValues
    .filter(v => v !== null && v !== undefined && v !== '')
    .map(v => ({ text: v, value: v }))
}

// 🔽 4. 列筛选逻辑方法 (Element Plus 回调)
// value 是用户选中的值，row 是当前行数据，column 是列配置
const filterHandler = (value, row, column) => {
  const property = column['property']
  return row[property] === value
}

// 核心：根据路由参数请求不同的 Mock 数据
const fetchData = async () => {
  const dictType = route.params.id 
  if (!dictType) return

  loading.value = true
  try {
    const res = await axios.get(`/api/dict/${dictType}`)
    if (res.data.code === 200) {
      tableConfig.value = res.data.data
      // 切换页面时清空搜索框
      searchKeyword.value = ''
    }
  } catch (error) {
    console.error('请求出错:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
watch(() => route.params.id, fetchData)

// 为了演示效果，保留一个简单的新增按钮
const handleAddRow = () => {
  ElMessage.info('新增功能在完整版中实现，这里主要演示筛选')
}
</script>

<template>
  <div class="dict-table">
    <div class="table-header">
      <div class="title-area">
        <h3>{{ tableConfig.title || '数据列表' }}</h3>
      </div>
      
      <div class="actions">
        <el-input 
          v-model="searchKeyword"
          placeholder="请输入关键词搜索..." 
          prefix-icon="Search" 
          clearable
          style="width: 240px; margin-right: 12px;" 
        />
        <el-button type="primary" size="small" @click="handleAddRow">新增条目</el-button>
      </div>
    </div>

    <el-table 
      :data="displayData" 
      border 
      stripe
      style="width: 100%" 
      v-loading="loading"
      height="calc(100vh - 180px)"
    >
      <el-table-column type="index" label="#" width="50" align="center" />

      <el-table-column
        v-for="(col, index) in tableConfig.columns"
        :key="col.prop + index"
        :prop="col.prop"
        :label="col.label"
        :width="col.width || 150"
        show-overflow-tooltip
        :filters="col.filterable ? getColumnFilters(col.prop) : null"
        :filter-method="col.filterable ? filterHandler : null"
        filter-placement="bottom-end"
      >
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.dict-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.title-area h3 {
  margin: 0;
  color: #333;
}

.actions {
  display: flex;
  align-items: center;
}
</style>