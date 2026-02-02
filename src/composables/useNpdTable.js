import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const useNpdTable = () => {
  // 管材通道通径、外径、壁厚数据
  const dimensionData = ref([])
  const dimensionLoading = ref(false)
  const baseDimensionCache = ref({})

  // 选择范围变量 - 默认选中所有NPD
  const selectedMin = ref(null)
  const selectedMax = ref(null)

  const allNpdValues = computed(() => {
    const npdRow = dimensionData.value.find(row => row.name === 'NPD')
    if (!npdRow) return []

    const values = []
    for (const key in npdRow) {
      if (key.startsWith('col')) {
        const value = parseInt(npdRow[key])
        if (!isNaN(value)) {
          values.push(value)
        }
      }
    }
    return values.sort((a, b) => a - b)
  })

  const minNpdValue = computed(() => {
    const values = allNpdValues.value
    return values.length > 0 ? values[0] : null
  })

  const maxNpdValue = computed(() => {
    const values = allNpdValues.value
    return values.length > 0 ? values[values.length - 1] : null
  })

  const columnCount = computed(() => {
    if (!dimensionData.value || dimensionData.value.length === 0) {
      return 15
    }
    const firstRow = dimensionData.value[0]
    const cols = Object.keys(firstRow).filter(key => key.startsWith('col')).length
    return Math.max(cols, 15)
  })

  const columnNpdMap = computed(() => {
    const npdRow = dimensionData.value.find(row => row.name === 'NPD')
    if (!npdRow) return new Map()

    const map = new Map()
    for (let i = 1; i <= columnCount.value; i++) {
      const colKey = `col${i}`
      const value = parseInt(npdRow[colKey])
      if (!isNaN(value)) {
        map.set(i, value)
      }
    }
    return map
  })

  const actualColumnCount = computed(() => {
    if (!dimensionData.value || dimensionData.value.length === 0) {
      return 0
    }
    const npdRow = dimensionData.value.find(row => row.name === 'NPD')
    if (!npdRow) return 0

    let count = 0
    for (let i = 1; i <= columnCount.value; i++) {
      const colKey = `col${i}`
      const value = npdRow[colKey]
      if (value !== undefined && value !== null && !isNaN(parseInt(value))) {
        count++
      }
    }
    return count
  })

  const filteredNpdRanges = computed(() => {
    if (selectedMin.value === null || selectedMax.value === null) {
      return []
    }
    const npdValues = allNpdValues.value.filter(
      value => value >= selectedMin.value && value <= selectedMax.value
    )
    return npdValues.map(value => ({
      id: `npd-${value}`,
      minSize: value,
      maxSize: value,
      name: `通径 ${value} mm`
    }))
  })

  const setDimensionData = (data, updateSelection = true) => {
    dimensionData.value = data
    if (updateSelection && dimensionData.value.length > 0) {
      selectedMin.value = minNpdValue.value
      selectedMax.value = maxNpdValue.value
    }
  }

  const clearDimensionData = () => {
    dimensionData.value = []
    selectedMin.value = null
    selectedMax.value = null
  }

  const fetchDimensionData = async (endStandard, schedule, preferredRuleId = null) => {
    if (!endStandard || !schedule) {
      clearDimensionData()
      return
    }

    const cacheKey = `${endStandard}__${schedule}`
    dimensionLoading.value = true
    try {
      const params = {
        endStandard: endStandard,
        Schedule: schedule
      }
      if (preferredRuleId) {
        params.preferredRuleId = preferredRuleId
      }
      const res = await axios.get('/api/PmcSpec/NPDInfo', { params })
      if (res.data.code === 200) {
        const apiData = res.data.data
        const transformedData = []

        if (apiData.npd && apiData.npd.length > 0) {
          const npdRow = { name: 'NPD' }
          apiData.npd.forEach((value, index) => {
            npdRow[`col${index + 1}`] = value
          })
          transformedData.push(npdRow)
        }

        if (apiData.outsideDiameter && apiData.outsideDiameter.length > 0) {
          const odRow = { name: 'OD' }
          apiData.outsideDiameter.forEach((value, index) => {
            odRow[`col${index + 1}`] = value
          })
          transformedData.push(odRow)
        }

        if (apiData.wallThickness && apiData.wallThickness.length > 0) {
          const thicknessRow = { name: 'Thickness' }
          apiData.wallThickness.forEach((value, index) => {
            thicknessRow[`col${index + 1}`] = value
          })
          transformedData.push(thicknessRow)
        }

        setDimensionData(transformedData, true)
        if (!preferredRuleId) {
          baseDimensionCache.value[cacheKey] = transformedData
        }
      } else {
        ElMessage.error(res.data.message || '获取管材规格数据失败')
        clearDimensionData()
      }
    } catch (error) {
      console.error('获取管材规格数据错误:', error)
      ElMessage.error('网络错误，获取管材规格数据失败')
      clearDimensionData()
    } finally {
      dimensionLoading.value = false
    }
  }

  const getCellStyle = (row, column) => {
    const baseStyle = {
      cursor: row.name === 'NPD' ? 'pointer' : 'default',
      display: 'block',
      width: '100%',
      height: '100%',
      padding: '8px 0',
      textAlign: 'center'
    }

    const currentColumnIndex = parseInt(column.property.replace('col', ''))
    const isBeyondActualData = currentColumnIndex > actualColumnCount.value
    if (isBeyondActualData) {
      return { ...baseStyle, backgroundColor: '#f5f5f5', cursor: 'not-allowed' }
    }

    if (row.name !== 'NPD') {
      return baseStyle
    }

    const value = parseInt(row[column.property])
    if (isNaN(value)) {
      return { ...baseStyle, backgroundColor: '#FFFFE0' }
    }

    let isInRange = false
    let isFirst = false
    let isLast = false

    if (selectedMin.value !== null && selectedMax.value !== null) {
      isInRange = value >= selectedMin.value && value <= selectedMax.value
    } else if (selectedMin.value !== null) {
      isInRange = value === selectedMin.value
    }

    if (isInRange) {
      const currentColumnIndex = parseInt(column.property.replace('col', ''))
      const rangeColumns = []
      columnNpdMap.value.forEach((npdValue, colIndex) => {
        if (selectedMin.value !== null && selectedMax.value !== null) {
          if (npdValue >= selectedMin.value && npdValue <= selectedMax.value) {
            rangeColumns.push({ colIndex, npdValue })
          }
        } else if (selectedMin.value !== null) {
          if (npdValue === selectedMin.value) {
            rangeColumns.push({ colIndex, npdValue })
          }
        }
      })
      rangeColumns.sort((a, b) => a.colIndex - b.colIndex)
      if (rangeColumns.length > 0) {
        const firstCol = rangeColumns[0]
        const lastCol = rangeColumns[rangeColumns.length - 1]
        if (currentColumnIndex === firstCol.colIndex) {
          isFirst = true
        }
        if (currentColumnIndex === lastCol.colIndex) {
          isLast = true
        }
      }
    }

    const backgroundColor = isInRange ? '#90EE90' : '#FFFFE0'
    let borderRadius = '0'
    let marginRight = '0'
    let marginLeft = '0'

    if (isInRange) {
      marginRight = '-1px'
      if (isFirst) {
        borderRadius = '4px 0 0 4px'
        marginLeft = '0'
      }
      if (isLast && !isFirst) {
        borderRadius = '0 4px 4px 0'
        marginRight = '0'
      }
      if (isFirst && isLast) {
        borderRadius = '4px'
        marginRight = '0'
        marginLeft = '0'
      }
    }

    return {
      ...baseStyle,
      backgroundColor,
      borderRadius,
      marginRight,
      marginLeft
    }
  }

  const handleCellClick = (row, column) => {
    if (row.name !== 'NPD') return
    const currentColumnIndex = parseInt(column.property.replace('col', ''))
    if (currentColumnIndex > actualColumnCount.value) {
      return
    }
    const cellValue = row[column.property]
    if (cellValue === undefined || cellValue === null || isNaN(parseInt(cellValue))) return
    const value = parseInt(cellValue)
    if (isNaN(value)) return

    if (selectedMin.value === null) {
      selectedMin.value = value
      selectedMax.value = null
    } else if (selectedMax.value === null) {
      if (value < selectedMin.value) {
        selectedMax.value = selectedMin.value
        selectedMin.value = value
      } else {
        selectedMax.value = value
      }
    } else {
      selectedMin.value = value
      selectedMax.value = null
    }
  }

  return {
    dimensionData,
    dimensionLoading,
    baseDimensionCache,
    allNpdValues,
    minNpdValue,
    maxNpdValue,
    columnCount,
    columnNpdMap,
    actualColumnCount,
    selectedMin,
    selectedMax,
    filteredNpdRanges,
    fetchDimensionData,
    setDimensionData,
    clearDimensionData,
    getCellStyle,
    handleCellClick
  }
}
