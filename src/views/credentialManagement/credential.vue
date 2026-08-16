<template>
  <PageContainer title="凭据管理" subtitle="管理 Git、服务器、Docker Registry 等凭据">
    <template #header-actions>
      <el-button type="success" plain icon="el-icon-plus" @click="addDialog">新增凭据</el-button>
    </template>

    <template #filter>
      <FilterBar @search="page" @reset="searchText = ''; page()">
        <el-form-item label="凭据搜索">
          <el-input
              v-model="searchText"
              placeholder="请输入描述关键词"
              prefix-icon="el-icon-search"
              clearable
              style="width: 300px;"
              @keyup.enter.native="page"
          />
        </el-form-item>
      </FilterBar>
    </template>

    <el-empty v-show="credentialList.length <= 0" description="暂无凭据数据，请点击新增"></el-empty>

    <el-row v-show="credentialList.length > 0" :gutter="15">
      <el-col
          v-for="credential in credentialList"
          :key="credential.id"
          :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
      >
        <el-card shadow="hover" class="credential-card">
          <div slot="header" class="card-header">
            <div class="header-left">
              <i class="el-icon-key"></i>
              <span class="cred-type" :title="credential.credentialType">{{ credential.credentialType }}</span>
            </div>
            <div class="header-actions">
              <el-button type="text" icon="el-icon-edit" @click.stop="credentialEdit(credential)">编辑</el-button>
              <el-button type="text" class="text-danger" icon="el-icon-delete" @click.stop="removeCredential(credential.id)">删除</el-button>
            </div>
          </div>

          <div class="card-body">
            <div class="desc-box" v-if="credential.credentialDesc">
              <el-tag size="mini" type="info" effect="plain" style="max-width: 100%; overflow: hidden; text-overflow: ellipsis;">
                {{ credential.credentialDesc }}
              </el-tag>
            </div>

            <div class="info-list">
              <div class="info-item" v-if="credential.config.url">
                <span class="label">URL:</span>
                <span class="value text-truncate" :title="credential.config.url">{{ credential.config.url }}</span>
                <i class="el-icon-document-copy copy-icon" @click="handleCopy(credential.config.url)"></i>
              </div>

              <div class="info-item" v-if="credential.config.credentialName">
                <span class="label">名称:</span>
                <span class="value text-truncate" :title="credential.config.credentialName">{{ credential.config.credentialName }}</span>
                <i class="el-icon-document-copy copy-icon" @click="handleCopy(credential.config.credentialName)"></i>
              </div>

              <div class="info-item" v-if="credential.config.user">
                <span class="label">用户:</span>
                <span class="value text-truncate">{{ credential.config.user }}</span>
                <i class="el-icon-document-copy copy-icon" @click="handleCopy(credential.config.user)"></i>
              </div>

              <div class="info-item" v-if="credential.config.token">
                <span class="label">Token:</span>
                <span class="value">********</span> <i class="el-icon-document-copy copy-icon" @click="handleCopy(credential.config.token)"></i>
              </div>

              <div class="info-item" v-if="credential.config.expiresAt">
                <span class="label">有效期:</span>
                <span class="value">{{ formatTime(credential.config.expiresAt) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="pagination-container" v-show="credentialList.length > 0">
      <el-pagination
          background
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pageNum"
          :page-sizes="pageSizes"
          :page-size="pageCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>

    <el-dialog
        :title="modifyCredentialInfoForm.id ? '修改凭据' : '新增凭据'"
        :close-on-click-modal="false"
        :visible.sync="modifyCredentialDialogVisible"
        width="500px"
        custom-class="cred-dialog"
    >
      <el-form
          class="modifyCredential"
          :model="modifyCredentialInfoForm"
          :rules="modifyCredentialRules"
          ref="modifyCredentialRef"
          label-width="90px"
          size="small"
      >
        <el-form-item label="凭据类型" prop="credentialType">
          <el-select style="width: 100%" v-model="modifyCredentialInfoForm.credentialType" placeholder="请选择类型">
            <el-option
                v-for="item in credentialTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-divider content-position="center">配置详情</el-divider>

        <el-form-item label="URL地址" prop="config.url">
          <el-input v-model="modifyCredentialInfoForm.config.url" placeholder="例如: http://192.168.1.100"></el-input>
        </el-form-item>
        <el-form-item label="凭据名称" prop="config.credentialName">
          <el-input v-model="modifyCredentialInfoForm.config.credentialName" placeholder="输入名称标识"></el-input>
        </el-form-item>
        <el-form-item label="凭据描述" prop="config.credentialDesc">
          <el-input type="textarea" :rows="2" v-model="modifyCredentialInfoForm.config.credentialDesc" placeholder="用途描述"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="config.user">
          <el-input v-model="modifyCredentialInfoForm.config.user" placeholder="Username"></el-input>
        </el-form-item>
        <el-form-item label="Access Token" prop="config.token">
          <el-input v-model="modifyCredentialInfoForm.config.token" show-password placeholder="请输入 Token"></el-input>
        </el-form-item>
        <el-form-item label="有效期" prop="config.expiresAt">
          <el-date-picker
              style="width: 100%"
              v-model="modifyCredentialInfoForm.config.expiresAt"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择有效期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancelCredential">取 消</el-button>
        <el-button size="small" type="primary" @click="modifyCredential">确 定</el-button>
      </div>
    </el-dialog>
  </PageContainer>
</template>

<script>
import {page, create, modify, remove} from "@/views/credentialManagement/api";
import PageContainer from "@/components/common/PageContainer.vue";
import FilterBar from "@/components/common/FilterBar.vue";

export default {
  name: "credential",
  components: {
    PageContainer,
    FilterBar
  },
  data() {
    return {
      //分页参数
      total: 0,
      pageNum: 1,
      pageCount: 12, // 卡片布局每页12个比较整齐
      pageSizes: [12, 24, 48],

      //搜索内容
      searchText: '',

      // 列表数据
      credentialList: [],

      // 表单数据
      modifyCredentialInfoForm: {
        id: '',
        credentialType: '',
        config: {
          user: '',
          url: '',
          token: '',
          credentialName: '',
          credentialDesc: '',
          expiresAt: ''
        },
        credentialDesc: '',
      },

      modifyCredentialDialogVisible: false,

      // 校验规则
      modifyCredentialRules: {
        credentialType: [
          {required: true, message: "请选择凭据类型", trigger: "change"}
        ],
        // 可以根据需要添加 config 内部的校验
        'config.url': [
          {type: 'url', message: '请输入正确的URL格式', trigger: 'blur'}
        ]
      },

      // 凭据类型下拉选项 (需与后端 CredentialType 枚举一致)
      credentialTypeList: [
        {label: 'Gitlab', value: 'gitlab'},
        {label: 'Jenkins', value: 'jenkins'},
      ],
    }
  },
  methods: {
    // 复制功能
    async handleCopy(text) {
      if (!text) return;
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = 0;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.$message.success('已复制到剪贴板');
      } catch (err) {
        this.$message.error('复制失败');
      } finally {
        document.body.removeChild(textarea);
      }
    },

    handleCurrentChange(val) {
      this.pageNum = val;
      this.page();
    },

    handleSizeChange(val) {
      this.pageCount = val;
      this.page();
    },

    // 查询
    page() {
      page({
        pageNum: this.pageNum,
        pageCount: this.pageCount,
        searchText: this.searchText
      }).then(res => {
        if (res.code === 200) {
          const result = res.data;
          this.total = result.total;
          this.credentialList = (result.data || []).map(item => {
            if (item.credentialConfig) {
              try {
                item.config = JSON.parse(item.credentialConfig);
              } catch (e) {
                item.config = {};
              }
            } else {
              item.config = {};
            }
            return item;
          });
        }
      }).catch(err => {
        this.$message.error('查询失败：' + err);
      })
    },

    // 打开新增弹窗
    addDialog() {
      this.modifyCredentialInfoForm = {
        id: '',
        credentialType: '',
        config: {user: '', url: '', token: '', credentialName: '', credentialDesc: '', expiresAt: ''},
        credentialDesc: ''
      };
      this.modifyCredentialDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.modifyCredentialRef && this.$refs.modifyCredentialRef.clearValidate();
      });
    },

    // 打开编辑弹窗
    credentialEdit(credential) {
      this.modifyCredentialInfoForm = {
        id: credential.id,
        credentialType: credential.credentialType,
        credentialDesc: credential.credentialDesc,
        config: credential.config ? JSON.parse(JSON.stringify(credential.config)) : {user: '', url: '', token: '', credentialName: '', credentialDesc: '', expiresAt: ''}
      };
      this.modifyCredentialDialogVisible = true;
    },

    modifyCredential() {
      this.$refs.modifyCredentialRef.validate(valid => {
        if (valid) {
          const form = this.modifyCredentialInfoForm;
          const requestData = {
            id: form.id || null,
            credentialType: form.credentialType,
            credentialDesc: form.credentialDesc,
            credentialConfig: form.config ? JSON.stringify(form.config) : null
          };

          const apiCall = form.id ? modify(requestData) : create(requestData);
          apiCall.then(res => {
            if (res.code === 200) {
              this.$message.success(form.id ? '修改成功' : '新增成功');
              this.modifyCredentialDialogVisible = false;
              this.page();
            }
          }).catch(err => {
            this.$message.error('操作失败：' + err);
          });
        }
      });
    },

    cancelCredential() {
      this.modifyCredentialDialogVisible = false;
    },

    removeCredential(id) {
      this.$confirm('确认删除该凭据吗？', '警告', {type: 'warning'})
          .then(() => {
            remove(id).then(res => {
              if (res.code === 200) {
                this.$message.success('删除成功');
                this.page();
              }
            }).catch(err => {
              this.$message.error('删除失败：' + err);
            });
          }).catch(() => {});
    },

    formatTime(time) {
      if (!time) return '-';
      return time.replace('T', ' ');
    }
  },
  created() {
    this.page();
  }
}
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  /* 关键修改：
     100vh (全屏)
     - 84px (顶部导航栏+TagsView的大致高度)
     - 40px (上下的 padding: 20px * 2)
     - 2px (防止计算误差导致的微小滚动)
  */
  min-height: calc(100vh - 126px);

  /* 防止 el-row 的 gutter 导致横向滚动条 */
  overflow-x: hidden;
}

/* 搜索栏 */
.filter-container {
  margin-bottom: 15px;
  border: none;

  :deep(.el-card__body) {
    padding-bottom: 0;
  }
}

/* 凭据卡片样式 */
.credential-card {
  border: none;
  margin-bottom: 15px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.05);
  }

  /* 头部 */

  :deep(.el-card__header) {
    padding: 12px 15px;
    border-bottom: 1px solid #f6f6f6;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      font-weight: bold;
      color: #303133;

      i {
        margin-right: 6px;
        color: #409EFF;
        font-size: 16px;
      }

      .cred-type {
        font-size: 14px;
        max-width: 120px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  /* 主体 */

  .card-body {
    padding: 15px;
    font-size: 13px;
    height: 180px; /* 固定高度，防止卡片参差不齐 */
    overflow-y: auto;

    .desc-box {
      margin-bottom: 12px;
    }

    .info-list {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        line-height: 1.5;

        .label {
          color: #909399;
          width: 50px; /* 固定宽度对齐 */
          flex-shrink: 0;
        }

        .value {
          color: #606266;
          flex: 1;
          margin-right: 5px;
        }

        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px; /* 限制长度 */
        }

        .copy-icon {
          cursor: pointer;
          color: #409EFF;
          font-size: 14px;

          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }
}

/* 分页 */
.pagination-container {
  background: #fff;
  padding: 10px 20px;
  text-align: right;
  margin-top: 10px;
}

.text-danger {
  color: #F56C6C;

  &:hover {
    color: #f78989;
  }
}
</style>