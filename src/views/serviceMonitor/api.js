import { sphere } from '@/axios'

/**
 * 获取服务器列表
 * GET /serverInfo/list
 */
export function getServerList(params) {
    return sphere.get(`/serverInfo/list`, {
        params: params
    })
}

/**
 * 获取服务器详情
 * GET /serverInfo/{id}
 */
export function getServerDetail(id) {
    return sphere.get(`/serverInfo/${id}`)
}

/**
 * 新增服务器
 * POST /serverInfo
 */
export function addServer(data) {
    return sphere.post(`/serverInfo`, data)
}

/**
 * 修改服务器
 * PUT /serverInfo
 */
export function updateServer(data) {
    return sphere.put(`/serverInfo`, data)
}

/**
 * 删除服务器
 * DELETE /serverInfo/{ids}
 */
export function deleteServer(ids) {
    return sphere.delete(`/serverInfo/${ids}`)
}

/**
 * 测试连接
 * POST /serverInfo/test-conn
 */
export function testServerConnection(data) {
    return sphere.post(`/serverInfo/test-conn`, data)
}