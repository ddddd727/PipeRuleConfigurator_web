<template>
  <div class="page-container">
    <h2>🚢 船型船号基础数据</h2>
    <el-alert title="此处管理所有船号信息" type="info" show-icon style="margin-bottom: 20px;" />
    <el-table :data="[]" border style="width: 100%">
      <el-table-column label="船号" width="180" />
      <el-table-column label="船型" width="180" />
      <el-table-column label="建造状态" />
    </el-table>
  </div>
</template>
<style scoped> .page-container { padding: 24px; } </style>