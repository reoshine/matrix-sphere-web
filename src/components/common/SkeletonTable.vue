<template>
  <div class="skeleton-table">
    <!-- 表头 -->
    <div class="skeleton-table__header">
      <div
        v-for="col in columns"
        :key="'h-' + col"
        class="skeleton-bone skeleton-bone--header"
        :style="{ width: col === 1 ? '60px' : 'auto', flex: col === 1 ? 'none' : '1' }"
      ></div>
    </div>

    <!-- 数据行 -->
    <div
      v-for="row in rows"
      :key="'r-' + row"
      class="skeleton-table__row"
    >
      <div
        v-for="col in columns"
        :key="'c-' + row + '-' + col"
        class="skeleton-bone skeleton-bone--cell"
        :style="{ width: col === 1 ? '60px' : 'auto', flex: col === 1 ? 'none' : '1' }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonTable',
  props: {
    rows: {
      type: Number,
      default: 4
    },
    columns: {
      type: Number,
      default: 4
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.skeleton-table {
  background: @bg-footer;
  border-radius: @border-radius;
  overflow: hidden;
  border: 1px solid @border-color-light;

  &__header {
    display: flex;
    gap: @space-3;
    padding: @space-4;
    background: var(--table-header-bg, var(--color-gray-50));
    border-bottom: 1px solid @border-color-light;
  }

  &__row {
    display: flex;
    gap: @space-3;
    padding: @space-4;
    border-bottom: 1px solid @border-color-light;

    &:last-child {
      border-bottom: none;
    }
  }
}

.skeleton-bone {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: @border-radius-sm;

  &--header {
    height: 16px;
  }

  &--cell {
    height: 14px;
  }
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
