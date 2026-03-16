import MainLayout from '@/layout/MainLayout.vue'
import DictLayout from '@/views/DictLayout.vue'
import DictTable from '@/components/DictTable.vue'
import DictPipingTable from '@/components/DictPipingTable.vue'

export default {
  path: '/dict',
  component: MainLayout,
  meta: { title: '字典定义', icon: 'Reading' },
  redirect: '/dict/attribute/std-series',
  children: [
    // ============================================================
    // 分组 1: 业务属性 (对应后端 DictConfiguration)
    // ============================================================
    {
      path: 'attribute',
      component: DictLayout,
      meta: { title: '业务属性定义', icon: 'Menu' },
      redirect: '/dict/attribute/std-series',
      children: [
        { 
          path: 'std-series', 
          name: 'StdSeries',
          component: DictTable, 
          meta: { title: '标准系列', icon: 'List' }, 
          props: { dictId: 'std-series' }
        },
        { 
          path: 'piping-class', 
          name: 'PipingClass',
          component: DictTable, 
          meta: { title: '管材等级', icon: 'Medal' }, 
          props: { dictId: 'piping-class' }
        },
        { 
          path: 'mat-category', 
          name: 'MatCategory',
          component: DictTable, 
          meta: { title: '主材料', icon: 'Box' }, 
          props: { dictId: 'mat-category' }
        },
        { 
          path: 'piping-standard', 
          name: 'PipingStandard',
          component: DictTable, 
          meta: { title: '管材标准', icon: 'Collection' }, 
          props: { dictId: 'piping-standard' }
        },
        { 
          path: 'mat-grade', 
          name: 'MatGrade',
          component: DictTable, 
          meta: { title: 'B3-牌号', icon: 'Ticket' }, 
          props: { dictId: 'mat-grade' }
        },
        { 
          path: 'mat-grade-rule', 
          name: 'MatGradeRule',
          component: DictTable, 
          meta: { title: 'B3-牌号规则', icon: 'SetUp'}, // 新增
          props: { dictId: 'mat-grade-rule' }
        },
        { 
          path: 'flange-standard', 
          name: 'FlangeStandard',
          component: DictTable, 
          meta: { title: '法兰等级标准', icon: 'Notebook' }, 
          props: { dictId: 'flange-standard' }
        },
        { 
          path: 'pressure-rating', 
          name: 'PressureRating',
          component: DictTable, 
          meta: { title: '法兰压力等级', icon: 'Odometer' }, 
          props: { dictId: 'pressure-rating' }
        },
        { 
          path: 'schedule-series', 
          name: 'ScheduleSeries',
          component: DictTable, 
          meta: { title: '壁厚系列', icon: 'Files' }, // 新增
          props: { dictId: 'schedule-series' }
        },
        { 
          path: 'schedule-thickness', 
          name: 'ScheduleThickness',
          component: DictTable, 
          meta: { title: '壁厚等级', icon: 'CopyDocument' }, // 替代原来的 schedule
          props: { dictId: 'schedule-thickness' }
        },
        { 
          path: 'wall-thickness-data', 
          name: 'WallThicknessData',
          component: DictTable, 
          meta: { title: '外径壁厚表', icon: 'DataBoard' }, // 新增
          props: { dictId: 'wall-thickness-data' }
        }
      ]
    },

    // ============================================================
    // 分组 2: 管子连接件 (保留原有配置)
    // ============================================================
    {
      path: 'fitting',
      component: DictLayout,
      meta: { title: '管子连接件', icon: 'Connection' },
      children: [
        { 
          path: 'elbow', 
          component: DictPipingTable, 
          meta: { title: 'Elbow (弯头)', icon: 'RefreshLeft' }, 
          props: { dictId: 'part-elbow' } 
        },
        { 
          path: 'red', 
          component: DictPipingTable, 
          meta: { title: 'Red (异径)', icon: 'Filter' }, 
          props: { dictId: 'part-red' } 
        },
        { 
          path: 'tee', 
          component: DictPipingTable, 
          meta: { title: 'Tee (三通)', icon: 'Share' }, 
          props: { dictId: 'part-tee' } 
        },
        { 
          path: 'sleeve', 
          component: DictPipingTable, 
          meta: { title: 'Sleeve (套管)', icon: 'Coin' }, 
          props: { dictId: 'part-sleeve' } 
        },
        { 
          path: 'bosses', 
          component: DictPipingTable, 
          meta: { title: 'Bosses (凸台)', icon: 'Aim' }, 
          props: { dictId: 'part-bosses' } 
        },
        { 
          path: 'saddles', 
          component: DictPipingTable, 
          meta: { title: 'Saddles (鞍座)', icon: 'Magnet' }, 
          props: { dictId: 'part-saddles' } 
        },
        { 
          path: 'caps', 
          component: DictPipingTable, 
          meta: { title: 'Caps (管帽)', icon: 'CircleClose' }, 
          props: { dictId: 'part-caps' } 
        },
        { 
          path: 'overpass', 
          component: DictPipingTable, 
          meta: { title: 'Overpass (过桥)', icon: 'Top' }, 
          props: { dictId: 'part-overpass' } 
        }
      ]
    },

    // ============================================================
    // 分组 3: 法兰连接 (保留原有配置)
    // ============================================================
    {
      path: 'flange-conn',
      component: DictLayout,
      meta: { title: '法兰连接', icon: 'Link' },
      children: [
        { 
          path: 'flange', 
          component: DictPipingTable, 
          meta: { title: 'Flange (法兰)', icon: 'CircleCheck' }, 
          props: { dictId: 'part-flange' } 
        },
        { 
          path: 'blind', 
          component: DictPipingTable, 
          meta: { title: 'Blind (盲板)', icon: 'Remove' }, 
          props: { dictId: 'part-blindFlange' } 
        },
        { 
          path: 'gasket', 
          component: DictPipingTable, 
          meta: { title: 'Gasket (垫片)', icon: 'Help' }, 
          props: { dictId: 'part-gasket' } 
        },
        { 
          path: 'bolts', 
          component: DictPipingTable, 
          meta: { title: 'Bolts (螺栓)', icon: 'Key' }, 
          props: { dictId: 'part-bolt' } 
        },
        { 
          path: 'nuts', 
          component: DictPipingTable, 
          meta: { title: 'Nuts (螺母)', icon: 'Operation' }, 
          props: { dictId: 'part-nut' } 
        },
        { 
          path: 'washers', 
          component: DictPipingTable, 
          meta: { title: 'Washers (垫圈)', icon: 'Sunny' }, 
          props: { dictId: 'part-washer' } 
        },
        { 
          path: 'accessories', 
          component: DictPipingTable, 
          meta: { title: 'Accessories (附件)', icon: 'Suitcase' }, 
          props: { dictId: 'part-accessories' } 
        },
        { 
          path: 'joints', 
          component: DictPipingTable, 
          meta: { title: 'Joints (接头)', icon: 'Switch' }, 
          props: { dictId: 'part-joints' } 
        }
      ]
    }
  ]
}