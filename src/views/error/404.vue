<template>
  <div class="error-page">
    <div class="error-content">
      <!-- 404 图标 -->
      <div class="error-icon">
        <span class="error-code">404</span>
      </div>

      <!-- 错误描述 -->
      <h1 class="error-title">页面未找到</h1>
      <p class="error-desc">
        抱歉，您访问的页面不存在或已被移除。
      </p>

      <!-- 操作按钮 -->
      <div class="error-actions">
        <el-button type="primary" icon="el-icon-home" @click="goHome">
          返回首页
        </el-button>
        <el-button icon="el-icon-back" @click="goBack">
          返回上页
        </el-button>
        <el-button icon="el-icon-search" @click="openSearch">
          全局搜索
        </el-button>
      </div>

      <!-- 搜索框 -->
      <div class="error-search">
        <el-input
          v-model="searchText"
          placeholder="搜索应用、分支、凭据..."
          prefix-icon="el-icon-search"
          size="large"
          clearable
          @keyup.enter.native="handleSearch"
        >
          <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
        </el-input>
      </div>

      <!-- 快捷链接 -->
      <div class="error-links">
        <span class="links-title">您可能想去：</span>
        <router-link to="/dashboard" class="quick-link">
          <i class="el-icon-s-home"></i> 工作台
        </router-link>
        <router-link to="/apps" class="quick-link">
          <i class="el-icon-s-platform"></i> 应用列表
        </router-link>
        <router-link to="/deploy" class="quick-link">
          <i class="el-icon-s-promotion"></i> 部署控制台
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '@/util/bus'

export default {
  name: 'NotFound',
  data() {
    return {
      searchText: ''
    }
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    goBack() {
      this.$router.go(-1)
    },
    openSearch() {
      bus.$emit('open-global-search')
    },
    handleSearch() {
      if (this.searchText.trim()) {
        this.$message.info(`搜索: ${this.searchText}`)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: @space-8;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  margin-bottom: @space-6;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: @primary-lighter;
  line-height: 1;
  display: block;
  background: linear-gradient(135deg, @primary-color 0%, @primary-light 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-title {
  font-size: @font-size-3xl;
  font-weight: 600;
  color: @text-primary;
  margin: 0 0 @space-3;
}

.error-desc {
  font-size: @font-size-base;
  color: @text-secondary;
  margin: 0 0 @space-8;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: @space-3;
  margin-bottom: @space-8;
  flex-wrap: wrap;
}

.error-search {
  margin-bottom: @space-8;

  .el-input {
    max-width: 400px;
  }
}

.error-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: @space-4;
  flex-wrap: wrap;
}

.links-title {
  font-size: @font-size-sm;
  color: @text-tertiary;
}

.quick-link {
  font-size: @font-size-sm;
  color: @primary-color;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: @space-1;
  transition: color @transition-fast;

  &:hover {
    color: @primary-dark;
    text-decoration: underline;
  }

  i {
    font-size: @font-size-base;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: @font-size-2xl;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
