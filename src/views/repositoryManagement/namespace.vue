<template>
  <PageContainer title="命名空间" subtitle="管理 Git 仓库命名空间">
    <el-card shadow="never">
      <el-empty description="命名空间管理功能正在开发中..." />
    </el-card>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'

export default {
  name: 'Namespace',
  components: {
    PageContainer
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";
</style>
