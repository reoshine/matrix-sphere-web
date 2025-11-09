// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      title: '登录matrix-sphere运维部署平台'
    }
  },
]

// 删除了所有 asyncRoutes

const createRouter = () => new Router({
  routes: constantRoutes,
  mode: 'history',
  linkActiveClass: 'active'
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router