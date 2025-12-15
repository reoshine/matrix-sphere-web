<template>
  <div class="app-container">
    <div class="page-header-wrapper">
      <div class="page-title">
        <span class="main-title">应用高级配置 & 流水线预览</span>
        <span class="sub-title">配置项目的构建参数、Git 仓库及预览生成的 Jenkins Job XML</span>
      </div>
    </div>

    <el-row :gutter="20" class="content-wrapper">
      <el-col :xs="24" :sm="24" :md="10" :lg="9" :xl="8">
      </el-col>

      <el-col :xs="24" :sm="24" :md="14" :lg="15" :xl="16">
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-wrapper">
      <el-col :xs="24" :sm="24" :md="10" :lg="9" :xl="8">
        <el-card shadow="never" class="config-card">
          <div slot="header" class="clearfix">
            <span class="card-title">基础参数配置</span>
            <el-tag size="small" :type="modifyApplicationForm.enableStatus === '启用' ? 'success' : 'danger'" style="float: right">
              {{ modifyApplicationForm.enableStatus || '未知状态' }}
            </el-tag>
          </div>

          <el-form
              :model="modifyApplicationForm"
              :rules="rules"
              ref="modifyApplicationFormRef"
              label-position="top"
              size="medium"
          >
            <el-form-item prop="applicationCode" label="项目编码">
              <el-input v-model="modifyApplicationForm.applicationCode" placeholder="唯一标识，如 user-service" disabled>
                <template slot="prepend">CODE</template>
              </el-input>
            </el-form-item>

            <el-form-item prop="applicationName" label="项目名称">
              <el-input v-model="modifyApplicationForm.applicationName" placeholder="应用显示名称" />
            </el-form-item>

            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item prop="applicationGroupId" label="所属分组">
                  <el-select v-model="modifyApplicationForm.applicationGroupId" placeholder="请选择" style="width: 100%">
                    <el-option
                        v-for="item in applicationGroupList"
                        :key="item.id"
                        :label="item.applicationGroupName"
                        :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="enableStatus" label="应用状态">
                  <el-select v-model="modifyApplicationForm.enableStatus" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in enableStatusList" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item prop="gitUrl" label="Git 仓库地址">
              <el-input
                  type="textarea"
                  :rows="3"
                  v-model="modifyApplicationForm.gitUrl"
                  placeholder="git@github.com:..."
                  resize="none"
              />
            </el-form-item>
          </el-form>

          <div class="form-actions">
            <el-button @click="cancelForm">返 回</el-button>
            <el-button type="primary" @click="modifyApplication" :loading="loading" icon="el-icon-check">保存配置</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="14" :lg="15" :xl="16">
        <el-card shadow="never" class="code-card" :body-style="{ padding: 0, height: '100%' }">
          <div class="code-toolbar">
            <span class="toolbar-title"><i class="el-icon-s-cooperation"></i> Jenkins Job Config (XML)</span>
            <el-button type="text" icon="el-icon-document-copy" size="small" @click="copyCode">复制配置</el-button>
          </div>

          <div class="code-editor-container">
            <el-empty v-if="!modifyApplicationForm.jobXml" description="暂无流水线配置信息"></el-empty>
            <pre v-else class="hljs-container"><code class="xml" ref="codeBlock">{{ prettyXmlContent }}</code></pre>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import beautify from 'vkbeautify'
import hljs from 'highlight.js'
// 关键修改：使用深色主题 (atom-one-dark) 以符合 IDE 风格
import 'highlight.js/styles/atom-one-dark.css'

import { getApplicationById, modifyApplication } from "@/views/applicationManagement/applicationList/api";
import { queryList } from "@/views/applicationManagement/applicationGroup/api";

export default {
  name: "applicationEdit",
  data() {
    return {
      applicationId: '',
      loading: false,

      // 表单数据
      modifyApplicationForm: {
        id: '', // 确保 ID 存在
        applicationCode: '',
        applicationName: '',
        applicationGroupId: '',
        applicationGroupCode: '',
        gitUrl: '',
        enableStatus: '',
        jobXml: ''
      },

      // 字典数据
      applicationGroupList: [],
      enableStatusList: ['启用', '停用'],

      // 校验规则
      rules: {
        applicationCode: [
          { required: true, message: '请输入项目编码', trigger: 'blur' }
        ],
        applicationName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        applicationGroupId: [
          { required: true, message: '请选择项目分组', trigger: 'change' }
        ],
        gitUrl: [
          { required: true, message: '请输入Git地址', trigger: 'blur' }
        ],
        enableStatus: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },

  computed: {
    // 使用计算属性处理格式化，逻辑更清晰
    prettyXmlContent() {
      if (!this.modifyApplicationForm.jobXml) return '';
      try {
        // vkbeautify 可能会报错，加个 try-catch
        return beautify.xml(this.modifyApplicationForm.jobXml);
      } catch (e) {
        console.warn('XML format error', e);
        return this.modifyApplicationForm.jobXml;
      }
    }
  },

  // 监听 XML 变化以触发高亮
  watch: {
    prettyXmlContent: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            if (this.$refs.codeBlock) {
              // 移除旧的高亮属性，重新高亮
              this.$refs.codeBlock.removeAttribute('data-highlighted');
              hljs.highlightElement(this.$refs.codeBlock);
            }
          });
        }
      },
      immediate: true
    }
  },

  methods: {
    getGroupList() {
      queryList({ searchText: '', enableStatus: '启用' }).then(res => {
        if (res.data.code === 2000) {
          this.applicationGroupList = res.data.body || []
        }
      })
    },

    fetchApplication(id) {
      if (!id) return;
      // 开启全屏 loading 或卡片 loading
      const loadingInstance = this.$loading({ target: '.app-container', lock: true, text: '加载配置中...' });

      getApplicationById(id).then(res => {
        if (res.data.code === 2000) {
          this.modifyApplicationForm = res.data.body;
        }
      }).catch(err => {
        this.$message.error('获取详情失败：' + err);
      }).finally(() => {
        loadingInstance.close();
      });
    },

    modifyApplication() {
      this.$refs.modifyApplicationFormRef.validate((valid) => {
        if (valid) {
          this.loading = true;
          modifyApplication({ ...this.modifyApplicationForm }).then(res => {
            if (res.data.code === 2000) {
              this.$message.success('配置保存成功');
              // 保存后不需要刷新整个页面，只需要刷新数据或返回
              // location.reload(); // 不建议直接 reload
              this.cancelForm();
            } else {
              this.$message.error(res.data.message || '保存失败');
            }
          }).catch(err => {
            this.$message.error('系统异常：' + err);
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },

    cancelForm() {
      this.$router.back();
    },

    copyCode() {
      if (!this.prettyXmlContent) return;
      const input = document.createElement('textarea');
      input.value = this.prettyXmlContent;
      document.body.appendChild(input);
      input.select();
      document.execCommand('Copy');
      document.body.removeChild(input);
      this.$message.success('XML 配置已复制到剪贴板');
    }
  },

  created () {
    this.getGroupList();

    // 优先使用 vue-router 参数，其次 localStorage (保持原有兼容逻辑)
    let pid = this.$route.params.applicationId || this.$route.query.applicationId;

    if (!pid && localStorage.getItem('applicationId')) {
      try {
        pid = JSON.parse(localStorage.getItem('applicationId'));
      } catch(e) {}
    }

    if (pid) {
      this.applicationId = pid;
      // 更新 localStorage
      localStorage.setItem('applicationId', JSON.stringify(pid));
      this.fetchApplication(pid);
    } else {
      this.$message.warning('参数丢失，无法加载项目信息');
    }
  },

  destroyed () {
    // 建议: 离开页面时是否清除 localStorage 取决于业务，
    // 如果用户刷新页面需要保持状态，则不应该清除。
    // localStorage.removeItem('applicationId')
  }
}
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

/* 修改 css (less) */
.page-header-wrapper {
  background: #fff;
  padding: 20px 24px; /* 增加一点高度，显得更从容 */
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 5px solid #409EFF; /* 左侧加一道蓝线，强调这是“MatrixSphere”风格的标题 */
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
}

.page-title {
  display: flex;
  flex-direction: column; /* 上下排列主副标题 */

  .main-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }

  .sub-title {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
  }
}

.content-wrapper {
  flex: 1; /* 撑满剩余高度 */
}

/* 左侧配置卡片 */
.config-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  .card-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }

  .form-actions {
    margin-top: 30px;
    text-align: right;
    border-top: 1px solid #ebeef5;
    padding-top: 20px;
  }
}

/* 右侧代码卡片 */
.code-card {
  height: calc(100vh - 180px); /* 固定高度，让内部滚动 */
  min-height: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;

  .code-toolbar {
    background-color: #282c34; /* 与 atom-one-dark 一致 */
    padding: 10px 15px;
    border-bottom: 1px solid #3e4451;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-title {
      color: #abb2bf;
      font-family: monospace;
      font-size: 14px;
      font-weight: 600;
    }

    .el-button--text {
      color: #61afef;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .code-editor-container {
    flex: 1;
    background-color: #282c34; /* 深色背景 */
    overflow: auto; /* 内部滚动 */
    position: relative;

    .hljs-container {
      margin: 0;
      padding: 15px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.5;

      code {
        background: transparent !important; /* 移除 hljs 默认背景，使用容器背景 */
        padding: 0;
      }
    }
  }
}
</style>