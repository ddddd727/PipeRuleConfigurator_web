class PipeSpecConfigStore {
 constructor() {
 this.configs = []
 this.nextId =1
 }

 addConfig(configData) {
 const newConfig = {
 id: `config-${this.nextId++}`,
 ...configData,
 createTime: new Date().toISOString()
 }
 this.configs.push(newConfig)
 return newConfig.id.toString()
 }

 updateConfig(id, configData) {
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

 updateConfigByPartType(partType, configData) {
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

 updateConfigByComponentTypeId(componentTypeId, configData) {
 const index = this.configs.findIndex(item => item.componentTypeId === componentTypeId)
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

 deleteConfig(id) {
 const index = this.configs.findIndex(item => item.id === id)
 if (index !== -1) {
 this.configs.splice(index,1)
 return true
 }
 return false
 }

 deleteConfigByPartType(partType) {
 const index = this.configs.findIndex(item => item.partType === partType)
 if (index !== -1) {
 this.configs.splice(index,1)
 return true
 }
 return false
 }

 deleteConfigByComponentTypeId(componentTypeId) {
 const index = this.configs.findIndex(item => item.componentTypeId === componentTypeId)
 if (index !== -1) {
 this.configs.splice(index,1)
 return true
 }
 return false
 }

 getConfig(id) {
 return this.configs.find(item => item.id === id)
 }

 getConfigByPartType(partType) {
 return this.configs.find(item => item.partType === partType)
 }

 getConfigByComponentTypeId(componentTypeId) {
 return this.configs.find(item => item.componentTypeId === componentTypeId)
 }

 getAllConfigs() {
 return [...this.configs]
 }

 hasPartType(partType) {
 return this.configs.some(item => item.partType === partType)
 }

 hasComponentTypeId(componentTypeId) {
 return this.configs.some(item => item.componentTypeId === componentTypeId)
 }

 clearAll() {
 this.configs = []
 this.nextId =1
 }

 getCount() {
 return this.configs.length
 }

 exportConfigs() {
 return JSON.stringify(this.configs, null,2)
 }

 importConfigs(jsonStr) {
 try {
 const data = JSON.parse(jsonStr)
 if (Array.isArray(data)) {
 this.configs = data
 const maxId = Math.max(...data.map(item => {
 const idStr = item.id.toString()
 const idNum = parseInt(idStr.replace('config-', ''))
 return isNaN(idNum) ?0 : idNum
 }),0)
 this.nextId = maxId +1
 return true
 }
 return false
 } catch (error) {
 console.error('导入配置数据失败:', error)
 return false
 }
 }
}

export const pipeSpecConfigStore = new PipeSpecConfigStore()

export default PipeSpecConfigStore
