import { api } from '@/axios'

/**
 * 获取当前登录用户及其业务权限码。
 *
 * @returns {Promise<Object>} 当前用户响应
 */
export function getCurrentUser() {
  return api.get('/api/v1/auth/me')
}

/**
 * 将服务端权限响应规范化为去重后的字符串集合。
 *
 * @param {Array} authorities 服务端权限列表
 * @returns {Array<string>} 权限码列表
 */
export function normalizeAuthorityCodes(authorities) {
  if (!Array.isArray(authorities)) return []
  return [...new Set(authorities
    .map(item => typeof item === 'string' ? item : item && item.authority)
    .filter(code => typeof code === 'string' && code && !code.startsWith('SCOPE_')))]
}
