-- 管道配置系统 - 常用查询和存储过程
-- 数据库: pipe_rule_configurator

USE `pipe_rule_configurator`;

-- ==================== 常用查询 ====================

-- 1. 查询所有对象类型及其接口和属性统计
SELECT 
  ot.id,
  ot.object_type_name,
  ot.description,
  COUNT(DISTINCT ic.id) as interface_count,
  COUNT(DISTINCT pd.id) as property_count,
  ot.created_at,
  ot.updated_at
FROM object_type ot
LEFT JOIN interface_config ic ON ot.id = ic.object_type_id AND ic.is_deleted = 0
LEFT JOIN property_definition pd ON ic.id = pd.interface_id AND pd.is_deleted = 0
WHERE ot.is_deleted = 0
GROUP BY ot.id, ot.object_type_name, ot.description, ot.created_at, ot.updated_at
ORDER BY ot.created_at DESC;

-- 2. 查询指定对象类型的所有接口和属性
SELECT 
  ic.interface_name,
  pd.category_name,
  pd.attribute_name,
  pd.attribute_user_name,
  pd.data_type,
  pd.units_type,
  pd.primary_units,
  pd.version,
  pd.modifier,
  pd.created_at,
  pd.updated_at
FROM interface_config ic
LEFT JOIN property_definition pd ON ic.id = pd.interface_id AND pd.is_deleted = 0
WHERE ic.object_type_id = ? AND ic.is_deleted = 0
ORDER BY ic.interface_name, pd.category_name, pd.attribute_name;

-- 3. 查询属性的完整版本历史
SELECT 
  pvh.version,
  pvh.attribute_user_name,
  pvh.data_type,
  pvh.units_type,
  pvh.primary_units,
  pvh.codelist_name,
  pvh.change_description,
  pvh.modifier,
  pvh.created_at
FROM property_version_history pvh
WHERE pvh.property_id = ?
ORDER BY pvh.version DESC;

-- 4. 查询指定分类下的所有属性
SELECT 
  pd.id,
  pd.interface_name,
  pd.attribute_name,
  pd.attribute_user_name,
  pd.data_type,
  pd.units_type,
  pd.primary_units,
  pd.codelist_name,
  pd.on_property_page,
  pd.is_read_only,
  pd.is_symbol_parameter,
  pd.version
FROM property_definition pd
WHERE pd.interface_id = ? AND pd.category_name = ? AND pd.is_deleted = 0
ORDER BY pd.sort_order, pd.attribute_name;

-- 5. 查询使用特定 CodeList 的属性
SELECT 
  pd.id,
  pd.interface_name,
  pd.attribute_name,
  pd.attribute_user_name,
  pd.category_name,
  pd.version
FROM property_definition pd
WHERE pd.codelist_name = ? AND pd.codelist_namespace = ? AND pd.is_deleted = 0
ORDER BY pd.interface_name, pd.attribute_name;

-- 6. 查询使用特定单位类型的属性
SELECT 
  pd.id,
  pd.interface_name,
  pd.attribute_name,
  pd.attribute_user_name,
  pd.units_type,
  pd.primary_units,
  pd.category_name,
  pd.version
FROM property_definition pd
WHERE pd.units_type = ? AND pd.is_deleted = 0
ORDER BY pd.interface_name, pd.attribute_name;

-- 7. 统计每个接口的属性数量和分类数量
SELECT 
  ic.interface_name,
  COUNT(DISTINCT pd.id) as property_count,
  COUNT(DISTINCT pd.category_name) as category_count,
  MAX(pd.version) as max_version
FROM interface_config ic
LEFT JOIN property_definition pd ON ic.id = pd.interface_id AND pd.is_deleted = 0
WHERE ic.is_deleted = 0
GROUP BY ic.id, ic.interface_name
ORDER BY ic.interface_name;

-- 8. 查询特定版本的属性快照（用于版本对比）
SELECT 
  pvh.version,
  pvh.attribute_user_name,
  pvh.data_type,
  pvh.units_type,
  pvh.primary_units,
  pvh.codelist_name,
  pvh.on_property_page,
  pvh.is_read_only,
  pvh.is_symbol_parameter,
  pvh.change_description,
  pvh.modifier,
  pvh.created_at
FROM property_version_history pvh
WHERE pvh.property_id = ? AND pvh.version = ?;

-- 9. 查询最近修改的属性（用于活动流）
SELECT 
  pd.id,
  pd.interface_name,
  pd.category_name,
  pd.attribute_name,
  pd.attribute_user_name,
  pd.version,
  pd.modifier,
  pd.updated_at,
  ot.object_type_name
FROM property_definition pd
INNER JOIN interface_config ic ON pd.interface_id = ic.id
INNER JOIN object_type ot ON ic.object_type_id = ot.id
WHERE pd.is_deleted = 0 AND ic.is_deleted = 0 AND ot.is_deleted = 0
ORDER BY pd.updated_at DESC
LIMIT ?;

-- 10. 查询所有 CodeList 及其值数量
SELECT 
  cd.id,
  cd.codelist_name,
  cd.codelist_namespace,
  cd.description,
  COUNT(cv.id) as value_count,
  cd.created_at
FROM codelist_definition cd
LEFT JOIN codelist_value cv ON cd.id = cv.codelist_id
WHERE cd.is_deleted = 0
GROUP BY cd.id, cd.codelist_name, cd.codelist_namespace, cd.description, cd.created_at
ORDER BY cd.codelist_name;

-- 11. 查询指定 CodeList 的所有值
SELECT 
  cv.id,
  cv.code,
  cv.display_name,
  cv.sort_order,
  cv.description
FROM codelist_value cv
INNER JOIN codelist_definition cd ON cv.codelist_id = cd.id
WHERE cd.codelist_name = ? AND cd.codelist_namespace = ? AND cd.is_deleted = 0
ORDER BY cv.sort_order, cv.code;

-- 12. 查询单位类型及其单位值
SELECT 
  utd.units_type_name,
  uv.unit_name,
  uv.unit_symbol,
  uv.conversion_factor,
  uv.is_primary_unit,
  uv.sort_order,
  uv.description
FROM units_type_definition utd
LEFT JOIN unit_value uv ON utd.id = uv.units_type_id
WHERE utd.units_type_name = ?
ORDER BY uv.sort_order, uv.unit_name;

-- ==================== 存储过程 ====================

-- 1. 更新属性并记录版本历史
-- 用法: CALL sp_update_property(1, 'NewName', 'String', 'Length', 'mm', 'Updated field', 'admin');
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_update_property` $$
CREATE PROCEDURE `sp_update_property`(
  IN p_property_id BIGINT,
  IN p_attribute_user_name VARCHAR(255),
  IN p_data_type VARCHAR(50),
  IN p_units_type VARCHAR(50),
  IN p_primary_units VARCHAR(50),
  IN p_change_description VARCHAR(500),
  IN p_modifier VARCHAR(100)
)
BEGIN
  DECLARE v_new_version INT;
  DECLARE v_old_version INT;
  DECLARE v_interface_id BIGINT;
  
  START TRANSACTION;
  
  -- 获取当前版本号
  SELECT version, interface_id INTO v_old_version, v_interface_id
  FROM property_definition
  WHERE id = p_property_id AND is_deleted = 0
  FOR UPDATE;
  
  -- 计算新版本号
  SET v_new_version = v_old_version + 1;
  
  -- 记录历史记录
  INSERT INTO property_version_history (
    property_id, version, attribute_user_name, data_type,
    units_type, primary_units, change_description, modifier
  ) SELECT
    p_property_id, v_old_version, attribute_user_name, data_type,
    units_type, primary_units, p_change_description, p_modifier
  FROM property_definition
  WHERE id = p_property_id;
  
  -- 更新属性定义
  UPDATE property_definition
  SET 
    attribute_user_name = p_attribute_user_name,
    data_type = p_data_type,
    units_type = p_units_type,
    primary_units = p_primary_units,
    version = v_new_version,
    modifier = p_modifier,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_property_id;
  
  COMMIT;
  
  -- 返回新版本号
  SELECT v_new_version as new_version;
END $$

DELIMITER ;

-- 2. 创建新属性
-- 用法: CALL sp_create_property(1, 'BasicInfo', 'NewAttribute', 'New Attribute', 'String', NULL, NULL, 'admin');
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_create_property` $$
CREATE PROCEDURE `sp_create_property`(
  IN p_interface_id BIGINT,
  IN p_category_name VARCHAR(100),
  IN p_attribute_name VARCHAR(100),
  IN p_attribute_user_name VARCHAR(255),
  IN p_data_type VARCHAR(50),
  IN p_units_type VARCHAR(50),
  IN p_primary_units VARCHAR(50),
  IN p_created_by VARCHAR(100)
)
BEGIN
  DECLARE v_interface_name VARCHAR(100);
  
  -- 获取接口名称
  SELECT interface_name INTO v_interface_name
  FROM interface_config
  WHERE id = p_interface_id AND is_deleted = 0;
  
  -- 插入新属性
  INSERT INTO property_definition (
    interface_id, interface_name, category_name, attribute_name,
    attribute_user_name, data_type, units_type, primary_units,
    version, created_by, created_at, updated_at
  ) VALUES (
    p_interface_id, v_interface_name, p_category_name, p_attribute_name,
    p_attribute_user_name, p_data_type, p_units_type, p_primary_units,
    1, p_created_by, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  );
  
  -- 返回新插入的 ID
  SELECT LAST_INSERT_ID() as property_id;
END $$

DELIMITER ;

-- 3. 删除属性（逻辑删除）
-- 用法: CALL sp_delete_property(1);
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_delete_property` $$
CREATE PROCEDURE `sp_delete_property`(
  IN p_property_id BIGINT
)
BEGIN
  UPDATE property_definition
  SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP
  WHERE id = p_property_id;
  
  SELECT ROW_COUNT() as affected_rows;
END $$

DELIMITER ;

-- 4. 获取完整的属性树形结构（用于前端）
-- 用法: CALL sp_get_property_tree(1);
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_get_property_tree` $$
CREATE PROCEDURE `sp_get_property_tree`(
  IN p_object_type_id BIGINT
)
BEGIN
  SELECT 
    'ObjectType' as level,
    ot.id as id,
    NULL as parent_id,
    ot.object_type_name as name,
    COUNT(DISTINCT ic.id) as child_count
  FROM object_type ot
  LEFT JOIN interface_config ic ON ot.id = ic.object_type_id AND ic.is_deleted = 0
  WHERE ot.id = p_object_type_id AND ot.is_deleted = 0
  GROUP BY ot.id, ot.object_type_name
  
  UNION ALL
  
  SELECT 
    'Interface' as level,
    ic.id as id,
    ot.id as parent_id,
    ic.interface_name as name,
    COUNT(DISTINCT pd.id) as child_count
  FROM interface_config ic
  INNER JOIN object_type ot ON ic.object_type_id = ot.id
  LEFT JOIN property_definition pd ON ic.id = pd.interface_id AND pd.is_deleted = 0
  WHERE ot.id = p_object_type_id AND ic.is_deleted = 0 AND ot.is_deleted = 0
  GROUP BY ic.id, ic.interface_name, ot.id
  
  UNION ALL
  
  SELECT 
    'Property' as level,
    pd.id as id,
    ic.id as parent_id,
    CONCAT(pd.attribute_name, ' (', pd.data_type, ')') as name,
    0 as child_count
  FROM property_definition pd
  INNER JOIN interface_config ic ON pd.interface_id = ic.id
  INNER JOIN object_type ot ON ic.object_type_id = ot.id
  WHERE ot.id = p_object_type_id AND pd.is_deleted = 0 AND ic.is_deleted = 0 AND ot.is_deleted = 0
  ORDER BY level, parent_id, name;
END $$

DELIMITER ;

-- 5. 统计属性修改频率（用于分析）
-- 用法: CALL sp_get_property_modification_stats(30);
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_get_property_modification_stats` $$
CREATE PROCEDURE `sp_get_property_modification_stats`(
  IN p_days INT
)
BEGIN
  SELECT 
    pd.interface_name,
    pd.attribute_name,
    COUNT(pvh.id) as modification_count,
    MAX(pvh.created_at) as last_modified,
    GROUP_CONCAT(DISTINCT pvh.modifier) as modifiers
  FROM property_definition pd
  LEFT JOIN property_version_history pvh ON pd.id = pvh.property_id
    AND pvh.created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL p_days DAY)
  WHERE pd.is_deleted = 0
  GROUP BY pd.id, pd.interface_name, pd.attribute_name
  HAVING modification_count > 0
  ORDER BY modification_count DESC, last_modified DESC;
END $$

DELIMITER ;

-- 6. 恢复属性到特定版本
-- 用法: CALL sp_restore_property_to_version(1, 2, 'admin');
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_restore_property_to_version` $$
CREATE PROCEDURE `sp_restore_property_to_version`(
  IN p_property_id BIGINT,
  IN p_target_version INT,
  IN p_modifier VARCHAR(100)
)
BEGIN
  DECLARE v_current_version INT;
  DECLARE v_new_version INT;
  
  START TRANSACTION;
  
  -- 获取当前版本
  SELECT version INTO v_current_version
  FROM property_definition
  WHERE id = p_property_id AND is_deleted = 0
  FOR UPDATE;
  
  SET v_new_version = v_current_version + 1;
  
  -- 记录当前版本作为历史
  INSERT INTO property_version_history (
    property_id, version, attribute_user_name, data_type,
    units_type, primary_units, codelist_name, codelist_namespace,
    on_property_page, is_read_only, is_symbol_parameter,
    change_description, modifier
  ) SELECT
    p_property_id, v_current_version, attribute_user_name, data_type,
    units_type, primary_units, codelist_name, codelist_namespace,
    on_property_page, is_read_only, is_symbol_parameter,
    CONCAT('Restored from version ', p_target_version), p_modifier
  FROM property_definition
  WHERE id = p_property_id;
  
  -- 从历史恢复属性
  UPDATE property_definition pd
  SET 
    pd.attribute_user_name = (SELECT attribute_user_name FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.data_type = (SELECT data_type FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.units_type = (SELECT units_type FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.primary_units = (SELECT primary_units FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.codelist_name = (SELECT codelist_name FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.codelist_namespace = (SELECT codelist_namespace FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.on_property_page = (SELECT on_property_page FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.is_read_only = (SELECT is_read_only FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.is_symbol_parameter = (SELECT is_symbol_parameter FROM property_version_history WHERE property_id = p_property_id AND version = p_target_version),
    pd.version = v_new_version,
    pd.modifier = p_modifier,
    pd.updated_at = CURRENT_TIMESTAMP
  WHERE pd.id = p_property_id;
  
  COMMIT;
  
  SELECT v_new_version as new_version, 'Property restored successfully' as message;
END $$

DELIMITER ;

-- ==================== 触发器 ====================

-- 1. 自动清理太旧的版本历史记录（保留最近2年）
DELIMITER $$

DROP TRIGGER IF EXISTS `trg_cleanup_old_history` $$
CREATE TRIGGER `trg_cleanup_old_history`
AFTER INSERT ON `property_version_history`
FOR EACH ROW
BEGIN
  DELETE FROM property_version_history
  WHERE property_id = NEW.property_id
    AND created_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 YEAR)
    AND version < NEW.version - 100;  -- 保留至少100个版本
END $$

DELIMITER ;

-- ==================== 权限和备份建议 ====================
-- 
-- 1. 创建只读用户（用于报表和查询）
--    CREATE USER 'readonly_user'@'localhost' IDENTIFIED BY 'password';
--    GRANT SELECT ON pipe_rule_configurator.* TO 'readonly_user'@'localhost';
--
-- 2. 创建读写用户（用于应用程序）
--    CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'password';
--    GRANT SELECT, INSERT, UPDATE ON pipe_rule_configurator.* TO 'app_user'@'localhost';
--    REVOKE DELETE ON pipe_rule_configurator.* FROM 'app_user'@'localhost';
--
-- 3. 定期备份
--    mysqldump -u root -p pipe_rule_configurator > backup_$(date +%Y%m%d_%H%M%S).sql
--
-- 4. 启用二进制日志用于恢复
--    在 my.cnf 中添加: log_bin = /var/log/mysql/mysql-bin.log
--

-- ==================== 完成 ====================
