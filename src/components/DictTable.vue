<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()

// 表格配置和数据
const tableConfig = ref({
  title: '',
  columns: [],
  data: []
})
const loading = ref(false)

// 核心：根据路由参数请求不同的 Mock 数据
const fetchData = async () => {
  // 获取路由参数，例如 'grade', 'material'
  const dictType = route.params.id 
  if (!dictType) return

  loading.value = true
  try {
    // 对应 src/mock/index.js 里的拦截规则
    const res = await axios.get(`/api/dict/${dictType}`)
    if (res.data.code === 200) {
      tableConfig.value = res.data.data
    }
  } catch (error) {
    console.error('请求出错:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// 监听路由 ID 变化 (例如从“管材等级”切到“主材料”)
watch(() => route.params.id, fetchData)
</script>

<template>
  <div class="dict-table">
    <div class="table-header">
      <h3>{{ tableConfig.title || '数据列表' }}</h3>
      <div class="actions">
        <el-button type="primary" size="small">新增条目</el-button>
      </div>
    </div>

    <el-table 
      :data="tableConfig.data" 
      border 
      stripe
      style="width: 100%" 
      v-loading="loading"
    >
      <el-table-column
        v-for="col in tableConfig.columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
      />
    </el-table>
  </div>
</template>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.table-header h3 {
  margin: 0;
  color: #333;
}
</style>