<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDirtyData } from '@/hooks/useDirtyData'

const props = defineProps({
  dictId: { type: String, required: true }
})

const route = useRoute()
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
    const list = Array.isArray(rawData) ? rawData : (rawData.data || [])

    // 空数据处理
    if (!list || list.length === 0) {
      columns.forEach(col => optionsMap.value[col.prop] = [])
      return
    }

    // 简单数组处理
    if (typeof list[0] !== 'object' || list[0] === null) {
      columns.forEach(col => {
        optionsMap.value[col.prop] = list.map(v => ({ label: String(v), value: v, __raw: v }))
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
      const safeOptions = list.map(item => {
        const val = valueKey ? item[valueKey] : item
        const lbl = labelKey ? item[labelKey] : (val !== undefined ? String(val) : '未命名')
        return {
          label: lbl !== undefined && lbl !== null ? String(lbl) : '',
          value: val,
          __raw: item // 保留原始数据用于联动
        }
      }).filter(opt => opt.value !== undefined && opt.value !== null)

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
  const mapping = ds?.valueMapping || ds?.ValueMapping
  
  if (!mapping || Object.keys(mapping).length === 0) return

  const options = optionsMap.value[col.prop] || []
  const selectedOption = options.find(opt => opt.value === val)
  
  if (!selectedOption || !selectedOption.__raw) return

  const rawData = selectedOption.__raw

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

// --- 4. 获取表格数据 ---
const fetchData = async () => {
  const dictType = props.dictId 
  if (!dictType) return
  
  loading.value = true
  optionsMap.value = {} 

  try {
    const res = await axios.get(`/api/Dict/${dictType}`)
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

      const mappedColumns = (backendData.columns || []).map(col => {
        let finalProp = col.prop || col.DbField
        if (useCamelCase && finalProp) finalProp = toCamelCase(finalProp)

        // 🟢 [新增] 智能宽度逻辑
        // 如果后端没指定宽度，且列名是 id，则默认给 60px
        let smartWidth = col.width
        if (!smartWidth && finalProp && finalProp.toLowerCase() === 'id') {
           smartWidth = 80
        }


        return {
         ...col,
         prop: finalProp,
         label: col.Title || col.DisplayName || col.label || '未命名',
          type: mapUiType(col.uiType || col.UiType), 
          show: col.show !== undefined ? col.show : (col.IsHidden === true ? false : true),
        isReadOnly: col.isReadOnly !== undefined ? col.isReadOnly : col.IsReadOnly,
    
    // 🟢 [修复] 兼容后端可能返回的 IsRequired 字段
        required: col.required !== undefined ? col.required : (col.IsRequired || false),
    
    dataSource: col.dataSource || col.DataSource,
    width: smartWidth 
  }
      })

      tableConfig.value = {
        title: backendData.DisplayName || backendData.displayName || dictType, 
        columns: mappedColumns,
        list: rawRows
      }
      
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

// --- 5. 编辑模式 (含分组请求逻辑) ---
const toggleEdit = async () => {
  if (isEdit.value) {
    handleCancel()
  } else {
    // 筛选出所有需要加载数据的下拉框列
    const selectColumns = tableConfig.value.columns.filter(col => col.type === 'select' && !col.isReadOnly)
    
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

      } finally {
        loadingOptions.value = false
      }
    }

    dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
    isEdit.value = true
  }
}

const handleCancel = () => {
  if (dataSnapshot.value) {
    tableConfig.value = JSON.parse(JSON.stringify(dataSnapshot.value))
    initSnapshot(tableConfig.value.list || [])
  }
  isEdit.value = false
  selectedRows.value = [] 
  ElMessage.info('已取消更改')
}

const handleSelectionChange = (val) => { selectedRows.value = val }

const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  const newRow = { _isNew: true }
  
  // 🟢 新增逻辑：自动计算最大 ID (Max + 1)
  let nextId = 1 // 默认从 1 开始
  // 找到主键列
  const pkCol = tableConfig.value.columns.find(col => col.isPrimaryKey)
  
  if (pkCol) {
    // 提取现有行中的 ID 列表
    const existingIds = tableConfig.value.list
      .map(r => Number(r[pkCol.prop])) // 转为数字
      .filter(n => !isNaN(n))         // 过滤非法值
      
    if (existingIds.length > 0) {
      nextId = Math.max(...existingIds) + 1
    }
  }

  tableConfig.value.columns.forEach(col => {
    if (col.isPrimaryKey) {
        // 🟢 修改：赋值为计算出的 nextId，而不是 0
        newRow[col.prop] = nextId 
    } else if (col.type === 'switch') {
        newRow[col.prop] = false 
    } else {
        newRow[col.prop] = null 
    }
  })
  
  tableConfig.value.list.push(newRow)
  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    if(tableBody) tableBody.scrollTop = tableBody.scrollHeight
  }, 100)
}

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

        // 2. 逐个发送删除请求
        // (如果选中的全是新增行，ids 为空，则跳过 API 请求，直接在前端移除)
        if (ids.length > 0) {
          for (const id of ids) {
            await axios.delete(`/api/Dict/${props.dictId}/${id}`)
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

// --- 6. 保存 (含唯一性校验) ---
// --- 6. 保存 (修复 PUT 请求 ID 为 undefined 的问题) ---
// --- 6. 保存 (含必填校验与唯一性校验) ---
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
    
    for (const row of currentList) {
      // 提取 _isNew 标记，避免将其传给后端（如果后端不接受额外字段）
      const { _isNew, ...submitData } = row
      
      if (_isNew) {
        // ---> 新增 (POST)
        promises.push(axios.post(`/api/Dict/${props.dictId}`, submitData))
        hasChanges = true
      } else if (isModified(row)) {
        // ---> 修改 (PUT)
        // 兼容 ID 的多种写法 (id, Id, ID)
        const id = row.id || row.Id || row.ID
        
        if (id) {
          promises.push(axios.put(`/api/Dict/${props.dictId}/${id}`, submitData))
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

const displayData = computed(() => {
  const rawData = tableConfig.value.list || [] 
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return rawData
  return rawData.filter(row => 
    Object.values(row).some(val => String(val).toLowerCase().includes(keyword))
  )
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
          <el-button type="primary" @click="handleAddRow">新增行</el-button>
          <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            批量删除 ({{ selectedRows.length }})
          </el-button>
          <el-button @click="toggleEdit">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
        </template>
      </div>
    </div>

    <el-table 
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
              <span v-else>{{ scope.row[col.prop] }}</span>
            </span>
          </template>
        </el-table-column>
      </template>
    </el-table>
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