# StandardCatalogDefinition 模块契约

## 1. 文档说明

- 文档位置：`src/apps/product-standard/features/standard-catalog-definition/docs/API_CONTRACT.md`
- 适用范围：前端 `standard-catalog-definition` 页面与后端 `StandardCatalogDefinition` 模块联调
- 维护原则：页面行为、接口结构、数据源或字段含义发生变化时，必须同步更新本文件

## 2. 模块范围

当前模块包含两个并列区域：

1. 标准-部件类型配置模块
2. 产品元件标准目录管理模块

当前已落地的能力包含“部件类型”与“产品元件标准”两层联动，包含：

- 专业下拉加载
- 左侧部件类型列表加载
- 左侧启用/禁用状态切换并回写数据库
- 左侧产品元件标准列表按部件类型联动加载
- 右侧部件类型目录按启用状态过滤展示

以下内容暂未接入真实后端数据：

- 自定义类目录
- 产品元件标准目录
- 新增按钮相关新增/绑定功能

## 3. 数据源约定

### 3.1 主数据表

- 数据表：`S3D_Dict_ComponentType`
- 数据表：`S3D_Dict_GeometricIndustryStandard`
- 数据表：`S3D_Common_CodeListValue`

### 3.2 字段映射

| 数据库字段 | 前端/接口含义 | 说明 |
| --- | --- | --- |
| `ID` | `id` | 主键 |
| `Discipline` | 专业 | 用于两个模块顶部下拉框 |
| `ComponentTypeDescription` | 部件类型 | 展示在“部件类型”与“部件类型目录”列 |
| `Status` | `enabled` | `1=true`，`0=false` |

`S3D_Dict_GeometricIndustryStandard` 字段映射：

| 数据库字段 | 前端/接口含义 | 说明 |
| --- | --- | --- |
| `ID` | `id` | 关联记录主键 |
| `ComponentTypeID` | 部件类型主键 | 对应 `S3D_Dict_ComponentType.ID` |
| `GeometricIndustryStandard_CL` | 标准码值 | 作为翻译关联字段 |
| `Status` | `enabled` | `1=true`，`0=false`，用于控制前端开关状态 |

`S3D_Common_CodeListValue` 字段映射：

| 数据库字段 | 前端/接口含义 | 说明 |
| --- | --- | --- |
| `CodeListTableID` | 码表标识 | 通过 `S3D_Common_CodeListTable.CodeListTableName = "GeometricIndustryStandard"` 动态解析 |
| `CodeListNumber` | 标准码值 | 对应 `GeometricIndustryStandard_CL` |
| `ShortStringValue` | 标准显示值 | 展示在“产品元件标准”列表 |
| `Status` | 码值启用状态 | 为 `0` 不显示 |

### 3.3 下拉框约定

- 专业下拉数据源：`S3D_Dict_ComponentType.Discipline` 去重结果
- 左右两个专业下拉框使用同一个前端状态
- 默认值：`管系`
- 若返回数据中不存在 `管系`，则回退为首个可选项

## 4. 页面行为契约

### 4.1 左侧“部件类型”表格

- 数据来源：后端接口 `/StandardCatalogDefinition/component-types`
- 传参：`discipline`
- 展示字段：
  - “部件类型”列显示 `ComponentTypeDescription`
  - “启用”列显示 `Status`
- 开关切换规则：
  - `status = 1` 时开关为开
  - `status = 0` 时开关为关
  - 用户切换开关后，调用状态更新接口回写数据库

### 4.2 右侧“部件类型目录”表格

- 与左侧“部件类型”列表同源
- 仅展示 `status = 1` 的数据
- 左侧状态切换成功后，右侧列表需同步刷新展示结果

### 4.3 左侧“产品元件标准”表格

- 触发条件：左侧“部件类型”表格选中某一行后加载
- 查询链路：
  1. 获取当前选中部件类型对应的 `ID`
  2. 到 `S3D_Dict_GeometricIndustryStandard` 中按 `ComponentTypeID = 当前ID` 筛选
  3. 不过滤 `S3D_Dict_GeometricIndustryStandard.Status`，而是将其映射为表格中的启用开关状态
  4. 取出 `GeometricIndustryStandard_CL`
  5. 先到 `S3D_Common_CodeListTable` 中查找 `CodeListTableName = "GeometricIndustryStandard"` 对应的 `ID`
  6. 再到 `S3D_Common_CodeListValue` 中查找 `CodeListTableID = 上一步ID` 且 `CodeListNumber = GeometricIndustryStandard_CL`
  7. 仅保留 `S3D_Common_CodeListValue.Status = 1` 的记录
  8. 使用 `ShortStringValue` 作为列表展示名称
- 展示字段：
  - “标准”列显示 `ShortStringValue`
  - “启用”列控制 `S3D_Dict_GeometricIndustryStandard.Status`

### 4.4 选中交互

- 五个表格首列均保留单选按钮
- 点击表格行时，单选按钮与当前行高亮同步变化
- 默认不自动选中任何行

## 5. 后端接口契约

后端控制器：`/api/StandardCatalogDefinition`

### 5.1 获取专业下拉

- 方法：`GET`
- 路径：`/api/StandardCatalogDefinition/disciplines`
- 说明：返回 `Discipline` 去重结果

响应示例：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "label": "管系",
      "value": "管系"
    }
  ]
}
```

### 5.2 获取部件类型列表

- 方法：`GET`
- 路径：`/api/StandardCatalogDefinition/component-types`

查询参数：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `discipline` | string | 否 | 专业筛选 |
| `enabledOnly` | bool | 否 | 是否仅返回启用项，默认 `false` |

响应 `data` 项结构：

```json
{
  "id": 1,
  "discipline": "管系",
  "componentType": "管材",
  "enabled": true
}
```

### 5.3 更新部件类型启用状态

- 方法：`PUT`
- 路径：`/api/StandardCatalogDefinition/component-types/{id}/status`

请求体：

```json
{
  "enabled": true
}
```

成功响应示例：

```json
{
  "code": 200,
  "message": "Status updated successfully."
}
```

失败约定：

- 当 `id` 不存在时，返回 `404`

### 5.4 获取指定部件类型下的产品元件标准列表

- 方法：`GET`
- 路径：`/api/StandardCatalogDefinition/component-types/{componentTypeId}/industry-standards`

响应 `data` 项结构：

```json
{
  "id": 101,
  "geometricIndustryStandardCl": 12,
  "standardName": "ASME B16.9",
  "enabled": true
}
```

### 5.5 更新产品元件标准启用状态

- 方法：`PUT`
- 路径：`/api/StandardCatalogDefinition/industry-standards/{id}/status`

请求体：

```json
{
  "enabled": false
}
```

成功响应示例：

```json
{
  "code": 200,
  "message": "Status updated successfully."
}
```

## 6. 前端调用契约

前端 API 文件：`src/apps/product-standard/features/standard-catalog-definition/api/standardCatalogDefinitionAPI.js`

当前已定义方法：

| 方法名 | 说明 |
| --- | --- |
| `getStandardCatalogDisciplines()` | 获取专业下拉 |
| `getStandardCatalogComponentTypes(params)` | 获取部件类型列表 |
| `getStandardCatalogIndustryStandards(componentTypeId)` | 获取选中部件类型下的产品元件标准列表 |
| `updateStandardCatalogIndustryStandardStatus(id, enabled)` | 更新产品元件标准启用状态 |
| `updateStandardCatalogComponentTypeStatus(id, enabled)` | 更新启用状态 |

## 7. 当前已实现文件

### 7.1 前端

- `pages/StandardCatalogDefinition.vue`
- `api/standardCatalogDefinitionAPI.js`

### 7.2 后端

- `Modules/StandardCatalogDefinition/Controllers/StandardCatalogDefinitionController.cs`
- `Modules/StandardCatalogDefinition/Services/Implementations/StandardCatalogDefinitionService.cs`
- `Modules/StandardCatalogDefinition/Services/Interfaces/IStandardCatalogDefinitionService.cs`
- `Modules/StandardCatalogDefinition/Dtos/StandardCatalogDisciplineResponse.cs`
- `Modules/StandardCatalogDefinition/Dtos/StandardCatalogComponentTypeResponse.cs`
- `Modules/StandardCatalogDefinition/Dtos/StandardCatalogIndustryStandardResponse.cs`
- `Modules/StandardCatalogDefinition/Dtos/UpdateStandardCatalogIndustryStandardStatusRequest.cs`
- `Modules/StandardCatalogDefinition/Dtos/UpdateStandardCatalogComponentTypeStatusRequest.cs`
- `Modules/StandardCatalogDefinition/Entities/S3dDictGeometricIndustryStandard.cs`
- `Modules/StandardCatalogDefinition/DataConfigurations/S3dDictGeometricIndustryStandardConfiguration.cs`
- `Shared/Entities/S3dDictPipingComponentType.cs`
- `Shared/DataConfigurations/S3dDictPipingComponentTypeConfiguration.cs`

## 8. 后续更新要求

后续若接入以下内容，必须同步更新本契约：

1. 产品元件标准的新增、编辑、启用控制等后续能力
2. 自定义类目录的真实数据源、接口与层级关系
3. 产品元件标准目录的真实数据源、接口与层级关系
4. 新增、编辑、删除、绑定类接口
5. 表格字段、默认值、筛选规则、联动规则的任何变化
