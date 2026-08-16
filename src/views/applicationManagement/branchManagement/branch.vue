<template>
  <PageContainer title="分支管理" subtitle="管理应用分支的创建、编辑和删除">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="openCreateDialog" :disabled="!applicationId">
        新建分支
      </el-button>
      <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="small"
          :disabled="selectedRows.length === 0"
          @click="batchDeleteConfirm"
      >
        批量删除 ({{ selectedRows.length }})
      </el-button>
    </template>

    <!-- 应用选择器 -->
    <template #filter>
      <FilterBar @search="queryApplicationByParam" @reset="resetSearch">
        <el-form-item label="选择应用">
          <el-select
              v-model="applicationId"
              filterable
              remote
              reserve-keyword
              placeholder="输入应用编码/名称搜索"
              :remote-method="searchApplications"
              :loading="appSearchLoading"
              size="small"
              style="width: 320px;"
              @change="onApplicationChange"
          >
            <el-option
                v-for="app in appOptions"
                :key="app.id"
                :label="app.applicationName + ' (' + app.applicationCode + ')'"
                :value="app.id"
            >
              <span style="float: left">{{ app.applicationName }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px">{{ app.applicationCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </FilterBar>
    </template>

    <!-- 应用信息概览 -->
    <el-card v-if="applicationInfo.id" class="info-card" shadow="never">
      <el-descriptions :column="4" border size="medium">
        <el-descriptions-item label="应用编码">
          <el-tag size="small" effect="plain">{{ applicationInfo.applicationCode || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应用名称">
          {{ applicationInfo.applicationName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="所属分组">
          <el-tag type="info" size="small">{{ getApplicationGroupCode(applicationInfo.applicationGroupId) || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Git 仓库">
          <el-link v-if="applicationInfo.gitUrl" type="primary" :href="applicationInfo.gitUrl" target="_blank" :underline="false">
            <i class="el-icon-link"></i> 查看仓库
          </el-link>
          <span v-else class="text-muted">-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 分支列表 -->
    <el-card class="table-card" shadow="never">
      <div slot="header" class="table-header">
        <span class="table-title">分支列表</span>
        <el-button type="text" icon="el-icon-refresh" size="small" @click="refreshList" :disabled="!applicationId">刷新</el-button>
      </div>

      <el-empty v-if="!applicationId" description="请先选择一个应用" icon="el-icon-s-platform" />
      <el-empty v-else-if="branchList.length <= 0" description="暂无分支信息，请先创建" />

      <el-table
          v-else
          v-loading="tableLoading"
          :data="branchList"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="branchName" label="分支名称" min-width="180">
          <template slot-scope="{ row }">
            <span class="branch-name">{{ row.branchName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createByName" label="创建人" width="100" align="center" />
        <el-table-column label="环境" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag v-if="row.deployEnv" size="mini" :type="getEnvTagType(row.deployEnv)" effect="dark">
              {{ row.deployEnv }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="160" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.canPush ? 'success' : 'info'" effect="plain">
              {{ row.canPush ? '可推送' : '不可推送' }}
            </el-tag>
            <el-tag size="mini" :type="row.isProtected ? 'danger' : 'info'" style="margin-left: 4px;">
              <i v-if="row.isProtected" class="el-icon-lock"></i>
              {{ row.isProtected ? '保护' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" icon="el-icon-edit" @click="editBranchInfo(row)">编辑</el-button>
            <el-button type="text" size="small" class="text-danger" icon="el-icon-delete" @click="deleteConfirm(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建分支弹窗 -->
    <FormDialog
        :visible.sync="createDialogVisible"
        title="创建新分支"
        width="500px"
        :loading="createLoading"
        submitText="立即创建"
        @submit="createBranch"
        @cancel="resetCreateForm"
        @close="resetCreateForm"
    >
      <el-form
          :model="branchInfo"
          :rules="createBranchRules"
          ref="createBranchRef"
          label-position="top"
          size="medium"
      >
        <el-form-item label="分支名称" prop="branchName">
          <el-input
              v-model="branchInfo.branchName"
              placeholder="请输入名称"
              maxlength="30"
              show-word-limit
          >
            <template slot="prepend">feature_</template>
          </el-input>
          <div class="form-tip">默认前缀：feature_，仅支持字母、数字、下划线或横线</div>
        </el-form-item>
        <el-form-item label="分支描述" prop="description">
          <el-input
              type="textarea"
              :rows="3"
              v-model="branchInfo.description"
              placeholder="例如：开发 v1.2.0 用户模块"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>
      </el-form>
    </FormDialog>

    <!-- 编辑分支弹窗 -->
    <FormDialog
        :visible.sync="modifyBranchDialogVisible"
        title="修改分支配置"
        width="500px"
        :loading="modifyLoading"
        submitText="确 定"
        @submit="modifyBranch"
        @cancel="cancelModifyBranch"
        @close="cancelModifyBranch"
    >
      <el-form
          :model="editBranchForm"
          :rules="modifyBranchRules"
          ref="modifyBranchRef"
          label-position="top"
          size="medium"
      >
        <el-form-item label="分支名称">
          <el-input v-model="editBranchForm.branchName" disabled prefix-icon="el-icon-connection" />
        </el-form-item>
        <el-form-item label="分支描述" prop="description">
          <el-input v-model="editBranchForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="可推送">
              <el-switch v-model="editBranchForm.canPush" active-text="是" inactive-text="否" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保护分支">
              <el-switch v-model="editBranchForm.isProtected" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </FormDialog>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import {
  createBranch,
  modifyBranch,
  getUnDeployedBranchList,
  removeBranch,
  getApplicationById
} from '@/views/applicationManagement/applicationList/api'
import { queryList } from '@/views/applicationManagement/applicationList/api'

export default {
  name: 'branch',
  components: {
    PageContainer,
    FilterBar,
    FormDialog
  },
  data() {
    return {
      // 应用选择
      appSearchLoading: false,
      appOptions: [],
      applicationId: '',
      applicationInfo: {},
      applicationGroupList: [],

      // 分支列表
      branchList: [],
      tableLoading: false,
      selectedRows: [],

      // 创建分支
      createDialogVisible: false,
      createLoading: false,
      branchInfo: {
        branchName: '',
        description: ''
      },
      createBranchRules: {
        branchName: [
          { required: true, message: '请输入分支名称', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_-]+$/, message: '只能包含字母、数字、下划线或横线', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入分支描述', trigger: 'blur' }
        ]
      },

      // 编辑分支
      modifyBranchDialogVisible: false,
      modifyLoading: false,
      editBranchForm: {},
      modifyBranchRules: {
        description: [
          { required: true, message: '请输入分支描述', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // --- 应用选择 ---
    searchApplications(query) {
      if (query.length < 1) return
      this.appSearchLoading = true
      queryList({ searchText: query, enableStatus: 1 }).then(res => {
        if (res.code === 200) {
          this.appOptions = res.data || []
        }
      }).finally(() => {
        this.appSearchLoading = false
      })
    },

    onApplicationChange(appId) {
      if (!appId) {
        this.applicationInfo = {}
        this.branchList = []
        return
      }
      localStorage.setItem('applicationId', JSON.stringify(appId))
      this.getApplication(appId)
      this.getBranchListByApplicationId(appId)
    },

    queryApplicationByParam() {
      if (this.applicationId) {
        this.onApplicationChange(this.applicationId)
      }
    },

    resetSearch() {
      this.applicationId = ''
      this.applicationInfo = {}
      this.branchList = []
      this.appOptions = []
    },

    getApplication(applicationId) {
      getApplicationById(applicationId).then(res => {
        if (res.code === 200) {
          this.applicationInfo = res.data
        }
      })
    },

    // --- 分支列表 ---
    getBranchListByApplicationId(applicationId) {
      this.tableLoading = true
      getUnDeployedBranchList({ applicationId }).then(res => {
        if (res.code === 200) {
          this.branchList = res.data || []
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },

    refreshList() {
      if (this.applicationId) {
        this.getBranchListByApplicationId(this.applicationId)
      }
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // --- 创建分支 ---
    openCreateDialog() {
      this.branchInfo = { branchName: '', description: '' }
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.createBranchRef && this.$refs.createBranchRef.clearValidate()
      })
    },

    createBranch() {
      this.$refs.createBranchRef.validate((valid) => {
        if (valid) {
          this.createLoading = true
          createBranch({
            applicationId: this.applicationInfo.id,
            branchName: 'feature_' + this.branchInfo.branchName,
            description: this.branchInfo.description,
            sourceBranch: 'main',
            branchType: '1'
          }).then(res => {
            if (res.code === 200) {
              this.$message.success('创建分支成功')
              this.createDialogVisible = false
              this.resetCreateForm()
              this.refreshList()
            } else {
              this.$message.error(res.message || '创建失败')
            }
          }).catch(err => {
            this.$message.error('创建异常: ' + err)
          }).finally(() => {
            this.createLoading = false
          })
        }
      })
    },

    resetCreateForm() {
      this.branchInfo = { branchName: '', description: '' }
      this.$nextTick(() => {
        this.$refs.createBranchRef && this.$refs.createBranchRef.clearValidate()
      })
    },

    // --- 编辑分支 ---
    editBranchInfo(branch) {
      this.editBranchForm = JSON.parse(JSON.stringify(branch))
      this.modifyBranchDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.modifyBranchRef) {
          this.$refs.modifyBranchRef.clearValidate()
        }
      })
    },

    cancelModifyBranch() {
      this.modifyBranchDialogVisible = false
      this.editBranchForm = {}
    },

    modifyBranch() {
      this.$refs.modifyBranchRef.validate((valid) => {
        if (valid) {
          this.modifyLoading = true
          modifyBranch({
            id: this.editBranchForm.id,
            applicationId: this.editBranchForm.applicationId,
            branchName: this.editBranchForm.branchName,
            description: this.editBranchForm.description,
            isProtected: this.editBranchForm.isProtected
          }).then(res => {
            if (res.code === 200) {
              this.$message.success('修改成功')
              this.modifyBranchDialogVisible = false
              this.refreshList()
            } else {
              this.$message.error(res.message)
            }
          }).finally(() => {
            this.modifyLoading = false
          })
        }
      })
    },

    // --- 删除分支 ---
    deleteConfirm(branch) {
      this.$confirm(`确认删除分支 <b>${branch.branchName}</b> 吗？此操作不可恢复。`, '删除分支', {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true
      }).then(() => {
        return removeBranch(branch.id)
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refreshList()
        } else {
          this.$message.error(res.message)
        }
      }).catch(() => {})
    },

    batchDeleteConfirm() {
      const names = this.selectedRows.map(r => r.branchName).join('、')
      this.$confirm(`确认批量删除以下 <b>${this.selectedRows.length}</b> 个分支？<br/><br/>${names}<br/><br/>此操作不可恢复。`, '批量删除分支', {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true
      }).then(() => {
        const ids = this.selectedRows.map(r => r.id)
        return Promise.all(ids.map(id => removeBranch(id)))
      }).then(results => {
        const failed = results.filter(r => r.code !== 200)
        if (failed.length === 0) {
          this.$message.success(`成功删除 ${this.selectedRows.length} 个分支`)
        } else {
          this.$message.warning(`${results.length - failed.length} 个成功，${failed.length} 个失败`)
        }
        this.selectedRows = []
        this.refreshList()
      }).catch(() => {})
    },

    // --- 工具方法 ---
    getApplicationGroupCode(id) {
      const obj = this.applicationGroupList.find(item => item.id === id)
      return obj ? obj.applicationGroupCode : '-'
    },

    getEnvTagType(env) {
      const map = { DEV: '', TEST: 'warning', POC: 'info', PROD: 'danger' }
      return map[env] || 'info'
    }
  },

  created() {
    // 加载分组列表（用于显示）
    queryList({ searchText: '', enableStatus: 1 }).then(res => {
      if (res.code === 200) {
        this.applicationGroupList = res.data || []
      }
    })

    // 从路由参数或 localStorage 恢复应用选择
    let pid = this.$route.params.applicationId
    if (!pid) {
      const cachedId = localStorage.getItem('applicationId')
      if (cachedId) {
        try { pid = JSON.parse(cachedId) } catch (e) { /* ignore */ }
      }
    }

    if (pid) {
      this.applicationId = pid
      localStorage.setItem('applicationId', JSON.stringify(pid))
      this.getApplication(pid)
      this.getBranchListByApplicationId(pid)
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

/* 应用信息卡片 */
.info-card {
  margin-bottom: @space-4;
  border-radius: @border-radius;

  /deep/ .el-card__body {
    padding: @space-4 @space-5;
  }
}

/* 表格卡片 */
.table-card {
  border-radius: @border-radius;

  /deep/ .el-card__header {
    padding: @space-3 @space-5;
    border-bottom: 1px solid @border-color-light;
  }

  /deep/ .el-card__body {
    padding: @space-4 @space-5;
  }
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-title {
  font-size: @font-size-base;
  font-weight: 600;
  color: @text-primary;
}

/* 分支名称 */
.branch-name {
  font-weight: 600;
  color: @text-primary;
  font-family: @font-mono;
  font-size: @font-size-sm;
}

/* 表单提示 */
.form-tip {
  font-size: @font-size-xs;
  color: @text-tertiary;
  margin-top: 4px;
  line-height: 1;
}

.text-muted {
  color: @text-tertiary;
}

.text-danger {
  color: @error-color;
  &:hover {
    color: #f78989;
  }
}
</style>
