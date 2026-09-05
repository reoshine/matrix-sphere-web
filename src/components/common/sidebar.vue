<template>
  <nav class="sidebar-nav" aria-label="主导航">
    <!-- Logo -->
    <div class="sidebar-nav__header">
      <div class="sidebar-nav__logo" v-show="!collapse" aria-hidden="true">
        <i class="el-icon-s-platform"></i>
        <span class="sidebar-nav__logo-text">MatrixSphere</span>
      </div>
      <div class="sidebar-nav__logo sidebar-nav__logo--icon" v-show="collapse" aria-hidden="true">
        <i class="el-icon-s-platform"></i>
      </div>
    </div>

    <!-- 搜索框（未折叠时显示） -->
    <div class="sidebar-nav__search" v-show="!collapse" role="search" aria-label="菜单搜索">
      <el-input
        v-model="searchQuery"
        placeholder="搜索菜单..."
        prefix-icon="el-icon-search"
        size="small"
        clearable
        aria-label="搜索菜单"
      />
    </div>

    <!-- 菜单区域 -->
    <div class="sidebar-nav__menu">
      <template v-for="group in filteredMenuGroups">
        <!-- 分组标题（未折叠时显示） -->
        <div class="sidebar-nav__group-title" v-show="!collapse" :key="'g-' + group.key">
          <i :class="group.icon" class="sidebar-nav__group-icon" v-if="group.icon"></i>
          {{ group.title }}
        </div>

        <!-- 菜单项 -->
        <el-menu
          :key="'m-' + group.key"
          class="sidebar-nav__menu-list"
          :default-active="routePath"
          :collapse="collapse"
          :collapse-transition="false"
          unique-opened
          router
        >
          <template v-for="menu in group.items">
            <!-- 有可见子菜单的项 -->
            <el-submenu
              v-if="hasVisibleChildren(menu.children)"
              :index="String(menu.id)"
              :key="menu.id"
            >
              <template slot="title">
                <i :class="menu.icon"></i>
                <span slot="title">{{ menu.menuName }}</span>
              </template>

              <template v-for="subMenu in menu.children">
                <el-submenu
                  v-if="hasVisibleChildren(subMenu.children)"
                  :index="String(subMenu.id)"
                  :key="subMenu.id"
                >
                  <template slot="title">{{ subMenu.menuName }}</template>
                  <el-menu-item
                    v-for="subSubMenu in subMenu.children"
                    v-if="!subSubMenu.hidden"
                    :index="subSubMenu.menuUrl"
                    :key="subSubMenu.menuUrl"
                  >
                    <i :class="subSubMenu.icon"></i>
                    {{ subSubMenu.menuName }}
                  </el-menu-item>
                </el-submenu>

                <el-menu-item
                  v-else-if="!subMenu.hidden"
                  :index="subMenu.menuUrl"
                  :key="subMenu.menuUrl"
                >
                  <i :class="subMenu.icon"></i>
                  <span slot="title">{{ subMenu.menuName }}</span>
                </el-menu-item>
              </template>
            </el-submenu>

            <!-- 无子菜单的项 -->
            <el-menu-item
              v-else-if="!menu.hidden"
              :index="menu.menuUrl"
              :key="menu.menuUrl"
            >
              <i :class="menu.icon"></i>
              <span slot="title">{{ menu.menuName }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </template>
    </div>

    <!-- 用户信息（底部） -->
    <div class="sidebar-nav__user" role="contentinfo" aria-label="用户信息">
      <el-avatar :size="32" class="sidebar-nav__user-avatar" aria-hidden="true">
        {{ username.charAt(0).toUpperCase() }}
      </el-avatar>
      <div class="sidebar-nav__user-info" v-show="!collapse">
        <span class="sidebar-nav__user-name">{{ username }}</span>
        <span class="sidebar-nav__user-dept">研发中心</span>
      </div>
      <el-tooltip content="退出登录" placement="right" v-show="collapse">
        <el-button
          type="text"
          icon="el-icon-switch-button"
          class="sidebar-nav__logout"
          aria-label="退出登录"
          @click="logout"
        />
      </el-tooltip>
      <el-button
        v-show="!collapse"
        type="text"
        icon="el-icon-switch-button"
        class="sidebar-nav__logout"
        aria-label="退出登录"
        @click="logout"
      />
    </div>
  </nav>
</template>

<script>
import bus from '@/util/bus';
import { mapGetters } from 'vuex';
import { groupMenus } from '@/utils/menuGroups';
import { sso } from '@/axios';

export default {
  name: "sidebar",
  data() {
    return {
      collapse: false,
      searchQuery: ''
    }
  },

  computed: {
    ...mapGetters(['menus']),

    username() {
      let username = localStorage.getItem("ms_username");
      return username ? username : "roshine";
    },

    groupedMenus() {
      return groupMenus(this.menus);
    },

    filteredMenuGroups() {
      if (!this.searchQuery) {
        return this.groupedMenus;
      }

      const query = this.searchQuery.toLowerCase();
      return this.groupedMenus.map(group => ({
        ...group,
        items: group.items.filter(menu => {
          // 匹配顶级菜单
          if (menu.menuName && menu.menuName.toLowerCase().includes(query)) {
            return true;
          }
          // 匹配子菜单
          if (menu.children) {
            return menu.children.some(child =>
              child.menuName && child.menuName.toLowerCase().includes(query)
            );
          }
          return false;
        })
      })).filter(group => group.items.length > 0);
    },

    routePath() {
      if (this.$route.meta.guidePath) {
        return this.$route.meta.jumpPath;
      }
      if (this.$route.meta.hidden && this.$route.meta.parentPath) {
        return this.$route.meta.parentPath;
      }
      return this.$route.path;
    }
  },

  created() {
    bus.$on('collapse', msg => {
      this.collapse = msg;
      bus.$emit('collapse-content', msg);
    });

    // ⌘B 快捷键：折叠/展开侧边栏
    bus.$on('toggle-sidebar', () => {
      this.collapseChange();
    });

    // 小屏自动折叠
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    handleResize() {
      const isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen && !this.collapse) {
        this.collapse = true;
        bus.$emit('collapse', true);
      }
    },

    hasVisibleChildren(children) {
      if (!children || children.length === 0) {
        return false;
      }
      return children.some(child => !child.hidden);
    },

    collapseChange() {
      this.collapse = !this.collapse;
      bus.$emit('collapse', this.collapse);
    },

    async logout() {
      try {
        await sso.post('/authentication/logout', {}, { withCredentials: true });
      } catch (error) {
        console.error('SSO注销请求异常，强制执行本地清理', error);
      } finally {
        localStorage.removeItem("adpSsoToken");
        localStorage.removeItem("adpSsoRefreshToken");
        localStorage.removeItem("ms_username");
        this.$message.success('退出成功！');
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.sidebar-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: @bg-sidebar;
  color: @menu-text;

  // Header: Logo
  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
    padding: 0 @space-3;
    border-bottom: 1px solid @border-color-light;
    flex-shrink: 0;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: @space-2;
    font-size: @font-size-lg;
    font-weight: 600;
    color: @text-primary;
    white-space: nowrap;
    overflow: hidden;

    i {
      font-size: 22px;
      color: @primary-light;
    }

    &--icon {
      justify-content: center;
      width: 100%;
    }
  }

  // 搜索框
  &__search {
    padding: @space-3;
    flex-shrink: 0;

    ::v-deep .el-input__inner {
      background: #111827;
      border: 1px solid @border-color;
      color: @menu-text;

      &::placeholder {
        color: @text-tertiary;
      }

      &:focus {
        border-color: @primary-light;
      }
    }

    ::v-deep .el-input__prefix {
      color: @text-tertiary;
    }
  }

  // 菜单区域
  &__menu {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: @space-4;

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: #40506a;
      border-radius: 2px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  &__group-title {
    display: flex;
    align-items: center;
    gap: @space-2;
    padding: @space-4 @space-4 @space-2;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: @text-tertiary;
    white-space: nowrap;
  }

  &__group-icon {
    font-size: 14px;
    color: @text-secondary;
  }

  &__menu-list {
    border-right: none;
    background-color: transparent !important;

    // 覆盖 Element UI 菜单样式
    ::v-deep {
      .el-menu-item,
      .el-submenu__title {
        color: @menu-text !important;
        height: 48px;
        line-height: 48px;
        padding-left: @space-5 !important;
        margin: 2px @space-2;
        border-radius: @border-radius;
        transition: all @transition-fast;

        i {
          color: @menu-text;
          margin-right: @space-2;
          font-size: 18px;
          transition: color @transition-fast;
        }

        &:hover {
          background-color: @menu-hover-bg !important;
          color: @text-primary !important;

          i {
            color: @text-primary !important;
          }
        }
      }

      .el-menu-item.is-active {
        background-color: @menu-active-bg !important;
        color: @text-primary !important;
        box-shadow: inset 0 0 0 1px rgba(32, 191, 169, 0.24);
        border-left: none;
        font-weight: 500;

        i {
          color: @primary-light !important;
        }
      }

      .el-submenu .el-menu {
        background-color: #0e1828 !important;
        padding: @space-1 0;
      }

      .el-submenu__icon-arrow {
        right: @space-3;
        font-size: 12px;
      }
    }
  }

  // 用户信息
  &__user {
    display: flex;
    align-items: center;
    gap: @space-2;
    padding: @space-3 @space-4;
    border-top: 1px solid @border-color-light;
    flex-shrink: 0;
  }

  &__user-avatar {
    flex-shrink: 0;
    background: @primary-color;
    color: #062623;
    font-size: @font-size-sm;
  }

  &__user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__user-name {
    font-size: @font-size-sm;
    color: @text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__user-dept {
    font-size: @font-size-xs;
    color: @text-tertiary;
  }

  &__logout {
    color: @menu-text !important;
    flex-shrink: 0;

    &:hover {
      color: @error-color !important;
    }
  }
}
</style>
