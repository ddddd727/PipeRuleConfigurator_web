# 管道配置系统 - 数据库设计文档

## 项目概述
基于前端属性管理模块的需求，设计完整的数据库架构，支持属性定义、版本管理、CodeList 配置和单位管理。

---

## 表结构设计

### 1. 对象类型表 (`object_type`)
**用途**: 管理系统中的对象类型（如：PipeRun、Equipment 等）

| 字段名 | 类型 | 长度 | 是否为空 | 注释 |
|------|------|------|--------|------|
| id | BIGINT | - | NO | 主键ID，自增 |
| object_type_name | VARCHAR | 100 | NO | 对象类型名称，唯一 |
| description | VARCHAR | 500 | YES | 对象类型描述 |
| created_at | TIMESTAMP | - | NO | 创建时间，默认当前时间 |
| updated_at | TIMESTAMP | - | NO | 更新时间，自动更新 |
| is_deleted | TINYINT | - | NO | 逻辑删除标记（0=正常, 1=删除） |

**索引**:
- PRIMARY KEY: `id`
- UNIQUE KEY: `object_type_name`
- INDEX: `idx_created_at`

**示例数据**:
```
PipeRun（管路）
Material（材料）
Equipment（设备）
Valve（阀门）
Fitting（配件）
Instrument（仪器仪表）
```

---

### 2. 接口配置表 (`interface_config`)
**用途**: 管理属于各个对象类型的接口（如：IJPipeRun、IJEquipment 等）

| 字段名 | 类型 | 长度 | 是否为空 | 注释 |
|------|------|------|--------|------|
| id | BIGINT | - | NO | 主键ID，自增 |
| object_type_id | BIGINT | - | NO | 所属对象类型ID，外键 |
| interface_name | VARCHAR | 100 | NO | 接口名称（应以IJ开头） |
| description | VARCHAR | 500 | YES | 接口描述 |
| created_at | TIMESTAMP | - | NO | 创建时间 |
| updated_at | TIMESTAMP | - | NO | 更新时间 |
| is_deleted | TINYINT | - | NO | 逻辑删除标记 |

**约束**:
- FOREIGN KEY: `object_type_id` → `object_type.id`
- UNIQUE KEY: `(object_type_id, interface_name)` - 同一对象类型下接口名唯一
- INDEX: `idx_interface_name`

**示例关系**:
```
PipeRun
├── IJPipeRun
└── ...

Equipment
├── IJEquipment
├── IJValve
└── ...
```

---

### 3. 属性定义表 (`property_definition`)
**用途**: 存储属性的定义信息，包含所有前端展示的属性字段

| 字段名 | 类型 | 长度 | 是否为空 | 注释 |
|------|------|------|--------|------|
| id | BIGINT | - | NO | 主键ID，自增 |
| interface_id | BIGINT | - | NO | 所属接口ID，外键 |
| interface_name | VARCHAR | 100 | NO | 接口名称（冗余字段） |
| category_name | VARCHAR | 100 | NO | 分类名称（如：BasicInfo） |
| attribute_name | VARCHAR | 100 | NO | 属性英文名（如：RunID） |
| attribute_user_name | VARCHAR | 255 | YES | 属性用户友好名称（如：Run ID） |
| data_type | VARCHAR | 50 | NO | 数据类型（String/Integer/Double等） |
| units_type | VARCHAR | 50 | YES | 单位类型（如：Length） |
| primary_units | VARCHAR | 50 | YES | 主要单位（如：mm） |
| codelist_name | VARCHAR | 255 | YES | CodeList名称 |
| codelist_namespace | VARCHAR | 255 | YES | CodeList命名空间 |
| on_property_page | TINYINT | - | NO | 是否显示在属性页面（0/1） |
| is_read_only | TINYINT | - | NO | 是否只读（0/1） |
| is_symbol_parameter | TINYINT | - | NO | 是否为符号参数（0/1） |
| sort_order | INT | - | NO | 排序顺序，默认0 |
| description | VARCHAR | 500 | YES | 属性描述 |
| version | INT | - | NO | 版本号，默认1 |
| modifier | VARCHAR | 100 | YES | 最后修改人 |
| created_by | VARCHAR | 100 | YES | 创建人 |
| created_at | TIMESTAMP | - | NO | 创建时间 |
| updated_at | TIMESTAMP | - | NO | 最后修改时间 |
| is_deleted | TINYINT | - | NO | 逻辑删除标记 |

**约束**:
- FOREIGN KEY: `interface_id` → `interface_config.id`
- UNIQUE KEY: `(interface_id, attribute_name)` - 同一接口下属性名唯一
- INDEX: `idx_interface_name`, `idx_category_name`, `idx_attribute_name`, `idx_version`

**业务逻辑**:
- 每次编辑时 `version` 自动 +1
- `updated_at` 自动更新为当前时间
- `modifier` 记录编辑操作者
- 支持逻辑删除，物理数据不删除

---

### 4. 属性版本历史表 (`property_version_history`)
**用途**: 记录属性每个版本的变更历史，用于审计和版本回溯

| 字段名 | 类型 | 长度 | 是否为空 | 注释 |
|------|------|------|--------|------|
| id | BIGINT | - | NO | 主键ID，自增 |
| property_id | BIGINT | - | NO | 属性ID，外键 |
| version | INT | - | NO | 版本号 |
| attribute_user_name | VARCHAR | 255 | YES | 属性用户友好名称快照 |
| data_type | VARCHAR | 50 | YES | 数据类型快照 |
| units_type | VARCHAR | 50 | YES | 单位类型快照 |
| primary_units | VARCHAR | 50 | YES | 主要单位快照 |
| codelist_name | VARCHAR | 255 | YES | CodeList名称快照 |
| codelist_namespace | VARCHAR | 255 | YES | CodeList命名空间快照 |
| on_property_page | TINYINT | YES | YES | 是否显示在属性页面快照 |
| is_read_only | TINYINT | YES | YES | 是否只读快照 |
| is_symbol_parameter | TINYINT | YES | YES | 是否为符号参数快照 |
| change_description | VARCHAR | 500 | YES | 变更说明 |
| modifier | VARCHAR | 100 | YES | 修改人 |
| created_at | TIMESTAMP | - | NO | 创建时间 |

**约束**:
- FOREIGN KEY: `property_id` → `property_definition.id`
- INDEX: `idx_property_id`, `idx_version`, `idx_created_at`

**用途**:
- 审计属性变更历史
- 支持版本对比
- 数据追溯

---

### 5. CodeList 定义表 (`codelist_definition`)
**用途**: 管理 CodeList（代码表）的定义

| 字段名 | 类型 | 长度 | 是否为空 | 注释 |
|------|------|------|--------|------|
| id | BIGINT | - | NO | 主键ID，自增 |
| codelist_name | VARCHAR | 100 | NO | CodeList名称 |
| codelist_namespace | VARCHAR | 255 | NO | CodeList命名空间 |
| description | VARCHAR | 500 | YES | 描述 |
| created_at | TIMESTAMP | - | NO | 创建时间 |
| updated_at | TIMESTAMP | - | NO | 更新时间 |
| is_deleted | TINYINT | - | NO | 逻辑删除标记 |

**约束**:
- UNIQUE KEY: `(codelist_name, codelist_namespace)`
- INDEX: `idx_created_at`

**示例**:
```
CodeList: MaterialGrades
Namespace: com.smartplant.materials
```

---

### 6. CodeList 值表 (`codelist_value`)
**用途**: 存储 CodeList 的具体值和显示名称

| 字段名 | 类型 | 长度 | 是否为空 | 注释 |
|------|------|------|--------|------|
| id | BIGINT | - | NO | 主键ID，自增 |
| codelist_id | BIGINT | - | NO | 所属CodeList ID，外键 |
| code | VARCHAR | 100 | NO | 编码值 |
| display_name | VARCHAR | 255 | NO | 显示名称 |
| sort_order | INT | - | NO | 排序顺序，默认0 |
| description | VARCHAR | 500 | YES | 描述 |
| created_at | TIMESTAMP | - | NO | 创建时间 |

**约束**:
- FOREIGN KEY: `codelist_id` → `codelist_definition.id`
- UNIQUE KEY: `(codelist_id, code)`
- INDEX: `idx_sort_order`

**示例**:
```
CodeList: MaterialGrades
├── A (显示名: Grade A)
├── B (显示名: Grade B)
└── C (显示名: Grade C)
```

---

### 7. 单位类型表 (`units_type_definition`)
**用途**: 管理单位类型（长度、压力、温度等）

| 字段名 | 类型 | 长度 | 是否为空 | 注释 |
|------|------|------|--------|------|
| id | BIGINT | - | NO | 主键ID，自增 |
| units_type_name | VARCHAR | 100 | NO | 单位类型名称，唯一 |
| description | VARCHAR | 500 | YES | 描述 |
| created_at | TIMESTAMP | - | NO | 创建时间 |

**约束**:
- UNIQUE KEY: `units_type_name`
- INDEX: `idx_units_type_name`

**示例**:
```
Length（长度）
Pressure（压力）
Temperature（温度）
Density（密度）
Volume（体积）
```

---

### 8. 单位值表 (`unit_value`)
**用途**: 管理具体的单位及其转换关系

| 字段名 | 类型 | 长度 | 是否为空 | 注释 |
|------|------|------|--------|------|
| id | BIGINT | - | NO | 主键ID，自增 |
| units_type_id | BIGINT | - | NO | 所属单位类型ID，外键 |
| unit_name | VARCHAR | 50 | NO | 单位名称（如：mm） |
| unit_symbol | VARCHAR | 20 | YES | 单位符号 |
| conversion_factor | DECIMAL | 18,8 | YES | 转换因子 |
| is_primary_unit | TINYINT | - | NO | 是否为主要单位（0/1） |
| sort_order | INT | - | NO | 排序顺序，默认0 |
| description | VARCHAR | 500 | YES | 描述 |

**约束**:
- FOREIGN KEY: `units_type_id` → `units_type_definition.id`
- UNIQUE KEY: `(units_type_id, unit_name)`
- INDEX: `idx_is_primary_unit`

**示例**:
```
Length 类型:
├── mm (主要单位, 转换因子: 1.0)
├── cm (转换因子: 10.0)
└── m (转换因子: 1000.0)

Pressure 类型:
├── MPa (主要单位, 转换因子: 1.0)
├── kPa (转换因子: 0.001)
└── bar (转换因子: 0.101325)
```

---

## 核心视图

### `v_property_full_info`
**用途**: 查询属性完整信息，包含对象类型、接口、属性等

**SQL**:
```sql
SELECT 
  pd.id,
  ot.object_type_name,
  ic.interface_name,
  pd.category_name,
  pd.attribute_name,
  pd.attribute_user_name,
  pd.data_type,
  pd.units_type,
  pd.primary_units,
  pd.codelist_name,
  pd.codelist_namespace,
  pd.on_property_page,
  pd.is_read_only,
  pd.is_symbol_parameter,
  pd.version,
  pd.modifier,
  pd.created_by,
  pd.created_at,
  pd.updated_at
FROM property_definition pd
INNER JOIN interface_config ic ON pd.interface_id = ic.id
INNER JOIN object_type ot ON ic.object_type_id = ot.id
WHERE pd.is_deleted = 0 AND ic.is_deleted = 0 AND ot.is_deleted = 0;
```

---

## 常用查询

### 1. 查询所有对象类型及接口数量
```sql
SELECT ot.object_type_name, COUNT(ic.id) as interface_count
FROM object_type ot
LEFT JOIN interface_config ic ON ot.id = ic.object_type_id AND ic.is_deleted = 0
WHERE ot.is_deleted = 0
GROUP BY ot.id, ot.object_type_name;
```

### 2. 查询指定接口的所有属性
```sql
SELECT * FROM v_property_full_info
WHERE interface_name = 'IJPipeRun'
ORDER BY category_name, attribute_name;
```

### 3. 查询属性的版本历史
```sql
SELECT * FROM property_version_history
WHERE property_id = ?
ORDER BY version DESC;
```

### 4. 查询特定属性的所有版本变更
```sql
SELECT 
  pvh.version,
  pvh.attribute_user_name,
  pvh.data_type,
  pvh.change_description,
  pvh.modifier,
  pvh.created_at
FROM property_version_history pvh
WHERE pvh.property_id = ?
ORDER BY pvh.version DESC;
```

### 5. 统计指定对象类型的属性数量
```sql
SELECT 
  ot.object_type_name,
  ic.interface_name,
  COUNT(pd.id) as property_count
FROM object_type ot
INNER JOIN interface_config ic ON ot.id = ic.object_type_id AND ic.is_deleted = 0
LEFT JOIN property_definition pd ON ic.id = pd.interface_id AND pd.is_deleted = 0
WHERE ot.is_deleted = 0
GROUP BY ot.id, ot.object_type_name, ic.id, ic.interface_name;
```

---

## 索引策略

| 表名 | 索引字段 | 目的 |
|------|--------|------|
| object_type | object_type_name | 快速查询对象类型 |
| interface_config | interface_name | 快速查询接口 |
| property_definition | interface_name, category_name, attribute_name, version, created_at, updated_at | 多条件查询、版本查询、时间范围查询 |
| property_version_history | property_id, version, created_at | 快速查询版本历史 |
| codelist_definition | codelist_name, codelist_namespace | CodeList查询 |
| codelist_value | codelist_id, code | CodeList值查询 |
| units_type_definition | units_type_name | 单位类型查询 |
| unit_value | units_type_id, is_primary_unit | 单位查询 |

---

## 数据完整性设计

### 约束
1. **外键约束**: 确保接口、属性与父类型的关系完整性
2. **唯一约束**: 防止重复的对象类型、接口、属性、CodeList等
3. **非空约束**: 关键字段必填

### 逻辑删除
- 所有表都使用 `is_deleted` 字段进行逻辑删除
- 逻辑删除不真正移除数据，便于审计和恢复
- 查询时需加入 `WHERE is_deleted = 0` 条件

### 版本管理
- `property_definition.version` 记录当前版本号
- `property_version_history` 记录所有历史版本
- 每次更新属性时，版本号自动 +1

---

## 性能考虑

1. **分区策略**: 若数据量很大，可对 `property_definition` 和 `property_version_history` 按年份/月份分区
2. **缓存策略**: 
   - CodeList 和 UnitType 相对稳定，可缓存
   - 属性定义可采用热数据缓存
3. **批量操作**: 使用批量 INSERT/UPDATE 提高效率
4. **异步处理**: 版本历史记录可异步写入

---

## 后续扩展

1. **权限管理**: 添加操作日志表，记录谁在何时进行了什么操作
2. **工作流**: 若需要属性定义的审批流程，可添加工作流表
3. **国际化**: 若需支持多语言，可添加 translation 表
4. **规则引擎**: 若需属性验证规则，可添加 validation_rule 表

---

**文档版本**: v1.0  
**最后更新**: 2026-01-08  
**作者**: AI Assistant
