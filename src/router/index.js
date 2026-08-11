import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/login/index.vue'),
            meta: { title: '账号登录' }
        },
        {
            path: '/',
            component: () => import('@/components/common/Home.vue'),
            meta: { title: 'MatrixSphere 系统' },
            children: [
                // 项目管理（默认跳转到应用列表）
                { path: '/project', redirect: '/applicationManagement/applicationList/application' },

                // 应用管理
                { path: '/applicationManagement/applicationGroup/applicationGroup', component: () => import('@/views/applicationManagement/applicationGroup/applicationGroup.vue'), meta: { title: '应用分组' } },
                { path: '/applicationManagement/applicationList/application', component: () => import('@/views/applicationManagement/applicationList/application.vue'), meta: { title: '应用列表' } },
                { path: '/applicationManagement/applicationList/applicationEdit', component: () => import('@/views/applicationManagement/applicationList/applicationEdit.vue'), meta: { title: '应用编辑', hidden: true } },
                { path: '/applicationManagement/applicationList/applicationDeploy', component: () => import('@/views/applicationManagement/applicationList/applicationDeploy.vue'), meta: { title: '应用部署', hidden: true, parentPath: '/applicationManagement/applicationList/application' } },
                { path: '/applicationManagement/branchManagement/branch/:applicationId?', name: 'branch', component: () => import('@/views/applicationManagement/branchManagement/branch.vue'), meta: { title: '分支管理', hidden: true } },
                { path: '/applicationManagement/deployTemplate/templateManage', component: () => import('@/views/applicationManagement/deployTemplate/templateManage.vue'), meta: { title: '部署模板管理' } },
                { path: '/applicationManagement/deployTemplate/templateEditorDialog', component: () => import('@/views/applicationManagement/deployTemplate/templateEditorDialog.vue'), meta: { title: '模板编辑', hidden: true } },
                { path: '/applicationManagement/deployTemplate/systemTemplateManage', component: () => import('@/views/applicationManagement/deployTemplate/systemTemplateManage.vue'), meta: { title: '系统模板' } },

                // 系统监控
                { path: '/server-management', component: () => import('@/views/serviceMonitor/serverManagement.vue'), meta: { title: '服务器管理' } },
                { path: '/serviceMonitor/serverManagement', component: () => import('@/views/serviceMonitor/serverManagement.vue'), meta: { title: '服务器管理' } },
                { path: '/serviceMonitor/serviceMonitor', component: () => import('@/views/serviceMonitor/serviceMonitor.vue'), meta: { title: '服务监控' } },
                { path: '/serviceMonitor/containerMonitor', component: () => import('@/views/serviceMonitor/containerMonitor.vue'), meta: { title: '容器监控' } },

                // 仓库管理
                { path: '/repositoryManagement/namespace', component: () => import('@/views/repositoryManagement/namespace.vue'), meta: { title: '命名空间' } },
                { path: '/repositoryManagement/gitRepository', component: () => import('@/views/repositoryManagement/gitRepository.vue'), meta: { title: 'Git仓库' } },

                // 凭据管理
                { path: '/credentialManagement/credential', component: () => import('@/views/credentialManagement/credential.vue'), meta: { title: '凭据列表' } },

                // 用户管理（admin 模块）
                { path: '/accountManagement/account', component: () => import('@/views/accountManagement/account/account.vue'), meta: { title: '用户列表' } },
                { path: '/accountManagement/account/account', component: () => import('@/views/accountManagement/account/account.vue'), meta: { title: '用户列表' } },
                { path: '/accountManagement/role', component: () => import('@/views/accountManagement/role/role.vue'), meta: { title: '角色管理' } },
                { path: '/accountManagement/role/role', component: () => import('@/views/accountManagement/role/role.vue'), meta: { title: '角色管理' } },
                { path: '/accountManagement/authority', component: () => import('@/views/accountManagement/authority/authority.vue'), meta: { title: '权限管理' } },
                { path: '/accountManagement/authority/authority', component: () => import('@/views/accountManagement/authority/authority.vue'), meta: { title: '权限管理' } },
                { path: '/accountManagement/menu/menu', component: () => import('@/views/accountManagement/menu/menu.vue'), meta: { title: '菜单管理' } },
                { path: '/accountManagement/roleAuthority', component: () => import('@/views/accountManagement/roleAuthority/roleAuthority.vue'), meta: { title: '角色权限分配' } },
                { path: '/accountManagement/roleAuthority/roleAuthority', component: () => import('@/views/accountManagement/roleAuthority/roleAuthority.vue'), meta: { title: '角色权限分配' } },

                // 系统管理
                { path: '/systemManagement/systemParam', component: () => import('@/views/systemManagement/systemParam.vue'), meta: { title: '系统参数管理' } },
            ]
        },
        {
            path: '/callback',
            name: 'SsoCallback',
            component: () => import('@/views/login/callback.vue'),
            meta: { title: '安全认证中' }
        },
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