import { sphere } from '@/axios'

/**
 * 获取工作台聚合数据
 *
 * @param {{ recentLimit?: number, activeLimit?: number }} params 查询参数
 */
export function getDashboardOverview(params = {}) {
    return sphere.get('/dashboard/v1/overview', { params })
}
