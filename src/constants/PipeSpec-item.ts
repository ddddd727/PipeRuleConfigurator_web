/**
 * 管道规格配置信息数据结构
 * 用于前端临时存储 PipeSpecConfigForm 中的配置信息
 * 
 * 根据API契约简化版本：
 * 1. 移除 NPD 通径范围信息 (npdRange)
 * 2. 移除 重复范围默认配置 (duplicateRangeDefaults)
 * 3. 仅保留 标准文件和材料信息
 */

// 标准文件配置项接口
export interface StandardFileConfiguration {
  standardFileId: string | number
  standardFileName: string
  materialId: string | number
  materialName: string
  // bendRadiusMultiple?: number | string | null // 根据简化契约，暂不包含弯管半径倍数
}

// 单个配置项接口
export interface PipeSpecConfigItem {
  id: string | number // 配置项唯一标识
  partType: string // 部件类型（如：Bend, Elbow, Tee 等）
  standardNames: string[] // 选择的标准文件名称数组
  
  // 标准文件配置（内部格式 - 对应后端简化模型）
  standardConfigurations: Array<{
    standardName: string
    materialName: string
  }> 
  
  configurations: StandardFileConfiguration[] // 标准文件配置（友好格式 - 用于UI显示）
  
  createTime: string // 创建时间
  updateTime?: string // 更新时间
}

// 管道规格配置数据存储类
class PipeSpecConfigStore {
  private configs: PipeSpecConfigItem[] = []
  private nextId: number = 1

  /**
   * 添加新的配置项
   * @param configData 配置数据
   * @returns 新添加的配置项ID
   */
  addConfig(configData: Omit<PipeSpecConfigItem, 'id' | 'createTime' | 'updateTime'>): string {
    const newConfig: PipeSpecConfigItem = {
      id: `config-${this.nextId++}`,
      ...configData,
      createTime: new Date().toISOString()
    }
    this.configs.push(newConfig)
    return newConfig.id.toString()
  }

  /**
   * 根据ID更新配置项
   * @param id 配置项ID
   * @param configData 新的配置数据
   * @returns 是否更新成功
   */
  updateConfig(
    id: string | number,
    configData: Partial<Omit<PipeSpecConfigItem, 'id' | 'createTime' | 'updateTime'>>
  ): boolean {
    const index = this.configs.findIndex(item => item.id === id)
    if (index !== -1) {
      this.configs[index] = {
        ...this.configs[index],
        ...configData,
        updateTime: new Date().toISOString()
      }
      return true
    }
    return false
  }

  /**
   * 根据部件类型更新配置项
   * @param partType 部件类型
   * @param configData 新的配置数据
   * @returns 是否更新成功
   */
  updateConfigByPartType(
    partType: string,
    configData: Partial<Omit<PipeSpecConfigItem, 'id' | 'createTime' | 'updateTime'>>
  ): boolean {
    const index = this.configs.findIndex(item => item.partType === partType)
    if (index !== -1) {
      this.configs[index] = {
        ...this.configs[index],
        ...configData,
        updateTime: new Date().toISOString()
      }
      return true
    }
    return false
  }

  /**
   * 根据ID删除配置项
   * @param id 配置项ID
   * @returns 是否删除成功
   */
  deleteConfig(id: string | number): boolean {
    const index = this.configs.findIndex(item => item.id === id)
    if (index !== -1) {
      this.configs.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 根据部件类型删除配置项
   * @param partType 部件类型
   * @returns 是否删除成功
   */
  deleteConfigByPartType(partType: string): boolean {
    const index = this.configs.findIndex(item => item.partType === partType)
    if (index !== -1) {
      this.configs.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 根据ID获取配置项
   * @param id 配置项ID
   * @returns 配置项或undefined
   */
  getConfig(id: string | number): PipeSpecConfigItem | undefined {
    return this.configs.find(item => item.id === id)
  }

  /**
   * 根据部件类型获取配置项
   * @param partType 部件类型
   * @returns 配置项或undefined
   */
  getConfigByPartType(partType: string): PipeSpecConfigItem | undefined {
    return this.configs.find(item => item.partType === partType)
  }

  /**
   * 获取所有配置项
   * @returns 所有配置项数组
   */
  getAllConfigs(): PipeSpecConfigItem[] {
    return [...this.configs]
  }

  /**
   * 检查部件类型是否已配置
   * @param partType 部件类型
   * @returns 是否已配置
   */
  hasPartType(partType: string): boolean {
    return this.configs.some(item => item.partType === partType)
  }

  /**
   * 清空所有配置
   */
  clearAll(): void {
    this.configs = []
    this.nextId = 1
  }

  /**
   * 获取配置项数量
   * @returns 配置项数量
   */
  getCount(): number {
    return this.configs.length
  }

  /**
   * 导出配置数据（用于保存到后端）
   * @returns 配置数据的JSON字符串
   */
  exportConfigs(): string {
    return JSON.stringify(this.configs, null, 2)
  }

  /**
   * 从JSON字符串导入配置数据
   * @param jsonStr JSON字符串
   * @returns 是否导入成功
   */
  importConfigs(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr)
      if (Array.isArray(data)) {
        this.configs = data
        // 更新nextId，避免ID冲突
        const maxId = Math.max(...data.map(item => {
          const idStr = item.id.toString()
          const idNum = parseInt(idStr.replace('config-', ''))
          return isNaN(idNum) ? 0 : idNum
        }), 0)
        this.nextId = maxId + 1
        return true
      }
      return false
    } catch (error) {
      console.error('导入配置数据失败:', error)
      return false
    }
  }
}

// 创建并导出单例实例
export const pipeSpecConfigStore = new PipeSpecConfigStore()

// 默认导出存储类（用于类型检查或创建新实例）
export default PipeSpecConfigStore
