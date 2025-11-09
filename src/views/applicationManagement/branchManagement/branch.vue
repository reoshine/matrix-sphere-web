<template>
  <div>
    <div>
      <el-input
          minlength="0"
          maxlength="20"
          style="width: 320px;"
          size="medium"
          placeholder="请输入应用编码/名称，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="queryApplicationByParam">查询</el-button>
    </div>
    <el-divider content-position="left">应用信息</el-divider>
    <div style="margin-bottom: 30px;">
      <el-descriptions class="appDeployDiv" title="" :column="2" border>
        <el-descriptions-item label-style="width: 150px">
          <template slot="label">
            <i class="el-icon-s-order"></i>
            应用编码
          </template>
          <el-tag size="big" v-if="projectInfo.projectCode">{{projectInfo.projectCode}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label-style="width: 150px">
          <template slot="label">
            <i class="el-icon-document"></i>
            应用名称
          </template>
          <el-tag size="small" v-if="projectInfo.projectName">{{projectInfo.projectName}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label-style="width: 150px">
          <template slot="label">
            <i class="el-icon-location-outline"></i>
            应用分组
          </template>
          <el-tag size="small" v-if="projectInfo.projectGroupId">{{getProjectGroupCode(projectInfo.projectGroupId)}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label-style="width: 150px">
          <template slot="label">
            <i class="el-icon-link"></i>
            git地址
          </template>
          <el-tag size="small" v-if="projectInfo.gitUrl">{{projectInfo.gitUrl}}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <el-divider content-position="left">新建分支</el-divider>
    <el-form :model="branchInfo" :rules="createBranchRules" ref="createBranchRef" style="margin-top: 20px; margin-bottom: 30px;">
      <el-form-item prop="branchName" label="分支名称" label-width="100px">
        <el-input
          minlength="0"
          maxlength="30"
          size="medium"
          placeholder="请输入分支名称"
          suffix-icon="el-icon-search"
          v-model:value="branchInfo.branchName"
          clearable>
          <template slot="prepend">feature_</template></el-input>
      </el-form-item>
      <el-form-item prop="description" label="分支描述" label-width="100px">
        <el-input
          minlength="0"
          maxlength="20"
          size="medium"
          placeholder="请输入分支名称"
          suffix-icon="el-icon-search"
          v-model:value="branchInfo.description"
          clearable>
        </el-input>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="createBranch">创 建</el-button>
      </el-form-item>
    </el-form>
    <el-divider content-position="left">分支列表</el-divider>
    <el-empty v-show="branchList.length <= 0" description="无分支信息"></el-empty>
    <el-table v-show="branchList.length > 0" :data="branchList" border>
      <el-table-column prop="branchName" label="分支名称" width="400px"></el-table-column>
      <el-table-column prop="description" label="分支描述"></el-table-column>
      <el-table-column prop="canPush" label="可推送" width="130">
        <template slot-scope="scope">
          <span v-if="scope.row.canPush === true">是</span>
          <span v-if="scope.row.canPush === false">否</span>
        </template>
      </el-table-column>
      <el-table-column prop="isProtected" label="保护分支" width="130">
        <template slot-scope="scope">
          <span v-if="scope.row.isProtected === true">是</span>
          <span v-if="scope.row.isProtected === false">否</span>
        </template>
      </el-table-column>
      <el-table-column prop="createByName" label="创建人" width="130"></el-table-column>
      <el-table-column prop="gmtCreate" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="220">
        <template slot-scope="scope">
          <el-button size="small" type="primary" icon="el-icon-edit" @click="editBranchInfo(scope.row)">修 改</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteConfirm(scope.row)">删 除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="修改分支信息"
               :close-on-click-modal="false"
               :visible.sync="modifyBranchFormVisible"
               v-if="modifyBranchDialogVisible"
               width="617px">
      <el-form class="modifyCredential"
               :model="editBranchForm"
               :rules="modifyBranchRules"
               ref="modifyBranchRef"
               size="small">
        <el-form-item label="分支名称" prop="branchName" label-width="130px">
          <el-input v-model="editBranchForm.branchName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="分支描述" prop="description" label-width="130px">
          <el-input v-model="editBranchForm.description" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否可推送" prop="canPush" label-width="130px">
          <el-select size="medium" v-model="editBranchForm.canPush" placeholder="请选择" disabled>
            <el-option
                v-for="item in canPushList"
                :key="item.canPush"
                :label="item.canPushDesc"
                :value="item.canPush">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否是保护分支" prop="isProtected" label-width="130px">
          <el-select size="medium" v-model="editBranchForm.isProtected" placeholder="请选择">
            <el-option
                v-for="item in isProtectedList"
                :key="item.isProtected"
                :label="item.isProtectedDesc"
                :value="item.isProtected">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelModifyBranch">取 消</el-button>
        <el-button type="primary" @click="modifyBranch">确 定</el-button>
      </div>
    </el-dialog>
</div>
</template>

<script>
import {
  createBranch,
  modifyBranch,
  getProjectById,
  getUnDeployedBranchList,
  removeBranch,
  getProjectInfo
} from '@/views/applicationManagement/applicationList/api';
import {queryList} from '@/views/applicationManagement/applicationGroup/api';


export default {
  name: 'branch',
  data() {
    return {
      searchText: '',
      //tabs 当前激活环境
      activeName: "dev",

      projectId: '',

      //应用信息
      projectInfo: {},

      projectGroupList: [],

      modifyBranchDialogVisible: false,
      modifyBranchFormVisible: false,

      // 编辑弹窗表单对象
      editBranchForm: {},

      branchList: [],

      branchInfo: {},

      canPushList: [
        {
          canPush: false,
          canPushDesc: '否',

        },
        {
          canPush: true,
          canPushDesc: '是',
        }
      ],

      isProtectedList: [
        {
          isProtected: false,
          isProtectedDesc: '否',

        },
        {
          isProtected: true,
          isProtectedDesc: '是',
        }
      ],

      buildProcessActive: 1,
      checked: '',

      createBranchRules: {
        branchName: [
          { required: true, message: "请输入分支名称", trigger: "blur" },
          { min: 2, max: 100, message: "长度在3到100个字符", trigger: "blur" },
        ],
        description: [
          { required: true, message: "请输入分支描述", trigger: "blur" },
          { min: 2, max: 50, message: "长度在2到50个字符", trigger: "blur" },
        ]
      },

      modifyBranchRules: {
        description: [
          { required: true, message: "请输入分支描述", trigger: "blur" },
          { min: 2, max: 50, message: "长度在2到50个字符", trigger: "blur" },
        ]
      },
    };
  },

  methods: {
    //根据搜索内容获取应用
    queryApplicationByParam() {
      if (!this.searchText) {
        this.$message({
          message: '查询条件不可为空',
          type: 'error',
          duration: 2000,
        });
        return
      }
      getProjectInfo({
        searchText: this.searchText
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectInfo = res.data.body
          localStorage.setItem('projectId', JSON.stringify(this.projectInfo.id))
          this.getBranchListByProjectId(this.projectInfo.id)
        } else {
          this.$message({
            message: '查询应用信息失败，原因：' + res.data.message,
            type: 'error',
            duration: 2000,
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
    },
    //根据id获取应用
    async getProject(projectId) {
      getProjectById({
        projectId: projectId
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectInfo = res.data.body
          this.searchText = this.projectInfo.projectCode
          localStorage.setItem('projectId', JSON.stringify(this.projectInfo.id))
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
        this.loading = false
      })
    },

    getBranchListByProjectId(projectId) {
      getUnDeployedBranchList({
        projectId: projectId
      }).then(res => {
        if (res.data.code === 2000) {
          this.branchList = res.data.body;
        }
      }).catch(err => {
        this.$message({
          message: '查询部署信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
        this.loading = false
      })
    },


    //创建分支
    createBranch() {
      this.$refs.createBranchRef.validate((valid) => {
        if (valid) {
          createBranch({
            projectId: this.projectInfo.id,
            branchName: 'feature_' + this.branchInfo.branchName,
            description: this.branchInfo.description,
            sourceBranch: 'main',
            branchType: '1'
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                message: '创建分支成功！',
                type: 'success',
                duration: 2000,
              });
              this.getBranchListByProjectId(this.projectId);
              this.branchInfo = {};
            }
          }).catch(err => {
            this.$message({
              message: '创建分支失败，原因：' + err,
              type: 'error',
              duration: 2000,
            });
            this.loading = false
          })
        }
      });
    },

    //创建分支
    modifyBranch() {
      this.$refs.modifyBranchRef.validate((valid) => {
        if (valid) {
          modifyBranch({
            projectId: this.projectInfo.id,
            branchName: this.editBranchForm.branchName,
            description: this.editBranchForm.description,
            isProtected: this.editBranchForm.isProtected
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                message: '修改分支成功！',
                type: 'success',
                duration: 2000,
              });
              this.getBranchListByProjectId(this.projectId);
              this.branchInfo = {};
              this.modifyBranchDialogVisible = false
            }
          }).catch(err => {
            this.$message({
              message: '修改分支成功失败，原因：' + err,
              type: 'error',
              duration: 2000,
            });
            this.loading = false
          })
        }
      });
    },

    editBranchInfo(branch) {
      this.modifyBranchDialogVisible = true
      this.modifyBranchFormVisible = true
      this.editBranchForm = JSON.parse(JSON.stringify(branch))
    },

    cancelModifyBranch() {
      this.modifyBranchDialogVisible = false
      this.modifyBranchFormVisible = false
      this.editBranchForm = {}
    },

    deleteConfirm(branch) {
      this.$confirm('此操作将删除本地和远端分支, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeBranch({
          projectId: branch.projectId,
          branchId: branch.id
        }).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getBranchListByProjectId(this.projectInfo.id);
          }
        }).catch(err => {
          this.$message({
            message: '查询部署信息失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
          this.loading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    getGroupList() {
      queryList({
        searchText: '',
        enableStatus: '启用'
      }).then(res => {
        if (res.data.code === 2000) {
          this.projectGroupList = res.data.body
        }
      })
    },

    getProjectGroupCode(id) {
      const obj = this.projectGroupList.find(item => item.id === id)
      return obj === undefined ? '' : obj.projectGroupCode
    }
  },

  mounted() {
  },

  created() {
    this.getGroupList()
    if (localStorage.getItem('projectId')) {
      const projectId = JSON.parse(localStorage.getItem('projectId'))
      this.getProject(projectId)
      this.getBranchListByProjectId(projectId)
    }
    if (this.$route.params.projectId) {
      this.projectId = this.$route.params.projectId
      this.getProject(this.projectId)
      this.getBranchListByProjectId(this.projectId)
    }
  },

  beforeDestroy() {
    localStorage.removeItem('projectId')
  },
}
</script>

<style lang="less" scoped>
.appDeployDiv {
  display: inline-block;
  width: 100%;
}
.el-descriptions {
  margin-right: 10px;
}
.el-input {
  width: 80%;
  margin-right: 10px;
  // margin-top: 20px;
}
.el-select {
  width: 220px;
  margin-right: 10px;
  margin-bottom: 10px;
}
.box {
  width: 100%;
  height: 40px;
  display: flex;
  border-left: 1px solid #e9e9e9;
  border-top: 1px solid #e9e9e9;
  .content1 {
    width: 40%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background-color: #fafafa;
    border-right: 1px solid #e9e9e9;
    border-bottom: 1px solid #e9e9e9;
    color: #333;
    font-size: 14px;
  }
  .content2 {
    width: 60%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background-color: #fff;
    border-right: 1px solid #e9e9e9;
    border-bottom: 1px solid #e9e9e9;
    color: #409EFF;
    font-size: 14px;
  }
}
.envTabs {
  margin-top: 30px;
}

.modifyCredential {
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>
