import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const usePmcVersions = () => {
  const versionList = ref([])
  const loadingVersions = ref(false)
  const currentVersionId = ref(null)

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取版本列表
  const fetchVersions = async (pmcCode, shipType, shipNumber) => {
    if (!pmcCode) return

    loadingVersions.value = true
    try {
      const params = {}
      // 如果有船型船号，传给后端进行筛选
      if (shipType && shipType !== '-') params.shipType = shipType
      if (shipNumber && shipNumber !== '-') params.shipNumber = shipNumber

      const res = await axios.get(`/api/PmcSpec/${pmcCode}/versions`, { params })
      if (res.data.code === 200) {
        // 后端返回的是 { items: [], totalCount: 0 } 结构
        versionList.value = res.data.data?.items || []
      } else {
        ElMessage.error(res.data.message || '获取版本列表失败')
      }
    } catch (error) {
      console.error('获取版本列表错误:', error)
      ElMessage.error(error?.response?.data?.message || '网络错误，获取版本列表失败')
    } finally {
      loadingVersions.value = false
    }
  }

  // 加载指定版本详情
  const loadVersion = async (pmcCode, versionId) => {
    if (!pmcCode || !versionId) return null

    try {
      const res = await axios.get(`/api/PmcSpec/${pmcCode}/versions/${versionId}`)
      if (res.data.code === 200) {
        return res.data.data
      } else {
        ElMessage.error(res.data.message || '获取版本详情失败')
        return null
      }
    } catch (error) {
      console.error('获取版本详情错误:', error)
      ElMessage.error(error?.response?.data?.message || '网络错误，获取版本详情失败')
      return null
    }
  }

  // 回退到指定版本
  const revertVersion = async (pmcCode, versionId, shipType, shipNumber) => {
    if (!pmcCode || !versionId) return false

    try {
      const payload = {}
      if (shipType && shipType !== '-') payload.shipType = shipType
      if (shipNumber && shipNumber !== '-') payload.shipNumber = shipNumber

      const res = await axios.post(`/api/PmcSpec/${pmcCode}/versions/${versionId}/revert`, payload)
      if (res.data.code === 200) {
        ElMessage.success('版本回退成功')
        return true
      } else {
        ElMessage.error(res.data.message || '版本回退失败')
        return false
      }
    } catch (error) {
      console.error('版本回退错误:', error)
      ElMessage.error(error?.response?.data?.message || '网络错误，版本回退失败')
      return false
    }
  }

  return {
    versionList,
    loadingVersions,
    currentVersionId,
    formatDate,
    fetchVersions,
    loadVersion,
    revertVersion
  }
}
