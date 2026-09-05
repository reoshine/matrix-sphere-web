<template>
  <PageContainer :title="'工作台'">
    <!-- 欢迎语 -->
    <template #header-actions>
      <span class="dashboard-greeting">{{ greeting }}，{{ username }}</span>
    </template>

    <!-- KPI 统计卡片 -->
    <div class="dashboard-stats" v-if="!statsLoading">
      <StatCard
        label="应用总数"
        :value="stats.appCount"
        :trend="stats.appCountTrend > 0 ? '+' + stats.appCountTrend : ''"
        :trendType="stats.appCountTrend > 0 ? 'up' : 'flat'"
      />
      <StatCard
        label="今日部署"
        :value="stats.todayDeployCount"
        :trend="stats.todayDeployTrend > 0 ? '+' + stats.todayDeployTrend : ''"
        :trendType="stats.todayDeployTrend > 0 ? 'up' : 'flat'"
      />
      <StatCard
        label="部署成功率"
        :value="stats.deploySuccessRate + '%'"
        trendType="flat"
      />
      <StatCard
        label="活跃分支"
        :value="stats.activeBranchCount"
        :trend="stats.activeBranchTrend < 0 ? stats.activeBranchTrend + '' : ''"
        :trendType="stats.activeBranchTrend < 0 ? 'down' : 'flat'"
      />
    </div>
    <div class="dashboard-stats" v-else>
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>

    <!-- 快速操作 -->
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

    <!-- 最近部署 + 活跃应用 -->
    <div class="dashboard-panels">
      <!-- 最近部署 -->
      <el-card class="dashboard-panel" shadow="never">
        <div slot="header" class="section-header">
          <span class="section-title">最近部署</span>
          <el-button type="text" size="small" @click="$router.push('/deploy')">
            查看全部 <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <div v-if="recentDeploys.length > 0" class="deploy-list">
          <div
            v-for="item in recentDeploys"
            :key="item.id"
            class="deploy-item"
          >
            <StatusDot :type="item.success ? 'success' : 'error'" />
            <div class="deploy-info">
              <span class="deploy-app">{{ item.appName }}</span>
              <span class="deploy-env">{{ item.env }}</span>
            </div>
            <span class="deploy-branch">{{ item.branch }}</span>
            <span class="deploy-time">{{ item.time }}</span>
          </div>
        </div>
        <EmptyState
          v-else
          icon="el-icon-s-promotion"
          title="暂无部署记录"
          description="还没有进行过部署操作"
        />
      </el-card>

      <!-- 活跃应用 -->
      <el-card class="dashboard-panel" shadow="never">
        <div slot="header" class="section-header">
          <span class="section-title">活跃应用</span>
          <el-button type="text" size="small" @click="$router.push('/apps')">
            查看全部 <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <div v-if="activeApps.length > 0" class="app-list">
          <button
            v-for="item in activeApps"
            :key="item.id"
            type="button"
            class="app-item"
            @click="$router.push('/apps')"
          >
            <StatusDot type="success" />
            <div class="app-info">
              <span class="app-name">{{ item.name }}</span>
              <span class="app-code">{{ item.code }}</span>
            </div>
            <span class="app-time">{{ item.lastDeployTime }}</span>
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
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusDot from '@/components/common/StatusDot.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { getDashboardStats, getRecentDeploys, getActiveApps } from './api'

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
      statsLoading: true,
      stats: {
        appCount: 0,
        appCountTrend: 0,
        todayDeployCount: 0,
        todayDeployTrend: 0,
        deploySuccessRate: 0,
        activeBranchCount: 0,
        activeBranchTrend: 0
      },
      recentDeploys: [],
      activeApps: [],
      quickActions: [
        { label: '选择应用部署', icon: 'el-icon-s-promotion', path: '/apps' },
        { label: '应用列表', icon: 'el-icon-s-platform', path: '/apps' },
        { label: '分支管理', icon: 'el-icon-s-management', path: '/deploy/branches' },
        { label: '凭据管理', icon: 'el-icon-lock', path: '/resources/credentials' }
      ]
    }
  },
  created() {
    this.initUser()
    this.loadDashboard()
  },
  methods: {
    initUser() {
      const username = localStorage.getItem('ms_username')
      this.username = username || '用户'

      const hour = new Date().getHours()
      if (hour < 12) {
        this.greeting = '早上好'
      } else if (hour < 18) {
        this.greeting = '下午好'
      } else {
        this.greeting = '晚上好'
      }
    },
    async loadDashboard() {
      this.statsLoading = true
      try {
        const [statsRes, deploysRes, appsRes] = await Promise.all([
          getDashboardStats(),
          getRecentDeploys(),
          getActiveApps()
        ])
        if (statsRes && statsRes.data) {
          this.stats = statsRes.data
        }
        if (deploysRes && deploysRes.data) {
          this.recentDeploys = deploysRes.data
        }
        if (appsRes && appsRes.data) {
          this.activeApps = appsRes.data
        }
      } catch (e) {
        // API 未就绪时使用 mock 数据
        this.loadMockData()
      } finally {
        this.statsLoading = false
      }
    },
    loadMockData() {
      this.stats = {
        appCount: 16,
        appCountTrend: 2,
        todayDeployCount: 5,
        todayDeployTrend: 3,
        deploySuccessRate: 100,
        activeBranchCount: 8,
        activeBranchTrend: -1
      }
      this.recentDeploys = [
        { id: 1, appName: '用户中心服务', env: 'DEV', branch: 'feat-login', operator: 'roshine', time: '10:30', success: true },
        { id: 2, appName: '订单服务', env: 'TEST', branch: 'feat-v2', operator: 'zhangsan', time: '09:15', success: true },
        { id: 3, appName: '支付网关', env: 'PROD', branch: 'main', operator: 'lisi', time: '昨天 18:00', success: true }
      ]
      this.activeApps = [
        { id: 1, name: '用户中心服务', code: 'user-center', lastDeployTime: '2小时前' },
        { id: 2, name: '订单服务', code: 'order-svc', lastDeployTime: '1天前' },
        { id: 3, name: '支付网关', code: 'pay-gateway', lastDeployTime: '3天前' }
      ]
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

/* KPI 统计卡片网格 */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: @space-4;
  margin-bottom: @space-5;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

/* 通用区块 */
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

/* 快速操作 */
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

  &:hover {
    border-color: @primary-color;
    background: @primary-lighter;
    transform: translateY(-2px);
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

/* 双栏面板 */
.dashboard-panels {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

/* 最近部署列表 */
.deploy-list {
  display: flex;
  flex-direction: column;
}

.deploy-item {
  display: flex;
  align-items: center;
  gap: @space-3;
  padding: @space-3 0;
  border-bottom: 1px solid @border-color-light;

  &:last-child {
    border-bottom: none;
  }
}

.deploy-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.deploy-app {
  font-size: @font-size-sm;
  color: @text-primary;
  font-weight: 500;
}

.deploy-env {
  font-size: @font-size-xs;
  color: @text-tertiary;
}

.deploy-branch {
  font-size: @font-size-xs;
  color: @primary-color;
  background: @primary-lighter;
  padding: 2px 8px;
  border-radius: @border-radius-sm;
  font-family: @font-mono;
  flex-shrink: 0;
}

.deploy-time {
  font-size: @font-size-xs;
  color: @text-tertiary;
  flex-shrink: 0;
}

/* 活跃应用列表 */
.app-list {
  display: flex;
  flex-direction: column;
}

.app-item {
  display: flex;
  align-items: center;
  gap: @space-3;
  padding: @space-3 0;
  width: 100%;
  border: none;
  border-bottom: 1px solid @border-color-light;
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background @transition-fast;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: @primary-lighter;
    margin: 0 calc(-1 * @space-5);
    padding-left: @space-5;
    padding-right: @space-5;
  }
}

.app-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-name {
  font-size: @font-size-sm;
  color: @text-primary;
  font-weight: 500;
}

.app-code {
  font-size: @font-size-xs;
  color: @text-tertiary;
  font-family: @font-mono;
}

.app-time {
  font-size: @font-size-xs;
  color: @text-tertiary;
  flex-shrink: 0;
}
</style>
