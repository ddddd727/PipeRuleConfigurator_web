# 📘 PipeRuleConfigurator Web (管材规则配置器前端) 

欢迎加入项目组！这份文档旨在帮助你快速配置环境、理解开发流程，并掌握核心协作规范。我们推荐使用 **VS Code** 进行全流程开发。

---

## 1. 🚀 快速启动 (Quick Start)

### 🛠️ 环境准备
* **Node.js**: 建议版本 >= 16.0 (推荐 LTS)
* **Git**: 需安装并配置好用户名/邮箱
* **VS Code**: 推荐主力编辑器，安装 `Vue - Official` 插件

### ⚡️ 启动步骤

1. **克隆代码**
   打开 VS Code，按 `Ctrl+Shift+P` 输入 `Git: Clone`，填入仓库地址：
   ```bash
   [https://gitee.com/yanhaihui/pipe-rule-configurator_web.git](https://gitee.com/yanhaihui/pipe-rule-configurator_web.git)
   ```

2. **安装依赖**
   在终端 (Terminal) 中运行：
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   > 💡 启动成功后，按住 `Ctrl` 点击终端里的链接 (如 `http://localhost:5173`) 即可打开页面。

---

## 2. 📂 项目核心架构说明

### 目录结构重点

```text
src/
 ├── layout/MainLayout.vue   # [入口布局] 顶部导航栏在这里修改，菜单跳转在这里配置
 ├── mock/index.js           # [数据源头] 所有的字典表结构、下拉筛选字段、Mock数据都在这里定义
 ├── components/DictTable.vue# [核心组件] 通用的字典表格，集成了搜索、筛选、编辑、脏检测功能
 ├── hooks/useDirtyData.js   # [逻辑复用] 负责处理“修改后变色”、“保存后重置”的逻辑
 └── views/                  # [业务页面] 具体的页面文件 (如 BasicClass.vue, PipeSpec.vue)
```

### 常见开发场景指南

* **场景 A：我要加一个新的字典页面**
   1. 在 `src/layout/MainLayout.vue` 的菜单里加一个 `<el-menu-item>`。
   2. 在 `src/mock/index.js` 里加对应的数据定义 (key 需与路由路径对应)。
   3. **搞定！** `DictTable` 组件会自动渲染出来。

* **场景 B：我要开启某一列的下拉筛选**
   1. 打开 `src/mock/index.js`。
   2. 找到对应的 `columns` 定义。
   3. 给那个字段加上 `filterable: true` 即可。

---

## 3. 🎨 VS Code 可视化操作指南 

我们推荐直接使用 VS Code 左侧的 **源代码管理 (Source Control)** 工具，告别命令行烦恼。

### 第一步：暂存 (Stage)
1. 点击左侧 **源代码管理** 图标 (树杈形状)。
2. 在 **"更改 (Changes)"** 列表里，找到你修改的文件。
3. 点击文件旁边的 **➕ (加号)**。
   > **含义**：把文件“装进箱子”，准备提交。

### 第二步：提交 (Commit)
1. 在上方的输入框填写 **提交信息** (格式见下文)。
2. 点击 **✔️ (提交)** 按钮。
   > **含义**：箱子封口，并在**本地**存档。此时如果不满意还可以回退，同事还看不到。

### 第三步：推送 (Push)
1. 点击蓝色的 **同步更改 (Sync Changes)** 或 **推送 (Push)** 按钮。
   > **含义**：把存档上传到 Gitee 服务器，此时同事们才能拉取到你的代码。

---

## 4. 🌿 分支管理规范 (Git Flow)

为了保证代码不冲突，请严格遵守以下分支策略：

| 分支名称 | 说明 | 权限 | 操作建议 |
| :--- | :--- | :--- | :--- |
| **master** | **生产环境** | 管理员 | **严禁直接 Push**。最稳定的版本。 |
| **dev** | **开发环境** | 全员 | 日常开发主分支，所有功能最终汇总于此。 |
| **feature/xxx** | **功能分支** | 你自己 | 从 `dev` 切出，开发完合并回 `dev`。 |

### ✅ 正确的开发姿势
1. **早上第一件事**：切到 `dev` 分支，点 **同步 (Pull)** 拉取最新代码。
2. **开发新功能**：基于 `dev` 新建分支，如 `feature/add-search`。
3. **日常**：写代码 -> 提交 -> 推送。
4. **开发完毕**：在 Gitee 上发起 **Pull Request (合并请求)**，申请把你的分支合并进 `dev`。

---

## 5. 📝 提交信息规范 (Commit Message)

请勿填写 "update" 或 "修改" 这种无意义的词。请严格遵守规范：

`类型(范围): 描述内容`

### 常用类型参考

* **feat**: ✨ 新增功能
  * *例: `feat: 增加管材标准表的下拉筛选`*
* **fix**: 🐛 修复 Bug
  * *例: `fix: 修复路由跳转报错`*
* **style**: 💎 样式调整
  * *例: `style: 调整脏数据高亮颜色`*
* **docs**: 📚 文档变更
* **refactor**: ♻️ 代码重构 (不影响功能的逻辑修改)

---

> 祝 Coding 愉快！如有疑问请在群里提问。🚀