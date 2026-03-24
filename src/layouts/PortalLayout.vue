<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')

const cards = computed(() => [
  {
    title: '管系规格书管理',
    desc: '管理字典、材料编码规则、规格书配置与 PCF 规则。',
    accent: '#3b82f6',
    quickLinks: [
      { label: '业务属性定义', path: '/dict/attribute/piping-class' },
      { label: '材料编码规则', path: '/pmc/index' },
      { label: '管系规格书配置', path: '/pipe-spec/index' }
    ]
  },
  {
    title: '产品元件标准数据管理',
    desc: '覆盖目录定义、分类层级、标准元件数据结构与维护。',
    accent: '#8b5cf6',
    quickLinks: [
      { label: '管系专业基础库', path: '/library/pipe' },
      { label: '风管专业基础库', path: '/library/duct' },
      { label: '电气专业基础库', path: '/library/electrical' }
    ]
  },
  {
    title: 'S3D 基础库与映射',
    desc: '管理对象属性、数据字典、库规则与模板映射关系。',
    accent: '#f59e0b',
    quickLinks: [
      { label: '属性管理', path: '/property/index' },
      { label: 'Codelist 管理', path: '/library/codelist' },
      { label: '模板数据管理', path: '/library/outfitting' }
    ]
  },
  {
    title: '标准简选管理',
    desc: '维护简选标准定义、数据结构和配置看板。',
    accent: '#14b8a6',
    quickLinks: [
      { label: '简选序列配置', path: '/standard-sequence/config' },
      { label: '简选看板', path: '/standard-sequence/dashboard' }
    ]
  },
  {
    title: '设计规则管理',
    desc: '对设计规则和生产规则进行统一配置与持续演进。',
    accent: '#ef4444',
    quickLinks: [
      { label: '设计规则类', path: '/design/rule-config' },
      { label: 'Spec 列表', path: '/spec/index' }
    ]
  },
  {
    title: '工程与集成运维',
    desc: '工程环境配置、资源看板、二开部署与运维工具入口。',
    accent: '#0ea5e9',
    quickLinks: [
      { label: 'S3D工程环境配置', path: '/dict/attribute/piping-class' },
      { label: '二次开发快速部署', path: '/dict/attribute/piping-class' }
    ]
  }
])

const statCards = computed(() => [
  { label: '今日规则变更', value: 12 },
  { label: 'S3D 同步任务', value: 5 },
  { label: '待处理配置', value: 7 }
])

const go = (path) => router.push(path)

const search = () => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) return
  const target = cards.value
    .flatMap(item => item.quickLinks)
    .find(item => item.label.toLowerCase().includes(value))
  if (target) go(target.path)
}
</script>

<template>
  <div class="portal-page">
    <header class="portal-header">
      <div class="brand">
        <div class="brand-logo">DR</div>
        <div class="brand-text">
          <h1>设计规则驱动管理系统</h1>
          <p>Design Rule Driven Management System</p>
        </div>
      </div>
      <div class="header-actions">
        <el-input
          v-model="keyword"
          class="portal-search"
          placeholder="全局搜索 字典代码、规格书、规则..."
          clearable
          @keyup.enter="search"
        />
        <el-button type="primary" plain>DSP 用户接入管理</el-button>
      </div>
    </header>

    <section class="welcome-area">
      <div>
        <h2>欢迎回来</h2>
        <p>今日有 3 条新的 S3D 数据同步通知，请注意查看。</p>
      </div>
      <div class="stats">
        <div v-for="item in statCards" :key="item.label" class="stat-item">
          <span class="stat-value">{{ item.value }}</span>
          <span class="stat-label">{{ item.label }}</span>
        </div>
      </div>
    </section>

    <section class="card-grid">
      <article
        v-for="card in cards"
        :key="card.title"
        class="entry-card"
        :style="{ '--accent': card.accent }"
      >
        <div class="card-title">{{ card.title }}</div>
        <p class="card-desc">{{ card.desc }}</p>
        <div class="quick-links">
          <button
            v-for="link in card.quickLinks"
            :key="link.label"
            type="button"
            @click="go(link.path)"
          >
            {{ link.label }}
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.portal-page {
  min-height: 100vh;
  background: #f4f7f9;
  padding: 24px 28px;
  box-sizing: border-box;
}

.portal-header {
  height: 72px;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.brand-text h1 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.brand-text p {
  margin: 2px 0 0;
  color: #94a3b8;
  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.portal-search {
  width: 360px;
}

.welcome-area {
  margin-top: 18px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #edf0f5;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.welcome-area h2 {
  margin: 0;
  color: #0f172a;
}

.welcome-area p {
  margin: 8px 0 0;
  color: #64748b;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  min-width: 120px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.stat-value {
  color: #0f172a;
  font-size: 22px;
  font-weight: 700;
}

.stat-label {
  color: #64748b;
  font-size: 12px;
}

.card-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.entry-card {
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.card-title {
  color: var(--accent);
  font-size: 18px;
  font-weight: 700;
}

.card-desc {
  color: #64748b;
  margin: 8px 0 14px;
  line-height: 1.5;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-links button {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.quick-links button:hover {
  background: #dbeafe;
}
</style>
