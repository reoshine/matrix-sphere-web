<template>
  <nav class="sidebar-nav" aria-label="主导航">
    <!-- Logo + 折叠按钮 -->
    <div class="sidebar-nav__header">
      <div class="sidebar-nav__logo" v-show="!collapse">
        <i class="el-icon-s-platform"></i>
        <span class="sidebar-nav__logo-text">MatrixSphere</span>
      </div>
      <div class="sidebar-nav__logo sidebar-nav__logo--icon" v-show="collapse">
        <i class="el-icon-s-platform"></i>
      </div>
      <div class="sidebar-nav__collapse" @click="collapseChange">
        <i v-if="!collapse" class="el-icon-s-fold"></i>
        <i v-else class="el-icon-s-unfold"></i>
      </div>
    </div>

    <!-- 搜索框（未折叠时显示） -->
    <div class="sidebar-nav__search" v-show="!collapse">
      <el-input
        v-model="searchQuery"
        placeholder="搜索菜单..."
        prefix-icon="el-icon-search"
        size="small"
        clearable
      />
    </div>

    <!-- 菜单区域 -->
    <div class="sidebar-nav__menu">
      <template v-for="group in filteredMenuGroups">
        <!-- 分组标题（未折叠时显示） -->
        <div class="sidebar-nav__group-title" v-show="!collapse" :key="'g-' + group.key">
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
    <div class="sidebar-nav__user">
      <el-avatar :size="32" class="sidebar-nav__user-avatar">
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
          @click="logout"
        />
      </el-tooltip>
      <el-button
        v-show="!collapse"
        type="text"
        icon="el-icon-switch-button"
        class="sidebar-nav__logout"
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

  methods: {
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

  // Header: Logo + 折叠按钮
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 @space-3;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: @space-2;
    font-size: @font-size-lg;
    font-weight: 600;
    color: #fff;
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

  &__collapse {
    cursor: pointer;
    padding: @space-2;
    border-radius: @border-radius;
    transition: background @transition-fast;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    i {
      color: @menu-text;
      font-size: @font-size-lg;
    }
  }

  // 搜索框
  &__search {
    padding: @space-3;
    flex-shrink: 0;

    ::v-deep .el-input__inner {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: @menu-text;

      &::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }

      &:focus {
        border-color: @primary-light;
      }
    }

    ::v-deep .el-input__prefix {
      color: rgba(255, 255, 255, 0.3);
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
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  &__group-title {
    padding: @space-4 @space-4 @space-1;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.3);
    white-space: nowrap;
  }

  &__menu-list {
    border-right: none;
    background-color: transparent !important;

    // 覆盖 Element UI 菜单样式
    ::v-deep {
      .el-menu-item,
      .el-submenu__title {
        color: @menu-text !important;
        height: 44px;
        line-height: 44px;

        i {
          color: @menu-text;
        }

        &:hover {
          background-color: @menu-hover-bg !important;
        }
      }

      .el-menu-item.is-active {
        background-color: @primary-color !important;
        color: #fff !important;
        border-left: 3px solid @primary-light;

        i {
          color: #fff !important;
        }
      }

      .el-submenu .el-menu {
        background-color: rgba(0, 0, 0, 0.15) !important;
      }
    }
  }

  // 用户信息
  &__user {
    display: flex;
    align-items: center;
    gap: @space-2;
    padding: @space-3 @space-4;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  &__user-avatar {
    flex-shrink: 0;
    background: @primary-color;
    color: #fff;
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
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__user-dept {
    font-size: @font-size-xs;
    color: rgba(255, 255, 255, 0.5);
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
