<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" size="small" @submit.native.prevent>
        <el-form-item label="角色搜索">
          <el-input
              v-model="searchText"
              placeholder="输入角色编码/名称"
              prefix-icon="el-icon-search"
              clearable
              style="width: 260px;"
              @keyup.enter.native="getRolePage"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="enabled" placeholder="全部" clearable style="width: 120px;" @change="getRolePage">
            <el-option
                v-for="item in enableStatusList"
                :key="item.enableStatus"
                :label="item.enableStatusName"
                :value="item.enableStatus">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getRolePage">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-bar">
      <el-button type="primary" icon="el-icon-plus" size="small" @click="addRole">新增角色</el-button>
    </div>

    <el-card shadow="never" class="table-card" :body-style="{ padding: '0' }">
      <el-table
          v-loading="loading"
          :data="rolePage.list"
          border
          stripe
          highlight-current-row
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="roleName" label="角色名称" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span style="font-weight: 600; color: #303133">{{ scope.row.roleName }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="roleCode" label="角色编码" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag size="small" type="info" effect="plain">{{ scope.row.roleCode }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="enabled" label="启用状态" width="120" align="center">
          <template slot-scope="scope">
            <el-switch
                v-model="scope.row.enabled"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="modifyRoleConfirm(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="createByName" label="创建人" width="120" align="center" />

        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="modifyRole(scope.row)">编辑</el-button>
            <el-button type="text" icon="el-icon-s-operation" @click="roleMenuAllocation(scope.row)">菜单分配</el-button>
            <el-button type="text" class="text-danger" icon="el-icon-delete" @click="removeRole(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" v-if="rolePage.total > 0">
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="rolePage.pageNum"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="rolePage.pageCount"
            layout="total, sizes, prev, pager, next, jumper"
            :total="rolePage.total">
        </el-pagination>
      </div>
    </el-card>

    <el-drawer
        :title="drawerTitle"
        :visible.sync="showDrawer"
        :before-close="roleModifyDrawerClose"
        size="500px"
        :wrapperClosable="false"
        custom-class="custom-drawer"
    >
      <div class="drawer-content">
        <el-form :model="saveRoleForm" :rules="saveRoleRules" ref="saveRoleRulesRef" label-width="100px" label-position="top">
          <el-form-item prop="roleCode" label="角色编码">
            <el-input v-model="saveRoleForm.roleCode" placeholder="唯一标识，如: admin_role" />
          </el-form-item>
          <el-form-item prop="roleName" label="角色名称">
            <el-input v-model="saveRoleForm.roleName" placeholder="显示名称，如: 系统管理员" />
          </el-form-item>
          <el-form-item prop="enabled" label="启用状态">
            <el-radio-group v-model="saveRoleForm.enabled">
              <el-radio :label="true">启用</el-radio>
              <el-radio :label="false">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <div class="drawer-footer">
        <el-button @click="roleModifyDrawerCloseConfirm">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
      </div>
    </el-drawer>

    <el-drawer
        title="菜单权限分配"
        :visible.sync="showRoleMenuDrawer"
        :before-close="roleMenuDrawerClose"
        size="500px"
        custom-class="custom-drawer"
    >
      <div class="drawer-content">
        <el-input
            placeholder="输入菜单名称进行过滤"
            v-model="filterText"
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 15px;"
        />
        <el-tree
            ref="roleMenuTree"
            :data="menuList"
            show-checkbox
            node-key="id"
            default-expand-all
            :filter-node-method="filterNode"
            :default-checked-keys="roleMenu.menuIdList"
            :props="defaultProps"
            highlight-current
            @check="roleMenuAllocationCheck"
        >
        </el-tree>
      </div>
      <div class="drawer-footer">
        <el-button @click="showRoleMenuDrawer = false">取 消</el-button>
        <el-button type="primary" :loading="menuLoading" @click="roleMenuAllocationSave">保存分配</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  addRole,
  addRoleMenu,
  getRoleById,
  getRoleMenuByRoleId,
  getRolePage,
  modifyRole,
  removeRole,
  getMenuList
} from "@/views/accountManagement/api";

export default {
  name: "RoleManagement",
  data() {
    return {
      // 页面状态
      loading: false,
      submitLoading: false,
      menuLoading: false,

      // 搜索参数
      searchText: '',
      enabled: undefined, // 默认为 undefined 查全部
      enableStatusList: [
        { enableStatus: true, enableStatusName: '启用' },
        { enableStatus: false, enableStatusName: '停用' }
      ],

      // 表格数据
      rolePage: {
        total: 0,
        pageNum: 1,
        pageCount: 10,
        data: []
      },

      // 抽屉控制
      showDrawer: false,
      drawerTitle: '',
      showRoleMenuDrawer: false,

      // 表单数据
      saveRoleForm: {
        id: '',
        roleCode: '',
        roleName: '',
        enabled: true
      },

      // 菜单树数据
      menuList: [],
      filterText: '',
      roleMenu: {
        roleId: '',
        menuIdList: []
      },
      roleMenuSave: {
        roleId: '',
        menuIdList: []
      },
      role: {}, // 当前操作的角色对象

      // 校验规则
      saveRoleRules: {
        roleCode: [
          { required: true, message: "请输入角色编码", trigger: "blur" },
          { min: 3, max: 20, message: "长度在3到20个字符", trigger: "blur" }
        ],
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 20, message: "长度在2到20个字符", trigger: "blur" }
        ]
      },

      defaultProps: {
        children: 'children',
        label: 'menuName'
      },
    };
  },

  watch: {
    filterText(val) {
      this.$refs.roleMenuTree.filter(val);
    }
  },

  methods: {
    // --- 查 ---
    getRolePage() {
      this.loading = true;
      const params = {
        pageNum: this.rolePage.pageNum,
        pageCount: this.rolePage.pageCount,
        paging: true,
        enabled: this.enabled === '' ? undefined : this.enabled,
        searchText: this.searchText
      };

      getRolePage(params).then(res => {
        if (res.code === 200) {
          this.rolePage = res.data || { pageNum: 1, pageSize: 10, total: 0, list: [] };
        }
      }).catch(err => {
        this.$message.error('查询角色失败: ' + err);
      }).finally(() => {
        this.loading = false;
      });
    },

    resetQuery() {
      this.searchText = '';
      this.enabled = undefined;
      this.rolePage.pageNum = 1;
      this.getRolePage();
    },

    // --- 增/改 ---
    addRole() {
      this.resetForm();
      this.drawerTitle = '新增角色';
      this.showDrawer = true;
    },

    modifyRole(role) {
      this.resetForm();
      this.drawerTitle = '修改角色';
      this.showDrawer = true;
      // 获取详情回显
      getRoleById(role.id).then(res => {
        if (res.code === 200) {
          this.saveRoleForm = res.data;
        }
      });
    },

    // 统一提交入口
    handleSubmit() {
      this.$refs.saveRoleRulesRef.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          const isAdd = this.drawerTitle === '新增角色';
          const api = isAdd ? addRole : modifyRole;

          api(this.saveRoleForm).then(res => {
            if (res.code === 200) {
              this.$message.success(isAdd ? '新增成功' : '修改成功');
              this.showDrawer = false;
              this.getRolePage();
            } else {
              this.$message.error(res.message);
            }
          }).catch(err => {
            this.$message.error('操作失败: ' + err);
          }).finally(() => {
            this.submitLoading = false;
          });
        }
      });
    },

    // 列表中的 Switch 状态修改
    modifyRoleConfirm(row) {
      // 可以在这里加一个 Loading 状态防止连点
      modifyRole(row).then(res => {
        if (res.code === 200) {
          this.$message.success('状态更新成功');
        } else {
          this.$message.error(res.message);
          row.enabled = !row.enabled; // 回滚状态
        }
      }).catch(() => {
        row.enabled = !row.enabled; // 回滚状态
      });
    },

    // --- 删 ---
    removeRole(role) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '警告', {
        type: 'warning'
      }).then(() => {
        removeRole(role.id).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功');
            this.getRolePage();
          } else {
            this.$message.error(res.message);
          }
        });
      }).catch(() => {});
    },

    // --- 菜单分配 ---
    async roleMenuAllocation(role) {
      this.role = role;
      this.filterText = '';
      this.showRoleMenuDrawer = true;

      // 1. 获取所有菜单
      if (this.menuList.length === 0) {
        await this.getMenuList();
      }

      // 2. 获取当前角色已有的菜单
      this.roleMenu.menuIdList = []; // 先清空，防止闪烁
      getRoleMenuByRoleId(role.id).then(res => {
        if (res.code === 200 && res.data) {
          this.roleMenu = res.data;
          this.roleMenuSave = {
            roleId: role.id,
            menuIdList: res.data.menuIdList || []
          };
          // 设置树的选中状态
          this.$nextTick(() => {
            this.$refs.roleMenuTree.setCheckedKeys(this.roleMenuSave.menuIdList);
          });
        } else {
          // 如果没有数据，初始化为空
          this.roleMenuSave = { roleId: role.id, menuIdList: [] };
          this.$refs.roleMenuTree.setCheckedKeys([]);
        }
      });
    },

    roleMenuAllocationCheck(checkedNodes, checkedKeys) {
      // Element UI Tree 的 check 事件返回两个对象，第二个参数包含了 checkedKeys 和 halfCheckedKeys
      const allChecked = [...checkedKeys.checkedKeys, ...checkedKeys.halfCheckedKeys];
      this.roleMenuSave.menuIdList = allChecked;
    },

    roleMenuAllocationSave() {
      this.menuLoading = true;
      // 确保 roleId 存在
      if (!this.roleMenuSave.roleId) {
        this.roleMenuSave.roleId = this.role.id;
      }

      addRoleMenu(this.roleMenuSave).then(res => {
        if (res.code === 200) {
          this.$message.success('权限保存成功');
          this.showRoleMenuDrawer = false;
        } else {
          this.$message.error(res.message);
        }
      }).catch(err => {
        this.$message.error('保存失败: ' + err);
      }).finally(() => {
        this.menuLoading = false;
      });
    },

    getMenuList() {
      // 假设传1获取所有菜单
      return getMenuList(1).then(res => {
        if (res.code === 200) {
          this.menuList = res.data || [];
        }
      });
    },

    // 树过滤
    filterNode(value, data) {
      if (!value) return true;
      return data.menuName.indexOf(value) !== -1;
    },

    // --- 分页 ---
    handleSizeChange(val) {
      this.rolePage.pageCount = val;
      this.getRolePage();
    },
    handleCurrentChange(val) {
      this.rolePage.pageNum = val;
      this.getRolePage();
    },

    // --- 辅助 ---
    roleModifyDrawerClose(done) {
      this.resetForm();
      done();
    },
    roleMenuDrawerClose(done) {
      this.filterText = '';
      done();
    },
    roleModifyDrawerCloseConfirm() {
      this.showDrawer = false;
      this.resetForm();
    },
    resetForm() {
      this.saveRoleForm = { id: '', roleCode: '', roleName: '', enabled: true };
      this.$nextTick(() => {
        if (this.$refs.saveRoleRulesRef) this.$refs.saveRoleRulesRef.clearValidate();
      });
    }
  },
  created() {
    this.getRolePage();
  }
};
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 140px);
}

/* 搜索区 */
.filter-container {
  margin-bottom: 15px;
  border: none;
  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

/* 操作栏 */
.action-bar {
  margin-bottom: 15px;
}

/* 表格区 */
.table-card {
  border: none;
}

.pagination-container {
  background: #fff;
  padding: 10px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}

.text-danger {
  color: #F56C6C;
  &:hover { color: #f78989; }
}

/* 抽屉样式优化 */
.drawer-content {
  padding: 20px;
  height: calc(100% - 60px); /* 减去 footer 高度 */
  overflow-y: auto;
}

.drawer-footer {
  height: 60px;
  line-height: 60px;
  border-top: 1px solid #e8e8e8;
  text-align: right;
  padding-right: 20px;
  background: #fff;
  position: absolute;
  bottom: 0;
  width: 100%;
}

/* 抽屉表单样式 */
::v-deep .custom-drawer .el-drawer__body {
  padding: 0; /* 重置默认 padding，由内部元素控制 */
  display: flex;
  flex-direction: column;
}
</style>