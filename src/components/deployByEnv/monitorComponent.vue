<template>
  <div>
    <div v-if="!loading && !hasData" class="no-data-hint">
      <i class="el-icon-warning-outline"></i>
      <span>暂无监控数据，需部署监控 Agent 后可用</span>
    </div>

    <el-row :gutter="20" v-if="hasData">
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="cpuDashboard" ref="cpuDashboard"></div>
          <div class="memoryDashboard" ref="memoryDashboard"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div class="chart1" ref="cpuLine"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getServerMetrics } from '@/views/serviceMonitor/api'

export default {
  name: 'monitorComponent',
  props: {
    serverId: { type: Number, default: null }
  },
  data() {
    return {
      metrics: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0 },
      loading: false,
      hasData: false
    }
  },
  methods: {
    fetchMetrics() {
      if (!this.serverId) return
      this.loading = true
      getServerMetrics(this.serverId).then(res => {
        if (res.code === 200 && res.data) {
          const m = res.data
          if (m.cpuUsage != null || m.memoryUsage != null || m.diskUsage != null) {
            this.metrics = m
            this.hasData = true
            this.$nextTick(() => {
              this.renderCharts()
            })
          }
        }
      }).catch(() => {}).finally(() => {
        this.loading = false
      })
    },
    renderCharts() {
      this.cpuDashboard()
      this.memoryDashboard()
      this.cpuLine()
    },
    cpuDashboard() {
      const chart = this.$echarts.init(this.$refs.cpuDashboard)
      chart.setOption({
        tooltip: { formatter: '{a}: {c}%' },
        series: [{
          name: 'CPU使用率',
          type: 'gauge',
          axisLine: {
            lineStyle: { width: 8, color: [[0.7, '#67e0e3'], [1, '#fd666d']] }
          },
          pointer: { itemStyle: { color: 'inherit' } },
          axisTick: { distance: -30, length: 8, lineStyle: { color: '#fff', width: 2 } },
          splitLine: { distance: -30, length: 30, lineStyle: { color: '#fff', width: 4 } },
          axisLabel: { color: 'inherit', distance: 20, fontSize: 10 },
          title: { show: true, color: 'inherit' },
          detail: { valueAnimation: true, fontSize: 20, offsetCenter: [0, '70%'], color: 'inherit' },
          data: [{ value: this.metrics.cpuUsage || 0, name: 'CPU %' }]
        }]
      })
    },
    memoryDashboard() {
      const chart = this.$echarts.init(this.$refs.memoryDashboard)
      chart.setOption({
        tooltip: { formatter: '{a}: {c}%' },
        series: [{
          name: '内存使用率',
          type: 'gauge',
          axisLine: {
            lineStyle: { width: 8, color: [[0.8, '#67e0e3'], [1, '#fd666d']] }
          },
          pointer: { itemStyle: { color: 'inherit' } },
          axisTick: { distance: -30, length: 8, lineStyle: { color: '#fff', width: 2 } },
          splitLine: { distance: -30, length: 30, lineStyle: { color: '#fff', width: 4 } },
          axisLabel: { color: 'inherit', distance: 20, fontSize: 10 },
          title: { show: true, color: 'inherit' },
          detail: { valueAnimation: true, fontSize: 20, offsetCenter: [0, '70%'], color: 'inherit' },
          data: [{ value: this.metrics.memoryUsage || 0, name: '内存 %' }]
        }]
      })
    },
    cpuLine() {
      const chart = this.$echarts.init(this.$refs.cpuLine)
      chart.setOption({
        title: { text: 'CPU使用率 %' },
        tooltip: {
          show: true, trigger: 'axis', showContent: true, alwaysShowContent: false,
          axisPointer: { type: 'cross' },
          formatter: function (params) {
            return params[0].marker + params[0].seriesName + ': ' + params[0].data[1] + '%<br>'
          }
        },
        axisPointer: { type: 'shadow' },
        grid: { left: '7%', right: '1%', bottom: '5%' },
        xAxis: { type: 'time' },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}' } },
        dataZoom: [
          { type: 'slider', show: true, xAxisIndex: [0], start: 0, end: 100, filterMode: 'empty' },
          { type: 'inside', start: 0, end: 100, xAxisIndex: [0] }
        ],
        series: [{
          name: 'CPU使用率',
          data: [],
          type: 'line'
        }]
      })
    }
  },
  watch: {
    serverId() {
      this.fetchMetrics()
    }
  },
  mounted() {
    this.fetchMetrics()
  }
}
</script>

<style lang="less" scoped>
.chart1 {
  width: 750px;
  height: 400px;
}
.cpuDashboard {
  width: 250px;
  height: 250px;
}
.memoryDashboard {
  width: 250px;
  height: 250px;
}
.no-data-hint {
  text-align: center;
  padding: 60px 0;
  color: #909399;
  font-size: 14px;
  i {
    font-size: 20px;
    margin-right: 6px;
    vertical-align: middle;
  }
}
</style>
