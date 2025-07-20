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
          placeholder="请输入角色编码/名称，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>
      <label style="margin-left:20px" for="enabled">启用状态：</label>
      <el-select clearable size="medium" v-model="enabled" @change="getRolePage" placeholder="请选择">
        <el-option
            v-for="item in enableStatusList"
            :key="item.enableStatus"
            :label="item.enableStatusName"
            :value="item.enableStatus">
        </el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="getRolePage">查询</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addRole">新增</el-button>
  </div>

  <!-- 角色列表 -->
  <el-divider content-position="left">角色列表</el-divider>
  <el-empty v-show="rolePage.total <= 0" description="无应用分组信息"></el-empty>
  <el-table v-show="rolePage.total > 0" :data="rolePage.data" border>
    <el-table-column type="index"></el-table-column>
    <el-table-column prop="roleCode" label="角色编码"></el-table-column>
    <el-table-column prop="roleName" label="角色名称"></el-table-column>
    <el-table-column prop="createByName" label="创建人"></el-table-column>
    <el-table-column prop="enabled" label="启用状态">
      <template slot-scope="scope">
        <el-switch
            v-model="rolePage.data[scope.$index].enabled"
            @change="modifyRoleConfirm(scope.row)">
        </el-switch>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="500px">
      <template slot-scope="scope">
        <el-button size="small" type="primary" icon="el-icon-edit" @click="modifyRole(scope.row)">修 改</el-button>
        <el-button size="small" type="primary" icon="el-icon-delete" @click="roleMenuAllocation(scope.row)">菜单分配</el-button>
        <el-button size="small" type="primary" icon="el-icon-delete" @click="showRoleMenuDrawer = true">权限分配</el-button>
        <el-button size="small" type="danger" icon="el-icon-delete" @click="removeRole(scope.row)">删 除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <div class="rolePage block">
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="rolePage.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="rolePage.pageCount"
        layout="total, sizes, prev, pager, next, jumper"
        :total="rolePage.total">
    </el-pagination>
  </div>

  <!-- 角色编辑抽屉 -->
  <el-drawer
      :title="drawerTitle"
      :before-close="roleModifyDrawerClose"
      :visible.sync="showDrawer"
      direction="rtl"
      custom-class="demo-drawer"
      ref="drawer">
    <div class="demo-drawer__content">
      <el-form :model="saveRoleForm" :rules="saveRoleRules" ref="saveRoleRulesRef">
        <el-form-item prop="roleCode" label="角色编码" label-width="100px">
          <el-input v-model="saveRoleForm.roleCode" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="roleName" label="角色名称" label-width="100px">
          <el-input v-model="saveRoleForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="enabled" label="启用状态" label-width="100px">
          <el-select size="medium" v-model="saveRoleForm.enabled" placeholder="请选择">
            <el-option
                v-for="item in enableStatusList"
                :key="item.enableStatus"
                :label="item.enableStatusName"
                :value="item.enableStatus">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-button style="margin-left: 20px" @click="roleModifyDrawerCloseConfirm">取 消</el-button>
      <el-button type="primary" v-if="drawerTitle === '新增角色'"
                 @click="addRoleConfirm(saveRoleForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
      </el-button>
      <el-button type="primary" v-else-if="drawerTitle === '修改角色'"
                 @click="modifyRoleConfirm(saveRoleForm)" :loading="loading">{{loading ? '提交中 ...' : '确 定'}}
      </el-button>
    </div>
  </el-drawer>

  <!-- 角色菜单关系编辑抽屉 -->
  <el-drawer
      title="为角色分配菜单"
      :before-close="roleMenuDrawerClose"
      :visible.sync="showRoleMenuDrawer"
      direction="rtl"
      custom-class="demo-drawer"
      ref="roleMenuDrawer">
    <div class="demo-drawer__content">
      <el-tree
          ref="roleMenuTree"
          :data="menuList"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="roleMenu.menuIdList"
          @check="(row, checked) => { roleMenuAllocationCheck(row, checked) }"
          @check-change="(row, checked) => roleMenuAllocationChange(row, checked)"
          :props="defaultProps">
      </el-tree>
      <el-button style="margin-left: 20px" @click="showRoleMenuDrawer = false">取 消</el-button>
      <el-button type="primary" @click="roleMenuAllocationSave">确 定</el-button>
    </div>
  </el-drawer>
</div>
</template>

<script>
import {
  addRole,
  addRoleMenu,
  getMenuList,
  getRoleById,
  getRoleMenuByRoleId,
  getRolePage,
  modifyRole,
  removeRole
} from "@/api/matrixspheremanagement/api";

export default {
  name: "role",
  data() {
    return {
      menuList: [
        {
          id: '',
          menuCode: '',
          menuName: '',
          icon: '',
          sortNo: '',
          patentFlag: '',
          parentId: '',
          createBy: '',
          createByName: '',
          children: []
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'menuName'
      },

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
      showDrawer: false,
      saveRoleForm: {},
      role: {},
      rolePage: {},
      roleList: [],

      saveRoleRules: {
        roleCode: [
          { required: true, message: "请输入角色编码", trigger: "blur" },
          { min: 3, max: 20, message: "长度在3到10个字符", trigger: "blur" },
        ],
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 20, message: "长度在3到50个字符", trigger: "blur" },
        ]
      },

      showRoleMenuDrawer: false,
      roleMenuSave: {
        roleId: '',
        menuIdList: []
      },

      roleMenu: {
        roleId: '',
        menuIdList: []
      }
    }
  },
  methods: {
    //分页查询
    getRolePage(data) {
      if (data.enabled === undefined || data.enabled === '') {
        data = {
          enabled: this.enabled,
          pageNum: this.pageNum,
          pageCount: this.pageCount,
          paging: true,
          searchText: this.searchText
        }
      }
      getRolePage({
        pageCount: data.pageCount,
        pageNum: data.pageNum,
        paging: data.paging,
        enabled: data.enabled,
        searchText: data.searchText
      }).then(res => {
        if (res.data.code === 2000) {
          this.rolePage = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '分页查询角色列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //根据账号查询用户信息
    getById(roleId) {
      getRoleById(roleId).then(res => {
        if (res.data.code === 2000) {
          this.saveRoleForm = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '获取角色信息失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //角色编辑抽屉关闭
    roleModifyDrawerClose() {
      if (this.loading) {
        return;
      }
      this.$confirm('确认关闭吗？')
          .then(_ => {
            this.roleModifyDrawerCloseConfirm();
          })
          .catch(_ => {
          });
    },

    //角色菜单分配抽屉关闭
    roleMenuDrawerClose() {
      if (this.loading) {
        return;
      }
      this.$confirm('确认关闭吗？')
          .then(_ => {
            this.roleMenuDrawerCloseConfirm();
          })
          .catch(_ => {
          });
    },

    //新增按钮
    addRole() {
      this.saveRoleForm = {}
      this.drawerTitle = '新增角色'
      this.showDrawer = true
    },

    //修改按钮
    modifyRole(role) {
      this.drawerTitle = '修改角色'
      this.showDrawer = true
      this.getById(role.id)
    },

    //角色编辑抽屉取消按钮
    roleModifyDrawerCloseConfirm() {
      this.showDrawer = false
      this.$refs.saveRoleRulesRef.resetFields()
    },

    //角色菜单分配抽屉取消按钮
    roleMenuDrawerCloseConfirm() {
      this.showRoleMenuDrawer = false
    },

    //新增用户信息确认
    addRoleConfirm(saveRoleForm) {
      this.$refs.saveRoleRulesRef.validate((valid) => {
        if (valid) {
          addRole({
            ...saveRoleForm
          }).then(res => {
            if (res.data.code === 2000) {
              this.$message({
                type: 'success',
                message: '新增成功!',
                duration: 2000
              });
              this.showDrawer = false
              this.getRolePage({
                pageNum: this.pageNum,
                pageCount: this.pageCount,
                enabled: this.enabled,
                paging: true
              })
            }
          }).catch(err => {
            this.$message({
              message: '新增角色失败，原因：' + err,
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
      this.getRolePage(data)
    },

    //分页条跳转页数后
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },

    //修改用户信息确认
    modifyRoleConfirm(saveRoleForm) {
      modifyRole({
        ...saveRoleForm
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message({
            type: 'success',
            message: '修改成功!',
            duration: 1000,
            onClose: () => {
              this.showDrawer = false
              this.getRolePage({
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
    removeRole(role) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeRole(role.id).then(res => {
          if (res.data.code === 2000) {
            this.$message({
              type: 'success',
              message: '删除成功!',
              duration: 2000
            });
            this.getRolePage({
              pageNum: this.pageNum,
              pageCount: this.pageCount,
              enabled: this.enabled,
              paging: true
            })
          }
        }).catch(err => {
          this.$message({
            message: '删除角色失败，原因：' + err,
            type: 'error',
            duration: 2000,
          });
        })
      })
    },

    //点击菜单分配按钮查询菜单列表，角色菜单关联信息
    async roleMenuAllocation(role) {
      this.role = role
      this.showRoleMenuDrawer = true
      this.getMenuList()
      let roleMenu = await this.getRoleMenuByRoleId(role.id)
      if (roleMenu) {
        this.roleMenuSave = {
          roleId: roleMenu.roleId,
          menuIdList: roleMenu.menuIdList
        }
      }
    },

    roleMenuAllocationCheck(row, checked) {
      console.log(row, checked)
      let menuIdList = this.$refs.roleMenuTree.getCheckedKeys().concat(this.$refs.roleMenuTree.getHalfCheckedKeys());
      console.log(menuIdList)
      this.roleMenuSave = {
        roleId: this.role.id,
        menuIdList: menuIdList
      }
    },

    //角色菜单弹窗复选框变化
    roleMenuAllocationChange(row, checked) {
    },

    //角色菜单关联关系保存
    roleMenuAllocationSave() {
      addRoleMenu({
        ...this.roleMenuSave
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message({
            type: 'success',
            message: '保存成功!',
            duration: 2000
          });
          this.roleMenuSave = {}
          this.showRoleMenuDrawer = false
        } else {
          this.$message({
            message: res.data.message,
            type: 'error',
            duration: 2000,
          });
        }
      }).catch(err => {
        this.$message({
          message: '保存角色菜单关系失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //获取菜单列表
    getMenuList() {
      getMenuList(1).then(res => {
        if (res.data.code === 2000) {
          this.menuList = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '分页查询用户列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    //获取角色菜单关系
    async getRoleMenuByRoleId(roleId) {
      let result
      await getRoleMenuByRoleId(roleId).then(res => {
        if (res.data.code === 2000) {
          if (res.data.body) {
            this.roleMenu = res.data.body
          }
          result = res.data.body
        }
      }).catch(err => {
        this.$message({
          message: '查询用户菜单关系失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
      return result
    }
  },
  created() {
    let data = {
      pageNum: this.pageNum,
      pageCount: this.pageCount,
      enabled: this.enabled,
      paging: true
    }
    this.getRolePage(data)
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
  .el-tree {
    margin-bottom: 20px;
  }
}
</style>
