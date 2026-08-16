<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <el-breadcrumb-item :to="{ path: '/' }">
      <i class="el-icon-s-home" style="margin-right: 4px;"></i>首页
    </el-breadcrumb-item>

    <el-breadcrumb-item
      v-if="parentTitle"
      :to="{ path: parentPath }"
    >
      {{ parentTitle }}
    </el-breadcrumb-item>

    <el-breadcrumb-item>
      {{ currentTitle }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { mapGetters } from 'vuex';

/**
 * 在菜单树中查找指定 path 的 menuName
 */
function findMenuName(menuList, path) {
  if (!menuList) return null;
  for (const menu of menuList) {
    if (menu.menuUrl === path) {
      return menu.menuName;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuName(menu.children, path);
      if (found) return found;
    }
  }
  return null;
}

export default {
  name: 'Breadcrumb',
  computed: {
    ...mapGetters(['menus']),

    currentTitle() {
      return this.$route.meta && this.$route.meta.title;
    },

    parentPath() {
      if (!this.$route.meta) return null;
      return this.$route.meta.jumpPath || this.$route.meta.parentPath;
    },

    parentTitle() {
      if (!this.parentPath || !this.menus) return null;
      return findMenuName(this.menus, this.parentPath);
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.app-breadcrumb {
  font-size: @font-size-base;
  line-height: 1;

  // 覆盖 Element UI 默认的最后一项大字体样式
  ::v-deep .el-breadcrumb__inner,
  ::v-deep .el-breadcrumb__inner a {
    color: @text-secondary !important;
    font-weight: 400 !important;
  }

  // 最后一项（当前页）样式
  ::v-deep .el-breadcrumb__item:last-child .el-breadcrumb__inner {
    color: @text-primary !important;
    font-weight: 500 !important;
    cursor: default;
  }
}
</style>
