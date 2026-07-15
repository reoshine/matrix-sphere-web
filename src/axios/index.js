import axios from 'axios'
import router from '@/router'
import { Message, MessageBox } from 'element-ui'

let isRefreshing = false
let requestQueue = []

function createAxiosInstance(baseURL) {
    const instance = axios.create({
        baseURL: baseURL,
        timeout: 10000
    })

    instance.interceptors.request.use(
        config => {
            const token = localStorage.getItem('adpSsoToken')
            if (token) config.headers['Authorization'] = `Bearer ${token}`
            return config
        },
        error => Promise.reject(error)
    )

    instance.interceptors.response.use(
        response => {
            const res = response.data
            if (res.code && res.code !== 200) {
                Message.error(res.msg || res.message || '系统异常')
                return Promise.reject(new Error(res.msg || 'Error'))
            }
            return res
        },
        async error => {
            if (!error.response) return Promise.reject(error)
            const { status, config } = error.response

            if (status === 401) {
                const refreshToken = localStorage.getItem('adpSsoRefreshToken')
                if (!refreshToken) return triggerSsoLogin(config.url)

                if (isRefreshing) {
                    return new Promise(resolve => {
                        requestQueue.push((newToken) => {
                            config.headers['Authorization'] = `Bearer ${newToken}`
                            resolve(instance(config))
                        })
                    })
                }

                isRefreshing = true
                try {
                    const refreshRes = await axios.post('/oauth2/token',
                        new URLSearchParams({
                            grant_type: 'refresh_token',
                            refresh_token: refreshToken
                        }),
                        { headers: { 'Authorization': 'Basic ' + btoa('matrix-sphere:matrix-sphere-secret') } }
                    )

                    const newToken = refreshRes.data.access_token
                    const newRefreshToken = refreshRes.data.refresh_token

                    localStorage.setItem('adpSsoToken', newToken)
                    if (newRefreshToken) localStorage.setItem('adpSsoRefreshToken', newRefreshToken)

                    requestQueue.forEach(cb => cb(newToken))
                    requestQueue = []

                    config.headers['Authorization'] = `Bearer ${newToken}`
                    return instance(config)

                } catch (refreshError) {
                    requestQueue = []
                    return triggerSsoLogin(config.url)
                } finally {
                    isRefreshing = false
                }
            }
            return Promise.reject(error)
        }
    )

    return instance
}

function triggerSsoLogin(failedUrl) {
    localStorage.removeItem('adpSsoToken')
    localStorage.removeItem('adpSsoRefreshToken')

    // 静默跳转到 OAuth2 授权端点，不弹窗
    sessionStorage.setItem('target_route', router.currentRoute.fullPath)
    const SSO_CONFIG = {
        clientId: 'matrix-sphere',
        authorizeUrl: 'http://192.168.0.10:7002/oauth2/authorize',
        redirectUri: 'http://192.168.0.10:8081/callback',
    }
    const authUrl = `${SSO_CONFIG.authorizeUrl}?response_type=code&client_id=${SSO_CONFIG.clientId}&redirect_uri=${encodeURIComponent(SSO_CONFIG.redirectUri)}&scope=message.read`
    window.location.href = authUrl

    // 返回一个 pending 的 Promise，阻止后续请求
    return new Promise(() => {})
}

// 统一 API 实例，通过代理前缀区分模块
const services = {
    api: createAxiosInstance(''),
    sso: createAxiosInstance('/matrix-sphere-sso'),
    manage: createAxiosInstance('/matrix-sphere-management'),
    sphere: createAxiosInstance('/matrix-sphere')
}

export const { api, sso, manage, sphere } = services
export default services
