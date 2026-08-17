<template>
  <PageContainer title="服务状态" subtitle="监控服务运行状态与服务器管理">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" icon="el-icon-refresh" size="small" @click="refreshData">刷新数据</el-button>
    </template>

    <!-- 服务监控与服务器管理切换 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <!-- 服务监控 -->
      <el-tab-pane label="服务监控" name="monitor">
        <el-tabs v-model="activeEnv" type="card" class="env-tabs">
          <el-tab-pane label="开发环境" :lazy="true" name="dev">
            <monitorComponent env="dev" />
          </el-tab-pane>
          <el-tab-pane label="测试环境" :lazy="true" name="test">
            <monitorComponent env="test" />
          </el-tab-pane>
          <el-tab-pane label="演示环境" :lazy="true" name="poc">
            <monitorComponent env="poc" />
          </el-tab-pane>
          <el-tab-pane label="生产环境" :lazy="true" name="prod">
            <monitorComponent env="prod" />
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 服务器管理 -->
      <el-tab-pane label="服务器管理" name="server">
        <serverManagement />
      </el-tab-pane>
    </el-tabs>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import monitorComponent from '@/components/deployByEnv/monitorComponent.vue'
import serverManagement from './serverManagement.vue'

export default {
  name: 'serviceMonitor',
  components: {
    PageContainer,
    monitorComponent,
    serverManagement
  },
  data() {
    return {
      activeTab: 'monitor',
      activeEnv: 'dev'
    }
  },
  methods: {
    handleTabChange() {
      // 切换标签页时的处理
    },
    refreshData() {
      // 刷新数据
      this.$message.success('数据已刷新')
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.env-tabs {
  margin-top: @space-4;
}
</style>
