<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, Document, Box, Connection,
  SetUp, Monitor, ArrowRight,
  Bell, CaretBottom, User
} from '@element-plus/icons-vue'

const router = useRouter()
const keyword = ref('')

const modules = computed(() => [
  {
    title: '产品元件标准数据管理',
    desc: '覆盖目录定义、分类层级、标准元件数据结构与S3D基础库维护。',
    icon: Box,
    mainPath: '/product-standard/catalog-definition/standard/piping',
    color: '#264f7b',
    links: [
      { label: 'S3D对象属性管理', path: '/product-standard/data-management/s3d-property' },
      { label: 'S3D部件数据(管系)', path: '/product-standard/data-management/s3d-component/piping/spec' }
    ]
  },
  {
    title: '管系规格书管理',
    desc: '管理业务属性字典、材料编码规则、管系规格书配置与PCF规则。',
    icon: Document,
    mainPath: '/pipe-spec/dict/attribute/piping-class',
    color: '#264f7b',
    links: [
      { label: '业务属性定义', path: '/pipe-spec/dict/attribute/piping-class' },
      { label: '材料编码', path: '/pipe-spec/material-code/index' }
    ]
  },
  {
    title: '设计规则管理',
    desc: '对设计规则和生产规则进行统一配置与持续演进。',
    icon: SetUp,
    mainPath: '/design-rule/design/rule-config',
    color: '#264f7b',
    links: [
      { label: '设计规则类', path: '/design-rule/design/rule-config' },
      { label: 'Spec 列表', path: '/design-rule/design/spec-list' }
    ]
  },
  {
    title: '工程基础管理',
    desc: '工程环境配置与S3D项目服务器资源监控看板。',
    icon: Monitor,
    mainPath: '/engineering/s3d-env-config',
    color: '#264f7b',
    links: [
      { label: 'S3D工程环境配置', path: '/engineering/s3d-env-config' },
      { label: '服务器资源看板', path: '/engineering/s3d-server-dashboard' }
    ]
  },
  {
    title: '组件持续集成系统',
    desc: '二次开发快速部署、操作速查手册与使用频次统计看板。',
    icon: Connection,
    mainPath: '/component-ci/rapid-deploy',
    color: '#264f7b',
    links: [
      { label: '快速部署', path: '/component-ci/rapid-deploy' },
      { label: '操作速查', path: '/component-ci/operation-guide' }
    ]
  }
])

const go = (path) => router.push(path)
const handleSearch = () => {
  if (!keyword.value.trim()) return
  console.log('搜索:', keyword.value)
}
</script>

<template>
  <div class="layout">

    <!-- ───── 顶栏 ───── -->
    <header class="navbar">
      <!-- 左：品牌 -->
      <div class="navbar-brand">
        <div class="logo">
          <svg viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="9" fill="rgba(255,255,255,0.12)"/>
            <path d="M18 7 L30 14 L30 22 L18 29 L6 22 L6 14 Z"
              stroke="white" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
            <circle cx="18" cy="18" r="4" fill="rgba(255,255,255,0.9)"/>
            <circle cx="18" cy="18" r="2" fill="#264f7b"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">设计规则驱动管理系统</span>
          <span class="brand-sub">PMC Rule Engine · 外高桥造船</span>
        </div>
      </div>

      <!-- 中：搜索 -->
      <div class="navbar-search">
        <el-input
          v-model="keyword"
          placeholder="搜索字典、规格书、设计规则…"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 右：用户区 -->
      <div class="navbar-actions">
        <el-tooltip content="消息通知" placement="bottom">
          <el-badge :value="3" class="notif">
            <div class="icon-btn">
              <el-icon :size="18"><Bell /></el-icon>
            </div>
          </el-badge>
        </el-tooltip>

        <div class="divider-v"></div>

        <el-tooltip content="暂未接入登录系统" placement="bottom">
          <div class="user-block user-block--disabled">
            <el-avatar class="user-ava" :size="32">
              <el-icon :size="16"><User /></el-icon>
            </el-avatar>
            <div class="user-info">
              <span class="user-name">未登录</span>
              <span class="user-role">待接入</span>
            </div>
            <el-icon class="caret"><CaretBottom /></el-icon>
          </div>
        </el-tooltip>
      </div>
    </header>

    <!-- ───── 主体 ───── -->
    <main class="main">

      <!-- 欢迎区 -->
      <section class="welcome">
        <div class="welcome-left">
          <h1 class="welcome-title">欢迎进入设计规则驱动管理系统</h1>
          <p class="welcome-desc">请选择您需要进入的功能模块。登录系统接入后将展示个性化信息。</p>
        </div>

      </section>

      <!-- 模块卡片 -->
      <section class="grid">
        <div
          v-for="mod in modules"
          :key="mod.title"
          class="card"
          @click="go(mod.mainPath)"
        >
          <div class="card-top">
            <div class="card-icon">
              <el-icon :size="22"><component :is="mod.icon" /></el-icon>
            </div>
            <el-icon class="card-arrow"><ArrowRight /></el-icon>
          </div>
          <div class="card-mid">
            <h3 class="card-title">{{ mod.title }}</h3>
            <p class="card-desc">{{ mod.desc }}</p>
          </div>
          <div class="card-bottom" @click.stop>
            <span
              v-for="link in mod.links"
              :key="link.label"
              class="chip"
              @click="go(link.path)"
            >{{ link.label }}</span>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
/* ─── 变量 ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.layout {
  --p:      #264f7b;
  --p-h:    #3a6b9c;
  --p-l:    #eef3f8;
  --p-d:    #1e3f63;
  --bg:     #f0f2f5;
  --white:  #ffffff;
  --border: #e4e7ed;
  --t1:     #1d2b3a;
  --t2:     #606c7a;
  --t3:     #9aa3ae;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);
  --shadow-h: 0 6px 24px rgba(38,79,123,.13);

  min-height: 100vh;
  background: var(--bg);
  font-family: 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
  color: var(--t1);
}

/* ─── Navbar ─── */
.navbar {
  height: 60px;
  background: var(--p);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 20px;
  position: sticky;
  top: 0;
  z-index: 999;
  /* 微妙底部光晕 */
  box-shadow: 0 1px 0 rgba(255,255,255,.08), 0 4px 20px rgba(38,79,123,.4);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  flex-shrink: 0;
  width: 280px;
}
.logo svg { width: 36px; height: 36px; display: block; }

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.brand-name {
  font-size: 14.5px;
  font-weight: 700;
  color: #fff;
  letter-spacing: .3px;
  white-space: nowrap;
}
.brand-sub {
  font-size: 11px;
  color: rgba(255,255,255,.45);
  letter-spacing: .2px;
}

.navbar-search {
  flex: 1;
  display: flex;
  justify-content: center;
}

/* 搜索框：透明玻璃风格 */
:deep(.search-input .el-input__wrapper) {
  background: rgba(255,255,255,.1) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255,255,255,.18) !important;
  border-right: none !important;
  border-radius: 8px 0 0 8px !important;
  transition: background .2s, border-color .2s;
}
:deep(.search-input .el-input__wrapper:hover),
:deep(.search-input .el-input__wrapper.is-focus) {
  background: rgba(255,255,255,.16) !important;
  border-color: rgba(255,255,255,.4) !important;
}
:deep(.search-input .el-input__inner) {
  color: #fff !important;
  font-size: 13.5px;
}
:deep(.search-input .el-input__inner::placeholder) { color: rgba(255,255,255,.38) !important; }
:deep(.search-input .el-input__prefix .el-icon) { color: rgba(255,255,255,.5) !important; }
:deep(.search-input .el-input__clear) { color: rgba(255,255,255,.5) !important; }
:deep(.search-input .el-input-group__append) {
  background: rgba(255,255,255,.14) !important;
  border: 1px solid rgba(255,255,255,.18) !important;
  border-left: 1px solid rgba(255,255,255,.1) !important;
  border-radius: 0 8px 8px 0 !important;
  box-shadow: none !important;
}
:deep(.search-input .el-input-group__append .el-button) {
  color: rgba(255,255,255,.85) !important;
  font-size: 13px !important;
  padding: 0 16px !important;
}
:deep(.search-input .el-input-group__append .el-button:hover) {
  color: #fff !important;
  background: rgba(255,255,255,.1) !important;
}
:deep(.search-input) { width: 440px; }

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  width: 220px;
  justify-content: flex-end;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.14);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,.8);
  cursor: pointer;
  transition: background .2s;
}
.icon-btn:hover { background: rgba(255,255,255,.18); }

:deep(.notif .el-badge__content) {
  background: #f56c6c;
  border-color: var(--p);
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  min-width: 16px;
}

.divider-v {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,.16);
}

.user-block {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 8px 4px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .2s;
}
.user-block:hover { background: rgba(255,255,255,.1); }
.user-block--disabled { cursor: default; opacity: .75; }
.user-block--disabled:hover { background: transparent; }

:deep(.user-ava.el-avatar) {
  background: rgba(255,255,255,.2) !important;
  border: 1.5px solid rgba(255,255,255,.3) !important;
  color: #fff !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  flex-shrink: 0;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.user-name { font-size: 13.5px; font-weight: 600; color: #fff; line-height: 1; }
.user-role  { font-size: 11px; color: rgba(255,255,255,.45); line-height: 1; }
.caret { font-size: 11px; color: rgba(255,255,255,.4); }

/* ─── Main ─── */
.main {
  max-width: 1360px;
  margin: 0 auto;
  padding: 32px 36px 60px;
}

/* 欢迎区 */
.welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.welcome-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--t1);
  margin-bottom: 6px;
  letter-spacing: .2px;
}
.welcome-desc { font-size: 14px; color: var(--t2); }
.welcome-right { display: flex; gap: 12px; }

.stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 20px;
  gap: 2px;
  box-shadow: var(--shadow);
}
.stat-num   { font-size: 18px; font-weight: 700; color: var(--p); line-height: 1; }
.stat-label { font-size: 11px; color: var(--t3); margin-top: 3px; }

/* ─── 卡片网格 ─── */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 680px)  { .grid { grid-template-columns: 1fr; } }

/* ─── 卡片 ─── */
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 22px 22px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
  position: relative;
  overflow: hidden;
}

/* 顶部左侧装饰条 */
.card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--p);
  border-radius: var(--radius) 0 0 var(--radius);
  opacity: 0;
  transition: opacity .22s;
}
.card:hover::before { opacity: 1; }

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-h);
  border-color: #c5d9ec;
}

/* 卡片顶行：图标 + 箭头 */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: var(--p-l);
  color: var(--p);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .22s, color .22s;
  flex-shrink: 0;
}
.card:hover .card-icon {
  background: var(--p);
  color: #fff;
}

.card-arrow {
  font-size: 16px;
  color: var(--border);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity .22s, transform .22s, color .22s;
}
.card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--p);
}

/* 卡片中段 */
.card-mid { flex: 1; }
.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--t1);
  margin-bottom: 7px;
  letter-spacing: .2px;
}
.card-desc {
  font-size: 13px;
  color: var(--t2);
  line-height: 1.65;
}

/* 卡片底部：快捷标签 */
.card-bottom {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.chip {
  font-size: 12px;
  color: var(--t2);
  background: #f5f7fa;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 3px 11px;
  cursor: pointer;
  transition: color .18s, border-color .18s, background .18s;
  white-space: nowrap;
}
.chip:hover {
  color: var(--p);
  border-color: var(--p-h);
  background: var(--p-l);
}
</style>