<template>
  <div
      class="login_container"
      v-loading.fullscreen.lock="loading"
      element-loading-text="正在登录并加载数据..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 1)"
  >
  </div>
</template>

<script>
// 1. 我们不再从 api.js 导入 login, 因为那个是 Axios
// import {login} from '@/views/login/api'

export default {
  name: "login",
  data() {
    return {
      // 保持我们之前添加的 loading 状态
      loading: true
    }
  },
  methods: {

  },
  created() {
    let loginUrl = window.location.href
    console.log(loginUrl)
    if (loginUrl.includes('/login')) {
      let params = loginUrl.split('?')
      if (params[1] === undefined) {
        // 1. 无参数，意味着需要 *开始* 登录流程
        this.loading = true; // 显示Loading

        // ---------------------------------
        // 关键修复：
        // ---------------------------------
        // 不再调用 Axios/api.js 中的 login()
        // login()

        // 而是直接设置窗口 location,
        // 让浏览器 *导航* 到您的后端客户端，
        // 后端 (8081) 会 302 重定向到SSO服务器 (7001)
        // 整个过程在浏览器顶层窗口完成，CORS问题消失。
        window.location.href = 'http://192.168.0.10:8081/matrix-sphere/client/login';

      } else {
        // 2. 有参数，是SSO回调
        this.loading = true; // 显示Loading

        let tokenStr = params[1].split('&')
        let accessTokenStr = tokenStr[0].split('=')
        if (accessTokenStr[0] === 'accessToken') {
          localStorage.setItem("adpSsoToken", accessTokenStr[1]);
        }
        let refreshTokenStr = tokenStr[1].split('=')
        if (refreshTokenStr[0] === 'refreshToken') {
          localStorage.setItem("adpSsoRefreshToken", refreshTokenStr[1]);
        }

        // 3. 设置完Token后，跳转到根目录
        // permission.js 会接管并找到第一个有效页面
        this.$router.replace("/").catch(err => {
          if (err.name !== 'NavigationRedirected') {
            console.error('登录跳转时发生意外错误:', err);
          }
          // 捕获预期的 "NavigationRedirected" 错误，不让它显示在控制台
        });
      }
    } else {
      this.loading = false;
    }
  }
};
</script>

<style lang="less" scoped>
/* 确保 loading 占满全屏 */
.login_container {
  width: 100%;
  height: 100vh;
}
</style>