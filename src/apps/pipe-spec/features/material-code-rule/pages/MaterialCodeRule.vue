<template>
  <div class="spec-config-container">
    <el-tabs v-model="activeTab" type="border-card" class="main-tabs">
      <el-tab-pane label="B1B2B3D" name="b1b2b3d">
        <div class="split-layout layout-b1b2b3d">
          <!-- LEFT PANE -->
          <div class="left-pane" >
           <div class="pane-toolbar" style="justify-content: flex-end;">
              <el-button type="primary" icon="Plus" @click="generateData">生成组合数据</el-button>
            </div>
            <div class="pane-content scrollable-x">
               <!-- B1 -->
              <div class="panel-wrapper" style="flex: 1; min-width: 0;">
                <div class="panel">
                  <div class="panel-header">B1-主材料</div>
                  <el-table :data="b1Data" border size="small" height="100%" @current-change="handleB1Change">
                     <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="b1Selection" :label="scope.row.cl" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="60" align="center" />
                  <el-table-column prop="name" label="主材料" align="center" />
                </el-table>
              </div>
            </div>

            <!-- B2 -->
            <div class="panel-wrapper" style="flex: 1; min-width: 0;">
              <div class="panel">
                <div class="panel-header">B2-管材标准</div>
                <el-table :data="b2Data" border size="small" height="100%" @current-change="handleB2Change">
                      <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="b2Selection" :label="scope.row.cl" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="管材标准" align="center" />
                </el-table>
              </div>
            </div>

            <!-- B3 -->
            <div class="panel-wrapper" style="flex: 1; min-width: 0;">
              <div class="panel">
                <div class="panel-header">B3-牌号</div>
                <el-table :data="b3Data" border size="small" height="100%" @current-change="handleB3Change">
                         <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="b3Selection" :label="scope.row.cl" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="牌号" align="center" />
                </el-table>
              </div>
            </div>

            <!-- D -->
            <div class="panel-wrapper" style="flex: 1; min-width: 0;">
              <div class="panel">
                <div class="panel-header">D-壁厚等级</div>
                <el-table :data="dData" border size="small" height="100%" @selection-change="handleDChange" ref="dTableRef" @row-click="handleDRowClick">
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
            <div class="pane-toolbar" style="justify-content: flex-end;">             
               <span class="label">规则</span>
              <el-select  v-model="selectedRuleB1B2B3D" placeholder="请选择" style="width: 120px;" clearable filterable @visible-change="handleRuleDropdownVisibleChangeB1B2B3D" @change="handleRuleChangeB1B2B3D">
                 <el-option label="-- 新建规则 --" value="" />
                 <el-option
                   v-for="rule in ruleOptionsB1B2B3D"
                   :key="rule"
                   :label="rule"
                   :value="rule"
                 />
               </el-select>
               <el-button type="danger" icon="Delete" :disabled="resultSelection.length === 0" @click="deleteResultData">删除数据</el-button>
              <el-button @click="confirmDeleteRule" :disabled="!selectedRuleB1B2B3D" type="danger" icon="Delete" >删除规则</el-button>
              <el-button type="primary" @click="saveData"  icon="Check" >保存</el-button>
                     
            </div> 
            <div class="pane-content">
               <div class="panel full-height" style="width: 100%;">
                  <div class="panel-header">B1B2B3D组合数据 {{ selectedRuleB1B2B3D ? `(当前规则: ${selectedRuleB1B2B3D})` : '(未选择规则)' }}</div>
                  <div style="flex: 1; overflow: hidden;">
                    <el-table
                      ref="resultTableRef"
                      :data="resultData"
                      border
                      size="small"
                      height="100%"
                      @row-click="handleResultRowClick"
                      @selection-change="handleResultSelectionChange"
                    >
                      <el-table-column type="selection" width="32" align="center" />
                      <el-table-column prop="id" label="ID" width="50" align="center" />
                      <el-table-column prop="b1Code" label="主材料" min-width="120" align="center" />
                      <el-table-column prop="b2Code" label="管材标准" min-width="120" align="center" />
                      <el-table-column prop="b3Code" label="牌号" min-width="120" align="center" />
                      <el-table-column prop="dCode" label="壁厚等级" min-width="120" align="center" />
                    </el-table>
                  </div>
                  <div class="pagination-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-top: 1px solid #dcdfe6;">
                  </div>
               </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

<el-tab-pane label="C1C2" name="c1c2">
  <div class="split-layout layout-c1c2">
    <!-- 左侧面板：C1和C2选择区域 -->
     <div class="left-pane">
      <div class="pane-toolbar" style="justify-content: flex-end;">
        <el-button type="primary" icon="Plus" @click="generateC1C2Data">生成组合数据</el-button>
      </div>
      <div class="pane-content scrollable-x">
        <!-- C1选择表格 -->
        <div class="panel-wrapper" style="flex: 1; min-width: 0;">
          <div class="panel">
            <div class="panel-header">C1-法兰标准</div>
            <el-table 
              :data="c1Data" 
              border 
              size="small" 
              height="100%" 
              @current-change="handleC1Change"
            >
              <el-table-column width="32" align="center">
                <template #default="scope">
                  <el-radio v-model="c1Selection" :label="scope.row.cl" class="no-label-radio">&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column prop="code" label="编码" width="42" align="center" />
              <el-table-column prop="name" label="法兰标准" align="center" />
            </el-table>
          </div>
        </div>

        <!-- C2选择表格 -->
        <div class="panel-wrapper" style="flex: 1; min-width: 0;">
          <div class="panel">
            <div class="panel-header">C2-法兰压力等级</div>
            <el-table 
              :data="c2Data" 
              border 
              size="small" 
              height="100%" 
              @selection-change="handleC2Change" 
              ref="c2TableRef"
              @row-click="handleC2RowClick"
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
      <div class="pane-toolbar" style="justify-content: flex-end;">
        <span class="label">规则</span>
        <el-select v-model="selectedRuleC1C2" placeholder="请选择" style="width: 120px;" clearable filterable @visible-change="handleRuleDropdownVisibleChangeC1C2" @change="handleRuleChangeC1C2">
          <el-option label="-- 新建规则 --" value="" />
          <el-option
            v-for="rule in ruleOptionsC1C2"
            :key="rule"
            :label="rule"
            :value="rule"
          />
        </el-select>
        <el-button type="danger" icon="Delete" :disabled="resultC1C2Selection.length === 0" @click="deleteC1C2ResultData">删除数据</el-button>       
        <el-button @click="confirmDeleteRule" :disabled="!selectedRuleC1C2" type="danger" icon="Delete">删除规则</el-button>
        <el-button type="primary" icon="Check" @click="saveC1C2Data">保存</el-button>          
      </div>
      
      <div class="pane-content">
        <div class="panel full-height" style="width: 100%;">
          <div class="panel-header">C1C2组合数据 {{ selectedRuleC1C2 ? `(当前规则: ${selectedRuleC1C2})` : '(未选择规则)' }}</div>
          
          <!-- 表格区域 -->
          <div style="flex: 1; overflow: hidden;">
            <el-table 
              ref="resultC1C2TableRef"
              :data="resultC1C2Data" 
              border 
              size="small" 
              height="100%" 
              @row-click="handleResultC1C2RowClick"
              @selection-change="handleC1C2ResultSelectionChange"
            >
              <el-table-column type="selection" width="32" align="center" />
              <el-table-column prop="id" label="ID" width="50" align="center" />
              <el-table-column prop="c1Code" label="法兰标准" min-width="120" align="center" />
              <el-table-column prop="c2Code" label="法兰压力等级" min-width="120" align="center" />
            </el-table>
          </div>
          
          <!-- 分页和操作按钮区域 -->
          <div class="pagination-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-top: 1px solid #dcdfe6;">
          </div>
        </div>
      </div>
    </div>
  </div>
</el-tab-pane>

      <el-tab-pane label="管材I/II级限定" name="limit">
        <div class="split-layout layout-limit">
           <div class="left-pane">
          <div class="pane-toolbar" style="justify-content: flex-end;">
              <el-button type="primary" icon="Plus" @click="generateLimitData">生成组合数据</el-button>
            </div>
            <div class="pane-content scrollable-x">
             <!-- A -->
            <div class="panel-wrapper" style="flex: 1; min-width: 0;">
              <div class="panel">
                <div class="panel-header">A-管材等级</div>
                <el-table :data="aData" border size="small" height="100%" @current-change="handleAChange">
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
            <div class="panel-wrapper" style="flex: 1; min-width: 0;">
              <div class="panel">
                <div class="panel-header">B2-管材标准</div>
                <el-table :data="b2Data" border size="small" height="100%" @current-change="handleLimitB2Change">
                         <el-table-column width="32" align="center">
                    <template #default="scope">
                      <el-radio v-model="limitB2Selection" :label="scope.row.cl" class="no-label-radio">&nbsp;</el-radio>
                    </template>
                  </el-table-column>
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="管材标准"  align="center" />
                </el-table>
              </div>
            </div>

            <!-- B3 -->
            <div class="panel-wrapper" style="flex: 1; min-width: 0;">
              <div class="panel">
                <div class="panel-header">B3-牌号</div>
                <el-table :data="b3Data" border size="small" height="100%" @selection-change="handleLimitB3Change" ref="limitB3TableRef" @row-click="handleLimitB3RowClick">
                   <el-table-column type="selection" width="32" align="center" />
                  <el-table-column prop="code" label="编码" width="42" align="center" />
                  <el-table-column prop="name" label="牌号"  align="center" />
                </el-table>
              </div>
            </div>

            <!-- C2 -->
            <div class="panel-wrapper" style="flex: 1; min-width: 0;">
              <div class="panel">
                <div class="panel-header">C2-法兰压力等级</div>
                <el-table :data="c2Data" border size="small" height="100%" @selection-change="handleLimitC2Change" ref="limitC2TableRef" @row-click="handleLimitC2RowClick">
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
             <div class="pane-toolbar" style="justify-content: flex-end;">
             <span class="label">规则</span>
              <el-select v-model="selectedRuleLimit" placeholder="请选择" style="width: 120px;" clearable filterable @visible-change="handleRuleDropdownVisibleChangeLimit" @change="handleRuleChangeLimit">
                 <el-option label="-- 新建规则 --" value="" />
                 <el-option
                   v-for="rule in ruleOptionsLimit"
                   :key="rule"
                   :label="rule"
                   :value="rule"
                 />
               </el-select>
               <el-button type="danger" icon="Delete" :disabled="resultLimitSelection.length === 0" @click="deleteLimitResultData">删除数据</el-button>
              <el-button type="danger" icon="Delete" :disabled="!selectedRuleLimit" @click="confirmDeleteRule">删除规则</el-button>
              <el-button type="primary" icon="Check" @click="saveLimitData">保存</el-button>
            </div>
            <div class="pane-content">
               <div class="panel full-height" style="width: 100%;">
                  <div class="panel-header">AB2B3C2组合数据 {{ selectedRuleLimit ? `(当前规则: ${selectedRuleLimit})` : '(未选择规则)' }}</div>
                  <div style="flex: 1; overflow: hidden;">
                    <el-table
                      ref="resultLimitTableRef"
                      :data="resultLimitData"
                      border
                      size="small"
                      height="100%"
                      @row-click="handleResultLimitRowClick"
                      @selection-change="handleLimitResultSelectionChange"
                    >
                      <el-table-column type="selection" width="32" align="center" />
                      <el-table-column prop="id" label="ID" width="50" align="center" />
                      <el-table-column prop="aCode" label="管材等级" min-width="120" align="center" />
                      <el-table-column prop="b2Code" label="管材标准" min-width="120" align="center" />
                      <el-table-column prop="b3Code" label="牌号" min-width="120" align="center" />
                      <el-table-column prop="c2Code" label="法兰压力等级" min-width="120" align="center" />
                    </el-table>
                  </div>                
                   <div class="pagination-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-top: 1px solid #dcdfe6;">
                </div>
               </div>
            </div>
           </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- Save Confirm Dialog -->
    <el-dialog v-model="saveConfirmVisible" title="保存确认" width="400px" center>
      <div style="text-align: center; padding: 10px 20px;">
        <div v-if="!currentRuleNameForDialog">
          <div style="margin-bottom: 10px; color: #606266;">当前未选择规则，请输入新规则名称：</div>
          <el-input v-model="newRuleNameForSave" placeholder="新规则名称" />
        </div>
        <div v-else style="color: #606266; font-size: 14px; line-height: 1.6;">
          当前规则“<span style="color: #409EFF; font-weight: bold;">{{ currentRuleNameForDialog }}</span>”共包含 <span style="color: #F56C6C; font-weight: bold;">{{ currentCountForDialog }}</span> 条数据，是否确认保存？
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer" style="display: flex; justify-content: center; gap: 12px;">
          <el-button @click="saveConfirmVisible = false">取消</el-button>
          <el-button v-if="currentRuleNameForDialog" type="warning" plain @click="handleSaveAsClick">另存为</el-button>
          <el-button type="primary" @click="handleConfirmSave">确认保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Save As Dialog -->
    <el-dialog v-model="saveAsVisible" title="另存为" width="400px" center>
      <div style="padding: 10px 20px;">
        <div style="margin-bottom: 10px; color: #606266;">请输入另存为的规则名称：</div>
        <el-input v-model="newRuleNameForSave" placeholder="新规则名称" />
      </div>
      <template #footer>
        <div class="dialog-footer" style="display: flex; justify-content: center; gap: 12px;">
          <el-button @click="saveAsVisible = false">取消</el-button>
          <el-button type="primary" @click="performSaveAs">确认另存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({ name: 'SpecConfig' })
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('b1b2b3d')

const selectedRuleB1B2B3D = ref('')
const ruleOptionsB1B2B3D = ref([])
const selectedRuleC1C2 = ref('')
const ruleOptionsC1C2 = ref([])
const selectedRuleLimit = ref('')
const ruleOptionsLimit = ref([])

// Save Dialog State
const saveConfirmVisible = ref(false)
const saveAsVisible = ref(false)
const newRuleNameForSave = ref('')
const pendingSaveType = ref('')

const currentRuleNameForDialog = computed(() => {
  if (pendingSaveType.value === 'b1b2b3d') return selectedRuleB1B2B3D.value
  if (pendingSaveType.value === 'c1c2') return selectedRuleC1C2.value
  if (pendingSaveType.value === 'limit') return selectedRuleLimit.value
  return ''
})

const currentCountForDialog = computed(() => {
  if (pendingSaveType.value === 'b1b2b3d') return resultSelection.value.length
  if (pendingSaveType.value === 'c1c2') return resultC1C2Selection.value.length
  if (pendingSaveType.value === 'limit') return resultLimitSelection.value.length
  return 0
})

// Unified Save Execution
const executeSave = async (type, ruleName, selectedData) => {
  try {
    let url = ''
    let payload = []
    
    if (type === 'b1b2b3d') {
       url = `/api/S3dRuleB1b2b3d/${ruleName}`
       payload = selectedData.map(row => ({
          materialsCategoryCl: row.b1Cl,
          geometricIndustryStandardCl: row.b2Cl,
          materialsGradeCl: row.b3Cl,
          scheduleThicknessCl: row.dCl,
          ruleName: ruleName
       }))
    } else if (type === 'c1c2') {
       url = `/api/S3dRuleC1c2/${ruleName}`
       payload = selectedData.map(row => ({
          geometricIndustryStandardCl: row.c1Cl,
          pressureRatingCl: row.c2Cl,
          ruleName: ruleName
       }))
    } else if (type === 'limit') {
       url = `/api/S3dRuleAb2b3c2/${ruleName}`
       payload = selectedData.map(row => ({
          pipingClassCl: Number(row.aCl ?? 0) || 0,
          geometricIndustryStandardCl: Number(row.b2Cl ?? 0) || 0,
          materialsGradeCl: Number(row.b3Cl ?? 0) || 0,
          pressureRatingCl: Number(row.c2Cl ?? 0) || 0,
          ruleName: ruleName
       }))
    }
    
    const res = await axios.post(url, payload)
    const ok =
      res.status === 200 &&
      (res.data?.code === 200 ||
        res.data?.code === undefined ||
        res.data?.success === true)
        
    if (ok) {
      ElMessage.success('保存成功')
      resetRightPane(type)
    } else {
      ElMessage.error(res.data?.message || res.data?.msg || '保存失败')
    }
  } catch (error) {
     console.error(error)
     ElMessage.error('请求失败: ' + (error.message || '未知错误'))
  }
}

const resetRightPane = (type) => {
  if (type === 'b1b2b3d') {
    if (resultTableRef.value) {
      resultTableRef.value.clearSelection()
    }
    resultData.value = []
    resultSelection.value = []
    selectedRuleB1B2B3D.value = ''
  } else if (type === 'c1c2') {
    if (resultC1C2TableRef.value) {
      resultC1C2TableRef.value.clearSelection()
    }
    resultC1C2Data.value = []
    resultC1C2Selection.value = []
    selectedRuleC1C2.value = ''
  } else if (type === 'limit') {
    if (resultLimitTableRef.value) {
      resultLimitTableRef.value.clearSelection()
    }
    resultLimitData.value = []
    resultLimitSelection.value = []
    selectedRuleLimit.value = ''
  }
}

const handleConfirmSave = async () => {
  let ruleName = currentRuleNameForDialog.value
  if (!ruleName) {
    if (!newRuleNameForSave.value.trim()) {
      ElMessage.warning('请输入规则名称')
      return
    }
    ruleName = newRuleNameForSave.value.trim()
  }

  let selectedData = []
  if (pendingSaveType.value === 'b1b2b3d') {
    selectedData = resultSelection.value
  } else if (pendingSaveType.value === 'c1c2') {
    selectedData = resultC1C2Selection.value
  } else if (pendingSaveType.value === 'limit') {
    selectedData = resultLimitSelection.value
  }

  // 增加核查整套规则数据重复功能
  const isDuplicate = await checkDuplicateRule(pendingSaveType.value, ruleName, selectedData)
  if (isDuplicate) {
    return // checkDuplicateRule 内部已经弹窗提示
  }

  // 执行保存
  await executeSave(pendingSaveType.value, ruleName, selectedData)
  
  // 保存后清空当前规则选择
  if (pendingSaveType.value === 'b1b2b3d') {
    selectedRuleB1B2B3D.value = ''
  } else if (pendingSaveType.value === 'c1c2') {
    selectedRuleC1C2.value = ''
  } else if (pendingSaveType.value === 'limit') {
    selectedRuleLimit.value = ''
  }
  
  saveConfirmVisible.value = false
}

// 核查整套规则数据重复功能
const checkDuplicateRule = async (type, ruleName, selectedData) => {
  try {
    let url = ''
    if (type === 'b1b2b3d') url = '/api/S3dCodeB1b2b3dView'
    else if (type === 'c1c2') url = '/api/S3dCodeC1c2View'
    else if (type === 'limit') url = '/api/S3dCodeAb2b3c2View'

    // 这里假设有一个接口可以获取所有规则及其数据，或者逐个对比
    // 为了前端演示，我们先获取所有规则名，然后对比数据
    const ruleNamesRes = await axios.get(`${url.replace('View', '')}/rule-names`)
    const allRuleNames = ruleNamesRes.data?.result || ruleNamesRes.data?.data || []
    
    // 过滤掉当前正在编辑的规则名（如果是修改的话）
    const otherRules = allRuleNames.filter(name => name !== ruleName)

    for (const otherRuleName of otherRules) {
      const res = await axios.get(`${url}/${otherRuleName}`)
      const otherData = res.data?.result || res.data?.data || []
      
      if (otherData.length === selectedData.length) {
        // 简单对比逻辑：将数据转为字符串并排序后对比
        const formatData = (data, t) => {
          return data.map(item => {
            if (t === 'b1b2b3d') return `${item.b1Cl || item.materialsCategoryCl}-${item.b2Cl || item.pipingStandardCl}-${item.b3Cl || item.materialsGradeCl}-${item.dCl || item.scheduleThicknessCl}`
            if (t === 'c1c2') return `${item.c1Cl || item.geometricIndustryStandardCl}-${item.c2Cl || item.pressureRatingCl}`
            if (t === 'limit') return `${item.aCl || item.pipingClassCl}-${item.b2Cl || item.geometricIndustryStandardCl}-${item.b3Cl || item.materialsGradeCl}-${item.c2Cl || item.pressureRatingCl}`
            return ''
          }).sort().join('|')
        }

        if (formatData(selectedData, type) === formatData(otherData, type)) {
          await ElMessageBox.confirm(
            `检测到当前数据与规则 "${otherRuleName}" 完全相同，是否继续保存？`,
            '数据重复提醒',
            { confirmButtonText: '继续保存', cancelButtonText: '取消', type: 'warning' }
          )
          return false // 用户选择继续
        }
      }
    }
    return false
  } catch (error) {
    console.error('核查重复失败:', error)
    return false // 失败则不阻断
  }
}

const handleSaveAsClick = () => {
  saveConfirmVisible.value = false
  newRuleNameForSave.value = ''
  saveAsVisible.value = true
}

const performSaveAs = () => {
  if (!newRuleNameForSave.value.trim()) {
    ElMessage.warning('请输入新规则名称')
    return
  }
  const newName = newRuleNameForSave.value.trim()
  
  if (pendingSaveType.value === 'b1b2b3d') {
     if (!ruleOptionsB1B2B3D.value.includes(newName)) {
        ruleOptionsB1B2B3D.value.push(newName)
     }
     selectedRuleB1B2B3D.value = newName
     executeSave('b1b2b3d', newName, resultSelection.value)
  } else if (pendingSaveType.value === 'c1c2') {
     if (!ruleOptionsC1C2.value.includes(newName)) {
        ruleOptionsC1C2.value.push(newName)
     }
     selectedRuleC1C2.value = newName
     executeSave('c1c2', newName, resultC1C2Selection.value)
  } else if (pendingSaveType.value === 'limit') {
     if (!ruleOptionsLimit.value.includes(newName)) {
        ruleOptionsLimit.value.push(newName)
     }
     selectedRuleLimit.value = newName
     executeSave('limit', newName, resultLimitSelection.value)
  }
  
  saveAsVisible.value = false
}

// Table Refs
const b1Selection = ref('')
const b1Data = ref([])
const resultTableRef = ref(null)
const resultC1C2TableRef = ref(null)
const resultLimitTableRef = ref(null)
const dTableRef = ref(null)
const c2TableRef = ref(null)
const limitB3TableRef = ref(null)
const limitC2TableRef = ref(null)

const fetchB1Data = async () => {
  try {
    const res = await axios.get('/api/S3dCodeMaterialsCategoryPipingStandard/materials-categories')
    const list = res.data.result || res.data.data || res.data
    if (Array.isArray(list)) {
      console.log('B1 Raw List:', list)
      b1Data.value = list.map(item => ({
        code: item.MaterialsCategoryCode || item.materialsCategoryCode || item.code,
        name: item.MaterialsCategoryDesc || item.materialsCategoryDesc || item.name,
        cl: item.MaterialsCategory_CL || item.materialsCategory_CL || item.materialsCategoryCl || item.cl
      })).sort((a, b) => String(a.code).localeCompare(String(b.code)))

      const defaultB1 = b1Data.value.find(x => typeof x.name === 'string' && x.name.includes('碳钢管')) || b1Data.value[0]
      if (defaultB1) {
        b1Selection.value = defaultB1.cl
        b2Data.value = []
        b2Selection.value = ''
        b3Data.value = []
        b3Selection.value = ''
        dData.value = []
        dSelection.value = []
        await fetchB2Data(defaultB1.cl)
        await fetchDData(defaultB1.cl)
      }
    }
  } catch (error) {
    console.error('Failed to fetch B1 data:', error)
    ElMessage.error('获取主材料信息失败')
  }
}

onMounted(() => {
  fetchB1Data()
})

// B2 Data
const b2Selection = ref('')
const b2Data = ref([])

const fetchB2Data = async (materialsCategoryCl) => {
  if (!materialsCategoryCl) return
  
  b2Data.value = []
  b2Selection.value = ''
  
  try {
    const res = await axios.get(`/api/S3dCodeMaterialsCategoryPipingStandard/piping-standards/${materialsCategoryCl}`)
    const list = res.data.result || res.data.data || res.data
    
    if (Array.isArray(list)) {
      console.log('B2 Raw List:', list)
      b2Data.value = list.map(item => ({
        code: item.PipingStandardCode || item.pipingStandardCode || item.code,
        name: item.PipingStandardDesc || item.pipingStandardDesc || item.pipeStandDesc || item.name,
        cl:
          item.GeometricIndustryStandardCl ??
          item.geometricIndustryStandardCl ??
          item.PipingStandardCl ??
          item.pipingStandardCl ??
          item.cl
      })).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }
  } catch (error) {
    console.error('Failed to fetch B2 data:', error)
    ElMessage.error('获取管材标准失败')
  }
}

const fetchLimitB2Data = async () => {
  b2Data.value = []
  b2Selection.value = ''
  c2Data.value = []
  limitC2Selection.value = []
  try {
    const res = await axios.get('/api/S3dCodePipingStandardMaterialsGrade/piping-standards')
    const list = res.data.result || res.data.data || res.data
    if (Array.isArray(list)) {
      console.log('Limit B2 Raw List:', list)
      b2Data.value = list.map(item => ({
        code: item.PipingStandardCode || item.pipingStandardCode || item.code,
        name: item.PipingStandardDesc || item.pipingStandardDesc || item.pipeStandDesc || item.name,
        cl:
          item.GeometricIndustryStandardCl ??
          item.geometricIndustryStandardCl ??
          item.PipingStandardCl ??
          item.pipingStandardCl ??
          item.cl
      })).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }
  } catch (error) {
    console.error('Failed to fetch Limit B2 data:', error)
    ElMessage.error('获取管材标准失败')
  }
}

const fetchLimitC2Data = async (geometricIndustryStandardCl) => {
  if (!geometricIndustryStandardCl) return
  c2Data.value = []
  limitC2Selection.value = []
  try {
    const res = await axios.get(`/api/S3dCodePipingStandardPressureRating/pressure-ratings/${geometricIndustryStandardCl}`)
    const list = res.data.result || res.data.data || res.data
    if (Array.isArray(list)) {
      console.log('Limit C2 Raw List:', list)
      c2Data.value = list.map(item => ({
        code: item.PressureRatingCode || item.pressureRatingCode || item.code,
        name: item.PressureRatingDesc || item.pressureRatingDesc || item.name,
        cl: item.PressureRatingCl || item.pressureRatingCl || item.cl
      })).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }
  } catch (error) {
    console.error('Failed to fetch Limit C2 data:', error)
    ElMessage.error('获取法兰压力等级失败')
  }
}
// B3 Data
const b3Selection = ref('')
const b3Data = ref([])

const fetchB3Data = async (geometricIndustryStandardCl) => {
  if (!geometricIndustryStandardCl) return
  
  b3Data.value = []
  b3Selection.value = ''
  
  try {
    const res = await axios.get(`/api/S3dCodePipingStandardMaterialsGrade/materials-grades/${geometricIndustryStandardCl}`)
    const list = res.data.result || res.data.data || res.data
    if (Array.isArray(list)) {
      console.log('B3 Raw List:', list)
      b3Data.value = list.map(item => ({
        code: item.MaterialsGradeCode || item.materialsGradeCode || item.code,
        name: item.MaterialsGradeDesc || item.materialsGradeDesc || item.name,
        cl: item.MaterialsGradeCl || item.materialsGradeCl || item.cl
      })).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }
  } catch (error) {
    console.error('Failed to fetch B3 data:', error)
    ElMessage.error('获取牌号失败')
  }
}

// D Data
const dSelection = ref([])
const dData = ref([])

const fetchDData = async (MaterialsCategoryCl) => {
  if (!MaterialsCategoryCl) return
  
  dData.value = []
  dSelection.value = []
  
  try {
    const res = await axios.get(`/api/S3dCodeMaterialsCategoryScheduleThickness/schedule-thicknesses/${MaterialsCategoryCl}`)
    const list = res.data.result || res.data.data || res.data
    if (Array.isArray(list)) {
      console.log('D Raw List:', list)
      dData.value = list.map(item => ({
        code: item.ScheduleThicknessCode || item.scheduleThicknessCode || item.code,
        name: item.ScheduleThicknessDesc || item.scheduleThicknessDesc || item.name,
        cl: item.ScheduleThicknessCl || item.scheduleThicknessCl || item.cl
      })).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }
  } catch (error) {
    console.error('Failed to fetch D data:', error)
    ElMessage.error('获取壁厚等级失败')
  }
}

// Result Data
const resultData = ref([])

const generateData = () => {
  const prevIds = resultSelection.value.map(r => r.id)
  if (!b1Selection.value || !b2Selection.value || !b3Selection.value) {
    ElMessage.warning('请先选择 B1, B2, B3')
    return
  }
  if (dSelection.value.length === 0) {
    ElMessage.warning('请至少选择一个 D')
    return
  }

  const b1Item = b1Data.value.find(i => i.cl === b1Selection.value)
  const b2Item = b2Data.value.find(i => i.cl === b2Selection.value)
  const b3Item = b3Data.value.find(i => i.cl === b3Selection.value)

  const duplicates = []
  const existingCombos = []
  
  dSelection.value.forEach(d => {
    const comboKey = `${b1Item?.code}-${b2Item?.code}-${b3Item?.code}-${d.code}`
    
    const existsInResult = resultData.value.some(r => 
      r.b1Code === b1Item?.code &&
      r.b2Code === b2Item?.code &&
      r.b3Code === b3Item?.code &&
      r.dCode === d.code
    )
    
    const existsInNew = existingCombos.some(key => key === comboKey)
    
    if (existsInResult || existsInNew) {
      duplicates.push(comboKey)
    } else {
      existingCombos.push(comboKey)
    }
  })
  
  if (duplicates.length > 0) {
    ElMessage.warning(`发现 ${duplicates.length} 条重复的编码组合，请检查数据！`)
    return
  }

  let newId = resultData.value.length > 0 ? Math.max(...resultData.value.map(r => r.id)) + 1 : 1
  let count = 0
  const newIds = []
  
  dSelection.value.forEach(d => {
    const comboKey = `${b1Item?.code}-${b2Item?.code}-${b3Item?.code}-${d.code}`
    if (!duplicates.includes(comboKey)) {
      const id = newId++
      newIds.push(id)
      resultData.value.push({
        id: id,
        b1Code: b1Item?.code,
        b1Cl: b1Item?.cl,
        b2Code: b2Item?.code,
        b2Cl: b2Item?.cl,
        b3Code: b3Item?.code,
        b3Cl: b3Item?.cl,
        dCode: d.code,
        dCl: d.cl
      })
      count++
    }
  })
  
  ElMessage.success(`生成成功，新增 ${count} 条数据`)
  
  if (resultTableRef.value) {
    nextTick(() => {
      resultTableRef.value.clearSelection()
      resultData.value.forEach(row => {
        if (newIds.includes(row.id)) {
          resultTableRef.value.toggleRowSelection(row, true)
        }
      })
    })
  }
}

const saveData = () => {
  if (resultSelection.value.length === 0) {
    ElMessage.warning('请选择要保存的数据（请勾选表格左侧复选框）')
    return
  }
  newRuleNameForSave.value = ''
  pendingSaveType.value = 'b1b2b3d'
  saveConfirmVisible.value = true
}

const fetchRuleNames = async (type) => {
  let url = ''
  if (type === 'limit') {
    url = '/api/S3dRuleAb2b3c2/rule-names'
  } else if (type === 'c1c2') {
    url = '/api/S3dRuleC1c2/rule-names'
  } else {
    url = '/api/S3dRuleB1b2b3d/rule-names'
  }
  try {
    const res = await axios.get(url)
    const list = res.data?.result || res.data?.data || res.data || []
    const names = Array.isArray(list)
      ? list.map(i => typeof i === 'string' ? i : (i.ruleName || i.RuleName || i.name || i.value)).filter(Boolean)
      : []
    
    if (type === 'limit') {
      ruleOptionsLimit.value = names
      if (selectedRuleLimit.value && !ruleOptionsLimit.value.includes(selectedRuleLimit.value)) {
        selectedRuleLimit.value = ''
      }
    } else if (type === 'c1c2') {
      ruleOptionsC1C2.value = names
      if (selectedRuleC1C2.value && !ruleOptionsC1C2.value.includes(selectedRuleC1C2.value)) {
        selectedRuleC1C2.value = ''
      }
    } else {
      ruleOptionsB1B2B3D.value = names
      if (selectedRuleB1B2B3D.value && !ruleOptionsB1B2B3D.value.includes(selectedRuleB1B2B3D.value)) {
        selectedRuleB1B2B3D.value = ''
      }
    }
  } catch (e) {
    ElMessage.error('获取规则列表失败')
  }
}

const handleRuleDropdownVisibleChangeB1B2B3D = (visible) => {
  if (visible) fetchRuleNames('b1b2b3d')
}
const handleRuleDropdownVisibleChangeC1C2 = (visible) => {
  if (visible) fetchRuleNames('c1c2')
}

const handleRuleChangeC1C2 = async (ruleName) => {
  if (!ruleName) {
    resetRightPane('c1c2')
    return
  }
  try {
    const res = await axios.get(`/api/S3dCodeC1c2View/${ruleName}`)
    const list = res.data?.result || res.data?.data || res.data || []
    if (Array.isArray(list)) {
      resultC1C2Data.value = list.map((item, index) => ({
        id: index + 1,
        c1Code: item.geometricIndustryStandardCode || item.GeometricIndustryStandardCode || item.flangeStandardCode,
        c1Cl: item.geometricIndustryStandardCl || item.GeometricIndustryStandardCl || item.GeometricIndustryStandard_CL,
        c2Code: item.pressureRatingCode || item.PressureRatingCode,
        c2Cl: item.pressureRatingCl || item.PressureRatingCl || item.PressureRating_CL
      }))
      await nextTick()
      if (resultC1C2TableRef.value) {
        resultC1C2TableRef.value.clearSelection()
        resultC1C2TableRef.value.toggleAllSelection()
      }
      ElMessage.success(`已加载规则 "${ruleName}" 的数据`)
    }
  } catch (error) {
    console.error('Failed to fetch rule data:', error)
    ElMessage.error('获取规则数据失败')
  }
}
const handleRuleDropdownVisibleChangeLimit = (visible) => {
  if (visible) fetchRuleNames('limit')
}

const handleRuleChangeB1B2B3D = async (ruleName) => {
  if (!ruleName) {
    resetRightPane('b1b2b3d')
    return
  }
  try {
    const res = await axios.get(`/api/S3dCodeB1b2b3dView/${ruleName}`)
    const list = res.data?.result || res.data?.data || res.data || []
    if (Array.isArray(list)) {
      resultData.value = list.map((item, index) => ({
        id: index + 1,
        b1Code: item.materialsCategoryCode || item.MaterialsCategoryCode,
        b1Cl: item.materialsCategoryCl || item.geometricIndustryStandardCode || item.MaterialsCategory_CL,
        b2Code: item.pipingStandardCode || item.PipingStandardCode,
        b2Cl: item.pipingStandardCl || item.PipingStandardCl || item.PipingStandard_CL || item.geometricIndustryStandardCl,
        b3Code: item.materialsGradeCode || item.MaterialsGradeCode,
        b3Cl: item.materialsGradeCl || item.MaterialsGradeCl || item.MaterialsGrade_CL,
        dCode: item.scheduleThicknessCode || item.ScheduleThicknessCode,
        dCl: item.scheduleThicknessCl || item.ScheduleThicknessCl || item.ScheduleThickness_CL
      }))
      await nextTick()
      if (resultTableRef.value) {
        resultTableRef.value.clearSelection()
        resultTableRef.value.toggleAllSelection()
      }
      ElMessage.success(`已加载规则 "${ruleName}" 的数据`)
    }
  } catch (error) {
    console.error('Failed to fetch rule data:', error)
    ElMessage.error('获取规则数据失败')
  }
}

const handleRuleChangeLimit = async (ruleName) => {
  if (!ruleName) {
    resetRightPane('limit')
    return
  }
  try {
    const res = await axios.get(`/api/S3dCodeAb2b3c2View/${ruleName}`)
    const list = res.data?.result || res.data?.data || res.data || []
    if (Array.isArray(list)) {
      resultLimitData.value = list.map((item, index) => ({
        id: index + 1,
        aCode: item.pipeClass || item.pipingClassCode,
        aCl: item.pipingClassCl,
        b2Code: item.pipingStandardCode || item.PipingStandardCode,
        b2Cl: item.pipingStandardCl || item.geometricIndustryStandardCl || item.PipingStandard_CL,
        b3Code: item.materialsGradeCode || item.MaterialsGradeCode,
        b3Cl: item.materialsGradeCl || item.MaterialsGradeCl || item.MaterialsGrade_CL,
        c2Code: item.pressureRatingCode || item.PressureRatingCode,
        c2Cl: item.pressureRatingCl || item.PressureRatingCl || item.PressureRating_CL
      }))
      await nextTick()
      if (resultLimitTableRef.value) {
        resultLimitTableRef.value.clearSelection()
        resultLimitTableRef.value.toggleAllSelection()
      }
      ElMessage.success(`已加载规则 "${ruleName}" 的数据`)
    }
  } catch (error) {
    console.error('Failed to fetch rule data:', error)
    ElMessage.error('获取规则数据失败')
  }
}

const handleB1Change = (row) => {
  if (row) {
    b1Selection.value = row.cl
    dData.value = []
    dSelection.value = []
    fetchB2Data(row.cl)
    fetchDData(row.cl)
  }
}

watch(activeTab, (val) => {
  if (val === 'limit') {
    fetchLimitAData()
    fetchLimitB2Data()
  } else if (val === 'c1c2') {
    fetchC1Data()
  } else if (val === 'b1b2b3d') {
    // 重新初始化 B1B2B3D
    b1Data.value = []
    b1Selection.value = ''
    b2Data.value = []
    b2Selection.value = ''
    b3Data.value = []
    b3Selection.value = ''
    dData.value = []
    dSelection.value = []
    fetchB1Data()
  }
})

const handleB2Change = (row) => {
   if(row) {
     b2Selection.value = row.cl
     fetchB3Data(row.cl)
   }
}

const handleB3Change = (row) => {
   if(row) b3Selection.value = row.cl
}

const handleDChange = (selection) => {
  dSelection.value = selection
}

const handleDRowClick = (row, column) => {
  if (column && column.type === 'selection') return
  if (!dTableRef.value) return
  dTableRef.value.toggleRowSelection(row)
}

const handleResultRowClick = async (row, column) => {
  if (!row) return

  const b1 = b1Data.value.find(i => i.cl === row.b1Cl)
  if (b1) {
    b1Selection.value = b1.cl
    await Promise.all([
      fetchB2Data(b1.cl),
      fetchDData(b1.cl)
    ])
  }

  const b2 = b2Data.value.find(i => i.cl === row.b2Cl)
  if (b2) {
    b2Selection.value = b2.cl
    await fetchB3Data(b2.cl)
  }

  const b3 = b3Data.value.find(i => i.cl === row.b3Cl)
  if (b3) b3Selection.value = b3.cl
  
  if (dTableRef.value) {
    dTableRef.value.clearSelection()
    const targetD = dData.value.find(item => item.cl === row.dCl)
    if (targetD) {
      dTableRef.value.toggleRowSelection(targetD, true)
    }
  }

  if (column && column.type === 'selection') return
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
const c1Data = ref([])

const fetchC1Data = async () => {
  try {
    const res = await axios.get('/api/S3dCodeFlangeStandPressureRating/flange-standards')
    const list = res.data.result || res.data.data || res.data
    if (Array.isArray(list)) {
      console.log('C1 Raw List:', list)
      c1Data.value = list.map(item => ({
        code: item.FlangeStandardCode || item.flangeStandardCode || item.code,
        name: item.FlangeStandDesc || item.flangeStandDesc || item.name,
        cl: item.GeometricIndustryStandardCl || item.geometricIndustryStandardCl || item.cl
      })).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }
  } catch (error) {
    console.error('Failed to fetch C1 data:', error)
    ElMessage.error('获取法兰标准失败')
  }
}

// C2 Data
const c2Selection = ref([])
const c2Data = ref([])

const fetchC2Data = async (geometricIndustryStandardCl) => {
  if (!geometricIndustryStandardCl) return
  
  c2Data.value = []
  c2Selection.value = []
  
  try {
    const res = await axios.get(`/api/S3dCodeFlangeStandPressureRating/pressure-ratings/${geometricIndustryStandardCl}`)
    const list = res.data.result || res.data.data || res.data
    if (Array.isArray(list)) {
      console.log('C2 Raw List:', list)
      c2Data.value = list.map(item => ({
        code: item.PressureRatingCode || item.pressureRatingCode || item.code,
        name: item.PressureRatingDesc || item.pressureRatingDesc || item.name,
        cl: item.PressureRatingCl || item.pressureRatingCl || item.cl
      })).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }
  } catch (error) {
    console.error('Failed to fetch C2 data:', error)
    ElMessage.error('获取压力等级失败')
  }
}

// Result C1C2 Data
const resultC1C2Data = ref([])

const generateC1C2Data = () => {
  const prevIds = resultC1C2Selection.value.map(r => r.id)
  if (!c1Selection.value) {
    ElMessage.warning('请先选择 C1')
    return
  }
  if (c2Selection.value.length === 0) {
    ElMessage.warning('请至少选择一个 C2')
    return
  }

  const c1Item = c1Data.value.find(i => i.cl === c1Selection.value)

  const duplicates = []
  const existingCombos = []
  
  c2Selection.value.forEach(c2 => {
    const comboKey = `${c1Item?.code}-${c2.code}`
    
    const existsInResult = resultC1C2Data.value.some(r => 
      r.c1Code === c1Item?.code &&
      r.c2Code === c2.code
    )
    
    const existsInNew = existingCombos.some(key => key === comboKey)
    
    if (existsInResult || existsInNew) {
      duplicates.push(comboKey)
    } else {
      existingCombos.push(comboKey)
    }
  })
  
  if (duplicates.length > 0) {
    ElMessage.warning(`发现 ${duplicates.length} 条重复的编码组合，请检查数据！`)
    return
  }

  let newId = resultC1C2Data.value.length > 0 ? Math.max(...resultC1C2Data.value.map(r => r.id)) + 1 : 1
  let count = 0
  const newIds = []
  
  c2Selection.value.forEach(c2 => {
    const comboKey = `${c1Item?.code}-${c2.code}`
    if (!duplicates.includes(comboKey)) {
      const id = newId++
      newIds.push(id)
      resultC1C2Data.value.push({
        id: id,
        c1Code: c1Item?.code,
        c1Cl: c1Item?.cl,
        c2Code: c2.code,
        c2Cl: c2.cl
      })
      count++
    }
  })
  
  ElMessage.success(`生成成功，新增 ${count} 条数据`)
  if (resultC1C2TableRef.value) {
    nextTick(() => {
      resultC1C2TableRef.value.clearSelection()
      resultC1C2Data.value.forEach(row => {
        if (newIds.includes(row.id)) {
          resultC1C2TableRef.value.toggleRowSelection(row, true)
        }
      })
    })
  }
}

const saveC1C2Data = () => {
  if (resultC1C2Selection.value.length === 0) {
    ElMessage.warning('请选择要保存的数据（请勾选表格左侧复选框）')
    return
  }
  newRuleNameForSave.value = ''
  pendingSaveType.value = 'c1c2'
  saveConfirmVisible.value = true
}

const handleC1Change = (row) => {
  if(row) {
    c1Selection.value = row.cl
    fetchC2Data(row.cl)
  }
}

const handleC2Change = (selection) => {
  c2Selection.value = selection
}

const handleC2RowClick = (row, column) => {
  if (column && column.type === 'selection') return
  if (!c2TableRef.value) return
  c2TableRef.value.toggleRowSelection(row)
}

const handleResultC1C2RowClick = async (row, column) => {
  if (!row) return

  const c1 = c1Data.value.find(i => i.cl === row.c1Cl)
  if (c1) {
    c1Selection.value = c1.cl
    await fetchC2Data(c1.cl)
  }
  
  if (c2TableRef.value) {
    c2TableRef.value.clearSelection()
    const targetC2 = c2Data.value.find(item => item.cl === row.c2Cl)
    if (targetC2) {
      c2TableRef.value.toggleRowSelection(targetC2, true)
    }
  }

  if (column && column.type === 'selection') return
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

const aData = ref([])

const fetchLimitAData = async () => {
  aData.value = []
  limitASelection.value = ''
  try {
    const res = await axios.get('/api/S3dCodePipingClassView')
    const list = res.data?.result || res.data?.data || res.data || []
    if (Array.isArray(list)) {
      console.log('Limit A Raw List:', list)
      aData.value = list.map(item => {
        const rawCode =
          item.pipingClassCode ||
          item.PipeClassCode ||
          item.PipeClass ||
          item.code
        const rawName =
          item.shortStringValue ||
          item.pipeClassDesc ||
          item.pipeClass ||
          item.name
        const rawCl = item.codeListNumber || item.pipingClass_CL || item.cl
        return {
          code: rawCode != null ? String(rawCode).trim() : '',
          name: rawName != null ? String(rawName).trim() : '',
          cl: rawCl != null ? rawCl : ''
        }
      }).sort((a, b) => String(a.code).localeCompare(String(b.code)))
    }
  } catch (error) {
    console.error('Failed to fetch Limit A data:', error)
    ElMessage.error('获取管材等级失败')
  }
}

const resultLimitData = ref([])

const generateLimitData = () => {
  const prevIds = resultLimitSelection.value.map(r => r.id)
  if (!limitASelection.value) {
     ElMessage.warning('请选择 A 管材等级')
     return
  }

  const aItem = aData.value.find(i => i.code === limitASelection.value)
  const normalizedASelection =
    limitASelection.value != null ? String(limitASelection.value).trim() : ''
  const isClassThree =
    (aItem &&
      (aItem.code === '3' ||
        aItem.cl === '3')) ||
    normalizedASelection === '3'

  // Special logic for Class III
  if (isClassThree) {
     const currentACode =
       aItem && aItem.code != null ? String(aItem.code).trim() : normalizedASelection
     const currentACl =
       aItem && aItem.cl != null ? aItem.cl : normalizedASelection
     const exists = resultLimitData.value.some(r => {
       const existingACode = r.aCode != null ? String(r.aCode).trim() : ''
       return existingACode === currentACode
     })
     if (!exists) {
        let newId = resultLimitData.value.length > 0 ? Math.max(...resultLimitData.value.map(r => r.id)) + 1 : 1
        resultLimitData.value.push({
          id: newId,
          aCode: currentACode,
          aCl: currentACl,
          b2Code: '',
          b2Cl: '',
          b3Code: '',
          b3Cl: '',
          c2Code: '',
          c2Cl: ''
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

  const b2Item = b2Data.value.find(i => i.cl === limitB2Selection.value)

  const duplicates = []
  const existingCombos = []

  limitB3Selection.value.forEach(b3 => {
    limitC2Selection.value.forEach(c2 => {
      const comboKey = `${limitASelection.value}-${b2Item?.code}-${b3.code}-${c2.code}`
      
      const existsInResult = resultLimitData.value.some(r => 
        r.aCode === limitASelection.value &&
        r.b2Code === b2Item?.code &&
        r.b3Code === b3.code &&
        r.c2Code === c2.code
      )
      
      const existsInNew = existingCombos.some(key => key === comboKey)
      
      if (existsInResult || existsInNew) {
        duplicates.push(comboKey)
      } else {
        existingCombos.push(comboKey)
      }
    })
  })
  
  if (duplicates.length > 0) {
    ElMessage.warning(`发现 ${duplicates.length} 条重复的编码组合，请检查数据！`)
    return
  }

  const newIds = []

  limitB3Selection.value.forEach(b3 => {
    limitC2Selection.value.forEach(c2 => {
      const comboKey = `${limitASelection.value}-${b2Item?.code}-${b3.code}-${c2.code}`
      if (!duplicates.includes(comboKey)) {
        const id = newId++
        newIds.push(id)
        resultLimitData.value.push({
          id: id,
          aCode: aItem?.code || limitASelection.value,
          aCl: aItem?.cl,
          b2Code: b2Item?.code,
          b2Cl: b2Item?.cl,
          b3Code: b3.code,
          b3Cl: b3.cl,
          c2Code: c2.code,
          c2Cl: c2.cl
        })
        count++
      }
    })
  })

  ElMessage.success(`生成成功，新增 ${count} 条数据`)
  if (resultLimitTableRef.value) {
    nextTick(() => {
      resultLimitTableRef.value.clearSelection()
      resultLimitData.value.forEach(row => {
        if (newIds.includes(row.id)) {
          resultLimitTableRef.value.toggleRowSelection(row, true)
        }
      })
    })
  }
}

const saveLimitData = () => {
  if (resultLimitSelection.value.length === 0) {
    ElMessage.warning('请选择要保存的数据（请勾选表格左侧复选框）')
    return
  }
  newRuleNameForSave.value = ''
  pendingSaveType.value = 'limit'
  saveConfirmVisible.value = true
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
  if (row) {
    limitB2Selection.value = row.cl
    fetchB3Data(row.cl)
    fetchLimitC2Data(row.cl)
  }
}

const handleLimitB3Change = (selection) => {
  limitB3Selection.value = selection
}

const handleLimitC2Change = (selection) => {
  limitC2Selection.value = selection
}

const handleLimitB3RowClick = (row, column) => {
  if (column && column.type === 'selection') return
  if (!limitB3TableRef.value) return
  limitB3TableRef.value.toggleRowSelection(row)
}

const handleLimitC2RowClick = (row, column) => {
  if (column && column.type === 'selection') return
  if (!limitC2TableRef.value) return
  limitC2TableRef.value.toggleRowSelection(row)
}

const handleResultLimitRowClick = async (row, column) => {
  if (!row) return

  limitASelection.value = row.aCode
  
  const b2 = b2Data.value.find(i => i.cl === row.b2Cl)
  if (b2) {
    limitB2Selection.value = b2.cl
    await Promise.all([
      fetchB3Data(b2.cl),
      fetchLimitC2Data(b2.cl)
    ])
  }
  
  if (limitB3TableRef.value) {
    limitB3TableRef.value.clearSelection()
    const targetB3 = b3Data.value.find(item => item.cl === row.b3Cl)
    if (targetB3) {
      limitB3TableRef.value.toggleRowSelection(targetB3, true)
    }
  }

  if (limitC2TableRef.value) {
    limitC2TableRef.value.clearSelection()
    const targetC2 = c2Data.value.find(item => item.cl === row.c2Cl)
    if (targetC2) {
      limitC2TableRef.value.toggleRowSelection(targetC2, true)
    }
  }

  if (column && column.type === 'selection') return
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

const confirmDeleteRule = () => {
  let currentRule = ''
  if (activeTab.value === 'b1b2b3d') {
    currentRule = selectedRuleB1B2B3D.value
  } else if (activeTab.value === 'c1c2') {
    currentRule = selectedRuleC1C2.value
  } else if (activeTab.value === 'limit') {
    currentRule = selectedRuleLimit.value
  }

  if (!currentRule) {
    ElMessage.warning('请先选择要删除的规则')
    return
  }
  const name = currentRule
  ElMessageBox.confirm(
    `确定删除当前规则 "${name}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        let url = ''
        if (activeTab.value === 'b1b2b3d') {
          url = `/api/S3dRuleB1b2b3d/${encodeURIComponent(name)}`
        } else if (activeTab.value === 'c1c2') {
          url = `/api/S3dRuleC1c2/${encodeURIComponent(name)}`
        } else if (activeTab.value === 'limit') {
          url = `/api/S3dRuleAb2b3c2/${encodeURIComponent(name)}`
        }
        if (!url) return
        const res = await axios.delete(url)
        const ok = res.status >= 200 && res.status < 300
        if (!ok) {
          ElMessage.error(res.data?.message || res.data?.msg || '规则删除失败')
          return
        }
        if (activeTab.value === 'b1b2b3d') {
          ruleOptionsB1B2B3D.value = ruleOptionsB1B2B3D.value.filter(r => r !== name)
          selectedRuleB1B2B3D.value = ''
          resultData.value = []
          resultSelection.value = []
        } else if (activeTab.value === 'c1c2') {
          ruleOptionsC1C2.value = ruleOptionsC1C2.value.filter(r => r !== name)
          selectedRuleC1C2.value = ''
          resultC1C2Data.value = []
          resultC1C2Selection.value = []
        } else if (activeTab.value === 'limit') {
          ruleOptionsLimit.value = ruleOptionsLimit.value.filter(r => r !== name)
          selectedRuleLimit.value = ''
          resultLimitData.value = []
          resultLimitSelection.value = []
        }
        ElMessage.success('规则删除成功')
      } catch (error) {
        console.error(error)
        ElMessage.error('规则删除请求失败')
      }
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

/* Custom layout for B1B2B3D tab */
.layout-b1b2b3d .left-pane {
  width: 50%;
  flex: 0 0 50%;
}

.layout-b1b2b3d .right-pane {
  width: 50%;
  flex: 0 0 50%;
  min-width: 0;
}

/* Custom layout for C1C2 tab */
.layout-c1c2 .left-pane {
  width: 50%;
  flex: 0 0 50%;
}

.layout-c1c2 .right-pane {
  width: 50%;
  flex: 0 0 50%;
  min-width: 0;
}

/* Custom layout for Limit tab */
.layout-limit .left-pane {
  width: 50%;
  flex: 0 0 50%;
}

.layout-limit .right-pane {
  width: 50%;
  flex: 0 0 50%;
  min-width: 0;
}

.pane-toolbar {
  padding: 5px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
