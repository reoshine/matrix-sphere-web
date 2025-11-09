import { manage } from '@/axios'
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
