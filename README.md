# PipeRuleConfigurator_web - APP Scheme（给 AI/开发者的统一开发规范）

> 目的：提供一个可直接喂给 AI 的开发约束与脚手架规则，保证新增页面/功能时，结构统一、路由统一、接口统一。

---

## 1. 当前应用边界（固定为 5 个 APP）

`src/apps/` 下仅维护以下 5 个业务 APP：

1. `pipe-spec`（管系规格书管理）
2. `product-standard`（产品元件标准数据管理）
3. `design-rule`（设计规则管理）
4. `engineering`（工程基础管理）
5. `component-ci`（组件持续集成系统）

### 约束
- 禁止新增第 6 个并列 APP（除非明确架构评审）。
- 历史目录（如 `rule-configurator` / `product-library`）不再允许被引用。
- 所有新页面必须归属到以上 5 个 APP 之一。

---

## 2. APP 内部标准目录结构（强制）

每个 APP 按以下结构组织：

```text
src/apps/<app-name>/
├── router/
│   ├── index.js
│   └── modules/
│       ├── xxx.js
│       └── yyy.js
├── features/
│   ├── <domain-a>/
│   │   ├── pages/
│   │   │   └── XxxPage.vue
│   │   ├── components/
│   │   ├── composables/
│   │   ├── api/
│   │   └── constants/
│   └── <domain-b>/...
├── mock/                  # 可选（有 mock 需求时）
└── shared/                # APP 内共享逻辑（非全局）
```

### 约束
- 页面只放 `features/<domain>/pages`。
- 私有组件只放当前 domain 的 `components`。
- 接口封装只放当前 domain 的 `api`。
- 仅在 APP 内复用时放 `apps/<app>/shared`；跨 APP 复用放 `src/shared`。

---

## 3. 路由 Scheme（强制）

### 3.1 主路由注册
在 `src/router/index.js` 只注册 5 个 APP 路由：

```js
import pipeSpecRoute from '@/apps/pipe-spec/router'
import productStandardRoute from '@/apps/product-standard/router'
import designRuleRoute from '@/apps/design-rule/router'
import engineeringRoute from '@/apps/engineering/router'
import componentCiRoute from '@/apps/component-ci/router'
```

### 3.2 APP 路由写法
- `router/index.js` 只做聚合。
- 子路由必须拆到 `router/modules/*.js`。
- 禁止在 `router/index.js` 写超长 children 内联配置。

推荐：

```js
import AppLayout from '@/layouts/AppLayout.vue'
import moduleARouter from './modules/module-a'
import moduleBRouter from './modules/module-b'

export default {
  path: '/xxx',
  component: AppLayout,
  meta: { title: 'xxx', icon: 'Menu' },
  redirect: '/xxx/module-a',
  children: [moduleARouter, moduleBRouter]
}
```

---

## 4. 新页面开发模板（给 AI 的操作指令）

当需要新增页面时，必须按以下步骤执行：

1. 先确定归属 APP 与 domain。  
2. 创建页面：`features/<domain>/pages/<PageName>.vue`。  
3. 如有私有子组件，创建于 `features/<domain>/components`。  
4. 如有接口，创建于 `features/<domain>/api/*.js`，页面中禁止直接写裸请求。  
5. 在 `router/modules/<domain>.js` 新增路由项。  
6. 若入口缺失，再更新门户 `PortalLayout.vue` 的模块快捷链接。  
7. 自查 import 路径，禁止引用已废弃目录。  

---

## 5. 命名与路径约束（强制）

- 页面组件：`PascalCase`，如 `StandardSequence.vue`。
- 路由 `name`：`PascalCase`，全局唯一。
- 路由 `path`：`kebab-case`。
- `features` 目录名：语义化英文短词，不用拼音。
- import 一律使用别名 `@/`，禁止多层 `../../..`。

---

## 6. API 与数据约束

- 页面层不直接调用 `axios`，统一走 `features/<domain>/api`。
- 统一使用 `src/Utils/request.js` 的请求实例。
- 接口错误必须有用户可感知反馈（`ElMessage` 等）。
- 对列表页至少处理：加载态、空态、异常态。

---

## 7. UI/交互约束

- 统一使用 Element Plus 组件体系。
- 表格页统一具备：查询、重置、分页、增删改、错误提示。
- 弹窗表单统一具备：校验规则、提交 loading、防重复提交。
- 页面顶部标题和面包屑语义必须与路由标题一致。

---

## 8. 禁止事项（重要）

1. 禁止新增或恢复对以下目录的引用：
   - `@/apps/rule-configurator/*`
   - `@/apps/product-library/*`
2. 禁止在同一 APP 内出现重复页面路径（例如同名页面放两处）。
3. 禁止把模块路由写回单文件超大 `index.js`。
4. 禁止把业务逻辑散落到 `layouts` 层。

---

## 9. 提交前检查清单（AI/人工通用）

- [ ] 是否归属到 5 个 APP 之一？
- [ ] 页面是否放在 `features/<domain>/pages`？
- [ ] 路由是否位于 `router/modules` 并已在 APP `router/index.js` 聚合？
- [ ] 是否不存在对 `rule-configurator` / `product-library` 的引用？
- [ ] lint 是否通过？
- [ ] 门户入口（如需要）是否可达？

---

## 10. 快速脚手架示例（可喂给 AI）

```text
请在 <app-name> 下新增 <domain-name> 页面：
1) 创建 features/<domain-name>/pages/<PageName>.vue
2) 创建 features/<domain-name>/api/<domain-name>.js
3) 在 router/modules/<domain-name>.js 增加路由
4) 在 apps/<app-name>/router/index.js 聚合模块
5) 不允许引用 rule-configurator / product-library
6) 使用 Element Plus，包含加载态与错误提示
```

---

## 11. 备注

本 README 为当前仓库的“开发契约”。后续新增功能请严格遵守该 Scheme，避免再次出现跨 APP 引用、路径失效和页面丢失问题。
