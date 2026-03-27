import Mock from 'mockjs'
import { db } from '@/apps/design-rule/mock/index.js'

Mock.mock(/\/api\/product-standard\/codelist\/tree/, 'get', () => {
  return { code: 200, data: db['codelist-tree'].data, message: 'success' }
})

Mock.mock(/\/api\/product-standard\/codelist\/table-data/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const nodeLabel = url.searchParams.get('nodeLabel') || ''

  if (/MaterialsGrade/i.test(nodeLabel)) {
    const data = db['library-codelist-hierarchy-materials-grade']
    const uniqueMap = new Map()
    data.rows.forEach((row) => {
      if (!uniqueMap.has(row.level1ShortDesc)) {
        uniqueMap.set(row.level1ShortDesc, {
          shortDesc: row.level1ShortDesc,
          longDesc: row.level1LongDesc,
          codeNum: row.level1CodeNum,
          status: row.level1Status
        })
      }
    })
    return {
      code: 200,
      data: {
        count: 3,
        level1: data.names.level1,
        level2: data.names.level2,
        level3: data.names.level3,
        levelData: Array.from(uniqueMap.values())
      },
      message: 'success'
    }
  }

  if (/PressureRating/i.test(nodeLabel)) {
    const data = db['library-codelist-hierarchy-pressure-rating']
    const uniqueMap = new Map()
    data.rows.forEach((row) => {
      if (!uniqueMap.has(row.level1ShortDesc)) {
        uniqueMap.set(row.level1ShortDesc, {
          shortDesc: row.level1ShortDesc,
          longDesc: row.level1LongDesc,
          codeNum: row.level1CodeNum,
          status: row.level1Status
        })
      }
    })
    return {
      code: 200,
      data: {
        count: 2,
        level1: data.names.level1,
        level2: data.names.level2,
        level3: data.names.level3,
        levelData: Array.from(uniqueMap.values())
      },
      message: 'success'
    }
  }

  if (/FlowDirection/i.test(nodeLabel)) {
    return {
      code: 200,
      data: {
        count: 1,
        level1: 'FlowDirection',
        level2: '',
        level3: '',
        levelData: db['codelist-table-data']
      },
      message: 'success'
    }
  }

  if (/BoltType/i.test(nodeLabel)) {
    return {
      code: 200,
      data: {
        count: 1,
        level1: 'BoltType',
        level2: '',
        level3: '',
        levelData: db['codelist-table-data-bolt-type']
      },
      message: 'success'
    }
  }

  return {
    code: 200,
    data: { count: 1, level1: nodeLabel, level2: '', level3: '', levelData: [] },
    message: 'success'
  }
})

Mock.mock(/\/api\/product-standard\/codelist\/child-data/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const levelName = url.searchParams.get('levelName') || ''
  const shortDesc = url.searchParams.get('shortDesc') || ''

  if (!levelName || !shortDesc) {
    return { code: 200, data: { levelData: [] }, message: 'success' }
  }

  if (/MaterialsGradePractice/i.test(levelName)) {
    const data = db['library-codelist-hierarchy-materials-grade']
    const uniqueMap = new Map()
    data.rows
      .filter((row) => row.level1ShortDesc === shortDesc)
      .forEach((row) => {
        if (!uniqueMap.has(row.level2ShortDesc)) {
          uniqueMap.set(row.level2ShortDesc, {
            shortDesc: row.level2ShortDesc,
            longDesc: row.level2LongDesc,
            codeNum: row.level2CodeNum,
            status: row.level2Status
          })
        }
      })
    return { code: 200, data: { levelData: Array.from(uniqueMap.values()) }, message: 'success' }
  }

  if (/MaterialsCategory/i.test(levelName)) {
    const data = db['library-codelist-hierarchy-materials-grade']
    const rows = data.rows
      .filter((row) => row.level2ShortDesc === shortDesc)
      .map((row) => ({
        shortDesc: row.level3ShortDesc,
        longDesc: row.level3LongDesc,
        codeNum: row.level3CodeNum,
        status: row.status
      }))
    return { code: 200, data: { levelData: rows }, message: 'success' }
  }

  if (/PressureSystem/i.test(levelName)) {
    const data = db['library-codelist-hierarchy-pressure-rating']
    const rows = data.rows
      .filter((row) => row.level1ShortDesc === shortDesc)
      .map((row) => ({
        shortDesc: row.level2ShortDesc,
        longDesc: row.level2LongDesc,
        codeNum: row.level2CodeNum,
        status: row.status
      }))
    return { code: 200, data: { levelData: rows }, message: 'success' }
  }

  return { code: 200, data: { levelData: [] }, message: 'success' }
})

Mock.mock(/\/api\/product-standard\/codelist\/save-item/, 'post', (options) => {
  const body = JSON.parse(options.body || '{}')
  const parentLabelName = String(body.parentLabelName || '').trim()
  const parentShortDesc = String(body.parentShortDesc || '').trim()
  const shortDesc = String(body.shortDesc || '').trim()
  const longDesc = String(body.longDesc || '').trim()
  const codeNum = String(body.codeNum ?? '').trim()

  const makeConflict = () => ({ code: 409, message: 'Codelist codeNum 已存在', data: null })

  if (!codeNum) {
    return { code: 400, message: 'codeNum 不能为空', data: null }
  }

  if (/MaterialsGradePractice|MaterialsCategory/i.test(parentLabelName)) {
    const data = db['library-codelist-hierarchy-materials-grade']
    const exists = data.rows.some((row) =>
      String(row.level1CodeNum ?? '') === codeNum ||
      String(row.level2CodeNum ?? '') === codeNum ||
      String(row.level3CodeNum ?? '') === codeNum
    )
    if (exists) return makeConflict()

    if (/MaterialsCategory/i.test(parentLabelName)) {
      data.rows.push({
        level1ShortDesc: '',
        level1LongDesc: '',
        level1CodeNum: '',
        level1Status: 1,
        level2ShortDesc: parentShortDesc,
        level2LongDesc: parentShortDesc,
        level2CodeNum: '',
        level2Status: 1,
        level3ShortDesc: shortDesc,
        level3LongDesc: longDesc,
        level3CodeNum: Number.isNaN(Number(codeNum)) ? codeNum : Number(codeNum),
        status: 1
      })
    }

    return {
      code: 200,
      message: '保存成功',
      data: { parentLabelName, parentShortDesc, shortDesc, longDesc, codeNum }
    }
  }

  if (/PressureSystem/i.test(parentLabelName)) {
    const data = db['library-codelist-hierarchy-pressure-rating']
    const exists = data.rows.some((row) =>
      String(row.level1CodeNum ?? '') === codeNum ||
      String(row.level2CodeNum ?? '') === codeNum
    )
    if (exists) return makeConflict()

    data.rows.push({
      level1ShortDesc: parentShortDesc,
      level1LongDesc: parentShortDesc,
      level1CodeNum: '',
      level1Status: 1,
      level2ShortDesc: shortDesc,
      level2LongDesc: longDesc,
      level2CodeNum: Number.isNaN(Number(codeNum)) ? codeNum : Number(codeNum),
      status: 1
    })

    return {
      code: 200,
      message: '保存成功',
      data: { parentLabelName, parentShortDesc, shortDesc, longDesc, codeNum }
    }
  }

  const singleSets = [db['codelist-table-data'], db['codelist-table-data-bolt-type']]
  const exists = singleSets.some((rows) => rows.some((row) => String(row.codeNum ?? '') === codeNum))
  if (exists) return makeConflict()

  db['codelist-table-data'].push({
    shortDesc,
    longDesc,
    codeNum: Number.isNaN(Number(codeNum)) ? codeNum : Number(codeNum),
    status: 1
  })

  return {
    code: 200,
    message: '保存成功',
    data: { parentLabelName, parentShortDesc, shortDesc, longDesc, codeNum }
  }
})

Mock.mock(/\/api\/product-standard\/codelist\/next-code-num/, 'get', () => {
  return { code: 200, data: { nextCodeNum: 10001 }, message: 'success' }
})
