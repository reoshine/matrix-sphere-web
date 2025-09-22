<template>
  <div class="login_container">

  </div>
</template>

<script>
import {login} from '@/views/login/api'

export default {
  name: "login",
  data() {
    return {

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
        login()
      } else {
        let tokenStr = params[1].split('&')
        let accessTokenStr = tokenStr[0].split('=')
        if (accessTokenStr[0] === 'accessToken') {
          localStorage.setItem("adpSsoToken", accessTokenStr[1]);
        }
        let refreshTokenStr = tokenStr[1].split('=')
        if (refreshTokenStr[0] === 'refreshToken') {
          localStorage.setItem("adpSsoRefreshToken", refreshTokenStr[1]);
        }
        this.$router.replace("/applicationManagement/application");
      }
    }
  }
};
</script>

<style lang="less" scoped>

</style>
