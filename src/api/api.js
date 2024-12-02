import axios from 'axios'
// import {urlPrefix} from '@/axios/Global'

// 登录
export function login() {
  return axios.get('/matrix-sphere-sso/sso/login')
}

export function logout() {
  return axios.get('/matrix-sphere-sso/logout')
}

export function clientLogin() {
  return axios.get('/matrix-sphere-sso/client/login')
}

export function authorize() {
  return axios.get('/matrix-sphere-sso/client/login')
}
export function getMenuList(data) {
  return axios.get(`/matrix-sphere-management/menu/getMenuList/${data}`)
}

// ====================================== 应用分组 ======================================
export function queryList(data) {
  return axios.post('/matrix-sphere/projectGroup/queryList', data)
}

export function queryPage(data) {
  return axios.post('/matrix-sphere/projectGroup/queryPage', data)
}

export function add(data) {
  return axios.post('/matrix-sphere/projectGroup/add', data)
}

export function modifyById(data) {
  return axios.post('/matrix-sphere/projectGroup/modifyById', data)
}

export function removeById(data) {
  return axios.post(`/matrix-sphere/projectGroup/removeById/${data}`)
}

// ====================================== 应用列表 ======================================
export function queryProjectPage(data) {
  return axios.post('/matrix-sphere/project/queryListPage', data)
}

export function exportProjectTemplate() {
  return axios.get('/matrix-sphere/project/exportProjectTemplate', {
    params: {},
    responseType: 'blob'
  })
}

export function saveProject(data) {
  return axios.post('/matrix-sphere/project/saveProject', data)
}

export function getProjectInfo(data) {
  return axios.post('/matrix-sphere/project/getProjectInfo', data)
}

export function removeProject(data) {
  return axios.post(`/matrix-sphere/project/removeProject/${data}`)
}

export function enableChange(data) {
  return axios.post('/matrix-sphere/project/updateEnableStatus', data)
}

export function importFile(data, config) {
  return axios.post('/matrix-sphere/project/importProject', data, config)
}

// ====================================== 分支管理 ======================================
export function getProjectById(data) {
  return axios.post('/matrix-sphere/project/getProjectInfo', data)
}

export function getUnDeployedBranchList(data) {
  return axios.post('/matrix-sphere/branch/getUnDeployedBranchList', data)
}

export function createBranch(data) {
  return axios.post('/matrix-sphere/branch/createBranch', data)
}

export function modifyBranch(data) {
  return axios.post('/matrix-sphere/branch/modifyBranch', data)
}

// ====================================== 应用部署 ======================================
export function getDeployMaster(data) {
  return axios.post('/matrix-sphere/deploy/getDeployMaster', data)
}

export function getDeployRecord(data) {
  return axios.post('/matrix-sphere/deploy/getDeployRecord', data)
}

export function withdrawBranch(data) {
  return axios.post('/matrix-sphere/deploy/cancelDeploy', data)
}

export function deploy(data) {
  return axios.post('/matrix-sphere/deploy/createDeploy', data)
}

export function removeBranch(data) {
  return axios.post('/matrix-sphere/branch/removeBranch', data)
}

export function mergeBranch(data) {
  return axios.post('/matrix-sphere/deploy/mergeBranch', data)
}

export function build(data) {
  return axios.post('/matrix-sphere/deploy/build', data)
}

export function getDepLoyLogList(data) {
  return axios.post('/matrix-sphere/deploy/getDepLoyLogList', data)
}

export function getDeployStepList(data) {
  return axios.post('/matrix-sphere/deployStep/getDeployStepList', data)
}

export function sseClose(data) {
  return axios.get(`/matrix-sphere/sse/close/${data}`)
}
