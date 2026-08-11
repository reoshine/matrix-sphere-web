import { sphere } from '@/axios'

/**
 * 获取 Git 仓库列表（关联应用信息）
 */
export function getGitRepoList() {
    return sphere.get('/git-repo/v1/list')
}

/**
 * 查询远程仓库项目详情
 */
export function getProjectInfo(applicationId) {
    return sphere.get(`/git-repo/v1/project/${applicationId}`)
}

/**
 * 从 Git URL 刷新项目 ID
 */
export function refreshProjectId(applicationId) {
    return sphere.post(`/git-repo/v1/refresh/${applicationId}`)
}
