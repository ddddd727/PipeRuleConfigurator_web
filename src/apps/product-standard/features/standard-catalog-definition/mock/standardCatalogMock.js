const professionals = [
  { label: '管系', value: 'piping' },
  { label: '电气', value: 'electrical' },
  { label: '仪表', value: 'instrumentation' }
]

const professionalCatalogMap = {
  piping: {
    leftComponentTypes: [
      {
        id: 'piping-component-pipe',
        name: '管材',
        enabled: true,
        productStandards: [
          { id: 'piping-standard-gbt8163', code: 'GB/T 8163', enabled: true },
          { id: 'piping-standard-gbt14976', code: 'GB/T 14976', enabled: true },
          { id: 'piping-standard-astm-a312', code: 'ASTM A312', enabled: false }
        ]
      },
      {
        id: 'piping-component-fitting',
        name: '管件',
        enabled: true,
        productStandards: [
          { id: 'piping-standard-gbt12459', code: 'GB/T 12459', enabled: true },
          { id: 'piping-standard-sht3408', code: 'SH/T 3408', enabled: true },
          { id: 'piping-standard-asme-b169', code: 'ASME B16.9', enabled: false }
        ]
      },
      {
        id: 'piping-component-valve',
        name: '阀门',
        enabled: false,
        productStandards: [
          { id: 'piping-standard-gbt12224', code: 'GB/T 12224', enabled: true },
          { id: 'piping-standard-api600', code: 'API 600', enabled: true },
          { id: 'piping-standard-api602', code: 'API 602', enabled: false }
        ]
      }
    ],
    rightComponentTypeCatalogs: [
      {
        id: 'piping-catalog-pipe',
        name: '管材',
        customCatalogs: [
          {
            id: 'piping-custom-stainless-pipe',
            name: '不锈钢管',
            standardCatalogs: [
              { id: 'piping-catalog-standard-gbt14976', code: 'GB/T 14976', enabled: true },
              { id: 'piping-catalog-standard-astm-a312', code: 'ASTM A312', enabled: false }
            ]
          },
          {
            id: 'piping-custom-carbon-pipe',
            name: '碳钢管',
            standardCatalogs: [
              { id: 'piping-catalog-standard-gbt8163', code: 'GB/T 8163', enabled: true },
              { id: 'piping-catalog-standard-astm-a106', code: 'ASTM A106', enabled: true }
            ]
          }
        ]
      },
      {
        id: 'piping-catalog-fitting',
        name: '管件',
        customCatalogs: [
          {
            id: 'piping-custom-butt-weld-fitting',
            name: '无缝对焊管件',
            standardCatalogs: [
              { id: 'piping-catalog-standard-gbt12459', code: 'GB/T 12459', enabled: true },
              { id: 'piping-catalog-standard-asme-b169', code: 'ASME B16.9', enabled: true }
            ]
          },
          {
            id: 'piping-custom-socket-fitting',
            name: '承插焊管件',
            standardCatalogs: [
              { id: 'piping-catalog-standard-gbt14383', code: 'GB/T 14383', enabled: true },
              { id: 'piping-catalog-standard-mss-sp83', code: 'MSS SP-83', enabled: false }
            ]
          }
        ]
      },
      {
        id: 'piping-catalog-valve',
        name: '阀门',
        customCatalogs: [
          {
            id: 'piping-custom-gate-valve',
            name: '闸阀',
            standardCatalogs: [
              { id: 'piping-catalog-standard-api600', code: 'API 600', enabled: true },
              { id: 'piping-catalog-standard-gbt12234', code: 'GB/T 12234', enabled: true }
            ]
          },
          {
            id: 'piping-custom-ball-valve',
            name: '球阀',
            standardCatalogs: [
              { id: 'piping-catalog-standard-api608', code: 'API 608', enabled: true },
              { id: 'piping-catalog-standard-gbt12237', code: 'GB/T 12237', enabled: false }
            ]
          }
        ]
      }
    ]
  },
  electrical: {
    leftComponentTypes: [
      {
        id: 'electrical-component-cable',
        name: '电缆',
        enabled: true,
        productStandards: [
          { id: 'electrical-standard-gbt12706', code: 'GB/T 12706', enabled: true },
          { id: 'electrical-standard-gbt9330', code: 'GB/T 9330', enabled: true },
          { id: 'electrical-standard-iec60502', code: 'IEC 60502', enabled: false }
        ]
      },
      {
        id: 'electrical-component-tray',
        name: '桥架',
        enabled: true,
        productStandards: [
          { id: 'electrical-standard-jbt10216', code: 'JB/T 10216', enabled: true },
          { id: 'electrical-standard-cecs31', code: 'CECS 31', enabled: true }
        ]
      },
      {
        id: 'electrical-component-panel',
        name: '配电箱',
        enabled: false,
        productStandards: [
          { id: 'electrical-standard-gbt725112', code: 'GB/T 7251.12', enabled: true },
          { id: 'electrical-standard-iec61439', code: 'IEC 61439-2', enabled: false }
        ]
      }
    ],
    rightComponentTypeCatalogs: [
      {
        id: 'electrical-catalog-cable',
        name: '电缆',
        customCatalogs: [
          {
            id: 'electrical-custom-power-cable',
            name: '0.6/1kV 电力电缆',
            standardCatalogs: [
              { id: 'electrical-catalog-standard-gbt127061', code: 'GB/T 12706.1', enabled: true },
              { id: 'electrical-catalog-standard-iec605021', code: 'IEC 60502-1', enabled: true }
            ]
          },
          {
            id: 'electrical-custom-control-cable',
            name: '控制电缆',
            standardCatalogs: [
              { id: 'electrical-catalog-standard-gbt9330', code: 'GB/T 9330', enabled: true },
              { id: 'electrical-catalog-standard-jbt8734', code: 'JB/T 8734', enabled: false }
            ]
          }
        ]
      },
      {
        id: 'electrical-catalog-tray',
        name: '桥架',
        customCatalogs: [
          {
            id: 'electrical-custom-trough-tray',
            name: '槽式桥架',
            standardCatalogs: [
              { id: 'electrical-catalog-standard-jbt10216', code: 'JB/T 10216', enabled: true },
              { id: 'electrical-catalog-standard-cecs31', code: 'CECS 31', enabled: true }
            ]
          },
          {
            id: 'electrical-custom-ladder-tray',
            name: '梯式桥架',
            standardCatalogs: [
              { id: 'electrical-catalog-standard-jgt3053', code: 'JG/T 3053', enabled: true },
              { id: 'electrical-catalog-standard-cecs31b', code: 'CECS 31', enabled: false }
            ]
          }
        ]
      },
      {
        id: 'electrical-catalog-panel',
        name: '配电箱',
        customCatalogs: [
          {
            id: 'electrical-custom-low-voltage-panel',
            name: '低压配电箱',
            standardCatalogs: [
              { id: 'electrical-catalog-standard-gbt725112', code: 'GB/T 7251.12', enabled: true },
              { id: 'electrical-catalog-standard-iec61439', code: 'IEC 61439-2', enabled: true }
            ]
          },
          {
            id: 'electrical-custom-explosion-proof-panel',
            name: '防爆配电箱',
            standardCatalogs: [
              { id: 'electrical-catalog-standard-gbt38361', code: 'GB/T 3836.1', enabled: true },
              { id: 'electrical-catalog-standard-gbt38363', code: 'GB/T 3836.3', enabled: false }
            ]
          }
        ]
      }
    ]
  },
  instrumentation: {
    leftComponentTypes: [
      {
        id: 'instrumentation-component-manifold',
        name: '仪表阀组',
        enabled: true,
        productStandards: [
          { id: 'instrumentation-standard-jbt8622', code: 'JB/T 8622', enabled: true },
          { id: 'instrumentation-standard-asme-b1634', code: 'ASME B16.34', enabled: false }
        ]
      },
      {
        id: 'instrumentation-component-temperature',
        name: '温度仪表',
        enabled: true,
        productStandards: [
          { id: 'instrumentation-standard-jbt8623', code: 'JB/T 8623', enabled: true },
          { id: 'instrumentation-standard-iec60751', code: 'IEC 60751', enabled: true }
        ]
      },
      {
        id: 'instrumentation-component-pressure',
        name: '压力仪表',
        enabled: false,
        productStandards: [
          { id: 'instrumentation-standard-gbt1226', code: 'GB/T 1226', enabled: true },
          { id: 'instrumentation-standard-iec61298', code: 'IEC 61298', enabled: false }
        ]
      }
    ],
    rightComponentTypeCatalogs: [
      {
        id: 'instrumentation-catalog-manifold',
        name: '仪表阀组',
        customCatalogs: [
          {
            id: 'instrumentation-custom-two-valve',
            name: '二阀组',
            standardCatalogs: [
              { id: 'instrumentation-catalog-standard-jbt8622', code: 'JB/T 8622', enabled: true },
              { id: 'instrumentation-catalog-standard-asme-b1634', code: 'ASME B16.34', enabled: true }
            ]
          },
          {
            id: 'instrumentation-custom-five-valve',
            name: '五阀组',
            standardCatalogs: [
              { id: 'instrumentation-catalog-standard-hgt20592', code: 'HG/T 20592', enabled: true },
              { id: 'instrumentation-catalog-standard-api598', code: 'API 598', enabled: false }
            ]
          }
        ]
      },
      {
        id: 'instrumentation-catalog-temperature',
        name: '温度仪表',
        customCatalogs: [
          {
            id: 'instrumentation-custom-thermal-resistance',
            name: '热电阻',
            standardCatalogs: [
              { id: 'instrumentation-catalog-standard-iec60751', code: 'IEC 60751', enabled: true },
              { id: 'instrumentation-catalog-standard-jjt862', code: 'JJG 862', enabled: true }
            ]
          },
          {
            id: 'instrumentation-custom-thermocouple',
            name: '热电偶',
            standardCatalogs: [
              { id: 'instrumentation-catalog-standard-iec60584', code: 'IEC 60584', enabled: true },
              { id: 'instrumentation-catalog-standard-jjt351', code: 'JJG 351', enabled: false }
            ]
          }
        ]
      },
      {
        id: 'instrumentation-catalog-pressure',
        name: '压力仪表',
        customCatalogs: [
          {
            id: 'instrumentation-custom-pressure-gauge',
            name: '压力表',
            standardCatalogs: [
              { id: 'instrumentation-catalog-standard-gbt1226', code: 'GB/T 1226', enabled: true },
              { id: 'instrumentation-catalog-standard-jjt52', code: 'JJG 52', enabled: true }
            ]
          },
          {
            id: 'instrumentation-custom-pressure-transmitter',
            name: '压力变送器',
            standardCatalogs: [
              { id: 'instrumentation-catalog-standard-iec61298', code: 'IEC 61298', enabled: true },
              { id: 'instrumentation-catalog-standard-jjt882', code: 'JJG 882', enabled: false }
            ]
          }
        ]
      }
    ]
  }
}

const deepClone = (value) => JSON.parse(JSON.stringify(value))

export function createStandardCatalogMockData() {
  return {
    professionals: deepClone(professionals),
    professionalCatalogMap: deepClone(professionalCatalogMap)
  }
}
