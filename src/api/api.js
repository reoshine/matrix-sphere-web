import request from '@/axios/index'

// 登录
export function login() {
  return request.get('/matrix-sphere-sso/sso/login')
}

export function logout() {
  return request.get('/matrix-sphere-sso/logout')
}

export function clientLogin() {
  return request.get('/matrix-sphere-sso/client/login')
}

export function authorize() {
  return request.get('/matrix-sphere-sso/client/login')
}

export function refreshToken(data) {
  return request.post('/matrix-sphere-sso/oauth2/token', data)
}

export function getMenuList(data) {
  return request.get(`/matrix-sphere-management/menu/getMenuList/${data}`)
}

// ====================================== 应用分组 ======================================
export function queryList(data) {
  return request.post('/matrix-sphere/projectGroup/queryList', data)
}

export function queryPage(data) {
  return request.post('/matrix-sphere/projectGroup/queryPage', data)
}

export function add(data) {
  return request.post('/matrix-sphere/projectGroup/add', data)
}

export function modifyById(data) {
  return request.post('/matrix-sphere/projectGroup/modifyById', data)
}

export function removeById(data) {
  return request.post(`/matrix-sphere/projectGroup/removeById/${data}`)
}

// ====================================== 应用列表 ======================================
export function queryProjectPage(data) {
  return request.post('/matrix-sphere/project/queryListPage', data)
}

export function exportProjectTemplate() {
  return request.get('/matrix-sphere/project/exportProjectTemplate', {
    params: {},
    responseType: 'blob'
  })
}

export function saveProject(data) {
  return request.post('/matrix-sphere/project/saveProject', data)
}

export function modifyProject(data) {
  return request.post('/matrix-sphere/project/modifyProject', data)
}

export function getProjectInfo(data) {
  return request.post('/matrix-sphere/project/getProjectInfo', data)
}

export function removeProject(data) {
  return request.post(`/matrix-sphere/project/removeProject/${data}`)
}

export function enableChange(data) {
  return request.post('/matrix-sphere/project/updateEnableStatus', data)
}

export function importFile(data, config) {
  return request.post('/matrix-sphere/project/importProject', data, config)
}

// ====================================== 分支管理 ======================================
export function getProjectById(data) {
  return request.post('/matrix-sphere/project/getProjectInfo', data)
}

export function getUnDeployedBranchList(data) {
  return request.post('/matrix-sphere/branch/getUnDeployedBranchList', data)
}

export function createBranch(data) {
  return request.post('/matrix-sphere/branch/createBranch', data)
}

export function modifyBranch(data) {
  return request.post('/matrix-sphere/branch/modifyBranch', data)
}

// ====================================== 应用部署 ======================================
export function getDeployMaster(data) {
  return request.post('/matrix-sphere/deploy/getDeployMaster', data)
}

export function getDeployRecord(data) {
  return request.post('/matrix-sphere/deploy/getDeployRecord', data)
}

export function withdrawBranch(data) {
  return request.post('/matrix-sphere/deploy/cancelDeploy', data)
}

export function deploy(data) {
  return request.post('/matrix-sphere/deploy/createDeploy', data)
}

export function removeBranch(data) {
  return request.post('/matrix-sphere/branch/removeBranch', data)
}

export function mergeBranch(data) {
  return request.post('/matrix-sphere/deploy/mergeBranch', data)
}

export function build(data) {
  return request.post('/matrix-sphere/deploy/build', data)
}

export function getDepLoyLogList(data) {
  return request.post('/matrix-sphere/deploy/getDepLoyLogList', data)
}

export function getDeployStepList(data) {
  return request.post('/matrix-sphere/deployStep/getDeployStepList', data)
}

export function sseClose(data) {
  return request.get(`/matrix-sphere/sse/close/${data}`)
}
