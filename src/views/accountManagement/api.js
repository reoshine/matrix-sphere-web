import { manage } from '@/axios'

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

// ====================================== 菜单管理 ======================================

export function getMenuList(data) {
  return manage.get(`/menu/getMenuList/${data}`)
}

export function getMenuById(data) {
  return manage.get(`/menu/getMenuById/${data}`)
}

export function modifyMenu(data) {
  return manage.post('/menu/modifyMenu', data)
}