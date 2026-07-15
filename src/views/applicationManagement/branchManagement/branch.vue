<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" size="small" @submit.native.prevent>
        <el-form-item label="应用搜索">
          <el-input
              v-model="searchText"
              placeholder="输入应用编码/名称"
              prefix-icon="el-icon-search"
              clearable
              style="width: 300px;"
              @keyup.enter.native="queryApplicationByParam"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="queryApplicationByParam">切换应用</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="info-card" shadow="hover" v-if="applicationInfo.id">
      <div slot="header" class="clearfix">
        <span class="card-title"><i class="el-icon-s-platform"></i> 当前应用信息</span>
      </div>
      <el-descriptions :column="4" border size="medium">
        <el-descriptions-item label="应用编码">
          <el-tag size="small" effect="plain">{{ applicationInfo.applicationCode || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应用名称">
          {{ applicationInfo.applicationName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="所属分组">
          <el-tag type="info" size="small">{{ getApplicationGroupCode(applicationInfo.applicationGroupId) || '-' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Git 仓库">
          <el-link type="primary" :href="applicationInfo.gitUrl" target="_blank" :underline="false">
            <i class="el-icon-link"></i> 查看仓库
          </el-link>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="action-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title"><i class="el-icon-circle-plus-outline"></i> 创建新分支</span>
          </div>
          <el-form
              :model="branchInfo"
              :rules="createBranchRules"
              ref="createBranchRef"
              label-position="top"
              size="medium"
          >
            <el-form-item label="分支名称" prop="branchName">
              <el-input
                  v-model="branchInfo.branchName"
                  placeholder="请输入名称"
                  maxlength="30"
                  show-word-limit
              >
                <template slot="prepend">feature_</template>
              </el-input>
              <div class="form-tip">默认前缀：feature_</div>
            </el-form-item>

            <el-form-item label="分支描述" prop="description">
              <el-input
                  type="textarea"
                  :rows="3"
                  v-model="branchInfo.description"
                  placeholder="例如：开发 v1.2.0 用户模块"
                  maxlength="50"
                  show-word-limit
              />
            </el-form-item>

            <el-form-item style="text-align: right; margin-bottom: 0;">
              <el-button icon="el-icon-refresh-left" @click="resetCreateForm">重置</el-button>
              <el-button type="primary" icon="el-icon-plus" @click="createBranch" :loading="loading">立即创建</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="table-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="card-title"><i class="el-icon-s-network"></i> 分支列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-refresh" @click="refreshList">刷新</el-button>
          </div>

          <el-empty v-if="branchList.length <= 0" description="暂无分支信息，请先创建"></el-empty>

          <el-table v-else :data="branchList" border stripe style="width: 100%">
            <el-table-column prop="branchName" label="分支名称" min-width="180">
              <template slot-scope="scope">
                <span style="font-weight: 600; color: #303133">{{ scope.row.branchName }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />

            <el-table-column label="属性状态" width="160">
              <template slot-scope="scope">
                <el-tag size="mini" :type="scope.row.canPush ? 'success' : 'info'" effect="dark">
                  {{ scope.row.canPush ? '可推送' : '不可推送' }}
                </el-tag>
                <el-tag size="mini" :type="scope.row.isProtected ? 'danger' : 'info'" style="margin-left: 5px;">
                  <i v-if="scope.row.isProtected" class="el-icon-lock"></i>
                  {{ scope.row.isProtected ? '保护' : '普通' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="createByName" label="创建人" width="100" align="center" />

            <el-table-column label="操作" width="150" fixed="right" align="center">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-edit" @click="editBranchInfo(scope.row)">编辑</el-button>
                <el-button type="text" class="text-danger" icon="el-icon-delete" @click="deleteConfirm(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
        title="修改分支配置"
        :visible.sync="modifyBranchDialogVisible"
        width="500px"
        :close-on-click-modal="false"
        append-to-body
    >
      <el-form
          :model="editBranchForm"
          :rules="modifyBranchRules"
          ref="modifyBranchRef"
          label-width="100px"
          size="small"
      >
        <el-form-item label="分支名称">
          <el-input v-model="editBranchForm.branchName" disabled prefix-icon="el-icon-connection" />
        </el-form-item>
        <el-form-item label="分支描述" prop="description">
          <el-input v-model="editBranchForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="可推送" prop="canPush">
              <el-switch v-model="editBranchForm.canPush" active-text="是" inactive-text="否" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保护分支" prop="isProtected">
              <el-switch v-model="editBranchForm.isProtected" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancelModifyBranch">取 消</el-button>
        <el-button size="small" type="primary" @click="modifyBranch">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  createBranch,
  modifyBranch,
  getUnDeployedBranchList,
  removeBranch,
  getApplicationById
} from '@/views/applicationManagement/applicationList/api';
import { queryList } from '@/views/applicationManagement/applicationGroup/api';

export default {
  name: 'branch',
  data() {
    return {
      loading: false,
      modifyLoading: false, // 新增修改Loading
      searchText: '',
      applicationId: '',

      applicationInfo: {},
      branchList: [],
      applicationGroupList: [],

      branchInfo: {
        branchName: '',
        description: ''
      },

      modifyBranchDialogVisible: false,
      editBranchForm: {},

      // 删除未使用的 List 变量

      createBranchRules: {
        branchName: [
          {required: true, message: "请输入分支名称", trigger: "blur"},
          {pattern: /^[a-zA-Z0-9_-]+$/, message: '只能包含字母、数字、下划线或横线', trigger: 'blur'}
        ],
        description: [
          {required: true, message: "请输入分支描述", trigger: "blur"}
        ]
      },
      modifyBranchRules: {
        description: [
          {required: true, message: "请输入分支描述", trigger: "blur"}
        ]
      },
    };
  },

  methods: {
    // 查询应用
    queryApplicationByParam() {
      if (!this.searchText) {
        this.$message.warning('请输入查询条件');
        return;
      }
      const loading = this.$loading({target: '.app-container'});
      getApplicationById({searchText: this.searchText}).then(res => {
        if (res.code === 200) {
          this.applicationInfo = res.data;
          if (this.applicationInfo.id) {
            this.applicationId = this.applicationInfo.id;
            localStorage.setItem('applicationId', JSON.stringify(this.applicationId));
            this.getBranchListByApplicationId(this.applicationId);
          }
        } else {
          this.$message.error(res.message || '查询应用失败');
        }
      }).finally(() => loading.close());
    },

    getApplication(applicationId) {
      getApplicationById(applicationId).then(res => {
        if (res.code === 200) {
          this.applicationInfo = res.data;
          this.searchText = this.applicationInfo.applicationCode;
        }
      });
    },

    getBranchListByApplicationId(applicationId) {
      getUnDeployedBranchList({applicationId: applicationId}).then(res => {
        if (res.code === 200) {
          this.branchList = res.data || [];
        }
      });
    },

    refreshList() {
      if (this.applicationId) {
        this.getBranchListByApplicationId(this.applicationId);
      }
    },

    createBranch() {
      this.$refs.createBranchRef.validate((valid) => {
        if (valid) {
          this.loading = true;
          createBranch({
            applicationId: this.applicationInfo.id,
            branchName: 'feature_' + this.branchInfo.branchName,
            description: this.branchInfo.description,
            sourceBranch: 'main',
            branchType: '1'
          }).then(res => {
            if (res.code === 200) {
              this.$message.success('创建分支成功');
              this.resetCreateForm();
              this.refreshList();
            } else {
              this.$message.error(res.message || '创建失败');
            }
          }).catch(err => {
            this.$message.error('创建异常: ' + err);
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },

    resetCreateForm() {
      this.branchInfo = {branchName: '', description: ''};
      this.$nextTick(() => {
        this.$refs.createBranchRef.clearValidate();
      });
    },

    editBranchInfo(branch) {
      this.editBranchForm = JSON.parse(JSON.stringify(branch));
      this.modifyBranchDialogVisible = true;
      // 修复：打开弹窗时清除上次的校验状态
      this.$nextTick(() => {
        if (this.$refs.modifyBranchRef) {
          this.$refs.modifyBranchRef.clearValidate();
        }
      });
    },

    cancelModifyBranch() {
      this.modifyBranchDialogVisible = false;
      this.editBranchForm = {};
    },

    modifyBranch() {
      this.$refs.modifyBranchRef.validate((valid) => {
        if (valid) {
          this.modifyLoading = true;
          modifyBranch({
            id: this.editBranchForm.id, // 修复：必须传 ID
            applicationId: this.editBranchForm.applicationId, // 建议使用 row 里的 appId
            branchName: this.editBranchForm.branchName,
            description: this.editBranchForm.description,
            isProtected: this.editBranchForm.isProtected
          }).then(res => {
            if (res.code === 200) {
              this.$message.success('修改成功');
              this.modifyBranchDialogVisible = false;
              this.refreshList();
            } else {
              this.$message.error(res.message);
            }
          }).finally(() => {
            this.modifyLoading = false;
          });
        }
      });
    },

    // 删除分支
    deleteConfirm(branch) {
      this.$confirm(`确认删除分支 ${branch.branchName} 吗? 此操作不可恢复。`, '警告', {
        type: 'warning',
        confirmButtonText: '确认删除',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        return removeBranch(branch.id);
      }).then(res => {
        if (res.code === 200) {
          this.$message.success('删除成功');
          this.refreshList();
        } else {
          this.$message.error(res.message);
        }
      }).catch(() => {
      });
    },

    getGroupList() {
      queryList({searchText: '', enableStatus: '启用'}).then(res => {
        if (res.code === 200) {
          this.applicationGroupList = res.data || [];
        }
      });
    },

    getApplicationGroupCode(id) {
      const obj = this.applicationGroupList.find(item => item.id === id);
      return obj ? obj.applicationGroupCode : '-';
    }
  },

  created() {
    this.getGroupList();
    let pid = this.$route.params.applicationId;

    // 安全解析 localStorage
    if (!pid) {
      const cachedId = localStorage.getItem('applicationId');
      if (cachedId) {
        try {
          pid = JSON.parse(cachedId);
        } catch (e) {
          console.error('Failed to parse applicationId', e);
        }
      }
    }

    if (pid) {
      this.applicationId = pid;
      localStorage.setItem('applicationId', JSON.stringify(pid));
      this.getApplication(pid);
      this.getBranchListByApplicationId(pid);
    }
  }
}
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 230px);
}

/* 通用卡片标题 */
.card-title {
  font-size: 15px;
  font-weight: bold;
  color: #303133;
}

.filter-container {
  margin-bottom: 15px;
  border: none;
  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

.info-card {
  margin-bottom: 20px;
  border: none;
}

.action-card, .table-card {
  height: 100%;
  border: none;
  /* 确保左右两栏看起来等高 */
  min-height: 400px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1;
}

.text-danger {
  color: #F56C6C;
  &:hover {
    color: #f78989;
  }
}
</style>