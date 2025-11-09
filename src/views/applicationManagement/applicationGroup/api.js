import { sphere } from '@/axios'

// ====================================== 应用分组 ======================================
export function queryList(data) {
    return sphere.post('/projectGroup/queryList', data)
}

export function queryPage(data) {
    return sphere.post('/projectGroup/queryPage', data)
}

export function add(data) {
    return sphere.post('/projectGroup/add', data)
}

export function modifyById(data) {
    return sphere.post('/projectGroup/modifyById', data)
}

export function removeById(data) {
    return sphere.post(`/projectGroup/removeById/${data}`)
}