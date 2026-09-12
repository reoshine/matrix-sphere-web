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

    <!-- 环境切换 Tabs -->
    <el-card class="env-tabs-card" shadow="never">
      <el-tabs v-model="activeEnv" class="env-tabs">
        <el-tab-pane
          v-for="envItem in envList"
          :key="envItem.name"
          :name="envItem.name"
          lazy
        >
          <template slot="label">
            <span class="env-tab-label">
              <i :class="envItem.icon"></i>
              <span>{{ envItem.label }}</span>
              <el-tag size="mini" :type="envItem.tagType" effect="dark" class="env-tab-tag">{{ envItem.name }}</el-tag>
            </span>
          </template>
          <div class="env-tab-content">
            <deployByEnv
              :applicationId="applicationId"
              :env="envItem.name"
              @deployInfoUpdated="onDeployInfoUpdated"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 最近部署 -->
    <el-card class="recent-deploy-card" shadow="never">
      <div slot="header" class="recent-deploy-header">
        <span class="recent-deploy-title"><i class="el-icon-time"></i> 最近部署</span>
        <el-button type="text" size="small" @click="showAllHistory = true">
          查看全部 <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>

      <el-table
        v-loading="historyLoading"
        :data="recentHistoryList"
        stripe
        style="width: 100%"
        empty-text="暂无部署记录"
        size="small"
      >
        <el-table-column prop="deployTime" label="时间" width="160" :formatter="formatTime" />
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
        <el-table-column label="Feature 分支" min-width="180">
          <template slot-scope="{ row }">
            <div v-if="row.featureBranchNameList && row.featureBranchNameList.length" class="feature-tags">
              <el-tag v-for="b in row.featureBranchNameList" :key="b" size="mini" type="info" effect="plain">{{ b }}</el-tag>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="deployByName" label="操作人" width="90" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="{ row }">
            <StatusDot :type="getDeployStatusType(row.deployStatus)" :label="getDeployStatusText(row.deployStatus)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 全部历史抽屉 -->
    <el-drawer
      title="部署历史"
      :visible.sync="showAllHistory"
      direction="rtl"
      size="80%"
      :wrapper-closable="true"
    >
      <div class="drawer-content">
        <div class="drawer-filter">
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
      </div>
    </el-drawer>
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
      activeEnv: 'DEV',

      // 部署历史
      historyEnv: '',
      deployHistoryList: [],
      historyLoading: false,
      showAllHistory: false
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
    },

    recentHistoryList() {
      return this.deployHistoryList.slice(0, 5)
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
      queryList().then(res => {
        if (res.code === 200) {
          this.applicationGroupList = res.data || []
        }
      })
    },

    loadDeployHistory() {
      this.historyLoading = true
      const params = {
        applicationId: this.applicationId,
        env: this.historyEnv || this.activeEnv || 'DEV'
      }
      getDepLoyLogList(params).then(res => {
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
    let pid = this.$route.params.id || this.$route.query.applicationId
    if (!pid) {
      const cachedId = localStorage.getItem('applicationId')
      if (cachedId) {
        try { pid = JSON.parse(cachedId) } catch (e) { pid = cachedId }
      }
    }

    if (pid) {
      this.applicationId = pid
      localStorage.setItem('applicationId', JSON.stringify(pid))
      this.getGroupList()
      this.getApplication(pid)
      this.loadDeployHistory()
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

  /deep/ .el-descriptions-item__label.is-bordered-label {
    color: @text-secondary;
    background: @bg-header !important;
  }

  /deep/ .el-descriptions-item__content.is-bordered-content {
    color: @text-primary;
    background: @bg-footer !important;
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

/* 环境切换 Tabs */
.env-tabs-card {
  margin-bottom: @space-5;
  border-radius: @border-radius;

  /deep/ .el-card__body {
    padding: 0 @space-5 @space-5;
  }
}

.env-tabs {
  /deep/ .el-tabs__header {
    margin: 0;
    padding: 0 @space-5;
    background: @bg-footer;
    border-bottom: 1px solid @border-color-light;
  }

  /deep/ .el-tabs__nav-wrap::after {
    height: 1px;
    background: @border-color-light;
  }

  /deep/ .el-tabs__item {
    height: 56px;
    line-height: 56px;
    padding: 0 @space-5;
  }
}

.env-tab-label {
  display: inline-flex;
  align-items: center;
  gap: @space-2;

  i {
    font-size: 16px;
  }
}

.env-tab-tag {
  margin-left: @space-1;
}

.env-tab-content {
  padding-top: @space-4;
}

/* 最近部署卡片 */
.recent-deploy-card {
  border-radius: @border-radius;

  /deep/ .el-card__header {
    padding: @space-4 @space-5;
    border-bottom: 1px solid @border-color-light;
  }

  /deep/ .el-card__body {
    padding: 0;
  }
}

.recent-deploy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recent-deploy-title {
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

/* 抽屉内容 */
.drawer-content {
  padding: @space-5;
}

.drawer-filter {
  margin-bottom: @space-4;
}
</style>
