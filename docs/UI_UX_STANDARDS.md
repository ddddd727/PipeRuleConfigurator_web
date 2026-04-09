

# PipeRuleConfigurator UI/UX 设计规范

## 1. 样式统一 (Style Unification)

为了确保系统视觉的一致性和原生体验，需严格执行以下样式清理工作：

* **移除自定义特效**：减少使用毛玻璃 (`frosted`)、高斯模糊、半透明深色背景等非 Element Plus 原生样式。
* **移除强制尺寸**：减少使用 `clamp()` 或 `vw` 强制覆盖按钮的 `padding` 和 `font-size`，信任 Element Plus 的默认组件尺寸 (Default/Small)。
* **统一间距**：按钮与组件之间统一使用 `gap: 12px`，废弃 `el-button-group`。

---

## 2. 顶部工具栏布局 (Toolbar Layout)

顶部工具栏的**操作区域**（按钮与搜索）**统一居右显示**。

* **容器布局**：采用 Flex 布局，两端对齐 (`justify-content: space-between`)。
* 左侧：标题或状态信息（船型船号等等）。
* **右侧：搜索框（可选）与所有功能按钮**。


* **右侧区域规范**：
* 必须包含 `gap: 12px`。
* 内容从左至右排列：`[搜索框(可选)]` -> `[辅助按钮]` -> `[主操作]`。



**代码规范：**

```html
<div class="table-header">
  <div class="title-area">...</div>
  
  <div class="actions">
    <el-input v-if="hasSearch" placeholder="搜索..." />
    <el-button>编辑</el-button>
    <el-button type="primary" icon="Plus">新增</el-button>
  </div>
</div>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* 核心：工具栏居右，且保持统一间距 */
.actions {
  display: flex;
  align-items: center;
  gap: 12px; 
}
</style>

```

---

## 3. 按钮顺序与语义 (Order & Semantics)

右侧工具栏内的按钮排列需遵循以下顺序（从左至右）：

1. **搜索框** (可选)：始终位于最左侧。
2. **辅助操作**：`刷新`、`导出`、`取消` (使用 Default 样式)。
3. **主要操作**：`编辑`、`新增` (使用 Primary 样式)。
4. **危险操作**：`批量删除` (使用 Danger 样式，**仅在特定状态显示**)。
5. **提交操作**：`保存` (使用 Primary 样式，位于最右侧)。



## 4. 编辑交互模式详解 (Detailed Interaction Patterns)

本系统严格区分两种编辑模式，每种模式下表格状态与按钮的显隐逻辑如下：

### 4.1 模式 A：行内编辑 (Inline Edit)

**适用场景**：字典定义、简单参数表 (`DictTable`)。
**核心逻辑**：基于**“全局状态切换”**。只有进入编辑模式，才能进行增删改。

#### 状态一：默认/查看状态 (View Mode)

* **表格表现**：纯文本展示，无输入框，**无复选框列**。
* **工具栏按钮显示**：
1. `[搜索框]`
2. `[编辑]` (Type: Primary, Icon: Edit)


* **隐藏按钮**：`[取消]`、`[新增]`、`[批量删除]`、`[保存]`。

#### 状态二：编辑状态 (Edit Mode)

* **触发动作**：点击 `[编辑]` 按钮。
* **表格表现**：
* 文本转为 `<el-input>` / `<el-select>`。
* 表格最左侧出现 **复选框列 (Selection)**。


* **工具栏按钮显示**：
1. `[搜索框]`
2. `[取消]` (Type: Default) —— *点击后回退到查看状态，不保存。*
3. `[新增]` (Type: Primary, Icon: Plus) —— *点击在表格末尾追加空行。*
4. `[批量删除]` (Type: Danger, Icon: Delete) —— *默认 Disabled，**勾选行后变亮**。*
5. `[保存]` (Type: Primary, Icon: Check) —— *点击提交所有更改。*



---

### 4.2 模式 B：弹窗编辑 (Dialog Edit)

**适用场景**：属性管理、复杂表单录入 (`PropertyManagement`)。
**核心逻辑**：基于**“按需触发”**。默认即可新增/编辑，但删除按钮平时隐藏。

#### 状态一：默认/常驻状态 (Default Mode)

* **表格表现**：纯文本展示，**复选框列常驻**，行尾显示 `[编辑]` 按钮。
* **工具栏按钮显示**：
1. `[搜索框]`
2. `[刷新]` / `[导出]` (Type: Default)
3. `[新增]` (Type: Primary, Icon: Plus) —— *点击弹出 Dialog。*


* **隐藏按钮**：`[批量删除]` (完全不可见 `v-if=false`)。

#### 状态二：选中状态 (Selection Mode)

* **触发动作**：用户在表格左侧勾选了一行或多行数据。
* **工具栏变化**：
* 动态弹出 `[批量删除]` 按钮 (Type: Danger, Icon: Delete)。
* *建议使用 `<transition name="el-zoom-in-center">` 动画。*


* **位置**：插入在 `[新增]` 按钮旁边，或 `[刷新]` 按钮左侧。
* **交互**：点击删除 -> 弹出二次确认框 -> 确认后删除数据并清空选项 -> 按钮自动消失。

---

## 5. 删除逻辑总结 (Delete Logic Summary)

为了防止误操作并保持界面整洁，**删除按钮绝不裸露在“安全状态”下**。

| 场景 | 按钮位置 | 显示/启用条件 | 交互流程 |
| --- | --- | --- | --- |
| **行内编辑** | 右侧工具栏 | 必须先点击 **[编辑]** 进入模式，再 **[勾选行]** 启用 | 编辑 -> 勾选 -> 批量删除 -> 保存 |
| **弹窗编辑** | 右侧工具栏 | 必须 **[勾选行]** 后动态出现 (`v-if`) | 勾选 -> 批量删除 -> 确认弹窗 |
| **行尾操作** | 表格右侧列 | **已废弃** (统一移动到顶部批量删除) | - |