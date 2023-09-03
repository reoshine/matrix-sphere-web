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
            :key="item.enableStatus"
            :label="item.enableStatusName"
            :value="item.enableStatus">
          </el-option>
        </el-select>

        <label style="margin-left:20px" for="projectGroupId">项目分组：</label>
        <el-select clearable size="medium" v-model="projectGroupId" placeholder="请选择" @change="queryApplicationPage">
          <el-option
            v-for="item in projectGroupList"
            :key="item.projectGroupId"
            :label="item.projectGroupCode"
            :value="item.projectGroupId">
          </el-option>
        </el-select>

        <el-button type="primary" size="small" icon="el-icon-search" @click="queryApplicationPage">查询</el-button>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="addProject()">新增</el-button>
      </div>
    </div>
    <el-divider content-position="left">应用列表</el-divider>
    <el-empty v-show="projectList.length <= 0" description="无应用信息"></el-empty>
    <el-row v-show="projectList.length > 0" :gutter="20">
      <el-col v-for="project in projectList" :key="project.id" :span="6">
        <el-card shadow="hover" :body-style="{ padding: '0px' }" @click.native="toBranchManagement(project.id)">
          <div style="padding: 10px">
            <div style="color: #2b4b6b; font-weight: bold">{{ project.projectCode }}
              <span style="float: right; margin-right: -23px;" @click.stop="project.enableStatus === 1 ? 0 : 1">
                <el-switch
                  style="padding: 0 10px"
                  :active-value="1"
                  :inactive-value="0"
                  v-model="project.enableStatus"
                  @change="enableChange($event, project)"
                  active-color="#13ce66"
                  inactive-color="#dcdfe6">
                </el-switch>
              </span>
            </div>
            <div>
              <el-tag style="color: #324157" type="" size="small">{{ project.projectName }}</el-tag>
              <el-tag style="color: #324157; float: right; margin-right: -13px" type="" size="small">
                git仓库项目ID：{{project.gitProjectId}}
              </el-tag>
            </div>
          </div>
          <el-button @click.stop="toAppDeploy(project.id)" style="float: left; margin-left: 10px;"
                     size="small" type="primary" icon="el-icon-aim">
            去部署
          </el-button>
          <el-button @click.stop="removeApplication(project.id)" style="float: right;"
                     size="small" icon="el-icon-delete">
            删除
          </el-button>
          <el-button @click.stop="modifyApplicationInfo(project.id)" style="float: right; margin-right: 10px;"
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
          <el-form-item prop="projectGroupId" label="分组名称" label-width="100px">
            <el-select size="medium" v-model="saveProjectForm.projectGroupId" placeholder="请选择">
              <el-option
                v-for="item in projectGroupList"
                :key="item.projectGroupId"
                :label="item.projectGroupCode"
                :value="item.projectGroupId">
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
                :key="item.enableStatus"
                :label="item.enableStatusName"
                :value="item.enableStatus">
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
  enableChange,
  getProjectInfo,
  queryProjectPage,
  removeProject,
  saveProject
} from "@/api/api";

export default {
  name: "ApplicationList.vue",
  data() {
    return {
      searchText: '',

      //启用状态选择器
      enableStatus: 1,
      enableStatusList: [
        {
          enableStatus: 1,
          enableStatusName: '启用',
        },
        {
          enableStatus: 0,
          enableStatusName: '停用',
        }
      ],


      //项目分组选择器
      projectGroupId: '',
      projectGroupList: [
        {
          projectGroupId: 1,
          projectGroupCode: 'adp',

        },
        {
          projectGroupId: 2,
          projectGroupCode: 'deployment',
        }
      ],

      //编辑抽屉内容
      dialog: false,
      loading: false,
      saveProjectForm: {
        projectCode: '',
        projectName: '',
        projectGroupId: '',
        projectGroupName: '',
        gitUrl: '',
        enableStatus: ''
      },

      //抽屉表单校验规则
      rules: {
        projectCode: [
          { required: true, message: '请输入项目编码', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur' },
        ],
        projectName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在3到15个字符', trigger: 'blur' },
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
          projectGroupId: '',
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
        projectGroupId: this.projectGroupId
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
    addProject() {
      this.saveProjectForm = {}
      this.dialog = true
    },

    //抽屉表单提交
    saveProject() {
      this.$refs.saveProjectFormRef.validate((valid) => {
        if (valid) {
          saveProject({
            ...this.saveProjectForm
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

    toBranchManagement(projectId) {
      this.$router.push({
        name: "BranchManagement",
        path: '/matrix/branchManagement',
        params: {
          projectId: projectId
        }
      });
    },

    toAppDeploy(projectId) {
      this.$router.push({
        name: 'ApplicationDeploy',
        path: "/matrix/applicationDeploy",
        params: {
          projectId: projectId
        }
      });
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

//.el-divider__text {
//  background-color: #f0f0f0;
//}

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
</style>
