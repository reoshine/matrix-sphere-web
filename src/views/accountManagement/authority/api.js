import { manage } from '@/axios'

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
