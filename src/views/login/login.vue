<template>
  <div class="login-wrapper">
    <div class="brand-section">
      <div class="matrix-line line-1"></div>
      <div class="matrix-line line-2"></div>
      <div class="matrix-line line-3"></div>
      <div class="brand-content">
        <div class="brand-logo"><i class="el-icon-present"></i> MatrixSphere</div>
        <div class="brand-desc">
          企业级自动化运维与持续集成平台<br>
          Connecting Infrastructure, Empowering Deployment.
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="form-header">
        <div class="form-title">账号登录</div>
        <div class="form-subtitle">请使用您的账号访问控制台</div>
      </div>

      <el-form :model="loginForm" ref="loginForm" @submit.native.prevent="handleLogin">
        <div class="form-item">
          <el-input
              v-model="loginForm.username"
              prefix-icon="el-icon-user"
              placeholder="请输入用户名"
              class="custom-input-wrapper">
          </el-input>
        </div>
        <div class="form-item">
          <el-input
              v-model="loginForm.password"
              prefix-icon="el-icon-lock"
              type="password"
              placeholder="请输入密码"
              show-password
              class="custom-input-wrapper">
          </el-input>
        </div>
        <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            native-type="submit">
          {{ loading ? '正在验证...' : '立即登录' }}
        </el-button>
      </el-form>
    </div>
    <div class="footer-copyright">
      &copy; 2026 MatrixSphere Operations Platform. All Rights Reserved.
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      loginForm: {username: '', password: ''},
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      try {
        const res = await axios.post('/api/v1/auth/login', this.loginForm, {
          headers: {'Content-Type': 'application/json'}
        })

        if (res.data.code === 200 && res.data.data) {
          const { access_token } = res.data.data
          localStorage.setItem('adpSsoToken', access_token || 'local-dev-token')

          this.$message.success('登录成功')
          const targetRoute = sessionStorage.getItem('target_route') || '/'
          sessionStorage.removeItem('target_route')
          this.$router.push(targetRoute)
        } else {
          this.$message.error(res.message || '登录失败')
        }
      } catch (error) {
        this.$message.error(error.response?.data?.message || '登录失败，请检查网络连接')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.login-wrapper {
  display: flex;
  width: min(960px, 90vw);
  height: min(550px, 85vh);
  background: #fff;
  border-radius: @border-radius-lg;
  box-shadow: @shadow-lg;
  overflow: hidden;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.brand-section {
  width: 50%;
  background: linear-gradient(135deg, @primary-color 0%, @primary-dark 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: @space-12;
  color: #fff;
}

.brand-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image:
      radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1.5px),
      radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1.5px);
  background-size: 30px 30px;
  background-position: 0 0, 15px 15px;
  opacity: 0.3;
}

.matrix-line {
  position: absolute;
  background: rgba(255,255,255,0.1);
  border-radius: @border-radius-sm;
}
.line-1 { top: 20%; left: 10%; width: 60%; height: 2px; }
.line-2 { top: 25%; left: 10%; width: 40%; height: 2px; }
.line-3 { bottom: 20%; right: 10%; width: 50%; height: 2px; }

.brand-content {
  position: relative;
  z-index: 2;
}

.brand-logo {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: @space-5;
  letter-spacing: 1px;
}

.brand-desc {
  font-size: @font-size-lg;
  line-height: 1.8;
  opacity: 0.85;
  font-weight: 300;
}

.form-section {
  width: 50%;
  padding: @space-12 @space-8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #ffffff;
}

.form-header {
  margin-bottom: 10;
}

.form-title {
  font-size: @font-size-3xl;
  font-weight: 600;
  color: @text-primary;
  margin-bottom: @space-3;
}

.form-subtitle {
  color: @text-tertiary;
  font-size: @font-size-base;
}

.form-item {
  margin-bottom: @space-6;
}

::v-deep .el-input__inner {
  height: 42px;
  line-height: 42px;
  border: 1px solid @border-color;
  border-radius: @border-radius;
  transition: all @transition-fast;
  padding-left: 40px;
}

::v-deep .el-input__inner:hover {
  border-color: var(--color-gray-300, #d1d5db);
}

::v-deep .el-input__inner:focus {
  border-color: @primary-color;
  box-shadow: 0 0 0 2px var(--primary-lighter, rgba(44, 88, 180, 0.1));
}

.submit-btn {
  width: 100%;
  height: 42px;
  background-color: @primary-color;
  border: none;
  font-size: @font-size-md;
  letter-spacing: 1px;
}

::v-deep input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
  -webkit-text-fill-color: @text-secondary !important;
}

.footer-copyright {
  position: absolute;
  bottom: @space-5;
  right: @space-8;
  color: @text-tertiary;
  font-size: @font-size-xs;
}

/* 响应式：小屏堆叠布局 */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    width: 95vw;
    height: auto;
    max-height: 90vh;
  }

  .brand-section {
    width: 100%;
    padding: @space-8 @space-6;
    min-height: 160px;
  }

  .brand-logo {
    font-size: 28px;
  }

  .brand-desc {
    font-size: @font-size-sm;
  }

  .form-section {
    width: 100%;
    padding: @space-6;
  }
}
</style>
