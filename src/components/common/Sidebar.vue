<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="collapse"
      background-color="#324157"
      text-color="#bfcbd9"
      active-text-color="#20a0ff"
      unique-opened
      router>
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-submenu
            :index="item.index"
            :key="item.index">
            <!-- 显示有子菜单的一级菜单 -->
            <template slot="title">
              <i :class="item.icon"></i>
              <span slot="title">{{ item.title }}</span>
            </template>

            <template v-for="subItem in item.subs">
              <!-- 显示有子菜单的二级菜单 -->
              <el-submenu
                v-if="subItem.subs"
                :index="subItem.index"
                :key="subItem.index">
                <template slot="title">{{ subItem.title }}</template>

                <!-- 显示三级菜单 -->
                <el-menu-item
                  v-for="(threeItem,i) in subItem.subs"
                  :key="i"
                  :index="threeItem.index">
                  {{ threeItem.title }}
                </el-menu-item>
              </el-submenu>

              <!-- 显示没有子菜单的二级菜单 -->
              <el-menu-item
                v-else
                :index="subItem.index"
                :key="subItem.index">
                <i :class="subItem.icon"></i>
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-submenu>
        </template>

        <!-- 显示没有子菜单的一级菜单 -->
        <template v-else>
          <el-menu-item
            :index="item.index"
            :key="item.index">
            <i :class="item.icon"></i>
            <span slot="title">{{ item.title }}</span>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import bus from '@/util/bus';

export default {
  name: "Sidebar",
  data() {
    return {
      collapse: false,
      items: [
        {
          icon: 'el-icon-lx-home',
          index: 'dashboard',
          title: '系统首页',
        },
        {
          icon: 'el-icon-lx-apps',
          index: '2',
          title: '应用管理',
          subs: [
            {
              icon: 'iconfont icon-yingyong',
              index: 'applicationGroup',
              title: '应用分组',
            },
            {
              icon: 'iconfont icon-yingyong',
              index: 'applicationList',
              title: '应用列表',
            },
            {
              icon: 'iconfont icon-code-branch-full',
              index: 'branchManagement',
              title: '分支管理',
            },
            {
              icon: 'iconfont icon-DeploymentUnit',
              index: 'applicationDeploy',
              title: '应用部署',
            }
          ]
        },
        {
          icon: 'iconfont icon-zu1773',
          index: '3',
          title: '系统监控',
          subs: [
            {
              icon: 'iconfont icon-fuwuqiguanli',
              index: 'serverManagement',
              title: '服务器管理',
            },
            {
              icon: 'iconfont icon-service',
              index: 'serviceMonitor',
              title: '服务监控',
            },
            {
              icon: 'iconfont icon-kubernetes',
              index: 'containerMonitor',
              title: '容器监控',
            }
          ]
        }
      ]
    }
  },

  methods: {

  },

  computed: {
    onRoutes() {
      return this.$route.path.replace('/', '');
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
