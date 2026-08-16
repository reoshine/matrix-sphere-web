<template>
  <div class="stat-card">
    <div class="stat-card__label">{{ label }}</div>
    <div class="stat-card__value">{{ value }}</div>
    <div class="stat-card__trend" :class="'stat-card__trend--' + trendType" v-if="trend">
      <i :class="trendIcon"></i>
      <span>{{ trend }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    trend: {
      type: String,
      default: ''
    },
    trendType: {
      type: String,
      default: 'flat',
      validator: val => ['up', 'down', 'flat'].includes(val)
    }
  },
  computed: {
    trendIcon() {
      const icons = {
        up: 'el-icon-top',
        down: 'el-icon-bottom',
        flat: 'el-icon-right'
      }
      return icons[this.trendType] || 'el-icon-right'
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.stat-card {
  background: @bg-footer;
  border-radius: @border-radius;
  padding: @space-5;
  border: 1px solid @border-color-light;

  &__label {
    font-size: @font-size-sm;
    color: @text-tertiary;
    margin-bottom: @space-2;
  }

  &__value {
    font-size: @font-size-3xl;
    font-weight: 700;
    color: @text-primary;
    line-height: 1.2;
    margin-bottom: @space-1;
  }

  &__trend {
    font-size: @font-size-xs;
    display: flex;
    align-items: center;
    gap: 4px;

    &--up {
      color: @success-color;
    }

    &--down {
      color: @error-color;
    }

    &--flat {
      color: @text-tertiary;
    }
  }
}
</style>
