-- 管道配置系统 - 数据库初始化脚本
-- 数据库: pipe_rule_configurator
-- 字符集: utf8mb4
-- 排序规则: utf8mb4_unicode_ci
-- 存储引擎: InnoDB

-- ==================== 清理 ====================
-- 注意: 仅在开发/测试环境使用
-- DROP DATABASE IF EXISTS `pipe_rule_configurator`;

-- ==================== 创建数据库 ====================
CREATE DATABASE IF NOT EXISTS `pipe_rule_configurator` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `pipe_rule_configurator`;

-- ==================== 表定义 ====================

-- 1. 对象类型表
CREATE TABLE `object_type` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
  `object_type_name` VARCHAR(100) NOT NULL UNIQUE COMMENT '对象类型名称，唯一',
  `description` VARCHAR(500) COMMENT '对象类型描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记（0=正常, 1=删除）',
  
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对象类型表';

-- 2. 接口配置表
CREATE TABLE `interface_config` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
  `object_type_id` BIGINT NOT NULL COMMENT '所属对象类型ID，外键',
  `interface_name` VARCHAR(100) NOT NULL COMMENT '接口名称（应以IJ开头）',
  `description` VARCHAR(500) COMMENT '接口描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
  
  UNIQUE KEY `uk_interface_unique` (`object_type_id`, `interface_name`),
  KEY `idx_interface_name` (`interface_name`),
  CONSTRAINT `fk_interface_object_type` FOREIGN KEY (`object_type_id`) REFERENCES `object_type`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='接口配置表';

-- 3. 属性定义表
CREATE TABLE `property_definition` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
  `interface_id` BIGINT NOT NULL COMMENT '所属接口ID，外键',
  `interface_name` VARCHAR(100) NOT NULL COMMENT '接口名称（冗余字段）',
  `category_name` VARCHAR(100) NOT NULL COMMENT '分类名称（如：BasicInfo）',
  `attribute_name` VARCHAR(100) NOT NULL COMMENT '属性英文名（如：RunID）',
  `attribute_user_name` VARCHAR(255) COMMENT '属性用户友好名称（如：Run ID）',
  `data_type` VARCHAR(50) NOT NULL COMMENT '数据类型（String/Integer/Double等）',
  `units_type` VARCHAR(50) COMMENT '单位类型（如：Length）',
  `primary_units` VARCHAR(50) COMMENT '主要单位（如：mm）',
  `codelist_name` VARCHAR(255) COMMENT 'CodeList名称',
  `codelist_namespace` VARCHAR(255) COMMENT 'CodeList命名空间',
  `on_property_page` TINYINT DEFAULT 1 COMMENT '是否显示在属性页面（0/1）',
  `is_read_only` TINYINT DEFAULT 0 COMMENT '是否只读（0/1）',
  `is_symbol_parameter` TINYINT DEFAULT 0 COMMENT '是否为符号参数（0/1）',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `description` VARCHAR(500) COMMENT '属性描述',
  `version` INT DEFAULT 1 COMMENT '版本号',
  `modifier` VARCHAR(100) COMMENT '最后修改人',
  `created_by` VARCHAR(100) COMMENT '创建人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
  `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
  
  UNIQUE KEY `uk_interface_attribute` (`interface_id`, `attribute_name`),
  KEY `idx_interface_name` (`interface_name`),
  KEY `idx_category_name` (`category_name`),
  KEY `idx_attribute_name` (`attribute_name`),
  KEY `idx_version` (`version`),
  KEY `idx_updated_at` (`updated_at`),
  CONSTRAINT `fk_property_interface` FOREIGN KEY (`interface_id`) REFERENCES `interface_config`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='属性定义表';

-- 4. 属性版本历史表
CREATE TABLE `property_version_history` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
  `property_id` BIGINT NOT NULL COMMENT '属性ID，外键',
  `version` INT NOT NULL COMMENT '版本号',
  `attribute_user_name` VARCHAR(255) COMMENT '属性用户友好名称快照',
  `data_type` VARCHAR(50) COMMENT '数据类型快照',
  `units_type` VARCHAR(50) COMMENT '单位类型快照',
  `primary_units` VARCHAR(50) COMMENT '主要单位快照',
  `codelist_name` VARCHAR(255) COMMENT 'CodeList名称快照',
  `codelist_namespace` VARCHAR(255) COMMENT 'CodeList命名空间快照',
  `on_property_page` TINYINT COMMENT '是否显示在属性页面快照',
  `is_read_only` TINYINT COMMENT '是否只读快照',
  `is_symbol_parameter` TINYINT COMMENT '是否为符号参数快照',
  `change_description` VARCHAR(500) COMMENT '变更说明',
  `modifier` VARCHAR(100) COMMENT '修改人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  KEY `idx_property_id` (`property_id`),
  KEY `idx_version` (`version`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_history_property` FOREIGN KEY (`property_id`) REFERENCES `property_definition`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='属性版本历史表';

-- 5. CodeList 定义表
CREATE TABLE `codelist_definition` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
  `codelist_name` VARCHAR(100) NOT NULL COMMENT 'CodeList名称',
  `codelist_namespace` VARCHAR(255) NOT NULL COMMENT 'CodeList命名空间',
  `description` VARCHAR(500) COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
  
  UNIQUE KEY `uk_codelist_unique` (`codelist_name`, `codelist_namespace`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CodeList定义表';

-- 6. CodeList 值表
CREATE TABLE `codelist_value` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
  `codelist_id` BIGINT NOT NULL COMMENT '所属CodeList ID，外键',
  `code` VARCHAR(100) NOT NULL COMMENT '编码值',
  `display_name` VARCHAR(255) NOT NULL COMMENT '显示名称',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `description` VARCHAR(500) COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  UNIQUE KEY `uk_codelist_value_unique` (`codelist_id`, `code`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_value_codelist` FOREIGN KEY (`codelist_id`) REFERENCES `codelist_definition`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CodeList值表';

-- 7. 单位类型表
CREATE TABLE `units_type_definition` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
  `units_type_name` VARCHAR(100) NOT NULL UNIQUE COMMENT '单位类型名称，唯一',
  `description` VARCHAR(500) COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  KEY `idx_units_type_name` (`units_type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单位类型表';

-- 8. 单位值表
CREATE TABLE `unit_value` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID，自增',
  `units_type_id` BIGINT NOT NULL COMMENT '所属单位类型ID，外键',
  `unit_name` VARCHAR(50) NOT NULL COMMENT '单位名称（如：mm）',
  `unit_symbol` VARCHAR(20) COMMENT '单位符号',
  `conversion_factor` DECIMAL(18,8) COMMENT '转换因子',
  `is_primary_unit` TINYINT DEFAULT 0 COMMENT '是否为主要单位（0/1）',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `description` VARCHAR(500) COMMENT '描述',
  
  UNIQUE KEY `uk_unit_unique` (`units_type_id`, `unit_name`),
  KEY `idx_is_primary_unit` (`is_primary_unit`),
  CONSTRAINT `fk_unit_type` FOREIGN KEY (`units_type_id`) REFERENCES `units_type_definition`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='单位值表';

-- ==================== 视图 ====================

-- 属性完整信息视图
CREATE VIEW `v_property_full_info` AS
SELECT 
  pd.id,
  ot.id as object_type_id,
  ot.object_type_name,
  ic.id as interface_id,
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
  pd.sort_order,
  pd.description,
  pd.version,
  pd.modifier,
  pd.created_by,
  pd.created_at,
  pd.updated_at
FROM property_definition pd
INNER JOIN interface_config ic ON pd.interface_id = ic.id
INNER JOIN object_type ot ON ic.object_type_id = ot.id
WHERE pd.is_deleted = 0 AND ic.is_deleted = 0 AND ot.is_deleted = 0;

-- ==================== 初始数据 ====================

-- 1. 初始化对象类型
INSERT INTO `object_type` (`object_type_name`, `description`) VALUES
('PipeRun', '管路'),
('Equipment', '设备'),
('Valve', '阀门'),
('Fitting', '配件'),
('Instrument', '仪器仪表'),
('Material', '材料');

-- 2. 初始化接口配置
INSERT INTO `interface_config` (`object_type_id`, `interface_name`, `description`) VALUES
(1, 'IJPipeRun', '管路接口'),
(2, 'IJEquipment', '设备接口'),
(3, 'IJValve', '阀门接口'),
(4, 'IJFitting', '配件接口'),
(5, 'IJInstrument', '仪器仪表接口'),
(6, 'IJMaterial', '材料接口');

-- 3. 初始化单位类型
INSERT INTO `units_type_definition` (`units_type_name`, `description`) VALUES
('Length', '长度'),
('Pressure', '压力'),
('Temperature', '温度'),
('Density', '密度'),
('Volume', '体积'),
('Mass', '质量'),
('FlowRate', '流量');

-- 4. 初始化单位值 - 长度单位
INSERT INTO `unit_value` (`units_type_id`, `unit_name`, `unit_symbol`, `conversion_factor`, `is_primary_unit`, `sort_order`, `description`) VALUES
(1, 'mm', 'mm', 1.0, 1, 1, '毫米'),
(1, 'cm', 'cm', 10.0, 0, 2, '厘米'),
(1, 'm', 'm', 1000.0, 0, 3, '米'),
(1, 'in', 'in', 25.4, 0, 4, '英寸'),
(1, 'ft', 'ft', 304.8, 0, 5, '英尺');

-- 5. 初始化单位值 - 压力单位
INSERT INTO `unit_value` (`units_type_id`, `unit_name`, `unit_symbol`, `conversion_factor`, `is_primary_unit`, `sort_order`, `description`) VALUES
(2, 'MPa', 'MPa', 1.0, 1, 1, '兆帕'),
(2, 'kPa', 'kPa', 0.001, 0, 2, '千帕'),
(2, 'bar', 'bar', 0.101325, 0, 3, '巴'),
(2, 'PSI', 'PSI', 0.00689476, 0, 4, '磅力每平方英寸');

-- 6. 初始化单位值 - 温度单位
INSERT INTO `unit_value` (`units_type_id`, `unit_name`, `unit_symbol`, `conversion_factor`, `is_primary_unit`, `sort_order`, `description`) VALUES
(3, '°C', '°C', 1.0, 1, 1, '摄氏度'),
(3, 'K', 'K', 1.0, 0, 2, '开尔文'),
(3, '°F', '°F', 1.8, 0, 3, '华氏度');

-- 7. 初始化单位值 - 密度单位
INSERT INTO `unit_value` (`units_type_id`, `unit_name`, `unit_symbol`, `conversion_factor`, `is_primary_unit`, `sort_order`, `description`) VALUES
(4, 'kg/m³', 'kg/m³', 1.0, 1, 1, '千克每立方米'),
(4, 'g/cm³', 'g/cm³', 1000.0, 0, 2, '克每立方厘米'),
(4, 'lb/ft³', 'lb/ft³', 16.0185, 0, 3, '磅每立方英尺');

-- 8. 初始化单位值 - 体积单位
INSERT INTO `unit_value` (`units_type_id`, `unit_name`, `unit_symbol`, `conversion_factor`, `is_primary_unit`, `sort_order`, `description`) VALUES
(5, 'm³', 'm³', 1.0, 1, 1, '立方米'),
(5, 'L', 'L', 0.001, 0, 2, '升'),
(5, 'mL', 'mL', 0.000001, 0, 3, '毫升'),
(5, 'ft³', 'ft³', 0.0283168, 0, 4, '立方英尺');

-- 9. 初始化单位值 - 质量单位
INSERT INTO `unit_value` (`units_type_id`, `unit_name`, `unit_symbol`, `conversion_factor`, `is_primary_unit`, `sort_order`, `description`) VALUES
(6, 'kg', 'kg', 1.0, 1, 1, '千克'),
(6, 'g', 'g', 0.001, 0, 2, '克'),
(6, 't', 't', 1000.0, 0, 3, '吨'),
(6, 'lb', 'lb', 0.453592, 0, 4, '磅');

-- 10. 初始化单位值 - 流量单位
INSERT INTO `unit_value` (`units_type_id`, `unit_name`, `unit_symbol`, `conversion_factor`, `is_primary_unit`, `sort_order`, `description`) VALUES
(7, 'm³/h', 'm³/h', 1.0, 1, 1, '立方米每小时'),
(7, 'L/min', 'L/min', 0.0000167, 0, 2, '升每分钟'),
(7, 'kg/h', 'kg/h', 1.0, 0, 3, '千克每小时');

-- 11. 初始化 CodeList - 管路类型
INSERT INTO `codelist_definition` (`codelist_name`, `codelist_namespace`, `description`) VALUES
('PipeType', 'com.smartplant.pipe', '管路类型'),
('MaterialGrade', 'com.smartplant.material', '材料等级'),
('FluidType', 'com.smartplant.fluid', '流体类型');

-- 12. 初始化 CodeList 值 - 管路类型
INSERT INTO `codelist_value` (`codelist_id`, `code`, `display_name`, `sort_order`, `description`) VALUES
(1, 'Seamless', '无缝管', 1, '无缝钢管'),
(1, 'Welded', '焊接管', 2, '焊接钢管'),
(1, 'Composite', '复合管', 3, '复合材料管');

-- 13. 初始化 CodeList 值 - 材料等级
INSERT INTO `codelist_value` (`codelist_id`, `code`, `display_name`, `sort_order`, `description`) VALUES
(2, 'A', 'Grade A', 1, '等级A'),
(2, 'B', 'Grade B', 2, '等级B'),
(2, 'C', 'Grade C', 3, '等级C');

-- 14. 初始化 CodeList 值 - 流体类型
INSERT INTO `codelist_value` (`codelist_id`, `code`, `display_name`, `sort_order`, `description`) VALUES
(3, 'Liquid', '液体', 1, '液体流体'),
(3, 'Gas', '气体', 2, '气体流体'),
(3, 'TwoPhase', '两相流', 3, '两相流体');

-- ==================== 示例属性数据 ====================

-- 为 IJPipeRun 接口添加示例属性
INSERT INTO `property_definition` (
  `interface_id`, `interface_name`, `category_name`, `attribute_name`, 
  `attribute_user_name`, `data_type`, `units_type`, `primary_units`,
  `codelist_name`, `codelist_namespace`, `on_property_page`, `is_read_only`,
  `is_symbol_parameter`, `sort_order`, `description`, `version`, `created_by`
) VALUES
(1, 'IJPipeRun', 'BasicInfo', 'RunID', 'Run ID', 'String', NULL, NULL, NULL, NULL, 1, 0, 0, 1, '管路标识', 1, 'system'),
(1, 'IJPipeRun', 'BasicInfo', 'Description', '描述', 'String', NULL, NULL, NULL, NULL, 1, 0, 0, 2, '管路描述', 1, 'system'),
(1, 'IJPipeRun', 'Geometry', 'OuterDiameter', '外径', 'Double', 'Length', 'mm', NULL, NULL, 1, 0, 1, 1, '管路外径', 1, 'system'),
(1, 'IJPipeRun', 'Geometry', 'WallThickness', '壁厚', 'Double', 'Length', 'mm', NULL, NULL, 1, 0, 1, 2, '管路壁厚', 1, 'system'),
(1, 'IJPipeRun', 'Material', 'MaterialGrade', '材料等级', 'String', NULL, NULL, 'MaterialGrade', 'com.smartplant.material', 1, 0, 0, 1, '材料等级', 1, 'system'),
(1, 'IJPipeRun', 'Conditions', 'OperatingPressure', '工作压力', 'Double', 'Pressure', 'MPa', NULL, NULL, 1, 0, 1, 1, '工作压力', 1, 'system'),
(1, 'IJPipeRun', 'Conditions', 'OperatingTemperature', '工作温度', 'Double', 'Temperature', '°C', NULL, NULL, 1, 0, 1, 2, '工作温度', 1, 'system');

-- 为 IJEquipment 接口添加示例属性
INSERT INTO `property_definition` (
  `interface_id`, `interface_name`, `category_name`, `attribute_name`, 
  `attribute_user_name`, `data_type`, `units_type`, `primary_units`,
  `codelist_name`, `codelist_namespace`, `on_property_page`, `is_read_only`,
  `is_symbol_parameter`, `sort_order`, `description`, `version`, `created_by`
) VALUES
(2, 'IJEquipment', 'BasicInfo', 'EquipmentID', '设备ID', 'String', NULL, NULL, NULL, NULL, 1, 0, 0, 1, '设备标识', 1, 'system'),
(2, 'IJEquipment', 'BasicInfo', 'EquipmentName', '设备名称', 'String', NULL, NULL, NULL, NULL, 1, 0, 0, 2, '设备名称', 1, 'system'),
(2, 'IJEquipment', 'Specifications', 'Type', '类型', 'String', NULL, NULL, NULL, NULL, 1, 0, 0, 1, '设备类型', 1, 'system'),
(2, 'IJEquipment', 'Performance', 'Capacity', '容积', 'Double', 'Volume', 'm³', NULL, NULL, 1, 0, 1, 1, '设备容积', 1, 'system');

-- ==================== 索引优化 ====================

-- 创建复合索引以优化常见查询
CREATE INDEX `idx_property_category_type` ON `property_definition`(`interface_id`, `category_name`, `attribute_name`);
CREATE INDEX `idx_interface_object_type` ON `interface_config`(`object_type_id`, `interface_name`);

-- ==================== 统计信息 ====================

-- 分析表统计信息以优化查询
ANALYZE TABLE `object_type`;
ANALYZE TABLE `interface_config`;
ANALYZE TABLE `property_definition`;
ANALYZE TABLE `property_version_history`;
ANALYZE TABLE `codelist_definition`;
ANALYZE TABLE `codelist_value`;
ANALYZE TABLE `units_type_definition`;
ANALYZE TABLE `unit_value`;

-- ==================== 完成 ====================
-- 脚本执行完成，数据库初始化成功！
