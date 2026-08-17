<template>
  <PageContainer title="用户管理" subtitle="管理系统用户账号、状态及角色分配">
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="addAccount">新增用户</el-button>
    </template>

    <template #filter>
      <FilterBar @search="getAccountPage" @reset="resetQuery">
        <el-form-item label="用户搜索">
          <el-input
              v-model="searchText"
              placeholder="账号/名称模糊搜索"
              prefix-icon="el-icon-search"
              clearable
              style="width: 260px;"
              size="small"
              @keyup.enter.native="getAccountPage"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="enabled" placeholder="全部" clearable style="width: 120px;" size="small" @change="getAccountPage">
            <el-option
                v-for="item in enableStatusList"
                :key="item.enableStatus"
                :label="item.enableStatusName"
                :value="item.enableStatus"
            />
          </el-select>
        </el-form-item>
      </FilterBar>
    </template>

    <el-card shadow="never" class="table-card" :body-style="{ padding: '0' }">
      <el-table
          v-loading="loading"
          :data="accountPage.list"
          stripe
          style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="accountNo" label="用户账号" min-width="120" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span class="account-no">{{ row.accountNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="用户名称" min-width="120" />
        <el-table-column prop="deptName" label="所属部门" min-width="120">
          <template slot-scope="{ row }">
            {{ row.deptName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="密码过期时间" width="160" align="center">
          <template slot-scope="{ row }">
            <span class="text-muted">{{ row.expireTime || '2099-12-31' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <el-switch
                v-model="row.enabled"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="modifyAccountStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createByName" label="创建人" width="100" align="center" />
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" icon="el-icon-edit" @click="modifyAccount(row)">编辑</el-button>
            <el-button type="text" size="small" icon="el-icon-user" @click="roleAllocation(row)">分配角色</el-button>
            <el-button type="text" size="small" class="text-danger" icon="el-icon-delete" @click="removeAccount(row)">删除</el-button>
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
            :total="accountPage.total"
        />
      </div>
    </el-card>

    <!-- 用户编辑抽屉 -->
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

    <!-- 角色分配抽屉 -->
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
        />
      </div>
      <div class="drawer-footer">
        <el-button @click="roleAllocationDialog = false">关 闭</el-button>
      </div>
    </el-drawer>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
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
} from '@/views/accountManagement/api'

export default {
  name: 'AccountManagement',
  components: {
    PageContainer,
    FilterBar
  },
  data() {
    return {
      loading: false,
      submitLoading: false,

      searchText: '',
      enabled: undefined,
      enableStatusList: [
        { enableStatus: true, enableStatusName: '启用' },
        { enableStatus: false, enableStatusName: '停用' }
      ],

      accountPage: {
        total: 0,
        pageNum: 1,
        pageCount: 10,
        list: []
      },

      accountModifyDialog: false,
      roleAllocationDialog: false,
      drawerTitle: '',

      saveAccountForm: {
        id: '',
        accountNo: '',
        accountName: '',
        accountPassword: '',
        cellPhone: '',
        idCardNo: '',
        enabled: true
      },

      account: {},
      roleList: [],
      allocationRoleId: [],

      saveAccountRules: {
        accountNo: [
          { required: true, message: '请输入用户账号', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
        ],
        accountPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
        ],
        accountName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getAccountPage() {
      this.loading = true
      const params = {
        pageNum: this.accountPage.pageNum,
        pageCount: this.accountPage.pageCount,
        paging: true,
        enabled: this.enabled === '' ? undefined : this.enabled,
        searchText: this.searchText
      }

      getAccountPage(params).then(res => {
        if (res.code === 200) {
          this.accountPage = res.data || { pageNum: 1, pageSize: 10, total: 0, list: [] }
        }
      }).catch(err => {
        this.$message.error('查询失败: ' + err)
      }).finally(() => {
        this.loading = false
      })
    },

    resetQuery() {
      this.searchText = ''
      this.enabled = undefined
      this.accountPage.pageNum = 1
      this.getAccountPage()
    },

    addAccount() {
      this.resetForm()
      this.drawerTitle = '新增用户信息'
      this.accountModifyDialog = true
    },

    modifyAccount(account) {
      this.resetForm()
      this.drawerTitle = '修改用户信息'
      this.accountModifyDialog = true
      getById(account.id).then(res => {
        if (res.code === 200) {
          this.saveAccountForm = res.data
        }
      })
    },

    handleSubmit() {
      this.$refs.saveAccountRulesRef.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const isAdd = this.drawerTitle === '新增用户信息'
          const api = isAdd ? addAccount : modifyAccount

          api(this.saveAccountForm).then(res => {
            if (res.code === 200) {
              this.$message.success(isAdd ? '新增成功' : '修改成功')
              this.accountModifyDialog = false
              this.getAccountPage()
            } else {
              this.$message.error(res.message)
            }
          }).catch(err => {
            this.$message.error('操作失败: ' + err)
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    modifyAccountStatus(row) {
      modifyAccount(row).then(res => {
        if (res.code === 200) {
          this.$message.success('状态已更新')
        } else {
          row.enabled = !row.enabled
          this.$message.error(res.message)
        }
      }).catch(() => {
        row.enabled = !row.enabled
      })
    },

    removeAccount(account) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeAccount(account.id).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getAccountPage()
          } else {
            this.$message.error(res.message)
          }
        })
      }).catch(() => {})
    },

    async roleAllocation(account) {
      this.account = account
      this.roleAllocationDialog = true

      try {
        const roleRes = await getRoleList()
        if (roleRes.code === 200) {
          this.roleList = roleRes.data.map(item => ({
            key: item.id,
            label: `${item.roleName} (${item.roleCode})`,
            disabled: !item.enabled
          }))
        }
      } catch (err) {
        this.$message.error('获取角色列表失败')
        return
      }

      try {
        const allocatedRes = await getAccountRoleByAccountId(account.id)
        if (allocatedRes.code === 200) {
          this.allocationRoleId = allocatedRes.data.map(item => item.roleId)
        } else {
          this.allocationRoleId = []
        }
      } catch (err) {
        this.allocationRoleId = []
      }
    },

    roleAllocationConfirm(value, direction, movedKeys) {
      const api = direction === 'right' ? addAccountRole : removeAccountRole
      api({
        accountId: this.account.id,
        roleIdList: direction === 'right' ? value : movedKeys
      }).then(res => {
        if (res.code === 200) {
          this.$message.success(direction === 'right' ? '分配成功' : '移除成功')
        } else {
          this.$message.error(res.message)
        }
      }).catch(err => {
        this.$message.error('操作异常: ' + err)
      })
    },

    handleSizeChange(val) {
      this.accountPage.pageCount = val
      this.getAccountPage()
    },
    handleCurrentChange(val) {
      this.accountPage.pageNum = val
      this.getAccountPage()
    },
    handleAccountDrawerClose(done) {
      this.resetForm()
      done()
    },
    accountDialogCancel() {
      this.accountModifyDialog = false
      this.resetForm()
    },
    resetForm() {
      this.saveAccountForm = { id: '', accountNo: '', accountName: '', accountPassword: '', enabled: true }
      this.$nextTick(() => {
        if (this.$refs.saveAccountRulesRef) this.$refs.saveAccountRulesRef.clearValidate()
      })
    }
  },
  created() {
    this.getAccountPage()
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

/* 表格卡片 */
.table-card {
  border-radius: @border-radius;

  /deep/ .el-table {
    th {
      background-color: var(--table-header-bg);
      color: @text-secondary;
      font-weight: 600;
      font-size: @font-size-sm;
    }

    td {
      padding: 10px 0;
    }
  }
}

.account-no {
  font-weight: 600;
  color: @text-primary;
}

.text-muted {
  color: @text-tertiary;
  font-size: @font-size-xs;
}

.pagination-container {
  padding: @space-3 @space-5;
  text-align: right;
  border-top: 1px solid @border-color-light;
}

.text-danger {
  color: @error-color;
  &:hover { color: #f78989; }
}

/* 抽屉样式 */
.drawer-content {
  padding: @space-5;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.drawer-footer {
  height: 60px;
  line-height: 60px;
  border-top: 1px solid @border-color-light;
  text-align: right;
  padding-right: @space-5;
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
    margin-bottom: @space-5;
    text-align: center;
    color: @text-secondary;
    font-size: @font-size-sm;

    strong {
      color: @primary-color;
    }
  }

  :deep(.el-transfer-panel) {
    width: 220px;
  }
}

::v-deep .custom-drawer .el-drawer__body {
  padding: 0;
  display: flex;
  flex-direction: column;
}
</style>
