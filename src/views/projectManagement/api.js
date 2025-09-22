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

// ====================================== 应用列表 ======================================
export function queryProjectPage(data) {
    return sphere.post('/project/queryListPage', data)
}

export function exportProjectTemplate() {
    return sphere.get('/project/exportProjectTemplate', {
        params: {},
        responseType: 'blob'
    })
}

export function saveProject(data) {
    return sphere.post('/project/saveProject', data)
}

export function modifyProject(data) {
    return sphere.post('/project/modifyProject', data)
}

export function getProjectInfo(data) {
    return sphere.post('/project/getProjectInfo', data)
}

export function removeProject(data) {
    return sphere.post(`/project/remove/${data}`)
}

export function enableChange(data) {
    return sphere.post('/project/updateEnableStatus', data)
}

export function importFile(data, config) {
    return sphere.post('/project/importProject', data, config)
}

// ====================================== 分支管理 ======================================
export function getProjectById(data) {
    return sphere.post('/project/getProjectInfo', data)
}

export function getUnDeployedBranchList(data) {
    return sphere.post('/branch/getUnDeployedBranchList', data)
}

export function createBranch(data) {
    return sphere.post('/branch/createBranch', data)
}

export function modifyBranch(data) {
    return sphere.post('/branch/modifyBranch', data)
}

// ====================================== 应用部署 ======================================
export function getDeployMaster(data) {
    return sphere.post('/deploy/getDeployMaster', data)
}

export function getDeployRecord(data) {
    return sphere.post('/deploy/getDeployRecord', data)
}

export function withdrawBranch(data) {
    return sphere.post('/deploy/cancelDeploy', data)
}

export function deploy(data) {
    return sphere.post('/deploy/createDeploy', data)
}

export function removeBranch(data) {
    return sphere.post('/branch/removeBranch', data)
}

export function mergeBranch(data) {
    return sphere.post('/deploy/mergeBranch', data)
}

export function build(data) {
    return sphere.post('/deploy/build', data)
}

export function getDepLoyLogList(data) {
    return sphere.post('/deploy/getDepLoyLogList', data)
}

export function getDeployStepList(data) {
    return sphere.post('/deployStep/getDeployStepList', data)
}

export function sseClose(data) {
    return sphere.get(`/sse/close/${data}`)
}