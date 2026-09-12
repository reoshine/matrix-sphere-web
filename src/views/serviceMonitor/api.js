import { sphere } from '@/axios'

/**
 * 获取服务器列表
 * GET /server-info/v1/list
 */
export function getServerList(params) {
    return sphere.get(`/server-info/v1/list`, {
        params: params
    })
}

/**
 * 获取服务器详情
 * GET /server-info/v1/{id}
 */
export function getServerDetail(id) {
    return sphere.get(`/server-info/v1/${id}`)
}

/**
 * 新增服务器
 * POST /server-info/v1/create
 */
export function addServer(data) {
    return sphere.post(`/server-info/v1/create`, data)
}

/**
 * 修改服务器
 * PUT /server-info/v1/modify
 */
export function updateServer(data) {
    return sphere.put(`/server-info/v1/modify`, data)
}

/**
 * 删除服务器
 * DELETE /server-info/v1/remove/{ids}
 */
export function deleteServer(ids) {
    return sphere.delete(`/server-info/v1/remove/${ids}`)
}

/**
 * 获取服务器实时资源指标
 * GET /server-info/v1/metrics/{id}
 */
export function getServerMetrics(id) {
    return sphere.get(`/server-info/v1/metrics/${id}`)
}
