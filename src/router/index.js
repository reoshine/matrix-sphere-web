import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const windows_default_suffix = ' | matrix-sphere';

const router = new Router({
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/Login.vue'),
      meta: {
        title: '登录matrix-sphere运维部署平台'
      }
    },
    {
      path: '/',
      component: resolve => require(['@/components/common/Home.vue'], resolve),
      meta: {
        title: 'matrix-sphere运维部署平台'
      },
      children: [
        {
          path: '/dashboard',
          component: resolve => require(['@/views/dashboard/Dashboard.vue'], resolve),
          meta: {
            title: '系统首页'
          }
        },
        {
          path: '/applicationManagement/applicationGroup',
          component: resolve => require(['@/views/applicationManagement/ApplicationGroup.vue'], resolve),
          meta: {
            title: '应用分组'
          }
        },
        {
          path: '/applicationManagement/applicationList',
          component: resolve => require(['@/views/applicationManagement/ApplicationList.vue'], resolve),
          meta: {
            title: '应用列表'
          }
        },
        {
          path: '/applicationManagement/branchManagement',
          name: 'BranchManagement',
          component: (resolve) => require(['@/views/applicationManagement/BranchManagement'], resolve),
          meta: {
            title: '分支管理',
            guidePath: true,
            jumpPath: '/applicationManagement/applicationList',
          },
        },
        {
          path: '/applicationManagement/applicationDeploy',
          name: 'ApplicationDeploy',
          component: (resolve) => require(['@/views/applicationManagement/ApplicationDeploy.vue'], resolve),
          meta: {
            title: '应用部署',
            guidePath: true,
            jumpPath: '/applicationManagement/applicationList',
          },
        },
        {
          path: '/applicationManagement/applicationEdit',
          name: 'ApplicationEdit',
          component: (resolve) => require(['@/views/applicationManagement/ApplicationEdit.vue'], resolve),
          meta: {
            title: '应用编辑',
            guidePath: true,
            jumpPath: '/applicationManagement/applicationList',
          },
        },
        {
          path: '/serviceMonitor/serverManagement',
          name: 'ServerManagement',
          component: (resolve) => require(['@/views/serviceMonitor/ServerManagement.vue'], resolve),
          meta: {
            title: '服务器管理'
          },
        },
        {
          path: '/serviceMonitor/serviceMonitor',
          name: 'ServiceMonitor',
          component: (resolve) => require(['@/views/serviceMonitor/ServiceMonitor'], resolve),
          meta: {
            title: '服务监控'
          },
        },
        {
          path: '/serviceMonitor/containerMonitor',
          name: 'ContainerMonitor',
          component: (resolve) => require(['@/views/containerMonitor/ContainerMonitor.vue'], resolve),
          meta: {
            title: '容器监控'
          },
        },
        {
          path: '/credentialManagement/credentialList',
          component: (resolve) => require(['@/views/credentialManagement/CredentialList.vue'], resolve),
          meta: {
            title: '凭据列表'
          },
        },



        {
          path: '/accountManagement/accountList',
          name: 'Account',
          component: (resolve) => require(['@/views/account/Account.vue'], resolve),
          meta: {
            title: '用户管理'
          },
        },
        {
          path: '/accountManagement/authorityManagement',
          name: 'Authority',
          component: (resolve) => require(['@/views/authority/Authority.vue'], resolve),
          meta: {
            title: '权限管理'
          },
        },
        {
          path: '/accountManagement/roleManagement',
          name: 'Role',
          component: (resolve) => require(['@/views/role/Role.vue'], resolve),
          meta: {
            title: '角色管理'
          },
        },
        {
          path: '/accountManagement/roleAuthority',
          name: 'RoleAuthority',
          component: (resolve) => require(['@/views/role/RoleAuthority.vue'], resolve),
          meta: {
            title: '角色管理'
          },
        },
        {
          path: '/projectManagement/projectList',
          name: 'ProjectList',
          component: (resolve) => require(['@/views/projectManagement/ProjectList.vue'], resolve),
          meta: {
            title: '应用管理'
          },
        },
        {
          path: '/systemManagement/systemParamManagement',
          name: 'SystemParamManagement',
          component: (resolve) => require(['@/views/systemManagement/SystemParamManagement.vue'], resolve),
          meta: {
            title: '系统参数管理'
          },
        },
      ]
    }
  ],
  mode: 'history',
  linkActiveClass: 'active'
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title + windows_default_suffix
  next()
})

export default router
