<template>
  <div class="page-header-container">

    <div class="header-left">
      <el-button
          type="primary"
          plain
          size="mini"
          icon="el-icon-back"
          @click="goBack"
      >
        返回
      </el-button>
    </div>

    <div class="header-right">

      <el-breadcrumb separator="/" class="header-breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>

        <el-breadcrumb-item v-if="parentTitle" :to="{ path: parentPath }">
          {{ parentTitle }}
        </el-breadcrumb-item>

        <el-breadcrumb-item>{{ staticTitle }}</el-breadcrumb-item>
      </el-breadcrumb>

    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import bus from '@/util/bus';

/**
 * (辅助函数保持不变)
 * 在 Vuex 存储的 'menus' 树中查找指定 'path' 的 'menuName'
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
  name: "pageHeader",
  data() {
    return {
      dynamicTitle: null // (e.g., "matrixsphere底层核心包")
    }
  },
  computed: {
    ...mapGetters(['menus']),

    // [修复] 新增: 当前页面的 *静态* 标题 (e.g., "应用部署")
    staticTitle() {
      return this.$route.meta.title;
    },

    // 父级页面的路径 (e.g., "/applicationManagement/application")
    parentPath() {
      return this.$route.meta.jumpPath;
    },

    // 父级页面的名称 (e.g., "应用列表")
    parentTitle() {
      if (!this.parentPath || !this.menus) return null;
      return findMenuName(this.menus, this.parentPath);
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    // (保持不变)
    onSetPageTitle(title) {
      this.dynamicTitle = title;
    }
  },
  watch: {
    // (保持不变) 路由切换时重置
    $route(to, from) {
      this.dynamicTitle = null;
    }
  },
  created() {
    // (保持不变)
    bus.$on('set-page-title', this.onSetPageTitle);
  },
  beforeDestroy() {
    // (保持不变)
    bus.$off('set-page-title', this.onSetPageTitle);
  }
}
</script>

<style lang="less" scoped>
// [重构] 整个样式块
.page-header-container {
  background-color: #ffffff;
  // padding: 16px 20px;
  margin-bottom: 20px;
  border-radius: 4px;

  // 1. [核心] 使用 Flexbox 布局
  display: flex;
  align-items: center;
}

.header-left {
  // 返回按钮区
  flex-shrink: 0; // 不压缩
  margin-right: 20px;
}

.header-right {
  // 标题区
  flex-grow: 1; // 占满剩余空间
  min-width: 0; // (防止 flex 溢出)
}

.header-breadcrumb {
  // 2. [核心修复] 面包屑样式
  font-size: 14px;
  line-height: 1;

  // [修复] 覆盖 Element UI 默认的 'last-child' 大字体样式
  // 让所有链接项保持标准样式
  ::v-deep .el-breadcrumb__inner,
  ::v-deep .el-breadcrumb__inner a {
    color: #606266 !important;
    font-weight: 400 !important;
  }

  // [修复] 单独设置 *最后一项* (纯文本) 的样式
  ::v-deep .el-breadcrumb__item:last-child .el-breadcrumb__inner {
    color: #303133 !important; // 设为标准黑色
    font-weight: 500 !important; // 稍微加粗
    cursor: text;
  }
}
</style>