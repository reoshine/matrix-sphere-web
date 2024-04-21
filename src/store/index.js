import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    addAuditQuery: null
  },
  getters: {
  },
  mutations: {
    ADD_AUDIT_QUERY: (state, payload) => {
      state.addAuditQuery = payload
    }
  },
  actions: {
    addAuditQuery({commit}, data) {
      commit('ADD_AUDIT_QUERY', data)
    }
  },
  modules: {
  }
})
