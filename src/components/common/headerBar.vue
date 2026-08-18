<template>
  <div class="header-bar" role="banner">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="header-bar__left">
      <button
        class="header-bar__collapse"
        :aria-label="collapse ? '展开侧边栏' : '折叠侧边栏'"
        @click="collapseChange"
      >
        <i v-if="!collapse" class="el-icon-s-fold" aria-hidden="true"></i>
        <i v-else class="el-icon-s-unfold" aria-hidden="true"></i>
      </button>
      <Breadcrumb />
    </div>

    <!-- 右侧：搜索 + 消息中心 -->
    <div class="header-bar__right">
      <el-tooltip effect="dark" content="全局搜索 (⌘K)" placement="bottom">
        <button class="header-bar__action" aria-label="全局搜索" @click="openGlobalSearch">
          <i class="el-icon-search" aria-hidden="true"></i>
        </button>
      </el-tooltip>
      <el-tooltip
        effect="dark"
        :content="message ? `有${message}条未读消息` : '消息中心'"
        placement="bottom"
      >
        <button class="header-bar__action" aria-label="消息中心">
          <el-badge :value="message" :hidden="!message" :max="99">
            <i class="el-icon-bell" aria-hidden="true"></i>
          </el-badge>
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import bus from '@/util/bus';
import Breadcrumb from "@/components/common/Breadcrumb.vue";

export default {
  name: "headerBar",
  components: {
    Breadcrumb
  },
  data() {
    return {
      collapse: false,
      message: 0
    };
  },
  mounted() {
    if (document.body.clientWidth < 1500) {
      this.collapseChange();
    }
  },
  methods: {
    collapseChange() {
      this.collapse = !this.collapse;
      bus.$emit('collapse', this.collapse);
    },
    openGlobalSearch() {
      bus.$emit('open-global-search');
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: @header-height;
  padding: 0 @space-5;
  background: @bg-header;
  border-bottom: 1px solid @border-color;

  &__left {
    display: flex;
    align-items: center;
    gap: @space-4;
    min-width: 0;
  }

  &__collapse {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    cursor: pointer;
    border: none;
    border-radius: @border-radius;
    background: transparent;
    transition: all @transition-fast;
    flex-shrink: 0;

    &:hover {
      background: @border-color-light;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    i {
      font-size: 18px;
      color: @text-secondary;
      transition: color @transition-fast;
    }

    &:hover i {
      color: @text-primary;
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: @space-2;
    flex-shrink: 0;
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    cursor: pointer;
    border: none;
    border-radius: 50%;
    background: transparent;
    transition: all @transition-fast;
    position: relative;

    &:hover {
      background: @border-color-light;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    i {
      font-size: 18px;
      color: @text-secondary;
      transition: color @transition-fast;
    }

    &:hover i {
      color: @primary-color;
    }

    // Badge 样式优化
    ::v-deep .el-badge__content {
      font-size: 10px;
      height: 16px;
      line-height: 16px;
      padding: 0 4px;
    }
  }
}
</style>
