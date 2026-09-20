import {manage} from '@/axios'

// ====================================== 系统管理 ======================================
export function getSysParamList(data) {
  return manage.post('/sysParam/list', data)
}

export function createSysParam(data) {
  return manage.post('/sysParam/v1/create', data)
}

export function modifySysParam(data) {
  return manage.post('/sysParam/modify', data)
}

export function removeSysParam(id) {
  return manage.post(`/sysParam/v1/remove/${id}`)
}
