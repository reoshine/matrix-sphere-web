<template>
  <div>
    <el-col>
      <el-tabs class="envTabs" type="card" v-model="activeName">
        <el-tab-pane label="开发环境" :lazy="true" name="dev"><MonitorComponent/></el-tab-pane>
        <el-tab-pane label="测试环境" :lazy="true" name="test"><MonitorComponent/></el-tab-pane>
        <el-tab-pane label="演示环境" :lazy="true" name="poc"><MonitorComponent/></el-tab-pane>
        <el-tab-pane label="生产环境" :lazy="true" name="prod"><MonitorComponent/></el-tab-pane>
      </el-tabs>
    </el-col>
  </div>
</template>

<script>
import MonitorComponent from "@/components/deployByEnv/MonitorComponent";

export default {
  name: "ServiceMonitor",
  components: {
    MonitorComponent
  },
  data() {
    return {
      //tabs 当前激活环境
      activeName: "dev",
    }
  }
}
</script>

<style scoped>

</style>
