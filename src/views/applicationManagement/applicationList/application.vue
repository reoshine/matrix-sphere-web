<template>
  <PageContainer title="应用列表" subtitle="管理所有应用及其部署配置">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="addApplication">新增应用</el-button>
      <el-dropdown trigger="click" style="margin-left: 10px;">
        <el-button plain size="small">
          更多操作 <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item disabled icon="el-icon-download">模板下载（后端能力未接入）</el-dropdown-item>
          <el-dropdown-item disabled icon="el-icon-upload2">导入应用（后端能力未接入）</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>

    <!-- 筛选区 -->
    <template #filter>
      <FilterBar @search="handleQuery" @reset="resetQuery">
        <el-form-item label="应用搜索">
          <el-input
              v-model="keyword"
              placeholder="输入编码/名称"
              prefix-icon="el-icon-search"
              clearable
              style="width: 240px;"
              size="small"
              @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="enableStatus" placeholder="全部" clearable style="width: 120px;" size="small">
            <el-option v-for="item in enableStatusList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目分组">
          <el-select
              v-model="applicationGroupId"
              placeholder="请选择分组"
              clearable
              filterable
              style="width: 180px;"
              size="small"
              @change="handleQuery"
          >
            <el-option
                v-for="item in applicationGroupList"
                :key="item.id"
                :label="item.applicationGroupName"
                :value="item.id"
            >
              <span style="float: left">{{ item.applicationGroupName }}</span>
              <span style="float: right; color: var(--color-text-tertiary); font-size: 12px; margin-left: 10px">{{ item.applicationGroupCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </FilterBar>
    </template>

    <!-- 工具栏：视图切换 -->
    <template #toolbar>
      <div class="toolbar-left">
        <span class="result-count">共 {{ total }} 个应用</span>
      </div>
      <div class="toolbar-right">
        <div class="view-toggle">
          <span class="toggle-btn" :class="{ 'is-active': viewMode === 'card' }" @click="viewMode = 'card'">
            <i class="el-icon-menu"></i>
          </span>
          <span class="toggle-btn" :class="{ 'is-active': viewMode === 'list' }" @click="viewMode = 'list'">
            <i class="el-icon-s-grid"></i>
          </span>
        </div>
      </div>
    </template>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'">
      <el-empty v-show="applicationList.length <= 0" description="暂无应用信息"></el-empty>
      <div v-show="applicationList.length > 0" class="card-grid">
        <el-row :gutter="15">
          <el-col v-for="application in applicationList" :key="application.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
            <el-card shadow="never" class="application-card" :body-style="{ padding: '0px' }">
              <div class="card-header">
                <div class="header-title">
                  <i class="el-icon-monitor icon-bg"></i>
                  <span class="code" :title="application.applicationCode">{{ application.applicationCode }}</span>
                </div>
                <el-switch
                    v-model="application.enableStatus"
                    :active-value="1"
                    :inactive-value="0"
                    :loading="application.statusUpdating"
                    :disabled="application.statusUpdating"
                    @change="enableChange($event, application)"
                />
              </div>

              <div class="card-body">
                <div class="application-name" :title="application.applicationName">{{ application.applicationName }}</div>
                <div class="meta-row">
                  <el-tag size="mini" type="info" effect="light" v-if="application.applicationGroupCode">{{ application.applicationGroupCode }}</el-tag>
                  <span v-else class="meta-empty">-</span>
                </div>
              </div>

              <div class="card-footer">
                <el-tooltip content="进入部署控制台" placement="top" :open-delay="500">
                  <span class="action-btn" @click="toAppDeploy(application.id)">
                    <i class="el-icon-s-promotion"></i> 部署
                  </span>
                </el-tooltip>
                <el-tooltip content="分支管理" placement="top" :open-delay="500">
                  <span class="action-btn" @click="toBranchManagement(application.id)">
                    <i class="el-icon-share"></i> 分支
                  </span>
                </el-tooltip>
                <el-tooltip content="配置流水线" placement="top" :open-delay="500">
                  <span class="action-btn" @click="applicationEdit(application.id)">
                    <i class="el-icon-setting"></i> 配置
                  </span>
                </el-tooltip>
                <el-tooltip content="删除应用" placement="top" :open-delay="500">
                  <span class="action-btn action-btn--danger" @click="removeApplication(application.id)">
                    <i class="el-icon-delete"></i> 删除
                  </span>
                </el-tooltip>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else>
      <el-table
          v-loading="tableLoading"
          :data="applicationList"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="applicationCode" label="应用编码" min-width="140" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span class="app-code-link" @click="toAppDeploy(row.id)">{{ row.applicationCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="applicationName" label="应用名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="applicationGroupCode" label="分组" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" type="info" effect="plain" v-if="row.applicationGroupCode">{{ row.applicationGroupCode }}</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="{ row }">
            <StatusDot :type="row.enableStatus === 1 ? 'success' : 'error'" :label="row.enableStatus === 1 ? '启用' : '停用'" />
          </template>
        </el-table-column>
        <el-table-column label="最近部署" width="120" align="center">
          <template slot-scope="{ row }">
            <span class="text-muted">{{ row.lastDeployTime || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="{ row }">
            <div class="table-actions">
              <el-button type="text" size="small" icon="el-icon-s-promotion" @click="toAppDeploy(row.id)">部署</el-button>
              <el-button type="text" size="small" icon="el-icon-share" @click="toBranchManagement(row.id)">分支</el-button>
              <el-dropdown trigger="click" @command="handleRowCommand($event, row)">
                <el-button type="text" size="small" icon="el-icon-more"></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item icon="el-icon-setting" command="edit-pipeline">配置流水线</el-dropdown-item>
                  <el-dropdown-item divided icon="el-icon-delete" class="text-danger" command="delete">删除应用</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <template #footer>
      <el-pagination
          background
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pageNum"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </template>

    <!-- 新增/编辑弹窗 -->
    <FormDialog
        :visible.sync="dialog"
        :title="saveApplicationForm.id ? '编辑应用信息' : '创建新应用'"
        width="600px"
        :loading="loading"
        :submitText="saveApplicationForm.id ? '保存修改' : '立即创建'"
        @submit="saveApplication"
        @cancel="cancelForm"
        @close="cancelForm"
    >
      <el-form
          :model="saveApplicationForm"
          :rules="rules"
          ref="saveApplicationFormRef"
          label-position="top"
          size="medium"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="applicationCode" label="项目编码">
              <el-input
                  v-model="saveApplicationForm.applicationCode"
                  placeholder="唯一标识，例如: matrix-user-service"
                  :disabled="!!saveApplicationForm.id"
              >
                <template slot="prepend" v-if="!saveApplicationForm.id">CODE</template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item prop="applicationName" label="项目名称">
              <el-input v-model="saveApplicationForm.applicationName" placeholder="中文显示名称，例如: 用户中心服务" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item prop="applicationGroupId" label="所属分组">
              <el-select v-model="saveApplicationForm.applicationGroupId" placeholder="请选择" style="width: 100%">
                <el-option
                    v-for="item in applicationGroupList"
                    :key="item.id"
                    :label="item.applicationGroupName"
                    :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item prop="enableStatus" label="初始状态">
              <el-select v-model="saveApplicationForm.enableStatus" style="width: 100%">
                <el-option v-for="item in enableStatusList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item prop="jobType" label="构建类型">
              <el-select
                  v-model="saveApplicationForm.jobType"
                  placeholder="请选择构建类型"
                  style="width: 100%"
              >
                <el-option v-for="item in jobTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <div style="font-size: 12px; color: var(--color-text-tertiary); line-height: 1.5; margin-top: 4px;">
                <i class="el-icon-info"></i> 系统将自动使用该构建类型对应的默认系统模板创建 Jenkins Job。
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item prop="gitUrl" label="Git 仓库地址">
              <el-input
                  type="textarea"
                  :rows="3"
                  v-model="saveApplicationForm.gitUrl"
                  placeholder="SSH 或 HTTP 地址，例如: git@gitee.com:..."
                  resize="none"
              />
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
import StatusDot from '@/components/common/StatusDot.vue'
import {
  enableChange,
  getApplicationById,
  queryPage,
  removeApplication,
  saveApplication,
  modifyApplication
} from "@/views/applicationManagement/applicationList/api";
import {queryList as queryGroupList} from "@/views/applicationManagement/applicationGroup/api";

export default {
  name: "Application",
  components: {
    PageContainer,
    FilterBar,
    FormDialog,
    StatusDot
  },
  data() {
    return {
      viewMode: 'card',
      tableLoading: false,
      selectedRows: [],

      keyword: '',
      enableStatus: null,
      enableStatusList: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }],

      applicationGroupId: '',
      applicationGroupList: [],

      dialog: false,
      loading: false,
      saveApplicationForm: {
        id: null,
        applicationCode: '',
        applicationName: '',
        applicationGroupId: '',
        applicationGroupCode: '',
        gitUrl: '',
        enableStatus: 1,
        jobType: 'backend'
      },

      jobTypeOptions: [
        { label: '后端可执行应用', value: 'backend' },
        { label: '后端类库', value: 'backend_library' },
        { label: '前端应用', value: 'frontend' }
      ],

      rules: {
        applicationCode: [
          { required: true, message: '请输入项目编码', trigger: 'blur' },
          { min: 3, max: 40, message: '长度在3到40个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9-]+$/, message: '仅支持字母、数字和横杠', trigger: 'blur' }
        ],
        applicationName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
        ],
        applicationGroupId: [
          { required: true, message: '请选择项目分组', trigger: 'change' },
        ],
        gitUrl: [
          { required: true, message: '请输入Git地址', trigger: 'blur' },
        ],
        enableStatus: [
          { required: true, message: '请选择启用状态', trigger: 'change' },
        ],
        jobType: [
          { required: true, message: '请选择构建类型', trigger: 'change' },
        ]
      },

      applicationList: [],
      total: 0,
      pageNum: 1,
      pageSize: 16,
      pageSizes: [12, 16, 24, 48],
    };
  },
  methods: {
    getGroupList() {
      queryGroupList().then(res => {
        if (res.code === 200) {
          this.applicationGroupList = res.data || []
        }
      })
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.queryApplicationPage();
    },

    handleCurrentChange(val) {
      this.pageNum = val;
      this.queryApplicationPage();
    },

    resetQuery() {
      this.keyword = '';
      this.enableStatus = null;
      this.applicationGroupId = '';
      this.handleQuery();
    },

    handleQuery() {
      this.pageNum = 1;
      this.queryApplicationPage();
    },

    queryApplicationPage() {
      this.tableLoading = true;
      queryPage({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        keyword: this.keyword,
        enableStatus: this.enableStatus !== null ? this.enableStatus : undefined,
        applicationGroupId: this.applicationGroupId || undefined
      }).then(res => {
        if (res.code === 200) {
          const result = res.data;
          this.total = result.total;
          this.applicationList = result.list || [];
        }
      }).catch(err => {
        this.$message.error('查询失败：' + err);
      }).finally(() => {
        this.tableLoading = false;
      })
    },

    async addApplication() {
      this.saveApplicationForm = {
        enableStatus: 1,
        jobType: 'backend'
      };

      if (this.applicationGroupList.length === 0) {
        await this.getGroupList();
      }

      this.dialog = true;

      this.$nextTick(() => {
        this.$refs.saveApplicationFormRef && this.$refs.saveApplicationFormRef.clearValidate();
      });
    },

    modify(id) {
      getApplicationById(id).then(res => {
        if (res.code === 200) {
          this.saveApplicationForm = res.data;
          this.dialog = true;
          if (this.applicationGroupList.length === 0) this.getGroupList();
        }
      });
    },

    removeApplication(applicationId) {
      this.$confirm('此操作将永久删除该应用及其关联配置, 是否继续?', '警示', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeApplication(applicationId).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功!');
            this.queryApplicationPage();
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch(() => {});
    },

    enableChange($event, application) {
      const originalStatus = $event === 1 ? 0 : 1;
      this.$set(application, 'statusUpdating', true);
      enableChange({
        id: application.id,
        enableStatus: $event
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('状态已更新');
        } else {
          application.enableStatus = originalStatus;
          this.$message.error(res.message || '状态更新失败，请重试');
        }
      }).catch(() => {
        application.enableStatus = originalStatus;
        this.$message.error('状态更新失败，请重试');
      }).finally(() => {
        application.statusUpdating = false;
      })
    },

    saveApplication() {
      this.$refs.saveApplicationFormRef.validate((valid) => {
        if (valid) {
          this.loading = true;
          const isEdit = !!this.saveApplicationForm.id;
          const payload = {
            id: this.saveApplicationForm.id,
            applicationCode: this.saveApplicationForm.applicationCode,
            applicationName: this.saveApplicationForm.applicationName,
            applicationGroupId: this.saveApplicationForm.applicationGroupId,
            gitUrl: this.saveApplicationForm.gitUrl,
            enableStatus: this.saveApplicationForm.enableStatus,
            jobType: this.saveApplicationForm.jobType
          };
          let requestPromise;

          if (isEdit) {
            requestPromise = modifyApplication(payload);
          } else {
            requestPromise = saveApplication(payload);
          }

          requestPromise.then(res => {
            if (res.code === 200) {
              this.$message.success(isEdit ? '应用配置已更新' : '新应用创建成功');
              this.cancelForm();
              this.queryApplicationPage();
            } else {
              this.$message.error(res.message);
            }
          }).catch(err => {
            this.$message.error((isEdit ? '修改' : '新增') + '失败：' + err);
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },

    toBranchManagement(applicationId) {
      this.$router.push({
        name: "branch",
        path: '/applicationManagement/branchManagement/branch',
        params: { applicationId: applicationId }
      });
    },

    toAppDeploy(applicationId) {
      this.$router.push(`/deploy/${applicationId}`);
    },

    applicationEdit(applicationId) {
      this.$router.push({
        name: 'applicationEdit',
        path: "/applicationManagement/applicationList/applicationEdit",
        params: { applicationId: applicationId }
      });
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    handleRowCommand(command, row) {
      switch (command) {
        case 'edit-pipeline':
          this.applicationEdit(row.id);
          break;
        case 'delete':
          this.removeApplication(row.id);
          break;
      }
    },

    handleClose(done) {
      if (this.loading) return;
      this.cancelForm();
    },

    cancelForm() {
      this.loading = false;
      this.dialog = false;
    }
  },
  created() {
    this.getGroupList();
    this.queryApplicationPage();
  }
};
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";


/* 工具栏 */
.toolbar-left {
  .result-count {
    font-size: @font-size-base;
    color: @text-secondary;
    font-weight: 500;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: @space-3;
}

/* 视图切换 */
.view-toggle {
  display: inline-flex;
  background: @bg-header;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;

  .toggle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    color: @text-tertiary;
    transition: all @transition-fast;

    &:hover {
      color: @text-secondary;
    }

    &.is-active {
      background: @bg-surface;
      color: @primary-color;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}

/* 卡片网格 */
.card-grid {
  .el-col { margin-bottom: @space-5; }
}

/* 卡片样式 */
.application-card {
  border: 1px solid @border-color-light;
  background-color: @bg-footer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: @border-radius;
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: @primary-lighter;
    transform: translateY(-3px);
  }

  .card-header {
    height: 55px;
    padding: 0 20px;
    border-bottom: 1px solid @border-color-light;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      overflow: hidden;
      flex: 1;
      margin-right: 10px;

      .icon-bg {
        background: @primary-lighter;
        color: @primary-color;
        padding: 8px;
        border-radius: 8px;
        margin-right: 10px;
        font-size: 16px;
        flex-shrink: 0;
      }
      .code {
        font-weight: 600;
        color: @text-primary;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .card-body {
    padding: 14px 16px 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .application-name {
      color: @text-primary;
      font-size: @font-size-base;
      font-weight: 500;
      line-height: 1.5;
      height: 42px;
      margin-bottom: 10px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-all;
    }

    .meta-row {
      display: flex;
      gap: 6px;
      height: 22px;
      align-items: center;

      .meta-empty {
        color: @text-tertiary;
        font-size: @font-size-sm;
      }
    }
  }

  .card-footer {
    background-color: @bg-content;
    border-top: 1px solid @border-color-light;
    padding: 10px 12px;
    display: flex;
    gap: 6px;

    .action-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 0;
      border-radius: 6px;
      font-size: 12px;
      color: @text-secondary;
      background: @bg-surface-elevated;
      border: 1px solid @border-color-light;
      cursor: pointer;
      transition: all @transition-fast;
      white-space: nowrap;

      i {
        font-size: 13px;
      }

      &:hover {
        color: @primary-color;
        border-color: @primary-lighter;
        background: @primary-lighter;
      }

      &--danger {
        color: @error-color;
        &:hover {
          color: @error-color;
          border-color: @error-color;
          background: rgba(239, 68, 68, 0.05);
        }
      }
    }
  }
}

/* 列表视图 */
.app-code-link {
  color: @primary-color;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.text-muted {
  color: @text-tertiary;
}

.text-danger {
  color: @error-color;
}

/* 列表操作列 */
.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>
