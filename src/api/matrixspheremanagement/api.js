import { sso, manage, sphere } from '@/axios'

export function login() {
  return sso.get('/matrix-sphere-sso/sso/login')
}

export function logout() {
  return sso.get('/matrix-sphere-sso/logout')
}

export function authorize() {
  return sso.get("/matrix-sphere-sso/client/login")
}

// ====================================== 系统管理 ======================================
export function getSysParamList(data) {
  return manage.post('/sysParam/getSysParamList', data)
}

export function getSysParamOptionList(data) {
  return manage.post('/sysParam/getSysParamOptionList', data)
}

export function modifySysParam(data) {
  return manage.post('/sysParam/modifySysParam', data)
}

// ====================================== 用户管理 ======================================
export function getAccountPage(data) {
  return manage.post('/account/getAccountPage', data)
}

export function addAccount(data) {
  return manage.post('/account/addAccount', data)
}

export function getById(data) {
  return manage.post(`/account/getById/${data}`)
}

export function modifyAccount(data) {
  return manage.post('/account/modifyAccount', data)
}

export function removeAccount(data) {
  return manage.post(`/account/removeAccount/${data}`)
}

export function getMenuList(data) {
  return manage.get(`/menu/getMenuList/${data}`)
}

export function addAccountRole(data) {
  return manage.post('/account/addAccountRole', data)
}

export function getAccountRoleByAccountId(data) {
  return manage.get(`/account/getAccountRoleByAccountId/${data}`)
}

export function removeAccountRole(data) {
  return manage.post('/account/removeAccountRole', data)
}

// ====================================== 角色管理 ======================================
export function getRoleById(data) {
  return manage.get(`/role/getById/${data}`)
}

export function getRolePage(data) {
  return manage.post('/role/getRolePage', data)
}

export function modifyRole(data) {
  return manage.post('/role/modifyRole', data)
}

export function addRole(data) {
  return manage.post('/role/addRole', data)
}

export function removeRole(data) {
  return manage.post(`/role/removeRole/${data}`)
}

export function addRoleMenu(data) {
  return manage.post('/role/addRoleMenu', data)
}

export function getRoleMenuByRoleId(data) {
  return new Promise((resolve, reject) => {
    manage.get(`/role/getRoleMenuByRoleId/${data}`)
        .then(response => {
      resolve(response)
    }, err => {
      reject(err)
    })
  })
}

export function getRoleList() {
  return manage.get('/role/getRoleList')
}

// ====================================== 权限管理 ======================================

export function getAuthorityById(data) {
  return manage.get(`/authority/getById/${data}`)
}

export function getAuthorityPage(data) {
  return manage.post('/authority/getAuthorityPage', data)
}

export function addAuthority(data) {
  return manage.post('/authority/addAuthority', data)
}

export function modifyAuthority(data) {
  return manage.get('/authority/modifyAuthority', data)
}

export function removeAuthority(data) {
  return manage.get(`/authority/removeAuthority/${data}`)
}

// ====================================== 应用管理 ======================================
export function getProjectPage(data) {
  return manage.post('/project/getProjectPage', data)
}

export function getProjectById(data) {
  return manage.get(`/project/getById/${data}`)
}

export function saveProject(data) {
  return manage.post('/project/saveProject', data)
}

export function modifyProject(data) {
  return manage.post('/project/modifyProject', data)
}

export function removeProject(data) {
  return manage.post(`/project/removeProject/${data}`)
}
