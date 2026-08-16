<template>
  <PageContainer :title="applicationInfo.applicationName || '部署控制台'" subtitle="环境总览与部署操作">
    <!-- 头部操作 -->
    <template #header-actions>
      <el-button size="small" icon="el-icon-back" @click="$router.push('/apps')">返回应用列表</el-button>
    </template>

    <!-- 应用状态概览 -->
    <el-card class="overview-card" shadow="never">
      <div slot="header" class="overview-header">
        <span class="overview-title"><i class="el-icon-s-operation"></i> 应用状态概览</span>
        <StatusDot :type="applicationInfo.enableStatus === 1 ? 'success' : 'error'" :label="applicationInfo.enableStatus === 1 ? '启用' : '停用'" />
      </div>

      <el-descriptions :column="4" border size="medium">
        <el-descriptions-item label="应用编码">
          <el-tag size="small" type="info">{{ applicationInfo.applicationCode || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属分组">
          {{ applicationGroupMap.get(applicationInfo.applicationGroupId) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="Git 仓库">
          <el-link
              v-if="applicationInfo.gitUrl"
              type="primary"
              :href="applicationInfo.gitUrl"
              target="_blank"
              :underline="false"
          >
            <i class="el-icon-link"></i> 跳转仓库
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="当前 Release 分支">
          <el-tag v-if="deployedInfo.releaseBranchName" type="success" effect="light" size="small">
            <i class="el-icon-guide"></i> {{ deployedInfo.releaseBranchName }}
          </el-tag>
          <span v-else class="text-muted">暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="Feature 分支" :span="4">
          <div v-if="deployedInfo.featureBranchList && deployedInfo.featureBranchList.length > 0" class="feature-tags">
            <el-tag
                v-for="item in deployedInfo.featureBranchList"
                :key="item.branchName"
                size="mini"
                type="warning"
                effect="plain"
            >
              {{ item.branchName }}
            </el-tag>
          </div>
          <span v-else class="text-muted">无合并特性分支</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 4 环境卡片并排 -->
    <div class="env-grid">
      <el-card
          v-for="envItem in envList"
          :key="envItem.name"
          class="env-card"
          shadow="never"
          :body-style="{ padding: '0' }"
      >
        <div slot="header" class="env-card__header" :class="'env-card__header--' + envItem.name.toLowerCase()">
          <div class="env-card__title">
            <i :class="envItem.icon"></i>
            <span>{{ envItem.label }}</span>
          </div>
          <el-tag
              size="mini"
              :type="envItem.tagType"
              effect="dark"
          >
            {{ envItem.name }}
          </el-tag>
        </div>
        <div class="env-card__body">
          <deployByEnv
              :applicationId="applicationId"
              :env="envItem.name"
              @deployInfoUpdated="onDeployInfoUpdated"
          />
        </div>
      </el-card>
    </div>

    <!-- 部署历史 -->
    <el-card class="history-card" shadow="never">
      <div slot="header" class="history-header">
        <span class="history-title"><i class="el-icon-time"></i> 部署历史</span>
        <el-select v-model="historyEnv" size="small" placeholder="选择环境" clearable style="width: 120px;" @change="loadDeployHistory">
          <el-option v-for="e in envList" :key="e.name" :label="e.label" :value="e.name" />
        </el-select>
      </div>

      <el-table
          v-loading="historyLoading"
          :data="deployHistoryList"
          stripe
          style="width: 100%"
          empty-text="暂无部署历史记录"
      >
        <el-table-column prop="deployTime" label="时间" width="170" :formatter="formatTime" />
        <el-table-column prop="env" label="环境" width="80" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="getEnvTagType(row.env)">{{ row.env }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Release 分支" min-width="140">
          <template slot-scope="{ row }">
            <span v-if="row.releaseBranchName" class="branch-mono">{{ row.releaseBranchName }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="Feature 分支" min-width="200">
          <template slot-scope="{ row }">
            <div v-if="row.featureBranchNameList && row.featureBranchNameList.length" class="feature-tags">
              <el-tag v-for="b in row.featureBranchNameList" :key="b" size="mini" type="info" effect="plain">{{ b }}</el-tag>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="deployByName" label="操作人" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <StatusDot :type="getDeployStatusType(row.deployStatus)" :label="getDeployStatusText(row.deployStatus)" />
          </template>
        </el-table-column>
        <el-table-column label="失败原因" min-width="200" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.deployStatus === 3 && row.errorMessage" class="text-error">{{ row.errorMessage }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import StatusDot from '@/components/common/StatusDot.vue'
import deployByEnv from '@/components/deployByEnv/deployByEnv.vue'
import { getApplicationById, getDepLoyLogList } from '@/views/applicationManagement/applicationList/api'
import { queryList } from '@/views/applicationManagement/applicationGroup/api'
import bus from '@/util/bus'

export default {
  name: 'applicationDeploy',
  components: {
    PageContainer,
    StatusDot,
    deployByEnv
  },
  data() {
    return {
      applicationId: '',
      applicationGroupList: [],
      applicationInfo: {},
      deployedInfo: {},

      envList: [
        { name: 'DEV', label: '开发环境', icon: 'el-icon-cpu', tagType: '' },
        { name: 'TEST', label: '测试环境', icon: 'el-icon-s-check', tagType: 'warning' },
        { name: 'POC', label: '演示环境', icon: 'el-icon-monitor', tagType: 'info' },
        { name: 'PROD', label: '生产环境', icon: 'el-icon-s-platform', tagType: 'danger' }
      ],

      // 部署历史
      historyEnv: '',
      deployHistoryList: [],
      historyLoading: false
    }
  },
  computed: {
    applicationGroupMap() {
      const map = new Map()
      if (this.applicationGroupList && this.applicationGroupList.length > 0) {
        this.applicationGroupList.forEach(item => {
          map.set(item.id, item.applicationGroupCode)
        })
      }
      return map
    }
  },
  methods: {
    onDeployInfoUpdated(data) {
      if (data && Object.keys(data).length > 0) {
        this.deployedInfo = data
      }
    },

    getApplication(id) {
      getApplicationById(id).then(res => {
        if (res.code === 200) {
          this.applicationInfo = res.data
          bus.$emit('set-page-title', this.applicationInfo.applicationName)
        }
      }).catch(err => {
        this.$message.error('查询应用信息失败：' + err)
      })
    },

    getGroupList() {
      queryList({ searchText: '', enableStatus: 1 }).then(res => {
        if (res.code === 200) {
          this.applicationGroupList = res.data || []
        }
      })
    },

    loadDeployHistory() {
      if (!this.historyEnv) {
        this.deployHistoryList = []
        return
      }
      this.historyLoading = true
      getDepLoyLogList({
        applicationId: this.applicationId,
        env: this.historyEnv
      }).then(res => {
        if (res.code === 200) {
          this.deployHistoryList = res.data || []
        }
      }).catch(() => {
        this.deployHistoryList = []
      }).finally(() => {
        this.historyLoading = false
      })
    },

    formatTime(row, column, cellValue) {
      if (!cellValue) return '-'
      return String(cellValue).replace('T', ' ')
    },

    getEnvTagType(env) {
      const map = { DEV: '', TEST: 'warning', POC: 'info', PROD: 'danger' }
      return map[env] || 'info'
    },

    getDeployStatusType(status) {
      const map = { 1: 'running', 2: 'success', 3: 'error' }
      return map[status] || 'info'
    },

    getDeployStatusText(status) {
      const map = { 0: '初始化', 1: '部署中', 2: '成功', 3: '失败' }
      return map[status] || '未知'
    }
  },

  created() {
    let pid = this.$route.query.applicationId
    if (!pid) {
      pid = localStorage.getItem('applicationId')
    }

    if (pid) {
      this.applicationId = pid
      localStorage.setItem('applicationId', pid)
      this.getGroupList()
      this.getApplication(pid)
    } else {
      this.$message.warning('丢失应用ID参数，请从列表页重新进入')
      this.$router.push('/apps')
    }
  },

  beforeDestroy() {
    bus.$emit('set-page-title', null)
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

/* 应用概览卡片 */
.overview-card {
  margin-bottom: @space-5;
  border-radius: @border-radius;

  /deep/ .el-card__header {
    padding: @space-4 @space-5;
    border-bottom: 1px solid @border-color-light;
  }

  /deep/ .el-card__body {
    padding: @space-4 @space-5;
  }
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.overview-title {
  font-size: @font-size-base;
  font-weight: 600;
  color: @text-primary;

  i {
    margin-right: @space-2;
    color: @primary-color;
  }
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: @space-2;
}

.text-muted {
  color: @text-tertiary;
  font-size: @font-size-sm;
}

/* 环境卡片网格 — 响应式 4→2→1 */
.env-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: @space-4;
  margin-bottom: @space-5;

  @media (max-width: 1440px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.env-card {
  border-radius: @border-radius;
  overflow: hidden;

  /deep/ .el-card__header {
    padding: @space-3 @space-4;
    border-bottom: 1px solid @border-color-light;
  }
}

.env-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &--dev {
    border-left: 3px solid @primary-color;
  }

  &--test {
    border-left: 3px solid @warning-color;
  }

  &--poc {
    border-left: 3px solid @info-color;
  }

  &--prod {
    border-left: 3px solid @error-color;
  }
}

.env-card__title {
  display: flex;
  align-items: center;
  gap: @space-2;
  font-size: @font-size-sm;
  font-weight: 600;
  color: @text-primary;

  i {
    color: @primary-color;
  }
}

.env-card__body {
  padding: 0;
  max-height: 600px;
  overflow-y: auto;
}

/* 部署历史卡片 */
.history-card {
  border-radius: @border-radius;

  /deep/ .el-card__header {
    padding: @space-4 @space-5;
    border-bottom: 1px solid @border-color-light;
  }

  /deep/ .el-card__body {
    padding: @space-4 @space-5;
  }
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-title {
  font-size: @font-size-base;
  font-weight: 600;
  color: @text-primary;

  i {
    margin-right: @space-2;
    color: @primary-color;
  }
}

.branch-mono {
  font-family: @font-mono;
  font-size: @font-size-xs;
  color: @primary-color;
  background: @primary-lighter;
  padding: 2px 6px;
  border-radius: @border-radius-sm;
}

.text-error {
  color: @error-color;
  font-size: @font-size-sm;
}
</style>
