import axios from 'axios'
import router from '@/router'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

let isRefreshing = false
let requestQueue = []

function getResponseHeader(headers, name) {
    if (!headers) return ''
    if (typeof headers.get === 'function') return headers.get(name) || ''
    return headers[name.toLowerCase()] || headers[name] || ''
}

function normalizeApiError(error, response = error && error.response) {
    const data = response && response.data
    const payload = data && typeof data === 'object' ? data : {}
    const httpStatus = (response && response.status) || 0

    return {
        message: payload.message || payload.msg || (typeof data === 'string' ? data : '') || (error && error.message) || '网络请求失败，请稍后重试',
        code: payload.code !== undefined ? payload.code : httpStatus,
        requestId: getResponseHeader(response && response.headers, 'X-Request-Id'),
        httpStatus,
        cause: error
    }
}

function createAxiosInstance(baseURL) {
    const instance = axios.create({
        baseURL: baseURL,
        timeout: 10000
    })

    instance.interceptors.request.use(
        config => {
            NProgress.start()
            const token = localStorage.getItem('adpSsoToken')
            if (token) config.headers['Authorization'] = `Bearer ${token}`
            return config
        },
        error => {
            NProgress.done()
            return Promise.reject(normalizeApiError(error))
        }
    )

    instance.interceptors.response.use(
        response => {
            NProgress.done()
            const res = response.data
            if (res && res.code !== undefined && res.code !== 200) {
                const apiError = normalizeApiError(null, response)
                Message.error(apiError.message)
                return Promise.reject(apiError)
            }
            return res
        },
        async error => {
            NProgress.done()
            if (!error.response) return Promise.reject(normalizeApiError(error))
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
            return Promise.reject(normalizeApiError(error))
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
        authorizeUrl: 'http://192.168.0.10:7002/matrix-sphere/oauth2/authorize',
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
