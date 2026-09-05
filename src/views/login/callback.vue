<template>
  <div class="callback-container">
    <div class="loading-box">
      <i class="el-icon-loading"></i>
      <p>正在进行安全验证，请稍候...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { manage } from '@/axios'
import store from '@/store'
import { MessageBox } from 'element-ui'

export default {
  name: 'SsoCallback',
  created() {
    this.handleCallback()
  },
  methods: {
    async handleCallback() {
      // 1. 从 URL 获取 SSO 传回来的 code
      const code = this.$route.query.code

      if (!code) return // 如果没有code直接返回，不弹窗，防止二次执行报错

      window.isProcessingToken = true; // 锁定
      this.$router.replace({ query: {} }); // 立即抹掉 URL 中的 code

      try {
        // 2. 发起请求换取 Token
        // 注意：这里必须用原生 axios，不要用封装好的 service，以免触发 401 拦截
        const res = await axios.post('/oauth2/token',
            new URLSearchParams({
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: 'http://192.168.0.10:8081/callback' // 必须与发 code 时的 uri 一字不差
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Basic Auth (client_id:client_secret 的 base64)
                'Authorization': 'Basic ' + btoa('matrix-sphere:matrix-sphere-secret')
              }
            }
        )

        // 3. 将真实 Token 存入缓存
        const { access_token, refresh_token } = res.data
        localStorage.setItem('adpSsoToken', access_token)
        if (refresh_token) {
          localStorage.setItem('adpSsoRefreshToken', refresh_token)
        }

        // 5. 加载菜单数据到 Vuex store
        try {
          const menuRes = await manage.get('/menu/tree')
          if (menuRes.code === 200) {
            store.commit('SET_MENUS', menuRes.data || [])
          }
        } catch (e) {
          console.warn('菜单加载失败，不影响登录', e)
        }

        // 6. 跳转目标页面
        const targetRoute = sessionStorage.getItem('target_route') || '/'
        sessionStorage.removeItem('target_route')

        this.$router.replace(targetRoute)

      } catch (error) {
        console.error('获取Token失败', error)
        MessageBox.alert('授权码已过期或非法', '认证失败', {
          type: 'error',
          callback: () => {
            // 换取失败，重新触发一次 SSO 登录
            localStorage.removeItem('adpSsoToken')
            window.location.reload()
          }
        })
      } finally {
        window.isProcessingToken = false; // 释放
      }
    }
  }
}
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--color-bg-page);
}
.loading-box {
  text-align: center;
  font-size: 20px;
  color: var(--color-primary);
}
.loading-box i {
  font-size: 40px;
  margin-bottom: 15px;
}
</style>
