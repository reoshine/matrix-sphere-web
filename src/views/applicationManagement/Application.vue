<template>
  <div>
    <div class="demo-input-size">
      <div>
        <el-input
          minlength="0"
          maxlength="20"
          style="width: 280px;"
          size="medium"
          placeholder="请输入项目编码/名称，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>

        <label style="margin-left:20px" for="enableStatus">启用状态：</label>
        <el-select clearable size="medium" v-model="enableStatus" placeholder="请选择">
          <el-option
            v-for="item in enableStatusList"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>

        <label style="margin-left:20px" for="projectGroupCode">项目分组：</label>
        <el-select clearable size="medium" v-model="projectGroupCode" placeholder="请选择" @change="queryApplicationPage">
          <el-option
            v-for="item in projectGroupCodeList"
            :key="item.projectGroupCode"
            :label="item.projectGroupCode"
            :value="item.projectGroupCode">
          </el-option>
        </el-select>

        <el-button type="primary" size="small" icon="el-icon-search" @click="queryApplicationPage">查询</el-button>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addProject">新增</el-button>
        <el-button type="primary" size="small" icon="el-icon-download" @click="exportProjectTemplate">模板下载</el-button>
        <el-button type="warning" size="small" icon="el-icon-refresh-left" @click="exportProjectTemplate">从Gitee同步</el-button>
        <el-button type="warning" size="small" icon="el-icon-refresh-left" @click="exportProjectTemplate">从Gitlab同步</el-button>
        <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :http-request="upload"
            :accept="uploadFileType"
            :show-file-list="false"
            :file-list="fileList">
          <el-button size="small" type="warning" icon="el-icon-upload">导入文件</el-button>
        </el-upload>
      </div>
    </div>
    <el-divider content-position="left">应用列表</el-divider>
    <el-empty v-show="projectList.length <= 0" description="无应用信息"></el-empty>
    <el-row v-show="projectList.length > 0" :gutter="20">
      <el-col v-for="project in projectList" :key="project.id" :span="6">
        <el-card shadow="hover" :body-style="{ padding: '0px' }">
          <div style="padding: 10px">
            <svg style="float: right" class="icon" aria-hidden="true">
              <use xlink:href="#icon-gitlab"></use>
            </svg>
            <div style="color: #2b4b6b; font-weight: bold">{{ project.projectCode }}</div>
            <div>
              <span style="float: right; margin-right: -23px;" @click.stop="project.enableStatus === 1 ? 0 : 1">
                <el-switch
                    style="padding: 0 10px"
                    :active-value="'启用'"
                    :inactive-value="'停用'"
                    v-model="project.enableStatus"
                    @change="enableChange($event, project)">
                </el-switch>
              </span>
              <el-tag style="color: #324157" type="" size="small">{{ project.projectName }}</el-tag>
              <el-tag style="color: #324157; float: right" type="" size="small">
                git仓库项目ID：{{project.gitProjectId}}
              </el-tag>
            </div>
          </div>
          <el-button @click.stop="toAppDeploy(project.id)" style="float: left; margin-left: 10px;"
                     size="small" type="primary" icon="el-icon-aim">
            去部署
          </el-button>
          <el-button @click.native="toBranchManagement(project.id)" style="float: left; margin-left: 10px;"
                     size="small" type="primary" icon="el-icon-s-help">
            分支管理
          </el-button>
          <el-button @click.stop="removeApplication(project.id)" style="float: right;"
                     size="small" icon="el-icon-delete">
            删除
          </el-button>
          <el-button @click.stop="applicationEdit(project.id)" style="float: right; margin-right: 10px;"
                     size="small" type="primary" plain icon="el-icon-edit">
            编辑
          </el-button>
        </el-card>
      </el-col>
    </el-row>
    <div style="position: absolute; bottom: 10px;right: 0" v-show="projectList.length > 0" class="pagination">
      <el-pagination
        class="text-center"
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
      ref="drawer">
      <div class="demo-drawer__content">
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
                v-for="item in projectGroupCodeList"
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
        <el-button style="margin-left: 20px" @click="cancelForm">取 消</el-button>
        <!-- @click="$refs.drawer.closeDrawer()"  -->
        <el-button type="primary" @click="saveProject" :loading="loading">{{
            loading ? '提交中 ...' : '确 定'
          }}
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  enableChange, exportProjectTemplate,
  getProjectInfo, importFile, queryList,
  queryProjectPage,
  removeProject,
  saveProject
} from "@/api/api";

export default {
  name: "ApplicationList.vue",
  data() {
    return {
      uploadFileType: '.xlsx, .xls',
      fileList: [],

      searchText: '',

      //启用状态选择器
      enableStatus: '启用',
      enableStatusList: ['启用', '停用'],

      //项目分组选择器
      projectGroupCode: 'matrix-sphere',
      projectGroupCodeList: [],

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
          this.projectGroupCodeList = res.data.body
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

    // 编辑应用
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
        name: "Branch",
        path: '/applicationManagement/branch',
        params: {
          projectId: projectId
        }
      });
    },

    toAppDeploy(projectId) {
      this.$router.push({
        name: 'ApplicationDeploy',
        path: "/applicationManagement/applicationDeploy",
        params: {
          projectId: projectId
        }
      });
    },

    applicationEdit(projectId) {
      this.$router.push({
        name: 'ApplicationEdit',
        path: "/applicationManagement/applicationEdit",
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
.el-input {
  width: 200px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.el-select {
  width: 190px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  margin-bottom: 15px;
  border-radius: 4px;

  div {
    padding: 5px 5px;
  }
}

.bg-purple {
  background: #d3dce6;
}

.grid-content {
  border-radius: 4px;
  min-height: 150px;
}

.pagination {
  display: flex;
  float: right;
}

.upload-demo {
  display: inline-block;
  margin-left: 10px;
}
</style>
