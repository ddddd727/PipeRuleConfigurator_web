# StandardCatalogDefinition 模块契约

## 1. 范围

- 前端页面：`src/apps/product-standard/features/standard-catalog-definition/pages/StandardCatalogDefinition.vue`
- 前端 API：`src/apps/product-standard/features/standard-catalog-definition/api/standardCatalogDefinitionAPI.js`
- 后端模块：`后端/sws-pmc-system-backend/Modules/StandardCatalogDefinition`

当前已接入能力：

- 专业下拉加载
- 部件类型列表查询
- 部件类型新增
- 部件类型启用/禁用
- 产品元件标准列表查询
- 产品元件标准启用/禁用
- 部件类型-标准绑定弹窗查询与保存

暂未接入真实数据的区域：

- 自定义类目录
- 产品元件标准目录
- 新增标准目录

## 2. 数据源与字段映射

### 2.1 部件类型

数据表：`S3D_Dict_ComponentType`

- `Discipline` 对应前端“专业”
- `ComponentTypeDescription` 对应前端“部件类型”
- `ComponentTypeName` 对应前端“部件类型描述”
- `ConnectType` 对应前端“连接类型”
- `Status` 对应前端“启用”

新增部件类型时：

- `Status` 默认保存为 `1`
- 当专业为“管系”时，前端显示“连接类型”字段
- 当专业不是“管系”时，前端隐藏“连接类型”，后端允许 `ConnectType` 为空
- 新增前需要校验 `ComponentTypeDescription` 是否已存在，已存在时提示“该部件类型已存在，请重新输入”，并禁止重复保存

### 2.2 产品元件标准

关系表：`S3D_Dict_GeometricIndustryStandard`

- `ComponentTypeID` 对应部件类型主键
- `GeometricIndustryStandard_CL` 对应标准码值
- `Status` 对应前端“启用”开关

### 2.3 标准翻译码表

数据表：

- `S3D_Common_CodeListTable`
- `S3D_Common_CodeListValue`

规则：

1. 不能把 `CodeListTableID = 4` 写死
2. 必须先通过 `S3D_Common_CodeListTable.CodeListTableName = "GeometricIndustryStandard"` 查到实际 `ID`
3. 再用该 `ID` 去 `S3D_Common_CodeListValue` 查询标准值

字段映射：

- `CodeListNumber` 对应 `GeometricIndustryStandard_CL`
- `ShortStringValue` 对应标准显示名
- 仅 `S3D_Common_CodeListValue.Status = 1` 的标准可显示、可绑定

## 3. 页面行为

### 3.1 专业下拉

- 数据源：`S3D_Dict_ComponentType.Discipline` 去重结果
- 左右两个模块共用同一个前端状态
- 默认值：`管系`
- 如果返回数据中不存在 `管系`，回退到第一个可选项

### 3.2 左侧部件类型列表

- 接口：`GET /api/StandardCatalogDefinition/component-types`
- 支持按 `discipline` 过滤
- `enabled = false` 的行不能被选中
- 状态开关变更后回写 `S3D_Dict_ComponentType.Status`

### 3.3 左侧产品元件标准列表

- 接口：`GET /api/StandardCatalogDefinition/component-types/{componentTypeId}/industry-standards`
- 由左侧部件类型选中行驱动加载
- 该列表不使用单选
- `S3D_Common_CodeListValue.Status = 0` 的标准不显示
- `S3D_Dict_GeometricIndustryStandard.Status = 0` 的标准仍显示，但开关为关闭
- 开关变更后回写 `S3D_Dict_GeometricIndustryStandard.Status`

### 3.4 右侧部件类型目录

- 与左侧部件类型列表同源
- 仅展示 `Status = 1` 的记录
- 左侧启用/禁用切换后，右侧同步刷新

### 3.5 新增部件类型弹窗

- 入口按钮：左侧工具栏“新增部件类型”
- 专业只读，读取当前页面专业
- “连接类型”仅在专业为“管系”时显示
- 保存成功后刷新左侧部件类型列表

### 3.6 部件类型-标准绑定弹窗

- 入口按钮：左侧工具栏“标准-部件类型绑定”
- 必须先选中一个部件类型
- 弹窗顶部和右侧区域都展示当前选中的部件类型，只读

弹窗内有两个列表：

- 标准库：来自 `S3D_Common_CodeListValue`
- 标准配置：来自当前部件类型已绑定的标准，也就是左侧“产品元件标准”列表中的标准名集合

标准库规则：

1. 通过 `CodeListTableName = "GeometricIndustryStandard"` 动态获取码表 ID
2. 读取 `S3D_Common_CodeListValue.ShortStringValue`
3. 仅取 `Status = 1` 的记录
4. 需要去重
5. 需要去掉右侧“标准配置”中已经存在的内容

左右移动规则：

- 支持复选
- `>` 把左侧勾选项移到右侧
- `<` 把右侧勾选项移回左侧

保存规则：

- 右侧“标准配置”作为最终目标结果
- 已存在绑定不重复新增
- 新增绑定时：
  - 通过 `Discipline + ComponentTypeDescription` 在 `S3D_Dict_ComponentType` 中定位 `ID`
  - 通过标准名在 `S3D_Common_CodeListValue.ShortStringValue` 中匹配对应 `CodeListNumber`
  - 保存到 `S3D_Dict_GeometricIndustryStandard`
  - `ComponentTypeID = 部件类型ID`
  - `GeometricIndustryStandard_CL = CodeListNumber`
  - `Status = 1`
- 保存时会同步删除当前可管理标准范围内、但已被移出右侧列表的旧绑定

## 4. 后端接口契约

控制器前缀：`/api/StandardCatalogDefinition`

### 4.1 获取专业下拉

- 方法：`GET`
- 路径：`/api/StandardCatalogDefinition/disciplines`

### 4.2 获取部件类型列表

- 方法：`GET`
- 路径：`/api/StandardCatalogDefinition/component-types`

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `discipline` | string | 否 | 专业筛选 |
| `enabledOnly` | bool | 否 | 是否仅返回启用数据 |

### 4.3 新增部件类型

- 方法：`POST`
- 路径：`/api/StandardCatalogDefinition/component-types`

请求体：

```json
{
  "discipline": "管系",
  "componentTypeDescription": "管材",
  "componentTypeName": "Pipe",
  "connectType": "焊接"
}

### 4.3.1 校验部件类型是否已存在

- 方法：`GET`
- 路径：`/api/StandardCatalogDefinition/component-types/existence`

查询参数：
| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `discipline` | string | 否 | 当前专业，用于同专业下重复校验 |
| `componentTypeDescription` | string | 是 | 待校验的部件类型 |

响应示例：

```json
{
  "exists": true
}
```
```

### 4.4 更新部件类型启用状态

- 方法：`PUT`
- 路径：`/api/StandardCatalogDefinition/component-types/{id}/status`

### 4.5 获取产品元件标准列表

- 方法：`GET`
- 路径：`/api/StandardCatalogDefinition/component-types/{componentTypeId}/industry-standards`

### 4.6 更新产品元件标准启用状态

- 方法：`PUT`
- 路径：`/api/StandardCatalogDefinition/industry-standards/{id}/status`

### 4.7 获取绑定弹窗数据

- 方法：`GET`
- 路径：`/api/StandardCatalogDefinition/component-types/{componentTypeId}/binding-dialog`

响应示例：

```json
{
  "componentType": "管材",
  "standardLibrary": ["GB/T 8163-2018", "SH/T 3410-2012"],
  "selectedStandards": ["GB/T 8163-2018"]
}
```

### 4.8 保存绑定结果

- 方法：`PUT`
- 路径：`/api/StandardCatalogDefinition/component-type-standard-bindings`

请求体：

```json
{
  "discipline": "管系",
  "componentTypeDescription": "管材",
  "standardNames": ["GB/T 8163-2018", "SH/T 3410-2012"]
}
```

## 5. 前端 API 方法

文件：`src/apps/product-standard/features/standard-catalog-definition/api/standardCatalogDefinitionAPI.js`

- `getStandardCatalogDisciplines()`
- `getStandardCatalogComponentTypes(params)`
- `checkStandardCatalogComponentTypeDescriptionExists(params)`
- `createStandardCatalogComponentType(data)`
- `getStandardCatalogBindingDialog(componentTypeId)`
- `saveStandardCatalogBindings(data)`
- `getStandardCatalogIndustryStandards(componentTypeId)`
- `updateStandardCatalogComponentTypeStatus(id, enabled)`
- `updateStandardCatalogIndustryStandardStatus(id, enabled)`

## 6. 后续更新要求

以下内容变更时，需要同步更新本文档：

1. 字段映射调整
2. 绑定逻辑变化
3. 弹窗字段变化
4. 新增/编辑/删除接口
5. 目录区真实数据接入
