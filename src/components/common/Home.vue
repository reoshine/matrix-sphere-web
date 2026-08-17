<template>
  <div class="layout">
    <!-- 跳过链接（可访问性） -->
    <SkipLink />

    <aside class="layout-sidebar" :class="{ 'is-collapsed': collapse }" role="navigation" aria-label="主导航">
      <sidebar />
    </aside>

    <div class="layout-main">
      <header class="layout-header">
        <headerBar />
      </header>

      <div class="layout-tabs">
        <tags />
      </div>

      <main id="main-content" class="layout-content" tabindex="-1">
        <transition name="fade-transform" mode="out-in">
          <keep-alive :include="tagsList">
            <router-view />
          </keep-alive>
        </transition>
      </main>
    </div>

    <!-- 全局搜索（⌘K / Ctrl+K） -->
    <GlobalSearch ref="globalSearch" />
  </div>
</template>

<script>
import bus from '@/util/bus';
import headerBar from "@/components/common/headerBar";
import sidebar from "@/components/common/sidebar";
import tags from "@/components/common/Tags";
import GlobalSearch from "@/components/common/GlobalSearch.vue";
import SkipLink from "@/components/common/SkipLink.vue";

export default {
  name: "home",
  components: {
    headerBar,
    sidebar,
    tags,
    GlobalSearch,
    SkipLink,
  },
  data() {
    return {
      tagsList: [],
      collapse: false
    };
  },
  created() {
    bus.$on('collapse-content', msg => {
      this.collapse = msg;
    });

    // 全局搜索：从 headerBar 搜索图标触发
    bus.$on('open-global-search', () => {
      this.$refs.globalSearch && this.$refs.globalSearch.open();
    });

    // 只有在标签页列表里的页面才使用keep-alive，即关闭标签之后就不保存到内存中了。
    bus.$on('tags', msg => {
      let arr = [];
      for (let i = 0, len = msg.length; i < len; i++) {
        msg[i].name && arr.push(msg[i].name);
      }
      this.tagsList = arr;
    });
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.layout-sidebar {
  flex-shrink: 0;
  width: @sidebar-width;
  transition: width @transition-slow;

  &.is-collapsed {
    width: @sidebar-width-collapse;
  }
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // 防止 flex 子元素溢出
  overflow: hidden;
}

.layout-header {
  flex-shrink: 0;
}

.layout-tabs {
  flex-shrink: 0;
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  padding: @space-5;
  background: @bg-content;
  position: relative; // 为页面切换动画设置定位上下文
}

/* 页面切换过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
