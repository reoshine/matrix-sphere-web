<template>
  <span class="status-dot" :class="'status-dot--' + type">
    <span class="status-dot__indicator"></span>
    <span class="status-dot__label" v-if="label">{{ label }}</span>
  </span>
</template>

<script>
export default {
  name: 'StatusDot',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: val => ['success', 'warning', 'error', 'info', 'running'].includes(val)
    },
    label: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &__indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__label {
    font-size: @font-size-sm;
    color: @text-secondary;
  }

  &--success &__indicator { background: @success-color; }
  &--warning &__indicator { background: @warning-color; }
  &--error &__indicator { background: @error-color; }
  &--info &__indicator { background: @text-tertiary; }
  &--running &__indicator {
    background: @primary-color;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
