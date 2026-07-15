import { sphere } from '@/axios'

/**
 * 获取服务器列表
 * GET /serverInfo/v1/list
 */
export function getServerList(params) {
    return sphere.get(`/serverInfo/v1/list`, {
        params: params
    })
}

/**
 * 获取服务器详情
 * GET /serverInfo/v1/{id}
 */
export function getServerDetail(id) {
    return sphere.get(`/serverInfo/v1/${id}`)
}

/**
 * 新增服务器
 * POST /serverInfo/v1/create
 */
export function addServer(data) {
    return sphere.post(`/serverInfo/v1/create`, data)
}

/**
 * 修改服务器
 * PUT /serverInfo/v1/modify
 */
export function updateServer(data) {
    return sphere.put(`/serverInfo/v1/modify`, data)
}

/**
 * 删除服务器
 * DELETE /serverInfo/v1/remove/{ids}
 */
export function deleteServer(ids) {
    return sphere.delete(`/serverInfo/v1/remove/${ids}`)
}

/**
 * 测试连接
 * POST /serverInfo/v1/test-conn
 */
export function testServerConnection(data) {
    return sphere.post(`/serverInfo/v1/test-conn`, data)
}
