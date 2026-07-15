<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" size="small" @submit.native.prevent>
        <el-form-item label="应用搜索">
          <el-input
              v-model="searchText"
              placeholder="输入编码/名称"
              prefix-icon="el-icon-search"
              clearable
              style="width: 240px;"
              @keyup.enter.native="queryApplicationPage"
          />
        </el-form-item>

        <el-form-item label="启用状态">
          <el-select v-model="enableStatus" placeholder="全部" clearable style="width: 120px;">
            <el-option v-for="item in enableStatusList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="项目分组">
          <el-select
              v-model="applicationGroupCode"
              placeholder="请选择分组"
              clearable
              filterable
              style="width: 180px;"
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

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="queryApplicationPage">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-bar">
      <div class="left-panel">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="addApplication">新增应用</el-button>
      </div>
      <div class="right-panel">
        <el-button plain size="small" icon="el-icon-download" @click="exportApplicationTemplate">模板下载</el-button>

        <el-upload
            class="upload-inline"
            action="#"
            :http-request="upload"
            :accept="uploadFileType"
            :show-file-list="false"
        >
          <el-button plain size="small" icon="el-icon-upload2">导入</el-button>
        </el-upload>

        <el-dropdown trigger="click" style="margin-left: 10px;">
          <el-button plain size="small" icon="el-icon-connection">
            同步仓库 <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="el-icon-loading">从 Gitee 同步</el-dropdown-item>
            <el-dropdown-item icon="el-icon-loading">从 GitLab 同步</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <el-empty v-show="applicationList.length <= 0" description="暂无应用信息"></el-empty>

    <div v-show="applicationList.length > 0" class="card-grid">
      <el-row :gutter="15">
        <el-col v-for="application in applicationList" :key="application.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-card shadow="hover" class="application-card" :body-style="{ padding: '0px' }">

            <div class="card-header">
              <div class="header-title">
                <i class="el-icon-monitor icon-bg"></i>
                <span class="code" :title="application.applicationCode">{{ application.applicationCode }}</span>
              </div>
              <el-switch
                  v-model="application.enableStatus"
                  active-value="启用"
                  inactive-value="停用"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  @change="enableChange($event, application)"
              />
            </div>

            <div class="card-body">
              <div class="application-name" :title="application.applicationName">{{ application.applicationName }}</div>
              <div class="meta-row">
                <el-tag size="mini" type="info" effect="plain">ID: {{ application.gitApplicationId || 'N/A' }}</el-tag>
                <el-tag size="mini" type="info" effect="light" v-if="application.applicationGroupCode">{{ application.applicationGroupCode }}</el-tag>
              </div>
            </div>

            <div class="card-footer">
              <div class="main-actions">
                <el-tooltip content="进入部署控制台" placement="top" :open-delay="500">
                  <el-button type="text" icon="el-icon-s-promotion" @click="toAppDeploy(application.id)">部署</el-button>
                </el-tooltip>
                <el-divider direction="vertical"></el-divider>
                <el-button type="text" icon="el-icon-share" @click="toBranchManagement(application.id)">分支</el-button>
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

    <div class="pagination-container" v-show="applicationList.length > 0">
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
    </div>

    <el-dialog
        :visible.sync="dialog"
        width="520px"
        :before-close="handleClose"
        :close-on-click-modal="false"
        custom-class="matrix-dialog"
        append-to-body
    >
      <div slot="title" class="dialog-header-custom">
        <i :class="saveApplicationForm.id ? 'el-icon-edit-outline' : 'el-icon-plus'"></i>
        <span class="title-text">{{ saveApplicationForm.id ? '编辑应用信息' : '创建新应用' }}</span>
      </div>

      <div class="dialog-content">
        <el-form
            :model="saveApplicationForm"
            :rules="rules"
            ref="saveApplicationFormRef"
            label-width="80px"
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
                  <el-option v-for="item in enableStatusList" :key="item" :label="item" :value="item" />
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
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelForm" size="medium">取 消</el-button>
        <el-button type="primary" @click="saveApplication" :loading="loading" size="medium">
          {{ saveApplicationForm.id ? '保存修改' : '立即创建' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
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
  data() {
    return {
      uploadFileType: '.xlsx, .xls',
      fileList: [],

      searchText: '',
      enableStatus: '',
      enableStatusList: ['启用', '停用'],

      applicationGroupCode: '',
      applicationGroupList: [],

      systemTemplates: [],
      // 标记是否已加载，避免重复请求
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
        enableStatus: '启用',
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
    getGroupList() {
      queryList({ searchText: '', enableStatus: '启用' }).then(res => {
        if (res.code === 200) {
          this.applicationGroupList = res.data || []
        }
      })
    },

    // 懒加载系统模板
    fetchSystemTemplates() {
      if (this.templatesLoaded) return;

      // 1. 调用 API (注意这里不需要传 applicationId)
      getTemplateList({
        scope: 'SYSTEM',
        templateType: 'JENKINSFILE'
      }).then(res => {
        if (res.code === 200) {
          this.systemTemplates = res.data || [];
          this.templatesLoaded = true;

          // 2. [修复点] 自动选中默认模板
          const defaultTemp = this.systemTemplates.find(t => t.isDefault);

          // 错误写法: if (defaultTemp && !this.form.initTemplateId)
          // 正确写法: ↓↓↓
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
      this.enableStatus = '';
      this.applicationGroupCode = '';
      this.queryApplicationPage();
    },

    queryApplicationPage() {
      queryPage({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        searchText: this.searchText,
        enableStatus: this.enableStatus || undefined,
        applicationGroupCode: this.applicationGroupCode || undefined
      }).then(res => {
        if (res.code === 200) {
          const result = res.data;
          this.total = result.total;
          this.applicationList = result.list || [];
        }
      }).catch(err => {
        this.$message.error('查询失败：' + err);
      })
    },

    async addApplication() {
      // [修改] 重置表单，显式包含 initTemplateId
      this.saveApplicationForm = {
        enableStatus: '启用',
        initTemplateId: undefined
      };

      // [修改] 重置模板加载状态，确保重新打开时能重新加载或重置选项
      this.templatesLoaded = false;
      this.systemTemplates = [];

      if (this.applicationGroupList.length === 0) {
        await this.getGroupList();
      }

      this.dialog = true;

      this.$nextTick(() => {
        this.$refs.saveApplicationFormRef && this.$refs.saveApplicationFormRef.clearValidate();
        // [修改] 弹窗打开后，触发系统模板预加载
        this.fetchSystemTemplates();
      });
    },

    modify(id) {
      getApplicationById(id).then(res => {
        if (res.code === 200) {
          this.saveApplicationForm = res.data;
          this.dialog = true;
          // [修复] 编辑时也需要加载模板列表，否则下拉框是空的
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
          application.enableStatus = $event === '启用' ? '停用' : '启用';
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
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 189px);
}

.filter-container {
  margin-bottom: 15px;
  border: none;
  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  .right-panel {
    display: flex;
    align-items: center;
    .upload-inline {
      display: inline-block;
      margin-left: 10px;
    }
  }
}

.card-grid {
  .el-col { margin-bottom: 15px; }
}

/* === 卡片样式深度优化 (Fixed Height & Stable Interaction) === */
.application-card {
  border: 1px solid #ebeef5; /* 默认浅边框 */
  background-color: #fff;
  transition: box-shadow 0.3s, border-color 0.3s; /* 移除 transform 过渡 */
  border-radius: 8px;
  overflow: visible;
  position: relative; /* 保持定位基准 */

  /* 悬停状态：仅改变阴影和边框颜色，绝对不移动位置 */
  &:hover {
    /* 移除 transform: translateY(-5px); */

    /* 更加柔和深邃的阴影，营造悬浮感但不发生位移 */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(64, 158, 255, 0.1);

    /* 边框变蓝，明确告知用户当前聚焦 */
    border-color: #c6e2ff;
  }

  /* 1. Header: 固定高度 55px */
  .card-header {
    height: 55px;
    padding: 0 20px;
    border-bottom: 1px solid #f0f0f0;
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
        background: #e6f7ff;
        color: #1890ff;
        padding: 6px;
        border-radius: 6px;
        margin-right: 10px;
        font-size: 16px;
        flex-shrink: 0;
      }
      .code {
        font-weight: 600;
        color: #303133;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  /* 2. Body: 固定高度 100px */
  .card-body {
    padding: 15px 20px;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .application-name {
      color: #5e6d82;
      font-size: 13px;
      line-height: 20px;
      height: 40px;
      margin-bottom: 8px;
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
    }
  }

  /* 3. Footer: 固定高度 48px */
  .card-footer {
    background-color: #fafafa;
    border-top: 1px solid #f0f0f0;
    padding: 0 12px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 0 0 8px 8px;

    .main-actions {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center; /* 确保垂直居中 */

      .el-button {
        padding: 8px 15px; /* 增加点击热区，但不影响视觉 */
        font-weight: 500;
        color: #606266;
        background: transparent !important; /* 强制移除背景色 */
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;

        /* 针对图标的独立动画 */
        i {
          margin-right: 4px;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 弹性贝塞尔曲线 */
        }

        &:hover {
          color: #409EFF;
          /* 移除之前的 background-color 设置 */

          /* 悬停时图标放大 1.2倍，产生“弹起”效果 */
          i {
            transform: scale(1.25);
          }
        }
      }

      /* 优化分割线样式，使其更淡更协调 */
      .el-divider--vertical {
        height: 1.2em;
        background-color: #e8e8e8;
        margin: 0 5px;
      }
    }

    .more-actions {
      padding: 8px;
      cursor: pointer;
      color: #909399;
      border-radius: 4px;
      transition: all 0.3s;

      /* 右侧更多按钮：悬停时给一个淡淡的方形背景，因为它没有文字，适合这种样式 */
      &:hover {
        color: #409EFF;
        background-color: rgba(64, 158, 255, 0.1);
      }

      i {
        font-size: 16px; /* 稍微调大图标 */
      }
    }
  }
}

.pagination-container {
  background: #fff;
  padding: 15px 20px;
  text-align: right;
  border-radius: 4px;
}

/* === MatrixSphere Dialog === */
:deep(.matrix-dialog) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  .el-dialog__header {
    padding: 0;
    border-bottom: 1px solid #ebeef5;
  }

  .el-dialog__body {
    padding: 25px 30px 10px 30px;
  }

  .el-dialog__footer {
    padding: 15px 30px 20px 30px;
    background-color: #f9fafc;
    border-top: 1px solid #ebeef5;
  }
}

.dialog-header-custom {
  padding: 20px 25px;
  background-color: #fff;
  display: flex;
  align-items: center;

  i {
    font-size: 20px;
    margin-right: 10px;
    color: #409EFF;
    &.el-icon-edit-outline {
      color: #E6A23C;
    }
  }

  .title-text {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    letter-spacing: 0.5px;
  }
}

.text-danger {
  color: #F56C6C;
}
</style>