<template>
  <div>
    <!-- 搜索条件 -->
    <div class="search_condition">
      <el-input
          class="searchInput"
          minlength="0"
          maxlength="20"
          style="width: 400px;"
          size="medium"
          placeholder="请输入应用编码/名称，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>
      <label style="margin-left:20px" for="enabled">启用状态：</label>
      <el-select clearable size="medium" v-model="enabled" @change="getProjectPage" placeholder="请选择">
        <el-option
            v-for="item in enableStatusList"
            :key="item.enableStatus"
            :label="item.enableStatusName"
            :value="item.enableStatus">
        </el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="getProjectPage">查询</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addProject">新增</el-button>
    </div>

    <!-- 应用列表 -->
    <el-divider content-position="left">应用列表</el-divider>
    <el-empty v-show="projectPage.total <= 0" description="无应用分组信息"></el-empty>
    <el-table v-show="projectPage.total > 0" :data="projectPage.data" border>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="projectCode" label="应用编码"></el-table-column>
      <el-table-column prop="projectName" label="应用名称"></el-table-column>
      <el-table-column prop="createByName" label="创建人"></el-table-column>
      <el-table-column prop="gmtCreate" label="创建时间"></el-table-column>
      <el-table-column prop="enabled" label="启用状态">
        <template slot-scope="scope">
          <el-switch
              v-model="projectPage.data[scope.$index].enabled"
              @change="modifyProjectConfirm(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="small" type="primary" icon="el-icon-edit" @click="modifyProject(scope.row)">详 情</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="removeProject(scope.row)">删 除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页条 -->
    <div class="projectPage block">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="projectPage.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="projectPage.pageCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="projectPage.total">
      </el-pagination>
    </div>

    <!-- 用户信息编辑抽屉 -->
    <el-drawer
        :title="drawerTitle"
        :before-close="handleClose"
        :visible.sync="dialog"
        direction="rtl"
        custom-class="demo-drawer"
        ref="drawer">
      <div class="demo-drawer__content">
        <el-form :model="saveProjectForm" :rules="saveProjectRules" ref="saveProjectRulesRef">
          <el-form-item prop="projectCode" label="应用编码" label-width="120px">
            <el-input v-model="saveProjectForm.projectCode" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item prop="projectName" label="应用名称" label-width="120px">
            <el-input v-model="saveProjectForm.projectName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item prop="successRedirectUri" label="成功的回调地址" label-width="120px">
            <el-input v-model="saveProjectForm.successRedirectUri" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item prop="grantRedirectUrl" label="授权回调地址" label-width="120px">
            <el-input v-model="saveProjectForm.grantRedirectUrl" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item prop="projectIcon" label="应用图标地址" label-width="120px">
            <el-input v-model="saveProjectForm.projectIcon" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item prop="enabled" label="启用状态" label-width="120px">
            <el-select size="medium" v-model="saveProjectForm.enabled" placeholder="请选择">
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
        <el-button type="primary" v-if="drawerTitle === '新增应用'"
                   @click="addProjectConfirm(saveProjectForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
        </el-button>
        <el-button type="primary" v-else-if="drawerTitle === '修改应用'"
                   @click="modifyProjectConfirm(saveProjectForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  getProjectById,
  getProjectPage, modifyProject, removeProject,
  saveProject,
} from "@/views/projectManagement/api";

export default {
  name: "project",
  data() {
    return {
      pageNum: 1,
      pageCount: 10,
      searchText: '',
      enabled: true,
      enableStatusList: [
        {
          enableStatus: true,
          enableStatusName: '启用',
        },
        {
          enableStatus: false,
          enableStatusName: '停用',
        }
      ],
      drawerTitle: '',
      loading: false,
      dialog: false,
      saveProjectForm: {
        id: {
          type: Number,
        },
        projectCode: '',
        projectName: '',
        successRedirectUri: '',
        grantRedirectUrl: '',
        projectIcon: '',
        enabled: '',
        createByName: '',
        gmtCreate: ''
      },
      projectPage: {},
      projectList: [],

      saveProjectRules: {
        projectCode: [
          { required: true, message: "请输入应用编码", trigger: "blur" },
          { min: 3, max: 20, message: "长度在4到10个字符", trigger: "blur" },
        ],
        projectName: [
          { required: true, message: "请输入应用名称", trigger: "blur" },
          { min: 2, max: 20, message: "长度在3到50个字符", trigger: "blur" },
        ]
      },
    }

  },
  methods: {
    //分页查询
    getProjectPage(data) {
      if (data.enabled === undefined || data.enabled === '') {
        data = {
          enabled: this.enabled,
          pageNum: this.pageNum,
          pageCount: this.pageCount,
          paging: true,
          searchText: this.searchText
        }
      }
      getProjectPage({
        pageCount: data.pageCount,
        pageNum: data.pageNum,
        paging: data.paging,
        enabled: data.enabled,
        searchText: data.searchText
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectPage = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '分页查询应用列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //根据账号查询用户信息
    getProjectById(projectId) {
      getProjectById(projectId).then(res => {
        if (res.data.code === 2000) {
          this.saveProjectForm = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '获取应用信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },


    handleClose() {
      if (this.loading) {
        return;
      }
      this.$confirm('确认关闭吗？')
          .then(_ => {
            this.cancelForm();
          })
          .catch(_ => {
          });
    },

    //新增按钮
    addProject() {
      this.saveProjectForm = {}
      this.drawerTitle = '新增应用'
      this.dialog = true
    },

    //修改按钮
    modifyProject(project) {
      this.drawerTitle = '修改应用'
      this.dialog = true
      this.getProjectById(project.id)
    },

    //抽屉取消按钮
    cancelForm() {
      this.dialog = false
      this.$refs.saveProjectRulesRef.resetFields()
    },

    //新增用户信息确认
    addProjectConfirm(saveProjectForm) {
      this.$refs.saveProjectRulesRef.validate((valid) => {
        if (valid) {
          saveProject({
            ...saveProjectForm
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                type: 'success',
                message: '新增成功!',
                duration: 2000
              });
              this.dialog = false
              this.getProjectPage({
                pageNum: this.pageNum,
                pageCount: this.pageCount,
                enabled: this.enabled,
                paging: true
              })
            }
          }).catch(err => {
            this.$message({
              message: '新增应用失败，原因：' + err,
              type: 'error',
              duration: 2000,
            });
          })
        }
      });
    },

    //分页条选每页条数后
    handleSizeChange(pageCount) {
      let data = {
        enabled: this.enabled,
        pageNum: this.pageNum,
        pageCount: pageCount,
        paging: true
      }
      this.getProjectPage(data)
    },

    //分页条跳转页数后
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },

    //修改用户信息确认
    modifyProjectConfirm(saveProjectForm) {
      modifyProject({
        ...saveProjectForm
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message({
            type: 'success',
            message: '修改成功!',
            duration: 1000,
            onClose: () => {
              this.dialog = false
              this.getProjectPage({
                pageNum: this.pageNum,
                pageCount: this.pageCount,
                enabled: this.enabled,
                paging: true
              })
            }
          });

        }
      }).catch(err => {
        this.$message({
          message: '修改用户信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //删除用户
    removeProject(project) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeProject(project.id).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '删除成功!',
              duration: 2000
            });
            this.getProjectPage({
              pageNum: this.pageNum,
              pageCount: this.pageCount,
              enabled: this.enabled,
              paging: true
            })
          }
        }).catch(err => {
          this.$message({
            message: '删除应用失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
        })
      })
    },
  },
  created() {
    let data = {
      pageNum: this.pageNum,
      pageCount: this.pageCount,
      enabled: this.enabled,
      paging: true
    }
    this.getProjectPage(data)
  }
}
</script>

<style lang="less" scoped>
.searchInput {
  width: 80%;
  margin-right: 10px;
  margin-bottom: 10px;
}

.el-select {
  width: 190px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.projectPage {
  position: absolute;
  bottom: 10px;
  right: 10px
}

.demo-drawer__content {
  .el-form-item {
    margin-bottom: 20px;
    .el-input {
      width: 80%;
    }
  }
}
</style>
