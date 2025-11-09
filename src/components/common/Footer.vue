<template>
  <el-footer>Footer</el-footer>
</template>

<script>
export default {
  name: "footer",
};
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less"; // 引入变量
.el-footer {
  height: @footer-height !important; // Element UI 需要 !important
  line-height: @footer-height;
  background-color: @bg-footer;
  color: #888;
  text-align: center;
  font-size: 14px;
  border-top: 1px solid #e6e6e6; // 增加一个分割线
}
</style>