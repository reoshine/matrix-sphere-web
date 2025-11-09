import {manage} from '@/axios'

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
