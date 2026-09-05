<template>
  <PageContainer title="角色权限" subtitle="管理角色、权限及其分配关系">
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="onAdd">新增{{ activeTab === 'role' ? '角色' : '权限' }}</el-button>
    </template>

    <el-tabs v-model="activeTab" type="border-card" class="role-tabs">
      <!-- 角色管理 -->
      <el-tab-pane label="角色管理" name="role">
        <span slot="label"><i class="el-icon-user"></i> 角色管理</span>
        <div class="tab-content">
          <FilterBar @search="getRolePage" @reset="resetRoleQuery">
            <el-form-item label="角色搜索">
              <el-input v-model="roleSearch.searchText" placeholder="输入角色编码/名称" prefix-icon="el-icon-search" clearable style="width: 260px;" size="small" @keyup.enter.native="getRolePage" />
            </el-form-item>
            <el-form-item label="启用状态">
              <el-select v-model="roleSearch.enabled" placeholder="全部" clearable style="width: 120px;" size="small" @change="getRolePage">
                <el-option v-for="item in enableStatusList" :key="item.enableStatus" :label="item.enableStatusName" :value="item.enableStatus" />
              </el-select>
            </el-form-item>
          </FilterBar>

          <el-card shadow="never" :body-style="{ padding: '0' }" class="table-card">
            <el-table v-loading="roleLoading" :data="rolePage.list" stripe style="width: 100%">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="roleName" label="角色名称" min-width="150" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <span class="item-name">{{ row.roleName }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="roleCode" label="角色编码" min-width="150" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <el-tag size="small" type="info" effect="plain">{{ row.roleCode }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="enabled" label="状态" width="100" align="center">
                <template slot-scope="{ row }">
                  <el-switch v-model="row.enabled"  @change="modifyRoleConfirm(row)" />
                </template>
              </el-table-column>
              <el-table-column prop="createByName" label="创建人" width="100" align="center" />
              <el-table-column label="操作" width="250" fixed="right" align="center">
                <template slot-scope="{ row }">
                  <el-button type="text" size="small" icon="el-icon-edit" @click="modifyRole(row)">编辑</el-button>
                  <el-button type="text" size="small" icon="el-icon-s-operation" @click="roleMenuAllocation(row)">菜单分配</el-button>
                  <el-button type="text" size="small" class="text-danger" icon="el-icon-delete" @click="removeRole(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container" v-if="rolePage.total > 0">
              <el-pagination background @size-change="roleSizeChange" @current-change="roleCurrentChange" :current-page="rolePage.pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="rolePage.pageCount" layout="total, sizes, prev, pager, next, jumper" :total="rolePage.total" />
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 权限管理 -->
      <el-tab-pane label="权限管理" name="authority">
        <span slot="label"><i class="el-icon-lock"></i> 权限管理</span>
        <div class="tab-content">
          <FilterBar @search="getAuthorityPage" @reset="resetAuthorityQuery">
            <el-form-item label="权限搜索">
              <el-input v-model="authoritySearch.searchText" placeholder="输入权限编码/名称" prefix-icon="el-icon-search" clearable style="width: 260px;" size="small" @keyup.enter.native="getAuthorityPage" />
            </el-form-item>
            <el-form-item label="启用状态">
              <el-select v-model="authoritySearch.enabled" placeholder="全部" clearable style="width: 120px;" size="small" @change="getAuthorityPage">
                <el-option v-for="item in enableStatusList" :key="item.enableStatus" :label="item.enableStatusName" :value="item.enableStatus" />
              </el-select>
            </el-form-item>
          </FilterBar>

          <el-card shadow="never" :body-style="{ padding: '0' }" class="table-card">
            <el-table v-loading="authorityLoading" :data="authorityPage.list" stripe style="width: 100%">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="authorityCode" label="权限编码" min-width="150" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <el-tag size="small" type="info" effect="plain">{{ row.authorityCode }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="authorityDesc" label="权限名称" min-width="150" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <span class="item-name">{{ row.authorityDesc }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="enabled" label="状态" width="100" align="center">
                <template slot-scope="{ row }">
                  <el-switch v-model="row.enabled"  @change="modifyAuthorityConfirm(row)" />
                </template>
              </el-table-column>
              <el-table-column prop="createByName" label="创建人" width="100" align="center" />
              <el-table-column label="操作" width="200" fixed="right" align="center">
                <template slot-scope="{ row }">
                  <el-button type="text" size="small" icon="el-icon-edit" @click="modifyAuthority(row)">编辑</el-button>
                  <el-button type="text" size="small" class="text-danger" icon="el-icon-delete" @click="removeAuthority(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container" v-if="authorityPage.total > 0">
              <el-pagination background @size-change="authoritySizeChange" @current-change="authorityCurrentChange" :current-page="authorityPage.pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="authorityPage.pageCount" layout="total, sizes, prev, pager, next, jumper" :total="authorityPage.total" />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 角色编辑抽屉 -->
    <el-drawer :title="roleDrawerTitle" :visible.sync="showRoleDrawer" :before-close="roleDrawerClose" size="500px" :wrapperClosable="false" custom-class="custom-drawer">
      <div class="drawer-content">
        <el-form :model="saveRoleForm" :rules="saveRoleRules" ref="saveRoleRulesRef" label-position="top">
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
        <el-button @click="showRoleDrawer = false">取 消</el-button>
        <el-button type="primary" :loading="roleSubmitLoading" @click="handleRoleSubmit">确 定</el-button>
      </div>
    </el-drawer>

    <!-- 权限编辑抽屉 -->
    <el-drawer :title="authorityDrawerTitle" :visible.sync="showAuthorityDrawer" size="500px" :wrapperClosable="false" custom-class="custom-drawer">
      <div class="drawer-content">
        <el-form :model="saveAuthorityForm" :rules="saveAuthorityRules" ref="saveAuthorityRulesRef" label-position="top">
          <el-form-item prop="authorityCode" label="权限编码">
            <el-input v-model="saveAuthorityForm.authorityCode" placeholder="唯一标识，如: user:read" />
          </el-form-item>
          <el-form-item prop="authorityDesc" label="权限名称">
            <el-input v-model="saveAuthorityForm.authorityDesc" placeholder="描述，如: 查看用户" />
          </el-form-item>
          <el-form-item prop="enabled" label="启用状态">
            <el-select v-model="saveAuthorityForm.enabled" style="width: 100%;">
              <el-option v-for="item in enableStatusList" :key="item.enableStatus" :label="item.enableStatusName" :value="item.enableStatus" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="drawer-footer">
        <el-button @click="showAuthorityDrawer = false">取 消</el-button>
        <el-button type="primary" :loading="authoritySubmitLoading" @click="handleAuthoritySubmit">确 定</el-button>
      </div>
    </el-drawer>

    <!-- 菜单分配抽屉 -->
    <el-drawer title="菜单权限分配" :visible.sync="showMenuDrawer" size="500px" custom-class="custom-drawer">
      <div class="drawer-content">
        <el-input v-model="menuFilterText" placeholder="输入菜单名称进行过滤" size="small" prefix-icon="el-icon-search" style="margin-bottom: 15px;" />
        <el-tree ref="menuTree" :data="menuList" show-checkbox node-key="id" default-expand-all :filter-node-method="filterMenuNode" :default-checked-keys="roleMenuSave.menuIdList" :props="{ children: 'children', label: 'menuName' }" highlight-current @check="onMenuCheck" />
      </div>
      <div class="drawer-footer">
        <el-button @click="showMenuDrawer = false">取 消</el-button>
        <el-button type="primary" :loading="menuLoading" @click="saveRoleMenu">保存分配</el-button>
      </div>
    </el-drawer>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import {
  getRolePage, addRole, getRoleById, modifyRole, removeRole,
  getAuthorityPage, addAuthority, getAuthorityById, modifyAuthority, removeAuthority,
  addRoleMenu, getRoleMenuByRoleId, getMenuList
} from '@/views/accountManagement/api'

export default {
  name: 'RolePermission',
  components: { PageContainer, FilterBar },
  data() {
    return {
      activeTab: 'role',
      enableStatusList: [
        { enableStatus: true, enableStatusName: '启用' },
        { enableStatus: false, enableStatusName: '停用' }
      ],

      // --- 角色管理 ---
      roleLoading: false,
      roleSubmitLoading: false,
      roleSearch: { searchText: '', enabled: undefined },
      rolePage: { total: 0, pageNum: 1, pageCount: 10, list: [] },
      showRoleDrawer: false,
      roleDrawerTitle: '',
      saveRoleForm: { id: '', roleCode: '', roleName: '', enabled: true },
      saveRoleRules: {
        roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },

      // --- 权限管理 ---
      authorityLoading: false,
      authoritySubmitLoading: false,
      authoritySearch: { searchText: '', enabled: undefined },
      authorityPage: { total: 0, pageNum: 1, pageCount: 10, list: [] },
      showAuthorityDrawer: false,
      authorityDrawerTitle: '',
      saveAuthorityForm: { id: '', authorityCode: '', authorityDesc: '', enabled: true },
      saveAuthorityRules: {
        authorityCode: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
        authorityDesc: [{ required: true, message: '请输入权限名称', trigger: 'blur' }]
      },

      // --- 菜单分配 ---
      showMenuDrawer: false,
      menuLoading: false,
      menuList: [],
      menuFilterText: '',
      roleMenuSave: { roleId: '', menuIdList: [] },
      currentRole: {}
    }
  },
  watch: {
    menuFilterText(val) {
      this.$refs.menuTree && this.$refs.menuTree.filter(val)
    }
  },
  methods: {
    onAdd() {
      if (this.activeTab === 'role') this.addRole()
      else this.addAuthority()
    },

    // ==================== 角色管理 ====================
    getRolePage() {
      this.roleLoading = true
      getRolePage({
        pageNum: this.rolePage.pageNum,
        pageCount: this.rolePage.pageCount,
        paging: true,
        enabled: this.roleSearch.enabled === '' ? undefined : this.roleSearch.enabled,
        searchText: this.roleSearch.searchText
      }).then(res => {
        if (res.code === 200) this.rolePage = res.data || { pageNum: 1, pageCount: 10, total: 0, list: [] }
      }).catch(err => this.$message.error('查询失败: ' + err))
        .finally(() => { this.roleLoading = false })
    },
    resetRoleQuery() {
      this.roleSearch = { searchText: '', enabled: undefined }
      this.rolePage.pageNum = 1
      this.getRolePage()
    },
    roleSizeChange(val) { this.rolePage.pageCount = val; this.getRolePage() },
    roleCurrentChange(val) { this.rolePage.pageNum = val; this.getRolePage() },

    addRole() {
      this.saveRoleForm = { id: '', roleCode: '', roleName: '', enabled: true }
      this.roleDrawerTitle = '新增角色'
      this.showRoleDrawer = true
      this.$nextTick(() => { this.$refs.saveRoleRulesRef && this.$refs.saveRoleRulesRef.clearValidate() })
    },
    modifyRole(row) {
      this.saveRoleForm = { id: '', roleCode: '', roleName: '', enabled: true }
      this.roleDrawerTitle = '修改角色'
      this.showRoleDrawer = true
      getRoleById(row.id).then(res => { if (res.code === 200) this.saveRoleForm = res.data })
    },
    handleRoleSubmit() {
      this.$refs.saveRoleRulesRef.validate(valid => {
        if (!valid) return
        this.roleSubmitLoading = true
        const isAdd = this.roleDrawerTitle === '新增角色'
        ;(isAdd ? addRole : modifyRole)(this.saveRoleForm).then(res => {
          if (res.code === 200) {
            this.$message.success(isAdd ? '新增成功' : '修改成功')
            this.showRoleDrawer = false
            this.getRolePage()
          } else this.$message.error(res.message)
        }).catch(err => this.$message.error('操作失败: ' + err))
          .finally(() => { this.roleSubmitLoading = false })
      })
    },
    modifyRoleConfirm(row) {
      modifyRole(row).then(res => {
        if (res.code === 200) this.$message.success('状态更新成功')
        else { row.enabled = !row.enabled; this.$message.error(res.message) }
      }).catch(() => { row.enabled = !row.enabled })
    },
    removeRole(row) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '警告', { type: 'warning' }).then(() => {
        removeRole(row.id).then(res => {
          if (res.code === 200) { this.$message.success('删除成功'); this.getRolePage() }
          else this.$message.error(res.message)
        })
      }).catch(() => {})
    },
    roleDrawerClose(done) { this.saveRoleForm = { id: '', roleCode: '', roleName: '', enabled: true }; done() },

    // ==================== 权限管理 ====================
    getAuthorityPage() {
      this.authorityLoading = true
      getAuthorityPage({
        pageNum: this.authorityPage.pageNum,
        pageCount: this.authorityPage.pageCount,
        paging: true,
        enabled: this.authoritySearch.enabled === '' ? undefined : this.authoritySearch.enabled,
        searchText: this.authoritySearch.searchText
      }).then(res => {
        if (res.code === 200) this.authorityPage = res.data || { pageNum: 1, pageCount: 10, total: 0, list: [] }
      }).catch(err => this.$message.error('查询失败: ' + err))
        .finally(() => { this.authorityLoading = false })
    },
    resetAuthorityQuery() {
      this.authoritySearch = { searchText: '', enabled: undefined }
      this.authorityPage.pageNum = 1
      this.getAuthorityPage()
    },
    authoritySizeChange(val) { this.authorityPage.pageCount = val; this.getAuthorityPage() },
    authorityCurrentChange(val) { this.authorityPage.pageNum = val; this.getAuthorityPage() },

    addAuthority() {
      this.saveAuthorityForm = { id: '', authorityCode: '', authorityDesc: '', enabled: true }
      this.authorityDrawerTitle = '新增权限'
      this.showAuthorityDrawer = true
      this.$nextTick(() => { this.$refs.saveAuthorityRulesRef && this.$refs.saveAuthorityRulesRef.clearValidate() })
    },
    modifyAuthority(row) {
      this.saveAuthorityForm = { id: '', authorityCode: '', authorityDesc: '', enabled: true }
      this.authorityDrawerTitle = '修改权限'
      this.showAuthorityDrawer = true
      getAuthorityById(row.id).then(res => { if (res.code === 200) this.saveAuthorityForm = res.data })
    },
    handleAuthoritySubmit() {
      this.$refs.saveAuthorityRulesRef.validate(valid => {
        if (!valid) return
        this.authoritySubmitLoading = true
        const isAdd = this.authorityDrawerTitle === '新增权限'
        ;(isAdd ? addAuthority : modifyAuthority)(this.saveAuthorityForm).then(res => {
          if (res.code === 200) {
            this.$message.success(isAdd ? '新增成功' : '修改成功')
            this.showAuthorityDrawer = false
            this.getAuthorityPage()
          } else this.$message.error(res.message)
        }).catch(err => this.$message.error('操作失败: ' + err))
          .finally(() => { this.authoritySubmitLoading = false })
      })
    },
    modifyAuthorityConfirm(row) {
      modifyAuthority(row).then(res => {
        if (res.code === 200) this.$message.success('状态更新成功')
        else { row.enabled = !row.enabled; this.$message.error(res.message) }
      }).catch(() => { row.enabled = !row.enabled })
    },
    removeAuthority(row) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '警告', { type: 'warning' }).then(() => {
        removeAuthority(row.id).then(res => {
          if (res.code === 200) { this.$message.success('删除成功'); this.getAuthorityPage() }
          else this.$message.error(res.message)
        })
      }).catch(() => {})
    },

    // ==================== 菜单分配 ====================
    async roleMenuAllocation(role) {
      this.currentRole = role
      this.menuFilterText = ''
      this.showMenuDrawer = true
      if (this.menuList.length === 0) {
        await getMenuList(1).then(res => { if (res.code === 200) this.menuList = res.data || [] })
      }
      this.roleMenuSave = { roleId: role.id, menuIdList: [] }
      getRoleMenuByRoleId(role.id).then(res => {
        if (res.code === 200 && res.data) {
          this.roleMenuSave = { roleId: role.id, menuIdList: res.data.menuIdList || [] }
          this.$nextTick(() => { this.$refs.menuTree && this.$refs.menuTree.setCheckedKeys(this.roleMenuSave.menuIdList) })
        }
      })
    },
    onMenuCheck(_, checkedKeys) {
      this.roleMenuSave.menuIdList = [...checkedKeys.checkedKeys, ...checkedKeys.halfCheckedKeys]
    },
    saveRoleMenu() {
      this.menuLoading = true
      addRoleMenu(this.roleMenuSave).then(res => {
        if (res.code === 200) { this.$message.success('权限保存成功'); this.showMenuDrawer = false }
        else this.$message.error(res.message)
      }).catch(err => this.$message.error('保存失败: ' + err))
        .finally(() => { this.menuLoading = false })
    },
    filterMenuNode(value, data) {
      if (!value) return true
      return data.menuName.indexOf(value) !== -1
    }
  },
  created() {
    this.getRolePage()
    this.getAuthorityPage()
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.role-tabs {
  border-radius: @border-radius;
  overflow: hidden;

  /deep/ .el-tabs__header {
    background-color: @bg-content;
  }

  /deep/ .el-tabs__content {
    padding: 0;
  }
}

.tab-content {
  padding: @space-4 @space-5;
}

.table-card {
  border-radius: @border-radius;
}

.item-name {
  font-weight: 600;
  color: @text-primary;
}

.pagination-container {
  padding: @space-3 @space-5;
  text-align: right;
  border-top: 1px solid @border-color-light;
}

.text-danger {
  color: @error-color;
  &:hover { color: var(--color-error); }
}

/* 抽屉 */
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
  background: @bg-surface;
  position: absolute;
  bottom: 0;
  width: 100%;
}

::v-deep .custom-drawer .el-drawer__body {
  padding: 0;
  display: flex;
  flex-direction: column;
}
</style>
