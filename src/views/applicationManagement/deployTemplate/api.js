import { sphere } from '@/axios'

// 获取系统模板列表
export function getTemplateList(query = {}) {
    const { templateType, jobType, keyword } = query
    return sphere.post('/deployTemplate/v1/list', { templateType, jobType, keyword })
}

// 获取模板详情
export function getTemplateDetail(id) {
    return sphere.get(`/deployTemplate/v1/${id}`)
}

// 创建模板
export function createTemplate(data) {
    return sphere.post(`/deployTemplate/v1/create`, data)
}

// 更新模板
export function updateTemplate(data) {
    return sphere.post(`/deployTemplate/v1/modify`, data)
}

// 删除模板
export function deleteTemplate(id) {
    return sphere.delete(`/deployTemplate/v1/${id}`)
}
