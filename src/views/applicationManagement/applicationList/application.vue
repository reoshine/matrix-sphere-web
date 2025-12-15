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

    <el-drawer
        :title="saveApplicationForm.id ? '编辑应用配置' : '新增应用'"
        :visible.sync="dialog"
        :before-close="handleClose"
        size="500px"
        :wrapperClosable="false"
    >
      <div class="drawer-content">
        <el-form :model="saveApplicationForm" :rules="rules" ref="saveApplicationFormRef" label-width="100px" label-position="top">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item prop="applicationCode" label="项目编码">
                <el-input v-model="saveApplicationForm.applicationCode" placeholder="例如: matrix-user-service" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="applicationName" label="项目名称">
                <el-input v-model="saveApplicationForm.applicationName" placeholder="例如: 用户中心服务" />
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
              <el-form-item prop="gitUrl" label="Git 仓库地址">
                <el-input type="input" :rows="2" v-model="saveApplicationForm.gitUrl" placeholder="git@gitee.com:..." />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="drawer-footer">
          <el-button @click="cancelForm">取 消</el-button>
          <el-button type="primary" @click="saveApplication" :loading="loading">确 定</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
//
// 您的 <script> 部分与原来完全相同
//
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
import {queryList} from "@/views/applicationManagement/applicationGroup/api";

export default {
  name: "Application",
  data() {
    return {
      uploadFileType: '.xlsx, .xls',
      fileList: [],

      searchText: '',
      enableStatus: '', // 默认为空查全部更合理
      enableStatusList: ['启用', '停用'],

      applicationGroupCode: '',
      applicationGroupList: [],

      dialog: false,
      loading: false,
      saveApplicationForm: {
        id: undefined, // 确保有id字段
        applicationCode: '',
        applicationName: '',
        applicationGroupId: '',
        applicationGroupCode: '',
        gitUrl: '',
        enableStatus: '启用'
      },

      rules: {
        applicationCode: [
          { required: true, message: '请输入项目编码', trigger: 'blur' },
          { min: 3, max: 40, message: '长度在3到40个字符', trigger: 'blur' },
        ],
        applicationName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
        ],
        applicationGroupId: [
          { required: true, message: '请选择项目分组', trigger: 'change' }, // select用change
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
      pageSize: 16, // 卡片布局下每页多一点比较好看
      pageSizes: [12, 16, 24, 48], // 适配栅格系统(每行4个)
    };
  },
  methods: {
    getGroupList() {
      queryList({ searchText: '', enableStatus: '启用' }).then(res => {
        if (res.data.code === 2000) {
          this.applicationGroupList = res.data.body || []
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
      this.searchText = '';
      this.enableStatus = '';
      this.applicationGroupCode = '';
      this.queryApplicationPage();
    },

    //分页查询
    queryApplicationPage() {
      queryPage({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        searchText: this.searchText,
        enableStatus: this.enableStatus || undefined,
        applicationGroupCode: this.applicationGroupCode || undefined
      }).then(res => {
        if (res.data.code === 2000) {
          const result = res.data.body;
          this.total = result.total;
          this.applicationList = result.list || [];
        }
      }).catch(err => {
        this.$message.error('查询失败：' + err);
      })
    },

    async addApplication() {
      this.saveApplicationForm = { enableStatus: '启用' }; // 重置并给默认值
      // 如果分组列表为空，先加载
      if (this.applicationGroupList.length === 0) {
        await this.getGroupList();
      }
      this.dialog = true;
      this.$nextTick(() => {
        this.$refs.saveApplicationFormRef && this.$refs.saveApplicationFormRef.clearValidate();
      });
    },

    modify(id) {
      // 先获取详情再打开
      getApplicationById(id).then(res => {
        if (res.data.code === 2000) {
          this.saveApplicationForm = res.data.body;
          this.dialog = true;
          // 确保分组列表已加载
          if (this.applicationGroupList.length === 0) this.getGroupList();
        }
      });
    },

    // 删除应用
    removeApplication(applicationId) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeApplication(applicationId).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.queryApplicationPage();
          } else {
            this.$message({
              message: res.data.message,
              type: 'error',
              duration: 3000,
            });
          }
        }).catch(err => {
          this.$message({
            message: '查询部署信息失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
        })
      })
    },

    // 修改启用状态
    enableChange($event, application) {
      enableChange({
        applicationId: application.id,
        enableStatus: $event
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message({
            type: 'success',
            message: '已启用!',
            duration: 1000
          });
          this.timer = setTimeout(() => {
            this.queryApplicationPage()
          }, 1000);
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //抽屉表单提交
    saveApplication() {
      this.$refs.saveApplicationFormRef.validate((valid) => {
        if (valid) {
          this.loading = true; // 开启 loading 防止重复点击

          // 1. 判断操作类型
          const isEdit = !!this.saveApplicationForm.id;

          // 2. 准备请求 Promise
          let requestPromise;
          if (isEdit) {
            // --- 修改逻辑 ---
            // 注意：根据之前的后端定义，修改接口不需要 shouldAddJenkinsJob 参数
            // 且后端 modifyApplication(ApplicationModifyRequest request) 需要 id
            requestPromise = modifyApplication(this.saveApplicationForm);
          } else {
            // --- 新增逻辑 ---
            requestPromise = saveApplication({
              ...this.saveApplicationForm,
              shouldAddJenkinsJob: true // 新增时才需要这个标志
            });
          }

          // 3. 执行请求
          requestPromise.then(res => {
            if (res.data.code === 2000) {
              this.$message({
                message: isEdit ? '修改应用成功！' : '添加应用成功！',
                type: 'success',
                duration: 1000,
                onClose: () => {
                  this.cancelForm();
                  this.queryApplicationPage();
                }
              });
            } else {
              this.$message({
                message: res.data.message,
                type: 'error',
                duration: 3000,
              });
            }
          }).catch(err => {
            this.$message({
              message: (isEdit ? '修改' : '新增') + '失败，原因：' + err,
              type: 'error',
              duration: 2000,
            });
          }).finally(() => {
            this.loading = false; // 关闭 loading
          });
        }
      });
    },

    exportApplicationTemplate() {
      exportApplicationTemplate().then(res => {
        let blob = new Blob([res.data], {
          type: 'application/vnd.ms-excel;charset=utf-8'
        })
        let contentDisposition = res.headers['content-disposition']
        let pattern = new RegExp('filename=([^;]+\\.[^.;]+);*')
        let result = pattern.exec(contentDisposition)
        let fileName = decodeURI(result[1])
        let downloadElement = document.createElement('a')
        //创建下载的链接
        let href = window.URL.createObjectURL(blob)
        downloadElement.style.display = 'none'
        downloadElement.href = href
        //下载后文件名
        downloadElement.download = fileName
        document.body.appendChild(downloadElement)
        //点击下载
        downloadElement.click()
        //下载完成移除元素
        document.body.removeChild(downloadElement)
        //释放掉blob对象
        window.URL.revokeObjectURL(href)
      })
    },

    toBranchManagement(applicationId) {
      this.$router.push({
        name: "branch",
        path: '/applicationManagement/branchManagement/branch',
        params: {
          applicationId: applicationId
        }
      });
    },

    toAppDeploy(applicationId) {
      this.$router.push({
        path: "/applicationManagement/applicationList/applicationDeploy",
        query: { // <--- 必须使用 query
          applicationId: applicationId
        }
      });
    },

    applicationEdit(applicationId) {
      this.$router.push({
        name: 'applicationEdit',
        path: "/applicationManagement/applicationList/applicationEdit",
        params: {
          applicationId: applicationId
        }
      });
    },

    upload(content) {
      console.log(content)
      importFile({
        file: content.file,
      }, {
        headers: {'Content-Type':'multipart/form-data'}
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message({
            message: '导入项目成功！',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.queryApplicationPage()
            }
          });
        } else {
          this.$message({
            message: res.data.message,
            type: 'error',
            duration: 3000,
          });
        }
      })
    },

    //
    handleClose(done) {
      if (this.loading) {
        return;
      }
      this.$confirm('确认关闭吗？')
          .then(_ => {
            done();
          })
          .catch(_ => {
          });
    },

    cancelForm() {
      this.loading = false;
      this.dialog = false;
      clearTimeout(this.timer);
    },


  },
  created() {
    this.getGroupList();
    this.queryApplicationPage();
  }
};
</script>

<style lang="less" scoped>
/* MatrixSphere 全局容器 */
.app-container {
  padding: 20px;
  background-color: #f0f2f5; /* 核心：浅灰底色 */
  min-height: calc(100vh - 84px);
}

/* 搜索栏卡片化 */
.filter-container {
  margin-bottom: 15px;
  border: none;
  :deep(.el-card__body) {
    padding-bottom: 0; /* 紧凑设计 */
  }
}

/* 操作栏：左右布局 */
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

/* 卡片网格系统 */
.card-grid {
  .el-col {
    margin-bottom: 15px;
  }
}

/* 卡片精细化设计 */
.application-card {
  border: none;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-3px); /* 悬浮上移效果 */
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      overflow: hidden;

      .icon-bg {
        background: #e6f7ff;
        color: #1890ff;
        padding: 6px;
        border-radius: 4px;
        margin-right: 8px;
        font-size: 16px;
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

  .card-body {
    padding: 15px 20px;
    height: 100px; /* 固定高度，防止卡片参差不齐 */
    display: flex;
    flex-direction: column;

    .application-name {
      color: #606266;
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 10px;
      height: 40px; /* 限制名称高度 */
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .meta-row {
      margin-top: auto; /* 底部对齐 */
      display: flex;
      gap: 5px;
    }
  }

  .card-footer {
    background-color: #fafafa;
    border-top: 1px solid #f0f0f0;
    padding: 0 10px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .main-actions {
      flex: 1;
      display: flex;
      justify-content: center;

      .el-button {
        padding: 0 15px;
        color: #606266;
        &:hover {
          color: #409EFF;
        }
      }
    }

    .more-actions {
      padding-right: 10px;
      cursor: pointer;
      color: #909399;
      &:hover {
        color: #409EFF;
      }
    }
  }
}

/* 分页容器 */
.pagination-container {
  background: #fff;
  padding: 10px 20px;
  text-align: right;
  margin-top: 0; /* 紧接内容 */
}

/* 抽屉内部样式 */
.drawer-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.drawer-content form {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}
.drawer-footer {
  border-top: 1px solid #e8e8e8;
  padding: 15px 0 0;
  text-align: right;
}

.text-danger {
  color: #F56C6C;
}
</style>