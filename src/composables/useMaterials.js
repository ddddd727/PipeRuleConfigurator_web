import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useMaterials = () => {
  const materials = ref([])
  const materialsLoading = ref(false)

  const fetchMaterialsData = async () => {
    materialsLoading.value = true
    try {
      const res = await axios.get('/api/pipe-spec/material')
      if (res.data.code === 200) {
        materials.value = res.data.data
      } else {
        ElMessage.error(res.data.msg || '获取材料数据失败')
      }
    } catch (error) {
      console.error('获取材料数据错误:', error)
      ElMessage.error('网络错误，获取材料数据失败')
    } finally {
      materialsLoading.value = false
    }
  }

  return {
    materials,
    materialsLoading,
    fetchMaterialsData
  }
}
