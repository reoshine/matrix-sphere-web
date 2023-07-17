import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const windows_default_suffix = ' | adp-matrix';

const router = new Router({
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/Login.vue'),
      meta: {
        title: '登录adp-matrix运维部署平台'
      }
    },
    {
      path: '/',
      component: resolve => require(['@/components/common/Home.vue'], resolve),
      meta: {
        title: 'adp-matrix运维部署平台'
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
          path: '/applicationList',
          component: resolve => require(['@/views/applicationList/ApplicationList.vue'], resolve),
          meta: {
            title: '应用列表'
          }
        },
        {
          path: '/branchManagement',
          name: 'BranchManagement',
          component: (resolve) => require(['@/views/branchManagement/BranchManagement'], resolve),
          meta: {
            title: '分支管理'
          },
        },
        {
          path: '/applicationDeploy',
          name: 'ApplicationDeploy',
          component: (resolve) => require(['@/views/applicationDeploy/ApplicationDeploy'], resolve),
          meta: {
            title: '应用部署'
          },
        },
        {
          path: '/serverManagement',
          name: 'ServerManagement',
          component: (resolve) => require(['@/views/serverManagement/ServerManagement'], resolve),
          meta: {
            title: '服务器管理'
          },
        },
        {
          path: '/serviceMonitor',
          name: 'ServiceMonitor',
          component: (resolve) => require(['@/views/serviceMonitor/ServiceMonitor'], resolve),
          meta: {
            title: '服务监控'
          },
        },
        {
          path: '/containerMonitor',
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
