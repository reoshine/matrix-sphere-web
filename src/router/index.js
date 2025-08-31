import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const windows_default_suffix = ' | matrix-sphere';

const router = new Router({
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/login.vue'),
      meta: {
        title: '登录matrix-sphere运维部署平台'
      }
    },
    {
      path: '/',
      component: resolve => require(['@/components/common/home.vue'], resolve),
      meta: {
        title: 'matrix-sphere运维部署平台'
      },
      children: [
        {
          path: '/applicationManagement/applicationGroup',
          component: resolve => require(['@/views/applicationManagement/applicationGroup.vue'], resolve),
          meta: {
            title: '应用分组'
          }
        },
        {
          path: '/applicationManagement/application',
          name: 'application',
          component: resolve => require(['@/views/applicationManagement/application.vue'], resolve),
          meta: {
            title: '应用列表'
          }
        },
        {
          path: '/applicationManagement/branch',
          name: 'branch',
          component: (resolve) => require(['@/views/applicationManagement/branch.vue'], resolve),
          meta: {
            title: '分支管理',
            guidePath: true,
            jumpPath: '/applicationManagement/application',
          },
        },
        {
          path: '/applicationManagement/applicationDeploy',
          name: 'applicationDeploy',
          component: (resolve) => require(['@/views/applicationManagement/applicationDeploy.vue'], resolve),
          meta: {
            title: '应用部署',
            guidePath: true,
            jumpPath: '/applicationManagement/application',
          },
        },
        {
          path: '/applicationManagement/applicationEdit',
          name: 'applicationEdit',
          component: (resolve) => require(['@/views/applicationManagement/applicationEdit.vue'], resolve),
          meta: {
            title: '应用编辑',
            guidePath: true,
            jumpPath: '/applicationManagement/application',
          },
        },
        {
          path: '/serviceMonitor/serverManagement',
          name: 'serverManagement',
          component: (resolve) => require(['@/views/serviceMonitor/serverManagement.vue'], resolve),
          meta: {
            title: '服务器管理'
          },
        },
        {
          path: '/serviceMonitor/serviceMonitor',
          name: 'serviceMonitor',
          component: (resolve) => require(['@/views/serviceMonitor/serviceMonitor.vue'], resolve),
          meta: {
            title: '服务监控'
          },
        },
        {
          path: '/serviceMonitor/containerMonitor',
          name: 'containerMonitor',
          component: (resolve) => require(['@/views/containerMonitor/containerMonitor.vue'], resolve),
          meta: {
            title: '容器监控'
          },
        },
        {
          path: '/repositoryManagement/namespace',
          name: 'namespace',
          component: (resolve) => require(['@/views/repositoryManagement/namespace.vue'], resolve),
          meta: {
            title: '命名空间'
          },
        },
        {
          path: '/repositoryManagement/gitRepository',
          name: 'gitRepository',
          component: (resolve) => require(['@/views/repositoryManagement/gitRepository.vue'], resolve),
          meta: {
            title: 'Git仓库'
          },
        },
        {
          path: '/credentialManagement/credential',
          name: 'credential',
          component: (resolve) => require(['@/views/credentialManagement/credential.vue'], resolve),
          meta: {
            title: '凭据列表'
          },
        },



        {
          path: '/accountManagement/account',
          name: 'account',
          component: (resolve) => require(['@/views/accountManagement/account.vue'], resolve),
          meta: {
            title: '用户管理'
          },
        },
        {
          path: '/accountManagement/authority',
          name: 'authority',
          component: (resolve) => require(['@/views/accountManagement/authority.vue'], resolve),
          meta: {
            title: '权限管理'
          },
        },
        {
          path: '/accountManagement/menu',
          name: 'menu',
          component: (resolve) => require(['@/views/accountManagement/menu.vue'], resolve),
          meta: {
            title: '菜单管理'
          },
        },
        {
          path: '/accountManagement/role',
          name: 'role',
          component: (resolve) => require(['@/views/accountManagement/role.vue'], resolve),
          meta: {
            title: '角色管理'
          },
        },
        {
          path: '/accountManagement/roleAuthority',
          name: 'roleAuthority',
          component: (resolve) => require(['@/views/accountManagement/roleAuthority.vue'], resolve),
          meta: {
            title: '角色管理'
          },
        },
        {
          path: '/projectManagement/project',
          name: 'project',
          component: (resolve) => require(['@/views/projectManagement/project.vue'], resolve),
          meta: {
            title: '应用管理'
          },
        },
        {
          path: '/systemManagement/systemParam',
          name: 'systemParam',
          component: (resolve) => require(['@/views/systemManagement/systemParam.vue'], resolve),
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
