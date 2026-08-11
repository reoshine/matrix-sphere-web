<template>
  <div class="app-container">
    <el-card shadow="never" class="filter-card">
      <div slot="header">
        <i class="el-icon-folder-opened"></i>
        <span>Git 仓库管理</span>
        <el-button
          type="primary" plain size="small" style="float: right"
          icon="el-icon-refresh" :loading="refreshingAll"
          @click="refreshAll"
        >刷新全部</el-button>
      </div>

      <el-table :data="repoList" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="applicationCode" label="应用编码" min-width="140" />
        <el-table-column prop="applicationName" label="应用名称" min-width="140" />
        <el-table-column label="GitLab 项目ID" width="130" align="center">
          <template v-slot="{row}">
            <el-tag v-if="row.gitApplicationId" type="success" size="small">
              {{ row.gitApplicationId }}
            </el-tag>
            <el-tag v-else type="danger" size="small">未关联</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gitUrl" label="Git URL" min-width="280" show-overflow-tooltip />
        <el-table-column label="操作" width="220" align="center">
          <template v-slot="{row}">
            <el-button type="text" icon="el-icon-search" @click="viewProject(row)">
              查看项目
            </el-button>
            <el-button
              type="text" icon="el-icon-refresh"
              :loading="refreshingIds[row.applicationId]"
              @click="refreshOne(row)"
            >刷新ID</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && repoList.length === 0" description="暂无 Git 仓库数据" />
    </el-card>

    <el-dialog
      title="远程仓库项目详情"
      :visible.sync="projectDialogVisible"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-if="projectInfo" :column="1" border size="small">
        <el-descriptions-item label="项目ID">{{ projectInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ projectInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="命名空间路径">
          {{ projectInfo.pathWithNamespace }}
        </el-descriptions-item>
        <el-descriptions-item label="Web URL">
          <a v-if="projectInfo.webUrl" :href="projectInfo.webUrl" target="_blank">
            {{ projectInfo.webUrl }}
          </a>
        </el-descriptions-item>
        <el-descriptions-item label="SSH URL">
          <span v-if="projectInfo.sshUrl">{{ projectInfo.sshUrl }}
            <i class="el-icon-document-copy copy-btn" @click="handleCopy(projectInfo.sshUrl)"></i>
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="HTTP URL">
          <span v-if="projectInfo.httpUrl">{{ projectInfo.httpUrl }}
            <i class="el-icon-document-copy copy-btn" @click="handleCopy(projectInfo.httpUrl)"></i>
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="描述">
          {{ projectInfo.description || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-empty v-else-if="!projectLoading" description="无法获取远程项目信息" />

      <div slot="footer">
        <el-button size="small" @click="projectDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getGitRepoList, getProjectInfo, refreshProjectId } from './api'

export default {
  name: 'GitRepository',
  data() {
    return {
      repoList: [],
      loading: false,
      refreshingAll: false,
      refreshingIds: {},
      projectDialogVisible: false,
      projectInfo: null,
      projectLoading: false
    }
  },
  methods: {
    handleCopy(text) {
      if (!text) return
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = 0
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success('已复制')
      } catch (e) {
        this.$message.error('复制失败')
      } finally {
        document.body.removeChild(textarea)
      }
    },
    loadList() {
      this.loading = true
      getGitRepoList().then(res => {
        if (res.code === 200) {
          this.repoList = res.data || []
        }
      }).catch(() => {
        this.$message.error('加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    viewProject(row) {
      if (!row.gitApplicationId && !row.gitUrl) {
        this.$message.warning('该应用未配置 Git URL')
        return
      }
      this.projectInfo = null
      this.projectLoading = true
      this.projectDialogVisible = true
      getProjectInfo(row.applicationId).then(res => {
        if (res.code === 200) {
          this.projectInfo = res.data
        }
      }).catch(() => {
        this.$message.error('获取项目信息失败')
      }).finally(() => {
        this.projectLoading = false
      })
    },
    refreshOne(row) {
      this.$set(this.refreshingIds, row.applicationId, true)
      refreshProjectId(row.applicationId).then(res => {
        if (res.code === 200 && res.data) {
          row.gitApplicationId = res.data
          this.$message.success(`刷新成功: ${res.data}`)
        } else {
          this.$message.warning('无法解析 GitLab 项目 ID，请检查 URL')
        }
      }).catch(() => {
        this.$message.error('刷新失败')
      }).finally(() => {
        this.$set(this.refreshingIds, row.applicationId, false)
      })
    },
    refreshAll() {
      this.refreshingAll = true
      const tasks = this.repoList
        .filter(r => r.gitUrl)
        .map(r => refreshProjectId(r.applicationId).then(res => {
          if (res.code === 200 && res.data) {
            r.gitApplicationId = res.data
          }
        }).catch(() => {}))
      Promise.all(tasks).finally(() => {
        this.refreshingAll = false
        this.$message.success('刷新完成')
      })
    }
  },
  mounted() {
    this.loadList()
  }
}
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 126px);
}

.filter-card {
  :deep(.el-card__header) {
    font-weight: bold;
    i { margin-right: 6px; }
  }
}

.copy-btn {
  cursor: pointer;
  color: #409EFF;
  margin-left: 6px;
  &:hover { opacity: 0.7; }
}
</style>
