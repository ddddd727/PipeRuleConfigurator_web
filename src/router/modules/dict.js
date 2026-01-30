import MainLayout from '@/layout/MainLayout.vue'
import DictLayout from '@/views/DictLayout.vue'
import DictTable from '@/components/DictTable.vue'

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
          props: { dictId: 'std-series' } // ✅ 匹配后端: std-series
        },
        { 
          path: 'piping-class', // 🔄 路径修正: pipe-grade -> piping-class
          name: 'PipingClass',
          component: DictTable, 
          meta: { title: 'A-管材等级', icon: 'Medal' }, 
          props: { dictId: 'piping-class' } // ✅ 匹配后端: piping-class
        },
        { 
          path: 'mat-category', // 🔄 路径修正: main-material -> mat-category
          name: 'MatCategory',
          component: DictTable, 
          meta: { title: 'B1-主材料', icon: 'Box' }, 
          props: { dictId: 'mat-category' } // ✅ 匹配后端: mat-category
        },
        { 
          path: 'piping-standard', // 🔄 路径修正: pipe-std -> piping-standard
          name: 'PipingStandard',
          component: DictTable, 
          meta: { title: 'B2-管材标准', icon: 'Collection' }, 
          props: { dictId: 'piping-standard' } // ✅ 匹配后端: piping-standard
        },
        { 
          path: 'mat-grade', 
          name: 'MatGrade',
          component: DictTable, 
          meta: { title: 'B3-牌号', icon: 'Ticket' }, 
          props: { dictId: 'mat-grade' } // ✅ 匹配后端: mat-grade
        },
        { 
          path: 'flange-standard', // 🔄 路径修正: flange-std -> flange-standard
          name: 'FlangeStandard',
          component: DictTable, 
          meta: { title: 'C1-法兰标准', icon: 'Notebook' }, 
          props: { dictId: 'flange-standard' } // ✅ 匹配后端: flange-standard
        },
        { 
          path: 'pressure-rating', // 🔄 路径修正: flange-rating -> pressure-rating
          name: 'PressureRating',
          component: DictTable, 
          meta: { title: 'C2-压力等级', icon: 'Odometer' }, 
          props: { dictId: 'pressure-rating' } // ✅ 匹配后端: pressure-rating
        },
        { 
          path: 'schedule', // 🔄 路径修正: wall-thk -> schedule
          name: 'Schedule',
          component: DictTable, 
          meta: { title: 'D-壁厚等级', icon: 'CopyDocument' }, 
          props: { dictId: 'schedule' } // ✅ 匹配后端: schedule
        },
        { 
          path: 'end-prep', // 🆕 新增后端条目
          name: 'EndPrep',
          component: DictTable, 
          meta: { title: 'E-端面处理', icon: 'Scissor' }, 
          props: { dictId: 'end-prep' } // ✅ 匹配后端: end-prep
        }
      ]
    },

    // ============================================================
    // 分组 2: 管子连接件 (保留原有配置，暂时未变)
    // ============================================================
    {
      path: 'fitting',
      component: DictLayout,
      meta: { title: '管子连接件', icon: 'Connection' },
      children: [
        { 
          path: 'elbow', 
          component: DictTable, 
          meta: { title: 'Elbow (弯头)', icon: 'RefreshLeft' }, 
          props: { dictId: 'part-elbow' } 
        },
        { 
          path: 'red', 
          component: DictTable, 
          meta: { title: 'Red (大小头)', icon: 'Filter' }, 
          props: { dictId: 'part-red' } 
        },
        { 
          path: 'tee', 
          component: DictTable, 
          meta: { title: 'Tee (三通)', icon: 'Share' }, 
          props: { dictId: 'part-tee' } 
        },
        { 
          path: 'sleeve', 
          component: DictTable, 
          meta: { title: 'Sleeve (套管)', icon: 'Coin' }, 
          props: { dictId: 'part-sleeve' } 
        },
        { 
          path: 'bosses', 
          component: DictTable, 
          meta: { title: 'Bosses (凸台)', icon: 'Aim' }, 
          props: { dictId: 'part-bosses' } 
        },
        { 
          path: 'saddles', 
          component: DictTable, 
          meta: { title: 'Saddles (鞍座)', icon: 'Magnet' }, 
          props: { dictId: 'part-saddles' } 
        },
        { 
          path: 'caps', 
          component: DictTable, 
          meta: { title: 'Caps (管帽)', icon: 'CircleClose' }, 
          props: { dictId: 'part-caps' } 
        },
        { 
          path: 'overpass', 
          component: DictTable, 
          meta: { title: 'Overpass (过桥)', icon: 'Top' }, 
          props: { dictId: 'part-overpass' } 
        }
      ]
    },

    // ============================================================
    // 分组 3: 法兰连接 (保留原有配置，暂时未变)
    // ============================================================
    {
      path: 'flange-conn',
      component: DictLayout,
      meta: { title: '法兰连接', icon: 'Link' },
      children: [
        { 
          path: 'flange', 
          component: DictTable, 
          meta: { title: 'Flange (法兰)', icon: 'CircleCheck' }, 
          props: { dictId: 'part-flange' } 
        },
        { 
          path: 'blind', 
          component: DictTable, 
          meta: { title: 'Blind (盲板)', icon: 'Remove' }, 
          props: { dictId: 'part-blind-flange' } 
        },
        { 
          path: 'gasket', 
          component: DictTable, 
          meta: { title: 'Gasket (垫片)', icon: 'Help' }, 
          props: { dictId: 'part-gasket' } 
        },
        { 
          path: 'bolts', 
          component: DictTable, 
          meta: { title: 'Bolts (螺栓)', icon: 'Key' }, 
          props: { dictId: 'part-bolts' } 
        },
        { 
          path: 'nuts', 
          component: DictTable, 
          meta: { title: 'Nuts (螺母)', icon: 'Operation' }, 
          props: { dictId: 'part-nuts' } 
        },
        { 
          path: 'washers', 
          component: DictTable, 
          meta: { title: 'Washers (垫圈)', icon: 'Sunny' }, 
          props: { dictId: 'part-washers' } 
        },
        { 
          path: 'accessories', 
          component: DictTable, 
          meta: { title: 'Accessories (附件)', icon: 'Suitcase' }, 
          props: { dictId: 'part-accessories' } 
        },
        { 
          path: 'joints', 
          component: DictTable, 
          meta: { title: 'Joints (接头)', icon: 'Switch' }, 
          props: { dictId: 'part-joints' } 
        }
      ]
    }
  ]
}