<template>
  <div class="page-container" :class="{ 'no-padding': noPadding }">
    <!-- 页面头部：标题 + 操作按钮 -->
    <div class="page-header" v-if="title || $slots.header">
      <div class="page-header__left">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle" v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-header__right">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="page-filter" v-if="$slots.filter">
      <slot name="filter" />
    </div>

    <!-- 操作栏 -->
    <div class="page-toolbar" v-if="$slots.toolbar">
      <slot name="toolbar" />
    </div>

    <!-- 内容区 -->
    <div class="page-body" :class="bodyClass">
      <slot />
    </div>

    <!-- 底部（分页等） -->
    <div class="page-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageContainer',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    bodyClass: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.page-container {
  min-height: calc(100vh - 160px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: @space-5;

  &__left {
    flex: 1;
    min-width: 0;
  }

  &__right {
    flex-shrink: 0;
    margin-left: @space-4;
  }
}

.page-title {
  font-size: @font-size-xl;
  font-weight: 600;
  color: @text-primary;
  margin: 0;
  line-height: 1.4;
}

.page-subtitle {
  font-size: @font-size-sm;
  color: @text-tertiary;
  margin: 4px 0 0;
}

.page-filter {
  margin-bottom: @space-4;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: @space-4;
}

.page-body {
  // 默认内容区样式
}

.page-footer {
  margin-top: @space-4;
  display: flex;
  justify-content: flex-end;
}

.no-padding {
  .page-body {
    margin: 0 calc(-1 * @space-5);
  }
}
</style>
