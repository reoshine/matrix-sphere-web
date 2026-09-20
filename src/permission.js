import router from './router'
import store from './store'
import { redirectToAuthorization } from '@/auth/oauth'
import { getCurrentUser, normalizeAuthorityCodes } from '@/auth/user'
import { getCurrentUserMenuTree } from '@/views/accountManagement/api'

const whiteList = ['/login', '/callback', '/404', '/403']

async function loadMenus() {
    if (store.state.menus.length > 0) return
    try {
        const res = await getCurrentUserMenuTree()
        if (res.code === 200) {
            store.commit('SET_MENUS', res.data || [])
        }
    } catch (e) {
        console.warn('菜单加载失败', e)
    }
}

async function loadCurrentUser() {
    if (store.state.userContextLoaded) return
    const res = await getCurrentUser()
    store.commit('SET_AUTHORITIES', normalizeAuthorityCodes(res.authorities))
}

router.beforeEach(async (to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }

    const token = localStorage.getItem('adpSsoToken')

    if (whiteList.includes(to.path)) {
        if (token && to.path === '/login') {
            return next('/')
        }
        return next()
    }

    if (!token) {
        try {
            await redirectToAuthorization(to.fullPath)
        } catch (error) {
            console.error('OAuth2 授权跳转失败，回退到登录页', error)
            sessionStorage.setItem('target_route', to.fullPath)
            return next('/login')
        }
    } else {
        try {
            await loadCurrentUser()
            await loadMenus()
            next()
        } catch (error) {
            console.warn('用户权限上下文加载失败', error)
            next('/403')
        }
    }
})
