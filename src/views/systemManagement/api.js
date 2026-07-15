import {manage} from '@/axios'

// ====================================== 系统管理 ======================================
export function getSysParamList(data) {
  return manage.post('/sysParam/list', data)
}

export function getSysParamOptionList(data) {
  return manage.post('/sysParam/list', data)
}

export function modifySysParam(data) {
  return manage.post('/sysParam/modify', data)
}
