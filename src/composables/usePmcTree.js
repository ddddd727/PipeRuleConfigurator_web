import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const usePmcTree = () => {
  const treeData = ref([])
  const treeLoading = ref(false)
  const shipInfos = ref([])
  const shipInfosLoading = ref(false)
  const selectedShipClass = ref(null)
  const selectedShipNumber = ref(null)
  let pmcRulesRequestId = 0

  const shipClasses = computed(() => {
    const uniqueTypes = [...new Set(shipInfos.value.map(item => item.shipType))]
    return uniqueTypes.map((type, index) => ({
      id: index + 1,
      name: type
    }))
  })

  const shipNumbers = computed(() => {
    if (!selectedShipClass.value) return []
    const shipType = shipClasses.value.find(item => item.id === selectedShipClass.value)?.name
    if (!shipType) return []
    return shipInfos.value
      .filter(item => item.shipType === shipType)
      .map((item, index) => ({
        id: index + 1,
        name: item.shipNumber
      }))
  })

  const fetchShipInfos = async () => {
    shipInfosLoading.value = true
    try {
      const res = await axios.get('/api/PmcSpec/ShipInfos')
      if (res.data.code === 200) {
        shipInfos.value = res.data.data
      } else {
        ElMessage.error(res.data.message || '获取船型船号信息失败')
      }
    } catch (error) {
      console.error('获取船型船号信息错误:', error)
      ElMessage.error('网络错误，获取船型船号信息失败')
    } finally {
      shipInfosLoading.value = false
    }
  }

  const fetchPmcRules = async (shipNumber) => {
    const requestId = ++pmcRulesRequestId
    treeLoading.value = true
    try {
      const res = await axios.get(`/api/PmcSpec/PmcRules/${shipNumber}`)
      if (res.data.code === 200) {
        if (requestId === pmcRulesRequestId) {
          treeData.value = transformToTreeStructure(res.data.data)
        }
      } else {
        ElMessage.error(res.data.message || '获取PMC规则数据失败')
      }
    } catch (error) {
      console.error('获取PMC规则数据错误:', error)
      ElMessage.error('网络错误，获取PMC规则数据失败')
    } finally {
      if (requestId === pmcRulesRequestId) {
        treeLoading.value = false
      }
    }
  }

  const transformToTreeStructure = (data) => {
    if (!data || data.length === 0) {
      return []
    }
    const materialMap = new Map()
    data.forEach(item => {
      const material = item.material
      const pipeStandard = item.pipeStandard || item.pipeStadard
      const pmcCode = item.pmcCode

      if (!materialMap.has(material)) {
        materialMap.set(material, {
          label: material,
          children: new Map()
        })
      }

      const materialNode = materialMap.get(material)
      if (!materialNode.children.has(pipeStandard)) {
        materialNode.children.set(pipeStandard, {
          label: pipeStandard,
          children: []
        })
      }

      const pipeStandardNode = materialNode.children.get(pipeStandard)
      pipeStandardNode.children.push({
        label: pmcCode,
        shipNumber: item.shipNumber,
        material: item.material,
        pipeStandard: pipeStandard || '',
        status: item.status
      })
    })

    const result = []
    materialMap.forEach((value) => {
      const children = []
      value.children.forEach((childValue) => {
        children.push(childValue)
      })
      result.push({
        label: value.label,
        children: children
      })
    })
    return result
  }

  watch(selectedShipClass, () => {
    selectedShipNumber.value = null
    treeData.value = []
  })

  watch(selectedShipNumber, async (newVal) => {
    if (newVal) {
      const shipNumber = shipNumbers.value.find(item => item.id === newVal)?.name
      if (shipNumber) {
        await fetchPmcRules(shipNumber)
      }
    } else {
      treeData.value = []
    }
  })

  return {
    treeData,
    treeLoading,
    shipInfos,
    shipInfosLoading,
    selectedShipClass,
    selectedShipNumber,
    shipClasses,
    shipNumbers,
    fetchShipInfos
  }
}
