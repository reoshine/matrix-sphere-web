import { sphere } from '@/axios'

// ====================================== 工作台 Dashboard ======================================

/**
 * 获取 Dashboard 统计数据
 * 后端 API 就绪后取消注释，删除 mock 分支
 */
export function getDashboardStats() {
    // TODO: 后端提供聚合统计 API 后启用
    // return sphere.get('/dashboard/v1/stats')
    return Promise.reject(new Error('API not ready'))
}

/**
 * 获取最近部署记录
 */
export function getRecentDeploys() {
    // TODO: 后端提供全局部署记录 API 后启用
    // return sphere.get('/dashboard/v1/recent-deploys')
    return Promise.reject(new Error('API not ready'))
}

/**
 * 获取活跃应用列表
 */
export function getActiveApps() {
    // TODO: 后端提供活跃应用 API 后启用
    // return sphere.get('/dashboard/v1/active-apps')
    return Promise.reject(new Error('API not ready'))
}
