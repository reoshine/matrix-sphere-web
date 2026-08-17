<template>
  <span
    class="status-dot"
    :class="'status-dot--' + type"
    role="status"
    :aria-label="statusText"
  >
    <span class="status-dot__indicator" aria-hidden="true"></span>
    <span class="status-dot__label" v-if="label">{{ label }}</span>
    <span v-if="!label" class="sr-only">{{ statusText }}</span>
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
  },
  computed: {
    statusText() {
      const statusMap = {
        success: '成功',
        warning: '警告',
        error: '错误',
        info: '信息',
        running: '运行中'
      }
      return this.label || statusMap[this.type] || '状态'
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

/* 屏幕阅读器专用文本 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
