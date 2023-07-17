import axios from 'axios'

// 登录
export function login(data) {
  return axios.post('/adp-sso/oauth/token', data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    auth: {
      username: "oauth2-client-1",
      password: "oauth2-client-1",
    }
  })
}

// 测试请求
export function getDbTypeList() {
  return axios.get('/adp-matrix/adp-matrix/getMenuList');
}

// ====================================== 应用列表 ======================================
export function queryProjectPage(data) {
  return axios.post('/adp-matrix/project/queryListPage', data)
}

export function saveProject(data) {
  return axios.post('/adp-matrix/project/saveProject', data)
}

export function getProjectInfo(data) {
  return axios.post('/adp-matrix/project/getProjectInfo', data)
}

export function removeProject(data) {
  return axios.post(`/adp-matrix/project/removeProject/${data}`)
}

export function enableChange(data) {
  return axios.post('/adp-matrix/project/updateEnableStatus', data)
}

// ====================================== 分支管理 ======================================
export function getProjectById(data) {
  return axios.post('/adp-matrix/project/getProjectInfo', data)
}

export function getUnDeployedBranchList(data) {
  return axios.post('/adp-matrix/branch/getUnDeployedBranchList', data)
}

export function createBranch(data) {
  return axios.post('/adp-matrix/branch/createBranch', data)
}

export function modifyBranch(data) {
  return axios.post('/adp-matrix/branch/modifyBranch', data)
}

// ====================================== 应用部署 ======================================
export function getDeployMaster(data) {
  return axios.post('/adp-matrix/deploy/getDeployMaster', data)
}

export function getDeployRecord(data) {
  return axios.post('/adp-matrix/deploy/getDeployRecord', data)
}

export function withdrawBranch(data) {
  return axios.post('/adp-matrix/deploy/cancelDeploy', data)
}

export function deploy(data) {
  return axios.post('/adp-matrix/deploy/createDeploy', data)
}

export function removeBranch(data) {
  return axios.post('/adp-matrix/branch/removeBranch', data)
}

export function mergeBranch(data) {
  return axios.post('/adp-matrix/deploy/mergeBranch', data)
}

export function build(data) {
  return axios.post('/adp-matrix/deploy/build', data)
}
