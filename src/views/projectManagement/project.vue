<!--<template>-->
<!--  <div class="app-container">-->
<!--    <el-card class="filter-container" shadow="never">-->
<!--      <el-form :inline="true" size="small" @submit.native.prevent>-->
<!--        <el-form-item label="应用搜索">-->
<!--          <el-input-->
<!--              v-model="searchText"-->
<!--              placeholder="输入应用编码/名称"-->
<!--              prefix-icon="el-icon-search"-->
<!--              clearable-->
<!--              style="width: 260px;"-->
<!--              @keyup.enter.native="getProjectPage"-->
<!--          />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="启用状态">-->
<!--          <el-select v-model="enabled" placeholder="全部" clearable style="width: 120px;" @change="getProjectPage">-->
<!--            <el-option-->
<!--                v-for="item in enableStatusList"-->
<!--                :key="item.enableStatus"-->
<!--                :label="item.enableStatusName"-->
<!--                :value="item.enableStatus">-->
<!--            </el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" icon="el-icon-search" @click="getProjectPage">查询</el-button>-->
<!--          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </el-card>-->

<!--    <div class="action-bar">-->
<!--      <el-button type="primary" icon="el-icon-plus" size="small" @click="addProject">新增应用</el-button>-->
<!--    </div>-->

<!--    <el-card shadow="never" class="table-card" :body-style="{ padding: '0' }">-->
<!--      <el-table-->
<!--          v-loading="loading"-->
<!--          :data="projectPage.data"-->
<!--          border-->
<!--          stripe-->
<!--          highlight-current-row-->
<!--          style="width: 100%"-->
<!--      >-->
<!--        <el-table-column type="index" label="序号" width="60" align="center" />-->

<!--        <el-table-column prop="projectCode" label="应用编码" min-width="120" show-overflow-tooltip>-->
<!--          <template slot-scope="scope">-->
<!--            <el-tag size="small" effect="plain" type="primary">{{ scope.row.projectCode }}</el-tag>-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        <el-table-column prop="projectName" label="应用名称" min-width="150" show-overflow-tooltip>-->
<!--          <template slot-scope="scope">-->
<!--            <span style="font-weight: 600; color: #303133">{{ scope.row.projectName }}</span>-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        <el-table-column prop="enabled" label="状态" width="100" align="center">-->
<!--          <template slot-scope="scope">-->
<!--            <el-switch-->
<!--                v-model="scope.row.enabled"-->
<!--                active-color="#13ce66"-->
<!--                inactive-color="#ff4949"-->
<!--                @change="handleStatusChange(scope.row)"-->
<!--            />-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        <el-table-column prop="createByName" label="创建人" width="120" align="center" />-->
<!--        <el-table-column prop="gmtCreate" label="创建时间" width="160" align="center" />-->

<!--        <el-table-column label="操作" width="200" fixed="right" align="center">-->
<!--          <template slot-scope="scope">-->
<!--            <el-button type="text" icon="el-icon-edit" @click="modifyProject(scope.row)">详情/编辑</el-button>-->
<!--            <el-button type="text" class="text-danger" icon="el-icon-delete" @click="removeProject(scope.row)">删除</el-button>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--      </el-table>-->

<!--      <div class="pagination-container" v-if="projectPage.total > 0">-->
<!--        <el-pagination-->
<!--            background-->
<!--            @size-change="handleSizeChange"-->
<!--            @current-change="handleCurrentChange"-->
<!--            :current-page="projectPage.pageNum"-->
<!--            :page-sizes="[10, 20, 50, 100]"-->
<!--            :page-size="projectPage.pageCount"-->
<!--            layout="total, sizes, prev, pager, next, jumper"-->
<!--            :total="projectPage.total">-->
<!--        </el-pagination>-->
<!--      </div>-->
<!--    </el-card>-->

<!--    <el-drawer-->
<!--        :title="drawerTitle"-->
<!--        :visible.sync="showDrawer"-->
<!--        :before-close="handleDrawerClose"-->
<!--        size="600px"-->
<!--        custom-class="custom-drawer"-->
<!--        :wrapperClosable="false"-->
<!--    >-->
<!--      <div class="drawer-content">-->
<!--        <el-form-->
<!--            :model="saveProjectForm"-->
<!--            :rules="saveProjectRules"-->
<!--            ref="saveProjectRulesRef"-->
<!--            label-width="110px"-->
<!--            label-position="right"-->
<!--            size="small"-->
<!--        >-->
<!--          <el-divider content-position="left">基础信息</el-divider>-->
<!--          <el-row :gutter="20">-->
<!--            <el-col :span="12">-->
<!--              <el-form-item label="应用编码" prop="projectCode">-->
<!--                <el-input v-model="saveProjectForm.projectCode" placeholder="唯一标识" />-->
<!--              </el-form-item>-->
<!--            </el-col>-->
<!--            <el-col :span="12">-->
<!--              <el-form-item label="应用名称" prop="projectName">-->
<!--                <el-input v-model="saveProjectForm.projectName" placeholder="显示名称" />-->
<!--              </el-form-item>-->
<!--            </el-col>-->
<!--            <el-col :span="12">-->
<!--              <el-form-item label="启用状态" prop="enabled">-->
<!--                <el-select v-model="saveProjectForm.enabled" placeholder="请选择" style="width: 100%">-->
<!--                  <el-option-->
<!--                      v-for="item in enableStatusList"-->
<!--                      :key="item.enableStatus"-->
<!--                      :label="item.enableStatusName"-->
<!--                      :value="item.enableStatus">-->
<!--                  </el-option>-->
<!--                </el-select>-->
<!--              </el-form-item>-->
<!--            </el-col>-->
<!--          </el-row>-->

<!--          <el-divider content-position="left">高级配置</el-divider>-->
<!--          <el-row :gutter="20">-->
<!--            <el-col :span="24">-->
<!--              <el-form-item label="成功回调地址" prop="successRedirectUri">-->
<!--                <el-input v-model="saveProjectForm.successRedirectUri" placeholder="http://..." />-->
<!--              </el-form-item>-->
<!--            </el-col>-->
<!--            <el-col :span="24">-->
<!--              <el-form-item label="授权回调地址" prop="grantRedirectUrl">-->
<!--                <el-input v-model="saveProjectForm.grantRedirectUrl" placeholder="http://..." />-->
<!--              </el-form-item>-->
<!--            </el-col>-->
<!--            <el-col :span="24">-->
<!--              <el-form-item label="图标地址" prop="projectIcon">-->
<!--                <el-input v-model="saveProjectForm.projectIcon" placeholder="图片 URL">-->
<!--                  <template slot="prepend"><i class="el-icon-picture"></i></template>-->
<!--                </el-input>-->
<!--              </el-form-item>-->
<!--            </el-col>-->
<!--          </el-row>-->
<!--        </el-form>-->
<!--      </div>-->
<!--      <div class="drawer-footer">-->
<!--        <el-button @click="cancelForm">取 消</el-button>-->
<!--        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>-->
<!--      </div>-->
<!--    </el-drawer>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import {-->
<!--  getProjectById,-->
<!--  getProjectPage,-->
<!--  modifyProject,-->
<!--  removeProject,-->
<!--  saveProject,-->
<!--} from "@/views/applicationManagement/api";-->

<!--export default {-->
<!--  name: "ProjectManagement",-->
<!--  data() {-->
<!--    return {-->
<!--      // 页面状态-->
<!--      loading: false,-->
<!--      submitLoading: false,-->

<!--      // 搜索参数-->
<!--      searchText: '',-->
<!--      enabled: undefined, // 默认为 undefined 查全部-->
<!--      enableStatusList: [-->
<!--        { enableStatus: true, enableStatusName: '启用' },-->
<!--        { enableStatus: false, enableStatusName: '停用' }-->
<!--      ],-->

<!--      // 表格数据-->
<!--      projectPage: {-->
<!--        total: 0,-->
<!--        pageNum: 1,-->
<!--        pageCount: 10,-->
<!--        data: []-->
<!--      },-->

<!--      // 抽屉控制-->
<!--      showDrawer: false,-->
<!--      drawerTitle: '',-->

<!--      // 表单数据-->
<!--      saveProjectForm: {-->
<!--        id: undefined,-->
<!--        projectCode: '',-->
<!--        projectName: '',-->
<!--        successRedirectUri: '',-->
<!--        grantRedirectUrl: '',-->
<!--        projectIcon: '',-->
<!--        enabled: true,-->
<!--      },-->

<!--      // 校验规则-->
<!--      saveProjectRules: {-->
<!--        projectCode: [-->
<!--          { required: true, message: "请输入应用编码", trigger: "blur" },-->
<!--          { min: 3, max: 30, message: "长度在3到30个字符", trigger: "blur" },-->
<!--        ],-->
<!--        projectName: [-->
<!--          { required: true, message: "请输入应用名称", trigger: "blur" },-->
<!--          { min: 2, max: 50, message: "长度在2到50个字符", trigger: "blur" },-->
<!--        ]-->
<!--      },-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    // -&#45;&#45; 查询 -&#45;&#45;-->
<!--    getProjectPage() {-->
<!--      this.loading = true;-->
<!--      const params = {-->
<!--        pageNum: this.projectPage.pageNum,-->
<!--        pageCount: this.projectPage.pageCount,-->
<!--        paging: true,-->
<!--        enabled: this.enabled === '' ? undefined : this.enabled,-->
<!--        searchText: this.searchText-->
<!--      };-->

<!--      getProjectPage(params).then(res => {-->
<!--        if (res.data.code === 2000) {-->
<!--          this.projectPage = res.data.body || { total: 0, data: [] };-->
<!--        }-->
<!--      }).catch(err => {-->
<!--        this.$message.error('查询失败: ' + err);-->
<!--      }).finally(() => {-->
<!--        this.loading = false;-->
<!--      });-->
<!--    },-->

<!--    resetQuery() {-->
<!--      this.searchText = '';-->
<!--      this.enabled = undefined;-->
<!--      this.projectPage.pageNum = 1;-->
<!--      this.getProjectPage();-->
<!--    },-->

<!--    // -&#45;&#45; 增/改 -&#45;&#45;-->
<!--    addProject() {-->
<!--      this.resetForm();-->
<!--      this.drawerTitle = '新增应用';-->
<!--      this.showDrawer = true;-->
<!--    },-->

<!--    modifyProject(project) {-->
<!--      this.resetForm();-->
<!--      this.drawerTitle = '修改应用';-->
<!--      this.showDrawer = true;-->

<!--      getProjectById(project.id).then(res => {-->
<!--        if (res.data.code === 2000) {-->
<!--          this.saveProjectForm = res.data.body;-->
<!--        }-->
<!--      });-->
<!--    },-->

<!--    // 统一提交逻辑-->
<!--    handleSubmit() {-->
<!--      this.$refs.saveProjectRulesRef.validate((valid) => {-->
<!--        if (valid) {-->
<!--          this.submitLoading = true;-->
<!--          const isAdd = this.drawerTitle === '新增应用';-->
<!--          const api = isAdd ? saveProject : modifyProject; // 注意：原API新增叫 saveProject-->

<!--          api(this.saveProjectForm).then(res => {-->
<!--            if (res.data.code === 2000) {-->
<!--              this.$message.success(isAdd ? '新增成功' : '修改成功');-->
<!--              this.showDrawer = false;-->
<!--              this.getProjectPage();-->
<!--            } else {-->
<!--              this.$message.error(res.data.message);-->
<!--            }-->
<!--          }).catch(err => {-->
<!--            this.$message.error('操作失败: ' + err);-->
<!--          }).finally(() => {-->
<!--            this.submitLoading = false;-->
<!--          });-->
<!--        }-->
<!--      });-->
<!--    },-->

<!--    // 列表状态切换-->
<!--    handleStatusChange(row) {-->
<!--      modifyProject(row).then(res => {-->
<!--        if (res.data.code === 2000) {-->
<!--          this.$message.success('状态已更新');-->
<!--        } else {-->
<!--          row.enabled = !row.enabled; // 回滚-->
<!--          this.$message.error(res.data.message);-->
<!--        }-->
<!--      }).catch(() => {-->
<!--        row.enabled = !row.enabled; // 回滚-->
<!--      });-->
<!--    },-->

<!--    // -&#45;&#45; 删 -&#45;&#45;-->
<!--    removeProject(project) {-->
<!--      this.$confirm('此操作将永久删除该应用, 是否继续?', '警告', {-->
<!--        confirmButtonText: '确定',-->
<!--        cancelButtonText: '取消',-->
<!--        type: 'warning'-->
<!--      }).then(() => {-->
<!--        removeProject(project.id).then(res => {-->
<!--          if (res.data.code === 2000) {-->
<!--            this.$message.success('删除成功');-->
<!--            this.getProjectPage();-->
<!--          } else {-->
<!--            this.$message.error(res.data.message);-->
<!--          }-->
<!--        });-->
<!--      }).catch(() => {});-->
<!--    },-->

<!--    // -&#45;&#45; 辅助 -&#45;&#45;-->
<!--    handleSizeChange(val) {-->
<!--      this.projectPage.pageCount = val;-->
<!--      this.getProjectPage();-->
<!--    },-->
<!--    handleCurrentChange(val) {-->
<!--      this.projectPage.pageNum = val;-->
<!--      this.getProjectPage();-->
<!--    },-->
<!--    handleDrawerClose(done) {-->
<!--      this.resetForm();-->
<!--      done();-->
<!--    },-->
<!--    cancelForm() {-->
<!--      this.showDrawer = false;-->
<!--      this.resetForm();-->
<!--    },-->
<!--    resetForm() {-->
<!--      this.saveProjectForm = {-->
<!--        id: undefined,-->
<!--        applicationCode: '',-->
<!--        applicationName: '',-->
<!--        enabled: true-->
<!--      };-->
<!--      this.$nextTick(() => {-->
<!--        if (this.$refs.saveProjectRulesRef) this.$refs.saveProjectRulesRef.clearValidate();-->
<!--      });-->
<!--    }-->
<!--  },-->
<!--  created() {-->
<!--    this.getProjectPage();-->
<!--  }-->
<!--}-->
<!--</script>-->

<!--<style lang="less" scoped>-->
<!--.app-container {-->
<!--  padding: 20px;-->
<!--  background-color: #f0f2f5;-->
<!--  /* 关键：减去140px防止双滚动条 */-->
<!--  min-height: calc(100vh - 140px);-->
<!--}-->

<!--/* 搜索区 */-->
<!--.filter-container {-->
<!--  margin-bottom: 15px;-->
<!--  border: none;-->
<!--  :deep(.el-card__body) {-->
<!--    padding-bottom: 0;-->
<!--  }-->
<!--}-->

<!--/* 操作区 */-->
<!--.action-bar {-->
<!--  margin-bottom: 15px;-->
<!--}-->

<!--/* 表格区 */-->
<!--.table-card {-->
<!--  border: none;-->
<!--}-->

<!--.pagination-container {-->
<!--  background: #fff;-->
<!--  padding: 10px 20px;-->
<!--  text-align: right;-->
<!--  border-top: 1px solid #ebeef5;-->
<!--}-->

<!--.text-danger {-->
<!--  color: #F56C6C;-->
<!--  &:hover { color: #f78989; }-->
<!--}-->

<!--/* 抽屉布局 */-->
<!--.drawer-content {-->
<!--  padding: 20px;-->
<!--  height: calc(100% - 60px);-->
<!--  overflow-y: auto;-->
<!--}-->

<!--.drawer-footer {-->
<!--  height: 60px;-->
<!--  line-height: 60px;-->
<!--  border-top: 1px solid #e8e8e8;-->
<!--  text-align: right;-->
<!--  padding-right: 20px;-->
<!--  background: #fff;-->
<!--  position: absolute;-->
<!--  bottom: 0;-->
<!--  width: 100%;-->
<!--}-->

<!--::v-deep .custom-drawer .el-drawer__body {-->
<!--  padding: 0;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--}-->
<!--</style>-->