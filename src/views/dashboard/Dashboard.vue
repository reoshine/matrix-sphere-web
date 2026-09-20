<template>
  <PageContainer title="工作台">
    <template #header-actions>
      <span class="dashboard-greeting">{{ greeting }}，{{ username }}</span>
    </template>

    <div v-if="loading" class="dashboard-stats">
      <SkeletonCard v-for="i in 5" :key="i" />
    </div>

    <el-card v-else-if="error" class="dashboard-state-card" shadow="never">
      <EmptyState
        :icon="forbidden ? 'el-icon-lock' : 'el-icon-warning-outline'"
        :title="forbidden ? '暂无工作台查看权限' : '工作台数据加载失败'"
        :description="forbidden ? '请联系管理员授予 DEPLOY_VIEW 权限' : error.message"
        :request-id="error.requestId"
        :retry-text="forbidden ? '' : '重新加载'"
        @retry="loadDashboard"
      />
    </el-card>

    <template v-else>
      <div class="dashboard-stats">
        <button type="button" class="stat-card-button" @click="openApplications">
          <StatCard label="应用总数" :value="overview.applicationCount" />
        </button>
        <button type="button" class="stat-card-button" @click="openDeployments({ date: 'today' })">
          <StatCard label="今日部署" :value="overview.todayDeployCount" />
        </button>
        <button type="button" class="stat-card-button" @click="openDeployments({ date: 'today', status: 'success' })">
          <StatCard label="今日成功率" :value="overview.todaySuccessRate + '%'" />
        </button>
        <button type="button" class="stat-card-button" @click="openDeployments({ date: 'today', status: 'failed' })">
          <StatCard label="今日失败" :value="overview.failedDeployCount" />
        </button>
        <div class="stat-card-static">
          <StatCard label="待审批" :value="overview.pendingApprovalCount" />
        </div>
      </div>

      <el-card class="dashboard-section" shadow="never">
        <div slot="header" class="section-header">
          <span class="section-title">快速操作</span>
        </div>
        <div class="quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.path"
            type="button"
            class="quick-action-item"
            @click="$router.push(action.path)"
          >
            <i :class="action.icon" class="quick-action-icon"></i>
            <span class="quick-action-label">{{ action.label }}</span>
          </button>
        </div>
      </el-card>

      <div class="dashboard-panels">
        <el-card class="dashboard-panel" shadow="never">
          <div slot="header" class="section-header">
            <span class="section-title">最近部署</span>
            <el-button type="text" size="small" @click="openDeployments()">
              查看全部 <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>
          <div v-if="recentDeploys.length > 0" class="deploy-list">
            <button
              v-for="item in recentDeploys"
              :key="item.id"
              type="button"
              class="deploy-item"
              @click="openDeploy(item)"
            >
              <StatusDot :type="deployStatusType(item.status)" />
              <div class="deploy-info">
                <span class="deploy-app">{{ item.applicationName || item.applicationCode || '未知应用' }}</span>
                <span class="deploy-env">{{ item.env || '-' }}</span>
              </div>
              <span class="deploy-status">{{ item.statusName || '未知状态' }}</span>
              <span class="deploy-time">{{ formatDateTime(item.deployTime) }}</span>
            </button>
          </div>
          <EmptyState
            v-else
            icon="el-icon-s-promotion"
            title="暂无部署记录"
            description="还没有进行过部署操作"
          />
        </el-card>

        <el-card class="dashboard-panel" shadow="never">
          <div slot="header" class="section-header">
            <span class="section-title">活跃应用</span>
            <el-button type="text" size="small" @click="openApplications">
              查看全部 <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>
          <div v-if="activeApplications.length > 0" class="app-list">
            <button
              v-for="item in activeApplications"
              :key="item.applicationId"
              type="button"
              class="app-item"
              @click="openApplication(item)"
            >
              <StatusDot :type="deployStatusType(item.lastDeployStatus)" />
              <div class="app-info">
                <span class="app-name">{{ item.applicationName || item.applicationCode || '未知应用' }}</span>
                <span class="app-code">{{ item.applicationCode || '-' }}</span>
              </div>
              <span class="app-time">{{ formatDateTime(item.lastDeployTime) }}</span>
            </button>
          </div>
          <EmptyState
            v-else
            icon="el-icon-s-platform"
            title="暂无活跃应用"
            description="还没有应用进行过部署"
          />
        </el-card>
      </div>
    </template>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusDot from '@/components/common/StatusDot.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { getDashboardOverview } from './api'

export default {
  name: 'Dashboard',
  components: {
    PageContainer,
    StatCard,
    StatusDot,
    EmptyState,
    SkeletonCard
  },
  data() {
    return {
      username: '用户',
      greeting: '你好',
      loading: true,
      error: null,
      overview: this.createEmptyOverview(),
      quickActions: [
        { label: '选择应用部署', icon: 'el-icon-s-promotion', path: '/apps' },
        { label: '应用列表', icon: 'el-icon-s-platform', path: '/apps' },
        { label: '分支管理', icon: 'el-icon-s-management', path: '/deploy/branches' },
        { label: '凭据管理', icon: 'el-icon-lock', path: '/resources/credentials' }
      ]
    }
  },
  computed: {
    forbidden() {
      return this.error && this.error.httpStatus === 403
    },
    recentDeploys() {
      return this.overview.recentDeploys || []
    },
    activeApplications() {
      return this.overview.activeApplications || []
    }
  },
  created() {
    this.initUser()
    this.loadDashboard()
  },
  methods: {
    createEmptyOverview() {
      return {
        applicationCount: 0,
        todayDeployCount: 0,
        todaySuccessRate: 0,
        failedDeployCount: 0,
        pendingApprovalCount: 0,
        recentDeploys: [],
        activeApplications: []
      }
    },
    initUser() {
      const username = localStorage.getItem('ms_username')
      this.username = username || '用户'
      const hour = new Date().getHours()
      this.greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
    },
    async loadDashboard() {
      this.loading = true
      this.error = null
      try {
        const response = await getDashboardOverview({ recentLimit: 5, activeLimit: 5 })
        this.overview = response.data || this.createEmptyOverview()
      } catch (error) {
        this.overview = this.createEmptyOverview()
        this.error = error
      } finally {
        this.loading = false
      }
    },
    openApplications() {
      this.$router.push('/apps')
    },
    openDeployments(query = {}) {
      this.$router.push({ path: '/apps', query: { view: 'deployments', ...query } })
    },
    openDeploy(item) {
      if (!item.applicationId) return
      this.$router.push({ path: `/deploy/${item.applicationId}`, query: { masterId: item.id } })
    },
    openApplication(item) {
      if (!item.applicationId) return
      this.$router.push(`/deploy/${item.applicationId}`)
    },
    deployStatusType(status) {
      if (status === 2) return 'success'
      if (status === 3) return 'error'
      if (status === 1 || status === 4) return 'running'
      return 'info'
    },
    formatDateTime(value) {
      if (!value) return '-'
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value
      return new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date)
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.dashboard-greeting {
  font-size: @font-size-sm;
  color: @text-secondary;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: @space-4;
  margin-bottom: @space-5;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.dashboard-state-card {
  min-height: 360px;
}

.stat-card-button,
.stat-card-static {
  display: block;
  min-width: 0;
}

.stat-card-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.stat-card-button:hover /deep/ .stat-card,
.stat-card-button:focus-visible /deep/ .stat-card {
  border-color: @primary-color;
  box-shadow: @shadow-md;
}

.dashboard-section {
  margin-bottom: @space-5;
  border-radius: @border-radius;

  /deep/ .el-card__header {
    padding: @space-4 @space-5;
    border-bottom: 1px solid @border-color-light;
  }

  /deep/ .el-card__body {
    padding: @space-5;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: @font-size-base;
  font-weight: 600;
  color: @text-primary;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: @space-4;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: @space-3;
  padding: @space-6 @space-4;
  width: 100%;
  border-radius: @border-radius;
  border: 1px solid @border-color-light;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  transition: all @transition-fast;

  &:hover,
  &:focus-visible {
    border-color: @primary-color;
    background: @primary-lighter;
    box-shadow: @shadow-md;
  }
}

.quick-action-icon {
  font-size: 28px;
  color: @primary-color;
}

.quick-action-label {
  font-size: @font-size-sm;
  color: @text-secondary;
  font-weight: 500;
}

.dashboard-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: @space-5;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.dashboard-panel {
  border-radius: @border-radius;

  /deep/ .el-card__header {
    padding: @space-4 @space-5;
    border-bottom: 1px solid @border-color-light;
  }

  /deep/ .el-card__body {
    padding: @space-4 @space-5;
  }
}

.deploy-list,
.app-list {
  display: flex;
  flex-direction: column;
}

.deploy-item,
.app-item {
  display: flex;
  align-items: center;
  gap: @space-3;
  padding: @space-3 0;
  width: 100%;
  border: none;
  border-bottom: 1px solid @border-color-light;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background @transition-fast;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &:focus-visible {
    background: @primary-lighter;
  }
}

.deploy-info,
.app-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.deploy-app,
.app-name {
  font-size: @font-size-sm;
  color: @text-primary;
  font-weight: 500;
}

.deploy-env,
.app-code,
.deploy-time,
.app-time {
  font-size: @font-size-xs;
  color: @text-tertiary;
}

.app-code {
  font-family: @font-mono;
}

.deploy-status {
  font-size: @font-size-xs;
  color: @primary-color;
  background: @primary-lighter;
  padding: 2px 8px;
  border-radius: @border-radius-sm;
  flex-shrink: 0;
}

.deploy-time,
.app-time {
  flex-shrink: 0;
}
</style>
