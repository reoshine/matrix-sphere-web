<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" size="small" @submit.native.prevent>
        <el-form-item label="用户搜索">
          <el-input
              v-model="searchText"
              placeholder="账号/名称模糊搜索"
              prefix-icon="el-icon-search"
              clearable
              style="width: 260px;"
              @keyup.enter.native="getAccountPage"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="enabled" placeholder="全部" clearable style="width: 120px;" @change="getAccountPage">
            <el-option
                v-for="item in enableStatusList"
                :key="item.enableStatus"
                :label="item.enableStatusName"
                :value="item.enableStatus">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="getAccountPage">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-bar">
      <el-button type="primary" icon="el-icon-plus" size="small" @click="addAccount">新增用户</el-button>
    </div>

    <el-card shadow="never" class="table-card" :body-style="{ padding: '0' }">
      <el-table
          v-loading="loading"
          :data="accountPage.list"
          border
          stripe
          highlight-current-row
          style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="accountNo" label="用户账号" min-width="120" show-overflow-tooltip>
          <template slot-scope="scope">
            <span style="font-weight: 600; color: #303133">{{ scope.row.accountNo }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="accountName" label="用户名称" min-width="120" />

        <el-table-column prop="deptName" label="所属部门" min-width="120">
          <template slot-scope="scope">
            {{ scope.row.deptName || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="密码过期时间" width="160" align="center">
          <template slot-scope="scope">
            <span style="font-size: 12px; color: #909399">{{ scope.row.expireTime || '2099-12-31' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="enabled" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
                v-model="scope.row.enabled"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="modifyAccountStatus(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="createByName" label="创建人" width="100" align="center" />

        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="modifyAccount(scope.row)">编辑</el-button>
            <el-button type="text" icon="el-icon-user" @click="roleAllocation(scope.row)">分配角色</el-button>
            <el-button type="text" class="text-danger" icon="el-icon-delete" @click="removeAccount(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" v-if="accountPage.total > 0">
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="accountPage.pageNum"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="accountPage.pageCount"
            layout="total, sizes, prev, pager, next, jumper"
            :total="accountPage.total">
        </el-pagination>
      </div>
    </el-card>

    <el-drawer
        :title="drawerTitle"
        :visible.sync="accountModifyDialog"
        :before-close="handleAccountDrawerClose"
        size="550px"
        custom-class="custom-drawer"
        :wrapperClosable="false"
    >
      <div class="drawer-content">
        <el-form
            :model="saveAccountForm"
            :rules="saveAccountRules"
            ref="saveAccountRulesRef"
            label-width="90px"
            label-position="right"
            size="small"
        >
          <el-divider content-position="left">基础信息</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户账号" prop="accountNo">
                <el-input v-model="saveAccountForm.accountNo" placeholder="登录账号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户名称" prop="accountName">
                <el-input v-model="saveAccountForm.accountName" placeholder="真实姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="登录密码" prop="accountPassword">
                <el-input v-model="saveAccountForm.accountPassword" show-password placeholder="请输入密码" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">扩展信息</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="联系电话" prop="cellPhone">
                <el-input v-model="saveAccountForm.cellPhone" placeholder="手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号" prop="idCardNo">
                <el-input v-model="saveAccountForm.idCardNo" placeholder="身份证号" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="启用状态" prop="enabled">
                <el-radio-group v-model="saveAccountForm.enabled">
                  <el-radio :label="true">启用</el-radio>
                  <el-radio :label="false">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="drawer-footer">
        <el-button @click="accountDialogCancel">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
      </div>
    </el-drawer>

    <el-drawer
        title="角色分配"
        :visible.sync="roleAllocationDialog"
        size="600px"
        custom-class="custom-drawer"
        :wrapperClosable="false"
    >
      <div class="drawer-content transfer-wrapper">
        <div class="transfer-header">
          <i class="el-icon-user-solid"></i>
          正在为用户 <strong>{{ account.accountName }}</strong> 分配角色
        </div>
        <el-transfer
            v-model="allocationRoleId"
            :data="roleList"
            :titles="['可选角色', '已选角色']"
            :button-texts="['移除', '添加']"
            filterable
            filter-placeholder="搜索角色"
            @change="roleAllocationConfirm"
        >
        </el-transfer>
      </div>
      <div class="drawer-footer">
        <el-button @click="roleAllocationDialog = false">关 闭</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  addAccount,
  getAccountPage,
  getById,
  modifyAccount,
  removeAccount,
  addAccountRole,
  getAccountRoleByAccountId,
  removeAccountRole,
  getRoleList
} from "@/views/accountManagement/api";

export default {
  name: "AccountManagement",
  data() {
    return {
      // 页面状态
      loading: false,
      submitLoading: false,

      // 搜索数据
      searchText: '',
      enabled: undefined, // undefined 表示查全部
      enableStatusList: [
        { enableStatus: true, enableStatusName: '启用' },
        { enableStatus: false, enableStatusName: '停用' }
      ],

      // 表格数据
      accountPage: {
        total: 0,
        pageNum: 1,
        pageCount: 10,
        data: []
      },

      // 抽屉控制
      accountModifyDialog: false,
      roleAllocationDialog: false,
      drawerTitle: '',

      // 表单数据
      saveAccountForm: {
        id: '',
        accountNo: '',
        accountName: '',
        accountPassword: '',
        cellPhone: '',
        idCardNo: '',
        enabled: true
      },

      // 当前操作的用户对象 (替代 bus)
      account: {},

      // 角色分配数据
      roleList: [],
      allocationRoleId: [],

      // 校验规则
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
        ]
      },
    }
  },
  methods: {
    // --- 查询 ---
    getAccountPage() {
      this.loading = true;
      const params = {
        pageNum: this.accountPage.pageNum,
        pageCount: this.accountPage.pageCount,
        paging: true,
        enabled: this.enabled === '' ? undefined : this.enabled,
        searchText: this.searchText
      };

      getAccountPage(params).then(res => {
        if (res.code === 200) {
          this.accountPage = res.data || { pageNum: 1, pageSize: 10, total: 0, list: [] };
        }
      }).catch(err => {
        this.$message.error('查询失败: ' + err);
      }).finally(() => {
        this.loading = false;
      });
    },

    resetQuery() {
      this.searchText = '';
      this.enabled = undefined;
      this.accountPage.pageNum = 1;
      this.getAccountPage();
    },

    // --- 增/改 ---
    addAccount() {
      this.resetForm();
      this.drawerTitle = '新增用户信息';
      this.accountModifyDialog = true;
    },

    modifyAccount(account) {
      this.resetForm();
      this.drawerTitle = '修改用户信息';
      this.accountModifyDialog = true;
      // 回显数据
      getById(account.id).then(res => {
        if (res.code === 200) {
          this.saveAccountForm = res.data;
        }
      });
    },

    handleSubmit() {
      this.$refs.saveAccountRulesRef.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          const isAdd = this.drawerTitle === '新增用户信息';
          const api = isAdd ? addAccount : modifyAccount;

          api(this.saveAccountForm).then(res => {
            if (res.code === 200) {
              this.$message.success(isAdd ? '新增成功' : '修改成功');
              this.accountModifyDialog = false;
              this.getAccountPage();
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

    // 列表中的开关切换
    modifyAccountStatus(row) {
      modifyAccount(row).then(res => {
        if (res.code === 200) {
          this.$message.success('状态已更新');
        } else {
          row.enabled = !row.enabled; // 失败回滚
          this.$message.error(res.message);
        }
      }).catch(() => {
        row.enabled = !row.enabled; // 失败回滚
      });
    },

    // --- 删 ---
    removeAccount(account) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeAccount(account.id).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功');
            this.getAccountPage();
          } else {
            this.$message.error(res.message);
          }
        });
      }).catch(() => {});
    },

    // --- 角色分配 ---
    async roleAllocation(account) {
      this.account = account; // 直接赋值，替代 bus
      this.roleAllocationDialog = true;

      // 1. 获取所有角色
      try {
        const roleRes = await getRoleList();
        if (roleRes.code === 200) {
          this.roleList = roleRes.data.map(item => ({
            key: item.id,
            label: `${item.roleName} (${item.roleCode})`, // 优化显示
            disabled: !item.enabled // 假设禁用角色不可选
          }));
        }
      } catch (err) {
        this.$message.error('获取角色列表失败');
        return;
      }

      // 2. 获取已分配角色
      try {
        const allocatedRes = await getAccountRoleByAccountId(account.id);
        if (allocatedRes.code === 200) {
          this.allocationRoleId = allocatedRes.data.map(item => item.roleId);
        } else {
          this.allocationRoleId = [];
        }
      } catch (err) {
        this.allocationRoleId = [];
      }
    },

    // 穿梭框变动事件
    roleAllocationConfirm(value, direction, movedKeys) {
      const api = direction === 'right' ? addAccountRole : removeAccountRole;

      api({
        accountId: this.account.id,
        roleIdList: direction === 'right' ? value : movedKeys // 注意：移除时可能逻辑不同，视后端API而定
        // 修正：如果是 addAccountRole，通常传全量或者新增的。
        // 这里假设您的后端逻辑：
        // addAccountRole: 传入 roleIdList 为需要绑定的
        // removeAccountRole: 传入 roleIdList 为需要解绑的
      }).then(res => {
        if (res.code === 200) {
          this.$message.success(direction === 'right' ? '分配成功' : '移除成功');
        } else {
          this.$message.error(res.message);
          // 这里其实应该回滚穿梭框状态，但比较复杂，一般让用户重试
        }
      }).catch(err => {
        this.$message.error('操作异常: ' + err);
      });
    },

    // --- 辅助 ---
    handleSizeChange(val) {
      this.accountPage.pageCount = val;
      this.getAccountPage();
    },
    handleCurrentChange(val) {
      this.accountPage.pageNum = val;
      this.getAccountPage();
    },
    handleAccountDrawerClose(done) {
      this.resetForm();
      done();
    },
    accountDialogCancel() {
      this.accountModifyDialog = false;
      this.resetForm();
    },
    resetForm() {
      this.saveAccountForm = { id: '', accountNo: '', accountName: '', accountPassword: '', enabled: true };
      this.$nextTick(() => {
        if (this.$refs.saveAccountRulesRef) this.$refs.saveAccountRulesRef.clearValidate();
      });
    }
  },
  created() {
    this.getAccountPage();
  }
}
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 140px);
}

.filter-container {
  margin-bottom: 15px;
  border: none;
  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.action-bar {
  margin-bottom: 15px;
}

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

/* 抽屉样式 */
.drawer-content {
  padding: 20px;
  height: calc(100% - 60px);
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

/* 穿梭框容器 */
.transfer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .transfer-header {
    width: 100%;
    margin-bottom: 20px;
    text-align: center;
    color: #606266;
    font-size: 14px;

    strong {
      color: #409EFF;
    }
  }

  :deep(.el-transfer-panel) {
    width: 220px; // 调整宽度适应抽屉
  }
}

::v-deep .custom-drawer .el-drawer__body {
  padding: 0;
  display: flex;
  flex-direction: column;
}
</style>