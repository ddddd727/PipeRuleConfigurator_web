import Mock from 'mockjs'
import { db } from '@/apps/design-rule/mock/index.js'

Mock.mock(/\/api\/product-standard\/piping-spec\/tree/, 'get', () => {
  return { code: 200, data: db['library-tree'].data, message: 'success' }
})

Mock.mock(/\/api\/product-standard\/piping-spec\/component-base-data/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const nodeLabel = url.searchParams.get('nodeLabel')
  const category = url.searchParams.get('category')

  let rows = []
  if (category === 'pipe') rows = db['library-component-base-data-pipe']
  else if (category === 'bolt') rows = db['library-component-base-data-bolt']
  else if (category === 'gasket') rows = db['library-component-base-data-gasket']
  else if (category === 'nut') rows = db['library-component-base-data-nut']
  else if (category === 'washer') rows = db['library-component-base-data-washer']
  else if (category === 'pipeComponent') {
    rows = nodeLabel && nodeLabel.includes('45DegElbow')
      ? db['library-component-base-data-pipeComponent-elbow']
      : db['library-component-base-data-pipeComponent-sleeve']
  }

  return { code: 200, data: rows, message: 'success' }
})

Mock.mock(/\/api\/product-standard\/piping-spec\/component-common-data/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const nodeLabel = url.searchParams.get('nodeLabel')
  const category = url.searchParams.get('category')
  const industryCommodityCode = url.searchParams.get('IndustryCommodityCode') || url.searchParams.get('ccCode')
  const scheduleThickness = url.searchParams.get('scheduleThickness')

  let rows = []
  if (category === 'pipe') rows = db['library-common-data-pipe']
  else if (category === 'bolt') rows = db['library-common-data-bolt']
  else if (category === 'gasket') rows = db['library-common-data-gasket']
  else if (category === 'nut') rows = db['library-common-data-nut']
  else if (category === 'washer') rows = db['library-common-data-washer']
  else if (category === 'pipeComponent') {
    rows = nodeLabel && nodeLabel.includes('45DegElbow')
      ? db['library-common-data-pipeComponent-elbow']
      : db['library-common-data-pipeComponent-sleeve']
  }

  const filtered = (rows || []).filter((row) => {
    if (industryCommodityCode && row.IndustryCommodityCode !== industryCommodityCode) return false
    if (scheduleThickness) {
      const value1 = row['ScheduleThickness[1]']
      const value2 = row['ScheduleThickness[2]']
      if ((value1 || value2) && value1 !== scheduleThickness && value2 !== scheduleThickness) return false
    }
    return true
  })

  return { code: 200, data: filtered, message: 'success' }
})

Mock.mock(/\/api\/product-standard\/piping-spec\/component-appearance-data/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const nodeLabel = url.searchParams.get('nodeLabel')
  const category = url.searchParams.get('category')
  const industryCommodityCode = url.searchParams.get('IndustryCommodityCode') || url.searchParams.get('ccCode')
  const scheduleThickness = url.searchParams.get('scheduleThickness')

  let rows = []
  if (category === 'pipe') rows = db['library-appearance-data-pipe']
  else if (category === 'pipeComponent') {
    rows = nodeLabel && nodeLabel.includes('45DegElbow')
      ? db['library-appearance-data-pipeComponent-elbow']
      : db['library-appearance-data-pipeComponent-sleeve']
  }

  const filtered = (rows || []).filter((row) => {
    if (industryCommodityCode && row.IndustryCommodityCode !== industryCommodityCode) return false
    if (scheduleThickness) {
      const value1 = row['ScheduleThickness[1]']
      const value2 = row['ScheduleThickness[2]']
      if ((value1 || value2) && value1 !== scheduleThickness && value2 !== scheduleThickness) return false
    }
    return true
  })

  return { code: 200, data: filtered, message: 'success' }
})

Mock.mock(/\/api\/product-standard\/piping-spec\/base-options/, 'get', () => {
  return {
    code: 200,
    data: {
      manufacturingStdOptions: ['GB/T 14976-2012', 'Q/SWS 34-003.2-2021', 'GB/T 5782', 'GB/T 6170', 'GB/T 97.1', 'Q/SWS 34-010-2021'],
      ccCodeOptions: ['PIPE001', 'PIPE002', 'BOLT001', 'NUT-41-5-M10', 'WASHER001', 'PCSSA23', 'PCSEL45'],
      scheduleThicknessOptions: ['Sch.40', 'Sch.80', 'Sch.160', 'STD', 'XS', 'XXS'],
      materialGradeOptions: ['316L', '304SS', '20#', 'A193 B7', 'Carbon Steel', 'Stainless Steel']
    },
    message: 'success'
  }
})

Mock.mock(/\/api\/product-standard\/piping-spec\/save-component-base/, 'post', (options) => {
  const body = JSON.parse(options.body || '{}')
  const { isSaveAs, newNodeData, oldNodeLabel, category } = body

  if (isSaveAs) {
    const parts = String(oldNodeLabel || '').split('|')
    if (parts.length >= 4) {
      const newPath = {
        level1: parts[0],
        level2: parts[1],
        level3: newNodeData.manufacturingStd,
        level4: parts[3],
        category
      }
      db['library-tree'].data.push(newPath)

      let baseKey = `library-component-base-data-${category}`
      if (category === 'pipeComponent') {
        const subType = parts[3].includes('45DegElbow') ? 'elbow' : 'sleeve'
        baseKey = `library-component-base-data-pipeComponent-${subType}`
      }

      if (db[baseKey]) {
        db[baseKey].push({
          IndustryCommodityCode: newNodeData.IndustryCommodityCode || newNodeData.ccCode,
          ScheduleThickness: newNodeData.scheduleThickness,
          MaterialGrade: newNodeData.material,
          GeometricIndustryStandard: newNodeData.manufacturingStd,
          status: 1
        })
      }

      return {
        code: 200,
        message: '另存为成功',
        data: {
          newPath: `${newPath.level1}|${newPath.level2}|${newPath.level3}|${newPath.level4}`
        }
      }
    }
  }

  return { code: 200, message: '保存成功' }
})
