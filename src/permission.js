import router from './router'
import store from './store'
import { manage } from '@/axios'

// OAuth2 授权服务器配置
const SSO_CONFIG = {
    clientId: 'matrix-sphere',
    authorizeUrl: 'http://192.168.0.10:7002/oauth2/authorize',
    redirectUri: 'http://192.168.0.10:8081/callback',
}

const whiteList = ['/login', '/callback', '/404', '/403']

async function loadMenus() {
    if (store.state.menus.length > 0) return
    try {
        const res = await manage.get('/menu/tree')
        if (res.code === 200) {
            store.commit('SET_MENUS', res.data || [])
        }
    } catch (e) {
        console.warn('菜单加载失败', e)
    }
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
        sessionStorage.setItem('target_route', to.fullPath)
        const authUrl = `${SSO_CONFIG.authorizeUrl}?response_type=code&client_id=${SSO_CONFIG.clientId}&redirect_uri=${encodeURIComponent(SSO_CONFIG.redirectUri)}&scope=message.read`
        window.location.href = authUrl
    } else {
        await loadMenus()
        next()
    }
})
