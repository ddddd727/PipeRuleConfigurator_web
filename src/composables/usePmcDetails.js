import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const usePmcDetails = ({
  fetchDimensionData,
  preferredRule,
  clearDimensionData
}) => {
  const currentNode = ref({ label: 'Piping Specification' })
  const formData = ref({
    service: '',
    pipingMaterialClass: '',
    pipe: '',
    material: '',
    pressureClass: '',
    wallThickness: ''
  })

  const fetchPmcCodeDetails = async (code) => {
    try {
      const res = await axios.get(`/api/PmcSpec/Analyze/${code}`)
      if (res.data.code === 200) {
        const data = res.data.data
        formData.value = {
          service: data.service || '',
          pipingMaterialClass: data.pipingMaterialClass || code,
          pipe: data.pipeStandard || '',
          material: data.materialGrade || '',
          pressureClass: data.pressureRating || '',
          wallThickness: data.wallThickness || ''
        }

        if (formData.value.pipe && formData.value.wallThickness) {
          await fetchDimensionData(
            formData.value.pipe,
            formData.value.wallThickness,
            preferredRule.value
          )
        }
      } else {
        ElMessage.error(res.data.message || '获取编码详情失败')
      }
    } catch (error) {
      console.error('获取编码详情错误:', error)
      ElMessage.error('网络错误，获取编码详情失败')
    }
  }

  const handleNodeClick = (data) => {
    currentNode.value = data
    if (!data.children && data.label && data.label.length === 7) {
      fetchPmcCodeDetails(data.label)
    } else {
      formData.value = {
        service: '',
        pipingMaterialClass: '',
        pipe: '',
        material: '',
        pressureClass: '',
        wallThickness: ''
      }
      clearDimensionData()
    }
  }

  return {
    currentNode,
    formData,
    fetchPmcCodeDetails,
    handleNodeClick
  }
}
