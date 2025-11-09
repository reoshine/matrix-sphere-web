<template>
  <div class="page-header-container">
    <el-page-header @back="goBack" :content="currentTitle">

      <template slot="title">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>

          <el-breadcrumb-item v-if="parentTitle" :to="{ path: parentPath }">
            {{ parentTitle }}
          </el-breadcrumb-item>

          <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
      </template>

    </el-page-header>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

/**
 * 递归辅助函数：
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
  name: "PageHeader",
  computed: {
    // 1. 从 Vuex 获取完整的菜单树
    ...mapGetters(['menus']),

    // 2. 获取当前路由的 meta.title (e.g., "应用部署")
    currentTitle() {
      return this.$route.meta.title;
    },

    // 3. 获取 'jumpPath' (e.g., "/applicationManagement/application")
    parentPath() {
      return this.$route.meta.jumpPath;
    },

    // 4. (核心) 在菜单树中查找 'parentPath' 对应的中文名
    parentTitle() {
      if (!this.parentPath || !this.menus) return null;
      // e.g., 查找 "/applicationManagement/application" 对应的 "应用列表"
      return findMenuName(this.menus, this.parentPath);
    }
  },
  methods: {
    goBack() {
      // 触发浏览器 "后退"
      this.$router.go(-1);
    }
  }
}
</script>

<style lang="less" scoped>
.page-header-container {
  // 放在内容区顶部的标准样式
  background-color: #ffffff;
  padding: 16px 20px;
  margin-bottom: 20px; // 与下方内容隔开
  border-radius: 4px;
  // (可选) 增加一个轻微的阴影
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>