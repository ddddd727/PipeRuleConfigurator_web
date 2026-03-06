import Mock from 'mockjs'
// 导入管道规格配置相关的Mock数据
// 启用 PipeSpecConfigForm 组件相关的 mock
import './modules/PipeSpecConfigInfo/ReferenceInfo.js'

Mock.setup({
  timeout: '200-600'
})

export const db = {
  // 1. A-管材等级 (grade)
  'grade': {
    title: 'A-管材等级配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'code', label: '等级代码' },
      // 【关键点】开启筛选
      { prop: 'name', label: '等级名称', filterable: true },
      { prop: 'desc', label: '说明' },
      // 【关键点】开启筛选
      { prop: 'status', label: '状态', filterable: true, width: 100 }
    ],
    'data|5-10': [{
      'id|+1': 1,
      'code': /CL[1-9]00/,
      'name|1': ['普通级', '高级', '特级', '核一级'],
      'desc': '@csentence(5, 10)',
      'status|1': ['启用', '停用']
    }]
  },

  // 2. A-管材标准 (pipe-std) —— 你专门提到的例子
  'pipe-std': {
    title: 'A-管材标准配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      // 【关键点】标准号下拉筛选
      { prop: 'stdNo', label: '标准号', filterable: true },
      { prop: 'name', label: '标准名称' },
      // 【关键点】年份下拉筛选
      { prop: 'year', label: '年份版本', filterable: true, width: 120 }
    ],
    'data|15-20': [{ // 生成多一点数据方便测试筛选
      'id|+1': 1,
      'stdNo|1': ['ASTM A106', 'ASTM A53', 'API 5L', 'ASTM A333'],
      'name': '@ctitle(4, 8)',
      'year|1': ['2018', '2019', '2020', '2021', '2022']
    }]
  },

  // 3. B1-主材料 (main-material)
  'main-material': {
    title: 'B1-主材料配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'name', label: '材料名称', filterable: true },
      { prop: 'type', label: '材料类型', filterable: true },
      { prop: 'density', label: '密度 (g/cm³)' }
    ],
    'data|10': [{
      'id|+1': 1,
      'name|1': ['碳钢', '不锈钢', '合金钢', '铜', '铝合金'],
      'type|1': ['金属', '非金属'],
      'density': '@float(2, 9, 2, 2)'
    }]
  },

  // 4. B-牌号 (material-grade)
  'material-grade': {
    title: 'B-牌号配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'grade', label: '牌号', filterable: true },
      { prop: 'carbon', label: '碳含量(%)' },
      { prop: 'tensile', label: '抗拉强度(MPa)' }
    ],
    'data|10': [{
      'id|+1': 1,
      'grade': /[A-Z]{2,3}-\d{2,3}/,
      'carbon': '@float(0.1, 0.5, 2, 2)',
      'tensile': '@integer(300, 600)'
    }]
  },

  // 5. C1-法兰标准 (flange-std)
  'flange-std': {
    title: 'C1-法兰标准配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'stdCode', label: '标准代码', filterable: true },
      { prop: 'system', label: '体系', filterable: true },
      { prop: 'faceType', label: '密封面类型', filterable: true }
    ],
    'data|8': [{
      'id|+1': 1,
      'stdCode|1': ['ASME B16.5', 'EN 1092-1', 'JIS B2220', 'GB/T 9119'],
      'system|1': ['美标', '欧标', '日标', '国标'],
      'faceType|1': ['RF', 'FF', 'RTJ', 'MFM']
    }]
  },

  // 6. C2-法兰压力等级 (flange-pressure)
  'flange-pressure': {
    title: 'C2-法兰压力等级',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'class', label: '压力等级', filterable: true },
      { prop: 'pn', label: 'PN值 (MPa)' },
      { prop: 'desc', label: '备注' }
    ],
    'data|6': [{
      'id|+1': 1,
      'class|+1': ['150LB', '300LB', '600LB', '900LB', '1500LB', '2500LB'],
      'pn': '@float(1, 42, 1, 1)',
      'desc': '@ctitle(2, 5)'
    }]
  },

  // 7. D-壁厚等级 (wall-thickness)
  'wall-thickness': {
    title: 'D-壁厚等级配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'sch', label: 'Schedule', filterable: true },
      { prop: 'thickness', label: '壁厚 (mm)' },
      { prop: 'stdRef', label: '参考标准' }
    ],
    'data|10': [{
      'id|+1': 1,
      'sch|+1': ['Sch10', 'Sch20', 'Sch30', 'STD', 'Sch40', 'Sch60', 'XS', 'Sch80', 'Sch120', 'Sch160'],
      'thickness': '@float(2, 30, 1, 2)',
      'stdRef': 'ASME B36.10M'
    }]
  },

  // 8. 接口表 (interface-table)
  'interface-table': {
    title: '系统接口定义表',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'name', label: '接口名称' },
      { prop: 'source', label: '源系统', filterable: true },
      { prop: 'target', label: '目标系统', filterable: true },
      { prop: 'method', label: '交互方式', filterable: true }
    ],
    'data|5': [{
      'id|+1': 1,
      'name': '@ctitle(4, 10)接口',
      'source|1': ['PDM', 'ERP', 'MES'],
      'target|1': ['RuleConfig', 'SAP', 'CAD'],
      'method|1': ['REST API', 'SOAP', 'DB Link']
    }]
  },

  // 9. 国标系列 (std-gb)
  'std-gb': {
    title: 'GB 国标系列配置',
    columns: [
      { prop: 'id', label: '序号', width: 60 },
      { prop: 'gbNo', label: '国标号', filterable: true },
      { prop: 'name', label: '中文名称' },
      { prop: 'status', label: '现行状态', filterable: true }
    ],
    'data|5-10': [{
      'id|+1': 1,
      'gbNo': /GB\/T \d{4}-\d{4}/,
      'name': '@ctitle(5, 12)',
      'status|1': ['现行', '废止', '即将实施']
    }]
  },

  // 1. 弯管数据 (bend-pipe)
  'bend-pipe': {
    title: '部件库名称：PlainPipingGenericData',
    'data|5': [{
      'id|+1': 1,
      'diameter|1': ['DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50'],
      'unit': 'mm',
      'l1|100-500': 1,
      'l2|100-500': 1
    }]
  },

  // 2. 壁厚系列 (wall-thickness-series)
  'wall-thickness-series': {
    title: '部件库名称：PlainPipingGenericData',
    'data|5': [{
      'id|+1': 1,
      'diameter|1': ['DN15', 'DN20', 'DN25', 'DN32', 'DN40', 'DN50'],
      'unit': 'mm',
      'standard|1': ['ASTM A106', 'GB/T 8163', 'ASTM A53'],
      'series|1': ['Sch10', 'Sch20', 'Sch40', 'Sch80', 'Sch160'],
      'outer|20-200': 1,
      'value|1.0-10.0': 1
    }]
  },

  // 3. ShortCode (shortcode)
  'shortcode': {
    title: '部件库名称：ShortCodeHierarchyRule',
    'data|5': [{
      'id|+1': 1,
      'type|1': ['PIPE', 'VALVE', 'FLANGE', 'FITTING', 'INSTRUMENT', 'EQUIPMENT'],
      'shortcode|1': ['管道', '阀门', '法兰', '管件', '仪表', '设备']
    }]
  },

  // 4. Spec (spec)
  'spec': {
    title: '部件库名称：PipingCommodityFilter',
    'data|5': [{
      'id|+1': 1,
      'shortcode|1': ['管道', '阀门', '法兰', '管件', '仪表', '设备']
    }]
  },

  // 基础库 mock 数据
  'library-tree': {
    data: [
      {
        label: '01 管材',
        category: 'pipe',
        children: [
          { label: '不锈钢管', children: [{ label: 'GB/T 14976-2012', children: [{ label: 'SeamlessPipe' }] }] },
          { label: '铜管' },
          { label: '无缝钢管' },
          { label: '有缝钢管' }
        ]
      },
      {
        label: '02 弯头',
        category: 'pipeComponent',
        children: [        
          { 
            label: '承插弯头' , 
            children: [
                { 
                  label: 'Q/SWS 34-003.2-2021', 
                  children: [
                    { label: '45DegElbow' }
                  ]
                }
              ]
            },
          { label: '对焊弯头' },
          { label: '排气管虾壳弯' }
        ]
      },
      // { label: '03 异径' },
      // { label: '04 法兰' },
      // { label: '05 三通' },
      { 
        label: '06 垫片',
        category: 'gasket',
        children: [
          { label: '金属缠绕垫片', children: [{ label: 'GB/T 4622.2', children: [{ label: 'SpiralWoundGasket' }] }] }
        ]
      },
      { 
        label: '07 紧固件',
        children: [
          { 
            label: '螺栓', 
            category: 'bolt',
            children: [{ label: 'GB/T 5782', children: [{ label: 'HexBolt' }] }] 
          },
          { 
            label: '螺母', 
            category: 'nut',
            children: [{ label: 'GB/T 6170', children: [{ label: 'HexNut' }] }] 
          },
          { 
            label: '垫圈', 
            category: 'washer',
            children: [{ label: 'GB/T 97.1', children: [{ label: 'FlatWasher' }] }] 
          }
        ]
      },
      // { label: '08 阀附件' },
      // { label: '09 漏水口' },
      // { label: '10 漏油口' },
      { label: '11 套管', category: 'pipeComponent', children: [
        { 
          label: '连接套管', 
          children: [
            { 
              label: 'Q/SWS 34-010-2021', 
              children: [
                { label: 'ConnectionSleeve' }
              ]
            },
            { 
              label: 'Q/SWS 34-015-2021', 
              children: [
                { label: 'ConnectionSleeve' }
              ]
            },
            { label: 'Q/SWS 34-071-2021' },
            { label: 'Q/SWS 34-077-2021' }
          ]
        },
        { label: '单头套管' },
        { label: '保护套管' },
        { label: '合拢套管' },
        { label: '承插插头' },
        { label: '直通接头' }
      ]},
      // { label: '12 设备' },
      // { label: '13 膨胀节' },
      // { label: '14 焊接座' },
      // { label: '15 通岸接头' }
    ]
  },
  'codelist-tree': {
    data: [
      {
        label: 'Allcodelist',
        children: [
          { label: 'BoltingRequirements' },
          { label: 'BoltOption' },
          { label: 'BoltType' },
          { label: 'CoatingType' },
          { label: 'CommodityOption' },
          { label: 'ControlPointSubType' },
          { label: 'ControlPointType' },
          { label: 'EndPreparation' },
          { label: 'EndStandard' },
          { label: 'FabricationType' },
          { label: 'FlowDirection' },
          { label: 'GasketOption' },
          { label: 'GeometricIndustryStandard' },
          { label: 'MaterialsGrade' },
          { label: 'PipingCommodityType' },
          { label: 'PressureRating' },
          { label: 'ScheduleThickness' }
        ]
      }
    ]
  },
  'library-component-details-sleeve': {
    IndustryCommodityCode: 'PCSSA23',
    ScheduleThickness: 'Sch.40',
    CommodityType: 'CPL',
    GeometryType: 'Linear, full size',
    GeometricIndustryStandard: 'Q/SWS 34-010-2021', // Should be hidden
    MaterialGrade: '20#',
    PartClassName: 'ConnectionSleeve',
    UserClassName: 'ConnectionSleeve',
    PartDataBasis: 'Part Data Basis Value'
    // No BentAngle for sleeve
  },
  'library-component-details-elbow': {
    IndustryCommodityCode: 'PCSEL45',
    ScheduleThickness: 'Sch.80',
    CommodityType: 'ELB',
    GeometryType: 'Turn, 45 degree',
    GeometricIndustryStandard: 'Q/SWS 34-003.2-2021', // Should be hidden
    MaterialGrade: '304SS',
    BentAngle: '45',
    PartClassName: '45DegElbow',
    UserClassName: '45DegElbow',
    PartDataBasis: 'Part Data Basis Value'
  },
  'library-component-details-pipe': {
    IndustryCommodityCode: 'PIPE001', 
    ScheduleThickness: 'Sch.40',
    CommodityType: 'PIPE',
    GeometricIndustryStandard: 'GB/T 14976-2012', // Should be hidden
    MaterialGrade: '316L'
  },
  'library-component-details-bolt': {
    IndustryCommodityCode: 'BOLT001',
    GeometricIndustryStandard: 'GB/T 5782', // Should be hidden
    MaterialGrade: 'A193 B7',
    BoltType: 'Hex Head'
  },
  'library-component-details-gasket': {
    IndustryCommodityCode: 'GASKET001',
    NominalDiameterFrom: '10',
    NominalDiameterTo: '200',
    NominalDiameter: '100',
    NpdUnitType: 'mm',
    GeometricIndustryStandard: 'GB/T 4622.2', // Should be hidden
    GasketType: 'Spiral Wound',
    ThicknessFor3DModel: '4.5',
    ProcurementThickness: '4.5',
    MaterialGrade: '304SS',
    GasketOutsideDiameter: '140',
    GasketInsideDiameter: '110',
    FlangeFacing: 'RF'
  },
  'library-component-details-nut': {
    IndustryCommodityCode: 'NUT001',
    GeometricIndustryStandard: 'GB/T 6170', // Should be hidden
    MaterialGrade: 'A194 2H',
    NutType: 'Hex Nut',
    NutHeight: '12'
  },
  'library-component-details-washer': {
    IndustryCommodityCode: 'WASHER001',
    GeometricIndustryStandard: 'GB/T 97.1', // Should be hidden
    MaterialGrade: '304SS',
    WasherType: 'Flat Washer',
    WasherThickness: '3'
  },
  'library-table-data-sleeve': [
    { 
      id: 1, ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '10mm', port2Size: '10mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.1,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*50 20#钢',
      disabled: false
    },
    { 
      id: 2, ccCode: 'PCSSA24', endStd1: 'Q/SWS 34-010-2021-B', endStd2: 'Q/SWS 34-010-2021-B', connType1: 'SWE', connType2: 'SWE', port1Size: '15mm', port2Size: '15mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.15,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X12', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*60 20#钢',
      disabled: false
    },
    { 
      id: 3, ccCode: 'PCSSA25', endStd1: 'Q/SWS 34-010-2021-C', endStd2: 'Q/SWS 34-010-2021-C', connType1: 'SWE', connType2: 'SWE', port1Size: '20mm', port2Size: '20mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.2,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X13', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*70 20#钢',
      disabled: true // 模拟已禁用
    },
    { 
      id: 4, ccCode: 'PCSSA26', endStd1: 'Q/SWS 34-010-2021-D', endStd2: 'Q/SWS 34-010-2021-D', connType1: 'SWE', connType2: 'SWE', port1Size: '25mm', port2Size: '25mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.25,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X14', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*80 20#钢',
      disabled: false
    },
    { 
      id: 5, ccCode: 'PCSSA27', endStd1: 'Q/SWS 34-010-2021-E', endStd2: 'Q/SWS 34-010-2021-E', connType1: 'SWE', connType2: 'SWE', port1Size: '32mm', port2Size: '32mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.3,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X15', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*90 20#钢',
      disabled: false
    }
  ],
  'library-table-data-elbow': [
    { 
      id: 11, ccCode: 'PCSEL45', endStd1: 'Q/SWS 34-003.2-2021', endStd2: 'Q/SWS 34-003.2-2021', connType1: 'BW', connType2: 'BW', port1Size: '50mm', port2Size: '50mm',
      wallThickness1: 'Sch.80', wallThickness2: 'Sch.80', flowDirection1: 'Bi', flowDirection2: 'Bi', weight: 1.2,
      dryCogX: 10, dryCogY: 5, dryCogZ: 0, materialCode: 'ELB45-001', materialDesc: '45度承插弯头 Q/SWS 34-003.2-2021',
      disabled: false
    },
    { 
      id: 12, ccCode: 'PCSEL46', endStd1: 'Q/SWS 34-003.2-2021', endStd2: 'Q/SWS 34-003.2-2021', connType1: 'BW', connType2: 'BW', port1Size: '65mm', port2Size: '65mm',
      wallThickness1: 'Sch.80', wallThickness2: 'Sch.80', flowDirection1: 'Bi', flowDirection2: 'Bi', weight: 1.5,
      dryCogX: 12, dryCogY: 6, dryCogZ: 0, materialCode: 'ELB45-002', materialDesc: '45度承插弯头 Q/SWS 34-003.2-2021',
      disabled: false
    },
    { 
      id: 13, ccCode: 'PCSEL47', endStd1: 'Q/SWS 34-003.2-2021', endStd2: 'Q/SWS 34-003.2-2021', connType1: 'BW', connType2: 'BW', port1Size: '80mm', port2Size: '80mm',
      wallThickness1: 'Sch.80', wallThickness2: 'Sch.80', flowDirection1: 'Bi', flowDirection2: 'Bi', weight: 2.0,
      dryCogX: 15, dryCogY: 8, dryCogZ: 0, materialCode: 'ELB45-003', materialDesc: '45度承插弯头 Q/SWS 34-003.2-2021',
      disabled: true
    },
    { 
      id: 14, ccCode: 'PCSEL48', endStd1: 'Q/SWS 34-003.2-2021', endStd2: 'Q/SWS 34-003.2-2021', connType1: 'BW', connType2: 'BW', port1Size: '100mm', port2Size: '100mm',
      wallThickness1: 'Sch.80', wallThickness2: 'Sch.80', flowDirection1: 'Bi', flowDirection2: 'Bi', weight: 3.5,
      dryCogX: 20, dryCogY: 10, dryCogZ: 0, materialCode: 'ELB45-004', materialDesc: '45度承插弯头 Q/SWS 34-003.2-2021',
      disabled: false
    }
  ],
  'codelist-table-data': [
    { shortDesc: 'Undefined', longDesc: 'Undefined', codeNum: 0 },
    { shortDesc: 'Out', longDesc: 'Flow leaves this port', codeNum: 1 },
    { shortDesc: 'In', longDesc: 'Flow enters this port', codeNum: 2 },
    { shortDesc: 'Bi-directional', longDesc: 'Flow may enter or leave this port', codeNum: 3 },
    { shortDesc: 'No Flow', longDesc: 'No flow at this port', codeNum: 4 }
  ]
}

// 基础库相关接口
Mock.mock(/\/api\/library\/tree/, 'get', () => {
  return { code: 200, data: db['library-tree'].data, message: 'success' }
})

Mock.mock(/\/api\/library\/codelist-tree/, 'get', () => {
  return { code: 200, data: db['codelist-tree'].data, message: 'success' }
})

Mock.mock(/\/api\/library\/component-details/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const nodeLabel = url.searchParams.get('nodeLabel')
  const category = url.searchParams.get('category')
   
  if (category === 'pipe') {
    return { code: 200, data: db['library-component-details-pipe'], message: 'success' }
  } else if (category === 'bolt') {
    return { code: 200, data: db['library-component-details-bolt'], message: 'success' }
  } else if (category === 'gasket') {
    return { code: 200, data: db['library-component-details-gasket'], message: 'success' }
  } else if (category === 'nut') {
    return { code: 200, data: db['library-component-details-nut'], message: 'success' }
  } else if (category === 'washer') {
    return { code: 200, data: db['library-component-details-washer'], message: 'success' }
  } else if (category === 'pipeComponent') {
    if (nodeLabel && nodeLabel.includes('45DegElbow')) {
      return { code: 200, data: db['library-component-details-elbow'], message: 'success' }
    } else {
      return { code: 200, data: db['library-component-details-sleeve'], message: 'success' }
    }
  } else {
     // Fallback
     return { code: 200, data: {}, message: 'success' }
  }
 })
 
 Mock.mock(/\/api\/library\/component-full-data/, 'get', (options) => {
   const url = new URL(options.url, 'http://localhost')
   const nodeLabel = url.searchParams.get('nodeLabel')
   const category = url.searchParams.get('category') || ''
   const ccCode = url.searchParams.get('ccCode')
   const scheduleThickness = url.searchParams.get('scheduleThickness')
   const materialGrade = url.searchParams.get('materialGrade')
 
   let base = {}
   if (category === 'pipe') {
     base = db['library-component-details-pipe']
   } else if (category === 'bolt') {
     base = db['library-component-details-bolt']
   } else if (category === 'gasket') {
     base = db['library-component-details-gasket']
   } else if (category === 'nut') {
     base = db['library-component-details-nut']
   } else if (category === 'washer') {
     base = db['library-component-details-washer']
   } else if (category === 'pipeComponent') {
     base = nodeLabel && nodeLabel.includes('45DegElbow') ? db['library-component-details-elbow'] : db['library-component-details-sleeve']
   }
 
   const commonColumns = [
     { prop: 'IndustryCommodityCode', label: 'CC码' },
     { prop: 'NPD[1]', label: '端口1' },
     { prop: 'NpdUnitType[1]', label: '端口1单位' },
     { prop: 'PressureRating[1]', label: '压力1' },
     { prop: 'EndPreparation[1]', label: '端面连接形式1' },
     { prop: 'EndStandard[1]', label: '端面标准1' },
     { prop: 'ScheduleThickness[1]', label: '壁厚等级1' },
     { prop: 'FlowDirection[1]', label: '流向1' },
     { prop: 'NPD[2]', label: '端口2' },
     { prop: 'NpdUnitType[2]', label: '端口2单位' },
     { prop: 'PressureRating[2]', label: '压力2' },
     { prop: 'EndPreparation[2]', label: '端面连接形式2' },
     { prop: 'EndStandard[2]', label: '端面标准2' },
     { prop: 'ScheduleThickness[2]', label: '壁厚等级2' },
     { prop: 'FlowDirection[2]', label: '流向2' },
     { prop: 'GeometricIndustryStandard', label: '几何工业标准' }
   ]
 
   const pipeComponentAppearanceColumns = [
     { prop: 'IndustryCommodityCode', label: 'CC码' },
     { prop: 'NPD[1]', label: '端口1' },
     { prop: 'NpdUnitType[1]', label: '端口1单位' },
     { prop: 'EndPreparation[1]', label: '端面连接形式1' },
     { prop: 'ScheduleThickness[1]', label: '壁厚等级1' },
     { prop: 'NPD[2]', label: '端口2' },
     { prop: 'NpdUnitType[2]', label: '端口2单位' },
     { prop: 'EndPreparation[2]', label: '端面连接形式2' },
     { prop: 'ScheduleThickness[2]', label: '壁厚等级2' },
     { prop: 'DryWeight', label: 'DryWeight' },
     { prop: 'DryCogX', label: 'DryCogX' },
     { prop: 'DryCogY', label: 'DryCogY' },
     { prop: 'DryCogZ', label: 'DryCogZ' },
     { prop: 'PartDescription', label: '物资描述' },
     { prop: 'MaterialsMgmtIdent', label: '物资编码' },
     { prop: 'BendRadius', label: '弯曲半径' }
   ]
 
   const pipeAppearanceColumns = [
     { prop: 'IndustryCommodityCode', label: 'CC码' },
     { prop: 'NPD[1]', label: '端口1' },
     { prop: 'NpdUnitType[1]', label: '端口1单位' },
     { prop: 'EndPreparation[1]', label: '端面连接形式1' },
     { prop: 'ScheduleThickness[1]', label: '壁厚等级1' },
     { prop: 'NPD[2]', label: '端口2' },
     { prop: 'NpdUnitType[2]', label: '端口2单位' },
     { prop: 'EndPreparation[2]', label: '端面连接形式2' },
     { prop: 'ScheduleThickness[2]', label: '壁厚等级2' },
     { prop: 'Density', label: '密度' },
     { prop: 'PurchaseLength', label: '采购长度' },
     { prop: 'MinimumPipeLength', label: '最小管长' },
     { prop: 'MaximumPipeLength', label: '最大管长' },
     { prop: 'WeightPerUnitLength', label: '单位长度重量' },
     { prop: 'PartDescription', label: '物资描述' },
     { prop: 'MaterialsMgmtIdent', label: '物资编码' }
   ]
 
   const commonRowsByCategory = {
     pipe: [
       {
         IndustryCommodityCode: 'PIPE001',
         MaterialGrade: '316L',
         'NPD[1]': '100',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': 'PN16',
         'EndPreparation[1]': 'BW',
         'EndStandard[1]': 'GB/T 14976-2012',
         'ScheduleThickness[1]': 'Sch.40',
         'FlowDirection[1]': 'Bi',
         'NPD[2]': '100',
         'NpdUnitType[2]': 'mm',
         'PressureRating[2]': '',
         'EndPreparation[2]': 'BW',
         'EndStandard[2]': 'GB/T 14976-2012',
         'ScheduleThickness[2]': 'Sch.40',
         'FlowDirection[2]': 'Bi',
         GeometricIndustryStandard: 'GB/T 14976-2012'
       },
       {
         IndustryCommodityCode: 'PIPE002',
         MaterialGrade: '304SS',
         'NPD[1]': '150',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': 'PN25',
         'EndPreparation[1]': 'BW',
         'EndStandard[1]': 'GB/T 14976-2012',
         'ScheduleThickness[1]': 'Sch.80',
         'FlowDirection[1]': 'Bi',
         'NPD[2]': '150',
         'NpdUnitType[2]': 'mm',
         'PressureRating[2]': '',
         'EndPreparation[2]': 'BW',
         'EndStandard[2]': 'GB/T 14976-2012',
         'ScheduleThickness[2]': 'Sch.80',
         'FlowDirection[2]': 'Bi',
         GeometricIndustryStandard: 'GB/T 14976-2012'
       }
     ],
     pipeComponent: [
       {
         IndustryCommodityCode: nodeLabel && nodeLabel.includes('45DegElbow') ? 'PCELB45-001' : 'PCSLEEV-001',
         MaterialGrade: nodeLabel && nodeLabel.includes('45DegElbow') ? '304SS' : '20#',
         'NPD[1]': '50',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': 'PN16',
         'EndPreparation[1]': 'SW',
         'EndStandard[1]': 'Q/SWS',
         'ScheduleThickness[1]': 'Sch.40',
         'FlowDirection[1]': 'Bi',
         'NPD[2]': '50',
         'NpdUnitType[2]': 'mm',
         'PressureRating[2]': '',
         'EndPreparation[2]': 'SW',
         'EndStandard[2]': 'Q/SWS',
         'ScheduleThickness[2]': 'Sch.40',
         'FlowDirection[2]': 'Bi',
         GeometricIndustryStandard: nodeLabel && nodeLabel.includes('45DegElbow') ? 'Q/SWS 34-003.2-2021' : 'Q/SWS 34-010-2021'
       },
       {
         IndustryCommodityCode: nodeLabel && nodeLabel.includes('45DegElbow') ? 'PCELB45-002' : 'PCSLEEV-002',
         MaterialGrade: nodeLabel && nodeLabel.includes('45DegElbow') ? '304SS' : '20#',
         'NPD[1]': '65',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': 'PN16',
         'EndPreparation[1]': 'SW',
         'EndStandard[1]': 'Q/SWS',
         'ScheduleThickness[1]': 'Sch.40',
         'FlowDirection[1]': 'Bi',
         'NPD[2]': '65',
         'NpdUnitType[2]': 'mm',
         'PressureRating[2]': '',
         'EndPreparation[2]': 'SW',
         'EndStandard[2]': 'Q/SWS',
         'ScheduleThickness[2]': 'Sch.40',
         'FlowDirection[2]': 'Bi',
         GeometricIndustryStandard: nodeLabel && nodeLabel.includes('45DegElbow') ? 'Q/SWS 34-003.2-2021' : 'Q/SWS 34-010-2021'
       }
     ],
     bolt: [
       {
         IndustryCommodityCode: 'BOLT001',
         MaterialGrade: 'A193 B7',
         'NPD[1]': '100',
         'NpdUnitType[1]': '',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 5782'
       }
     ],
     gasket: [
       {
         IndustryCommodityCode: 'GASKET001',
         MaterialGrade: '304SS',
         'NPD[1]': '200',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 4622.2'
       },
       {
         IndustryCommodityCode: 'GASKET001',
         MaterialGrade: '304SS',
         'NPD[1]': '200',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '222',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 4622.2'
       }
     ],
     nut: [
       {
         IndustryCommodityCode: 'NUT001',
         MaterialGrade: 'A194 2H',
         'NPD[1]': '',
         'NpdUnitType[1]': '',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 6170'
       }
     ],
     washer: [
       {
         IndustryCommodityCode: 'WASHER001',
         MaterialGrade: '304SS',
         'NPD[1]': '',
         'NpdUnitType[1]': '',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 97.1'
       }
     ]
   }
 
   const appearanceRowsByCategory = {
     pipe: [
       {
         IndustryCommodityCode: 'PIPE001',
         MaterialGrade: '316L',
         'NPD[1]': '100',
         'NpdUnitType[1]': 'mm',
         'EndPreparation[1]': 'BW',
         'ScheduleThickness[1]': 'Sch.40',
         'NPD[2]': '100',
         'NpdUnitType[2]': 'mm',
         'EndPreparation[2]': 'BW',
         'ScheduleThickness[2]': 'Sch.40',
         Density: 7.85,
         PurchaseLength: 12,
         MinimumPipeLength: 6,
         MaximumPipeLength: 12,
         WeightPerUnitLength: 18.6,
         PartDescription: '不锈钢管',
         MaterialsMgmtIdent: 'MAT-PIPE-001',
         GeometricIndustryStandard: 'GB/T 14976-2012',
         JsonData: ''
       },
       {
         IndustryCommodityCode: 'PIPE002',
         MaterialGrade: '304SS',
         'NPD[1]': '150',
         'NpdUnitType[1]': 'mm',
         'EndPreparation[1]': 'BW',
         'ScheduleThickness[1]': 'Sch.80',
         'NPD[2]': '150',
         'NpdUnitType[2]': 'mm',
         'EndPreparation[2]': 'BW',
         'ScheduleThickness[2]': 'Sch.80',
         Density: 7.85,
         PurchaseLength: 12,
         MinimumPipeLength: 6,
         MaximumPipeLength: 12,
         WeightPerUnitLength: 28.9,
         PartDescription: '不锈钢管',
         MaterialsMgmtIdent: 'MAT-PIPE-002',
         GeometricIndustryStandard: 'GB/T 14976-2012',
         JsonData: ''
       }
     ],
     pipeComponent: [
       {
         IndustryCommodityCode: nodeLabel && nodeLabel.includes('45DegElbow') ? 'PCELB45-001' : 'PCSLEEV-001',
         MaterialGrade: nodeLabel && nodeLabel.includes('45DegElbow') ? '304SS' : '20#',
         'NPD[1]': '50',
         'NpdUnitType[1]': 'mm',
         'EndPreparation[1]': 'SW',
         'ScheduleThickness[1]': 'Sch.40',
         'NPD[2]': '50',
         'NpdUnitType[2]': 'mm',
         'EndPreparation[2]': 'SW',
         'ScheduleThickness[2]': 'Sch.40',
         DryWeight: nodeLabel && nodeLabel.includes('45DegElbow') ? 1.2 : 0.2,
         DryCogX: 0,
         DryCogY: 0,
         DryCogZ: 0,
         PartDescription: nodeLabel && nodeLabel.includes('45DegElbow') ? '45度承插弯头' : '连接套管',
         MaterialsMgmtIdent: nodeLabel && nodeLabel.includes('45DegElbow') ? 'MAT-ELB-001' : 'MAT-SLEEV-001',
         GeometricIndustryStandard: nodeLabel && nodeLabel.includes('45DegElbow') ? 'Q/SWS 34-003.2-2021' : 'Q/SWS 34-010-2021',
         BendRadius: nodeLabel && nodeLabel.includes('45DegElbow') ? 1.5 : '',
         JsonData: ''
       },
       {
         IndustryCommodityCode: nodeLabel && nodeLabel.includes('45DegElbow') ? 'PCELB45-002' : 'PCSLEEV-002',
         MaterialGrade: nodeLabel && nodeLabel.includes('45DegElbow') ? '304SS' : '20#',
         'NPD[1]': '65',
         'NpdUnitType[1]': 'mm',
         'EndPreparation[1]': 'SW',
         'ScheduleThickness[1]': 'Sch.40',
         'NPD[2]': '65',
         'NpdUnitType[2]': 'mm',
         'EndPreparation[2]': 'SW',
         'ScheduleThickness[2]': 'Sch.40',
         DryWeight: nodeLabel && nodeLabel.includes('45DegElbow') ? 1.6 : 0.25,
         DryCogX: 0,
         DryCogY: 0,
         DryCogZ: 0,
         PartDescription: nodeLabel && nodeLabel.includes('45DegElbow') ? '45度承插弯头' : '连接套管',
         MaterialsMgmtIdent: nodeLabel && nodeLabel.includes('45DegElbow') ? 'MAT-ELB-002' : 'MAT-SLEEV-002',
         GeometricIndustryStandard: nodeLabel && nodeLabel.includes('45DegElbow') ? 'Q/SWS 34-003.2-2021' : 'Q/SWS 34-010-2021',
         BendRadius: nodeLabel && nodeLabel.includes('45DegElbow') ? 1.5 : '',
         JsonData: ''
       }
     ]
   }
 
   const dedupe = (arr) => Array.from(new Set((arr || []).filter(v => v !== null && v !== undefined && String(v).trim() !== '').map(v => String(v).trim())))
   const allCommonRows = commonRowsByCategory[category] || []
 
   const ccCodes = dedupe(allCommonRows.map(r => r.IndustryCommodityCode))
   const scheduleThicknesses = dedupe(allCommonRows.flatMap(r => [r['ScheduleThickness[1]'], r['ScheduleThickness[2]']]))
   const rowMaterials = dedupe(allCommonRows.map(r => r.MaterialGrade))
   const baseMat = base?.MaterialGrade || base?.Materialgrade
   const materialGrades = dedupe([baseMat, ...rowMaterials])
 
   const matchesRow = (row) => {
     if (ccCode && row.IndustryCommodityCode !== ccCode) return false
     if (scheduleThickness) {
       const t1 = row['ScheduleThickness[1]']
       const t2 = row['ScheduleThickness[2]']
       if (t1 !== scheduleThickness && t2 !== scheduleThickness) return false
     }
     if (materialGrade) {
       const rowMat = row.MaterialGrade || row.Materialgrade
       const effectiveMat = rowMat || baseMat
       if (effectiveMat && effectiveMat !== materialGrade) return false
     }
     return true
   }
 
   const filteredCommonRows = allCommonRows.filter(matchesRow)
   const groups = {
     common: {
       columns: commonColumns,
       data: filteredCommonRows
     }
   }
 
   if (category === 'pipe') {
     groups.appearance = {
       columns: pipeAppearanceColumns,
       data: (appearanceRowsByCategory.pipe || []).filter(matchesRow)
     }
   }
 
   if (category === 'pipeComponent') {
     groups.appearance = {
       columns: pipeComponentAppearanceColumns,
       data: (appearanceRowsByCategory.pipeComponent || []).filter(matchesRow)
     }
   }
 
   return {
     code: 200,
     message: 'success',
     data: {
       category,
       base,
       filters: {
         ccCodes,
         scheduleThicknesses,
         materialGrades
       },
       table: {
         category,
         groups
       }
     }
   }
 })
 
 Mock.mock(/\/api\/library\/table-data/, 'get', (options) => {
   const url = new URL(options.url, 'http://localhost')
   const nodeLabel = url.searchParams.get('nodeLabel')
   const category = url.searchParams.get('category')
 
   const commonColumns = [
    { prop: 'IndustryCommodityCode', label: 'CC码' },
    { prop: 'NPD[1]', label: '端口1通径' },
    { prop: 'NpdUnitType[1]', label: '端口1通径单位' },
    { prop: 'PressureRating[1]', label: '压力1' },
    { prop: 'EndPreparation[1]', label: '端面连接形式1' },
    { prop: 'EndStandard[1]', label: '端面标准1' },
    { prop: 'ScheduleThickness[1]', label: '壁厚1' },
    { prop: 'FlowDirection[1]', label: '流向1' },
    { prop: 'NPD[2]', label: '端口2通径' },
    { prop: 'NpdUnitType[2]', label: '端口2通径单位' },
    { prop: 'PressureRating[2]', label: '压力2' },
    { prop: 'EndPreparation[2]', label: '端面连接形式2' },
    { prop: 'EndStandard[2]', label: '端面标准2' },
    { prop: 'ScheduleThickness[2]', label: '壁厚2' },
    { prop: 'FlowDirection[2]', label: '流向2' },
    { prop: 'GeometricIndustryStandard', label: '几何工业标准' }
  ]

  const pipeComponentAppearanceColumns = [
    { prop: 'IndustryCommodityCode', label: 'CC码' },
    { prop: 'NPD[1]', label: '端口1通径' },
    { prop: 'NpdUnitType[1]', label: 'NpdUnitType[1]' },
    { prop: 'EndPreparation[1]', label: '端面连接形式1' },
    { prop: 'ScheduleThickness[1]', label: '壁厚1' },
    { prop: 'NPD[2]', label: '端口2通径' },
    { prop: 'NpdUnitType[2]', label: 'NpdUnitType[2]' },
    { prop: 'EndPreparation[2]', label: '端面连接形式2' },
    { prop: 'ScheduleThickness[2]', label: '壁厚2' },
    { prop: 'DryWeight', label: '重量' },
    { prop: 'DryCogX', label: 'DryCogX' },
    { prop: 'DryCogY', label: 'DryCogY' },
    { prop: 'DryCogZ', label: 'DryCogZ' },
    { prop: 'PartDescription', label: '物资描述' },
    { prop: 'MaterialsMgmtIdent', label: '物资编码' },
    { prop: 'GeometricIndustryStandard', label: '几何工业标准' },
    { prop: 'BendRadius', label: '弯曲半径' },
    { prop: 'JsonData', label: 'JsonData' }
  ]

  const pipeAppearanceColumns = [
    { prop: 'IndustryCommodityCode', label: 'CC码' },
    { prop: 'NPD[1]', label: '端口1通径' },
    { prop: 'NpdUnitType[1]', label: '端口1通径单位' },
    { prop: 'EndPreparation[1]', label: '端面连接形式1' },
    { prop: 'ScheduleThickness[1]', label: '壁厚1' },
    { prop: 'NPD[2]', label: '端口2通径' },
    { prop: 'NpdUnitType[2]', label: '端口2通径单位' },
    { prop: 'EndPreparation[2]', label: '端面连接形式2' },
    { prop: 'ScheduleThickness[2]', label: '壁厚2' },
    { prop: 'Density', label: '密度' },
    { prop: 'PurchaseLength', label: '采购长度' },
    { prop: 'MinimumPipeLength', label: '最小管长' },
    { prop: 'MaximumPipeLength', label: '最大管长' },
    { prop: 'WeightPerUnitLength', label: '单位长度重量' },
    { prop: 'PartDescription', label: '物资描述' },
    { prop: 'MaterialsMgmtIdent', label: '物资编码' },
    { prop: 'GeometricIndustryStandard', label: '几何工业标准' },
    { prop: 'JsonData', label: 'JsonData' }
  ]
 
   const commonRowsByCategory = {
     pipe: [
       {
         IndustryCommodityCode: 'PIPE001',
         'NPD[1]': '100',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': 'PN16',
         'EndPreparation[1]': 'BW',
         'EndStandard[1]': 'GB/T 14976-2012',
         'ScheduleThickness[1]': 'Sch.40',
         'FlowDirection[1]': 'Bi',
         'NPD[2]': '100',
         'NpdUnitType[2]': 'mm',
         'PressureRating[2]': '',
         'EndPreparation[2]': 'BW',
         'EndStandard[2]': 'GB/T 14976-2012',
         'ScheduleThickness[2]': 'Sch.40',
         'FlowDirection[2]': 'Bi',
         GeometricIndustryStandard: 'GB/T 14976-2012'
       },
       {
         IndustryCommodityCode: 'PIPE002',
         'NPD[1]': '150',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': 'PN25',
         'EndPreparation[1]': 'BW',
         'EndStandard[1]': 'GB/T 14976-2012',
         'ScheduleThickness[1]': 'Sch.80',
         'FlowDirection[1]': 'Bi',
         'NPD[2]': '150',
         'NpdUnitType[2]': 'mm',
         'PressureRating[2]': '',
         'EndPreparation[2]': 'BW',
         'EndStandard[2]': 'GB/T 14976-2012',
         'ScheduleThickness[2]': 'Sch.80',
         'FlowDirection[2]': 'Bi',
         GeometricIndustryStandard: 'GB/T 14976-2012'
       }
     ],
     pipeComponent: [
       {
         IndustryCommodityCode: nodeLabel && nodeLabel.includes('45DegElbow') ? 'PCELB45-001' : 'PCSLEEV-001',
         'NPD[1]': '50',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': 'PN16',
         'EndPreparation[1]': 'SW',
         'EndStandard[1]': 'Q/SWS',
         'ScheduleThickness[1]': 'Sch.40',
         'FlowDirection[1]': 'Bi',
         'NPD[2]': '50',
         'NpdUnitType[2]': 'mm',
         'PressureRating[2]': '',
         'EndPreparation[2]': 'SW',
         'EndStandard[2]': 'Q/SWS',
         'ScheduleThickness[2]': 'Sch.40',
         'FlowDirection[2]': 'Bi',
         GeometricIndustryStandard: nodeLabel && nodeLabel.includes('45DegElbow') ? 'Q/SWS 34-003.2-2021' : 'Q/SWS 34-010-2021'
       },
       {
         IndustryCommodityCode: nodeLabel && nodeLabel.includes('45DegElbow') ? 'PCELB45-002' : 'PCSLEEV-002',
         'NPD[1]': '65',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': 'PN16',
         'EndPreparation[1]': 'SW',
         'EndStandard[1]': 'Q/SWS',
         'ScheduleThickness[1]': 'Sch.40',
         'FlowDirection[1]': 'Bi',
         'NPD[2]': '65',
         'NpdUnitType[2]': 'mm',
         'PressureRating[2]': '',
         'EndPreparation[2]': 'SW',
         'EndStandard[2]': 'Q/SWS',
         'ScheduleThickness[2]': 'Sch.40',
         'FlowDirection[2]': 'Bi',
         GeometricIndustryStandard: nodeLabel && nodeLabel.includes('45DegElbow') ? 'Q/SWS 34-003.2-2021' : 'Q/SWS 34-010-2021'
       }
     ],
     bolt: [
       {
         IndustryCommodityCode: 'BOLT001',
         'NPD[1]': '',
         'NpdUnitType[1]': '',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 5782'
       }
     ],
     gasket: [
       {
         IndustryCommodityCode: 'GASKET001',
         'NPD[1]': '100',
         'NpdUnitType[1]': 'mm',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 4622.2'
       }
     ],
     nut: [
       {
         IndustryCommodityCode: 'NUT001',
         'NPD[1]': '',
         'NpdUnitType[1]': '',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 6170'
       }
     ],
     washer: [
       {
         IndustryCommodityCode: 'WASHER001',
         'NPD[1]': '',
         'NpdUnitType[1]': '',
         'PressureRating[1]': '',
         'EndPreparation[1]': '',
         'EndStandard[1]': '',
         'ScheduleThickness[1]': '',
         'FlowDirection[1]': '',
         'NPD[2]': '',
         'NpdUnitType[2]': '',
         'PressureRating[2]': '',
         'EndPreparation[2]': '',
         'EndStandard[2]': '',
         'ScheduleThickness[2]': '',
         'FlowDirection[2]': '',
         GeometricIndustryStandard: 'GB/T 97.1'
       }
     ]
   }
 
   const appearanceRowsByCategory = {
     pipe: [
       {
         IndustryCommodityCode: 'PIPE001',
         'NPD[1]': '100',
         'NpdUnitType[1]': 'mm',
         'EndPreparation[1]': 'BW',
         'ScheduleThickness[1]': 'Sch.40',
         'NPD[2]': '100',
         'NpdUnitType[2]': 'mm',
         'EndPreparation[2]': 'BW',
         'ScheduleThickness[2]': 'Sch.40',
         Density: 7.85,
         PurchaseLength: 12,
         MinimumPipeLength: 6,
         MaximumPipeLength: 12,
         WeightPerUnitLength: 18.6,
         PartDescription: '不锈钢管',
         MaterialsMgmtIdent: 'MAT-PIPE-001',
         GeometricIndustryStandard: 'GB/T 14976-2012',
         JsonData: ''
       },
       {
         IndustryCommodityCode: 'PIPE002',
         'NPD[1]': '150',
         'NpdUnitType[1]': 'mm',
         'EndPreparation[1]': 'BW',
         'ScheduleThickness[1]': 'Sch.80',
         'NPD[2]': '150',
         'NpdUnitType[2]': 'mm',
         'EndPreparation[2]': 'BW',
         'ScheduleThickness[2]': 'Sch.80',
         Density: 7.85,
         PurchaseLength: 12,
         MinimumPipeLength: 6,
         MaximumPipeLength: 12,
         WeightPerUnitLength: 28.9,
         PartDescription: '不锈钢管',
         MaterialsMgmtIdent: 'MAT-PIPE-002',
         GeometricIndustryStandard: 'GB/T 14976-2012',
         JsonData: ''
       }
     ],
     pipeComponent: [
       {
         IndustryCommodityCode: nodeLabel && nodeLabel.includes('45DegElbow') ? 'PCELB45-001' : 'PCSLEEV-001',
         'NPD[1]': '50',
         'NpdUnitType[1]': 'mm',
         'EndPreparation[1]': 'SW',
         'ScheduleThickness[1]': 'Sch.40',
         'NPD[2]': '50',
         'NpdUnitType[2]': 'mm',
         'EndPreparation[2]': 'SW',
         'ScheduleThickness[2]': 'Sch.40',
         DryWeight: nodeLabel && nodeLabel.includes('45DegElbow') ? 1.2 : 0.2,
         DryCogX: 0,
         DryCogY: 0,
         DryCogZ: 0,
         PartDescription: nodeLabel && nodeLabel.includes('45DegElbow') ? '45度承插弯头' : '连接套管',
         MaterialsMgmtIdent: nodeLabel && nodeLabel.includes('45DegElbow') ? 'MAT-ELB-001' : 'MAT-SLEEV-001',
         GeometricIndustryStandard: nodeLabel && nodeLabel.includes('45DegElbow') ? 'Q/SWS 34-003.2-2021' : 'Q/SWS 34-010-2021',
         BendRadius: nodeLabel && nodeLabel.includes('45DegElbow') ? 1.5 : '',
         JsonData: ''
       },
       {
         IndustryCommodityCode: nodeLabel && nodeLabel.includes('45DegElbow') ? 'PCELB45-002' : 'PCSLEEV-002',
         'NPD[1]': '65',
         'NpdUnitType[1]': 'mm',
         'EndPreparation[1]': 'SW',
         'ScheduleThickness[1]': 'Sch.40',
         'NPD[2]': '65',
         'NpdUnitType[2]': 'mm',
         'EndPreparation[2]': 'SW',
         'ScheduleThickness[2]': 'Sch.40',
         DryWeight: nodeLabel && nodeLabel.includes('45DegElbow') ? 1.6 : 0.25,
         DryCogX: 0,
         DryCogY: 0,
         DryCogZ: 0,
         PartDescription: nodeLabel && nodeLabel.includes('45DegElbow') ? '45度承插弯头' : '连接套管',
         MaterialsMgmtIdent: nodeLabel && nodeLabel.includes('45DegElbow') ? 'MAT-ELB-002' : 'MAT-SLEEV-002',
         GeometricIndustryStandard: nodeLabel && nodeLabel.includes('45DegElbow') ? 'Q/SWS 34-003.2-2021' : 'Q/SWS 34-010-2021',
         BendRadius: nodeLabel && nodeLabel.includes('45DegElbow') ? 1.5 : '',
         JsonData: ''
       }
     ]
   }
 
   const resolvedCategory = category || ''
   const commonRows = commonRowsByCategory[resolvedCategory] || []
   const groups = {
     common: {
       columns: commonColumns,
       data: commonRows
     }
   }
 
   if (resolvedCategory === 'pipe') {
     groups.appearance = {
       columns: pipeAppearanceColumns,
       data: appearanceRowsByCategory.pipe || []
     }
   }
 
   if (resolvedCategory === 'pipeComponent') {
     groups.appearance = {
       columns: pipeComponentAppearanceColumns,
       data: appearanceRowsByCategory.pipeComponent || []
     }
   }
 
   return {
     code: 200,
     message: 'success',
     data: {
       category: resolvedCategory,
       groups
     }
   }
 })

Mock.mock(/\/api\/library\/codelist-table-data/, 'get', () => {
  return { code: 200, data: db['codelist-table-data'], message: 'success' }
})

// 拦截请求
Mock.mock(/\/api\/dict\/[\w-]+/, 'get', (options) => {
  console.log('Mock拦截:', options.url)
  // 兼容带 - 的 id
  const urlParts = options.url.split('/')
  const id = urlParts[urlParts.length - 1]

  const result = db[id]

  if (result) {
    return {
      code: 200,
      message: 'success',
      data: Mock.mock(result)
    }
  } else {
    return {
      code: 404,
      message: `未找到 [${id}] 的配置数据`,
      data: { title: '未定义', columns: [], data: [] }
    }
  }
})

// --- PMC 模块 Mock ---

// 1. 获取船号
Mock.mock(/\/api\/pmc\/ship-numbers/, 'get', (options) => {
  console.log('Mock拦截: 获取船号', options.url)
  // 解析 query 参数 (简单解析)
  const matchType = options.url.match(/type=([^&]+)/)
  const type = matchType ? matchType[1] : undefined
  
  if (type === 'bulk') {
    return {
      code: 200,
      data: [
        { label: 'H1560 (散货)', value: 'H1560' },
        { label: 'H1561 (散货)', value: 'H1561' },
        { label: 'H1562 (散货)', value: 'H1562' }
      ]
    }
  } else if (type === 'container') {
    return {
      code: 200,
      data: [
        { label: 'H2001 (集装箱)', value: 'H2001' },
        { label: 'H2002 (集装箱)', value: 'H2002' }
      ]
    }
  } else {
    return { code: 200, data: [] }
  }
})

// 2. 主材料规则内容 (B1, B2, B3, D) - 已迁移至后端
// Mock.mock(/\/api\/pmc\/rules\/main-material/, 'get', (options) => { ... })

// 3. 法兰规则内容 (C1, C2) - 已迁移至后端
// Mock.mock(/\/api\/pmc\/rules\/flange/, 'get', (options) => { ... })


// 5. 获取规则下拉列表 (主材料、法兰、管材限定)
Mock.mock(/\/api\/pmc\/rules\/list/, 'get', (options) => {
  console.log('Mock拦截: 获取规则列表', options.url)
  const matchType2 = options.url.match(/type=([^&]+)/)
  const type = matchType2 ? matchType2[1] : undefined
  
  if (type === 'main-material') {
    return {
      code: 200,
      data: [
        { label: '501001-碳钢管规则 (Mock)', value: '501001' },
        { label: '501002-不锈钢管规则 (Mock)', value: '501002' },
        { label: '501003-合金钢管规则 (Mock)', value: '501003' }
      ]
    }
  } else if (type === 'flange') {
    return {
      code: 200,
      data: [
        { label: '502001-国标法兰规则 (Mock)', value: '502001' },
        { label: '502002-美标法兰规则 (Mock)', value: '502002' }
      ]
    }
  } else if (type === 'pipe-limit') {
    return {
      code: 200,
      data: [
        { label: '503001-等级限定规则A (Mock)', value: '503001' },
        { label: '503002-等级限定规则B (Mock)', value: '503002' }
      ]
    }
  } else {
    return { code: 200, data: [] }
  }
})
