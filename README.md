# PipeRuleConfigurator_web 项目架构解析

项目采用了模块化/领域驱动（Domain-Driven）的架构风格，将大系统拆分为多个子应用，业务内部又按特性（Feature）进行深度解耦，非常适合中大型企业级后台管理或配置系统的协同开发。

## 1. 目录结构树

    PipeRuleConfigurator_web/
    ├── docs/                   # 项目文档与数据库脚本
    ├── public/                 # 公共静态资源 (不经过 Vite 编译)
    ├── src/                    # 源代码核心目录
    │   ├── apps/               # 按业务领域划分的子应用模块 (核心)
    │   │   ├── product-library/   # 产品库模块
    │   │   └── rule-configurator/ # 管系规则配置器
    │   ├── assets/             # 全局静态资源 (全局样式、Logo/SVG 等)
    │   ├── components/         # 全局可复用的基础业务组件
    │   ├── constants/          # 全局常量定义配置 (字典映射等)
    │   ├── layouts/            # 全局页面布局框架 (侧边栏、顶部导航、多标签页等)
    │   ├── navigation/         # 全局导航菜单配置
    │   ├── router/             # 全局路由配置中心
    │   ├── shared/             # 全局级别的公共函数或逻辑
    │   ├── stores/             # 全局状态管理中心 (如 tagsView 标签页管理)
    │   ├── Utils/              # 全局工具封装 (如 request.js 网络请求封装)
    │   ├── App.vue             # 应用根组件
    │   └── main.js             # Vue 实例主入口文件
    ├── index.html              # Vite 单页面应用 (SPA) 模板入口
    ├── package.json            # Node.js 项目依赖及脚本清单
    ├── vite.config.js          # Vite 构建与开发服务器配置
    └── jsconfig.json           # 编辑器路径别名提示配置

## 2. 核心目录详细解析

### 2.1 src/apps/ (领域驱动业务模块)
这是本架构中最核心的设计。项目并没有将所有页面都堆砌在全局的 views 目录下，而是通过类似“微应用”的理念，将大系统拆分成了独立的模块。

以 rule-configurator（规则配置器）为例，其内部实现了高度的代码内聚：

    rule-configurator/
    ├── features/               # 按具体业务特性划分的目录
    │   ├── design/             # 设计规则业务
    │   ├── dict/               # 字典配置业务
    │   ├── library/            # 基础库业务
    │   ├── pipe/               # 管子配置业务 
    │   │   ├── api/            # 专属于管子配置的后端接口
    │   │   ├── components/     # 管子配置专属的私有组件
    │   │   ├── composables/    # 业务特有的 Vue 3 组合式 Hooks (如 useNpdTable.js)
    │   │   ├── constants/      # 业务私有常量
    │   │   └── pages/          # 业务相关的页面视图 (如 PipeSpec.vue)
    │   ├── pmc/                # PMC相关配置
    │   ├── property/           # 属性管理业务
    │   ├── spec/               # 等级配置业务
    │   └── standard-sequence/  # 标准序列业务
    ├── mock/                   # 独立于该业务的前端 Mock 数据和服务模拟
    ├── router/                 # 业务内部路由切片 (按模块定义，由全局 Router 收集)
    └── shared/                 # 业务域内的公共逻辑与组件

设计优势：
- 高内聚低耦合：修改某个功能时，开发者只需在专属目录下即可找到所有的页面、组件、接口、数据处理 Hook，无需跨越多个全局目录去翻找代码。
- 团队协作友好：不同的开发人员可以分别负责不同的 Feature 目录，极大降低了代码合并时的冲突概率。

### 2.2 全局基础设施 (src/)
全局目录主要为所有子应用提供底层支撑：
- Utils/request.js: 统一的网络请求核心，负责请求头拦截、Token 注入、统一错误处理。
- layouts/: 定义了系统的整体骨架，如 AppLayout.vue 控制着菜单侧边栏、顶栏和主体内容区的排版。
- stores/: 存放贯穿全生命周期的状态（如多页签缓存、用户登录信息）。

### 2.3 工程化与文档管理 (docs/ & 根目录)
- 数据库沉淀 (docs/): 集中管理了数据库设计规范 (PropertyManagement_DATABASE_DESIGN_DOCUMENT.md) 和初始化 SQL 脚本。
- 规范约束 (docs/): UI_UX_STANDARDS.md 统一了前端的交互和视觉规范；并保留了修复记录。
- 编辑器配置: .vscode/extensions.json 推荐了必备插件，保证团队拥有统一的代码高亮和格式化体验。

## 3. 架构总结
此架构严格遵循了关注点分离原则。通过 App -> Feature -> (Page + Component + API + Hook) 的树状收敛结构，让大型前端应用在持续迭代和扩充业务时，依然能保持清晰的代码边界和极高的可维护性。