# StandardCatalogDefinition 模块契约

## 1. 模块范围

- 前端页面：`src/apps/product-standard/features/standard-catalog-definition/pages/StandardCatalogDefinition.vue`
- 前端 API：`src/apps/product-standard/features/standard-catalog-definition/api/standardCatalogDefinitionAPI.js`
- 后端模块：`后端/sws-pmc-system-backend/Modules/StandardCatalogDefinition`

当前已接入功能：

- 专业下拉加载
- 部件类型列表查询
- 部件类型新增
- 部件类型重复校验
- 部件类型启用/禁用
- 产品元件标准列表查询
- 产品元件标准启用/禁用
- 部件类型-标准绑定弹窗查询与保存
- 右侧自定义类目录联动查询
- 右侧产品元件标准目录联动查询

## 2. 数据源与映射

### 2.1 部件类型

数据表：`S3D_Dict_ComponentType`

- `Discipline` -> 专业
- `ComponentTypeDescription` -> 部件类型
- `ComponentTypeName` -> 部件类型描述
- `ConnectType` -> 连接类型
- `Status` -> 启用状态

规则：

- 专业下拉来自 `Discipline` 去重结果
- 默认专业为 `管系`
- 新增时 `Status` 默认保存为 `1`
- 新增前需要校验 `ComponentTypeDescription` 是否重复
- 仅在专业为 `管系` 时显示连接类型

### 2.2 左侧产品元件标准

关系表：`S3D_Dict_GeometricIndustryStandard`

- `ComponentTypeID` -> 部件类型主键
- `GeometricIndustryStandard_CL` -> 标准码值
- `Status` -> 启用状态

翻译表：

- `S3D_Common_CodeListTable`
- `S3D_Common_CodeListValue`

规则：

1. 不能写死 `CodeListTableID = 4`
2. 必须先通过 `S3D_Common_CodeListTable.CodeListTableName = "GeometricIndustryStandard"` 获取实际 `ID`
3. 再通过该 `ID` 去 `S3D_Common_CodeListValue` 中查 `ShortStringValue`
4. `S3D_Common_CodeListValue.Status = 0` 的标准不显示
5. `S3D_Dict_GeometricIndustryStandard.Status = 0` 仍显示，但启用开关为关闭

### 2.3 右侧目录联动

数据表：`S3D_Rule_ComponentTypeHierarchyRule`

- `ComponentTypeID` -> 部件类型主键
- `ComponentSubType` -> 自定义类目录显示内容
- `GeometricIndustryStandard_CL` -> 产品元件标准目录码值
- `Status` -> 目录规则状态

规则：

1. 点击“部件类型目录”后，用该部件类型的 `ID` 去匹配 `ComponentTypeID`
2. “自定义类目录”显示同一部件类型下去重后的 `ComponentSubType`
3. 点击“自定义类目录”后，再按 `ComponentTypeID + ComponentSubType` 过滤
4. “产品元件标准目录”显示对应 `GeometricIndustryStandard_CL` 翻译后的 `ShortStringValue`
5. 标准翻译仍然通过 `CodeListTableName = "GeometricIndustryStandard"` 动态找表 ID
6. “产品元件标准目录”启用/禁用控制 `S3D_Rule_ComponentTypeHierarchyRule.Status`
7. 同一 `ComponentTypeID + ComponentSubType + GeometricIndustryStandard_CL` 下的多条记录需要批量更新

## 3. 页面行为

### 3.1 左侧模块

- “部件类型”列表支持单选
- “产品元件标准”列表不使用单选列
- 左侧切换部件类型时，右侧目录模块不自动跟选
- 禁用的部件类型不可选中

### 3.2 右侧模块

- “部件类型目录”数据源与左侧部件类型同源，但仅显示 `Status = 1`
- 点击“部件类型目录”后，加载“自定义类目录”
- 点击“自定义类目录”后，加载“产品元件标准目录”
- 右侧三级目录都不默认选中

## 4. 后端接口

控制器前缀：`/api/StandardCatalogDefinition`

### 4.1 获取专业下拉

- `GET /disciplines`

### 4.2 获取部件类型列表

- `GET /component-types`

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `discipline` | string | 否 | 按专业筛选 |
| `enabledOnly` | bool | 否 | 是否仅返回启用数据 |

### 4.3 校验部件类型是否已存在

- `GET /component-types/existence`

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `discipline` | string | 否 | 当前专业 |
| `componentTypeDescription` | string | 是 | 待校验部件类型 |

响应示例：

```json
{
  "exists": true
}
```

### 4.4 新增部件类型

- `POST /component-types`

请求体：

```json
{
  "discipline": "管系",
  "componentTypeDescription": "管材",
  "componentTypeName": "Pipe",
  "connectType": "焊接"
}
```

### 4.5 更新部件类型启用状态

- `PUT /component-types/{id}/status`

### 4.6 获取产品元件标准列表

- `GET /component-types/{componentTypeId}/industry-standards`

### 4.7 更新产品元件标准启用状态

- `PUT /industry-standards/{id}/status`

### 4.8 获取部件类型-标准绑定弹窗数据

- `GET /component-types/{componentTypeId}/binding-dialog`

### 4.9 保存部件类型-标准绑定结果

- `PUT /component-type-standard-bindings`

请求体：

```json
{
  "discipline": "管系",
  "componentTypeDescription": "管材",
  "standardNames": ["GB/T 8163-2018", "SH/T 3410-2012"]
}
```

### 4.10 获取自定义类目录

- `GET /component-types/{componentTypeId}/custom-catalogs`

响应字段：

- `id`
- `componentSubType`

### 4.11 获取产品元件标准目录

- `GET /component-types/{componentTypeId}/product-standard-catalogs`

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `componentSubType` | string | 是 | 当前选中的自定义类目录 |

响应字段：

- `id`
- `geometricIndustryStandardCl`
- `standardName`
- `enabled`

### 4.12 更新产品元件标准目录启用状态

- `PUT /component-types/{componentTypeId}/product-standard-catalogs/status`

请求体：

```json
{
  "componentSubType": "双联盲板法兰",
  "geometricIndustryStandardCl": 1234,
  "enabled": false
}
```

说明：

- 会批量更新 `S3D_Rule_ComponentTypeHierarchyRule` 中满足
  `ComponentTypeID + ComponentSubType + GeometricIndustryStandard_CL`
  的所有记录
- 例如同一标准下有 4 条仅 `CommodityType` 不同的记录，禁用时这 4 条的 `Status` 都会改为 `0`

## 5. 前端 API 方法

文件：`src/apps/product-standard/features/standard-catalog-definition/api/standardCatalogDefinitionAPI.js`

- `getStandardCatalogDisciplines()`
- `getStandardCatalogComponentTypes(params)`
- `checkStandardCatalogComponentTypeDescriptionExists(params)`
- `createStandardCatalogComponentType(data)`
- `getStandardCatalogIndustryStandards(componentTypeId)`
- `updateStandardCatalogComponentTypeStatus(id, enabled)`
- `updateStandardCatalogIndustryStandardStatus(id, enabled)`
- `getStandardCatalogBindingDialog(componentTypeId)`
- `saveStandardCatalogBindings(data)`
- `getStandardCatalogCustomCatalogs(componentTypeId)`
- `getStandardCatalogProductStandardCatalogs(componentTypeId, componentSubType)`
- `updateStandardCatalogProductStandardCatalogStatus(componentTypeId, data)`

## 6. 后续更新要求

以下内容变更时，需要同步更新本文档：

1. 字段映射调整
2. 新增或修改目录联动逻辑
3. 新增、编辑、删除接口
4. 弹窗字段或校验规则变化
## 7. 2026-04-07 补充

- 右侧模块工具栏当前包含 3 个按钮：`新增自定义类目录`、`新增标准目录`、`配置CommodityType`
- 当前这 3 个按钮已接入前端页面与选中校验
- `新增自定义类目录` 需要先选择 `部件类型目录`
- `新增标准目录` 需要先选择 `部件类型目录` 与 `自定义类目录`
- `配置CommodityType` 需要先选择 `部件类型目录`、`自定义类目录` 与 `产品元件标准目录`
- 这 3 个按钮当前为前端占位入口，后续弹窗与保存接口实现后继续更新本文档
