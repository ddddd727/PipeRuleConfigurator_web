const THICKNESS_LEVEL_DESCRIPTION_MAP = {
  D1: '普通壁厚',
  D2: '加厚壁厚',
  D3: '重型壁厚',
  S1: '不锈钢轻系列',
  S2: '不锈钢中系列',
  CL150: '150 磅等级',
  CL300: '300 磅等级',
  STD: '标准壁厚',
  SCH40: 'Schedule 40',
  PN16: '公称压力 1.6MPa',
  PN25: '公称压力 2.5MPa'
}

const BASE_LIBRARY_BY_STANDARD = {
  'GB/T 8163': [
    { materialGrade: '20#', thicknessLevel: 'D1', nominalDiameter: 15, nominalDiameterUnit: 'mm', outerDiameter: 21.3, wallThickness: 2.8, enabled: true },
    { materialGrade: '20#', thicknessLevel: 'D2', nominalDiameter: 25, nominalDiameterUnit: 'mm', outerDiameter: 33.7, wallThickness: 3.2, enabled: true },
    { materialGrade: '20#', thicknessLevel: 'D3', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 60.3, wallThickness: 3.9, enabled: true },
    { materialGrade: 'Q345B', thicknessLevel: 'D2', nominalDiameter: 80, nominalDiameterUnit: 'mm', outerDiameter: 88.9, wallThickness: 5.5, enabled: true },
    { materialGrade: 'Q345B', thicknessLevel: 'D3', nominalDiameter: 100, nominalDiameterUnit: 'mm', outerDiameter: 114.3, wallThickness: 6, enabled: true }
  ],
  'GB/T 5312': [
    { materialGrade: '20#', thicknessLevel: 'D1', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 57, wallThickness: 3.5, enabled: true },
    { materialGrade: '20#', thicknessLevel: 'D2', nominalDiameter: 65, nominalDiameterUnit: 'mm', outerDiameter: 76, wallThickness: 4.5, enabled: true },
    { materialGrade: '20#', thicknessLevel: 'D3', nominalDiameter: 100, nominalDiameterUnit: 'mm', outerDiameter: 108, wallThickness: 6, enabled: true }
  ],
  'GB/T 14976': [
    { materialGrade: '304', thicknessLevel: 'S1', nominalDiameter: 25, nominalDiameterUnit: 'mm', outerDiameter: 33.4, wallThickness: 3.4, enabled: true },
    { materialGrade: '304', thicknessLevel: 'S2', nominalDiameter: 40, nominalDiameterUnit: 'mm', outerDiameter: 48.3, wallThickness: 3.7, enabled: true },
    { materialGrade: '316L', thicknessLevel: 'S1', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 60.3, wallThickness: 3.9, enabled: true },
    { materialGrade: '316L', thicknessLevel: 'S2', nominalDiameter: 80, nominalDiameterUnit: 'mm', outerDiameter: 88.9, wallThickness: 5.5, enabled: true }
  ],
  'GB/T 3091': [
    { materialGrade: 'Q235B', thicknessLevel: 'D1', nominalDiameter: 25, nominalDiameterUnit: 'mm', outerDiameter: 33.5, wallThickness: 3.25, enabled: true },
    { materialGrade: 'Q235B', thicknessLevel: 'D2', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 60.3, wallThickness: 3.6, enabled: true },
    { materialGrade: 'Q345B', thicknessLevel: 'D2', nominalDiameter: 80, nominalDiameterUnit: 'mm', outerDiameter: 88.9, wallThickness: 4, enabled: true }
  ],
  'HG/T 20592': [
    { materialGrade: '20#', thicknessLevel: 'CL150', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 165, wallThickness: 20, enabled: true },
    { materialGrade: '304', thicknessLevel: 'CL300', nominalDiameter: 80, nominalDiameterUnit: 'mm', outerDiameter: 200, wallThickness: 24, enabled: true }
  ],
  'GB/T 12459': [
    { materialGrade: '20#', thicknessLevel: 'STD', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 60.3, wallThickness: 3.9, enabled: true },
    { materialGrade: '304', thicknessLevel: 'SCH40', nominalDiameter: 80, nominalDiameterUnit: 'mm', outerDiameter: 88.9, wallThickness: 5.5, enabled: true }
  ],
  'GB/T 12237': [
    { materialGrade: '304', thicknessLevel: 'PN16', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 160, wallThickness: 12, enabled: true },
    { materialGrade: '316L', thicknessLevel: 'PN25', nominalDiameter: 80, nominalDiameterUnit: 'mm', outerDiameter: 195, wallThickness: 14, enabled: true }
  ]
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const cloneRows = (rows = []) => rows.map(row => ({ ...row }))

const fallbackRows = (standard = '') => [
  { materialGrade: '20#', thicknessLevel: 'D1', nominalDiameter: 50, nominalDiameterUnit: 'mm', outerDiameter: 60.3, wallThickness: 3.9, enabled: true },
  { materialGrade: '304', thicknessLevel: 'D2', nominalDiameter: 80, nominalDiameterUnit: 'mm', outerDiameter: 88.9, wallThickness: 5.5, enabled: true },
  { materialGrade: '316L', thicknessLevel: 'D3', nominalDiameter: 100, nominalDiameterUnit: 'mm', outerDiameter: 114.3, wallThickness: 6.3, enabled: true }
].map(row => ({ ...row, standardHint: standard }))

export async function fetchStandardBaseLibrary(params = {}) {
  const standard = String(params.standard ?? '').trim()
  await delay(250)

  const rows = BASE_LIBRARY_BY_STANDARD[standard]
  return {
    standard,
    rows: cloneRows(rows?.length ? rows : fallbackRows(standard))
  }
}

export async function fetchThicknessLevelDescriptions(codes = []) {
  await delay(150)
  return Array.from(new Set(codes.map(code => String(code ?? '').trim()).filter(Boolean))).reduce((acc, code) => {
    acc[code] = THICKNESS_LEVEL_DESCRIPTION_MAP[code] || ''
    return acc
  }, {})
}

export async function saveStandardSequenceRows(payload = {}) {
  await delay(250)
  return {
    success: true,
    savedCount: Array.isArray(payload.rows) ? payload.rows.length : 0,
    payload
  }
}
