import { sphere } from '@/axios'

// 获取应用下的模板列表
export function getTemplateList(data) {
    // 兼容逻辑：如果传的是数字/字符串，视为 applicationId；如果是对象，视为查询参数
    let query;
    if (typeof data === 'object') {
        query = data;
    } else {
        query = { applicationId: params, scope: 'APP' };
    }

    return sphere.post(`/deployTemplate/list`, query)
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
    return sphere.post(`/deployTemplate/update`, data)
}

// 删除模板
export function deleteTemplate(id) {
    return sphere.delete(`/deployTemplate/${id}`)
}