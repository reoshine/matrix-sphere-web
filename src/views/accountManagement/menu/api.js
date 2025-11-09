import { manage } from '@/axios'

// ====================================== 角色管理 ======================================

export function getMenuList(data) {
  return manage.get(`/menu/getMenuList/${data}`)
}

export function getMenuById(data) {
  return manage.get(`/menu/getMenuById/${data}`)
}

export function modifyMenu(data) {
  return manage.post('/menu/modifyMenu', data)
}
