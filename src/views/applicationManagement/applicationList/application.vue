<template>
  <div>
    <div class="query-toolbar">
      <el-form :inline="true" size="medium">
        <el-form-item>
          <el-input
              style="width: 280px;"
              minlength="0"
              maxlength="20"
              placeholder="请输入项目编码/名称"
              suffix-icon="el-icon-search"
              clearable
              v-model="searchText"></el-input>
        </el-form-item>

        <el-form-item label="启用状态">
          <el-select clearable size="medium" v-model="enableStatus" placeholder="请选择">
            <el-option
                v-for="item in enableStatusList"
                :key="item"
                :label="item"
                :value="item">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="项目分组">
          <el-select clearable size="medium" v-model="projectGroupCode" placeholder="请选择" @change="queryApplicationPage">
            <el-option
                v-for="item in projectGroupList"
                :key="item.projectGroupCode"
                :label="item.projectGroupName"
                :value="item.projectGroupCode">
              <span style="float: left">{{ item.projectGroupCode + '&emsp;' + item.projectGroupName }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="small" icon="el-icon-search" @click="queryApplicationPage">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-toolbar">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addProject">新增</el-button>

      <el-button type="success" size="small" icon="el-icon-download" @click="exportProjectTemplate">模板下载</el-button>
      <el-upload
          class="upload-demo"
          action="https://jsonplaceholder.typicode.com/posts/"
          :http-request="upload"
          :accept="uploadFileType"
          :show-file-list="false"
          :file-list="fileList">
        <el-button size="small" type="warning" icon="el-icon-upload">导入文件</el-button>
      </el-upload>

      <el-button type="info" size="small" icon="el-icon-refresh-left" @click="exportProjectTemplate">从Gitee同步</el-button>
      <el-button type="info" size="small" icon="el-icon-refresh-left" @click="exportProjectTemplate">从Gitlab同步</el-button>
    </div>

    <el-divider content-position="left">应用列表</el-divider>
    <el-empty v-show="projectList.length <= 0" description="无应用信息"></el-empty>

    <el-row v-show="projectList.length > 0" :gutter="20">
      <el-col v-for="project in projectList" :key="project.id" :span="6">

        <el-card shadow="hover" class="project-card">

          <div class="card-header">
            <span class="project-code">{{ project.projectCode }}</span>
            <el-switch
                :active-value="'启用'"
                :inactive-value="'停用'"
                v-model="project.enableStatus"
                @change="enableChange($event, project)">
            </el-switch>
          </div>

          <div class="card-body">
            <el-tag class="project-name" type="" size="small">{{ project.projectName }}</el-tag>
            <el-tag class="git-id-tag" type="info" size="small">
              git仓库项目ID：{{project.gitProjectId}}
            </el-tag>
          </div>

          <div class="card-footer">
            <div class="footer-main-actions">
              <el-button @click="toAppDeploy(project.id)" size="small" type="primary" icon="el-icon-aim">
                去部署
              </el-button>
              <el-button @click="toBranchManagement(project.id)" size="small" type="primary" plain icon="el-icon-s-help">
                分支管理
              </el-button>
            </div>
            <div class="footer-secondary-actions">
              <el-button @click.stop="applicationEdit(project.id)" size="small" type="primary" plain icon="el-icon-edit"></el-button>
              <el-button @click.stop="removeApplication(project.id)" size="small" type="danger" plain icon="el-icon-delete"></el-button>
            </div>
          </div>

        </el-card>
      </el-col>
    </el-row>

    <div class="pagination-container" v-show="projectList.length > 0">
      <el-pagination
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pageNum"
          :page-sizes="pageSizes"
          :page-size="pageCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>

    <el-drawer
        :before-close="handleClose"
        :visible.sync="dialog"
        direction="rtl"
        custom-class="demo-drawer"
        ref="drawer"
        :with-header="true"
        title="编辑应用"> <div class="demo-drawer__content">
      <el-form :model="saveProjectForm" :rules="rules" ref="saveProjectFormRef">
        <el-form-item prop="projectCode" label="项目编码" label-width="100px">
          <el-input style="width: 80%" v-model="saveProjectForm.projectCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="projectName" label="项目名称" label-width="100px">
          <el-input style="width: 80%" v-model="saveProjectForm.projectName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="projectGroupCode" label="分组名称" label-width="100px">
          <el-select size="medium" v-model="saveProjectForm.projectGroupId" placeholder="请选择">
            <el-option
                v-for="item in projectGroupList"
                :key="item.id"
                :label="item.projectGroupCode"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="gitUrl" label="git地址" label-width="100px">
          <el-input style="width: 80%" v-model="saveProjectForm.gitUrl" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="enableStatus" label="启用状态" label-width="100px">
          <el-select size="medium" v-model="saveProjectForm.enableStatus" placeholder="请选择">
            <el-option
                v-for="item in enableStatusList"
                :key="item"
                :label="item"
                :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

      <div class="demo-drawer__footer">
        <el-button @click="cancelForm">取 消</el-button>
        <el-button type="primary" @click="saveProject" :loading="loading">{{
            loading ? '提交中 ...' : '确 定'
          }}
        </el-button>
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
  exportProjectTemplate,
  getProjectInfo,
  importFile,
  queryProjectPage,
  removeProject,
  saveProject
} from "@/views/applicationManagement/applicationList/api";
import {queryList} from "@/views/applicationManagement/applicationGroup/api";

export default {
  name: "Application",
  data() {
    return {
      uploadFileType: '.xlsx, .xls',
      fileList: [],

      searchText: '',

      //启用状态选择器
      enableStatus: '启用',
      enableStatusList: ['启用', '停用'],

      //项目分组选择器
      projectGroupCode: '',
      projectGroupList: [],

      //编辑抽屉内容
      dialog: false,
      loading: false,
      saveProjectForm: {
        projectCode: '',
        projectName: '',
        projectGroupId: '',
        projectGroupCode: '',
        gitUrl: '',
        enableStatus: ''
      },

      //抽屉表单校验规则
      rules: {
        projectCode: [
          { required: true, message: '请输入项目编码', trigger: 'blur' },
          { min: 3, max: 40, message: '长度在3到40个字符', trigger: 'blur' },
        ],
        projectName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在3到30个字符', trigger: 'blur' },
        ],
        projectGroupId: [
          { required: true, message: '请选择项目分组', trigger: 'blur' },
        ],
        gitUrl: [
          { required: true, message: '请输入正确的git地址', trigger: 'blur' },
          { min: 12, max: 100, message: '长度在12到100个字符', trigger: 'blur' },
        ],
        enableStatus: [
          { required: true, message: '请选择启用状态', trigger: 'blur' },
        ]
      },

      //应用列表
      projectList: [
        {
          id: '',
          projectCode: '',
          projectName: '',
          projectGroupCode: '',
          projectGroupName: '',
          gitProjectId: '',
          gitUrl: '',
          enableStatus: ''
        }
      ],

      //分页组件
      total: 0,
      pageNum: 1,
      pageCount: 16,
      pageSizes: [16, 50, 100],
      // page: {
      //   pageNum: 1,
      //   pageCount: 10,
      // },
    };
  },
  methods: {
    getGroupList() {
      queryList({
        searchText: '',
        enableStatus: '启用'
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectGroupList = res.data.body
          this.projectGroupCode = res.data.body[0].projectGroupName
        }
      })
    },

    //每页展示数改变事件
    handleSizeChange(val) {
      this.pageCount = val;
      this.queryApplicationPage(this.pageCount)
    },

    //当前页改变事件
    handleCurrentChange(val) {
      this.pageNum = val;
      this.queryApplicationPage(this.pageNum)
    },

    //分页查询
    queryApplicationPage() {
      queryProjectPage({
        pageNum: this.pageNum,
        pageCount: this.pageCount,
        searchText: this.searchText,
        enableStatus: this.enableStatus,
        projectGroupCode: this.projectGroupCode
      }).then(res => {
        if (res.data.code === 2000) {
          const result = res.data.body;
          this.total = result.total;
          this.projectList = result.data;
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    // 编辑应用 (打开抽屉)
    modifyApplicationInfo(projectId) {
      this.getGroupList()
      this.dialog = true
      getProjectInfo({
        projectId: projectId
      }).then(res => {
        if (res.data.code === 2000) {
          this.saveProjectForm = res.data.body;
          this.dialog = true;
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    // 删除应用
    removeApplication(projectId) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeProject(projectId).then(res => {
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
    enableChange($event, project) {
      enableChange({
        projectId: project.id,
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

    //新增按钮绑定事件
    async addProject() {
      this.saveProjectForm = {}
      await this.getGroupList()
      this.dialog = true
    },

    //抽屉表单提交
    saveProject() {
      this.$refs.saveProjectFormRef.validate((valid) => {
        if (valid) {
          saveProject({
            ...this.saveProjectForm,
            shouldAddJenkinsJob: true
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                message: '添加项目成功！',
                type: 'success',
                duration: 1000,
                onClose: () => {
                  this.cancelForm()
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
          }).catch(err => {
            this.$message({
              message: '查询部署信息失败，原因：' + err,
              type: 'error',
              duration: 2000,
            });
            this.loading = false
          })
        }
      });
    },

    exportProjectTemplate() {
      exportProjectTemplate().then(res => {
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

    toBranchManagement(projectId) {
      this.$router.push({
        name: "branch",
        path: '/applicationManagement/branchManagement/branch',
        params: {
          projectId: projectId
        }
      });
    },

    toAppDeploy(projectId) {
      this.$router.push({
        path: "/applicationManagement/applicationList/applicationDeploy",
        query: { // <--- 必须使用 query
          projectId: projectId
        }
      });
    },

    applicationEdit(projectId) {
      this.$router.push({
        name: 'applicationEdit',
        path: "/applicationManagement/applicationList/applicationEdit",
        params: {
          projectId: projectId
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
    this.getGroupList()
    this.queryApplicationPage(1, 10);
  },
};
</script>

<style lang="less" scoped>
// 引入您的主题变量
// @import "~@/assets/css/theme.less"; // 假设您的变量在这里

// ---------------------------------
// 1. 顶部工具栏美化
// ---------------------------------
.query-toolbar {
  //margin-bottom: 20px;
  background-color: #ffffff;
  //padding: 20px 20px 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  // Element UI 表单项默认 margin-bottom 太大，在工具栏中缩小
  ::v-deep .el-form-item {
    margin-bottom: 10px;
  }
}

.action-toolbar {
  margin-bottom: 20px;

  .upload-demo {
    display: inline-block;
    margin: 0 10px; // 调整上传按钮的间距
  }
}

// ---------------------------------
// 2. 卡片 (Card) 布局美化
// ---------------------------------
.project-card {
  height: 100%; // 确保卡片在 el-col 中等高
  display: flex;
  flex-direction: column; // 垂直布局

  // 修复 Element UI Card 的默认 padding
  ::v-deep .el-card__body {
    padding: 20px;
    flex: 1; // 让 body 自动撑满剩余空间
    display: flex;
    flex-direction: column;
  }

  // 卡片头部
  .card-header {
    display: flex;
    justify-content: space-between; // 两端对齐
    align-items: center;
    margin-bottom: 15px;

    .project-code {
      font-size: 18px;
      font-weight: bold;
      color: #333; // 使用更柔和的黑色
    }
  }

  // 卡片主体
  .card-body {
    flex: 1; // 自动撑满
    .project-name {
      color: #606266;
      margin-bottom: 10px;
    }
    .git-id-tag {
      margin-left: 10px;
      margin-top: 5px; // 分隔
    }
  }

  // 卡片底部 (操作按钮)
  .card-footer {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #EBEEF5;

    display: flex;
    justify-content: space-between; // 两端对齐
    align-items: center;

    .footer-main-actions {
      // 主要操作 (左侧)
      .el-button {
        // 移除不必要的间距
        margin-right: 10px;
      }
    }
    .footer-secondary-actions {
      // 次要操作 (右侧)
      .el-button {
        margin-left: 5px;
      }
    }
  }
}

// ---------------------------------
// 3. 分页 (Pagination) 布局修复
// ---------------------------------
.pagination-container {
  // 移除 "position: absolute"
  text-align: right; // 企业级分页通常靠右
  margin-top: 20px;
  padding: 10px 0;
}

// ---------------------------------
// 4. 抽屉 (Drawer) 页脚美化
// ---------------------------------

// 抽屉内容的内边距
.demo-drawer__content {
  padding: 20px;
  // 确保内容可滚动
  overflow-y: auto;
  // 减去页脚的高度
  height: calc(100vh - 80px); // 假设页脚 80px
}

.demo-drawer__footer {
  // 用于放置抽屉的 "取消" "确定" 按钮
  padding: 20px;
  border-top: 1px solid #E8E8E8;
  text-align: right;

  // 固定在抽屉底部
  position: absolute;
  bottom: 0;
  width: 100%;
  background: #fff;
  box-sizing: border-box; // 确保 padding 不会撑开宽度

  .el-button {
    margin-left: 10px;
  }
}

// ---------------------------------
// 5. 覆盖旧的、不稳定的样式
// ---------------------------------
.el-input, .el-select {
  // 移除旧的固定宽度，让它们在表单中自适应
  width: auto;
  min-width: 190px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.el-col {
  margin-bottom: 20px; // 统一 el-col 间距
  border-radius: 4px;
}
</style>