// import sso from '@/axios/index'
// import manage from '@/axios/index'
// import sphere from '@/axios/index'

import { sso, manage, sphere } from '@/axios'

// 登录
export function authenticate(data) {
  return sphere.get(`/matrix-sphere-sso/oauth2/authorize?${data}`)
}

export function logout() {
  return sphere.get('/matrix-sphere-sso/logout')
}

export function clientLogin() {
  return sphere.get('/matrix-sphere-sso/client/login')
}

export function authorize() {
  return sphere.get('/matrix-sphere-sso/client/login')
}

export function refreshToken(data) {
  return sphere.post('/matrix-sphere-sso/oauth2/token', data)
}

export function getMenuList(data) {
  return manage.get(`/menu/getMenuList/${data}`)
}

// ====================================== 应用分组 ======================================
export function queryList(data) {
  return sphere.post('/projectGroup/queryList', data)
}

export function queryPage(data) {
  return sphere.post('/projectGroup/queryPage', data)
}

export function add(data) {
  return sphere.post('/matrix-sphere/projectGroup/add', data)
}

export function modifyById(data) {
  return sphere.post('/matrix-sphere/projectGroup/modifyById', data)
}

export function removeById(data) {
  return sphere.post(`/matrix-sphere/projectGroup/removeById/${data}`)
}

// ====================================== 应用列表 ======================================
export function queryProjectPage(data) {
  return sphere.post('/project/queryListPage', data)
}

export function exportProjectTemplate() {
  return sphere.get('/matrix-sphere/project/exportProjectTemplate', {
    params: {},
    responseType: 'blob'
  })
}

export function saveProject(data) {
  return sphere.post('/matrix-sphere/project/saveProject', data)
}

export function modifyProject(data) {
  return sphere.post('/matrix-sphere/project/modifyProject', data)
}

export function getProjectInfo(data) {
  return sphere.post('/matrix-sphere/project/getProjectInfo', data)
}

export function removeProject(data) {
  return sphere.post(`/matrix-sphere/project/removeProject/${data}`)
}

export function enableChange(data) {
  return sphere.post('/matrix-sphere/project/updateEnableStatus', data)
}

export function importFile(data, config) {
  return sphere.post('/matrix-sphere/project/importProject', data, config)
}

// ====================================== 分支管理 ======================================
export function getProjectById(data) {
  return sphere.post('/matrix-sphere/project/getProjectInfo', data)
}

export function getUnDeployedBranchList(data) {
  return sphere.post('/matrix-sphere/branch/getUnDeployedBranchList', data)
}

export function createBranch(data) {
  return sphere.post('/matrix-sphere/branch/createBranch', data)
}

export function modifyBranch(data) {
  return sphere.post('/matrix-sphere/branch/modifyBranch', data)
}

// ====================================== 应用部署 ======================================
export function getDeployMaster(data) {
  return sphere.post('/matrix-sphere/deploy/getDeployMaster', data)
}

export function getDeployRecord(data) {
  return sphere.post('/matrix-sphere/deploy/getDeployRecord', data)
}

export function withdrawBranch(data) {
  return sphere.post('/matrix-sphere/deploy/cancelDeploy', data)
}

export function deploy(data) {
  return sphere.post('/matrix-sphere/deploy/createDeploy', data)
}

export function removeBranch(data) {
  return sphere.post('/matrix-sphere/branch/removeBranch', data)
}

export function mergeBranch(data) {
  return sphere.post('/matrix-sphere/deploy/mergeBranch', data)
}

export function build(data) {
  return sphere.post('/matrix-sphere/deploy/build', data)
}

export function getDepLoyLogList(data) {
  return sphere.post('/matrix-sphere/deploy/getDepLoyLogList', data)
}

export function getDeployStepList(data) {
  return sphere.post('/matrix-sphere/deployStep/getDeployStepList', data)
}

export function sseClose(data) {
  return sphere.get(`/matrix-sphere/sse/close/${data}`)
}
