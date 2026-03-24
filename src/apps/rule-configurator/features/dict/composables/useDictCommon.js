/**
 * src/composables/useDictCommon.js
 * 封装数据字典表格的公共状态和通用逻辑
 */
import { ref, reactive, computed } from 'vue'
import axios from 'axios'

export function useDictTableView({ tableConfig, searchKeyword, optionsMap }) {
  const filterHandler = (value, row, column) => {
    const property = column?.property
    return row?.[property] === value
  }

  const getColumnFilters = (col) => {
    const list = tableConfig.value?.list || []
    const uniqueVals = new Set()

    list.forEach(row => {
      const val = row?.[col.prop]
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        uniqueVals.add(val)
      }
    })

    return Array.from(uniqueVals).map(val => {
      let text = String(val)
      if (col.type === 'switch') {
        text = val ? '是' : '否'
      } else if (col.type === 'select') {
        const opts = optionsMap.value?.[col.prop] || []
        const option = opts.find(opt => String(opt.value) === String(val))
        if (option?.label) text = option.label
      }
      return { text, value: val }
    })
  }

  const filteredData = computed(() => {
    const rawData = tableConfig.value?.list || []
    const keyword = (searchKeyword.value || '').trim().toLowerCase()
    if (!keyword) return rawData
    return rawData.filter(row =>
      Object.values(row || {}).some(val => String(val ?? '').toLowerCase().includes(keyword))
    )
  })

  return {
    displayData: filteredData,
    getColumnFilters,
    filterHandler
  }
}

export function useDictCommon() {
  // ==========================
  // 1. 公共状态定义
  // ==========================
  const tableConfig = ref({ title: '', columns: [], list: [] })
  const loading = ref(false)
  const isEdit = ref(false)
  const searchKeyword = ref('')
  const selectedRows = ref([])
  const dataSnapshot = ref(null)
  const optionsMap = ref({}) 
  const loadingOptions = ref(false)

  // 添加列相关状态
  const addColVisible = ref(false)
  const addColForm = reactive({
    title: '',
    uiType: 'Input',
    options: '', // DictTable 使用 string，DictPipingTable 使用 array，此处共用一个入口再分别处理
    isRequired: false
  })
  const addingCol = ref(false)

  // ==========================
  // 2. 基础辅助函数
  // ==========================
  const mapUiType = (backendUiType) => {
    if (!backendUiType) return 'string'
    const type = String(backendUiType).toLowerCase()
    switch (type) {
      case 'switch':          return 'switch'
      case 'select':          return 'select'
      case 'multiselect':     return 'multiselect'
      case 'treeselect':      return 'treeselect'
      case 'textarea':        return 'textarea'
      case 'number':          return 'number'
      case 'datepicker':      return 'date'
      case 'datetimepicker':  return 'datetime'
      case 'upload':          return 'upload'
      case 'jsoninput': 
      case 'json':            return 'json'
      default:                return 'string'
    }
  }

  const toCamelCase = (str) => {
    if (!str) return str
    return str.charAt(0).toLowerCase() + str.slice(1)
  }

const findKey = (obj, targetKey) => {
  if (!obj || !targetKey) return null
  // 精确匹配
  if (Object.prototype.hasOwnProperty.call(obj, targetKey)) return targetKey
  // 大小写不敏感
  const lower = targetKey.toLowerCase()
  const exact = Object.keys(obj).find(k => k.toLowerCase() === lower)
  if (exact) return exact
  // ✅ 去下划线匹配
  const stripped = lower.replace(/_/g, '')
  return Object.keys(obj).find(k => k.toLowerCase().replace(/_/g, '') === stripped) || null
}

  // 计算填缝 ID (用于新增行时获取最小可用 ID)
  const getNextAvailableId = (list, columns) => {
    let nextId = 1
    const pkCol = columns.find(col => col.isPrimaryKey)
    if (pkCol) {
      const existingIds = list.map(r => Number(r[pkCol.prop])).filter(n => !isNaN(n) && n > 0)
      const idSet = new Set(existingIds)
      while (idSet.has(nextId)) {
        nextId++
      }
    }
    return nextId
  }

  // ==========================
  // 3. 下拉框选项处理
  // ==========================
  const shouldFilterOptions = (col) => {
    const ds = col.dataSource || col.DataSource
    if (!ds) return false
    // 兼容两边的逻辑
    if (ds.filterUsed === false || ds.FilterUsed === false) return false
    const mapping = ds.valueMapping || ds.ValueMapping
    return mapping && Object.keys(mapping).some(k => /_?cl$/i.test(k))
  }

  const getVisibleOptions = (col, currentRow) => {
    const allOptions = optionsMap.value[col.prop] || []
    if (!shouldFilterOptions(col)) return allOptions

    const currentList = tableConfig.value.list || []
    const usedValues = new Set()
    
    currentList.forEach(row => {
      if (row === currentRow) return 
      const val = row[col.prop]
      if (val !== undefined && val !== null && val !== '') {
        usedValues.add(val)
      }
    })

    return allOptions.filter(opt => !usedValues.has(opt.value))
  }

  // 核心优化：按 URL 合并请求 (兼容了 params 和不同的返回格式)
  const fetchSharedOptions = async (url, columns, extraParams = {}) => {
    try {
      let requestUrl = url
      if (!requestUrl.startsWith('http') && !requestUrl.startsWith('/api')) {
          requestUrl = `/api/${requestUrl.startsWith('/') ? requestUrl.slice(1) : requestUrl}`
      }

      console.log(`📡 发起合并请求: ${requestUrl} (服务于 ${columns.length} 个列)`)
      const res = await axios.get(requestUrl, { params: extraParams })
      const rawData = res.data
      
      let list = []
      if (Array.isArray(rawData)) {
        list = rawData
      } else if (rawData && typeof rawData === 'object') {
        list = Array.isArray(rawData.data) ? rawData.data : (Array.isArray(rawData.rows) ? rawData.rows : [])
      }

      if (!list || list.length === 0) {
        columns.forEach(col => optionsMap.value[col.prop] = [])
        return
      }

      if (typeof list[0] !== 'object' || list[0] === null) {
        columns.forEach(col => {
          optionsMap.value[col.prop] = Array.isArray(list) ? list.map(v => ({ label: String(v), value: v, __raw: v })) : []
        })
        return
      }

      const firstItem = list[0]
      const objKeys = Object.keys(firstItem)

      columns.forEach(col => {
        const ds = col.dataSource || col.DataSource
        let labelKey = findKey(firstItem, ds.labelField || ds.LabelField)
        let valueKey = findKey(firstItem, ds.valueField || ds.ValueField)

        if (!labelKey) {
          labelKey = objKeys.find(k => /^(long|name|title|displayname|desc|description)$/i.test(k)) || 
                     objKeys.find(k => k.toLowerCase() === 'short') || 
                     findKey(firstItem, 'label')
        }
        if (!valueKey) {
          valueKey = objKeys.find(k => /^(value|id|key|code)$/i.test(k)) || 
                     findKey(firstItem, 'value')
        }

        let safeOptions = []
        if (Array.isArray(list)) {
          safeOptions = list.map(item => {
            const val = valueKey ? item[valueKey] : item
            const lbl = labelKey ? item[labelKey] : (val !== undefined ? String(val) : '未命名')
            return {
              label: lbl !== undefined && lbl !== null ? String(lbl) : '',
              value: val,
              disabled: false,
              __raw: item
            }
          }).filter(opt => opt.value !== undefined && opt.value !== null)
        }

        optionsMap.value[col.prop] = safeOptions
      })
    } catch (error) {
      console.error(`❌ 请求失败 [${url}]:`, error)
      columns.forEach(col => optionsMap.value[col.prop] = [])
    }
  }

  // 提供重置/取消编辑的公共逻辑
  const resetToSnapshot = (initSnapshot) => {
    if (dataSnapshot.value) {       
      tableConfig.value = JSON.parse(JSON.stringify(dataSnapshot.value))
      if (initSnapshot) initSnapshot(tableConfig.value.list || [])
    }
    isEdit.value = false
    selectedRows.value = []
  }

  return {
    // 状态
    tableConfig, loading, isEdit, searchKeyword, selectedRows,
    dataSnapshot, optionsMap, loadingOptions,
    addColVisible, addColForm, addingCol,
    // 函数
    mapUiType, toCamelCase, findKey, getNextAvailableId,
    shouldFilterOptions, getVisibleOptions, fetchSharedOptions,
    resetToSnapshot
  }
}