<script setup>
import { ref, watch, onMounted, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useDirtyData } from '@/apps/pipe-spec/shared/hooks/useDirtyData'
import { useDictCommon } from '@/apps/pipe-spec/features/dict/composables/useDictCommon'

const props = defineProps({
  dictId: { type: String, required: true }
})

const tableKey = ref(0)
const route = useRoute()
const { initSnapshot, isModified } = useDirtyData()

const tableMeta = ref({})   // ✅ 新增：存放 meta（权限/分页/排序/行操作）

const {
  tableConfig, loading, isEdit, searchKeyword, selectedRows,
  dataSnapshot, optionsMap, loadingOptions,
  addColVisible, addColForm, addingCol,
  mapUiType, toCamelCase, findKey, getNextAvailableId,
  getVisibleOptions, getAddRowBlockedByFilteredSelectMessage, fetchSharedOptions, resetToSnapshot
} = useDictCommon()
toCamelCase
// ...existing code...

// ─────────────────────────────────────────────
// ✅ 原生列头筛选逻辑
// ─────────────────────────────────────────────
// 1. 动态生成每一列的筛选项 (提取该列出现过的所有不重复的值)
const getColumnFilters = (col) => {
  // 如果后端配置了该列不可筛选，可以直接返回 undefined（可选）
  // if (!col.isFilterable) return undefined

  const list = tableConfig.value.list || []
  const uniqueVals = new Set()
  
  list.forEach(row => {
    const val = row[col.prop]
    // 过滤掉空值，不作为筛选项
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      uniqueVals.add(val)
    }
  })

  return Array.from(uniqueVals).map(val => {
    let text = String(val)
    // 针对 switch 类型做文本友好显示
    if (col.type === 'switch') {
      text = val ? '是' : '否'
    }
    // 注意：如果是 select 类型，由于非编辑模式下 optionsMap 可能未加载，默认显示 value。
    // 如果想要显示 label，可以通过 optionsMap 匹配。
    return { text, value: val }
  })
}

// 2. 原生筛选比对方法
const filterHandler = (value, row, column) => {
  const property = column['property']
  return row[property] === value
}
// ✅ VisibleWhen 条件求值
const evaluateCondition = (rule, row) => {
  if (!rule) return true
  const val = row[rule.field ?? rule.Field]
  const target = rule.value ?? rule.Value
  switch ((rule.operator ?? rule.Operator ?? '').toLowerCase()) {
    case 'eq':       return val == target
    case 'neq':      return val != target
    case 'in':       return Array.isArray(target) && target.includes(val)
    case 'notin':    return Array.isArray(target) && !target.includes(val)
    case 'gt':       return val > target
    case 'gte':      return val >= target
    case 'lt':       return val < target
    case 'lte':      return val <= target
    case 'contains': return String(val ?? '').includes(target)
    default:         return true
  }
}
  
// ...existing code...
// 联动：Select 变化时映射其他字段 + 触发 DependsOn
// ─────────────────────────────────────────────
const handleSelectChange = async (val, row, col) => {
  const ds = col.dataSource || col.DataSource
  if (!ds) return

  // ✅ ValueMapping：key=表单字段，value=option字段
  const mapping = ds.valueMapping || ds.ValueMapping
  if (mapping && Object.keys(mapping).length > 0) {
    const options = optionsMap.value[col.prop] || []
    const selected = options.find(opt => opt.value === val)
    if (selected?.__raw) {
      Object.entries(mapping).forEach(([targetDbField, sourceField]) => { 
        const rawKey = findKey(selected.__raw, sourceField)
        if (!rawKey) return
        const targetProp = findKey(row, targetDbField)
        if (targetProp && row[targetProp] !== selected.__raw[rawKey]) {
          row[targetProp] = selected.__raw[rawKey]
        }
      })
    }
  }

  // DependsOn：找出依赖当前列的下级列，清空并重新拉取
  const dependentCols = tableConfig.value.columns.filter(c => {
    const cds = c.dataSource || c.DataSource
    return cds?.dependsOn?.some(d => (d.field || d.Field) === col.prop)
  })
  if (dependentCols.length > 0) {
    for (const depCol of dependentCols) {
      row[depCol.prop] = null
      optionsMap.value[depCol.prop] = []

      const depDs = depCol.dataSource || depCol.DataSource
      if (depDs?.url) {
        const params = (depDs.dependsOn || []).reduce((acc, d) => {
          const fieldKey = d.field || d.Field
          const paramName = d.paramName || d.ParamName
          acc[paramName] = row[fieldKey]
          return acc
        }, {})
        await fetchSharedOptions(depDs.url, [depCol], params)
      }
    }
  }
}

// ─────────────────────────────────────────────
// 获取表格数据
// ─────────────────────────────────────────────
const fetchData = async () => {
  const dictType = props.dictId
  if (!dictType) return

  loading.value = true
  optionsMap.value = {}

  try {
    const res = await axios.get(`/api/Dict/${dictType}?_t=${Date.now()}`)
    const backendData = res.data.data || res.data

    if (!backendData.rows && !backendData.columns) {
      ElMessage.warning('未获取到有效数据')
      return
    }

    // ✅ 1. 读取 meta
    tableMeta.value = backendData.meta || {}

    const rawRows = backendData.rows || []

    // 判断 camelCase
    let useCamelCase = false
    if (rawRows.length > 0) {
      const firstKeys = Object.keys(rawRows[0])
      if (firstKeys.some(k => /^[a-z]/.test(k))) useCamelCase = true
      const idKey = firstKeys.find(k => k.toLowerCase() === 'id')
      if (idKey) rawRows.sort((a, b) => Number(a[idKey]) - Number(b[idKey]))
    }

    // ✅ 2. 列映射（补全所有新字段）
    const mappedColumns = (backendData.columns || []).map(col => {
      let finalProp = col.prop || col.DbField
      if (useCamelCase && finalProp) finalProp = toCamelCase(finalProp)

      const ds = col.dataSource || col.DataSource

      // ✅ 静态 Options：从 dataSource.options 读取（新格式 {Label, Value, Disabled}）
      if (ds?.options?.length > 0) {
        optionsMap.value[finalProp] = ds.options.map(opt => ({
          label: opt.label ?? opt.Label ?? '',
          value: opt.value ?? opt.Value,
          disabled: opt.disabled ?? opt.Disabled ?? false,
          children: opt.children ?? opt.Children,
          __raw: opt
        }))
      }

      let smartWidth = col.width
      if (!smartWidth && finalProp?.toLowerCase() === 'id') smartWidth = 80

      return {
        ...col,
        prop:         finalProp,
        label:        col.label || col.Title || col.DisplayName || '未命名',
        type:         mapUiType(col.uiType || col.UiType),
        show:         col.show !== undefined ? col.show : (col.IsHidden === true ? false : true),
        isReadOnly:   col.isReadOnly  ?? col.IsReadOnly  ?? false,
        isPrimaryKey: col.isPrimaryKey ?? col.IsPrimaryKey ?? false,
        required:     col.required    ?? col.IsRequired   ?? false,
        isUnique:     col.isUnique    ?? col.IsUnique     ?? false,
        // ✅ 新字段
        isSortable:   col.isSortable   ?? col.IsSortable   ?? false,
        isFilterable: col.isFilterable ?? col.IsFilterable ?? false,
        tooltip:      col.tooltip      ?? col.Tooltip      ?? null,
        format:       col.format       ?? col.Format       ?? null,
        defaultValue: col.defaultValue ?? col.DefaultValue ?? null,
        validation:   col.validation   ?? col.Validation   ?? null,
        customRules:  col.customRules  ?? col.CustomRules  ?? [],
        visibleWhen:  col.visibleWhen  ?? col.VisibleWhen  ?? null,
        dataSource:   ds,
        width:        smartWidth,
      }
    })

    // 按 SortOrder 排列列
    mappedColumns.sort((a, b) => {
      const sa = a.sortOrder ?? a.SortOrder ?? Infinity
      const sb = b.sortOrder ?? b.SortOrder ?? Infinity
      return sa - sb
    })

    // 空模板合并
    const baseRowTemplate = mappedColumns.reduce((acc, col) => {
      acc[col.prop] = null
      return acc
    }, {})
    const formattedRows = rawRows.map(row => ({ ...baseRowTemplate, ...row }))

    tableConfig.value = {
      title: backendData.DisplayName || backendData.displayName || dictType,
      columns: mappedColumns,
      list: formattedRows
    }

    tableKey.value++
    dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
    initSnapshot(tableConfig.value.list)
    isEdit.value = false
    searchKeyword.value = ''
    selectedRows.value = []

  } catch (error) {
    console.error(error)
    ElMessage.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

watch(() => props.dictId, fetchData)
onMounted(fetchData)

// ─────────────────────────────────────────────
// 编辑模式（跳过有 DependsOn 的列，等联动时再拉）
// ─────────────────────────────────────────────
const toggleEdit = async () => {
  if (isEdit.value) {
    handleCancel()
    return
  }

  const selectColumns = tableConfig.value.columns.filter(
    col => (col.type === 'select' || col.type === 'multiselect') && !col.isReadOnly
  )

  if (selectColumns.length > 0) {
    loadingOptions.value = true

    // ✅ 跳过有 DependsOn 的列（它们等父级选中后再拉）
    const urlGroups = {}
    selectColumns.forEach(col => {
      const ds = col.dataSource || col.DataSource
      if (!ds?.url) return
      if (ds.dependsOn?.length > 0) return  // 有级联依赖，跳过
      if (optionsMap.value[col.prop]?.length > 0) return  // 已有静态 options，跳过

      if (!urlGroups[ds.url]) urlGroups[ds.url] = []
      urlGroups[ds.url].push(col)
    })

    try {
      await Promise.all(
        Object.entries(urlGroups).map(([url, cols]) =>
          cols.length > 0 ? fetchSharedOptions(url, cols) : Promise.resolve()
        )
      )
    } finally {
      loadingOptions.value = false
    }
  }

  dataSnapshot.value = JSON.parse(JSON.stringify(tableConfig.value))
  isEdit.value = true
}

const handleCancel = () => {
  resetToSnapshot(initSnapshot)
  ElMessage.info('已取消更改')
}

const handleSelectionChange = (val) => { selectedRows.value = val }

// ─────────────────────────────────────────────
// 新增行（使用 defaultValue）
// ─────────────────────────────────────────────
const handleAddRow = () => {
  if (!isEdit.value) return ElMessage.warning('请先进入编辑模式')
  const blockedMsg = getAddRowBlockedByFilteredSelectMessage()
  if (blockedMsg) return ElMessage.warning(blockedMsg)
  const newRow = { _isNew: true }

  const nextId = getNextAvailableId(tableConfig.value.list, tableConfig.value.columns)

  tableConfig.value.columns.forEach(col => {
    if (col.isPrimaryKey) {
      newRow[col.prop] = nextId
    } else if (col.type === 'switch') {
      newRow[col.prop] = col.defaultValue ?? false
    } else {
      newRow[col.prop] = col.defaultValue ?? null
    }
  })

  tableConfig.value.list.push(newRow)

  setTimeout(() => {
    const tableBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    if (tableBody) tableBody.scrollTop = tableBody.scrollHeight
  }, 100)
}

// ─────────────────────────────────────────────
// 删除
// ─────────────────────────────────────────────
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  ElMessageBox.confirm('确定要删除选中的行吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        const ids = selectedRows.value
          .filter(r => !r._isNew)
          .map(r => r.id || r.Id || r.ID)
          .filter(id => id !== undefined && id !== null && id !== '')

        if (ids.length > 0) {
          for (const id of ids) {
            await axios.delete(`/api/Dict/${props.dictId}/${id}`)
          }
        }

        tableConfig.value.list = tableConfig.value.list.filter(row => !selectedRows.value.includes(row))
        selectedRows.value = []
        ElMessage.success('删除成功')
      } catch (e) {
        console.error(e)
        ElMessage.error(e.response?.data?.message || '删除失败')
      }
    }).catch(() => {})
}

// ─────────────────────────────────────────────
// ✅ 校验（内置规则 + CustomRules）
// ─────────────────────────────────────────────
const validateRow = async (row, rowIndex) => {
  const columns = tableConfig.value.columns
  const pkCol = (columns || []).find(c => c.isPrimaryKey)
  const pkVal = pkCol?.prop ? row?.[pkCol.prop] : (row?.id ?? row?.Id ?? row?.ID)
  const idText = (pkVal === undefined || pkVal === null || pkVal === '') ? '—' : pkVal

  for (const col of columns) {
    if (col.isPrimaryKey || col.isReadOnly) continue

    const val = row[col.prop]
    const isEmpty = val === null || val === undefined || (typeof val === 'string' && val.trim() === '')

    // IsRequired
    if (col.required && isEmpty) {
      return fail(`第 ${rowIndex + 1} 行 [${col.label}]（ID: ${idText}）不能为空`)
    }

    if (isEmpty) continue

    const strVal = String(val)

    // ✅ 内置 Validation 规则
    const v = col.validation
    if (v) {
      const msg = v.customMessage
      if (v.minLength && strVal.length < v.minLength)
        return fail(`第 ${rowIndex + 1} 行 [${col.label}]（ID: ${idText}）：${msg ?? `最少 ${v.minLength} 个字符`}`)
      if (v.maxLength && strVal.length > v.maxLength)
        return fail(`第 ${rowIndex + 1} 行 [${col.label}]（ID: ${idText}）：${msg ?? `最多 ${v.maxLength} 个字符`}`)
      if (v.min != null && Number(val) < v.min)
        return fail(`第 ${rowIndex + 1} 行 [${col.label}]（ID: ${idText}）：${msg ?? `不能小于 ${v.min}`}`)
      if (v.max != null && Number(val) > v.max)
        return fail(`第 ${rowIndex + 1} 行 [${col.label}]（ID: ${idText}）：${msg ?? `不能大于 ${v.max}`}`)
      if (v.pattern && !new RegExp(v.pattern).test(strVal))
        return fail(`第 ${rowIndex + 1} 行 [${col.label}]（ID: ${idText}）：${msg ?? '格式不正确'}`)
    }

    // ✅ CustomRules（onSubmit 触发）
    for (const rule of (col.customRules || [])) {
      if (rule.trigger !== 'onSubmit' && rule.trigger !== undefined) continue

      if (rule.type === 'Expression') {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('value', 'row', `return (${rule.expression})`)
          const passed = fn(val, row)
          if (!passed) return fail(`第 ${rowIndex + 1} 行 [${col.label}]（ID: ${idText}）：${rule.message}`)
        } catch (e) {
          console.warn('Expression 执行失败:', e)
        }
      }

      if (rule.type === 'Url') {
        try {
          const res = await axios.post(`/api/Dict/validate/${props.dictId}`, {
            field: col.prop,
            value: val,
            row: { ...row }
          })
          const result = res.data?.data || res.data
          if (!result.valid) return fail(`第 ${rowIndex + 1} 行 [${col.label}]（ID: ${idText}）：${result.message || rule.message}`)
        } catch (e) {
          console.error('远程校验失败:', e)
        }
      }
    }
  }
  return true
}

const fail = (msg) => { ElMessage.warning(msg); return false }

// ─────────────────────────────────────────────
// 保存
// ─────────────────────────────────────────────
const handleSave = async () => {
  const currentList = tableConfig.value.list || []

  // 逐行校验
  for (let i = 0; i < currentList.length; i++) {
    const passed = await validateRow(currentList[i], i)
    if (!passed) return
  }

  loading.value = true
  try {
    const promises = []
    let hasChanges = false

    for (const row of currentList) {
      const { _isNew, ...submitData } = row

      if (_isNew) {
        promises.push(axios.post(`/api/Dict/${props.dictId}`, submitData))
        hasChanges = true
      } else if (isModified(row)) {
        const id = row.id || row.Id || row.ID
        if (id) {
          promises.push(axios.put(`/api/Dict/${props.dictId}/${id}`, submitData))
          hasChanges = true
        } else {
          console.error('无法获取行 ID，跳过:', row)
        }
      }
    }

    if (!hasChanges) {
      ElMessage.info('没有检测到修改')
      isEdit.value = false
      return
    }

    await Promise.all(promises)
    ElMessage.success('保存成功')
    await fetchData()
  } catch (error) {
    console.error(error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────
// 新增列
// ─────────────────────────────────────────────
const openAddColumnDialog = () => {
  addColForm.title = ''
  addColForm.uiType = 'Input'
  addColForm.options = ''
  addColForm.isRequired = false
  addColVisible.value = true
}

const submitAddColumn = async () => {
  if (!addColForm.title) return ElMessage.warning('请输入列名称')

  addingCol.value = true
  try {
    await axios.post(`/api/dict-config/columns/${props.dictId}`, {
      title: addColForm.title,
      uiType: addColForm.uiType,
      isRequired: addColForm.isRequired,
      options: addColForm.options
    })

    ElMessage.success('列添加成功')
    addColVisible.value = false
    const wasEdit = isEdit.value
    await new Promise(resolve => setTimeout(resolve, 800))
    await fetchData()
    if (wasEdit) await toggleEdit()
  } catch (error) {
    console.error(error)
    ElMessage.error(error.response?.data?.message || '添加失败')
  } finally {
    addingCol.value = false
  }
}

// ─────────────────────────────────────────────
// 搜索过滤
// ─────────────────────────────────────────────
const displayData = computed(() => {
  const rawData = tableConfig.value.list || []
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return rawData
  return rawData.filter(row =>
    Object.values(row).some(val => String(val ?? '').toLowerCase().includes(keyword))
  )
})

// ─────────────────────────────────────────────
// ✅ 权限计算属性（从 meta 读取）
// ─────────────────────────────────────────────
const canCreate = computed(() => tableMeta.value.permissions?.allowCreate !== false)
const canEdit   = computed(() => tableMeta.value.permissions?.allowEdit   !== false)
const canDelete = computed(() => tableMeta.value.permissions?.allowDelete !== false)
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

        <!-- ✅ 按权限显示按钮 -->
        <el-button
          v-if="!isEdit && canEdit"
          type="primary"
          :loading="loadingOptions"
          @click="toggleEdit"
        >
          {{ loadingOptions ? '加载选项中...' : '编辑' }}
        </el-button>

        <template v-if="isEdit">
          <el-button v-if="canCreate" type="primary" @click="handleAddRow" icon="Plus">新增行</el-button>
          <el-button type="primary" @click="openAddColumnDialog" icon="Plus">新增列</el-button>
          <el-button
            v-if="false"
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
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
          :sortable="col.isSortable ? 'custom' : false"
          :filters="getColumnFilters(col)"
          :filter-method="filterHandler"
        >
          <!-- ✅ 列标题：必填标记 + Tooltip -->
          <template #header>
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              <span v-if="col.required" style="color: red;">*</span>
              {{ col.label }}
              <el-tooltip v-if="col.tooltip" :content="col.tooltip" placement="top">
                <el-icon style="cursor: help; color: #909399;"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>

          <template #default="scope">
            <!-- ✅ VisibleWhen：条件不满足时显示 — -->
            <template v-if="!evaluateCondition(col.visibleWhen, scope.row)">
              <span style="color: #c0c4cc;">—</span>
            </template>

            <div
              v-else-if="isEdit"
              class="dirty-cell-wrapper"
              :class="{ 'is-modified': isModified(scope.row, col.prop) }"
            >
              <!-- 新增行主键：显示填缝 ID -->
              <span
                v-if="col.isPrimaryKey && scope.row._isNew"
                style="color: #67c23a; font-weight: bold; padding: 0 10px; display: flex; align-items: center;"
              >
                {{ scope.row[col.prop] }}
                <el-tag size="small" type="success" effect="plain" style="margin-left: 6px;">新</el-tag>
              </span>

              <template v-else>
                <template v-if="!col.isReadOnly">
                  <!-- Select -->
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
                      :disabled="opt.disabled"
                    />
                  </el-select>

                  <!-- MultiSelect -->
                  <el-select
                    v-else-if="col.type === 'multiselect'"
                    v-model="scope.row[col.prop]"
                    placeholder="请选择"
                    size="small"
                    multiple
                    filterable
                    collapse-tags
                  >
                    <el-option
                      v-for="opt in optionsMap[col.prop] || []"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                      :disabled="opt.disabled"
                    />
                  </el-select>

                  <!-- Switch -->
                  <el-switch
                    v-else-if="col.type === 'switch'"
                    v-model="scope.row[col.prop]"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                  />

                  <!-- Textarea -->
                  <el-input
                    v-else-if="col.type === 'textarea'"
                    v-model="scope.row[col.prop]"
                    type="textarea"
                    :rows="2"
                    size="small"
                  />

                  <!-- Number -->
                  <el-input-number
                    v-else-if="col.type === 'number'"
                    v-model="scope.row[col.prop]"
                    size="small"
                    :min="col.validation?.min"
                    :max="col.validation?.max"
                    :precision="col.validation?.precision"
                    style="width: 100%;"
                  />

                  <!-- DatePicker -->
                  <el-date-picker
                    v-else-if="col.type === 'date'"
                    v-model="scope.row[col.prop]"
                    type="date"
                    size="small"
                    :format="col.format || 'YYYY-MM-DD'"
                    :value-format="col.format || 'YYYY-MM-DD'"
                    style="width: 100%;"
                  />

                  <!-- DateTimePicker -->
                  <el-date-picker
                    v-else-if="col.type === 'datetime'"
                    v-model="scope.row[col.prop]"
                    type="datetime"
                    size="small"
                    :format="col.format || 'YYYY-MM-DD HH:mm:ss'"
                    :value-format="col.format || 'YYYY-MM-DD HH:mm:ss'"
                    style="width: 100%;"
                  />

                  <!-- 默认 Input -->
                  <el-input
                    v-else
                    v-model="scope.row[col.prop]"
                    size="small"
                  />
                </template>

                <!-- 只读 -->
                <span v-else style="color: #909399; cursor: not-allowed;">
                  <el-tag v-if="col.type === 'switch'" type="info" size="small" effect="plain">
                    {{ scope.row[col.prop] ? '是' : '否' }}
                  </el-tag>
                  <span v-else>{{ scope.row[col.prop] }}</span>
                </span>
              </template>

              <div v-if="!col.isReadOnly && isModified(scope.row, col.prop)" class="dirty-marker"></div>
            </div>

            <!-- 查看模式 -->
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

    <!-- 新增列对话框 -->
    <el-dialog v-model="addColVisible" title="添加自定义列" width="400px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="列名称">
          <el-input v-model="addColForm.title" placeholder="例如：牌号" />
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
        <el-button @click="addColVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddColumn" :loading="addingCol">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
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