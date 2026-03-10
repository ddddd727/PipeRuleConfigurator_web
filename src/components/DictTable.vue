<script setup>
import { ref, watch, onMounted, computed, reactive } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirtyData } from '@/hooks/useDirtyData'

// 缓存管理函数
const getCache = (key) => {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    const parsed = JSON.parse(item)
    if (parsed.expiry && Date.now() > parsed.expiry) {
      localStorage.removeItem(key)
      return null
    }
    return parsed.data
  } catch (error) {
    console.error('获取缓存失败:', error)
    return null
  }
}

const setCache = (key, data, expiryMs = 7 * 24 * 60 * 60 * 1000) => {
  try {
    const item = {
      data,
      expiry: Date.now() + expiryMs
    }
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error('设置缓存失败:', error)
  }
}

// 组件类型数据缓存键
const COMPONENT_TYPE_CACHE_KEY = 'component_type_data'

// 获取组件类型数据
const getComponentTypeData = async () => {
  // 尝试从缓存获取
  const cachedData = getCache(COMPONENT_TYPE_CACHE_KEY)
  if (cachedData) {
    return cachedData
  }
  
  // 缓存不存在或过期，调用接口
  try {
    const res = await axios.get('/api/DictPiping/componentType')
    const data = res.data
    // 保存到缓存
    setCache(COMPONENT_TYPE_CACHE_KEY, data)
    return data
  } catch (error) {
    console.error('获取组件类型数据失败:', error)
    ElMessage.error('获取组件类型数据失败')
    return []
  }
}

// 根据 part-{type} 获取对应的组件类型信息
const getComponentTypeByDictId = (dictId, componentTypeList) => {
  if (!dictId || !dictId.startsWith('part-')) return null
  
  const type = dictId.replace('part-', '')
  return componentTypeList.find(item => item.ComponentTypeName.toLowerCase() === type.toLowerCase())
}

const props = defineProps({
  dictId: { type: String, required: true }
})

// 表格重新渲染的key
const tableKey = ref(0)
// 脏数据检测hook
const { initSnapshot, isModified } = useDirtyData()

// --- 核心状态 ---
const tableConfig = ref({ title: '', columns: [], list: [] })
const loading = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')
const selectedRows = ref([])
const dataSnapshot = ref(null)
const optionsMap = ref({}) 
const loadingOptions = ref(false)
const componentTypeList = ref([]) // 存储组件类型数据
const mappedColumns = ref([]) // 存储原始列配置，用于判断哪些列是JsonData中的列

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const addColVisible = ref(false)
const addColForm = reactive({
  title: '',
  uiType: 'Input',
  options: [], // 选项数组
  isRequired: false
})
const addingCol = ref(false)

// --- 辅助函数 ---
const mapUiType = (backendUiType) => {
  if (!backendUiType) return 'string'
  const type = String(backendUiType).toLowerCase()
  switch (type) {
    case 'switch': return 'switch'
    case 'select': return 'select'
    case 'jsoninput': 
    case 'json': return 'json'
    default: return 'string'
  }
}

const toCamelCase = (str) => {
  if (!str) return str
  return str.charAt(0).toLowerCase() + str.slice(1)
}

const findKey = (obj, targetKey) => {
  if (!obj || !targetKey) return null
  if (Object.prototype.hasOwnProperty.call(obj, targetKey)) return targetKey
  const lowerTarget = targetKey.toLowerCase()
  return Object.keys(obj).find(k => k.toLowerCase() === lowerTarget) || null
}

// --- 1. 下拉框过滤逻辑 ---
const shouldFilterOptions = (col) => {
  const ds = col.dataSource || col.DataSource
  if (!ds) return false
  const mapping = ds.valueMapping || ds.ValueMapping
  return mapping && Object.values(mapping).some(v => /_?cl$/i.test(v))
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

// --- 2. 核心优化：按 URL 合并请求 ---
// url: 请求地址
// columns: 使用该 URL 的所有列配置数组
const fetchSharedOptions = async (url, columns) => {
  try {
    // 1. 统一处理 URL
    let requestUrl = url
    if (!requestUrl.startsWith('http') && !requestUrl.startsWith('/api')) {
        requestUrl = `/api/${requestUrl.startsWith('/') ? requestUrl.slice(1) : requestUrl}`
    }

    // 2. 发起一次请求
    console.log(`📡 发起合并请求: ${requestUrl} (服务于 ${columns.length} 个列)`)
    const res = await axios.get(requestUrl)
    const rawData = res.data
    // 确保 list 是数组格式
    let list = []
    if (Array.isArray(rawData)) {
      list = rawData
    } else if (rawData && typeof rawData === 'object' && rawData.data) {
      list = Array.isArray(rawData.data) ? rawData.data : []
    } else if (rawData && typeof rawData === 'object' && rawData.rows) {
      list = Array.isArray(rawData.rows) ? rawData.rows : []
    }

    // 空数据处理
    if (!list || list.length === 0) {
      columns.forEach(col => optionsMap.value[col.prop] = [])
      return
    }

    // 简单数组处理
    if (typeof list[0] !== 'object' || list[0] === null) {
      columns.forEach(col => {
        // 确保 list 是数组再调用 map
        if (Array.isArray(list)) {
          optionsMap.value[col.prop] = list.map(v => ({ label: String(v), value: v, __raw: v }))
        } else {
          optionsMap.value[col.prop] = []
        }
      })
      return
    }

    // 3. 数据分发 (Distribute)
    // 拿着同一份 list，为不同的列生成不同的 options
    const firstItem = list[0]
    const objKeys = Object.keys(firstItem)

    columns.forEach(col => {
      const ds = col.dataSource || col.DataSource
      
      // 针对当前列，计算 Label 和 Value 字段
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

      // 映射数据
      // 确保 list 是数组再调用 map
      let safeOptions = []
      if (Array.isArray(list)) {
        safeOptions = list.map(item => {
          const val = valueKey ? item[valueKey] : item
          const lbl = labelKey ? item[labelKey] : (val !== undefined ? String(val) : '未命名')
          return {
            label: lbl !== undefined && lbl !== null ? String(lbl) : '',
            value: val,
            __raw: item // 保留原始数据用于联动
          }
        }).filter(opt => opt.value !== undefined && opt.value !== null)
      }

      optionsMap.value[col.prop] = safeOptions
      console.log(`   ✅ 列 [${col.label}] 数据已装载`)
    })

  } catch (error) {
    console.error(`❌ 请求失败 [${url}]:`, error)
    columns.forEach(col => optionsMap.value[col.prop] = [])
  }
}

// --- 3. 联动处理 ---
const handleSelectChange = (val, row, col) => {
  const ds = col.dataSource || col.DataSource
  
  const options = optionsMap.value[col.prop] || []
  const selectedOption = options.find(opt => opt.value === val)
  
  if (!selectedOption || !selectedOption.__raw) return

  const rawData = selectedOption.__raw

  // 自动更新对应的 Long 字段为 code 值
  const codeProp = col.prop
  const longProp = codeProp.replace(/Code$/, 'Long')
  const targetProp = findKey(row, longProp)
  
  if (targetProp) {
    // Long 字段也设置为 code 值
    row[targetProp] = val
  }

  // 处理 valueMapping 联动
  const mapping = ds?.valueMapping || ds?.ValueMapping
  if (!mapping || Object.keys(mapping).length === 0) return

  Object.entries(mapping).forEach(([sourceField, targetDbField]) => {
    const rawKey = findKey(rawData, sourceField)
    if (!rawKey) return

    const sourceValue = rawData[rawKey]
    const targetProp = findKey(row, targetDbField)
    
    if (targetProp) {
      if (row[targetProp] !== sourceValue) {
        row[targetProp] = sourceValue
      }
    }
  })
}

// 从后端获取表格数据，包括列配置和数据列表
const fetchData = async () => {
  const dictType = props.dictId 
  if (!dictType) return
  
  loading.value = true
  optionsMap.value = {} 

  try {
    // 加载组件类型数据
    if (dictType.startsWith('part-')) {
      const data = await getComponentTypeData()
      componentTypeList.value = data
    }

    // 为所有 part- 开头的 dictId 设置特殊的请求路径
    let apiPath = `/api/Dict/${dictType}`
    if (dictType.startsWith('part-')) {
      apiPath = `/api/Dictpiping/${dictType}`
    }
    const res = await axios.get(`${apiPath}?_t=${Date.now()}`)
    const backendData = res.data.data || res.data
    
    if (backendData.rows || backendData.columns) {
      const rawRows = backendData.rows || [] 
      
      let useCamelCase = false
      if (rawRows.length > 0) {
        const firstRowKeys = Object.keys(rawRows[0])
        if (firstRowKeys.includes('id') || firstRowKeys.some(k => /^[a-z]/.test(k))) {
          useCamelCase = true
        }
        const idKey = firstRowKeys.find(k => k.toLowerCase() === 'id')
        if (idKey) {
            rawRows.sort((a, b) => Number(a[idKey]) - Number(b[idKey]))
        }
      
      }

      // 1. 原有的列映射逻辑 (保持不变)
      mappedColumns.value = (backendData.columns || []).map(col => {
        let finalProp = col.prop || col.DbField
        if (useCamelCase && finalProp) finalProp = toCamelCase(finalProp)

        let smartWidth = col.width
        if (!smartWidth && finalProp && finalProp.toLowerCase() === 'id') {
           smartWidth = 80
        }

        if (col.options && Array.isArray(col.options) && col.options.length > 0) {
           optionsMap.value[finalProp] = col.options.map(opt => ({ label: opt, value: opt }))
        }

        return {
          ...col,
          prop: finalProp,
          label: col.Title || col.DisplayName || col.label || '未命名',
          type: mapUiType(col.uiType || col.UiType), 
          show: col.show !== undefined ? col.show : (col.IsHidden === true ? false : true),
          isReadOnly: col.isReadOnly !== undefined ? col.isReadOnly : col.IsReadOnly,
          required: col.required !== undefined ? col.required : (col.IsRequired || false),
          dataSource: col.dataSource || col.DataSource,
          width: smartWidth,
          staticOptions: col.options || col.Options 
        }
      })

      // 2. 解析JsonData字段，添加动态列
      const jsonDataColumns = []
      const jsonDataProps = new Set()
      
      rawRows.forEach(row => {
        if (row.JsonData) {
          try {
            const jsonData = JSON.parse(row.JsonData)
            if (Array.isArray(jsonData)) {
              jsonData.forEach(item => {
                const prop = item.prop || item.DbField
                if (prop && !jsonDataProps.has(prop)) {
                  jsonDataProps.add(prop)
                  jsonDataColumns.push({
                    prop: prop,
                    label: item.label || item.Title || '未命名',
                    type: mapUiType(item.uiType || item.UiType),
                    show: item.show !== undefined ? item.show : true,
                    isReadOnly: item.isReadOnly !== undefined ? item.isReadOnly : (item.IsReadOnly || false),
                    required: item.required !== undefined ? item.required : (item.IsRequired || false), // 使用JsonData中的required值
                    staticOptions: item.options || (item.opions ? item.opions.split(';') : [])
                  })
                  // 为select类型添加选项
                  if ((item.uiType === 'Select' || item.uiType === 'select' || item.UiType === 'select') && (item.options || item.opions)) {
                    const options = Array.isArray(item.options) ? item.options : item.opions.split(';')
                    optionsMap.value[prop] = options.map(opt => ({ label: opt, value: opt }))
                  }
                }
              })
            }
          } catch (error) {
            console.error('解析JsonData失败:', error)
          }
        }
      })

      // 合并原有列和JsonData解析出的列
      const allColumns = [...mappedColumns.value, ...jsonDataColumns]

      // 🌟🌟🌟 新增的核心逻辑：印刷空模板 & 盖章合并 🌟🌟🌟
      const baseRowTemplate = allColumns.reduce((acc, col) => {
        acc[col.prop] = null // 让所有列（包括未来的新增列）都默认有一个 null 坑位
        return acc
      }, {})

      const formattedRows = rawRows.map(row => {
        const newRow = {
          ...baseRowTemplate,  // 底层铺上全是 null 的空模板
          ...row               // 表层盖上后端返回的真实数据
        }
        
        // 解析JsonData并填充到对应列
        if (row.JsonData) {
          try {
            const jsonData = JSON.parse(row.JsonData)
            if (Array.isArray(jsonData)) {
              jsonData.forEach(item => {
                const prop = item.prop || item.DbField
                if (prop) {
                  // 直接使用value字段作为初始值
                  newRow[prop] = item.value || item.DbField
                }
              })
            }
          } catch (error) {
            console.error('解析JsonData失败:', error)
          }
        }
        
        return newRow
      })
      // 🌟🌟🌟 新增结束 🌟🌟🌟

      // 2. 赋值给表格配置（注意 list 用的是 formattedRows）
      tableConfig.value = {
        title: backendData.DisplayName || backendData.displayName || dictType, 
        columns: allColumns,
        list: formattedRows
      }

      // 重置分页状态
      currentPage.value = 1
      total.value = formattedRows.length

      tableKey.value++
      
      dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
      initSnapshot(tableConfig.value.list) 
      isEdit.value = false
      searchKeyword.value = ''
      selectedRows.value = []
    } else {
      ElMessage.warning('未获取到有效数据')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

watch(() => props.dictId, fetchData)
onMounted(fetchData)

// 切换编辑模式，进入编辑时加载下拉框选项数据
const toggleEdit = async () => {
  if (isEdit.value) {
    handleCancel()
  } else {
    // 筛选出所有需要加载数据的下拉框列（只处理有dataSource的列）
    const selectColumns = tableConfig.value.columns.filter(col => col.type === 'select' && !col.isReadOnly && (col.dataSource || col.DataSource))
    
    if (selectColumns.length > 0) {
      loadingOptions.value = true 
      
      // ✅ 分组逻辑：按 URL 归类
      const urlGroups = {}
      selectColumns.forEach(col => {
        const ds = col.dataSource || col.DataSource
        if (ds && ds.url) {
          const url = ds.url
          if (!urlGroups[url]) {
            urlGroups[url] = []
          }
          // 如果尚未加载过数据，加入待加载队列
          if (!optionsMap.value[col.prop] || optionsMap.value[col.prop].length === 0) {
             urlGroups[url].push(col)
          }
        }
      })

      try {
        // ✅ 并行发起合并后的请求
        const promises = Object.keys(urlGroups).map(url => {
           const cols = urlGroups[url]
           if (cols.length > 0) {
             return fetchSharedOptions(url, cols)
           }
           return Promise.resolve()
        })
        
        await Promise.all(promises)

        // ✅ 修正 Select 列的数据：确保 prop 字段和 long 字段的值都是正确的 code 值
        selectColumns.forEach(col => {
          const options = optionsMap.value[col.prop] || []
          const ds = col.dataSource || col.DataSource
          // 只有当ds存在时才获取labelField
          const labelField = ds ? (ds.labelField || ds.LabelField) : undefined
          
          tableConfig.value.list.forEach(row => {
            const currentValue = row[col.prop]
            if (currentValue === undefined || currentValue === null || currentValue === '') return
            
            // 先尝试在 value 中查找
            let matchedOption = options.find(opt => opt.value === currentValue)
            
            if (!matchedOption) {
              // 如果当前值不在 value 中，尝试在 label 中查找
              matchedOption = options.find(opt => opt.label === currentValue)
              if (matchedOption) {
                // 修正为正确的 value (code)
                row[col.prop] = matchedOption.value
              }
            }
            
            // 无论是否修正，都要同步 long 字段为 code 值
            if (matchedOption) {
              const codeProp = col.prop
              const longProp = codeProp.replace(/Code$/, 'Long')
              const targetProp = findKey(row, longProp)
              if (targetProp) {
                row[targetProp] = matchedOption.value
              }
            }
          })
        })

      } finally {
        loadingOptions.value = false
      }
    }

    dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
    initSnapshot(tableConfig.value.list || [])
    isEdit.value = true
  }
}

// 取消编辑操作，恢复数据并重新获取后端最新数据
const handleCancel = async () => {
  if (dataSnapshot.value) {
    // 保存当前页码，以便恢复后保持原位
    const currentPageNum = currentPage.value
    
    // 重新调用后端查询列表接口获取最新数据
    await fetchData()
    
    // 恢复到之前的页码
    currentPage.value = currentPageNum
  }
  isEdit.value = false
  selectedRows.value = [] 
  ElMessage.info('已取消更改')
}

const handleSelectionChange = (val) => { selectedRows.value = val }

// 添加新行，自动分配ID并填充默认值
const handleAddRow = async () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  
  // 1. 核心标记：打上 _isNew 标记，告诉保存接口这是新数据
  const newRow = { _isNew: true }
  
  // 2. 🟢 核心算法：寻找当前 ID 序列中的“最小空缺值”
  let nextId = 1 // 默认从 1 开始试探
  const pkCol = tableConfig.value.columns.find(col => col.isPrimaryKey)
  
  if (pkCol) {
    // 提取当前表格里的所有合法正整数 ID，并放入 Set 中（查询速度 O(1)）
    const existingIds = tableConfig.value.list
      .map(r => Number(r[pkCol.prop])) 
      .filter(n => !isNaN(n) && n > 0) 
      
    const idSet = new Set(existingIds)
    
    // 从 1 开始往上数，只要集合里有这个数字，就看下一个，直到找到第一个没有的！
    while (idSet.has(nextId)) {
      nextId++
    }
  }

  // 3. 确保组件类型数据已加载
  if (props.dictId.startsWith('part-')) {
    // 检查缓存数据是否存在且包含当前类型
    let componentType = getComponentTypeByDictId(props.dictId, componentTypeList.value)
    
    // 如果找不到，重新获取数据
    if (!componentType) {
      const data = await getComponentTypeData()
      componentTypeList.value = data
      componentType = getComponentTypeByDictId(props.dictId, data)
    }
  }

  // 4. 遍历列配置，填充这个算出来的"完美填缝 ID"和其他空坑位
  let componentType = null
  if (props.dictId.startsWith('part-')) {
    componentType = getComponentTypeByDictId(props.dictId, componentTypeList.value)
    if (componentType) {
      newRow.componentTypeId = componentType.id
    }
  }
  
  tableConfig.value.columns.forEach(col => {
    if (col.isPrimaryKey) {
        newRow[col.prop] = nextId // 👈 填入填缝 ID
    } else if (col.type === 'switch') {
        newRow[col.prop] = false 
    } else if (props.dictId.startsWith('part-')) {
        // 填充默认值
        if (componentType) {
            if (col.prop === 'type' || col.prop === 'componentTypeName') {
                newRow[col.prop] = componentType.ComponentTypeName
            } else if (col.prop === 'description' || col.prop === 'componentTypeDescription') {
                newRow[col.prop] = componentType.ComponentTypeDescription
            } else {
                newRow[col.prop] = null 
            }
        } else {
            newRow[col.prop] = null 
        }
    } else {
        newRow[col.prop] = null 
    }
  })
  
  // 5. 插入到表格中
  tableConfig.value.list.push(newRow)
  
  // 6. 滚动到底部
  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    if(tableBody) tableBody.scrollTop = tableBody.scrollHeight
  }, 100)
}

// 批量删除选中的行，支持后端删除和前端移除新增行
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  ElMessageBox.confirm('确定要删除选中的行吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        // 1. 获取需要从后端删除的 ID (排除新增行)
        const ids = selectedRows.value
          .filter(r => !r._isNew)
          // 🟢 [修复点]：同步增加对 r.ID 的支持，兼容多种大小写格式
          .map(r => r.id || r.Id || r.ID)
          // 🛡️ [安全防护]：过滤掉 undefined 或 null 的 ID，防止请求报错
          .filter(id => id !== undefined && id !== null && id !== '')

        // 2. 发送删除请求
        // (如果选中的全是新增行，ids 为空，则跳过 API 请求，直接在前端移除)
        if (ids.length > 0) {
          if (props.dictId.startsWith('part-')) {
            // 管子连接和法兰：使用 POST 请求，传入 ID 列表
            await axios.post(`/api/Dictpiping/${props.dictId}/batch-delete`, ids)
          } else {
            // 其他菜单：保持原有的逐个 DELETE 请求
            for (const id of ids) {
              await axios.delete(`/api/Dict/${props.dictId}/${id}`)
            }
          }
        }
        
        // 3. 更新前端视图 (移除所有选中的行，包括新增行)
        tableConfig.value.list = tableConfig.value.list.filter(row => !selectedRows.value.includes(row))
        selectedRows.value = []
        ElMessage.success('删除成功')
      } catch (e) {
        console.error(e)
        ElMessage.error(e.response?.data?.message || '删除失败')
      }
    }).catch(() => {
      // 取消删除
    })
}

// 保存表格数据，包含必填校验、唯一性校验和脏数据检测
const handleSave = async () => {
  const currentList = tableConfig.value.list || []
  const columns = tableConfig.value.columns || []

  // ==========================
  // 1. 必填项空值校验 (新增逻辑)
  // ==========================
  for (let i = 0; i < currentList.length; i++) {
    const row = currentList[i]
    for (const col of columns) {
      // 只有 "必填" 且 "非只读" 的列才校验
      if (col.required && !col.isReadOnly) {
         const val = row[col.prop]
         
         // 严谨判断：null、undefined 或 纯空格
         const isEmpty = val === null || val === undefined || (typeof val === 'string' && val.trim() === '')
         
         if (isEmpty) {
            ElMessage.warning(`无法保存：第 ${i + 1} 行的 [${col.label}] 为必填项，不能为空。`)
            return // ⛔ 校验不通过，直接终止，不发送请求
         }
      }
    }
  }

  // ==========================
  // 2. CL 字段唯一性校验 (保留)
  // ==========================
  const clColumn = columns.find(col => /_?cl$/i.test(col.prop))
  if (clColumn) {
    const clValues = currentList.map(row => row[clColumn.prop])
    // 过滤掉无效值，只校验填写了的内容
    const validValues = clValues.filter(v => v !== null && v !== undefined && v !== '')
    
    const uniqueValues = new Set(validValues)
    if (uniqueValues.size !== validValues.length) {
      const duplicates = validValues.filter((item, index) => validValues.indexOf(item) !== index)
      ElMessage.error(`保存失败：检测到重复的 CL 值 (${Array.from(new Set(duplicates)).join(', ')})，请确保数据唯一。`)
      return
    }
  }

  // ==========================
  // 3. 提交数据
  // ==========================
  loading.value = true
  try {
    const promises = []
    let hasChanges = false
    
    // 检查是否有新增的列
    const hasNewColumns = tableConfig.value.columns.length > mappedColumns.value.length
    
    // 获取所有 Select 列
    const selectColumns = tableConfig.value.columns.filter(col => col.type === 'select' && !col.isReadOnly)
    
    for (const row of currentList) {
      // 提取 _isNew 标记，避免将其传给后端（如果后端不接受额外字段）
      const { _isNew, ...submitData } = row
      
      // ✅ 保存前修正 Select 列的数据：确保 Long 字段的值与 prop 字段的值一致（都是 code 值）
      selectColumns.forEach(col => {
        const codeProp = col.prop
        const longProp = codeProp.replace(/Code$/, 'Long')
        const codeValue = submitData[codeProp]
        
        // Long 字段设置为与 prop 字段相同的值（code 值）
        if (codeValue !== undefined && codeValue !== null && codeValue !== '') {
          submitData[longProp] = codeValue
        }
      })
      
      // ✅ 重新序列化JsonData字段
      const jsonDataFields = []
      tableConfig.value.columns.forEach(col => {
        // 检查是否是从JsonData解析出的列或前端新增的列（通过检查是否在原有列中）
        const isOriginalColumn = mappedColumns.value.some(originalCol => originalCol.prop === col.prop)
        if (!isOriginalColumn) {
          const jsonField = {
            prop: col.prop,
            label: col.label,
            uiType: col.type === 'string' ? 'Input' : col.type === 'switch' ? 'Switch' : col.type === 'select' ? 'Select' : col.type,
            show: col.show,
            isReadOnly: col.isReadOnly,
            required: col.required, // 根据列的required属性来判断是否必填
            value: row[col.prop]
          }
          // 只有Select类型才需要options字段
          if (col.type === 'select') {
            jsonField.options = col.staticOptions && Array.isArray(col.staticOptions) ? col.staticOptions : []
          }
          jsonDataFields.push(jsonField)
          // 从submitData中移除JsonData列对应的属性，只在JsonData中保存
          delete submitData[col.prop]
        }
      })
      
      // 更新JsonData字段
      if (jsonDataFields.length > 0) {
        submitData.JsonData = JSON.stringify(jsonDataFields)
      } else {
        // 如果没有JsonData列，设置为空数组
        submitData.JsonData = '[]'
      }
      
      if (_isNew) {
        // ---> 新增 (POST)
        const apiPath = props.dictId.startsWith('part-') ? `/api/Dictpiping` : `/api/Dict`
        promises.push(axios.post(`${apiPath}/${props.dictId}`, submitData))
        hasChanges = true
      } else if (isModified(row) || hasNewColumns) {
        // ---> 修改 (PUT)，如果有新增的列也视为修改
        // 兼容 ID 的多种写法 (id, Id, ID)
        const id = row.id || row.Id || row.ID
        
        if (id) {
          const apiPath = props.dictId.startsWith('part-') ? `/api/Dictpiping` : `/api/Dict`
          promises.push(axios.put(`${apiPath}/${props.dictId}/${id}`, submitData))
          hasChanges = true
        } else {
          console.error('❌ 无法获取行ID，跳过该行保存:', row)
        }
      }
    }

    if (!hasChanges) {
      ElMessage.info('没有检测到修改')
      isEdit.value = false
      loading.value = false
      return
    }

    // 并行发送所有请求
    await Promise.all(promises)
    
    ElMessage.success('保存成功')
    
    // 保存成功后刷新数据，以确保获取最新的后端状态（如自动生成的ID或默认值）
    await fetchData()
    
  } catch (error) {
    console.error(error)
    const errorMsg = error.response?.data?.message || '保存失败'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}

// 分页事件处理函数
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}

// 获取下拉框显示的label值
const getSelectLabel = (col, value) => {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  
  const options = optionsMap.value[col.prop] || []
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}

const openAddColumnDialog = () => {
  // 重置表单
  addColForm.title = ''
  addColForm.uiType = 'Input'
  addColForm.options = []
  addColForm.isRequired = false
  addColVisible.value = true
}
const submitAddColumn = () => {
  if (!addColForm.title) return ElMessage.warning('请输入列名称')
  if (addColForm.uiType === 'Select') {
    if (addColForm.options.length === 0) return ElMessage.warning('下拉框必须至少有一个选项')
    // 检查每个选项是否有值
    const hasEmptyOption = addColForm.options.some(option => !option.trim())
    if (hasEmptyOption) return ElMessage.warning('下拉框选项不能为空')
    // 检查是否有重复选项
    const trimmedOptions = addColForm.options.map(option => option.trim())
    const uniqueOptions = new Set(trimmedOptions)
    if (uniqueOptions.size !== trimmedOptions.length) {
      return ElMessage.warning('下拉框选项不能重复')
    }
  }

  // 生成唯一的prop名称
  const prop = `custom_${Date.now()}`
  
  // 前端直接添加列配置
  const newColumn = {
    prop: prop,
    label: addColForm.title,
    type: mapUiType(addColForm.uiType),
    show: true,
    isReadOnly: false,
    required: addColForm.isRequired,
    staticOptions: addColForm.options
  }
  
  // 添加到表格配置中
  tableConfig.value.columns.push(newColumn)
  
  // 为select类型添加选项
  if (addColForm.uiType === 'Select' && addColForm.options.length > 0) {
    optionsMap.value[prop] = addColForm.options.map(opt => ({ label: opt, value: opt }))
  }
  
  // 更新表格数据，为每一行添加新列的默认值
  tableConfig.value.list.forEach(row => {
    row[prop] = null
  })
  
  ElMessage.success('列添加成功')
  addColVisible.value = false
  
  // 重新生成表格key，强制重新渲染
  tableKey.value++
}
// 计算属性：处理表格数据的搜索过滤和分页显示
const displayData = computed(() => {
  const rawData = tableConfig.value.list || [] 
  const keyword = searchKeyword.value.trim().toLowerCase()
  let filteredData = rawData
  
  // 搜索过滤
  if (keyword) {
    filteredData = rawData.filter(row => 
      Object.values(row).some(val => String(val).toLowerCase().includes(keyword))
    )
  }
  
  // 更新总条数
  total.value = filteredData.length
  
  // 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredData.slice(startIndex, endIndex)
})
</script>

<template>
  <div class="dict-table-container">
    <div class="table-header">
      <div class="title-area">
        <h3>{{ tableConfig.title || '数据列表' }}</h3>
        <el-tag v-if="isEdit" type="warning" effect="dark" class="ml-2">编辑模式</el-tag>
      </div>
      
      <div class="actions">
        <el-input v-model="searchKeyword" placeholder="搜索..." clearable style="width: 200px;" />
        
        <el-button v-if="!isEdit" type="primary" :loading="loadingOptions" @click="toggleEdit">
          {{ loadingOptions ? '加载选项中...' : '编辑' }}
        </el-button>

        <template v-if="isEdit">
          <el-button type="primary" @click="handleAddRow" icon="Plus">新增行</el-button>
          <el-button type="primary" @click="openAddColumnDialog" icon="Plus">新增列</el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            批量删除 ({{ selectedRows.length }})
          </el-button>
          <el-button @click="toggleEdit">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
        </template>
      </div>
    </div>

    <el-table 
      :key="tableKey"
      :data="displayData" 
      border 
      stripe
      style="width: 100%; flex: 1;" 
      v-loading="loading"
      height="100%"
      :row-class-name="({ row }) => row._isNew ? 'new-row-highlight' : ''"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="isEdit" type="selection" width="50" align="center" fixed />
    
      <template v-for="(col, index) in tableConfig.columns" :key="col.prop + index">
        <el-table-column
          v-if="col.show !== false"
          :prop="col.prop"
          :label="col.label"
          
          :width="col.width"                 
          :min-width="col.width ? null : 150" 
          
          show-overflow-tooltip
          :fixed="col.isPrimaryKey ? 'left' : false"
          sortable 
        >
          <template #header>
            <span>
              <span v-if="col.required" style="color: red; margin-right: 4px;">*</span>
              {{ col.label }}
            </span>
          </template>

          <template #default="scope">
            <div v-if="isEdit" 
                 class="dirty-cell-wrapper"
                 :class="{ 'is-modified': isModified(scope.row, col.prop) }"
            >
              <span v-if="col.isPrimaryKey && scope.row._isNew" style="color: #67c23a; font-weight: bold; padding: 0 10px; display: flex; align-items: center;">
                {{ scope.row[col.prop] }}
                <el-tag size="small" type="success" effect="plain" style="margin-left: 6px; padding: 0 4px; height: 18px; line-height: 16px;">新</el-tag>
              </span>

              <template v-else>
                <template v-if="!col.isReadOnly">
                  <el-select 
                    v-if="col.type === 'select'" 
                    v-model="scope.row[col.prop]" 
                    placeholder="请选择" 
                    size="small"
                    filterable
                    @change="(val) => handleSelectChange(val, scope.row, col)"
                  >
                    <el-option
                      v-for="opt in getVisibleOptions(col, scope.row)"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>

                  <el-switch
                    v-else-if="col.type === 'switch'"
                    v-model="scope.row[col.prop]"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                  />
                  
                  <el-input 
                    v-else 
                    v-model="scope.row[col.prop]" 
                    size="small" 
                  />
                </template>
                
                <span v-else style="color: #909399; cursor: not-allowed;">
                   <el-tag v-if="col.type === 'switch'" type="info" size="small" effect="plain">
                      {{ scope.row[col.prop] ? '是' : '否' }}
                   </el-tag>
                   <span v-else>{{ scope.row[col.prop] }}</span>
                </span>
              </template>

              <div v-if="!col.isReadOnly && isModified(scope.row, col.prop)" class="dirty-marker"></div>
            </div>
            
            <span v-else>
              <el-switch
                v-if="col.type === 'switch'"
                v-model="scope.row[col.prop]"
                disabled
                size="small"
                style="--el-switch-off-color: #dcdfe6;"
              />
              <span v-else-if="col.type === 'select'">
                {{ getSelectLabel(col, scope.row[col.prop]) }}
              </span>
              <span v-else>{{ scope.row[col.prop] }}</span>
            </span>
          </template>
        </el-table-column>
      </template>
    </el-table>
    
    <!-- 分页组件 -->
    <div class="pagination-container" style="margin-top: 16px; display: flex; justify-content: flex-end; align-items: center;">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <el-dialog v-model="addColVisible" title="添加自定义列" width="400px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="列名称 (中文标题)">
          <el-input v-model="addColForm.title" placeholder="例如：紧急程度" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="addColForm.uiType" style="width: 100%;">
            <el-option label="文本框 (Input)" value="Input" />
            <el-option label="下拉框 (Select)" value="Select" />
            <el-option label="开关 (Switch)" value="Switch" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="addColForm.uiType === 'Select'" label="选项列表">
          <div v-for="(option, index) in addColForm.options" :key="index" class="option-item" style="width: 100%;display: flex; align-items: center; margin-bottom: 8px;">
            <el-input v-model="addColForm.options[index]" placeholder="请输入选项" style="flex: 3; margin-right: 8px;" />
            <el-button type="danger" @click="addColForm.options.splice(index, 1)" style="flex: 1;">删除</el-button>
          </div>
          <el-button type="primary" @click="addColForm.options.push('')" style="width: 100%; margin-top: 8px;">添加选项</el-button>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addColForm.isRequired">是否必填</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addColVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddColumn" :loading="addingCol">确定添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
.dict-table-container { height: 100%; display: flex; flex-direction: column; background: #fff; padding: 16px; border-radius: 4px; }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; }
.title-area { display: flex; align-items: center; }
.title-area h3 { margin: 0; font-size: 18px; color: #303133; }
.ml-2 { margin-left: 8px; }
.actions { display: flex; align-items: center; gap: 12px; }
.dirty-cell-wrapper { position: relative; width: 100%; }
.dirty-marker { position: absolute; top: 0; right: 0; width: 0; height: 0; border-top: 6px solid #f56c6c; border-left: 6px solid transparent; }
:deep(.new-row-highlight) { background-color: #f0f9eb !important; }
</style>