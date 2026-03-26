import RouterPassthrough from '@/layouts/components/RouterPassthrough.vue'
import DictTable from '@/apps/pipe-spec/features/dict/components/DictTable.vue'
import DictPipingTable from '@/apps/pipe-spec/features/dict/components/DictPipingTable.vue'

export default {
  path: 'dict',
  component: RouterPassthrough,
  meta: { title: '字典定义', icon: 'Reading' },
  redirect: '/pipe-spec/dict/attribute/piping-class',
  children: [
    // ── 业务属性定义 ─────────────────────────────
    {
      path: 'attribute',
      component: RouterPassthrough,
      meta: { title: '业务属性定义', icon: 'Menu' },
      redirect: '/pipe-spec/dict/attribute/piping-class',
      children: [
        { path: 'piping-class',        name: 'PipingClass',        component: DictTable,       meta: { title: '管材等级',     icon: 'Medal'        }, props: { dictId: 'piping-class' } },
        { path: 'mat-category',        name: 'MatCategory',        component: DictTable,       meta: { title: '主材料',       icon: 'Box'          }, props: { dictId: 'mat-category' } },
        { path: 'piping-standard',     name: 'PipingStandard',     component: DictTable,       meta: { title: '管材标准',     icon: 'Collection'   }, props: { dictId: 'piping-standard' } },
        { path: 'mat-grade',           name: 'MatGrade',           component: DictTable,       meta: { title: '牌号',         icon: 'Ticket'       }, props: { dictId: 'mat-grade' } },
        { path: 'mat-grade-rule',      name: 'MatGradeRule',       component: DictTable,       meta: { title: '牌号规则',     icon: 'SetUp'        }, props: { dictId: 'mat-grade-rule' } },
        { path: 'flange-standard',     name: 'FlangeStandard',     component: DictTable,       meta: { title: '法兰等级标准', icon: 'Notebook'     }, props: { dictId: 'flange-standard' } },
        { path: 'pressure-rating',     name: 'PressureRating',     component: DictTable,       meta: { title: '法兰压力等级', icon: 'Odometer'     }, props: { dictId: 'pressure-rating' } },
        { path: 'schedule-thickness',  name: 'ScheduleThickness',  component: DictTable,       meta: { title: '壁厚等级',     icon: 'CopyDocument' }, props: { dictId: 'schedule-thickness' } }
      ]
    },

    // ── 管子连接件 ──────────────────────────────
    {
      path: 'fitting',
      component: RouterPassthrough,
      meta: { title: '管子连接件', icon: 'Connection' },
      children: [
        { path: 'elbow',    name: 'FittingElbow',    component: DictPipingTable, meta: { title: 'Elbow (弯头)',    icon: 'RefreshLeft'   }, props: { dictId: 'part-elbow' } },
        { path: 'red',      name: 'FittingRed',      component: DictPipingTable, meta: { title: 'Red (异径)',     icon: 'Filter'        }, props: { dictId: 'part-red' } },
        { path: 'tee',      name: 'FittingTee',      component: DictPipingTable, meta: { title: 'Tee (三通)',     icon: 'Share'         }, props: { dictId: 'part-tee' } },
        { path: 'sleeve',   name: 'FittingSleeve',   component: DictPipingTable, meta: { title: 'Sleeve (套管)',  icon: 'Coin'          }, props: { dictId: 'part-sleeve' } },
        { path: 'bosses',   name: 'FittingBosses',   component: DictPipingTable, meta: { title: 'Bosses (凸台)',  icon: 'Aim'           }, props: { dictId: 'part-bosses' } },
        { path: 'saddles',  name: 'FittingSaddles',  component: DictPipingTable, meta: { title: 'Saddles (鞍座)', icon: 'Magnet'        }, props: { dictId: 'part-saddles' } },
        { path: 'caps',     name: 'FittingCaps',     component: DictPipingTable, meta: { title: 'Caps (管帽)',    icon: 'CircleClose'   }, props: { dictId: 'part-caps' } },
        { path: 'overpass', name: 'FittingOverpass', component: DictPipingTable, meta: { title: 'Overpass (过桥)',icon: 'Top'           }, props: { dictId: 'part-overpass' } }
      ]
    },

    // ── 法兰连接件 ──────────────────────────────
    {
      path: 'flange-conn',
      component: RouterPassthrough,
      meta: { title: '法兰连接件', icon: 'Link' },
      children: [
        { path: 'flange',      name: 'FlangeConn',        component: DictPipingTable, meta: { title: 'Flange (法兰)',      icon: 'CircleCheck' }, props: { dictId: 'part-flange' } },
        { path: 'blind',       name: 'FlangeBlind',       component: DictPipingTable, meta: { title: 'Blind (盲板)',      icon: 'Remove'      }, props: { dictId: 'part-blindFlange' } },
        { path: 'gasket',      name: 'FlangeGasket',      component: DictPipingTable, meta: { title: 'Gasket (垫片)',     icon: 'Help'        }, props: { dictId: 'part-gasket' } },
        { path: 'bolts',       name: 'FlangeBolts',       component: DictPipingTable, meta: { title: 'Bolts (螺栓)',      icon: 'Key'         }, props: { dictId: 'part-bolt' } },
        { path: 'nuts',        name: 'FlangeNuts',        component: DictPipingTable, meta: { title: 'Nuts (螺母)',       icon: 'Operation'   }, props: { dictId: 'part-nut' } },
        { path: 'washers',     name: 'FlangeWashers',     component: DictPipingTable, meta: { title: 'Washers (垫圈)',    icon: 'Sunny'       }, props: { dictId: 'part-washer' } },
        { path: 'accessories', name: 'FlangeAccessories', component: DictPipingTable, meta: { title: 'Accessories (附件)',icon: 'Suitcase'    }, props: { dictId: 'part-accessories' } },
        { path: 'joints',      name: 'FlangeJoints',      component: DictPipingTable, meta: { title: 'Joints (接头)',     icon: 'Switch'      }, props: { dictId: 'part-joints' } }
      ]
    }
  ]
}
