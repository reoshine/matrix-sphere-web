<template>
  <PageContainer title="应用列表" subtitle="管理所有应用及其部署配置">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="addApplication">新增应用</el-button>
      <el-dropdown trigger="click" @command="handleHeaderCommand" style="margin-left: 10px;">
        <el-button plain size="small">
          更多操作 <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="download" icon="el-icon-download">模板下载</el-dropdown-item>
          <el-dropdown-item command="import" icon="el-icon-upload2">导入应用</el-dropdown-item>
          <el-dropdown-item divided command="sync-gitee" icon="el-icon-connection">从 Gitee 同步</el-dropdown-item>
          <el-dropdown-item command="sync-gitlab" icon="el-icon-connection">从 GitLab 同步</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-upload
          ref="uploadRef"
          class="upload-hidden"
          action="#"
          :http-request="upload"
          :accept="uploadFileType"
          :show-file-list="false"
      >
      </el-upload>
    </template>

    <!-- 筛选区 -->
    <template #filter>
      <FilterBar @search="queryApplicationPage" @reset="resetQuery">
        <el-form-item label="应用搜索">
          <el-input
              v-model="searchText"
              placeholder="输入编码/名称"
              prefix-icon="el-icon-search"
              clearable
              style="width: 240px;"
              size="small"
              @keyup.enter.native="queryApplicationPage"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="enableStatus" placeholder="全部" clearable style="width: 120px;" size="small">
            <el-option v-for="item in enableStatusList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目分组">
          <el-select
              v-model="applicationGroupCode"
              placeholder="请选择分组"
              clearable
              filterable
              style="width: 180px;"
              size="small"
              @change="queryApplicationPage"
          >
            <el-option
                v-for="item in applicationGroupList"
                :key="item.applicationGroupCode"
                :label="item.applicationGroupName"
                :value="item.applicationGroupCode"
            >
              <span style="float: left">{{ item.applicationGroupName }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px; margin-left: 10px">{{ item.applicationGroupCode }}</span>
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
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="card">
            <i class="el-icon-menu"></i>
          </el-radio-button>
          <el-radio-button label="list">
            <i class="el-icon-s-grid"></i>
          </el-radio-button>
        </el-radio-group>
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
                    active-color="#13ce66"
                    inactive-color="#ff4949"
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
                <div class="main-actions">
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
                </div>
                <div class="more-actions">
                  <el-dropdown trigger="hover" placement="top">
                    <span class="el-dropdown-link">
                      <i class="el-icon-more"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item icon="el-icon-setting" @click.native="applicationEdit(application.id)">
                        配置流水线
                      </el-dropdown-item>
                      <el-dropdown-item icon="el-icon-edit" @click.native="modify(application.id)">
                        修改基础信息
                      </el-dropdown-item>
                      <el-dropdown-item divided icon="el-icon-delete" class="text-danger" @click.native="removeApplication(application.id)">
                        删除应用
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
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
                  <el-dropdown-item icon="el-icon-edit" command="edit-basic">修改基础信息</el-dropdown-item>
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
            <el-form-item prop="initTemplateId" label="初始化构建模板">
              <el-select
                  v-model="saveApplicationForm.initTemplateId"
                  placeholder="请选择构建模板（强烈推荐，将自动生成 Jenkins 配置）"
                  style="width: 100%"
                  clearable
                  @focus="fetchSystemTemplates"
              >
                <el-option
                    v-for="item in systemTemplates"
                    :key="item.id"
                    :label="item.templateName"
                    :value="item.id"
                >
                  <span style="float: left">{{ item.templateName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 12px">
                    {{ item.isDefault ? '默认' : '' }}
                  </span>
                </el-option>
              </el-select>
              <div style="font-size: 12px; color: #909399; line-height: 1.5; margin-top: 4px;">
                <i class="el-icon-info"></i> 选中后，系统将以该模板为原型，为您自动生成 Jenkinsfile 和 Job 配置。
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
  exportApplicationTemplate,
  getApplicationById,
  importFile,
  queryPage,
  removeApplication,
  saveApplication,
  modifyApplication
} from "@/views/applicationManagement/applicationList/api";
import {getTemplateList} from '@/views/applicationManagement/deployTemplate/api'
import {queryList} from "@/views/applicationManagement/applicationGroup/api";

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
      uploadFileType: '.xlsx, .xls',
      fileList: [],
      viewMode: 'card',
      tableLoading: false,
      selectedRows: [],

      searchText: '',
      enableStatus: null,
      enableStatusList: [{ label: '启用', value: 1 }, { label: '停用', value: 0 }],

      applicationGroupCode: '',
      applicationGroupList: [],

      systemTemplates: [],
      templatesLoaded: false,

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
        initTemplateId: null
      },

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
    handleHeaderCommand(command) {
      switch (command) {
        case 'download':
          this.exportApplicationTemplate()
          break
        case 'import':
          this.$refs.uploadRef.$el.querySelector('input').click()
          break
        case 'sync-gitee':
          this.handleSyncRepo('gitee')
          break
        case 'sync-gitlab':
          this.handleSyncRepo('gitlab')
          break
      }
    },
    handleSyncRepo(command) {
      const label = command === 'gitee' ? 'Gitee' : 'GitLab'
      this.$message.info(`从 ${label} 同步仓库功能正在开发中`)
    },
    getGroupList() {
      queryList({ searchText: '', enableStatus: 1 }).then(res => {
        if (res.code === 200) {
          this.applicationGroupList = res.data || []
        }
      })
    },

    fetchSystemTemplates() {
      if (this.templatesLoaded) return;

      getTemplateList({
        scope: 'SYSTEM',
        templateType: 'JENKINSFILE'
      }).then(res => {
        if (res.code === 200) {
          this.systemTemplates = res.data || [];
          this.templatesLoaded = true;

          const defaultTemp = this.systemTemplates.find(t => t.isDefault);
          if (defaultTemp && !this.saveApplicationForm.initTemplateId) {
            this.saveApplicationForm.initTemplateId = defaultTemp.id;
          }
        }
      });
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
      this.searchText = '';
      this.enableStatus = null;
      this.applicationGroupCode = '';
      this.queryApplicationPage();
    },

    queryApplicationPage() {
      this.tableLoading = true;
      queryPage({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        searchText: this.searchText,
        enableStatus: this.enableStatus !== null ? this.enableStatus : undefined,
        applicationGroupCode: this.applicationGroupCode || undefined
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
        initTemplateId: undefined
      };

      this.templatesLoaded = false;
      this.systemTemplates = [];

      if (this.applicationGroupList.length === 0) {
        await this.getGroupList();
      }

      this.dialog = true;

      this.$nextTick(() => {
        this.$refs.saveApplicationFormRef && this.$refs.saveApplicationFormRef.clearValidate();
        this.fetchSystemTemplates();
      });
    },

    modify(id) {
      getApplicationById(id).then(res => {
        if (res.code === 200) {
          this.saveApplicationForm = res.data;
          this.dialog = true;
          this.templatesLoaded = false;
          this.fetchSystemTemplates();
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
      enableChange({
        applicationId: application.id,
        enableStatus: $event
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('状态已更新');
        } else {
          application.enableStatus = $event === 1 ? 0 : 1;
          this.$message.error(res.message);
        }
      })
    },

    saveApplication() {
      this.$refs.saveApplicationFormRef.validate((valid) => {
        if (valid) {
          this.loading = true;
          const isEdit = !!this.saveApplicationForm.id;
          let requestPromise;

          if (isEdit) {
            requestPromise = modifyApplication(this.saveApplicationForm);
          } else {
            requestPromise = saveApplication({
              ...this.saveApplicationForm,
              shouldAddJenkinsJob: true
            });
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

    exportApplicationTemplate() {
      exportApplicationTemplate().then(res => {
        let blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=utf-8' })
        let contentDisposition = res.headers['content-disposition']
        let fileName = 'application_template.xlsx';
        if (contentDisposition) {
          let pattern = new RegExp('filename=([^;]+\\.[^.;]+);*')
          let result = pattern.exec(contentDisposition)
          if(result) fileName = decodeURI(result[1])
        }
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName
        link.click()
        window.URL.revokeObjectURL(link.href)
      })
    },

    toBranchManagement(applicationId) {
      this.$router.push({
        name: "branch",
        path: '/applicationManagement/branchManagement/branch',
        params: { applicationId: applicationId }
      });
    },

    toAppDeploy(applicationId) {
      this.$router.push({
        path: "/applicationManagement/applicationList/applicationDeploy",
        query: { applicationId: applicationId }
      });
    },

    applicationEdit(applicationId) {
      this.$router.push({
        name: 'applicationEdit',
        path: "/applicationManagement/applicationList/applicationEdit",
        params: { applicationId: applicationId }
      });
    },

    upload(content) {
      importFile({ file: content.file }, {
        headers: {'Content-Type':'multipart/form-data'}
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('应用导入成功！');
          this.queryApplicationPage();
        } else {
          this.$message.error(res.message);
        }
      })
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    handleRowCommand(command, row) {
      switch (command) {
        case 'edit-pipeline':
          this.applicationEdit(row.id);
          break;
        case 'edit-basic':
          this.modify(row.id);
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

/* 隐藏的文件上传触发器 */
.upload-hidden {
  display: none;
}

/* 工具栏 */
.toolbar-left {
  .result-count {
    font-size: @font-size-sm;
    color: @text-tertiary;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: @space-3;
}

/* 卡片网格 */
.card-grid {
  .el-col { margin-bottom: @space-4; }
}

/* 卡片样式 */
.application-card {
  border: 1px solid @border-color-light;
  background-color: #fff;
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
        background: var(--color-blue-50);
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
    padding: 0 12px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .main-actions {
      display: flex;
      gap: 8px;
      align-items: center;

      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 13px;
        color: @text-secondary;
        background: #fff;
        border: 1px solid @border-color-light;
        cursor: pointer;
        transition: all @transition-fast;

        i {
          font-size: 14px;
        }

        &:hover {
          color: @primary-color;
          border-color: @primary-lighter;
          background: var(--color-blue-50);
        }
      }
    }

    .more-actions {
      padding: 8px;
      cursor: pointer;
      color: @text-tertiary;
      border-radius: @border-radius-sm;
      transition: all @transition-fast;

      &:hover {
        color: @primary-color;
        background-color: @primary-lighter;
      }

      i {
        font-size: 16px;
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
