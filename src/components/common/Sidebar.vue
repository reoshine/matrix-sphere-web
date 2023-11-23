<template>
  <div class="sidebar">
    <el-menu
        class="sidebar-el-menu"
        :default-active="$route.path"
        :collapse="collapse"
        background-color="#324157"
        text-color="#bfcbd9"
        active-text-color="#20a0ff"
        unique-opened
        router>
      <template v-for="menu in menuList">
        <template v-if="menu.children">
          <el-submenu
              :index="menu.menuCode"
              :key="menu.menuCode">
            <!-- 显示有子菜单的一级菜单 -->
            <template slot="title">
              <i :class="menu.icon"></i>
              <span slot="title">{{ menu.menuName }}</span>
            </template>

            <template v-for="subMenu in menu.children">
              <!-- 显示有子菜单的二级菜单 -->
              <el-submenu
                  v-if="subMenu.subMenuList"
                  :index="subMenu.menuCode"
                  :key="subMenu.menuCode">
                <template slot="title">{{ subMenu.menuName }}</template>
              </el-submenu>

              <!-- 显示没有子菜单的二级菜单 -->
              <el-menu-item
                  v-else
                  :index="subMenu.menuCode"
                  :key="subMenu.menuCode">
                <i :class="subMenu.icon"></i>
                {{ subMenu.menuName }}
              </el-menu-item>
            </template>
          </el-submenu>
        </template>

        <!-- 显示没有子菜单的一级菜单 -->
        <template v-else>
          <el-menu-item
              :index="menu.menuCode"
              :key="menu.menuCode">
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
import {getMenuList} from "@/api/api";

export default {
  name: "Sidebar",
  data() {
    return {
      collapse: false,
      menuList: [
        {
          id: '',
          menuCode: '',
          menuName: '',
          icon: '',
          sortNo: '',
          patentFlag: '',
          parentId: '',
          createBy: '',
          createByName: '',
          children: []
        }
      ],
    }
  },

  methods: {
    getMenuAndSubMenuList() {
      getMenuList(2).then(res => {
        if (res.data.code === 2000) {
          this.menuList = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '分页查询菜单列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    }
  },

  computed: {

  },
  created() {
    // 通过 Event Bus 进行组件间通信，来折叠侧边栏
    bus.$on('collapse', msg => {
      this.collapse = msg;
      bus.$emit('collapse-content', msg);
    });
    this.getMenuAndSubMenuList()
  },
  mounted() {
  },

  beforeDestroy() {
  },
};
</script>

<style lang="less" scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
}

.iconfont {
  margin-left: 3px;
  margin-right: 10px;
}

.sidebar::-webkit-scrollbar {
  width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
  width: 250px;
}

.sidebar > ul {
  height: 100%;
}
</style>
