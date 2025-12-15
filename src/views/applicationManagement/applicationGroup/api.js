import { sphere } from '@/axios'

// ====================================== 应用分组 ======================================
export function queryList(data) {
    return sphere.post('/applicationGroup/queryList', data)
}

export function queryPage(data) {
    return sphere.post('/applicationGroup/queryPage', data)
}

export function add(data) {
    return sphere.post('/applicationGroup/add', data)
}

export function modify(data) {
    return sphere.post('/applicationGroup/modify', data)
}

export function remove(data) {
    return sphere.post(`/applicationGroup/remove/${data}`)
}