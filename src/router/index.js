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
            title: '应用列表'
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
            title: '分支管理'
          },
        },
        {
          path: '/applicationManagement/applicationDeploy',
          name: 'ApplicationDeploy',
          component: (resolve) => require(['@/views/applicationManagement/ApplicationDeploy.vue'], resolve),
          meta: {
            title: '应用部署'
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
