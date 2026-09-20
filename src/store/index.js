// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    menus: [], // 存储后端按当前用户权限过滤后的菜单树
    authorities: [], // 当前登录用户的业务权限码
    userContextLoaded: false,
    hasAddedRoutes: false // 是否已动态添加路由
  },
  mutations: {
    SET_MENUS: (state, menus) => {
      state.menus = menus
    },
    SET_AUTHORITIES: (state, authorities) => {
      state.authorities = authorities
      state.userContextLoaded = true
    },
    SET_HAS_ADDED_ROUTES: (state, status) => {
      state.hasAddedRoutes = status
    }
  },
  actions: {
    // 菜单由 permission.js 在认证后通过 current-user-tree 加载
  },
  getters: {
    menus: state => state.menus,
    authorities: state => state.authorities,
    hasAuthority: state => code => state.authorities.includes(code),
    hasAllAuthorities: state => codes => Array.isArray(codes) && codes.every(code => state.authorities.includes(code)),
    hasAddedRoutes: state => state.hasAddedRoutes
  }
})

export default store
