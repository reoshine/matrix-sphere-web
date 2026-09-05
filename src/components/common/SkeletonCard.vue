<template>
  <div class="skeleton-card">
    <div class="skeleton-card__header">
      <div class="skeleton-bone skeleton-bone--circle"></div>
      <div class="skeleton-bone skeleton-bone--title"></div>
    </div>
    <div class="skeleton-card__body">
      <div class="skeleton-bone skeleton-bone--text"></div>
      <div class="skeleton-bone skeleton-bone--text skeleton-bone--short"></div>
    </div>
    <div class="skeleton-card__footer">
      <div class="skeleton-bone skeleton-bone--button"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonCard'
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.skeleton-card {
  background: @bg-footer;
  border-radius: @border-radius;
  padding: @space-5;
  border: 1px solid @border-color-light;

  &__header {
    display: flex;
    align-items: center;
    gap: @space-3;
    margin-bottom: @space-4;
  }

  &__body {
    margin-bottom: @space-4;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}

.skeleton-bone {
  background: linear-gradient(
    90deg,
    #24324a 25%,
    #31415b 50%,
    #24324a 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: @border-radius-sm;

  &--circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &--title {
    height: 18px;
    width: 60%;
  }

  &--text {
    height: 14px;
    width: 100%;
    margin-bottom: @space-2;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &--short {
    width: 40%;
  }

  &--button {
    height: 32px;
    width: 80px;
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
