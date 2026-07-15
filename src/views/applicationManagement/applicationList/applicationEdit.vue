<template>
  <div class="app-container">
    <div class="page-header-wrapper">
      <div class="page-title">
        <span class="main-title">应用高级配置 & 流水线预览</span>
        <span class="sub-title">配置项目的构建参数、Git 仓库及预览生成的 Jenkins Job XML</span>
      </div>
    </div>

    <el-row :gutter="20" class="content-wrapper">

      <el-col :xs="24" :sm="24" :md="10" :lg="9" :xl="8" class="full-height-col">
        <el-card shadow="never" class="config-card">
          <div slot="header" class="clearfix card-header-content">
            <span class="card-title">基础参数配置</span>
            <el-tag size="small" :type="modifyApplicationForm.enableStatus === '启用' ? 'success' : 'danger'">
              {{ modifyApplicationForm.enableStatus || '未知状态' }}
            </el-tag>
          </div>

          <div class="card-body-flex">
            <div class="scrollable-form-area custom-scrollbar">
              <el-form
                  :model="modifyApplicationForm"
                  :rules="rules"
                  ref="modifyApplicationFormRef"
                  label-position="top"
                  size="medium"
                  class="config-form"
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

                <el-form-item prop="initTemplateId" label="初始化模板">
                  <el-select v-model="modifyApplicationForm.initTemplateId" placeholder="请选择初始化模板" style="width: 100%">
                    <el-option
                        v-for="item in templateList"
                        :key="item.id"
                        :label="item.templateName"
                        :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>

              </el-form>
            </div>

            <div class="form-actions-footer">
              <el-button @click="cancelForm">返 回</el-button>
              <el-button type="primary" @click="modifyApplication" :loading="loading" icon="el-icon-check">保存配置</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="14" :lg="15" :xl="16" class="full-height-col">
        <el-card shadow="never" class="code-card" :body-style="{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }">
          <div class="code-toolbar">
            <span class="toolbar-title"><i class="el-icon-s-cooperation"></i> Jenkins Pipeline (Groovy)</span>
            <el-button type="text" icon="el-icon-document-copy" size="small" @click="copyCode">复制配置</el-button>
          </div>

          <div class="code-editor-container custom-scrollbar">
            <el-empty v-if="!modifyApplicationForm.pipelineScript" description="暂无流水线配置信息"></el-empty>
            <pre v-else class="hljs-container"><code class="groovy" ref="codeBlock">{{ modifyApplicationForm.pipelineScript }}</code></pre>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

// 请根据您项目的实际 api 路径修改以下引用
import { getApplicationById, modifyApplication } from "@/views/applicationManagement/applicationList/api";
import { queryList } from "@/views/applicationManagement/applicationGroup/api";
import { queryList as queryTemplateList } from "@/views/applicationManagement/deployTemplate/api";

export default {
  name: "applicationEdit",
  data() {
    return {
      applicationId: '',
      loading: false,

      // 表单数据
      modifyApplicationForm: {
        id: '',
        applicationCode: '',
        applicationName: '',
        applicationGroupId: '',
        applicationGroupCode: '',
        gitUrl: '',
        enableStatus: '',
        jobXml: '',
        pipelineScript: '',
        initTemplateId: ''
      },

      // 字典数据
      applicationGroupList: [],
      templateList: [],
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
        ],
        initTemplateId: [
          { required: true, message: '请选择初始化模板', trigger: 'change' }
        ]
      }
    }
  },

  watch: {
    'modifyApplicationForm.pipelineScript': {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            if (this.$refs.codeBlock) {
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
        if (res.code === 200) {
          this.applicationGroupList = res.data || []
        }
      })
    },

    getTemplateList() {
      queryTemplateList({ searchText: '', enableStatus: '启用' }).then(res => {
        if (res.code === 200) {
          this.templateList = res.data || []
        }
      })
    },

    fetchApplication(id) {
      if (!id) return;
      const loadingInstance = this.$loading({ target: '.app-container', lock: true, text: '加载配置中...' });

      getApplicationById(id).then(res => {
        if (res.code === 200) {
          this.modifyApplicationForm = res.data;
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
            if (res.code === 200) {
              this.$message.success('配置保存成功');
              this.cancelForm();
            } else {
              this.$message.error(res.message || '保存失败');
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
      if (!this.modifyApplicationForm.pipelineScript) return;
      const input = document.createElement('textarea');
      input.value = this.modifyApplicationForm.pipelineScript;
      document.body.appendChild(input);
      input.select();
      document.execCommand('Copy');
      document.body.removeChild(input);
      this.$message.success('Pipeline 配置已复制到剪贴板');
    }
  },

  created () {
    this.getGroupList();
    this.getTemplateList();
    let pid = this.$route.params.applicationId || this.$route.query.applicationId;
    if (!pid && localStorage.getItem('applicationId')) {
      try {
        pid = JSON.parse(localStorage.getItem('applicationId'));
      } catch(e) {}
    }

    if (pid) {
      this.applicationId = pid;
      localStorage.setItem('applicationId', JSON.stringify(pid));
      this.fetchApplication(pid);
    } else {
      this.$message.warning('参数丢失，无法加载项目信息');
    }
  }
}
</script>

<style lang="less" scoped>
/* 定义滚动条样式 Mixin */
.custom-scrollbar() {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  /* 关键点1：固定整个容器高度，减去 Top Navbar 的高度 */
  height: calc(100vh - 189px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 禁止全局滚动 */
}

.page-header-wrapper {
  background: #fff;
  padding: 15px 24px;
  border-radius: 4px;
  margin-bottom: 15px; /* 减小间距 */
  border-left: 5px solid #409EFF;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  /* 不设置 flex: 1，让它保持自然高度 */
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.page-title {
  display: flex;
  flex-direction: column;
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

/* 关键点2：内容区域弹性伸缩，填满剩余高度 */
.content-wrapper {
  flex: 1;
  min-height: 0; /* 允许子元素高度小于内容高度（开启滚动的前提） */
  margin: 0 !important; /* 修正 el-row 的负 margin */
  width: 100%;
}

.full-height-col {
  height: 100%;
  padding-bottom: 0 !important; /* 防止底部 padding 导致溢出 */
}

/* === 左侧配置卡片 === */
.config-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;

  /* 穿透修改 el-card__body，使其变成 Flex 容器 */
  /deep/ .el-card__body {
    flex: 1;
    padding: 0; /* 清除默认 padding，由内部控制 */
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .card-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .card-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }

  /* 自定义内部 Flex 结构 */
  .card-body-flex {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .scrollable-form-area {
    flex: 1; /* 占据中间所有空间 */
    overflow-y: auto; /* 仅此处滚动 */
    padding: 20px 20px 0 20px;
    .custom-scrollbar(); /* 应用自定义滚动条 */
  }

  .form-actions-footer {
    flex-shrink: 0; /* 不允许压缩 */
    padding: 15px 20px;
    text-align: right;
    border-top: 1px solid #ebeef5;
    background: #fff;
    z-index: 10;
  }
}

/* === 右侧代码卡片 === */
.code-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  /* body 样式已经在 template 中通过 :body-style 设置为 flex */

  .code-toolbar {
    flex-shrink: 0;
    background-color: #282c34;
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
      &:hover { color: #409EFF; }
    }
  }

  .code-editor-container {
    flex: 1; /* 占据剩余空间 */
    background-color: #282c34;
    overflow: auto; /* 双向滚动 */
    position: relative;
    .custom-scrollbar();

    .hljs-container {
      margin: 0;
      padding: 15px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.5;

      code {
        background: transparent !important;
        padding: 0;
      }
    }
  }
}
</style>