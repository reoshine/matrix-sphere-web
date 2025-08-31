<template>
  <div>
    <el-row :gutter="20">
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

export default {
  name: "monitorComponent",
  data() {
    return {}
  },
  methods: {
    //cpu仪表盘
    cpuDashboard() {
      const cpuDashboard = this.$echarts.init(this.$refs.cpuDashboard)
      const option = {
        tooltip: {
          formatter: '{a}: {c}%'
        },
        series: [
          {
            name: 'CPU使用率',
            type: 'gauge',
            axisLine: {
              lineStyle: {
                width: 8,
                color: [
                  [0.7, '#67e0e3'],
                  [1, '#fd666d']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: 'inherit'
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 2
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 4
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: 20,
              fontSize: 10
            },
            title: {
              show: true,
              color: 'inherit'
            },
            detail: {
              valueAnimation: true,
              fontSize: 20,
              offsetCenter: [0, '70%'],
              color: 'inherit'
            },
            data: [
              {
                value: 26,
                name: 'CPU %'
              }
            ]
          }
        ]
      }
      cpuDashboard.setOption(option)
    },
    //内存仪表盘
    memoryDashboard() {
      const memoryDashboard = this.$echarts.init(this.$refs.memoryDashboard)
      const option = {
        tooltip: {
          formatter: '{a}: {c}%'
        },
        series: [
          {
            name: '内存使用率',
            type: 'gauge',
            axisLine: {
              lineStyle: {
                width: 8,
                color: [
                  [0.8, '#67e0e3'],
                  [1, '#fd666d']
                ]
              }
            },
            pointer: {
              itemStyle: {
                color: 'inherit'
              }
            },
            axisTick: {
              distance: -30,
              length: 8,
              lineStyle: {
                color: '#fff',
                width: 2
              }
            },
            splitLine: {
              distance: -30,
              length: 30,
              lineStyle: {
                color: '#fff',
                width: 4
              }
            },
            axisLabel: {
              color: 'inherit',
              distance: 20,
              fontSize: 10
            },
            title: {
              show: true,
              color: 'inherit'
            },
            detail: {
              valueAnimation: true,
              fontSize: 20,
              offsetCenter: [0, '70%'],
              color: 'inherit'
            },
            data: [
              {
                value: 84,
                name: '内存 %'
              }
            ]
          }
        ]
      }
      memoryDashboard.setOption(option)
    },
    //cpu折线图
    cpuLine() {
      const cpuLine = this.$echarts.init(this.$refs.cpuLine)
      const option = {
        title: {
          text: 'CPU使用率 %'
        },
        tooltip: {
          show: true,
          trigger: 'axis',
          showContent: true,
          alwaysShowContent: false,
          axisPointer: {
            type: 'cross'
          },
          formatter: function (params) {
            return params[0].marker + params[0].seriesName + ': ' + params[0].data[1] + '%' + '<br>'
          }
        },
        axisPointer: {
          type: "shadow",
        },
        grid: {
          left: "7%",
          right: "1%",
          bottom: "5%",
        },
        xAxis: {
          type: 'time',
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}'
          }
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            filterMode: 'empty'
          },
          {
            type: 'inside',
            start: 0,
            end: 30,
            xAxisIndex: [0]
          },
        ],
        series: [{
          name: 'CPU使用率',
          data: [
            ['2022-01-01 10:00', 12], ['2022-01-01 10:02', 69], ['2022-01-01 10:04', 22],
            ['2022-01-01 10:06', 32], ['2022-01-01 10:08', 22], ['2022-01-01 10:10', 22],
            ['2022-01-01 10:12', 12], ['2022-01-01 10:14', 31], ['2022-01-01 10:16', 43],
            ['2022-01-01 10:18', 42], ['2022-01-01 10:20', 33], ['2022-01-01 10:22', 31],
            ['2022-01-01 10:24', 12], ['2022-01-01 10:26', 14], ['2022-01-01 10:28', 41]],
          type: 'line'
        }]
      }
      cpuLine.setOption(option);
    }
  },
  mounted() {
    this.cpuDashboard()
    this.memoryDashboard()
    this.cpuLine()
  },
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
</style>
