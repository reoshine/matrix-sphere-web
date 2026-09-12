import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        // ==================== 认证 ====================
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/login/index.vue'),
            meta: { title: '账号登录' }
        },
        {
            path: '/callback',
            name: 'SsoCallback',
            component: () => import('@/views/login/callback.vue'),
            meta: { title: '安全认证中' }
        },

        // ==================== 主布局 ====================
        {
            path: '/',
            redirect: '/dashboard',
            component: () => import('@/components/common/Home.vue'),
            meta: { title: 'MatrixSphere 系统' },
            children: [

                // ---------- 工作台 ----------
                {
                    path: 'dashboard',
                    component: () => import('@/views/dashboard/Dashboard.vue'),
                    meta: { title: '工作台' }
                },

                // ---------- 应用中心（新语义路径） ----------
                {
                    path: 'apps',
                    component: () => import('@/views/applicationManagement/applicationList/application.vue'),
                    meta: { title: '应用列表' }
                },
                {
                    path: 'apps/groups',
                    component: () => import('@/views/applicationManagement/applicationGroup/applicationGroup.vue'),
                    meta: { title: '应用分组' }
                },
                {
                    path: 'apps/templates',
                    component: () => import('@/views/applicationManagement/deployTemplate/templateManage.vue'),
                    meta: { title: '模板中心' }
                },
                {
                    path: 'apps/:id/edit',
                    name: 'appEdit',
                    component: () => import('@/views/applicationManagement/applicationList/applicationEdit.vue'),
                    meta: { title: '应用配置', hidden: true, parentPath: '/apps' }
                },

                // ---------- 部署中心（新语义路径） ----------
                {
                    path: 'deploy',
                    redirect: '/apps'
                },
                {
                    path: 'deploy/branches',
                    component: () => import('@/views/applicationManagement/branchManagement/branch.vue'),
                    meta: { title: '分支管理' }
                },
                {
                    path: 'deploy/:id',
                    name: 'appDeploy',
                    component: () => import('@/views/applicationManagement/applicationList/applicationDeploy.vue'),
                    meta: { title: '部署控制台', hidden: true, parentPath: '/apps' }
                },

                // ---------- 监控中心（新语义路径） ----------
                {
                    path: 'monitor/services',
                    component: () => import('@/views/serviceMonitor/serverManagement.vue'),
                    meta: { title: '服务状态' }
                },
                {
                    path: 'monitor/containers',
                    component: () => import('@/views/serviceMonitor/containerMonitor.vue'),
                    meta: { title: '容器监控' }
                },

                // ---------- 资源管理（新语义路径） ----------
                {
                    path: 'resources/repos',
                    component: () => import('@/views/repositoryManagement/gitRepository.vue'),
                    meta: { title: 'Git 仓库' }
                },
                {
                    path: 'resources/namespaces',
                    component: () => import('@/views/repositoryManagement/namespace.vue'),
                    meta: { title: '命名空间' }
                },
                {
                    path: 'resources/credentials',
                    component: () => import('@/views/credentialManagement/credential.vue'),
                    meta: { title: '凭据管理' }
                },

                // ---------- 系统设置（新语义路径） ----------
                {
                    path: 'settings/users',
                    component: () => import('@/views/accountManagement/account/account.vue'),
                    meta: { title: '用户列表' }
                },
                {
                    path: 'settings/roles',
                    component: () => import('@/views/accountManagement/role/role.vue'),
                    meta: { title: '角色权限' }
                },
                {
                    path: 'settings/menus',
                    component: () => import('@/views/accountManagement/menu/menu.vue'),
                    meta: { title: '菜单管理' }
                },
                {
                    path: 'settings/params',
                    component: () => import('@/views/systemManagement/systemParam.vue'),
                    meta: { title: '系统参数管理' }
                },

                // ==================== 旧路由（保持兼容，侧边栏 menuUrl 使用） ====================

                // 应用管理（旧路径）
                {
                    path: 'applicationManagement/applicationGroup/applicationGroup',
                    component: () => import('@/views/applicationManagement/applicationGroup/applicationGroup.vue'),
                    meta: { title: '应用分组' }
                },
                {
                    path: 'applicationManagement/applicationList/application',
                    component: () => import('@/views/applicationManagement/applicationList/application.vue'),
                    meta: { title: '应用列表' }
                },
                {
                    path: 'applicationManagement/applicationList/applicationEdit',
                    name: 'applicationEdit',
                    component: () => import('@/views/applicationManagement/applicationList/applicationEdit.vue'),
                    meta: { title: '应用编辑', hidden: true, parentPath: '/apps' }
                },
                {
                    path: 'applicationManagement/applicationList/applicationDeploy',
                    component: () => import('@/views/applicationManagement/applicationList/applicationDeploy.vue'),
                    meta: { title: '应用部署', hidden: true, parentPath: '/apps' }
                },
                {
                    path: 'applicationManagement/branchManagement/branch/:applicationId?',
                    name: 'branch',
                    component: () => import('@/views/applicationManagement/branchManagement/branch.vue'),
                    meta: { title: '分支管理', hidden: true, parentPath: '/apps' }
                },
                {
                    path: 'applicationManagement/deployTemplate/templateManage',
                    component: () => import('@/views/applicationManagement/deployTemplate/templateManage.vue'),
                    meta: { title: '系统模板' }
                },
                {
                    path: 'applicationManagement/deployTemplate/templateEditorDialog',
                    component: () => import('@/views/applicationManagement/deployTemplate/templateEditorDialog.vue'),
                    meta: { title: '模板编辑', hidden: true }
                },
                {
                    path: 'applicationManagement/deployTemplate/systemTemplateManage',
                    component: () => import('@/views/applicationManagement/deployTemplate/templateManage.vue'),
                    meta: { title: '系统模板' }
                },

                // 系统监控（旧路径）
                {
                    path: 'serviceMonitor/serverManagement',
                    component: () => import('@/views/serviceMonitor/serverManagement.vue'),
                    meta: { title: '服务器管理' }
                },
                {
                    path: 'serviceMonitor/serviceMonitor',
                    component: () => import('@/views/serviceMonitor/serviceMonitor.vue'),
                    meta: { title: '服务监控' }
                },
                {
                    path: 'serviceMonitor/containerMonitor',
                    component: () => import('@/views/serviceMonitor/containerMonitor.vue'),
                    meta: { title: '容器监控' }
                },

                // 仓库管理（旧路径）
                {
                    path: 'repositoryManagement/namespace',
                    component: () => import('@/views/repositoryManagement/namespace.vue'),
                    meta: { title: '命名空间' }
                },
                {
                    path: 'repositoryManagement/gitRepository',
                    component: () => import('@/views/repositoryManagement/gitRepository.vue'),
                    meta: { title: 'Git仓库' }
                },

                // 凭据管理（旧路径）
                {
                    path: 'credentialManagement/credential',
                    component: () => import('@/views/credentialManagement/credential.vue'),
                    meta: { title: '凭据列表' }
                },

                // 用户管理（旧路径）
                {
                    path: 'accountManagement/account',
                    component: () => import('@/views/accountManagement/account/account.vue'),
                    meta: { title: '用户列表' }
                },
                {
                    path: 'accountManagement/account/account',
                    component: () => import('@/views/accountManagement/account/account.vue'),
                    meta: { title: '用户列表' }
                },
                {
                    path: 'accountManagement/role',
                    component: () => import('@/views/accountManagement/role/role.vue'),
                    meta: { title: '角色管理' }
                },
                {
                    path: 'accountManagement/role/role',
                    component: () => import('@/views/accountManagement/role/role.vue'),
                    meta: { title: '角色管理' }
                },
                {
                    path: 'accountManagement/authority',
                    component: () => import('@/views/accountManagement/role/role.vue'),
                    meta: { title: '角色权限' }
                },
                {
                    path: 'accountManagement/authority/authority',
                    component: () => import('@/views/accountManagement/role/role.vue'),
                    meta: { title: '角色权限' }
                },
                {
                    path: 'accountManagement/menu/menu',
                    component: () => import('@/views/accountManagement/menu/menu.vue'),
                    meta: { title: '菜单管理' }
                },
                {
                    path: 'accountManagement/roleAuthority',
                    component: () => import('@/views/accountManagement/role/role.vue'),
                    meta: { title: '角色权限' }
                },
                {
                    path: 'accountManagement/roleAuthority/roleAuthority',
                    component: () => import('@/views/accountManagement/role/role.vue'),
                    meta: { title: '角色权限' }
                },

                // 系统管理（旧路径）
                {
                    path: 'systemManagement/systemParam',
                    component: () => import('@/views/systemManagement/systemParam.vue'),
                    meta: { title: '系统参数管理' }
                },

                // 项目管理（旧路径）
                {
                    path: 'project',
                    redirect: '/apps'
                },
                {
                    path: 'projectManagement/projectList',
                    component: () => import('@/views/projectManagement/project.vue'),
                    meta: { title: '项目列表' }
                },
                {
                    path: 'projectManagement/project',
                    component: () => import('@/views/projectManagement/project.vue'),
                    meta: { title: '项目列表' }
                },
            ]
        },

        // ==================== 错误页面 ====================
        {
            path: '/404',
            component: () => import('@/views/error/404.vue'),
            meta: { title: '页面找不到' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
