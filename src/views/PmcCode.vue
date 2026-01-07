<template>
  <div class="pmc-page">
    <h2>🔢 PMC 编码规则</h2>
    <el-steps :active="1">
      <el-step title="步骤 1" description="选择规则"></el-step>
      <el-step title="步骤 2" description="生成编码"></el-step>
    </el-steps>
  </div>
</template>
<style scoped> .pmc-page { padding: 20px; } </style>