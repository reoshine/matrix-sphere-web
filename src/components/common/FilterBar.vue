<template>
  <div class="filter-bar">
    <el-form :inline="true" size="small" @submit.native.prevent>
      <div class="filter-bar__fields">
        <slot />
      </div>
      <div class="filter-bar__actions">
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="$emit('search')">查询</el-button>
          <el-button icon="el-icon-refresh" @click="$emit('reset')">重置</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'FilterBar'
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.filter-bar {
  background: @bg-footer;
  border-radius: @border-radius;
  padding: @space-4 @space-5;
  margin-bottom: @space-4;
  border: 1px solid @border-color-light;

  &__fields {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: @space-3;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: @space-2;
    margin-top: @space-3;
  }
}
</style>
