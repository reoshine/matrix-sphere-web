// src/permission.js (最终形态 - 约定优于配置)
import router from './router'
import store from './store'
import { getMenuList } from '@/views/accountManagement/api'

// 1. 导入主布局 (所有页面都渲染在它内部)
const Layout = () => import('@/components/common/home.vue');

// 2. 导入404和视图丢失页面
const NotFound = () => import('@/views/error/404.vue');
const ViewNotFound = () => import('@/views/error/viewNotFound.vue'); // 兜底组件

const windows_default_suffix = ' | matrix-sphere';

/**
 * --------------------------------
 * 核心：路由构建器
 * --------------------------------
 */

/**
 * 帮助函数：根据 'menuUrl' 动态懒加载视图组件
 * @param {string} menuUrl - API返回的路径, e.g., "/applicationManagement/application"
 */
function loadView(menuUrl) {
    // 1. 移除 menuUrl 开头的 '/'
    // e.g., "/applicationManagement/application" -> "applicationManagement/application"
    const componentPath = menuUrl.startsWith('/') ? menuUrl.substring(1) : menuUrl;

    if (!componentPath) {
        console.warn(`无效的 componentPath: ${menuUrl}`);
        return ViewNotFound;
    }

    // 2. [核心约定] 动态 import
    // 这会查找 e.g., '@/views/applicationManagement/application.vue'
    //
    // (如果您的约定是 applicationManagement/applicationList/application.vue，
    //  您只需要在这里修改拼接逻辑，但我们假设是 1:1)
    return () => import(`@/views/${componentPath}.vue`).catch(err => {
        // 捕获 import 错误 (例如后端配了URL，但前端忘了创建文件)
        console.error(`组件加载失败: @/views/${componentPath}.vue`, err);
        return ViewNotFound; // 返回兜底组件，防止应用崩溃
    });
}

/**
 * 递归函数：将API菜单树转换为Vue-Router路由树
 * @param {Array} apiMenus - 从API获取的菜单
 * @returns {Array} - Vue-Router 'Route' objects
 */
function buildDynamicRoutes(apiMenus) {
    const routes = [];

    for (const menu of apiMenus) {
        // 1. 如果它是一个 "页面" (有 menuUrl)
        // (我们假设所有有 menuUrl 的都是页面，没有 menuUrl 的都是父目录)
        if (menu.menuUrl && menu.menuUrl.startsWith('/')) {
            // ---------------------------------
            // 关键修复：
            // ---------------------------------
            // 1. 将 menuUrl 转为小写，用于不区分大小写的比较
            const menuUrlLower = menu.menuUrl.toLowerCase();
            const route = {
                path: menu.menuUrl,
                component: loadView(menu.menuUrl), // [新] 直接用 menuUrl 加载
                name: menu.menuCode, // [保留] 依然推荐用 menuCode 作为 'name'
                // ---------------------------------------------------
                // [核心修复] 开启 Props 传参模式
                // 这样 URL 中的 query (applicationId=1) 就会变成组件的 prop
                // ---------------------------------------------------
                props: (route) => Object.assign({}, route.query, route.params),
                meta: {
                    title: menu.menuName,
                    icon: menu.icon,
                    hidden: menu.hidden || false,

                    // 2. [修复] 使用 menuUrlLower 进行比较
                    guidePath: menuUrlLower.includes('branch') ||
                        menuUrlLower.includes('deploy') || // 'Deploy' -> 'deploy'
                        menuUrlLower.includes('edit'),   // 'Edit' -> 'edit'
                    jumpPath: '/applicationManagement/applicationList/application',
                }
            };
            routes.push(route);
        }

        // 2. 无论当前项是否是页面，都递归它的子项
        if (menu.children && menu.children.length > 0) {
            // 这会将子菜单的路由 "平铺" 到 Layout 的 children 中
            routes.push(...buildDynamicRoutes(menu.children));
        }
    }
    return routes;
}

/**
 * (此函数简化)
 * 递归查找第一个可见页面
 */
function findFirstValidPage(apiMenus) {
    for (const menu of apiMenus) {
        // 只要是 !hidden 且有 menuUrl 的，就是目标
        if (menu.menuUrl && !menu.hidden) {
            return menu.menuUrl;
        }
        if (menu.children && menu.children.length > 0) {
            const firstChild = findFirstValidPage(menu.children);
            if (firstChild) {
                return firstChild;
            }
        }
    }
    return null;
}

// --------------------------------
// 全局路由守卫 (逻辑不变, 但调用了新的构建器)
// --------------------------------
router.beforeEach(async (to, from, next) => {
    if(to.meta.title) {
        document.title = to.meta.title + windows_default_suffix
    }
    const hasToken = localStorage.getItem("adpSsoToken");

    if (hasToken) {
        if (to.path === '/login') {
            next({ path: '/' });
        } else {
            const hasAddedRoutes = store.getters.hasAddedRoutes;
            if (hasAddedRoutes) {
                next();
            } else {
                try {
                    // 1. 获取菜单
                    const res = await getMenuList(2);
                    const apiMenus = res.data.body;

                    // 2. 构建动态子路由
                    const dynamicChildren = buildDynamicRoutes(apiMenus);

                    // ---------------------------------
                    // 关键修复：
                    // ---------------------------------
                    // 3. *先* 计算出默认重定向页面
                    const firstPage = findFirstValidPage(apiMenus);

                    // 4. 构建 *带 redirect* 的主路由
                    const mainRoute = {
                        path: '/',
                        component: Layout,
                        redirect: firstPage || '/', // 重定向到第一个有效页面
                        children: dynamicChildren
                    };

                    // 5. 添加路由
                    router.addRoutes([mainRoute]);
                    router.addRoutes([
                        { path: '*', component: NotFound }
                    ]);

                    // 6. 存入 Vuex
                    store.commit('SET_MENUS', apiMenus);
                    store.commit('SET_HAS_ADDED_ROUTES', true);

                    // 7. [重要] 保持 next({ ...to, replace: true })
                    // 这样，来自 login.vue 的 '/' 导航会重新执行
                    // 并自动被新添加的 'redirect' 规则捕获
                    next({ ...to, replace: true });

                } catch (error) {
                    console.error("动态路由构建失败: ", error);
                    localStorage.removeItem("adpSsoToken");
                    localStorage.removeItem("adpSsoRefreshToken");
                    next('/login');
                }
            }
        }
    } else {
        // ... (没有 token 的处理保持不变)
        if (to.path === '/login') {
            next();
        } else {
            next('/login');
        }
    }
});