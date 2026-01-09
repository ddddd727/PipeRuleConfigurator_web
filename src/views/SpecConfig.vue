<template>
  <div class="spec-config-container">
    <el-tabs v-model="activeTab" type="border-card" class="main-tabs">
      <el-tab-pane label="B1B2B3D" name="b1b2b3d">
        <div class="split-layout">
          <!-- LEFT PANE -->
          <div class="left-pane" >
           <div class="pane-toolbar" style="display: flex; justify-content: flex-end;">
              <el-button type="primary"  style="margin-left: 10px;" @click="generateData">生成组合数据</el-button>
            </div>
            <div class="pane-content scrollable-x">
               <!-- B1 -->
              <div class="panel-wrapper" style="width: 184px;">
                <div class="panel">
                  <div class="panel-header">B1-主材料</div>
                  <el-table :data="b1Data" border size="small" height="100%" highlight-current-row @current-change="handleB1Change">
                     <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="b1Selection" :label="scope.row.code" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="主材料" align="center" />
                </el-table>
              </div>
            </div>

            <!-- B2 -->
            <div class="panel-wrapper" style="width: 160px;">
              <div class="panel">
                <div class="panel-header">B2-管材标准</div>
                <el-table :data="b2Data" border size="small" height="100%" highlight-current-row @current-change="handleB2Change">
                      <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="b2Selection" :label="scope.row.code" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="管材标准" align="center" />
                </el-table>
              </div>
            </div>

            <!-- B3 -->
            <div class="panel-wrapper" style="width: 146px;">
              <div class="panel">
                <div class="panel-header">B3-牌号</div>
                <el-table :data="b3Data" border size="small" height="100%" highlight-current-row @current-change="handleB3Change">
                         <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="b3Selection" :label="scope.row.code" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="牌号" align="center" />
                </el-table>
              </div>
            </div>

            <!-- D -->
            <div class="panel-wrapper" style="width: 160px;">
              <div class="panel">
                <div class="panel-header">D-壁厚等级</div>
                <el-table :data="dData" border size="small" height="100%" @selection-change="handleDChange" ref="dTableRef">
                  <el-table-column type="selection" width="32" align="center" />
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="壁厚等级" align="center" />
                </el-table>
              </div>
            </div>
            </div>
          </div>
          
          <!-- DIVIDER -->
          <div class="vertical-divider"></div>

          <!-- RIGHT PANE -->
          <div class="right-pane">
            <div class="pane-toolbar">             
               <span class="label" style="margin-left: 5px;">规则: </span>
               <el-select  v-model="selectedRule" placeholder="请选择" style="width: 120px; margin-right: 10px;">
                 <el-option
                   v-for="rule in ruleOptions"
                   :key="rule"
                   :label="rule"
                   :value="rule"
                 />
               </el-select>
               <el-button type="primary" @click="openSaveRuleModal">新增</el-button>
               <el-button type="primary" >编辑</el-button>
              <el-button @click="confirmDeleteRule" type="danger" >删除规则</el-button>
              <el-button type="primary" @click="saveData">保存</el-button>
                     
            </div> 
            <div class="pane-content">
               <div class="panel full-height" style="width: 100%;">
                  <div class="panel-header">B1B2B3D组合数据</div>
                  <div style="flex: 1; overflow: hidden;">
                    <el-table :data="pagedResultData" border size="small" height="100%" @row-click="handleResultRowClick" @selection-change="handleResultSelectionChange">
                      <el-table-column type="selection" width="32" align="center" />
                      <el-table-column prop="id" label="ID" width="50" align="center" />
                      <el-table-column prop="b1Code" label="主材料" align="center" />
                      <el-table-column prop="b2Code" label="管材标准"  align="center" />
                      <el-table-column prop="b3Code" label="牌号" width="60" align="center" />
                      <el-table-column prop="dCode" label="壁厚等级"  align="center" />
                    </el-table>
                  </div>
                  <div class="pagination-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-top: 1px solid #dcdfe6;">
                            <!-- 分页组件 -->
                            <el-pagination
                              v-model:current-page="resultCurrentPage"
                              v-model:page-size="resultPageSize"
                              layout="total, prev, pager, next"
                              :total="resultData.length"
                              :pager-count="3"
                              @current-change="handleResultCurrentChange"
                              style="margin: 0;"
                              size="small"  
                            />
                            
                            <!-- 操作按钮组 -->
                           
                          </div>
               </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

<el-tab-pane label="C1C2" name="c1c2">
  <div class="split-layout">
    <!-- 左侧面板：C1和C2选择区域 -->
     <div class="left-pane">
      <div class="pane-toolbar" style="display: flex; justify-content: flex-end;">
        <el-button @click="generateC1C2Data">生成组合数据</el-button>
      </div>
      <div class="pane-content scrollable-x">
        <!-- C1选择表格 -->
        <div class="panel-wrapper" style="width: 360px;">
          <div class="panel">
            <div class="panel-header">C1-法兰标准</div>
            <el-table 
              :data="c1Data" 
              border 
              size="small" 
              height="100%" 
              highlight-current-row 
              @current-change="handleC1Change"
            >
              <el-table-column width="32" align="center">
                <template #default="scope">
                  <el-radio v-model="c1Selection" :label="scope.row.code" class="no-label-radio">&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column prop="code" label="编码" width="42" align="center" />
              <el-table-column prop="name" label="法兰标准" align="center" />
            </el-table>
          </div>
        </div>

        <!-- C2选择表格 -->
        <div class="panel-wrapper" style="width: 310px;">
          <div class="panel">
            <div class="panel-header">C2-法兰压力等级</div>
            <el-table 
              :data="c2Data" 
              border 
              size="small" 
              height="100%" 
              @selection-change="handleC2Change" 
              ref="c2TableRef"
            >
              <el-table-column type="selection" width="32" align="center" />
              <el-table-column prop="code" label="编码" width="42" align="center" />
              <el-table-column prop="name" label="法兰压力等级" align="center" />
            </el-table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 垂直分隔线 -->
    <div class="vertical-divider"></div>
    
    <!-- 右侧面板：C1C2组合数据显示和操作区域 -->
    <div class="right-pane">
      <div class="pane-toolbar">
        <span class="label" style="margin-left: 10px;">规则: </span>
        <el-select v-model="selectedRule" placeholder="请选择" style="width: 120px; margin-right: 10px;">
          <el-option
            v-for="rule in ruleOptions"
            :key="rule"
            :label="rule"
            :value="rule"
          />
        </el-select>
        <el-button type="primary" @click="openSaveRuleModal">新增</el-button>
        <el-button type="primary" >编辑</el-button>       
        <el-button @click="confirmDeleteRule" type="danger">删除规则</el-button>
        <el-button type="primary">保存</el-button>          
      </div>
      
      <div class="pane-content">
        <div class="panel full-height" style="width: 100%;">
          <div class="panel-header">C1C2组合数据</div>
          
          <!-- 表格区域 -->
          <div style="flex: 1; overflow: hidden;">
            <el-table 
              :data="pagedResultC1C2Data" 
              border 
              size="small" 
              height="100%" 
              @row-click="handleResultC1C2RowClick"
              @selection-change="handleC1C2ResultSelectionChange"
            >
              <el-table-column type="selection" width="32" align="center" />
              <el-table-column prop="id" label="ID" width="50" align="center" />
              <el-table-column prop="c1Code" label="法兰标准" width="80" align="center" />
              <el-table-column prop="c2Code" label="法兰压力等级" align="center" />
            </el-table>
          </div>
          
          <!-- 分页和操作按钮区域 -->
          <div class="pagination-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-top: 1px solid #dcdfe6;">
            <!-- 分页组件 -->
            <el-pagination
              v-model:current-page="resultC1C2CurrentPage"
              v-model:page-size="resultC1C2PageSize"
              layout="total, prev, pager, next"
              :total="resultC1C2Data.length"
              :pager-count="3"
              @current-change="handleResultC1C2CurrentChange"
              style="margin: 0;"
              size="small"  
            />
            
            <!-- 操作按钮组 -->
           
          </div>
        </div>
      </div>
    </div>
  </div>
</el-tab-pane>

      <el-tab-pane label="管材I/II级限定" name="limit">
        <div class="split-layout">
           <div class="left-pane">
          <div class="pane-toolbar" style="display: flex; justify-content: flex-end;">
              <el-button @click="generateLimitData">生成组合数据</el-button>
            </div>
            <div class="pane-content scrollable-x">
             <!-- A -->
            <div class="panel-wrapper" style="width: 150px;">
              <div class="panel">
                <div class="panel-header">A-管材等级</div>
                <el-table :data="aData" border size="small" height="100%" highlight-current-row @current-change="handleAChange">
                        <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="limitASelection" :label="scope.row.code" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="管材等级"  align="center" />
                </el-table>
              </div>
            </div>

            <!-- B2 -->
            <div class="panel-wrapper" style="width: 160px;">
              <div class="panel">
                <div class="panel-header">B2-管材标准</div>
                <el-table :data="b2Data" border size="small" height="100%" highlight-current-row @current-change="handleLimitB2Change">
                         <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="limitB2Selection" :label="scope.row.code" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="管材标准"  align="center" />
                </el-table>
              </div>
            </div>

            <!-- B3 -->
            <div class="panel-wrapper" style="width: 160px;">
              <div class="panel">
                <div class="panel-header">B3-牌号</div>
                <el-table :data="b3Data" border size="small" height="100%" @selection-change="handleLimitB3Change" ref="limitB3TableRef">
                   <el-table-column type="selection" width="32" align="center" />
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="牌号"  align="center" />
                </el-table>
              </div>
            </div>

            <!-- C2 -->
            <div class="panel-wrapper" style="width: 180px;">
              <div class="panel">
                <div class="panel-header">C2-法兰压力等级</div>
                <el-table :data="c2Data" border size="small" height="100%" @selection-change="handleLimitC2Change" ref="limitC2TableRef">
                  <el-table-column type="selection" width="32" align="center" />
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="法兰压力等级" align="center" />
                </el-table>
              </div>
            </div>
            </div>
           </div>
           <div class="vertical-divider"></div>
           <div class="right-pane">
             <div class="pane-toolbar">
             <span class="label" style="margin-left: 10px;">规则: </span>
               <el-select v-model="selectedRule" placeholder="请选择" style="width: 120px; margin-right: 10px;">
                 <el-option
                   v-for="rule in ruleOptions"
                   :key="rule"
                   :label="rule"
                   :value="rule"
                 />
               </el-select>
               <el-button type="primary" @click="openSaveRuleModal">新增</el-button>
               <el-button type="primary" >编辑</el-button>
              <el-button type="danger" @click="confirmDeleteRule">删除规则</el-button>
              <el-button type="primary" >保存</el-button>
            </div>
            <div class="pane-content">
               <div class="panel full-height" style="width: 100%;">
                  <div class="panel-header">AB2B3C2组合数据</div>
                  <div style="flex: 1; overflow: hidden;">
                    <el-table :data="pagedResultLimitData" border size="small" height="100%" @row-click="handleResultLimitRowClick" @selection-change="handleLimitResultSelectionChange">
                      <el-table-column type="selection" width="32" align="center" />
                      <el-table-column prop="id" label="ID" width="50" align="center" />
                      <el-table-column prop="aCode" label="管材等级" width="70" align="center" />
                      <el-table-column prop="b2Code" label="管材标准" width="70" align="center" />
                      <el-table-column prop="b3Code" label="牌号" width="60" align="center" />
                      <el-table-column prop="c2Code" label="法兰压力等级"  align="center" />
                    </el-table>
                  </div>                
                   <div class="pagination-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-top: 1px solid #dcdfe6;">
                  <!-- 分页组件 -->
                  <el-pagination
                    v-model:current-page="resultLimitCurrentPage"
                    v-model:page-size="resultLimitPageSize"
                    layout="total, prev, pager, next"
                    :total="resultLimitData.length"
                    :pager-count="3"
                    @current-change="handleResultLimitCurrentChange"
                    style="margin: 0;"
                    size="small"  
                  />
                  
                  <!-- 操作按钮组 -->
              
                </div>
               </div>
            </div>
           </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- Save Rule Dialog -->
    <el-dialog
      v-model="saveRuleVisible"
      title="新增规则"
      width="400px"
      center
    >
      <div style="display: flex; align-items: center; justify-content: center; padding: 20px 0;">
        <span style="margin-right: 10px; font-weight: bold;">规则命名:</span>
        <el-input v-model="ruleName" placeholder="" style="width: 200px;" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="confirmSaveRule">确认</el-button>
          <el-button @click="saveRuleVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('b1b2b3d')
const selectedRule = ref('501XXX')
const ruleOptions = ref(['501XXX'])

// Table Refs
const dTableRef = ref(null)
const c2TableRef = ref(null)
const limitB3TableRef = ref(null)
const limitC2TableRef = ref(null)

// B1 Data
const b1Selection = ref('')
const b1Data = ref([
  { code: 'C', name: '碳钢管' },
  { code: 'S', name: '不锈钢' },
  { code: 'D', name: '双相不锈钢' },
  { code: 'A', name: '超级奥氏体不锈钢 SMO254' },
  { code: 'M', name: '耐高温钢 15CRMOR' },
  { code: 'T', name: '纯钛管' },
  { code: 'U', name: '铜管' },
  { code: 'G', name: 'GRE' },
  { code: 'P', name: '塑料' },
  { code: 'N', name: '铜镍' },
])

// B2 Data
const b2Selection = ref('')
const b2Data = ref([
  { code: '1', name: 'GB/T 8163' },
  { code: '2', name: 'GB/T 5312' },
  { code: '3', name: 'GB/T 3639' },
  { code: '4', name: 'GB/T 3091' },
])

// B3 Data
const b3Selection = ref('')
const b3Data = ref([
  { code: 'A', name: '10#' },
  { code: 'B', name: '20#' },
  { code: 'C', name: 'Q235A' },
  { code: 'D', name: 'Q345A' },
  { code: 'E', name: 'Q420A' },
  { code: 'F', name: '#360' },
  { code: 'G', name: '#410' },
  { code: 'H', name: '#460' },
  { code: 'J', name: '#490' },
])

// D Data
const dSelection = ref([])
const dData = ref([
  { code: 'A', name: 'SCHSTD' },
  { code: 'B', name: 'SCH20' },
  { code: 'C', name: 'SCH30' },
  { code: 'D', name: 'SCH40' },
  { code: 'E', name: 'SCH80' },
  { code: 'F', name: 'SCHXS' },
  { code: 'G', name: 'SCH100' },
  { code: 'H', name: 'SCH120' },
  { code: 'J', name: 'SCH160' },
])

// Result Data
const resultData = ref([
  { id: 1, b1Code: 'C', b2Code: '1', b3Code: 'A', dCode: 'A' },
  { id: 2, b1Code: 'C', b2Code: '2', b3Code: 'B', dCode: 'B' },
  { id: 3, b1Code: 'C', b2Code: '3', b3Code: 'C', dCode: 'C' },
  { id: 4, b1Code: 'C', b2Code: '4', b3Code: 'D', dCode: 'D' },
])

// Pagination for B1B2B3D
const resultPageSize = ref(15)
const resultCurrentPage = ref(1)
const pagedResultData = computed(() => {
  const start = (resultCurrentPage.value - 1) * resultPageSize.value
  const end = start + resultPageSize.value
  return resultData.value.slice(start, end)
})
const handleResultCurrentChange = (val) => {
  resultCurrentPage.value = val
}

const generateData = () => {
  if (!b1Selection.value || !b2Selection.value || !b3Selection.value) {
    ElMessage.warning('请先选择 B1, B2, B3')
    return
  }
  if (dSelection.value.length === 0) {
    ElMessage.warning('请至少选择一个 D')
    return
  }

  let newId = resultData.value.length > 0 ? Math.max(...resultData.value.map(r => r.id)) + 1 : 1
  let count = 0
  
  dSelection.value.forEach(d => {
    // Check if exists
    const exists = resultData.value.some(r => 
      r.b1Code === b1Selection.value &&
      r.b2Code === b2Selection.value &&
      r.b3Code === b3Selection.value &&
      r.dCode === d.code
    )
    
    if (!exists) {
      resultData.value.push({
        id: newId++,
        b1Code: b1Selection.value,
        b2Code: b2Selection.value,
        b3Code: b3Selection.value,
        dCode: d.code
      })
      count++
    }
  })
  
  if (count > 0) {
    ElMessage.success(`生成成功，新增 ${count} 条数据`)
  } else {
    ElMessage.info('所选组合已存在')
  }
}

const saveData = async () => {
  const selected = resultSelection.value
  if (selected.length === 0) {
    ElMessage.warning('请选择要保存的行')
    return
  }
  
  try {
    const payload = selected.map(row => ({
      materialsCategoryID: row.b1Code,
      pipingStandardID: row.b2Code,
      materialsGradeID: row.b3Code,
      scheduleThicknessID: row.dCode,
      ruleName: selectedRule.value
    }))
    const res = await axios.post('/api/DspSpmcRuleAb2b3c2', payload)
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.data.message || '保存失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('请求失败: ' + (error.message || '未知错误'))
  }
}

const handleB1Change = (row) => {
  if(row) b1Selection.value = row.code
}

const handleB2Change = (row) => {
   if(row) b2Selection.value = row.code
}

const handleB3Change = (row) => {
   if(row) b3Selection.value = row.code
}

const handleDChange = (selection) => {
  dSelection.value = selection
}

const handleResultRowClick = (row) => {
  if (row) {
    b1Selection.value = row.b1Code
    b2Selection.value = row.b2Code
    b3Selection.value = row.b3Code
    
    // For D (multi-select)
    if (dTableRef.value) {
      dTableRef.value.clearSelection()
      const targetD = dData.value.find(item => item.code === row.dCode)
      if (targetD) {
        dTableRef.value.toggleRowSelection(targetD, true)
      }
    }
  }
}

// Result Data Selection
const resultSelection = ref([])
const handleResultSelectionChange = (selection) => {
  resultSelection.value = selection
}

// Delete Result Data
const deleteResultData = () => {
  if (resultSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  
  ElMessageBox.confirm(
    `确定删除选中的 ${resultSelection.value.length} 条数据吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const idsToDelete = resultSelection.value.map(item => item.id)
      resultData.value = resultData.value.filter(item => !idsToDelete.includes(item.id))
      resultSelection.value = []
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // cancel
    })
}

// C1 Data
const c1Selection = ref('')
const c1Data = ref([
  { code: '1', name: 'GB2506' },
  { code: '2', name: 'GB10746' },
  { code: '3', name: 'Q/SWS 34-003.3' },
  { code: '4', name: 'Q/SWS 34-022' },
  { code: '5', name: 'Q/SWS 34-066' },
  { code: '6', name: 'Q/SWS 34-067' },
  { code: '7', name: '8G241002TB' },
])

// C2 Data
const c2Selection = ref([])
const c2Data = ref([
  { code: 'A', name: '6bar' },
  { code: 'B', name: '10bar' },
  { code: 'C', name: '16bar' },
  { code: 'D', name: '20bar' },
  { code: 'E', name: '25bar' },
  { code: 'F', name: '30bar' },
  { code: 'G', name: '40bar' },
  { code: 'H', name: '64bar' },
])

// Result C1C2 Data
const resultC1C2Data = ref([
  { id: 1, c1Code: '1', c2Code: 'A' },
  { id: 2, c1Code: '2', c2Code: 'A' },
  { id: 3, c1Code: '3', c2Code: 'A' },
])

// Pagination for C1C2
const resultC1C2PageSize = ref(15)
const resultC1C2CurrentPage = ref(1)
const pagedResultC1C2Data = computed(() => {
  const start = (resultC1C2CurrentPage.value - 1) * resultC1C2PageSize.value
  const end = start + resultC1C2PageSize.value
  return resultC1C2Data.value.slice(start, end)
})
const handleResultC1C2CurrentChange = (val) => {
  resultC1C2CurrentPage.value = val
}

const generateC1C2Data = () => {
  if (!c1Selection.value) {
    ElMessage.warning('请先选择 C1')
    return
  }
  if (c2Selection.value.length === 0) {
    ElMessage.warning('请至少选择一个 C2')
    return
  }

  let newId = resultC1C2Data.value.length > 0 ? Math.max(...resultC1C2Data.value.map(r => r.id)) + 1 : 1
  let count = 0
  
  c2Selection.value.forEach(c2 => {
    // Check if exists
    const exists = resultC1C2Data.value.some(r => 
      r.c1Code === c1Selection.value &&
      r.c2Code === c2.code
    )
    
    if (!exists) {
      resultC1C2Data.value.push({
        id: newId++,
        c1Code: c1Selection.value,
        c2Code: c2.code
      })
      count++
    }
  })
  
  if (count > 0) {
    ElMessage.success(`生成成功，新增 ${count} 条数据`)
  } else {
    ElMessage.info('所选组合已存在')
  }
}

const handleC1Change = (row) => {
  if(row) c1Selection.value = row.code
}

const handleC2Change = (selection) => {
  c2Selection.value = selection
}

const handleResultC1C2RowClick = (row) => {
  if (row) {
    c1Selection.value = row.c1Code
    
    // For C2 (multi-select)
    if (c2TableRef.value) {
      c2TableRef.value.clearSelection()
      const targetC2 = c2Data.value.find(item => item.code === row.c2Code)
      if (targetC2) {
        c2TableRef.value.toggleRowSelection(targetC2, true)
      }
    }
  }
}

// Result C1C2 Data Selection
const resultC1C2Selection = ref([])
const handleC1C2ResultSelectionChange = (selection) => {
  resultC1C2Selection.value = selection
}

// Delete Result C1C2 Data
const deleteC1C2ResultData = () => {
  if (resultC1C2Selection.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  
  ElMessageBox.confirm(
    `确定删除选中的 ${resultC1C2Selection.value.length} 条数据吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const idsToDelete = resultC1C2Selection.value.map(item => item.id)
      resultC1C2Data.value = resultC1C2Data.value.filter(item => !idsToDelete.includes(item.id))
      resultC1C2Selection.value = []
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // cancel
    })
}

// Limit Data Variables
const limitASelection = ref('')
const limitB2Selection = ref('')
const limitB3Selection = ref([])
const limitC2Selection = ref([])

const aData = ref([
  { code: '1', name: 'I' },
  { code: '2', name: 'II' },
  { code: '3', name: 'III' }
])

const resultLimitData = ref([
  { id: 1, aCode: '1', b2Code: '1', b3Code: 'A', c2Code: 'A' },
  { id: 2, aCode: '2', b2Code: '2', b3Code: 'A', c2Code: 'A' }
])

// Pagination for Limit
const resultLimitPageSize = ref(15)
const resultLimitCurrentPage = ref(1)
const pagedResultLimitData = computed(() => {
  const start = (resultLimitCurrentPage.value - 1) * resultLimitPageSize.value
  const end = start + resultLimitPageSize.value
  return resultLimitData.value.slice(start, end)
})
const handleResultLimitCurrentChange = (val) => {
  resultLimitCurrentPage.value = val
}

const generateLimitData = () => {
  if (!limitASelection.value) {
     ElMessage.warning('请选择 A 管材等级')
     return
  }

  // Special logic for Class III
  if (limitASelection.value === '3') {
     const exists = resultLimitData.value.some(r => r.aCode === '3')
     if (!exists) {
        let newId = resultLimitData.value.length > 0 ? Math.max(...resultLimitData.value.map(r => r.id)) + 1 : 1
        resultLimitData.value.push({
          id: newId,
          aCode: '3',
          b2Code: '',
          b3Code: '',
          c2Code: ''
        })
        ElMessage.success('生成成功 (III级管材)')
     } else {
        ElMessage.info('已存在 III级管材 配置')
     }
     return
  }

  // Normal logic for I, II
  if (!limitB2Selection.value) {
    ElMessage.warning('请选择 B2')
    return
  }
  if (limitB3Selection.value.length === 0) {
    ElMessage.warning('请至少选择一个 B3')
    return
  }
  if (limitC2Selection.value.length === 0) {
    ElMessage.warning('请至少选择一个 C2')
    return
  }

  let count = 0
  let newId = resultLimitData.value.length > 0 ? Math.max(...resultLimitData.value.map(r => r.id)) + 1 : 1

  limitB3Selection.value.forEach(b3 => {
    limitC2Selection.value.forEach(c2 => {
       const exists = resultLimitData.value.some(r => 
         r.aCode === limitASelection.value &&
         r.b2Code === limitB2Selection.value &&
         r.b3Code === b3.code &&
         r.c2Code === c2.code
       )
       
       if (!exists) {
         resultLimitData.value.push({
           id: newId++,
           aCode: limitASelection.value,
           b2Code: limitB2Selection.value,
           b3Code: b3.code,
           c2Code: c2.code
         })
         count++
       }
    })
  })

  if (count > 0) {
    ElMessage.success(`生成成功，新增 ${count} 条数据`)
  } else {
    ElMessage.info('所选组合已存在')
  }
}

const handleAChange = (row) => {
  if (row) {
    limitASelection.value = row.code
    // Clear selections if III is selected (optional UX enhancement)
    if (row.code === '3') {
       limitB2Selection.value = ''
       limitB3Selection.value = []
       limitC2Selection.value = []
    }
  }
}

const handleLimitB2Change = (row) => {
  if (row) limitB2Selection.value = row.code
  // Logic to filter B3 based on B2 (Note 2) would go here
  // For now, we keep it simple as requested
}

const handleLimitB3Change = (selection) => {
  limitB3Selection.value = selection
}

const handleLimitC2Change = (selection) => {
  limitC2Selection.value = selection
}

const handleResultLimitRowClick = (row) => {
  if (row) {
    limitASelection.value = row.aCode
    limitB2Selection.value = row.b2Code
    
    // For B3 (multi-select)
    if (limitB3TableRef.value) {
      limitB3TableRef.value.clearSelection()
      const targetB3 = b3Data.value.find(item => item.code === row.b3Code)
      if (targetB3) {
        limitB3TableRef.value.toggleRowSelection(targetB3, true)
      }
    }

    // For C2 (multi-select)
    if (limitC2TableRef.value) {
      limitC2TableRef.value.clearSelection()
      const targetC2 = c2Data.value.find(item => item.code === row.c2Code)
      if (targetC2) {
        limitC2TableRef.value.toggleRowSelection(targetC2, true)
      }
    }
  }
}

// Result Limit Data Selection
const resultLimitSelection = ref([])
const handleLimitResultSelectionChange = (selection) => {
  resultLimitSelection.value = selection
}

// Delete Result Limit Data
const deleteLimitResultData = () => {
  if (resultLimitSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  
  ElMessageBox.confirm(
    `确定删除选中的 ${resultLimitSelection.value.length} 条数据吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const idsToDelete = resultLimitSelection.value.map(item => item.id)
      resultLimitData.value = resultLimitData.value.filter(item => !idsToDelete.includes(item.id))
      resultLimitSelection.value = []
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // cancel
    })
}

// Lifecycle
import { onMounted } from 'vue'

// Save Rule Logic
const saveRuleVisible = ref(false)
const ruleName = ref('')

const openSaveRuleModal = () => {
  ruleName.value = ''
  saveRuleVisible.value = true
}

const confirmSaveRule = () => {
  if (!ruleName.value.trim()) {
    ElMessage.warning('请输入规则名称')
    return
  }
  
  let selectedData = []
  let type = ''
  
  if (activeTab.value === 'b1b2b3d') {
    selectedData = resultSelection.value
    type = 'B1B2B3D'
  } else if (activeTab.value === 'c1c2') {
    selectedData = resultC1C2Selection.value
    type = 'C1C2'
  } else if (activeTab.value === 'limit') {
    selectedData = resultLimitSelection.value
    type = 'Limit'
  }
  
  // Simulation of saving
  console.log('Saving Rule:', {
    name: ruleName.value,
    type: type,
    data: selectedData
  })
  
  if (!ruleOptions.value.includes(ruleName.value)) {
    ruleOptions.value.push(ruleName.value)
  }
  selectedRule.value = ruleName.value
  ElMessage.success(`规则 "${ruleName.value}" 保存成功，包含 ${selectedData.length} 条数据，已加入下拉框`)
  saveRuleVisible.value = false
}

const confirmDeleteRule = () => {
  if (!selectedRule.value) {
    ElMessage.warning('请先选择要删除的规则')
    return
  }
  const name = selectedRule.value
  ElMessageBox.confirm(
    `确定删除当前规则 "${name}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ruleOptions.value = ruleOptions.value.filter(r => r !== name)
      selectedRule.value = ruleOptions.value.length ? ruleOptions.value[0] : ''
      ElMessage.success('规则删除成功')
    })
    .catch(() => {})
}

</script>

<style scoped>
.spec-config-container {
  height: 100%;
  padding: 0;
  background-color: #fff;
}

.main-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Split Layout */
.split-layout {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.left-pane {
  display: flex;
  flex-direction: column;
  width:700px;
  overflow: visible;
  flex: 0 0 auto;
}

.right-pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-width: 400px;
}

.vertical-divider {
  width: 1px;
  background-color: #dcdfe6;
  height: 100%;
  flex-shrink: 0;
}

.pane-toolbar {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  height: 52px;
  box-sizing: border-box;
}

.pane-content {
  flex: 1;
  overflow: hidden;
  padding: 10px;
  display: flex;
  background-color: #fff;
}

.scrollable-x {
  overflow-x: auto;
}

.label {
  margin-right: 10px;
  font-weight: bold;
}

.panel-wrapper {
  height: 100%;
  padding-right: 10px;
  flex-shrink: 0;
}

.panel-wrapper:last-child {
  padding-right: 0;
}

.panel {
  border: 1px solid #dcdfe6;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  background-color: #f5f7fa;
  padding: 8px 10px;
  font-weight: bold;
  border-bottom: 1px solid #dcdfe6;
  font-size: 13px;
}

.full-height {
  height: 100%;
}

:deep(.no-label-radio .el-radio__label) {
  display: none !important;
}

/* Ensure radio button row height matches checkbox row */
:deep(.el-table .el-radio) {
  height: auto !important;
  margin-right: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
</style>
