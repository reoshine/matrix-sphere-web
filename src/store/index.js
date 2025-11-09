// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    menus: [], // 存储从API获取的 *原始* 菜单
    hasAddedRoutes: false // 是否已动态添加路由
  },
  mutations: {
    SET_MENUS: (state, menus) => {
      state.menus = menus
    },
    SET_HAS_ADDED_ROUTES: (state, status) => {
      state.hasAddedRoutes = status
    }
  },
  actions: {
    // 可以在这里封装 getMenuList，但为简单起见，我们在 permission.js 中直接调用
  },
  getters: {
    menus: state => state.menus,
    hasAddedRoutes: state => state.hasAddedRoutes
  }
})

export default store