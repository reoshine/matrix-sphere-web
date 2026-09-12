import { sphere } from '@/axios'

// ====================================== 应用列表 ======================================
export function queryPage(data) {
    return sphere.post('/application/v1/page', data)
}

export function queryList(data) {
    return sphere.post('/application/v1/list', data)
}

export function saveApplication(data) {
    return sphere.post('/application/v1/create', data)
}

export function modifyApplication(data) {
    return sphere.post('/application/v1/modify', data)
}

export function getApplicationById(data) {
    return sphere.get(`/application/v1/${data}`)
}

export function removeApplication(data) {
    return sphere.post(`/application/v1/remove/${data}`)
}

export function enableChange(data) {
    return sphere.post('/application/v1/update-enable-status', data)
}

// ====================================== 分支管理 ======================================

export function getUnDeployedBranchList(data) {
    return sphere.post('/branch/v1/list', data)
}

export function createBranch(data) {
    return sphere.post('/branch/v1/create', data)
}

export function modifyBranch(data) {
    return sphere.post('/branch/v1/modify', data)
}

// ====================================== 应用部署 ======================================
export function getDeployMaster(data) {
    return sphere.post('/deploy/v1/getDeployMaster', data)
}

export function getDeployRecord(data) {
    return sphere.get(`/deploy/v1/getDeployRecord/${data}`)
}

export function deploy(data) {
    return sphere.post('/deploy/v1/createDeploy', data)
}

export function removeBranch(data) {
    return sphere.post(`/branch/v1/remove/${data}`)
}

export function getDepLoyLogList(data) {
    return sphere.post('/deploy/v1/getDepLoyLogList', data)
}

export function getDeployStepList(data) {
    return sphere.post('/deployStep/v1/getDeployStepList', data)
}

export function retryDeploy(data) {
    return sphere.post(`/deploy/v1/retryDeploy/${data}`)
}

export function sseClose(data) {
    return sphere.get(`/sse/v1/close/${data}`)
}
