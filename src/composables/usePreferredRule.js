import { ref, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export const usePreferredRule = ({
  formData,
  fetchDimensionData,
  baseDimensionCache,
  setDimensionData,
  preferredRule: externalPreferredRule
}) => {
  const preferredRule = externalPreferredRule || ref(null)
  const preferredRuleOptions = ref([])
  const preferredRuleLoading = ref(false)

  const fetchPreferredRules = async () => {
    // 契约中未定义获取优选规则的接口，暂时返回空列表，避免调用错误的接口
    // 原接口: /api/pipe-spec/preferred-rules
    preferredRuleOptions.value = []
    return

    /* 
    preferredRuleLoading.value = true
    try {
      const res = await axios.get('/api/pipe-spec/preferred-rules')
      if (res.data.code === 200) {
        preferredRuleOptions.value = res.data.data || []
      } else {
        ElMessage.error(res.data.msg || '获取优选规则失败')
        preferredRuleOptions.value = []
      }
    } catch (error) {
      console.error('获取优选规则失败:', error)
      ElMessage.error('网络错误，获取优选规则失败')
      preferredRuleOptions.value = []
    } finally {
      preferredRuleLoading.value = false
    }
    */
  }

  watch(preferredRule, async (newVal) => {
    if (!formData.value.pipe || !formData.value.wallThickness) return
    const cacheKey = `${formData.value.pipe}__${formData.value.wallThickness}`
    if (!newVal) {
      if (baseDimensionCache.value[cacheKey]) {
        setDimensionData(baseDimensionCache.value[cacheKey], true)
        return
      }
      await fetchDimensionData(formData.value.pipe, formData.value.wallThickness, null)
      return
    }
    await fetchDimensionData(formData.value.pipe, formData.value.wallThickness, newVal)
  })

  return {
    preferredRule,
    preferredRuleOptions,
    preferredRuleLoading,
    fetchPreferredRules
  }
}
