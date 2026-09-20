import store from '@/store'

function normalizeRequiredAuthorities(value) {
  if (typeof value === 'string' && value) return [value]
  if (Array.isArray(value)) return value.filter(code => typeof code === 'string' && code)
  return []
}

function hasAllAuthorities(value) {
  const requiredAuthorities = normalizeRequiredAuthorities(value)
  return requiredAuthorities.length > 0 && requiredAuthorities.every(code => store.getters.hasAuthority(code))
}

/**
 * 安装业务权限可见性指令和组件权限查询 helper。
 * 服务端方法鉴权仍是最终安全边界。
 *
 * @param {import('vue')} Vue Vue 构造器
 */
export function installAuthority(Vue) {
  Vue.directive('authority', {
    inserted(el, binding) {
      if (!hasAllAuthorities(binding.value) && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  })

  Vue.prototype.$hasAuthority = code => store.getters.hasAuthority(code)
  Vue.prototype.$hasAllAuthorities = codes => hasAllAuthorities(codes)
}
