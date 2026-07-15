<template>
  <div class="sidebar">
    <el-menu
        class="sidebar-el-menu"
        :default-active="routePath"
        :collapse="collapse"
        unique-opened
        router>

      <template v-for="menu in menuList">

        <template v-if="hasVisibleChildren(menu.children)">
          <el-submenu :index="String(menu.id)" :key="menu.id">
            <template slot="title">
              <i :class="menu.icon"></i>
              <span slot="title">{{ menu.menuName }}</span>
            </template>

            <template v-for="subMenu in menu.children">

              <el-submenu
                  v-if="hasVisibleChildren(subMenu.children)"
                  :index="String(subMenu.id)"
                  :key="subMenu.id">
                <template slot="title">{{ subMenu.menuName }}</template>

                <template v-for="subSubMenu in subMenu.children">
                  <el-menu-item
                      v-if="!subSubMenu.hidden"
                      :index="subSubMenu.menuUrl"
                      :key="subSubMenu.menuUrl">
                    <i :class="subSubMenu.icon"></i>
                    {{ subSubMenu.menuName }}
                  </el-menu-item>
                </template>
              </el-submenu>

              <el-menu-item
                  v-else-if="!subMenu.hidden"
                  :index="subMenu.menuUrl"
                  :key="subMenu.menuUrl">
                <i :class="subMenu.icon"></i>
                <span slot="title">{{ subMenu.menuName }}</span>
              </el-menu-item>
            </template>

          </el-submenu>
        </template>

        <template v-else-if="!menu.hidden">
          <el-menu-item
              :index="menu.menuUrl"
              :key="menu.menuUrl">
            <i :class="menu.icon"></i>
            <span slot="title">{{ menu.menuName }}</span>
          </el-menu-item>
        </template>

      </template>
    </el-menu>
  </div>
</template>

<script>
import bus from '@/util/bus';
import { mapGetters } from 'vuex';

export default {
  name: "sidebar",
  data() {
    return {
      collapse: false,
    }
  },

  methods: {
    // ---------------------------------
    // 关键修复:
    // ---------------------------------
    /**
     * 检查一个菜单数组中是否至少有一个可见的子菜单 (hidden: false)
     */
    hasVisibleChildren(children) {
      if (!children || children.length === 0) {
        return false;
      }
      // 使用 .some() 来查找，只要找到一个 !hidden 的就返回 true
      return children.some(child => !child.hidden);
    }
  },

  computed: {
    ...mapGetters([
      'menus'
    ]),

    /**
     * menuList 不再需要过滤 hidden，
     * 因为我们的模板 v-if 中已经处理了 !menu.hidden
     */
    menuList() {
      return this.menus;
    },

    routePath() {
      // 修复高亮：如果当前路由是 '分支管理'，则高亮 '应用列表'
      if (this.$route.meta.guidePath) {
        return this.$route.meta.jumpPath;
      }
      return this.$route.path;
    }
  },
  created() {
    // 通过 Event Bus 进行组件间通信，来折叠侧边栏
    bus.$on('collapse', msg => {
      this.collapse = msg;
      bus.$emit('collapse-content', msg);
    });
  },

  mounted() {
  },

  beforeDestroy() {
  },
};
</script>

<style lang="less" scoped>
// 1. 引入您的主题变量文件
@import "~@/assets/css/theme.less";

.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: @header-height;
  bottom: 0;
  overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
  width: 0;
}

// 2. 核心：覆盖 Element UI 的样式
.sidebar-el-menu {
  // 设置菜单的宽度
  &:not(.el-menu--collapse) {
    width: @sidebar-width;
  }

  height: 100%; // 让菜单撑满侧边栏高度

  background-color: @bg-sidebar !important;
  border-right: none;

  // 覆盖 *子菜单* (submenu) 展开时的背景色
  ::v-deep .el-menu {
    background-color: @bg-sidebar !important;
  }

  // 覆盖所有菜单项的文字和图标颜色
  ::v-deep .el-menu-item,
  ::v-deep .el-submenu__title {
    color: @menu-text !important;

    i { // 同时设置 icon 的颜色
      color: @menu-text;
    }
  }

  // 覆盖鼠标悬停时的背景色
  ::v-deep .el-menu-item:hover,
  ::v-deep .el-submenu__title:hover {
    background-color: @menu-hover-bg !important;
  }

  // 覆盖激活菜单项的样式 (方案A：蓝色背景，白色文字)
  ::v-deep .el-menu-item.is-active {
    background-color: @primary-color !important;
    color: #FFFFFF !important;
    i {
      color: #FFFFFF !important;
    }
  }
}

.iconfont {
  margin-left: 3px;
  margin-right: 10px;
}
</style>