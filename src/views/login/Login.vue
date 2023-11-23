<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avator_box">
        <img src="@/assets/img/play.png" alt=""/>
      </div>
      <!-- 表单区域 -->
      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          label-width="0px"
          class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="accountNo">
          <el-input
              v-model="loginForm.username"
              prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="accountPassword">
          <el-input
              v-model="loginForm.password"
              prefix-icon="el-icon-lock"
              type="password"
          ></el-input>
        </el-form-item>

        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import qs from "qs";
import {login} from '@/api/api'

export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        grant_type: "password",
        scope: 'all',
      },

      auth: {
        username: 'adp-matrix',
        password: 'adp-matrix-secret',
      },

      rules: {
        username: [
          {required: true, message: "请输入用户名", trigger: "blur"},
          {min: 3, max: 10, message: "长度在3到10个字符", trigger: "blur"},
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {min: 6, max: 15, message: "长度在6到15个字符", trigger: "blur"},
        ],
      },
    };
  },
  methods: {
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate((valid) => {
        if (valid) {
          login(qs.stringify(this.loginForm)).then((res) => {
            if (res.status === 200) {
              this.$swal({
                title: "登录成功！",
                type: "success",
                timer: "2000",
                confirmButtonText: '确定',
                showCancelButton: false,
              }).then(() => {
                localStorage.setItem("adpSsoToken", res.data.access_token);
                localStorage.setItem("adpSsoRefreshToken", res.data.refresh_token);
                this.$router.replace("/dashboard");
              });
            } else {
              console.log(res);
              this.swal({
                title: "验证错误！",
                type: "error",
                cancelButtonText: "取消",
                timer: "2000",
                showCancelButton: true,
              });
            }
          }).catch((err) => {
            console.log(err);
          });
        }
      });
    },
  },
  created() {
    let loginUrl = window.location.href
    console.log(loginUrl)
    if (loginUrl.includes('/login')) {
      let params = loginUrl.split('?')
      if (params[1] === undefined) {
        this.authorize()
      } else {
        let tokenStr = params[1].split('=')
        if (tokenStr[0] === 'accessToken') {
          localStorage.setItem("adpSsoToken", tokenStr[1]);
          this.$router.replace("/applicationManagement/applicationList");
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avator_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 2px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
