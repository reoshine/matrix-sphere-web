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
        <div class="form-subtitle">请使用管理员账号访问控制台</div>
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
        // 构建表单数据
        const params = new URLSearchParams()
        params.append('username', this.loginForm.username)
        params.append('password', this.loginForm.password)

        // 发送到 SSO 后端的认证接口
        const res = await axios.post('http://192.168.0.10:8081/matrix-sphere-sso/authentication/login', params, {
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          withCredentials: true // 极其重要：跨域携带 Cookie
        })

        if (res.data.code === 200) {
          this.$message.success('认证成功，正在跳转...')
          // 核心逻辑：登录成功后，跳回 SSO 最初的授权页面（即 /oauth2/authorize）
          // 因为 Spring 会在 Session 中记录 SavedRequest，直接重新访问 SSO 即可
          window.location.href = 'http://192.168.0.10:8081/matrix-sphere-sso/oauth2/authorize?response_type=code&client_id=matrix-sphere'
          // 提示：上面的 URL 建议从之前的路由参数中动态获取
        }
      } catch (error) {
        this.$message.error(error.response?.data?.msg || '登录失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* 1. 布局容器 - 居中显示 */
.login-wrapper {
  display: flex;
  width: 960px;
  height: 550px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  /* 强制在页面正中心 */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

/* 2. 左侧：品牌视觉区 (Matrix 风格) */
.brand-section {
  width: 50%;
  background: linear-gradient(135deg, #1e58ff 0%, #003eb3 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
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
  border-radius: 4px;
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
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.brand-desc {
  font-size: 16px;
  line-height: 1.8;
  opacity: 0.85;
  font-weight: 300;
}

/* 3. 右侧：表单区 */
.form-section {
  width: 50%;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #ffffff;
}

.form-header {
  margin-bottom: 40px;
}

.form-title {
  font-size: 26px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 10px;
}

.form-subtitle {
  color: #909399;
  font-size: 14px;
}

.form-item {
  margin-bottom: 24px;
}

/* 4. 核心：修改 Element UI 的输入框样式 */
/* 使用 ::v-deep 穿透组件样式，确保自定义边框生效 */
::v-deep .el-input__inner {
  height: 42px;
  line-height: 42px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
  padding-left: 40px; /* 为图标留位置 */
}

::v-deep .el-input__inner:hover {
  border-color: #c0c4cc;
}

::v-deep .el-input__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

/* 5. 按钮样式 */
.submit-btn {
  width: 100%;
  height: 42px;
  background-color: #409EFF;
  border: none;
  font-size: 15px;
  letter-spacing: 1px;
}

/* 6. 处理浏览器自动填充导致的黄色背景 */
::v-deep input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
  -webkit-text-fill-color: #606266 !important;
}

/* 7. 页脚版权 */
.footer-copyright {
  position: absolute;
  bottom: 20px;
  right: 50px; /* 在表单区下方 */
  color: #909399;
  font-size: 12px;
}
</style>