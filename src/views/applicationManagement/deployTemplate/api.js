import { sphere } from '@/axios'

// 获取应用下的模板列表
export function getTemplateList(applicationId) {
    return sphere.get(`/deployTemplate/list/${applicationId}`)
}

// 获取模板详情
export function getTemplateDetail(id) {
    return sphere.get(`/deployTemplate/${id}`)
}

// 创建模板
export function createTemplate(data) {
    return sphere.post(`/deployTemplate/create`, data)
}

// 更新模板
export function updateTemplate(data) {
    return sphere.post(`/deployTemplate/update/${data.id}`, data)
}

// 删除模板
export function deleteTemplate(id) {
    return sphere.delete(`/deployTemplate/${id}`)
}