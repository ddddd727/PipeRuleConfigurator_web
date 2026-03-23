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

  // 10. Elbow (弯头)
  'part-elbow': {
    title: 'Elbow (弯头) 配置',
    columns: [
      { prop: 'id', label: 'ID', required: true, isPrimaryKey: true, isReadOnly: true },
      { prop: 'standard', label: '标准', required: true },
      { prop: 'type', label: '类型', required: true },
      { prop: 'description', label: '中文描述', required: true },
      { prop: 'mainMaterial', label: '主材料', required: true }
    ],
    'data|10': [{
      'id|+1': 1,
      'standard|1': ['ASME B16.9', 'GB/T 12459', 'EN 10253-2', 'JIS B2311'],
      'type|1': ['45°', '90°', '180°', '3D', '5D'],
      'description': '@ctitle(5, 10)',
      'mainMaterial|1': ['碳钢', '不锈钢', '合金钢', '铜合金', '铝合金']
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

  // 基础库 mock 数据 - 返回4个层级字段
  'library-tree': {
    data: [
      { level1: '01 管材', level2: '不锈钢管', level3: 'GB/T 14976-2012', level4: 'SeamlessPipe', category: 'pipe' },
      { level1: '01 管材', level2: '铜管', level3: 'GB/T 1527-2017', level4: 'CopperPipe', category: 'pipe' },
      { level1: '01 管材', level2: '无缝钢管', level3: 'GB/T 8163-2018', level4: 'CarbonSeamlessPipe', category: 'pipe' },
      { level1: '01 管材', level2: '有缝钢管', level3: 'GB/T 3091-2015', level4: 'WeldedPipe', category: 'pipe' },
      
      { level1: '02 弯头', level2: '承插弯头', level3: 'Q/SWS 34-003.2-2021', level4: '45DegElbow', category: 'pipeComponent' },
      { level1: '02 弯头', level2: '承插弯头', level3: 'Q/SWS 34-003.2-2021', level4: '60DegElbow', category: 'pipeComponent' },
      { level1: '02 弯头', level2: '对焊弯头', level3: 'GB/T 12459-2017', level4: 'BWWelbow', category: 'pipeComponent' },
      { level1: '02 弯头', level2: '排气管虾壳弯', level3: 'CB/T 3811-1998', level4: 'MiterBend', category: 'pipeComponent' },
      
      { level1: '06 垫片', level2: '金属缠绕垫片', level3: 'GB/T 4622.2', level4: 'SpiralWoundGasket', category: 'gasket' },
      
      { level1: '07 紧固件', level2: '螺栓', level3: 'GB/T 5782', level4: 'HexBolt', category: 'bolt' },
      { level1: '07 紧固件', level2: '螺母', level3: 'GB/T 6170', level4: 'HexNut', category: 'nut' },
      { level1: '07 紧固件', level2: '垫圈', level3: 'GB/T 97.1', level4: 'FlatWasher', category: 'washer' },
      
      { level1: '11 套管', level2: '连接套管', level3: 'Q/SWS 34-010-2021', level4: 'ConnectionSleeve', category: 'pipeComponent' },
      { level1: '11 套管', level2: '连接套管', level3: 'Q/SWS 34-015-2021', level4: 'ConnectionSleeve', category: 'pipeComponent' },
      { level1: '11 套管', level2: '连接套管', level3: 'Q/SWS 34-071-2021', level4: 'TypeA-Sleeve', category: 'pipeComponent' },
      { level1: '11 套管', level2: '连接套管', level3: 'Q/SWS 34-077-2021', level4: 'TypeB-Sleeve', category: 'pipeComponent' },
      { level1: '11 套管', level2: '单头套管', level3: 'Q/SWS 34-012-2021', level4: 'SingleSleeve', category: 'pipeComponent' },
      { level1: '11 套管', level2: '保护套管', level3: 'Q/SWS 34-013-2021', level4: 'ProtectSleeve', category: 'pipeComponent' },
      { level1: '11 套管', level2: '合拢套管', level3: 'Q/SWS 34-014-2021', level4: 'FinalSleeve', category: 'pipeComponent' },
      { level1: '11 套管', level2: '承插插头', level3: 'Q/SWS 34-016-2021', level4: 'SWPlug', category: 'pipeComponent' },
      { level1: '11 套管', level2: '直通接头', level3: 'Q/SWS 34-017-2021', level4: '', category: 'pipeComponent' }
    ]
  },
  'codelist-tree': {
    data: [
      { level1: '通用', level2: 'BoltingRequirements', level3: '', level4: '' },
      { level1: '通用', level2: 'BoltOption', level3: '', level4: '' },
      { level1: '管系', level2: 'BoltType', level3: '', level4: '' },
      { level1: '管系', level2: 'CoatingType', level3: '', level4: '' },
      { level1: '管系', level2: 'CommodityOption', level3: '', level4: '' },
      { level1: '管系', level2: 'ControlPointSubType', level3: '', level4: '' },
      { level1: '管系', level2: 'ControlPointType', level3: '', level4: '' },
      { level1: '管系', level2: 'EndPreparation', level3: '', level4: '' },
      { level1: '管系', level2: 'EndStandard', level3: '', level4: '' },
      { level1: '管系', level2: 'FabricationType', level3: '', level4: '' },
      { level1: '管系', level2: 'FlowDirection', level3: '', level4: '' },
      { level1: '管系', level2: 'GasketOption', level3: '', level4: '' },
      { level1: '管系', level2: 'GeometricIndustryStandard', level3: '', level4: '' },
      { level1: '管系', level2: 'MaterialsGrade', level3: '', level4: '' },
      { level1: '管系', level2: 'PipingCommodityType', level3: '', level4: '' },
      { level1: '管系', level2: 'PressureRating', level3: '', level4: '' },
      { level1: '管系', level2: 'ScheduleThickness', level3: '', level4: '' }
    ]
  },
  'library-codelist-hierarchy-materials-grade': {
    names: { level1: 'MaterialsGradePractice', level2: 'MaterialsCategory', level3: 'MaterialsGrade' },
    rows: [
      {
        level1ShortDesc: 'Universal, Generic Materials',
        level1LongDesc: 'Universal, Generic Materials',
        level1CodeNum: 4,
        level1Status: 1,
        level2ShortDesc: 'Carbon Steel',
        level2LongDesc: 'Carbon Steel',
        level2CodeNum: 101,
        level2Status: 1,
        level3ShortDesc: 'A36',
        level3LongDesc: 'ASTM A36',
        level3CodeNum: 1001,
        status: 1
      },
      {
        level1ShortDesc: 'Universal, Generic Materials',
        level1LongDesc: 'Universal, Generic Materials',
        level1CodeNum: 4,
        level1Status: 1,
        level2ShortDesc: 'Carbon Steel',
        level2LongDesc: 'Carbon Steel',
        level2CodeNum: 101,
        level2Status: 1,
        level3ShortDesc: 'A106 Gr.B',
        level3LongDesc: 'ASTM A106 Grade B',
        level3CodeNum: 1002,
        status: 1
      },
      {
        level1ShortDesc: 'Universal, Generic Materials',
        level1LongDesc: 'Universal, Generic Materials',
        level1CodeNum: 4,
        level1Status: 1,
        level2ShortDesc: 'Stainless Steel',
        level2LongDesc: 'Stainless Steel',
        level2CodeNum: 102,
        level2Status: 1,
        level3ShortDesc: '304',
        level3LongDesc: 'SS304',
        level3CodeNum: 1101,
        status: 1
      },
      {
        level1ShortDesc: 'Universal, Generic Materials',
        level1LongDesc: 'Universal, Generic Materials',
        level1CodeNum: 4,
        level1Status: 1,
        level2ShortDesc: 'Stainless Steel',
        level2LongDesc: 'Stainless Steel',
        level2CodeNum: 102,
        level2Status: 1,
        level3ShortDesc: '316L',
        level3LongDesc: 'SS316L',
        level3CodeNum: 1102,
        status: 1
      },
      {
        level1ShortDesc: 'United States of America, Standards',
        level1LongDesc: 'United States of America, Standards',
        level1CodeNum: 5,
        level1Status: 1,
        level2ShortDesc: 'ASME Ferrous',
        level2LongDesc: 'ASME Ferrous',
        level2CodeNum: 201,
        level2Status: 0,
        level3ShortDesc: 'SA-516 Gr.70',
        level3LongDesc: 'ASME SA-516 Grade 70',
        level3CodeNum: 2001,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 3001,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR11',
        level3LongDesc: 'DIN S235JR11',
        level3CodeNum: 300111,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR9',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30019,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR8',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30018,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR7',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30017,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR6',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30016,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR5',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30015,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR4',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30014,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR3',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30013,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR2',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30012,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JR1',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 30011,
        status: 1
      },
      {
        level1ShortDesc: 'Germany Standards (DIN)',
        level1LongDesc: 'Germany Standards (DIN)',
        level1CodeNum: 18,
        level1Status: 0,
        level2ShortDesc: 'DIN Carbon',
        level2LongDesc: 'DIN Carbon',
        level2CodeNum: 301,
        level2Status: 1,
        level3ShortDesc: 'S235JRA',
        level3LongDesc: 'DIN S235JR',
        level3CodeNum: 3002,
        status: 0
      }
    ]
  },
  'library-codelist-hierarchy-pressure-rating': {
    names: { level1: 'PressureSystem', level2: 'PressureRating', level3: '' },
    rows: [
      { level1ShortDesc: 'ASME', level1LongDesc: 'ASME Class', level1CodeNum: 1, level1Status: 1, level2ShortDesc: '150LB', level2LongDesc: 'Class 150', level2CodeNum: 150, status: 1 },
      { level1ShortDesc: 'ASME', level1LongDesc: 'ASME Class', level1CodeNum: 1, level1Status: 1, level2ShortDesc: '300LB', level2LongDesc: 'Class 300', level2CodeNum: 300, status: 1 },
      { level1ShortDesc: 'ASME', level1LongDesc: 'ASME Class', level1CodeNum: 1, level1Status: 1, level2ShortDesc: '600LB', level2LongDesc: 'Class 600', level2CodeNum: 600, status: 0 },
      { level1ShortDesc: 'EN', level1LongDesc: 'EN PN', level1CodeNum: 2, level1Status: 0, level2ShortDesc: 'PN10', level2LongDesc: 'PN 10', level2CodeNum: 10, status: 1 },
      { level1ShortDesc: 'EN', level1LongDesc: 'EN PN', level1CodeNum: 2, level1Status: 0, level2ShortDesc: 'PN16', level2LongDesc: 'PN 16', level2CodeNum: 16, status: 1 },
      { level1ShortDesc: 'EN', level1LongDesc: 'EN PN', level1CodeNum: 2, level1Status: 0, level2ShortDesc: 'PN25', level2LongDesc: 'PN 25', level2CodeNum: 25, status: 1 }
    ]
  },
  'library-component-base-data-pipe': [
    {
      IndustryCommodityCode: 'PIPE001',
      ScheduleThickness: 'Sch.40',
      MaterialGrade: '316L',
      CommodityType: 'PIPEAAA',
      GeometricIndustryStandard: 'GB/T 14976-2012'
    },
    {
      IndustryCommodityCode: 'PIPE002',
      ScheduleThickness: 'Sch.80',
      MaterialGrade: '304SS',
      CommodityType: 'PIPE',
      GeometricIndustryStandard: 'GB/T 14976-2012'
    }
  ],
  'library-component-base-data-pipeComponent-elbow': [
    {
      IndustryCommodityCode: 'PCSEL45',
      ScheduleThickness: 'Sch.80',
      MaterialGrade: '304SS',
      CommodityType: 'ELB',
      GeometryType: 'Turn, 45 degree',
      GeometricIndustryStandard: 'Q/SWS 34-003.2-2021',
      BentAngle: '45',
      PartClassName: '45DegElbow',
      UserClassName: '45DegElbow',
      PartDataBasis: 'Part Data Basis Value'
    },
    {
      IndustryCommodityCode: 'PCSEL60',
      ScheduleThickness: 'Sch.80',
      MaterialGrade: '304SS',
      CommodityType: 'ELB',
      GeometryType: 'Turn, 60 degree',
      GeometricIndustryStandard: 'Q/SWS 34-003.2-2021',
      BentAngle: '60',
      PartClassName: '60DegElbow',
      UserClassName: '60DegElbow',
      PartDataBasis: 'Part Data Basis Value'
    },
    {
      IndustryCommodityCode: 'PCSELaaa60',
      ScheduleThickness: 'Scaaah.80',
      MaterialGrade: '304SS',
      CommodityType: 'ELB',
      GeometryType: 'Turn, 60 degree',
      GeometricIndustryStandard: 'Q/SWS 34-003.2-2021',
      BentAngle: '60',
      PartClassName: '60DegElbow',
      UserClassName: '60DegElbow',
      PartDataBasis: 'Part Data Basis Value'
    }
  ],
  'library-component-base-data-pipeComponent-sleeve': [
    {
      IndustryCommodityCode: 'PCSSA23',
      ScheduleThickness: 'Sch.40',
      MaterialGrade: '20#',
      CommodityType: 'CPL',
      GeometryType: 'Linear, full size',
      GeometricIndustryStandard: 'Q/SWS 34-010-2021',
      PartClassName: 'ConnectionSleeve',
      UserClassName: 'ConnectionSleeve',
      PartDataBasis: 'Part Data Basis Value'
    },
    {
      IndustryCommodityCode: 'PCSSA24',
      ScheduleThickness: 'Sch.40',
      MaterialGrade: '20#',
      CommodityType: 'CPL',
      GeometryType: 'Linear, full size',
      GeometricIndustryStandard: 'Q/SWS 34-010-2021',
      PartClassName: 'ConnectionSleeve',
      UserClassName: 'ConnectionSleeve',
      PartDataBasis: 'Part Data Basis Value'
    }
  ],
  'library-component-base-data-bolt': [
    {
      IndustryCommodityCode: 'BOLT001',
      MaterialGrade: 'A193 B7',
      GeometricIndustryStandard: 'GB/T 5782',
      BoltType: 'Hex Head'
    }
  ],
  'library-component-base-data-gasket': [
    {
      IndustryCommodityCode: 'GASKET001',
      NominalDiameterFrom: '10',
      NominalDiameterTo: '200',
      NominalDiameter: '100',
      NpdUnitType: 'mm',
      MaterialGrade: '304SS',
      GeometricIndustryStandard: 'GB/T 4622.2',
      GasketType: 'Spiral Wound',
      ThicknessFor3DModel: '4.5',
      ProcurementThickness: '4.5',
      GasketOutsideDiameter: '140',
      GasketInsideDiameter: '110',
      FlangeFacing: 'RF'
    }
  ],
  'library-component-base-data-nut': [
    { IndustryCommodityCode: 'NUT-41-5-M10', NutType: '5', GeometricIndustryStandard: '10025', MaterialGrade: '0', NutHeight: '12' },
    { IndustryCommodityCode: 'NUT-41-5-M12', NutType: '5', GeometricIndustryStandard: '10025', MaterialGrade: '0', NutHeight: '11.3mm' },
    { IndustryCommodityCode: 'NUT-41-5-M14', NutType: '5', GeometricIndustryStandard: '10025', MaterialGrade: '0', NutHeight: '13mm' },
    { IndustryCommodityCode: 'NUT-41-5-M16', NutType: '5', GeometricIndustryStandard: '10025', MaterialGrade: '0', NutHeight: '15mm' },
    { IndustryCommodityCode: 'NUT-41-5-M18', NutType: '5', GeometricIndustryStandard: '10025', MaterialGrade: '0', NutHeight: '16mm' }
  ],
  'library-component-base-data-washer': [
    {
      IndustryCommodityCode: 'WASHER001',
      MaterialGrade: '304SS',
      GeometricIndustryStandard: 'GB/T 97.1',
      WasherType: 'Flat Washer',
      WasherThickness: '3'
    }
  ],
  'library-table-data-sleeve': [
    { 
      id: 1, ccCode: 'PCSSA23', endStd1: 'Q/SWS 34-010-2021-A', endStd2: 'Q/SWS 34-010-2021-A', connType1: 'SWE', connType2: 'SWE', port1Size: '10mm', port2Size: '10mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.1,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X11', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*50 20#钢',
      status: 1
    },
    { 
      id: 2, ccCode: 'PCSSA24', endStd1: 'Q/SWS 34-010-2021-B', endStd2: 'Q/SWS 34-010-2021-B', connType1: 'SWE', connType2: 'SWE', port1Size: '15mm', port2Size: '15mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.15,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X12', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*60 20#钢',
      status: 1
    },
    { 
      id: 3, ccCode: 'PCSSA25', endStd1: 'Q/SWS 34-010-2021-C', endStd2: 'Q/SWS 34-010-2021-C', connType1: 'SWE', connType2: 'SWE', port1Size: '20mm', port2Size: '20mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.2,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X13', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*70 20#钢',
      status: 0
    },
    { 
      id: 4, ccCode: 'PCSSA26', endStd1: 'Q/SWS 34-010-2021-D', endStd2: 'Q/SWS 34-010-2021-D', connType1: 'SWE', connType2: 'SWE', port1Size: '25mm', port2Size: '25mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.25,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X14', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*80 20#钢',
      status: 1
    },
    { 
      id: 5, ccCode: 'PCSSA27', endStd1: 'Q/SWS 34-010-2021-E', endStd2: 'Q/SWS 34-010-2021-E', connType1: 'SWE', connType2: 'SWE', port1Size: '32mm', port2Size: '32mm',
      wallThickness1: 'Sch.40', wallThickness2: 'Sch.40', flowDirection1: 'In', flowDirection2: 'Out', weight: 0.3,
      dryCogX: 0, dryCogY: 0, dryCogZ: 0, materialCode: 'SPSSS23A5B37X15', materialDesc: '连接套管 Q/SWS 34-010-2021 TA27*4*90 20#钢',
      status: 1
    }
  ],
  'library-table-data-elbow': [
    { 
      id: 11, ccCode: 'PCSEL45', endStd1: 'Q/SWS 34-003.2-2021', endStd2: 'Q/SWS 34-003.2-2021', connType1: 'BW', connType2: 'BW', port1Size: '50mm', port2Size: '50mm',
      wallThickness1: 'Sch.80', wallThickness2: 'Sch.80', flowDirection1: 'Bi', flowDirection2: 'Bi', weight: 1.2,
      dryCogX: 10, dryCogY: 5, dryCogZ: 0, materialCode: 'ELB45-001', materialDesc: '45度承插弯头 Q/SWS 34-003.2-2021',
      status: 1
    },
    { 
      id: 12, ccCode: 'PCSEL46', endStd1: 'Q/SWS 34-003.2-2021', endStd2: 'Q/SWS 34-003.2-2021', connType1: 'BW', connType2: 'BW', port1Size: '65mm', port2Size: '65mm',
      wallThickness1: 'Sch.80', wallThickness2: 'Sch.80', flowDirection1: 'Bi', flowDirection2: 'Bi', weight: 1.5,
      dryCogX: 12, dryCogY: 6, dryCogZ: 0, materialCode: 'ELB45-002', materialDesc: '45度承插弯头 Q/SWS 34-003.2-2021',
      status: 1
    },
    { 
      id: 13, ccCode: 'PCSEL47', endStd1: 'Q/SWS 34-003.2-2021', endStd2: 'Q/SWS 34-003.2-2021', connType1: 'BW', connType2: 'BW', port1Size: '80mm', port2Size: '80mm',
      wallThickness1: 'Sch.80', wallThickness2: 'Sch.80', flowDirection1: 'Bi', flowDirection2: 'Bi', weight: 2.0,
      dryCogX: 15, dryCogY: 8, dryCogZ: 0, materialCode: 'ELB45-003', materialDesc: '45度承插弯头 Q/SWS 34-003.2-2021',
      status: 0
    },
    { 
      id: 14, ccCode: 'PCSEL48', endStd1: 'Q/SWS 34-003.2-2021', endStd2: 'Q/SWS 34-003.2-2021', connType1: 'BW', connType2: 'BW', port1Size: '100mm', port2Size: '100mm',
      wallThickness1: 'Sch.80', wallThickness2: 'Sch.80', flowDirection1: 'Bi', flowDirection2: 'Bi', weight: 3.5,
      dryCogX: 20, dryCogY: 10, dryCogZ: 0, materialCode: 'ELB45-004', materialDesc: '45度承插弯头 Q/SWS 34-003.2-2021',
      status: 1
    }
  ],
  'codelist-table-data': [
    { shortDesc: 'Undefined', longDesc: 'Undefined', codeNum: 0, status: 1 },
    { shortDesc: 'Out', longDesc: 'Flow leaves this port', codeNum: 1, status: 1 },
    { shortDesc: 'In', longDesc: 'Flow enters this port', codeNum: 2, status: 1 },
    { shortDesc: 'Bi-directional', longDesc: 'Flow may enter or leave this port', codeNum: 3, status: 1 },
    { shortDesc: 'No Flow', longDesc: 'No flow at this port', codeNum: 4, status: 0 }
  ],
  'codelist-table-data-bolt-type': [
    { shortDesc: 'HexBolt', longDesc: 'Hex Bolt', codeNum: 1, status: 1 },
    { shortDesc: 'StudBolt', longDesc: 'Stud Bolt', codeNum: 2, status: 1 },
    { shortDesc: 'AnchorBolt', longDesc: 'Anchor Bolt', codeNum: 3, status: 1 },
    { shortDesc: 'U-Bolt', longDesc: 'U-Bolt', codeNum: 4, status: 0 }
  ],
  // 新增：公用端面数据 (Common End Face Data)
  'library-common-data-pipe': [
    {
      IndustryCommodityCode: 'PIPE001',
      'NPD[1]': '100', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN16', 'EndPreparation[1]': 'BW', 'EndStandard[1]': 'GB/T 14976-2012', 'ScheduleThickness[1]': 'Sch.40', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '100', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'BW', 'EndStandard[2]': 'GB/T 14976-2012', 'ScheduleThickness[2]': 'Sch.40', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'GB/T 14976-2012',
      status: 1
    },
    {
      IndustryCommodityCode: 'PIPE002',
      'NPD[1]': '150', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN25', 'EndPreparation[1]': 'BW', 'EndStandard[1]': 'GB/T 14976-2012', 'ScheduleThickness[1]': 'Sch.80', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '150', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'BW', 'EndStandard[2]': 'GB/T 14976-2012', 'ScheduleThickness[2]': 'Sch.80', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'GB/T 14976-2012',
      status: 1
    },
    {
      IndustryCommodityCode: 'PIPE003',
      'NPD[1]': '200', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN16', 'EndPreparation[1]': 'BW', 'EndStandard[1]': 'GB/T 14976-2012', 'ScheduleThickness[1]': 'Sch.40', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '200', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'BW', 'EndStandard[2]': 'GB/T 14976-2012', 'ScheduleThickness[2]': 'Sch.40', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'GB/T 14976-2012',
      status: 0
    }
  ],
  'library-common-data-pipeComponent-elbow': [
    {
      IndustryCommodityCode: 'PCELB45-001',
      'NPD[1]': '50', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN16', 'EndPreparation[1]': 'SW', 'EndStandard[1]': 'Q/SWS', 'ScheduleThickness[1]': 'Sch.40', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '50', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'SW', 'EndStandard[2]': 'Q/SWS', 'ScheduleThickness[2]': 'Sch.40', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'Q/SWS 34-003.2-2021',
      status: 1
    },
    {
      IndustryCommodityCode: 'PCELB45-002',
      'NPD[1]': '65', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN16', 'EndPreparation[1]': 'SW', 'EndStandard[1]': 'Q/SWS', 'ScheduleThickness[1]': 'Sch.40', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '65', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'SW', 'EndStandard[2]': 'Q/SWS', 'ScheduleThickness[2]': 'Sch.40', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'Q/SWS 34-003.2-2021',
      status: 1
    },
    {
      IndustryCommodityCode: 'PCELB45-003',
      'NPD[1]': '80', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN16', 'EndPreparation[1]': 'SW', 'EndStandard[1]': 'Q/SWS', 'ScheduleThickness[1]': 'Sch.40', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '80', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'SW', 'EndStandard[2]': 'Q/SWS', 'ScheduleThickness[2]': 'Sch.40', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'Q/SWS 34-003.2-2021',
      status: 0
    }
  ],
  'library-common-data-pipeComponent-sleeve': [
    {
      IndustryCommodityCode: 'PCSLEEV-001',
      'NPD[1]': '50', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN16', 'EndPreparation[1]': 'SW', 'EndStandard[1]': 'Q/SWS', 'ScheduleThickness[1]': 'Sch.40', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '50', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'SW', 'EndStandard[2]': 'Q/SWS', 'ScheduleThickness[2]': 'Sch.40', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'Q/SWS 34-010-2021',
      status: 1
    },
    {
      IndustryCommodityCode: 'PCSLEEV-002',
      'NPD[1]': '65', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN16', 'EndPreparation[1]': 'SW', 'EndStandard[1]': 'Q/SWS', 'ScheduleThickness[1]': 'Sch.40', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '65', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'SW', 'EndStandard[2]': 'Q/SWS', 'ScheduleThickness[2]': 'Sch.40', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'Q/SWS 34-010-2021',
      status: 1
    },
    {
      IndustryCommodityCode: 'PCSLEEV-003',
      'NPD[1]': '80', 'NpdUnitType[1]': 'mm', 'PressureRating[1]': 'PN16', 'EndPreparation[1]': 'SW', 'EndStandard[1]': 'Q/SWS', 'ScheduleThickness[1]': 'Sch.40', 'FlowDirection[1]': 'Bi',
      'NPD[2]': '80', 'NpdUnitType[2]': 'mm', 'PressureRating[2]': '', 'EndPreparation[2]': 'SW', 'EndStandard[2]': 'Q/SWS', 'ScheduleThickness[2]': 'Sch.40', 'FlowDirection[2]': 'Bi',
      GeometricIndustryStandard: 'Q/SWS 34-010-2021',
      status: 0
    }
  ],
  'library-common-data-bolt': [
    {
      IndustryCommodityCode: 'BOLT001',
      GeometricIndustryStandard: 'GB/T 5782',
      status: 1
    },
    {
      IndustryCommodityCode: 'BOLT002',
      GeometricIndustryStandard: 'GB/T 5782',
      status: 0
    }
  ],
  'library-common-data-gasket': [
    {
      IndustryCommodityCode: 'GASKET001',
      'NPD[1]': '100', 'NpdUnitType[1]': 'mm', 'NPD[2]': '222', 'GeometricIndustryStandard:': 'GB/T 4622.2',
      status: 1
    },
    {
      IndustryCommodityCode: 'GASKET002',
      'NPD[1]': '125', 'NpdUnitType[1]': 'mm', 'NPD[2]': '250', 'GeometricIndustryStandard:': 'GB/T 4622.2',
      status: 0
    }
  ],
  'library-common-data-nut': [
    {
      IndustryCommodityCode: 'NUT-41-5-M10',
      NutType: '5',
      GeometricIndustryStandard: '10025',
      NutHeight: '12',
      status: 1
    },
    {
      IndustryCommodityCode: 'NUT-41-5-M12',
      NutType: '5',
      GeometricIndustryStandard: '10025',
      NutHeight: '11.3mm',
      status: 1
    },
    {
      IndustryCommodityCode: 'NUT-41-5-M14',
      NutType: '5',
      GeometricIndustryStandard: '10025',
      NutHeight: '13mm',
      status: 0
    }
  ],
  'library-common-data-washer': [
    {
      IndustryCommodityCode: 'WASHER001',
      GeometricIndustryStandard: 'GB/T 97.1',
      status: 1
    },
    {
      IndustryCommodityCode: 'WASHER002',
      GeometricIndustryStandard: 'GB/T 97.1',
      status: 0
    }
  ],
  // 新增：外形重量重心描述数据 (Outline Weight Center of Gravity Description Data)
  'library-appearance-data-pipe': [
    {
      IndustryCommodityCode: 'PIPE001',
      'NPD[1]': '100', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'BW', 'ScheduleThickness[1]': 'Sch.40',
      'NPD[2]': '100', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'BW', 'ScheduleThickness[2]': 'Sch.40',
      Density: 7.85, PurchaseLength: 12, MinimumPipeLength: 6, MaximumPipeLength: 12, WeightPerUnitLength: 18.6,
      PartDescription: '不锈钢管', MaterialsMgmtIdent: 'MAT-PIPE-001', GeometricIndustryStandard: 'GB/T 14976-2012',
      status: 1
    },
    {
      IndustryCommodityCode: 'PIPE002',
      'NPD[1]': '150', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'BW', 'ScheduleThickness[1]': 'Sch.80',
      'NPD[2]': '150', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'BW', 'ScheduleThickness[2]': 'Sch.80',
      Density: 7.85, PurchaseLength: 12, MinimumPipeLength: 6, MaximumPipeLength: 12, WeightPerUnitLength: 28.9,
      PartDescription: '不锈钢管', MaterialsMgmtIdent: 'MAT-PIPE-002', GeometricIndustryStandard: 'GB/T 14976-2012',
      status: 1
    },
    {
      IndustryCommodityCode: 'PIPE003',
      'NPD[1]': '200', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'BW', 'ScheduleThickness[1]': 'Sch.40',
      'NPD[2]': '200', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'BW', 'ScheduleThickness[2]': 'Sch.40',
      Density: 7.85, PurchaseLength: 12, MinimumPipeLength: 6, MaximumPipeLength: 12, WeightPerUnitLength: 38.6,
      PartDescription: '不锈钢管 (禁用)', MaterialsMgmtIdent: 'MAT-PIPE-003', GeometricIndustryStandard: 'GB/T 14976-2012',
      status: 0
    }
  ],
  'library-appearance-data-pipeComponent-elbow': [
    {
      IndustryCommodityCode: 'PCELB45-001',
      'NPD[1]': '50', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'SW', 'ScheduleThickness[1]': 'Sch.40',
      'NPD[2]': '50', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'SW', 'ScheduleThickness[2]': 'Sch.40',
      DryWeight: 1.2, DryCogX: 0, DryCogY: 0, DryCogZ: 0,
      PartDescription: '45度承插弯头', MaterialsMgmtIdent: 'MAT-ELB-001', GeometricIndustryStandard: 'Q/SWS 34-003.2-2021', BendRadius: 1.5,
      status: 1
    },
    {
      IndustryCommodityCode: 'PCELB45-002',
      'NPD[1]': '65', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'SW', 'ScheduleThickness[1]': 'Sch.40',
      'NPD[2]': '65', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'SW', 'ScheduleThickness[2]': 'Sch.40',
      DryWeight: 1.6, DryCogX: 0, DryCogY: 0, DryCogZ: 0,
      PartDescription: '45度承插弯头', MaterialsMgmtIdent: 'MAT-ELB-002', GeometricIndustryStandard: 'Q/SWS 34-003.2-2021', BendRadius: 1.5,
      status: 1
    },
    {
      IndustryCommodityCode: 'PCELB45-003',
      'NPD[1]': '80', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'SW', 'ScheduleThickness[1]': 'Sch.40',
      'NPD[2]': '80', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'SW', 'ScheduleThickness[2]': 'Sch.40',
      DryWeight: 2.0, DryCogX: 0, DryCogY: 0, DryCogZ: 0,
      PartDescription: '45度承插弯头 (禁用)', MaterialsMgmtIdent: 'MAT-ELB-003', GeometricIndustryStandard: 'Q/SWS 34-003.2-2021', BendRadius: 1.5,
      status: 0
    }
  ],
  'library-appearance-data-pipeComponent-sleeve': [
    {
      IndustryCommodityCode: 'PCSLEEV-001',
      'NPD[1]': '50', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'SW', 'ScheduleThickness[1]': 'Sch.40',
      'NPD[2]': '50', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'SW', 'ScheduleThickness[2]': 'Sch.40',
      DryWeight: 0.2, DryCogX: 0, DryCogY: 0, DryCogZ: 0,
      PartDescription: '连接套管', MaterialsMgmtIdent: 'MAT-SLEEV-001', GeometricIndustryStandard: 'Q/SWS 34-010-2021',
      status: 1
    },
    {
      IndustryCommodityCode: 'PCSLEEV-002',
      'NPD[1]': '65', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'SW', 'ScheduleThickness[1]': 'Sch.40',
      'NPD[2]': '65', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'SW', 'ScheduleThickness[2]': 'Sch.40',
      DryWeight: 0.25, DryCogX: 0, DryCogY: 0, DryCogZ: 0,
      PartDescription: '连接套管', MaterialsMgmtIdent: 'MAT-SLEEV-002', GeometricIndustryStandard: 'Q/SWS 34-010-2021',
      status: 1
    },
    {
      IndustryCommodityCode: 'PCSLEEV-003',
      'NPD[1]': '80', 'NpdUnitType[1]': 'mm', 'EndPreparation[1]': 'SW', 'ScheduleThickness[1]': 'Sch.40',
      'NPD[2]': '80', 'NpdUnitType[2]': 'mm', 'EndPreparation[2]': 'SW', 'ScheduleThickness[2]': 'Sch.40',
      DryWeight: 0.3, DryCogX: 0, DryCogY: 0, DryCogZ: 0,
      PartDescription: '连接套管 (禁用)', MaterialsMgmtIdent: 'MAT-SLEEV-003', GeometricIndustryStandard: 'Q/SWS 34-010-2021',
      status: 0
    }
  ]
}

// 基础库相关接口
Mock.mock(/\/api\/library\/tree/, 'get', () => {
  return { code: 200, data: db['library-tree'].data, message: 'success' }
})

Mock.mock(/\/api\/library\/codelist-tree/, 'get', () => {
  return { code: 200, data: db['codelist-tree'].data, message: 'success' }
})

Mock.mock(/\/api\/library\/codelist-table-data/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const nodeLabel = url.searchParams.get('nodeLabel') || ''
  const parentShortDesc = url.searchParams.get('parentShortDesc') || ''
  const level = parseInt(url.searchParams.get('level') || '1', 10)
  
  if (/MaterialsGrade/i.test(nodeLabel)) {
    const data = db['library-codelist-hierarchy-materials-grade']
    let levelData = []
    
    if (level === 1) {
      // 提取唯一的 level1 数据
      const uniqueMap = new Map()
      data.rows.forEach(r => {
        if (!uniqueMap.has(r.level1ShortDesc)) {
          uniqueMap.set(r.level1ShortDesc, {
            shortDesc: r.level1ShortDesc,
            longDesc: r.level1LongDesc,
            codeNum: r.level1CodeNum,
            status: r.level1Status
          })
        }
      })
      levelData = Array.from(uniqueMap.values())
    } else if (level === 2) {
      // 提取匹配 level1 的唯一 level2 数据
      const uniqueMap = new Map()
      data.rows.filter(r => r.level1ShortDesc === parentShortDesc).forEach(r => {
        if (!uniqueMap.has(r.level2ShortDesc)) {
          uniqueMap.set(r.level2ShortDesc, {
            shortDesc: r.level2ShortDesc,
            longDesc: r.level2LongDesc,
            codeNum: r.level2CodeNum,
            status: r.level2Status
          })
        }
      })
      levelData = Array.from(uniqueMap.values())
    } else if (level === 3) {
      // 提取匹配 level2 的 level3 数据
      levelData = data.rows.filter(r => r.level2ShortDesc === parentShortDesc).map(r => ({
        shortDesc: r.level3ShortDesc,
        longDesc: r.level3LongDesc,
        codeNum: r.level3CodeNum,
        status: r.status
      }))
    }
    
    return {
      code: 200,
      data: {
        count: 3,
        level1: data.names.level1,
        level2: data.names.level2,
        level3: data.names.level3,
        levelData: levelData
      },
      message: 'success'
    }
  } else if (/PressureRating/i.test(nodeLabel)) {
    const data = db['library-codelist-hierarchy-pressure-rating']
    let levelData = []
    
    if (level === 1) {
      const uniqueMap = new Map()
      data.rows.forEach(r => {
        if (!uniqueMap.has(r.level1ShortDesc)) {
          uniqueMap.set(r.level1ShortDesc, {
            shortDesc: r.level1ShortDesc,
            longDesc: r.level1LongDesc,
            codeNum: r.level1CodeNum,
            status: r.level1Status
          })
        }
      })
      levelData = Array.from(uniqueMap.values())
    } else if (level === 2) {
      levelData = data.rows.filter(r => r.level1ShortDesc === parentShortDesc).map(r => ({
        shortDesc: r.level2ShortDesc,
        longDesc: r.level2LongDesc,
        codeNum: r.level2CodeNum,
        status: r.status
      }))
    }
    
    return {
      code: 200,
      data: {
        count: 2,
        level1: data.names.level1,
        level2: data.names.level2,
        level3: data.names.level3,
        levelData: levelData
      },
      message: 'success'
    }
  } else if (/FlowDirection/i.test(nodeLabel)) {
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
  } else if (/BoltType/i.test(nodeLabel)) {
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

// 新增接口：获取 Codelist 预填充值（下一个可用 codeNum）
Mock.mock(/\/api\/library\/codelist-next-code-num/, 'get', (options) => {
  // 这里简单返回一个示例值，后端实现后可替换为真实逻辑
  // 可根据 nodeLabel/category/parentShortDesc 计算
  return { code: 200, data: { nextCodeNum: 10001 }, message: 'success' }
})

// 新增接口：获取部件基础信息
Mock.mock(/\/api\/library\/component-base-data/, 'get', (options) => {
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

// 新增接口：获取公用端面数据
Mock.mock(/\/api\/library\/component-common-data/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const nodeLabel = url.searchParams.get('nodeLabel')
  const category = url.searchParams.get('category')
  const ccCode = url.searchParams.get('ccCode')
  const scheduleThickness = url.searchParams.get('scheduleThickness')

  let rows = []
  if (category === 'pipe') rows = db['library-common-data-pipe']
  else if (category === 'bolt') rows = db['library-common-data-bolt']
  else if (category === 'gasket') rows = db['library-common-data-gasket']
  else if (category === 'nut') rows = db['library-common-data-nut']
  else if (category === 'washer') rows = db['library-common-data-washer']
  else if (category === 'pipeComponent') {
    rows = nodeLabel && nodeLabel.includes('45DegElbow') ? db['library-common-data-pipeComponent-elbow'] : db['library-common-data-pipeComponent-sleeve']
  }
  
  const filtered = (rows || []).filter(row => {
    if (ccCode && row.IndustryCommodityCode !== ccCode) return false
    if (scheduleThickness) {
      const t1 = row['ScheduleThickness[1]']
      const t2 = row['ScheduleThickness[2]']
      if (t1 || t2) {
        if (t1 !== scheduleThickness && t2 !== scheduleThickness) return false
      }
    }
    return true
  })

  let commonColumns = []
  if (category === 'pipe' || category === 'pipeComponent') {
    commonColumns = [
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
  } else if (category === 'nut') {
    commonColumns = [
      { prop: 'IndustryCommodityCode', label: 'CC码' },
      { prop: 'NutType', label: 'NutType' },
      { prop: 'GeometricIndustryStandard', label: 'GeometricIndustryStandard' },
      { prop: 'NutHeight', label: 'NutHeight' }
    ]
  } else if (category === 'bolt') {
    commonColumns = [
      { prop: 'IndustryCommodityCode', label: 'CC码' },
      { prop: 'GeometricIndustryStandard', label: 'GeometricIndustryStandard' }
    ]
  } else if (category === 'gasket') {
    commonColumns = [
      { prop: 'IndustryCommodityCode', label: 'CC码' },
      { prop: 'GeometricIndustryStandard', label: 'GeometricIndustryStandard' }
    ]
  } else if (category === 'washer') {
    commonColumns = [
      { prop: 'IndustryCommodityCode', label: 'CC码' },
      { prop: 'GeometricIndustryStandard', label: 'GeometricIndustryStandard' }
    ]
  }

  return { code: 200, data: filtered, message: 'success' }
})

// 新增接口：获取外形重量重心描述数据
Mock.mock(/\/api\/library\/component-appearance-data/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost')
  const nodeLabel = url.searchParams.get('nodeLabel')
  const category = url.searchParams.get('category')
  const ccCode = url.searchParams.get('ccCode')
  const scheduleThickness = url.searchParams.get('scheduleThickness')

  let rows = []
  if (category === 'pipe') rows = db['library-appearance-data-pipe']
  else if (category === 'pipeComponent') {
    rows = nodeLabel && nodeLabel.includes('45DegElbow') ? db['library-appearance-data-pipeComponent-elbow'] : db['library-appearance-data-pipeComponent-sleeve']
  }
  
  const filtered = (rows || []).filter(row => {
    if (ccCode && row.IndustryCommodityCode !== ccCode) return false
    if (scheduleThickness) {
      const t1 = row['ScheduleThickness[1]']
      const t2 = row['ScheduleThickness[2]']
      if (t1 || t2) {
        if (t1 !== scheduleThickness && t2 !== scheduleThickness) return false
      }
    }
    return true
  })

  return { code: 200, data: filtered, message: 'success' }
})

// 新增接口：获取基础库选项 (用于新增下拉)
Mock.mock('/api/library/base-options', 'get', () => {
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

// 保存部件类型基础 (含另存为逻辑)
Mock.mock(/\/api\/library\/save-component-base/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const { isSaveAs, newNodeData, oldNodeLabel, category } = body
  
  if (isSaveAs) {
    // 1. 在目录树中添加新路径
    const parts = oldNodeLabel.split('|')
    if (parts.length >= 4) {
      const newPath = {
        level1: parts[0],
        level2: parts[1],
        level3: newNodeData.manufacturingStd,
        level4: parts[3],
        category: category
      }
      db['library-tree'].data.push(newPath)
      
      // 2. 确定数据池 Key
      let baseKey = `library-component-base-data-${category}`
      let commonKey = `library-common-data-${category}`
      let appearanceKey = `library-appearance-data-${category}`
      
      // 特殊处理 pipeComponent
      if (category === 'pipeComponent') {
        const sub = parts[3].includes('45DegElbow') ? 'elbow' : 'sleeve'
        baseKey = `library-component-base-data-pipeComponent-${sub}`
        commonKey = `library-common-data-pipeComponent-${sub}`
        appearanceKey = `library-appearance-data-pipeComponent-${sub}`
      }

      // 3. 模拟复制过程 (实际由后端完成)
      const newBaseRow = {
        IndustryCommodityCode: newNodeData.ccCode,
        ScheduleThickness: newNodeData.scheduleThickness,
        MaterialGrade: newNodeData.material,
        GeometricIndustryStandard: newNodeData.manufacturingStd,
        status: 1
      }
      
      if (db[baseKey]) db[baseKey].push(newBaseRow)
      // 实际开发中，这里还会复制对应的 CommonData 和 AppearanceData
      // 并在新路径下建立关联
      
      return { code: 200, message: '另存为成功', data: { newPath: `${newPath.level1}|${newPath.level2}|${newPath.level3}|${newPath.level4}` } }
    }
  } else {
    // 普通保存逻辑
    return { code: 200, message: '保存成功' }
  }
  return { code: 400, message: '保存失败，路径解析错误或参数不足' }
})

// 拦截请求


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
