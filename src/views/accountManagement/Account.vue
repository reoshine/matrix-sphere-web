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
          placeholder="请输入用户账号/名称，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>
      <label style="margin-left:20px" for="enabled">启用状态：</label>
      <el-select clearable size="medium" v-model="enabled" placeholder="请选择">
        <el-option
            v-for="item in enableStatusList"
            :key="item.enableStatus"
            :label="item.enableStatusName"
            :value="item.enableStatus">
        </el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="getAccountPage">查询</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addAccount">新增</el-button>
  </div>

  <!-- 用户列表 -->
  <el-divider content-position="left">用户列表</el-divider>
  <el-empty v-show="accountPage.total <= 0" description="无应用分组信息"></el-empty>
  <el-table v-show="accountPage.total > 0" :data="accountPage.data" border>
    <el-table-column type="index"></el-table-column>
    <el-table-column prop="accountNo" label="用户账号"></el-table-column>
    <el-table-column prop="accountName" label="账号名称"></el-table-column>
    <el-table-column prop="deptName" label="所属部门"></el-table-column>
    <el-table-column prop="d" label="密码过期时间">2023-12-31 23:59:59</el-table-column>
    <el-table-column prop="createByName" label="创建人"></el-table-column>
    <el-table-column prop="enabled" label="启用状态">
      <template slot-scope="scope">
        <el-switch
            v-model="accountPage.data[scope.$index].enabled"
            @change="modifyAccountConfirm(scope.row)">
        </el-switch>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="300">
      <template slot-scope="scope">
        <el-button size="small" type="primary" icon="el-icon-edit" @click="modifyAccount(scope.row)">修 改</el-button>
        <el-button size="small" type="primary" icon="el-icon-edit" @click="roleAllocation(scope.row)">角色分配</el-button>
        <el-button size="small" type="danger" icon="el-icon-delete" @click="removeAccount(scope.row)">删 除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <div class="rolePage block">
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="accountPage.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="accountPage.pageCount"
        layout="total, sizes, prev, pager, next, jumper"
        :total="accountPage.total">
    </el-pagination>
  </div>

  <!-- 用户信息编辑抽屉 -->
  <el-drawer
      :title="drawerTitle"
      :before-close="handleAccountDrawerClose"
      :visible.sync="accountModifyDialog"
      direction="rtl"
      custom-class="demo-drawer"
      ref="drawer">
    <div class="demo-drawer__content">
      <el-form :model="saveAccountForm" :rules="saveAccountRules" ref="saveAccountRulesRef">
        <el-form-item prop="accountNo" label="用户账号" label-width="100px">
          <el-input v-model="saveAccountForm.accountNo" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="accountName" label="账号名称" label-width="100px">
          <el-input v-model="saveAccountForm.accountName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="accountPassword" label="密码" label-width="100px">
          <el-input v-model="saveAccountForm.accountPassword" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="cellPhone" label="联系电话" label-width="100px">
          <el-input v-model="saveAccountForm.cellPhone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="idCardNo" label="身份证号" label-width="100px">
          <el-input v-model="saveAccountForm.idCardNo" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="enabled" label="启用状态" label-width="100px">
          <el-select size="medium" v-model="saveAccountForm.enabled" placeholder="请选择">
            <el-option
                v-for="item in enableStatusList"
                :key="item.enableStatus"
                :label="item.enableStatusName"
                :value="item.enableStatus">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 20px" @click="accountDialogCancel">取 消</el-button>
      <el-button type="primary" v-if="drawerTitle === '新增用户信息'"
                 @click="addAccountConfirm(saveAccountForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
      </el-button>
      <el-button type="primary" v-else-if="drawerTitle === '修改用户信息'"
                 @click="modifyAccountConfirm(saveAccountForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
      </el-button>
    </div>
  </el-drawer>

  <!-- 用户角色分配抽屉 -->
  <el-drawer
      title="为用户分配角色"
      :visible.sync="roleAllocationDialog"
      direction="rtl"
      custom-class="demo-drawer"
      ref="roleAllocationDrawer"
      size="38%">
    <div class="demo-drawer__content">
      <el-transfer
          :titles="['未分配的角色', '已分配的角色']"
          v-model="allocationRoleId"
          :data="roleList"
          @change="roleAllocationConfirm">
      </el-transfer>
      <el-button style="margin-left: 20px" @click="roleAllocationDialogCancel">取 消</el-button>
      <el-button type="primary" v-if="drawerTitle === '新增用户信息'"
                 @click="addAccountConfirm(saveAccountForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
      </el-button>
      <el-button type="primary" v-else-if="drawerTitle === '修改用户信息'"
                 @click="modifyAccountConfirm(saveAccountForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
      </el-button>
    </div>
  </el-drawer>
</div>
</template>

<script>
import {
  addAccount,
  addAccountRole,
  getAccountPage, getAccountRoleByAccountId,
  getById,
  getRoleList,
  modifyAccount,
  removeAccount, removeAccountRole
} from "@/api/matrixspheremanagement/api";
import bus from "@/util/bus";

export default {
  name: "account",
  data() {
    return {
      roleList: [],
      allocationRoleId: [],

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
      accountModifyDialog: false,
      roleAllocationDialog: false,
      saveAccountForm: {},
      account: {},
      accountPage: {},
      accountList: [],

      saveAccountRules: {
        accountNo: [
          { required: true, message: "请输入用户账号", trigger: "blur" },
          { min: 2, max: 50, message: "长度在2到50个字符", trigger: "blur" },
        ],
        accountPassword: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 50, message: "长度在3到50个字符", trigger: "blur" },
        ],
        accountName: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          { min: 3, max: 50, message: "长度在3到50个字符", trigger: "blur" },
        ],
        cellPhone: [
          { required: true, message: "请输入用户电话", trigger: "blur" },
          { min: 3, max: 50, message: "长度在3到50个字符", trigger: "blur" },
        ],
        idCardNo: [
          { required: true, message: "请输入身份证号", trigger: "blur" },
          { min: 3, max: 50, message: "长度在3到50个字符", trigger: "blur" },
        ]
      },
    }

  },
  methods: {
    //分页查询
    getAccountPage(data) {
      if (data === undefined || data.enabled === undefined || data.enabled === '') {
        data = {
          enabled: true,
          pageNum: this.pageNum,
          pageCount: this.pageCount,
          paging: true,
          searchText: this.searchText
        }
      }
      getAccountPage({
        pageCount: data.pageCount,
        pageNum: data.pageNum,
        paging: data.paging,
        enabled: data.enabled,
        searchText: data.searchText
      }).then(res => {
        if (res.data.code === 2000) {
          this.accountPage = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '分页查询用户列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //根据账号查询用户信息
    getById(accountId) {
      getById(accountId).then(res => {
        if (res.data.code === 2000) {
          this.saveAccountForm = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '获取用户信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },


    handleAccountDrawerClose() {
      if (this.loading) {
        return;
      }
      this.$confirm('确认关闭吗？')
          .then(_ => {
            this.accountDialogCancel();
          })
          .catch(_ => {
          });
    },

    //新增按钮
    addAccount() {
      this.saveAccountForm = {}
      this.drawerTitle = '新增用户信息'
      this.accountModifyDialog = true
    },

    //修改按钮
    modifyAccount(account) {
      this.drawerTitle = '修改用户信息'
      this.accountModifyDialog = true
      this.getById(account.id)
    },

    //抽屉取消按钮
    accountDialogCancel() {
      this.accountModifyDialog = false
      this.$refs.saveAccountRulesRef.resetFields()
    },

    //用户角色分配抽屉取消按钮
    roleAllocationDialogCancel() {
      this.roleAllocationDialog = false
    },

    //新增用户信息确认
    addAccountConfirm(saveAccountForm) {
      this.$refs.saveAccountRulesRef.validate((valid) => {
        if (valid) {
          addAccount({
            ...saveAccountForm
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                type: 'success',
                message: '新增成功!',
                duration: 2000
              });
              this.accountModifyDialog = false
              this.getAccountPage()
            }
          }).catch(err => {
            this.$message({
              message: '新增用户列表失败，原因：' + err,
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
      this.getAccountPage(data)
    },

    //分页条跳转页数后
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },

    //修改用户信息确认
    modifyAccountConfirm(saveAccountForm) {
      modifyAccount({
        ...saveAccountForm
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message({
            type: 'success',
            message: '修改成功!',
            duration: 1000,
            onClose: () => {
              this.accountModifyDialog = false
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
    removeAccount(account) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeAccount(account.id).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '删除成功!',
              duration: 2000
            });
            this.getAccountPage()
          }
        }).catch(err => {
          this.$message({
            message: '删除用户列表失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
        })
      })
    },

    async roleAllocation(account) {
      await getRoleList().then(res => {
        if (res.data.code === 2000) {
          this.roleList = res.data.body.map(item => {
            return {
              key: item.id,
              label: item.roleCode + "-" + item.roleName
            }
          })
          this.roleAllocationDialog = true
        }
      }).catch(err => {
        this.$message({
          message: '查询用户角色关系列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
      bus.$emit('account', account)

      await getAccountRoleByAccountId(account.id).then(res => {
        if (res.data.code === 2000) {
          this.allocationRoleId = res.data.body.map(item => {
            return item.roleId
          })
        }
      }).catch(err => {
        this.$message({
          message: '根据用户id查询用户角色关系列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //添加、删除用户角色关系
    roleAllocationConfirm(value, direction, movedKeys) {
      if (direction === 'right') {
        //添加角色
        addAccountRole({
          accountId: this.account.id,
          roleIdList: value
        }).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '添加成功!',
              duration: 1000
            });
          }
        }).catch(err => {
          this.$message({
            message: '删除用户列表失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
        })
      } else {
        //删除角色
        removeAccountRole({
          accountId: this.account.id,
          roleIdList: movedKeys
        }).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '删除成功!',
              duration: 1000
            });
          }
        }).catch(err => {
          this.$message({
            message: '删除用户列表失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
        })
      }
    }
  },
  created() {
    let data = {
      pageNum: this.pageNum,
      pageCount: this.pageCount,
      enabled: this.enabled,
      paging: true
    }
    this.getAccountPage(data)
  },
  mounted() {
    bus.$on('account', data => {
      this.account = data
    });
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

.rolePage {
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
  .el-transfer {
    margin-left: 20px;
    margin-bottom: 20px;
  }
}
</style>
