import { sphere } from '@/axios'

// ====================================== 应用列表 ======================================
export function queryPage(data) {
    return sphere.post('/application/queryPage', data)
}

export function queryList(data) {
    return sphere.post('/application/queryList', data)
}

export function exportApplicationTemplate() {
    return sphere.get('/application/exportApplicationTemplate', {
        params: {},
        responseType: 'blob'
    })
}

export function saveApplication(data) {
    return sphere.post('/application/save', data)
}

export function modifyApplication(data) {
    return sphere.post('/application/modify', data)
}

export function getApplicationById(data) {
    return sphere.get(`/application/getById/${data}`)
}

export function removeApplication(data) {
    return sphere.post(`/application/remove/${data}`)
}

export function enableChange(data) {
    return sphere.post('/application/updateEnableStatus', data)
}

export function importFile(data, config) {
    return sphere.post('/application/importApplication', data, config)
}

// ====================================== 分支管理 ======================================

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
    return sphere.get(`/deploy/getDeployRecord/${data}`)
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