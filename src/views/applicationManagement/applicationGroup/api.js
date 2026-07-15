import { sphere } from '@/axios'

// ====================================== 应用分组 ======================================
export function queryList(data) {
    return sphere.post('/applicationGroup/v1/list', data)
}

export function queryPage(data) {
    return sphere.post('/applicationGroup/v1/page', data)
}

export function add(data) {
    return sphere.post('/applicationGroup/v1/create', data)
}

export function modify(data) {
    return sphere.post('/applicationGroup/v1/modify', data)
}

export function remove(data) {
    return sphere.post(`/applicationGroup/v1/remove/${data}`)
}
