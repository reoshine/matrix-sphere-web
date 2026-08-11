<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col
        v-for="server in serverList"
        :key="server.id"
        :xs="24" :sm="12" :md="8" :lg="6"
      >
        <el-card shadow="hover" class="server-card">
          <div slot="header" class="card-header">
            <div class="header-left">
              <i class="el-icon-monitor"></i>
              <span class="server-name">{{ server.serverName }}</span>
            </div>
            <el-tag
              :type="server.status === 1 ? 'success' : 'danger'"
              size="mini"
            >{{ server.status === 1 ? '在线' : '离线' }}</el-tag>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">IP:</span>
              <span class="value">{{ server.ipAddress }}</span>
            </div>
            <div class="info-row">
              <span class="label">系统:</span>
              <span class="value">{{ server.osType }} {{ server.osVersion }}</span>
            </div>

            <el-divider content-position="left">资源使用</el-divider>

            <div v-if="metricsMap[server.id]">
              <div class="metric-item">
                <span class="metric-label">CPU</span>
                <el-progress
                  :percentage="metricsMap[server.id].cpuUsage || 0"
                  :color="cpuColor(metricsMap[server.id].cpuUsage)"
                  :stroke-width="14"
                />
              </div>
              <div class="metric-item">
                <span class="metric-label">内存</span>
                <el-progress
                  :percentage="metricsMap[server.id].memoryUsage || 0"
                  :color="memoryColor(metricsMap[server.id].memoryUsage)"
                  :stroke-width="14"
                />
              </div>
              <div class="metric-item">
                <span class="metric-label">磁盘</span>
                <el-progress
                  :percentage="metricsMap[server.id].diskUsage || 0"
                  :color="diskColor(metricsMap[server.id].diskUsage)"
                  :stroke-width="14"
                />
              </div>
            </div>
            <div v-else class="no-metrics">
              <i class="el-icon-warning-outline"></i>
              <span>暂无监控数据（需部署 Agent）</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="serverList.length === 0" description="暂无服务器，请先在服务器管理中添加" />
  </div>
</template>

<script>
import { getServerList, getServerMetrics } from './api'

export default {
  name: 'containerMonitor',
  data() {
    return {
      serverList: [],
      metricsMap: {},
      pollingTimer: null
    }
  },
  methods: {
    cpuColor(val) {
      if (!val) return '#67C23A'
      return val > 80 ? '#F56C6C' : val > 60 ? '#E6A23C' : '#67C23A'
    },
    memoryColor(val) {
      if (!val) return '#67C23A'
      return val > 80 ? '#F56C6C' : val > 60 ? '#E6A23C' : '#67C23A'
    },
    diskColor(val) {
      if (!val) return '#67C23A'
      return val > 80 ? '#F56C6C' : val > 60 ? '#E6A23C' : '#67C23A'
    },
    loadServers() {
      getServerList().then(res => {
        if (res.code === 200) {
          this.serverList = res.data || []
          this.fetchAllMetrics()
        }
      })
    },
    fetchAllMetrics() {
      this.serverList.forEach(server => {
        getServerMetrics(server.id).then(res => {
          if (res.code === 200 && res.data) {
            const metrics = res.data
            if (metrics.cpuUsage != null || metrics.memoryUsage != null || metrics.diskUsage != null) {
              this.$set(this.metricsMap, server.id, metrics)
            }
          }
        }).catch(() => {})
      })
    },
    startPolling() {
      this.pollingTimer = setInterval(() => {
        this.fetchAllMetrics()
      }, 30000)
    }
  },
  mounted() {
    this.loadServers()
    this.startPolling()
  },
  beforeDestroy() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
      this.pollingTimer = null
    }
  }
}
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 126px);
}

.server-card {
  margin-bottom: 20px;
  border: none;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      i { margin-right: 6px; color: #409EFF; }
      .server-name { font-weight: bold; }
    }
  }

  :deep(.el-card__body) {
    padding-top: 5px;
  }
}

.card-body {
  font-size: 13px;

  .info-row {
    display: flex;
    margin-bottom: 6px;
    .label { color: #909399; width: 40px; flex-shrink: 0; }
    .value { color: #606266; }
  }

  .no-metrics {
    text-align: center;
    color: #909399;
    padding: 15px 0;
    i { font-size: 18px; margin-right: 5px; }
  }
}

.metric-item {
  margin-bottom: 10px;
  .metric-label {
    display: inline-block;
    width: 36px;
    font-size: 12px;
    color: #606266;
    margin-bottom: 3px;
  }
}
</style>
