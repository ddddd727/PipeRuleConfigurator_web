import MainLayout from '@/layout/MainLayout.vue'
import DictLayout from '@/views/DictLayout.vue'
import DictTable from '@/components/DictTable.vue'

export default {
  path: '/dict',
  component: MainLayout,
  meta: { title: '字典定义', icon: 'Reading' }, // Reading: 像一本字典书
  redirect: '/dict/attribute/std-series',
  children: [
    // ============================================================
    // 分组 1: 业务属性 (Business Attributes)
    // ============================================================
    {
      path: 'attribute',
      component: DictLayout,
      meta: { title: '业务属性定义', icon: 'Menu' },
      redirect: '/dict/attribute/std-series',
      children: [
        { 
          path: 'std-series', 
          component: DictTable, 
          meta: { title: '标准系列', icon: 'List' }, // List: 基础清单
          props: { dictId: 'std-series' } 
        },
        { 
          path: 'pipe-grade', 
          component: DictTable, 
          meta: { title: 'A-管材等级', icon: 'Medal' }, // Medal: 等级/金牌
          props: { dictId: 'pipe-grade' } 
        },
        { 
          path: 'main-material', 
          component: DictTable, 
          meta: { title: 'B1-主材料', icon: 'Box' }, // Box: 原材料箱
          props: { dictId: 'mat-main' } 
        },
        { 
          path: 'pipe-std', 
          component: DictTable, 
          meta: { title: 'B2-管材标准', icon: 'Collection' }, // Collection: 标准合集
          props: { dictId: 'pipe-std' } 
        },
        { 
          path: 'mat-grade', 
          component: DictTable, 
          meta: { title: 'B3-牌号', icon: 'Ticket' }, // Ticket: 像一个标签牌
          props: { dictId: 'mat-grade' } 
        },
        { 
          path: 'flange-std', 
          component: DictTable, 
          meta: { title: 'C1-法兰标准', icon: 'Notebook' }, // Notebook: 规范手册
          props: { dictId: 'flange-std' } 
        },
        { 
          path: 'flange-rating', 
          component: DictTable, 
          meta: { title: 'C2-法兰压力', icon: 'Odometer' }, // Odometer: 仪表盘代表压力
          props: { dictId: 'flange-rating' } 
        },
        { 
          path: 'wall-thk', 
          component: DictTable, 
          meta: { title: 'D-壁厚等级', icon: 'CopyDocument' }, // CopyDocument: 多层叠加代表厚度
          props: { dictId: 'pipe-wall-thk' } 
        }
      ]
    },

    // ============================================================
    // 分组 2: 管子连接件 (Fittings) - 使用形状拟态图标
    // ============================================================
    {
      path: 'fitting',
      component: DictLayout,
      meta: { title: '管子连接件', icon: 'Connection' }, // Connection: 连接
      children: [
        { 
          path: 'elbow', 
          component: DictTable, 
          meta: { title: 'Elbow (弯头)', icon: 'RefreshLeft' }, // RefreshLeft: 弯曲的形状
          props: { dictId: 'part-elbow' } 
        },
        { 
          path: 'red', 
          component: DictTable, 
          meta: { title: 'Red (大小头)', icon: 'Filter' }, // Filter: 漏斗形状(大变小)
          props: { dictId: 'part-red' } 
        },
        { 
          path: 'tee', 
          component: DictTable, 
          meta: { title: 'Tee (三通)', icon: 'Share' }, // Share: 分支形状
          props: { dictId: 'part-tee' } 
        },
        { 
          path: 'sleeve', 
          component: DictTable, 
          meta: { title: 'Sleeve (套管)', icon: 'Coin' }, // Coin: 圆柱体侧面
          props: { dictId: 'part-sleeve' } 
        },
        { 
          path: 'bosses', 
          component: DictTable, 
          meta: { title: 'Bosses (凸台)', icon: 'Aim' }, // Aim: 靶点/凸起
          props: { dictId: 'part-bosses' } 
        },
        { 
          path: 'saddles', 
          component: DictTable, 
          meta: { title: 'Saddles (鞍座)', icon: 'Magnet' }, // Magnet: U型磁铁像马鞍
          props: { dictId: 'part-saddles' } 
        },
        { 
          path: 'caps', 
          component: DictTable, 
          meta: { title: 'Caps (管帽)', icon: 'CircleClose' }, // CircleClose: 封堵/结束
          props: { dictId: 'part-caps' } 
        },
        { 
          path: 'overpass', 
          component: DictTable, 
          meta: { title: 'Overpass (过桥)', icon: 'Top' }, // Top: 向上跨越
          props: { dictId: 'part-overpass' } 
        }
      ]
    },

    // ============================================================
    // 分组 3: 法兰连接 (Flange Connections)
    // ============================================================
    {
      path: 'flange-conn',
      component: DictLayout,
      meta: { title: '法兰连接', icon: 'Link' }, // Link: 链结
      children: [
        { 
          path: 'flange', 
          component: DictTable, 
          meta: { title: 'Flange (法兰)', icon: 'CircleCheck' }, // Circle: 圆环
          props: { dictId: 'part-flange' } 
        },
        { 
          path: 'blind', 
          component: DictTable, 
          meta: { title: 'Blind (盲板)', icon: 'Remove' }, // Remove: 禁止通行/盲板
          props: { dictId: 'part-blind-flange' } 
        },
        { 
          path: 'gasket', 
          component: DictTable, 
          meta: { title: 'Gasket (垫片)', icon: 'Help' }, // Help: 圆圈形状
          props: { dictId: 'part-gasket' } 
        },
        { 
          path: 'bolts', 
          component: DictTable, 
          meta: { title: 'Bolts (螺栓)', icon: 'Key' }, // Key: 像螺丝/紧固
          props: { dictId: 'part-bolts' } 
        },
        { 
          path: 'nuts', 
          component: DictTable, 
          meta: { title: 'Nuts (螺母)', icon: 'Operation' }, // Operation: 六边形形状
          props: { dictId: 'part-nuts' } 
        },
        { 
          path: 'washers', 
          component: DictTable, 
          meta: { title: 'Washers (垫圈)', icon: 'Sunny' }, // Sunny: 中间有孔的圆形
          props: { dictId: 'part-washers' } 
        },
        { 
          path: 'accessories', 
          component: DictTable, 
          meta: { title: 'Accessories (附件)', icon: 'Suitcase' }, // Suitcase: 工具箱
          props: { dictId: 'part-accessories' } 
        },
        { 
          path: 'joints', 
          component: DictTable, 
          meta: { title: 'Joints (接头)', icon: 'Switch' }, // Switch: 连接转换
          props: { dictId: 'part-joints' } 
        }
      ]
    }
  ]
}