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
