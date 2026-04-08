# StandardCatalogDefinition 模块契约

## 1. 模块范围

- 前端页面：`src/apps/product-standard/features/standard-catalog-definition/pages/StandardCatalogDefinition.vue`
- 前端 API：`src/apps/product-standard/features/standard-catalog-definition/api/standardCatalogDefinitionAPI.js`
- 后端模块：`后端/sws-pmc-system-backend/Modules/StandardCatalogDefinition`

当前已接入功能：

- 专业下拉加载
- 部件类型列表查询 / 新增 / 重复校验 / 启用禁用
- 产品元件标准查询 / 启用禁用
- 部件类型-标准绑定
- 自定义类目录新增
- 标准目录新增
- 产品元件标准目录启用禁用
- CommodityType 配置

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
- 新增前校验 `ComponentTypeDescription` 是否重复
- 仅在专业为 `管系` 时显示 `连接类型`

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
2. 必须先通过 `S3D_Common_CodeListTable.CodeListTableName = "GeometricIndustryStandard"` 获取真实 `ID`
3. 再通过该 `ID` 去 `S3D_Common_CodeListValue` 中查 `ShortStringValue`
4. `S3D_Common_CodeListValue.Status = 0` 的标准不显示
5. `S3D_Dict_GeometricIndustryStandard.Status = 0` 仍显示，但开关关闭且可重新启用

### 2.3 右侧目录联动

数据表：`S3D_Rule_ComponentTypeHierarchyRule`

- `ComponentTypeID` -> 部件类型主键
- `ComponentSubType` -> 自定义类目录
- `GeometricIndustryStandard_CL` -> 产品元件标准目录码值
- `CommodityType` -> CommodityType
- `Status` -> 启用状态

规则：

1. 点击“部件类型目录”后，按 `ComponentTypeID` 加载 `ComponentSubType`
2. 点击“自定义类目录”后，按 `ComponentTypeID + ComponentSubType` 加载 `GeometricIndustryStandard_CL`
3. 标准目录展示值通过 `CodeListTableName = "GeometricIndustryStandard"` 动态翻译 `ShortStringValue`
4. 同一组 `ComponentTypeID + ComponentSubType + GeometricIndustryStandard_CL` 的启用禁用需要批量更新

## 3. 页面行为

### 3.1 左侧模块

- “部件类型”列表支持单选
- “产品元件标准”列表仅展示和启用禁用，不使用单选框列
- 禁用的部件类型不可选中

### 3.2 右侧模块

- “部件类型目录”与左侧部件类型同源，但只显示 `Status = 1`
- “自定义类目录”按部件类型目录联动
- “产品元件标准目录”按 `部件类型目录 + 自定义类目录` 联动
- 三个目录列表都不默认选中

## 4. 弹窗逻辑

### 4.1 新增自定义类目录

- 需要先选中“部件类型目录”
- 支持批量新增多条 `ComponentSubType`
- 保存时写入 `S3D_Rule_ComponentTypeHierarchyRule`
- 写入字段：
  - `ComponentTypeID`
  - `Status = 1`
  - `ComponentSubType`
  - `GeometricIndustryStandard_CL = NULL`
  - `CommodityType = NULL`

### 4.2 新增标准目录

- 需要先选中“部件类型目录 + 自定义类目录”
- 弹窗左侧“已配置标准”与左侧“产品元件标准”同源
- 弹窗右侧“标准目录”与右下角“产品元件标准目录”同源
- 保存时以右侧“标准目录”列表为准
- 保存时同步 `S3D_Rule_ComponentTypeHierarchyRule`
- 写入字段：
  - `ComponentTypeID`
  - `Status = 1`
  - `ComponentSubType`
  - `GeometricIndustryStandard_CL`
  - `CommodityType = NULL`

### 4.3 配置 CommodityType

- 需要先选中“部件类型目录 + 自定义类目录 + 产品元件标准目录”
- 弹窗右下角展示当前标准，文案为 `标准：xxx`
- 弹窗中已配置 CommodityType 读取自 `S3D_Rule_ComponentTypeHierarchyRule.CommodityType`
- 过滤条件为 `ComponentTypeID + ComponentSubType + GeometricIndustryStandard_CL`
- CommodityType 不允许手工录入，只能从下拉框选择
- 下拉源：
  - `S3D_Common_CodeListTable.CodeListTableName = "PipingCommodityType"`
  - 读取对应 `S3D_Common_CodeListValue.ShortStringValue`
- 保存时以弹窗当前列表为准
- 保存策略：
  - 先删除当前标准下所有非空 `CommodityType` 记录
  - 再按当前列表重新插入
  - 不删除 `CommodityType = NULL` 的标准目录基础记录

## 5. 后端接口

控制器前缀：`/api/StandardCatalogDefinition`

### 5.1 基础查询与状态更新

- `GET /disciplines`
- `GET /component-types`
- `GET /component-types/existence`
- `POST /component-types`
- `PUT /component-types/{id}/status`
- `GET /component-types/{componentTypeId}/industry-standards`
- `PUT /industry-standards/{id}/status`

### 5.2 部件类型-标准绑定

- `GET /component-types/{componentTypeId}/binding-dialog`
- `PUT /component-type-standard-bindings`

请求体示例：

```json
{
  "discipline": "管系",
  "componentTypeDescription": "管材",
  "standardNames": ["GB/T 8163-2018", "SH/T 3410-2012"]
}
```

### 5.3 自定义类目录

- `GET /component-types/{componentTypeId}/custom-catalogs`
- `POST /component-types/{componentTypeId}/custom-catalogs`

请求体示例：

```json
{
  "componentSubTypes": ["0401", "0402"]
}
```

### 5.4 标准目录

- `GET /component-types/{componentTypeId}/product-standard-catalogs`
- `GET /component-types/{componentTypeId}/standard-catalog-directory-dialog`
- `PUT /component-types/{componentTypeId}/standard-catalog-directories`
- `PUT /component-types/{componentTypeId}/product-standard-catalogs/status`

### 5.5 CommodityType

- `GET /component-types/{componentTypeId}/commodity-type-dialog`
- `PUT /component-types/{componentTypeId}/commodity-types`

请求体示例：

```json
{
  "componentSubType": "0401",
  "geometricIndustryStandardCl": 10001,
  "commodityTypes": ["对焊弯头", "承插弯头"]
}
```

## 6. 前端 API 方法

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
- `createStandardCatalogCustomCatalogs(componentTypeId, data)`
- `getStandardCatalogProductStandardCatalogs(componentTypeId, componentSubType)`
- `getStandardCatalogDirectoryDialog(componentTypeId, componentSubType)`
- `saveStandardCatalogDirectory(componentTypeId, data)`
- `getStandardCatalogCommodityTypeDialog(componentTypeId, params)`
- `saveStandardCatalogCommodityTypes(componentTypeId, data)`
- `updateStandardCatalogProductStandardCatalogStatus(componentTypeId, data)`

## 7. 后续更新要求

以下内容变更时，需要同步更新本文档：

1. 字段映射调整
2. 新增或修改目录联动逻辑
3. 新增、编辑、删除接口
4. 弹窗字段、校验规则或保存策略变化
