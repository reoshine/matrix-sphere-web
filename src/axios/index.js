import axios from 'axios'
import swal from 'sweetalert2'
import router from "@/router"

// 创建实例工厂函数
const createRequest = (baseURL = '/') => {
    const instance = axios.create({
        baseURL,
        timeout: 1500000,
        headers: {
            'Content-Type': 'application/json'
        }
    })

    // 请求拦截器
    instance.interceptors.request.use(config => {
        const token = localStorage.getItem('adpSsoToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    // 响应拦截器（关键修正点）
    instance.interceptors.response.use(
        response => {
            if (response.config.url === '/client/login') {
                services.sphere.get('/client/login')
                return response
            }
            if (response?.data?.code === 4003) {
                removeToken()
                return refreshToken(response.config, instance)
            }
            return response
        }
    )

    return instance
}

// 创建各业务模块实例
const services = {
    sso: createRequest('/matrix-sphere-sso'),
    manage: createRequest('/matrix-sphere-management'),
    sphere: createRequest('/matrix-sphere')
}

// 统一刷新token逻辑（修改版）
async function refreshToken(config, currentInstance) {
    const refreshToken = localStorage.getItem("adpSsoRefreshToken")
    if (!refreshToken) {
        toLogin()
        return Promise.reject('无刷新令牌')
    }

    try {
        // 使用sso实例刷新token
        const refreshRes = await services.sso.post('/oauth2/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa('matrix-sphere:matrix-sphere-secret')
                }
            }
        )

        // 更新所有实例的token（关键修改）
        //const newAccessToken = refreshRes.data.access_token
        //updateAllInstancesToken(newAccessToken)

        // 重试原始请求
        //config.headers.Authorization = `Bearer ${newAccessToken}`
        return currentInstance(config)

    } catch (refreshError) {
        removeToken()
        toLogin()
        return Promise.reject(refreshError)
    }
}

// 更新所有实例的token（新增工具方法）
function updateAllInstancesToken(newToken) {
    Object.values(services).forEach(instance => {
        instance.defaults.headers.common.Authorization = `Bearer ${newToken}`
    })
}

// 工具函数
function removeToken() {
    localStorage.removeItem('adpSsoToken')
    localStorage.removeItem('adpSsoRefreshToken')
}

function toLogin() {
    swal.fire({
        title: '登录已失效，请重新登录！',
        icon: 'error',
        timer: 2500,
        showConfirmButton: false,
        showCancelButton: false
    }).finally(() => {
        // router.push({path: '/login'})
        router.push({path: '/matrix-sphere/client/login'})
        window.location.reload()
        //services.sphere.get('/client/login')
    })
}

export const {sso, manage, sphere} = services