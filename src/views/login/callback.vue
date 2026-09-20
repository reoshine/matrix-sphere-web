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
import store from '@/store'
import { MessageBox } from 'element-ui'
import { runtimeConfig } from '@/config/runtime'
import { clearAuthentication, consumeAuthorizationRequest, redirectToAuthorization } from '@/auth/oauth'
import { getCurrentUserMenuTree } from '@/views/accountManagement/api'
import { getCurrentUser, normalizeAuthorityCodes } from '@/auth/user'

function authenticationErrorMessage(error) {
  const oauthError = error.response && error.response.data && error.response.data.error
  const errorDescription = error.response && error.response.data && error.response.data.error_description

  if (oauthError === 'invalid_grant') {
    return '授权码无效或 PKCE 校验失败，请重新登录'
  }
  if (oauthError === 'invalid_client') {
    return 'OAuth2 客户端配置无效，请联系管理员'
  }
  if (oauthError === 'invalid_request') {
    return errorDescription || 'Token 请求参数无效，请重新登录'
  }
  if (!error.response) {
    return '无法连接认证服务，请检查网络后重试'
  }
  return errorDescription || 'Token 兑换失败，请重新登录'
}

export default {
  name: 'SsoCallback',
  created() {
    this.handleCallback()
  },
  methods: {
    async handleCallback() {
      // 1. 从 URL 获取 SSO 传回来的 code
      const code = this.$route.query.code
      const state = this.$route.query.state

      if (!code) {
        return this.showAuthenticationError('授权服务器未返回有效授权码')
      }

      window.isProcessingToken = true

      let authorizationRequest
      try {
        authorizationRequest = consumeAuthorizationRequest(state)
      } catch (error) {
        console.error('OAuth2 授权事务校验失败', error)
        this.$router.replace({ query: {} }).catch(() => {})
        window.isProcessingToken = false
        return this.showAuthenticationError(error.message)
      }

      this.$router.replace({ query: {} }).catch(() => {})

      try {
        const res = await axios.post(runtimeConfig.oauth.tokenUrl,
            new URLSearchParams({
              grant_type: 'authorization_code',
              code,
              client_id: runtimeConfig.oauth.clientId,
              redirect_uri: runtimeConfig.oauth.redirectUri,
              code_verifier: authorizationRequest.verifier
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
        )

        // 3. 将真实 Token 存入缓存
        const { access_token, refresh_token } = res.data
        localStorage.setItem('adpSsoToken', access_token)
        if (refresh_token) {
          localStorage.setItem('adpSsoRefreshToken', refresh_token)
        }

        // 5. 加载用户权限与菜单数据到 Vuex store
        try {
          const [userRes, menuRes] = await Promise.all([
            getCurrentUser(),
            getCurrentUserMenuTree()
          ])
          store.commit('SET_AUTHORITIES', normalizeAuthorityCodes(userRes.authorities))
          if (menuRes.code === 200) {
            store.commit('SET_MENUS', menuRes.data || [])
          }
        } catch (e) {
          console.warn('用户权限或菜单加载失败，不影响登录', e)
        }

        this.$router.replace(authorizationRequest.targetRoute)

      } catch (error) {
        console.error('OAuth2 Token 兑换失败', {
          status: error.response && error.response.status,
          data: error.response && error.response.data,
          message: error.message
        })
        this.showAuthenticationError(authenticationErrorMessage(error))
      } finally {
        window.isProcessingToken = false
      }
    },
    showAuthenticationError(message) {
      clearAuthentication()
      MessageBox.alert(message, '认证失败', {
        type: 'error',
        callback: () => redirectToAuthorization('/')
      })
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
