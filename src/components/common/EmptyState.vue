<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <i :class="icon"></i>
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p class="empty-state__desc" v-if="description">{{ description }}</p>
    <div class="empty-state__action" v-if="actionText">
      <el-button type="primary" size="small" @click="$emit('action')">
        {{ actionText }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: 'el-icon-document'
    },
    title: {
      type: String,
      default: '暂无数据'
    },
    description: {
      type: String,
      default: ''
    },
    actionText: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: @space-12 @space-5;
  text-align: center;

  &__icon {
    font-size: 48px;
    color: @text-tertiary;
    margin-bottom: @space-4;
    opacity: 0.5;
  }

  &__title {
    font-size: @font-size-lg;
    font-weight: 500;
    color: @text-secondary;
    margin: 0 0 @space-2;
  }

  &__desc {
    font-size: @font-size-sm;
    color: @text-tertiary;
    margin: 0 0 @space-4;
    max-width: 320px;
    line-height: 1.5;
  }

  &__action {
    margin-top: @space-2;
  }
}
</style>
