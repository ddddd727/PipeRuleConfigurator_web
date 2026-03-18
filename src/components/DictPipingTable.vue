<script setup>
import { ref, watch, onMounted, reactive } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirtyData } from '@/hooks/useDirtyData'
import { useDictCommon, useDictTableView } from '@/composables/useDictCommon'

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

const componentTypeList = ref([]) // 存储组件类型数据
const mappedColumns = ref([]) // 存储原始列配置，用于判断哪些列是JsonData中的列

const {
  tableConfig, loading, isEdit, searchKeyword, selectedRows,
  dataSnapshot, optionsMap, loadingOptions,
  addColVisible, addColForm, addingCol,
  mapUiType, toCamelCase, findKey, getNextAvailableId,
  getVisibleOptions, fetchSharedOptions
} = useDictCommon()

const { displayData, getColumnFilters, filterHandler } = useDictTableView({
  tableConfig,
  searchKeyword,
  optionsMap
})



// 更新JsonData对象，确保数据变更同步到JsonData
const updateJsonData = (row, prop) => {
  if (!row) return
  
  // 检查是否是自定义列（不在原有列中或以custom_开头）
  const isOriginalColumn = mappedColumns.value.some(originalCol => originalCol.prop === prop)
  const isCustomColumn = !isOriginalColumn || prop.startsWith('custom_')
  
  // 只有自定义列才需要更新到JsonData
  if (!isCustomColumn) return
  
  // 确保JsonData是数组格式
  if (!row.JsonData) {
    row.JsonData = []
  } else if (typeof row.JsonData === 'string') {
    try {
      row.JsonData = JSON.parse(row.JsonData)
    } catch (e) {
      row.JsonData = []
    }
  }
  
  if (Array.isArray(row.JsonData)) {
    // 检查JsonData中是否已存在该列
    const existingIndex = row.JsonData.findIndex(item => item.DbField === prop)
    if (existingIndex >= 0) {
      // 更新现有值
      row.JsonData[existingIndex].value = row[prop]
    } else {
      // 添加新列到JsonData
      row.JsonData.push({
        DbField: prop,
        value: row[prop]
      })
    }
  }
}



// --- 3. 联动处理 ---
const handleSelectChange = (val, row, col) => {
  const ds = col.dataSource || col.DataSource
  
  const options = optionsMap.value[col.prop] || []
  const selectedOption = options.find(opt => String(opt.value) === String(val))
  
  if (!selectedOption || !selectedOption.__raw) return

  const rawData = selectedOption.__raw

  // 自动更新对应的 Long 字段为文字（同时支持 Code 和 _CL 结尾的字段）
  const codeProp = col.prop
  const longProp = codeProp.replace(/Code$|_?CL$/i, 'Long')
  const targetProp = findKey(row, longProp)
  
  // 如果当前选中的 option 有 label，我们就把 label 更新给 Long 字段！
  if (targetProp && selectedOption.label) {
    row[targetProp] = selectedOption.label
  } else if (targetProp) {
    row[targetProp] = val // 兜底：如果没有label，再赋val
  }
  
  // ⛔ 注意：这里已经删除了原来那段错误覆盖 row[targetProp] = val 的代码！

  // 处理 valueMapping 联动
  const mapping = ds?.valueMapping || ds?.ValueMapping
  if (!mapping || Object.keys(mapping).length === 0) return

 Object.entries(mapping).forEach(([targetDbField, sourceField]) => {
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

    // 使用 Dictpiping 接口
    const apiPath = `/api/DictPiping/${dictType}`
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

      
      // 1. 原有的列映射逻辑 (修复大小写敏感问题)
      mappedColumns.value = (backendData.columns || []).map(col => {
        let finalProp = col.prop || col.DbField;
        
        // 🚨 终极修复：为了绝对安全，我们强制去第一行数据里找真正的 key 名字
        if (rawRows.length > 0 && finalProp) {
          const actualKeyInRow = Object.keys(rawRows[0]).find(
            k => k.toLowerCase() === finalProp.toLowerCase()
          );
          if (actualKeyInRow) {
            finalProp = actualKeyInRow; // 强行使用后端数据里的真实大小写名！
          } else if (useCamelCase) {
             finalProp = toCamelCase(finalProp);
          }
        } else if (useCamelCase) {
           finalProp = toCamelCase(finalProp);
        }

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
          uiType: col.uiType || col.UiType || (col.type === 'string' ? 'Input' : col.type === 'switch' ? 'Switch' : col.type === 'select' ? 'Select' : col.type),
          show: col.show !== undefined ? col.show : (col.IsHidden === true ? false : true),
          isReadOnly: col.isReadOnly !== undefined ? col.isReadOnly : col.IsReadOnly,
          required: col.required !== undefined ? (typeof col.required === 'string' ? col.required.toLowerCase() === 'true' : Boolean(col.required)) : (typeof col.IsRequired === 'string' ? col.IsRequired.toLowerCase() === 'true' : Boolean(col.IsRequired || false)),
          isPrimaryKey: col.isPrimaryKey !== undefined ? col.isPrimaryKey : col.IsPrimaryKey,
          dataSource: col.dataSource || col.DataSource,
          width: smartWidth,
          staticOptions: col.options || col.Options 
        }
      })

      // 2. 处理行数据，确保自定义列数据正确显示
      // 创建一个新的数组，确保 tableConfig.columns 和 mappedColumns 指向不同的数组
      const allColumns = [...mappedColumns.value]
      const formattedRows = rawRows.map(row => {
        const newRow = { ...row }
        
        // 解析 JsonData，确保自定义列数据正确显示
        if (row.JsonData) {
          try {
            const jsonData = typeof row.JsonData === 'string' ? JSON.parse(row.JsonData) : row.JsonData
            if (Array.isArray(jsonData)) {
              jsonData.forEach(item => {
                // 只处理 DbField 和 value 两个字段
                if (item.DbField && item.value !== undefined) {
                  // 如果 row 对象中已经有该字段，使用 row 对象中的值
                  // 否则使用 JsonData 中的值
                  if (newRow[item.DbField] === undefined) {
                    newRow[item.DbField] = item.value
                  }
                }
              })
            }
          } catch (e) {
            console.error('解析JsonData失败:', e)
          }
        }
        
        return newRow
      })

      // 3. 赋值给表格配置
      tableConfig.value = {
        title: backendData.DisplayName || backendData.displayName || dictType, 
        columns: allColumns,
        list: formattedRows
      }

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

        // ✅ 修正 Select 列的数据：解决 Number 和 String 类型不匹配导致的 el-select 回显 ID 问题
        selectColumns.forEach(col => {
          const options = optionsMap.value[col.prop] || []
          
          tableConfig.value.list.forEach(row => {
            const currentValue = row[col.prop]
            if (currentValue === undefined || currentValue === null || currentValue === '') return
            
            // 1. 宽松匹配：使用 String() 包裹，忽略数字和字符串的类型差异 (例如让 12 等于 "12")
            let matchedOption = options.find(opt => String(opt.value) === String(currentValue))
            
            if (!matchedOption) {
              // 2. 兜底匹配：如果 ID 没匹配上，尝试看能不能通过中文 Label 匹配
              matchedOption = options.find(opt => opt.label === currentValue)
            }
            
            if (matchedOption) {
              // 3. 核心修复：强制把行数据里的值，重写为下拉选项的标准值（统一数据类型！）
              row[col.prop] = matchedOption.value
              
              // 4. 同时确保 _CL 对应的 Long 字段存的是中文文本
              const codeProp = col.prop
              const longProp = codeProp.replace(/Code$|_?CL$/i, 'Long')
              const targetProp = findKey(row, longProp)
              
              if (targetProp && matchedOption.label) {
                row[targetProp] = matchedOption.label
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
    // 重新调用后端查询列表接口获取最新数据
    await fetchData()
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
  const nextId = getNextAvailableId(tableConfig.value.list, tableConfig.value.columns)

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
          // 使用 DictPiping 接口进行批量删除
          await axios.post(`/api/DictPiping/${props.dictId}/batch-delete`, ids)
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
         let val = row[col.prop]
         console.log(`校验第 ${i + 1} 行 [${col.label}] 值:`, val)
         // 如果值不存在，尝试从 JsonData 中获取
         if (val === undefined || val === null) {
           try {
             const jsonData = typeof row.JsonData === 'string' ? JSON.parse(row.JsonData) : row.JsonData
             if (Array.isArray(jsonData)) {
               const jsonField = jsonData.find(item => item.DbField === col.prop)
               if (jsonField) {
                 val = jsonField.value
               }
             }
           } catch (e) {
             console.error('解析JsonData失败:', e)
           }
         }
         
         // 严谨判断：null、undefined 或 纯空格
         // 对于Switch类型，false是有效值，不应视为空
         let isEmpty = false
         if (col.type === 'switch') {
           // Switch类型只有在值为undefined或null时才视为空
           isEmpty = val === null || val === undefined
         } else {
           // 其他类型：null、undefined 或 纯空格视为空
           isEmpty = val === null || val === undefined || (typeof val === 'string' && val.trim() === '')
         }
         
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
    console.log('调试信息:', {
      'tableConfig.columns.length': tableConfig.value.columns.length,
      'mappedColumns.length': mappedColumns.value.length,
      'hasNewColumns': hasNewColumns,
      'currentList.length': currentList.length
    })
    
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
      
      // ✅ 重新序列化JsonData字段和columns字段
      // 先解析原有的JsonData
      let existingJsonData = []
      if (row.JsonData) {
        try {
          existingJsonData = typeof row.JsonData === 'string' ? JSON.parse(row.JsonData) : row.JsonData
        } catch (e) {
          console.error('解析JsonData失败:', e)
          existingJsonData = []
        }
      }
      
      const jsonDataFields = []
      const columnsFields = []
      
      // 构建新的JsonData和columns字段
      tableConfig.value.columns.forEach(col => {
        // 检查是否是从JsonData解析出的列或前端新增的列（通过检查是否在原有列中）
        const isOriginalColumn = mappedColumns.value.some(originalCol => originalCol.prop === col.prop)
        if (!isOriginalColumn) {
          // 检查是否已经存在于JsonData中
          const existingIndex = existingJsonData.findIndex(item => item.DbField === col.prop)
          if (existingIndex >= 0) {
            // 使用原有值或当前值
            jsonDataFields.push({
              DbField: col.prop,
              value: row[col.prop] !== undefined ? row[col.prop] : existingJsonData[existingIndex].value
            })
          } else {
            // 添加新列
            jsonDataFields.push({
              DbField: col.prop,
              value: row[col.prop]
            })
          }
          
          // 构建columns字段，包含所有列的详细描述
          const columnField = {
            DbField: col.prop,
            Title: col.label,
            UiType: col.type === 'string' ? 'Input' : col.type === 'switch' ? 'Switch' : col.type === 'select' ? 'Select' : col.type,
            IsHidden: !col.show,
            IsRequired: col.required,
            IsReadOnly: col.isReadOnly,
            Show: col.show,
            IsNew: col.IsNew // 包含IsNew标识，方便后端更新
          }
          // 只有Select类型才需要Options字段
          if (col.type === 'select') {
            columnField.Options = col.staticOptions && Array.isArray(col.staticOptions) ? col.staticOptions : []
          }
          columnsFields.push(columnField)
          
          // 从submitData中移除JsonData列对应的属性，只在JsonData和columns中保存
          delete submitData[col.prop]
        }
      })
      
      // 确保所有原有的JsonData字段都被包含
      existingJsonData.forEach(item => {
        const existingIndex = jsonDataFields.findIndex(field => field.DbField === item.DbField)
        if (existingIndex < 0) {
          // 只保留DbField和value两个字段
          jsonDataFields.push({
            DbField: item.DbField,
            value: item.value
          })
        }
      })
      
      // 移除submitData中所有自定义列的属性
      Object.keys(submitData).forEach(key => {
        if (key.startsWith('custom_')) {
          delete submitData[key]
        }
      })
      
      // 更新JsonData字段，使用JSON对象而不是字符串
      submitData.JsonData = jsonDataFields
      
      // 更新columns字段，使用JSON对象而不是字符串
      if (columnsFields.length > 0) {
        submitData.columns = columnsFields
      }
      
      if (_isNew) {
        // ---> 新增 (POST)
        const apiPath = `/api/DictPiping`
        promises.push(axios.post(`${apiPath}/${props.dictId}`, submitData))
        hasChanges = true
      } else if (isModified(row) || hasNewColumns) {
        // ---> 修改 (PUT)，如果有新增的列也视为修改
        // 兼容 ID 的多种写法 (id, Id, ID)
        const id = row.id || row.Id || row.ID
        
        if (id) {
          const apiPath = `/api/DictPiping`
          promises.push(axios.put(`${apiPath}/${props.dictId}/${id}`, submitData))
          hasChanges = true
        } else {
          console.error('❌ 无法获取行ID，跳过该行保存:', row)
        }
      }
    }

    // 检查是否有新增的列，如果有，即使没有修改任何行，也视为有修改
    if (hasNewColumns) {
      hasChanges = true
      // 如果没有行数据，但是有新增的列，我们需要为每一个新增的列创建默认值
      if (currentList.length === 0) {
        // 创建一个新行，包含所有新增列的默认值
        const newRow = {}
        tableConfig.value.columns.forEach(col => {
          const isOriginalColumn = mappedColumns.value.some(originalCol => originalCol.prop === col.prop)
          if (!isOriginalColumn) {
            newRow[col.prop] = col.type === 'switch' ? false : null
          }
        })
        
        // 构建JsonData字段和columns字段
        const jsonDataFields = []
        const columnsFields = []
        tableConfig.value.columns.forEach(col => {
          const isOriginalColumn = mappedColumns.value.some(originalCol => originalCol.prop === col.prop)
          if (!isOriginalColumn) {
            jsonDataFields.push({
              DbField: col.prop,
              value: newRow[col.prop]
            })
            
            const columnField = {
              DbField: col.prop,
              Title: col.label,
              UiType: col.type === 'string' ? 'Input' : col.type === 'switch' ? 'Switch' : col.type === 'select' ? 'Select' : col.type,
              IsHidden: !col.show,
              IsRequired: col.required,
              IsReadOnly: col.isReadOnly,
              Show: col.show,
              IsNew: col.IsNew
            }
            if (col.type === 'select') {
              columnField.Options = col.staticOptions && Array.isArray(col.staticOptions) ? col.staticOptions : []
            }
            columnsFields.push(columnField)
          }
        })
        
        // 更新JsonData和columns字段
        newRow.JsonData = jsonDataFields
        if (columnsFields.length > 0) {
          newRow.columns = columnsFields
        }
        
        // 发送新增请求
        const apiPath = `/api/DictPiping`
        promises.push(axios.post(`${apiPath}/${props.dictId}`, newRow))
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
    
    // 保存成功后移除IsNew标识，因为列已经被保存到后端
    tableConfig.value.columns.forEach(col => {
      if (col.isNew) {
        delete col.isNew
      }
      if (col.IsNew) {
        delete col.IsNew
      }
    })
    
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

// 获取下拉框显示的label值
const getSelectLabel = (col, value, row) => {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  
  // 1. 如果 optionsMap 中已经加载了字典选项（编辑模式）
  const options = optionsMap.value[col.prop] || []
  const option = options.find(opt => String(opt.value) === String(value))
  if (option && option.label) {
    return option.label
  }
  
  // 2. 非编辑状态，去 row 里面找 Long 结尾的字段
  if (row) {
    // 假设 col.prop 是 GeometricIndustryStandard_CL
    // 我们把它变成 geometricIndustryStandardLong (忽略大小写去找)
    let autoLongProp = col.prop.replace(/_?CL$/i, 'Long');
    
    // 安全地找 Key，忽略大小写
    let actualKey = Object.keys(row).find(k => k.toLowerCase() === autoLongProp.toLowerCase());
    
    // 如果找到了，并且值是个字符串（排除奇怪的对象或数组）
    if (actualKey && typeof row[actualKey] === 'string' && row[actualKey].trim() !== '') {
      return row[actualKey];
    }
  }

  // 3. 兜底，实在没辙就显示原值
  return String(value);
}

const openAddColumnDialog = () => {
  // 重置表单
  addColForm.title = ''
  addColForm.uiType = 'Input' // 默认选择Input类型
  addColForm.isRequired = false
  addColVisible.value = true
}
const submitAddColumn = () => {
  if (!addColForm.title) return ElMessage.warning('请输入列名称')
  
  // 生成唯一的prop名称
  const prop = `custom_${Date.now()}`
  
  // 前端直接添加列配置
  const newColumn = {
    prop: prop,
    label: addColForm.title,
    type: addColForm.uiType === 'Switch' ? 'switch' : 'string', // Input类型对应string，Switch类型对应switch
    uiType: addColForm.uiType,
    show: true,
    isReadOnly: false,
    required: Boolean(addColForm.isRequired),
    isPrimaryKey: false,
    staticOptions: [],
    IsNew: true // 标记为新列，方便后端更新，使用首字母大写
  }
  
  // 添加到表格配置中
  tableConfig.value.columns.push(newColumn)
  
  // 更新表格数据，为每一行添加新列的默认值
  tableConfig.value.list.forEach(row => {
    row[prop] = addColForm.uiType === 'Switch' ? false : null // Switch类型默认值为false，Input类型默认值为null
    
    // 新增的列都是自定义列，需要更新到JsonData
    // 更新JsonData对象，添加新列
    if (!row.JsonData) {
      row.JsonData = []
    } else if (typeof row.JsonData === 'string') {
      try {
        row.JsonData = JSON.parse(row.JsonData)
      } catch (e) {
        row.JsonData = []
      }
    }
    
    if (Array.isArray(row.JsonData)) {
      // 检查JsonData中是否已存在该列
      const existingIndex = row.JsonData.findIndex(item => item.DbField === prop)
      if (existingIndex >= 0) {
        // 更新现有值
        row.JsonData[existingIndex].value = row[prop]
      } else {
        // 添加新列到JsonData
        row.JsonData.push({
          DbField: prop,
          value: row[prop]
        })
      }
    }
  })
  
  ElMessage.success('列添加成功')
  addColVisible.value = false
  
  // 重新生成表格key，强制重新渲染
  tableKey.value++
}
// displayData / getColumnFilters / filterHandler 已由 useDictTableView 提供
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
          <el-button v-if="false" type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
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
          :filters="getColumnFilters(col)"
          :filter-method="filterHandler"
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
                    @change="(val) => { handleSelectChange(val, scope.row, col); updateJsonData(scope.row, col.prop); }"
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
                    @change="(val) => updateJsonData(scope.row, col.prop)"
                  />
                  
                  <el-input 
                    v-else 
                    v-model="scope.row[col.prop]" 
                    size="small" 
                    @input="(val) => updateJsonData(scope.row, col.prop)"
                  />
                </template>
                
                <span v-else style="color: #909399; cursor: not-allowed;">
                   <el-tag v-if="col.type === 'switch'" type="info" size="small" effect="plain">
                      {{ scope.row[col.prop] ? '是' : '否' }}
                   </el-tag>
                   <span v-else-if="col.type === 'select'">
                {{ getSelectLabel(col, scope.row[col.prop], scope.row) }}
              </span>
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
                {{ getSelectLabel(col, scope.row[col.prop], scope.row) }}
              </span>
              <span v-else>{{ scope.row[col.prop] }}</span>
            </span>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <el-dialog v-model="addColVisible" title="添加自定义列" width="400px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="列名称 (中文标题)">
          <el-input v-model="addColForm.title" placeholder="例如：紧急程度" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="addColForm.uiType" style="width: 100%;">
            <el-option label="文本框 (Input)" value="Input" />
            <el-option label="开关 (Switch)" value="Switch" />
          </el-select>
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