import { manage } from '@/axios'

// ====================================== 用户管理 ======================================
export function getAccountPage(data) {
  return manage.post('/account/page', data)
}

export function addAccount(data) {
  return manage.post('/account/create', data)
}

export function getById(data) {
  return manage.get(`/account/${data}`)
}

export function modifyAccount(data) {
  return manage.post('/account/modify', data)
}

export function removeAccount(data) {
  return manage.post(`/account/remove/${data}`)
}

export function addAccountRole(data) {
  return manage.post('/account/role/add', data)
}

export function getAccountRoleByAccountId(data) {
  return manage.get(`/account/role/${data}`)
}

export function removeAccountRole(data) {
  return manage.post('/account/role/remove', data)
}

// ====================================== 角色管理 ======================================
export function getRoleById(data) {
  return manage.get(`/role/${data}`)
}

export function getRolePage(data) {
  return manage.post('/role/page', data)
}

export function modifyRole(data) {
  return manage.post('/role/modify', data)
}

export function addRole(data) {
  return manage.post('/role/create', data)
}

export function removeRole(data) {
  return manage.post(`/role/remove/${data}`)
}

export function addRoleMenu(data) {
  return manage.post('/role/menu/add', data)
}

export function getRoleMenuByRoleId(data) {
  return new Promise((resolve, reject) => {
    manage.get(`/role/menu/${data}`)
        .then(response => {
          resolve(response)
        }, err => {
          reject(err)
        })
  })
}

export function getRoleList() {
  return manage.get('/role/list')
}

export function replaceRoleAuthorities(roleId, authorityIds) {
  return manage.put(`/role/v1/${roleId}/authorities`, { authorityIds })
}

export function getRoleAuthorityIds(roleId) {
  return manage.get(`/role/v1/${roleId}/authorities`)
}

// ====================================== 权限管理 ======================================

export function getAuthorityById(data) {
  return manage.get(`/authority/${data}`)
}

export function getAuthorityPage(data) {
  return manage.post('/authority/page', data)
}

export function addAuthority(data) {
  return manage.post('/authority/create', data)
}

export function modifyAuthority(data) {
  return manage.post('/authority/modify', data)
}

export function removeAuthority(data) {
  return manage.post(`/authority/remove/${data}`)
}

export function getAuthorityList() {
  return manage.get('/authority/list')
}

// ====================================== 菜单管理 ======================================

export function getMenuList() {
  return manage.get('/menu/tree')
}

export function getCurrentUserMenuTree() {
  return manage.get('/menu/v1/current-user-tree')
}

export function getMenuById(data) {
  return manage.get(`/menu/${data}`)
}

export function modifyMenu(data) {
  return manage.post('/menu/modify', data)
}

export function addMenu(data) {
  return manage.post('/menu/create', data)
}

export function deleteMenu(data) {
  return manage.post(`/menu/remove/${data}`)
}
