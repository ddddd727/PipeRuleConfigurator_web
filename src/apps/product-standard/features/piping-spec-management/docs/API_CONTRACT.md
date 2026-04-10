# Piping Spec 模块契约

## 1. 模块范围

- 前端页面：`src/apps/product-standard/features/piping-spec-management/pages/pipingSpec.vue`
- 前端 API：`src/apps/product-standard/features/piping-spec-management/api/pipingSpecAPI.js`
- 前端 Mock：`src/apps/product-standard/features/piping-spec-management/mock/pipingSpecMock.js`

当前页面已覆盖的业务范围：

- 左侧管系专业目录树加载与筛选
- 部件类型基础数据查询与联动筛选
- 外形重量重心描述数据查询
- 部件类型基础“另存为”弹窗保存
- 外形重量重心描述本地新增 / 修改 / 禁用 / 恢复占位交互

说明：

- 本文档优先以 `pipingSpec.vue` 当前真实使用的数据结构为准。
- 对于页面中已经存在、但当前仍未接后端请求的交互，本文档会单独标记为“前端占位，未纳入正式接口”。

## 2. 版本记录

| 版本 | 日期 | 变更内容 | 维护人 |
| --- | --- | --- | --- |
| 1.0 | 2026-04-08 | 首次根据 `pipingSpec.vue`、`pipingSpecAPI.js`、`pipingSpecMock.js` 生成正式契约 | Codex |

## 3. 通用约定

### 3.1 接口前缀

统一前缀：

```text
/api/product-standard/piping-spec
```

### 3.2 通用响应格式

当前前端统一请求层 `src/Utils/request.js` 按以下包装响应解析：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| code | number | 是 | 业务状态码，`200-299` 视为成功 |
| message | string | 否 | 提示信息 |
| data | any | 否 | 真实业务数据 |
| traceId | string | 否 | 错误追踪号，可选 |

前端行为：

- `code` 在 `200-299` 时，前端直接取 `data`
- 非成功码时，前端统一弹出错误提示
- 无 HTTP 响应时，前端提示“网络连接失败，请检查网络设置”

### 3.3 目录节点分类 `category`

当前前端已识别的节点分类值：

| category | 说明 |
| --- | --- |
| pipe | 管材 |
| pipeComponent | 管件类部件 |
| bolt | 螺栓 |
| gasket | 垫片 |
| nut | 螺母 |
| washer | 垫圈 |

说明：

- 当前页面只有 `pipe`、`pipeComponent` 会显示“外形重量重心描述”模块。
- 其他分类当前只使用“部件类型基础”模块。

## 4. 正式接口契约

### 4.1 获取管系专业目录树

**接口**

```http
GET /api/product-standard/piping-spec/tree
```

**请求参数**

无。

**请求示例**

```http
GET /api/product-standard/piping-spec/tree
```

**响应 data 类型**

```ts
type PipingSpecTreeItem = {
  level1: string
  level2?: string
  level3?: string
  level4?: string
  category: string
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "level1": "Pipe",
      "level2": "Seamless",
      "level3": "GB/T 14976-2012",
      "level4": "StraightPipe",
      "category": "pipe"
    },
    {
      "level1": "PipeComponent",
      "level2": "Elbow",
      "level3": "Q/SWS 34-003.2-2021",
      "level4": "45DegElbow",
      "category": "pipeComponent"
    }
  ]
}
```

**前端使用规则**

- 前端会把 `level1 ~ level4` 组装成树结构
- 最末级节点视为可点击叶子节点
- 叶子节点的 `category` 将继续传给后续查询接口

---

### 4.2 获取部件类型基础数据

**接口**

```http
GET /api/product-standard/piping-spec/component-base-data
```

**请求参数**

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| nodeLabel | query | string | 是 | 当前点击的末级节点名称 |
| category | query | string | 是 | 当前节点分类，例如 `pipe`、`pipeComponent` |

**请求示例**

```http
GET /api/product-standard/piping-spec/component-base-data?nodeLabel=45DegElbow&category=pipeComponent
```

```json
{
  "nodeLabel": "45DegElbow",
  "category": "pipeComponent"
}
```

**响应 data 类型**

返回数组，数组元素为动态对象。

前端固定依赖字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| IndustryCommodityCode | string | 用于筛选 |
| ScheduleThickness | string | 可选，用于筛选 |
| MaterialGrade | string | 用于筛选 |

除上述字段外，其他字段前端会自动作为“部件类型基础”详情字段展示。

**示例 1：pipe**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "IndustryCommodityCode": "PIPE001",
      "ScheduleThickness": "Sch.40",
      "MaterialGrade": "316L",
      "CommodityType": "PIPEAAA",
      "GeometricIndustryStandard": "GB/T 14976-2012"
    }
  ]
}
```

**示例 2：pipeComponent**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "IndustryCommodityCode": "PCSEL45",
      "ScheduleThickness": "Sch.80",
      "MaterialGrade": "304SS",
      "CommodityType": "ELB",
      "GeometryType": "Turn, 45 degree",
      "GeometricIndustryStandard": "Q/SWS 34-003.2-2021",
      "BentAngle": "45",
      "PartClassName": "45DegElbow",
      "UserClassName": "45DegElbow",
      "PartDataBasis": "Part Data Basis Value"
    }
  ]
}
```

**前端使用规则**

- 默认展示首条基础数据
- 前端按 `IndustryCommodityCode / ScheduleThickness / MaterialGrade` 联动筛选
- 如果某节点无 `ScheduleThickness`，该筛选项不会显示

---

### 4.3 获取外形重量重心描述数据

**接口**

```http
GET /api/product-standard/piping-spec/component-appearance-data
```

**请求参数**

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| nodeLabel | query | string | 是 | 当前点击的末级节点名称 |
| category | query | string | 是 | 当前节点分类，仅 `pipe`、`pipeComponent` 会在页面展示 |
| IndustryCommodityCode | query | string | 否 | 部件类型基础筛选值 |
| scheduleThickness | query | string | 否 | 部件类型基础筛选值 |

**请求示例**

```http
GET /api/product-standard/piping-spec/component-appearance-data?nodeLabel=45DegElbow&category=pipeComponent&IndustryCommodityCode=PCSEL45&scheduleThickness=Sch.80
```

```json
{
  "nodeLabel": "45DegElbow",
  "category": "pipeComponent",
  "IndustryCommodityCode": "PCSEL45",
  "scheduleThickness": "Sch.80"
}
```

**响应 data 类型**

返回数组，数组元素为动态对象。

前端当前会展示除以下字段外的所有返回字段：

- `status`
- `GeometricIndustryStandard`

**示例 1：pipe**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "IndustryCommodityCode": "PIPE001",
      "NPD[1]": "100",
      "NpdUnitType[1]": "mm",
      "EndPreparation[1]": "BW",
      "ScheduleThickness[1]": "Sch.40",
      "NPD[2]": "100",
      "NpdUnitType[2]": "mm",
      "EndPreparation[2]": "BW",
      "ScheduleThickness[2]": "Sch.40",
      "Density": 7.85,
      "PurchaseLength": 12,
      "MinimumPipeLength": 6,
      "MaximumPipeLength": 12,
      "WeightPerUnitLength": 18.6,
      "PartDescription": "不锈钢管",
      "MaterialsMgmtIdent": "MAT-PIPE-001",
      "GeometricIndustryStandard": "GB/T 14976-2012",
      "status": 1
    }
  ]
}
```

**示例 2：pipeComponent**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "IndustryCommodityCode": "PCELB45-001",
      "NPD[1]": "50",
      "NpdUnitType[1]": "mm",
      "EndPreparation[1]": "SW",
      "ScheduleThickness[1]": "Sch.40",
      "NPD[2]": "50",
      "NpdUnitType[2]": "mm",
      "EndPreparation[2]": "SW",
      "ScheduleThickness[2]": "Sch.40",
      "DryWeight": 1.2,
      "DryCogX": 0,
      "DryCogY": 0,
      "DryCogZ": 0,
      "PartDescription": "45度承插弯头",
      "MaterialsMgmtIdent": "MAT-ELB-001",
      "BendRadius": 1.5,
      "status": 1
    }
  ]
}
```

**前端使用规则**

- 表格按返回字段自动生成列
- 禁用行通过 `status = 0` 渲染灰显样式
- 表格支持点击整行选中

---

### 4.4 获取部件类型基础下拉选项

**接口**

```http
GET /api/product-standard/piping-spec/base-options
```

**请求参数**

无。

**请求示例**

```http
GET /api/product-standard/piping-spec/base-options
```

**响应 data 类型**

```ts
type PipingBaseOptions = {
  manufacturingStdOptions: string[]
  ccCodeOptions: string[]
  scheduleThicknessOptions: string[]
  materialGradeOptions: string[]
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "manufacturingStdOptions": ["GB/T 14976-2012", "Q/SWS 34-003.2-2021"],
    "ccCodeOptions": ["PIPE001", "PIPE002", "PCSEL45"],
    "scheduleThicknessOptions": ["Sch.40", "Sch.80"],
    "materialGradeOptions": ["316L", "304SS", "20#"]
  }
}
```

**前端使用规则**

- 当前页面用于“部件类型基础”的另存为弹窗
- 下拉值直接使用返回数组，不再二次转换

---

### 4.5 保存 / 另存为部件类型基础

**接口**

```http
POST /api/product-standard/piping-spec/save-component-base
```

**请求体类型**

```ts
type SavePipingComponentBaseRequest = {
  isSaveAs: boolean
  oldNodeLabel: string
  category: string
  newNodeData: {
    manufacturingStd: string
    IndustryCommodityCode: string
    ccCode: string
    scheduleThickness?: string
    material: string
  }
}
```

**当前前端请求示例**

```json
{
  "isSaveAs": true,
  "oldNodeLabel": "PipeComponent|Elbow|Q/SWS 34-003.2-2021|45DegElbow",
  "category": "pipeComponent",
  "newNodeData": {
    "manufacturingStd": "Q/SWS 34-003.2-2021",
    "IndustryCommodityCode": "PCSEL45",
    "ccCode": "PCSEL45",
    "scheduleThickness": "Sch.80",
    "material": "304SS"
  }
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "另存为成功",
  "data": {
    "newPath": "PipeComponent|Elbow|Q/SWS 34-003.2-2021|45DegElbow"
  }
}
```

**前端使用规则**

- 当前页面实际走的是“另存为”逻辑
- 成功后前端只要求：
  - 返回成功状态
  - 可选返回新路径 `newPath`
- 前端随后会重新请求目录树

## 5. 当前页面未接后端的占位交互

以下交互已经在页面中存在，但当前仍是前端本地处理，尚未发起后端请求。

后端如果准备实现，请以后续单独确认的正式契约为准。

### 5.1 外形重量重心描述新增

当前状态：

- 前端本地弹窗填写
- 本地追加到表格
- 未请求后端

当前前端表单字段：

- `IndustryCommodityCode`
- 所有成对字段：如 `NPD[1]/NPD[2]`、`NpdUnitType[1]/NpdUnitType[2]`
- 其余字段按当前节点返回结构自动排布
- 不包含 `GeometricIndustryStandard`

### 5.2 外形重量重心描述修改

当前状态：

- 只能单选 1 行
- 弹窗表单与新增共用
- 本地更新当前行
- 未请求后端

### 5.3 外形重量重心描述禁用 / 恢复

当前状态：

- 页面按钮已支持根据选中行状态切换“禁用 / 恢复”
- `disablePipingRows(rows)` 当前为前端占位 Promise
- 恢复操作完全前端本地处理

## 6. 当前页面未纳入本契约的 API

以下 API 虽然存在于 `pipingSpecAPI.js`，但当前 `pipingSpec.vue` 已不调用，因此不纳入本页正式契约：

- `GET /api/product-standard/piping-spec/component-common-data`

说明：

- 页面中“公用端面数据”模块已删除
- 后端如仍保留该接口，可继续作为兼容接口存在

## 7. 数据类型补充说明

### 7.1 部件类型基础对象

前端对该对象的处理规则：

- `IndustryCommodityCode / ScheduleThickness / MaterialGrade` 用于筛选
- 其余字段自动渲染
- 当前页面不依赖固定主键

### 7.2 外形重量重心描述对象

前端对该对象的处理规则：

- `status = 0` 视为禁用
- `GeometricIndustryStandard` 当前不展示
- 其余字段直接作为表格列
- 新增 / 修改弹窗按以下顺序组织字段：
  1. `IndustryCommodityCode`
  2. 所有带 `[1]/[2]` 的成对字段，按 `1 / 2` 同行展示
  3. 其他字段按一行两个展示

## 8. 后续更新要求

以下情况发生变化时，需要同步更新本文档：

1. 页面新增或删除接口调用
2. `category` 分类值变化
3. 部件类型基础字段映射变化
4. 外形重量重心描述返回字段变化
5. 新增 / 修改 / 禁用 / 恢复从前端本地占位切换为真实后端接口
