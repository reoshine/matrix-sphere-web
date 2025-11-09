<template>
  <div class="not-found-container">
    <h1>404 - 页面未找到</h1>
    <p>您访问的页面不存在。</p>
    <el-button @click="goHome" type="primary">返回首页</el-button>
  </div>
</template>

<script>
export default {
  name: "NotFound",
  methods: {
    goHome() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.not-found-container {
  text-align: center;
  padding-top: 100px;
}
</style>