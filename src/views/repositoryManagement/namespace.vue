<template>
  <PageContainer title="命名空间" subtitle="Git 仓库命名空间能力">
    <el-card shadow="never">
      <el-alert
        title="尚未接入后端能力"
        description="当前版本暂不支持命名空间查询与维护，入口已禁用。"
        type="info"
        show-icon
        :closable="false"
      />
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
