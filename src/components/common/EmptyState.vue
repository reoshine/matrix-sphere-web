<template>
  <div
    class="empty-state"
    :role="requestId ? 'alert' : null"
    :aria-live="requestId ? 'polite' : null"
  >
    <div class="empty-state__icon">
      <i :class="icon" aria-hidden="true"></i>
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p class="empty-state__desc" v-if="description">{{ description }}</p>
    <div class="empty-state__request" v-if="requestId">
      <span class="empty-state__request-label">请求编号</span>
      <code class="empty-state__request-id">{{ requestId }}</code>
      <el-button
        class="empty-state__copy"
        type="text"
        size="small"
        native-type="button"
        aria-label="复制请求编号"
        @click="copyRequestId"
      >
        复制
      </el-button>
    </div>
    <div class="empty-state__action" v-if="actionText || retryText">
      <el-button v-if="actionText" type="primary" size="small" native-type="button" @click="$emit('action')">
        {{ actionText }}
      </el-button>
      <el-button v-if="retryText" size="small" native-type="button" @click="$emit('retry')">
        {{ retryText }}
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
    },
    requestId: {
      type: String,
      default: ''
    },
    retryText: {
      type: String,
      default: ''
    }
  },
  methods: {
    async copyRequestId() {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(this.requestId)
        } else {
          const textarea = document.createElement('textarea')
          textarea.value = this.requestId
          textarea.setAttribute('readonly', '')
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }
        this.$message.success('请求编号已复制')
      } catch (error) {
        this.$message.warning('复制失败，请手动选择请求编号')
      }
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

  &__request {
    display: flex;
    align-items: center;
    gap: @space-2;
    max-width: 100%;
    padding: @space-2 @space-3;
    border: 1px solid @border-color-light;
    border-radius: @border-radius-sm;
    background: @bg-surface-elevated;
    color: @text-tertiary;
    font-size: @font-size-xs;
  }

  &__request-label,
  &__copy {
    flex: none;
  }

  &__request-id {
    min-width: 0;
    color: @text-secondary;
    font-family: @font-mono;
    overflow-wrap: anywhere;
    user-select: all;
  }

  &__action {
    margin-top: @space-2;
  }
}
</style>
