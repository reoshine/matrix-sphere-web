<template>
  <PageContainer :title="modifyApplicationForm.applicationName || '应用配置'" subtitle="配置项目的构建参数、流水线及环境变量">
    <!-- 头部操作 -->
    <template #header-actions>
      <el-button size="small" icon="el-icon-back" @click="$router.back()">返回</el-button>
      <el-button type="primary" size="small" icon="el-icon-check" @click="modifyApplication" :loading="loading">
        保存配置
      </el-button>
    </template>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" type="border-card" class="edit-tabs">
      <!-- 基础配置 -->
      <el-tab-pane label="基础配置" name="basic">
        <span slot="label"><i class="el-icon-setting"></i> 基础配置</span>
        <div class="tab-content">
          <el-form
              :model="modifyApplicationForm"
              :rules="rules"
              ref="modifyApplicationFormRef"
              label-position="top"
              size="medium"
              class="config-form"
          >
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item prop="applicationCode" label="项目编码">
                  <el-input v-model="modifyApplicationForm.applicationCode" placeholder="唯一标识" disabled>
                    <template slot="prepend">CODE</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="applicationName" label="项目名称">
                  <el-input v-model="modifyApplicationForm.applicationName" placeholder="应用显示名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="applicationGroupId" label="所属分组">
                  <el-select v-model="modifyApplicationForm.applicationGroupId" placeholder="请选择" style="width: 100%">
                    <el-option
                        v-for="item in applicationGroupList"
                        :key="item.id"
                        :label="item.applicationGroupName"
                        :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="enableStatus" label="应用状态">
                  <el-select v-model="modifyApplicationForm.enableStatus" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in enableStatusList" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="gitUrl" label="Git 仓库地址">
                  <el-input
                      type="textarea"
                      :rows="3"
                      v-model="modifyApplicationForm.gitUrl"
                      placeholder="git@gitee.com:..."
                      resize="none"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="jobType" label="构建类型">
                  <el-select v-model="modifyApplicationForm.jobType" placeholder="请选择构建类型" style="width: 100%">
                    <el-option v-for="item in jobTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                  <div class="form-tip">
                    <i class="el-icon-info"></i> 保存后系统会使用该类型对应的默认系统模板更新 Jenkins Job。
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 流水线配置 -->
      <el-tab-pane label="流水线配置" name="pipeline">
        <span slot="label"><i class="el-icon-s-cooperation"></i> 流水线配置</span>
        <div class="tab-content pipeline-content">
          <div class="pipeline-toolbar">
            <span class="pipeline-label">Jenkins Pipeline (Groovy)</span>
            <div class="pipeline-toolbar-right">
              <el-select v-model="editorTheme" size="mini" placeholder="主题" style="width: 140px; margin-right: 10px;" @change="onThemeChange">
                <el-option label="Dracula (暗色)" value="dracula" />
                <el-option label="Monokai (暗色)" value="monokai" />
                <el-option label="Eclipse (亮色)" value="eclipse" />
                <el-option label="IDEA (亮色)" value="idea" />
                <el-option label="Solarized (暖色)" value="solarized light" />
              </el-select>
              <el-button type="text" icon="el-icon-document-copy" size="small" @click="copyCode">复制配置</el-button>
            </div>
          </div>
          <div v-loading="pipelineLoading" class="pipeline-editor" :class="{ 'light-theme': isLightTheme }">
            <el-empty v-if="!systemPipelineScript" description="当前构建类型尚未配置默认系统 Jenkinsfile" />
            <codemirror v-else v-model="systemPipelineScript" :options="cmOptions" />
          </div>
        </div>
      </el-tab-pane>

      <!-- 环境变量 -->
      <el-tab-pane label="环境变量" name="envVars">
        <span slot="label"><i class="el-icon-s-data"></i> 环境变量</span>
        <div class="tab-content">
          <el-empty description="环境变量管理功能开发中">
            <template #description>
              <p>环境变量管理功能即将上线</p>
              <p class="env-hint">届时可在此配置部署时注入的环境变量，如数据库连接、密钥等</p>
            </template>
          </el-empty>
        </div>
      </el-tab-pane>

      <!-- 部署历史 -->
      <el-tab-pane label="部署历史" name="history">
        <span slot="label"><i class="el-icon-time"></i> 部署历史</span>
        <div class="tab-content">
          <el-empty description="部署历史功能开发中">
            <template #description>
              <p>部署历史功能即将上线</p>
              <p class="env-hint">届时可在此查看该应用的所有部署记录</p>
            </template>
          </el-empty>
        </div>
      </el-tab-pane>
    </el-tabs>
  </PageContainer>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

// 引入多个主题 CSS
import 'codemirror/theme/dracula.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/theme/idea.css'
import 'codemirror/theme/solarized.css'

// 引入语言模式
import 'codemirror/mode/groovy/groovy.js'
import 'codemirror/addon/selection/active-line.js'

import PageContainer from '@/components/common/PageContainer.vue'
import { getApplicationById, modifyApplication } from '@/views/applicationManagement/applicationList/api'
import { queryList } from '@/views/applicationManagement/applicationGroup/api'
import { getTemplateList } from '@/views/applicationManagement/deployTemplate/api'

export default {
  name: 'applicationEdit',
  components: {
    PageContainer,
    codemirror
  },
  data() {
    return {
      applicationId: '',
      loading: false,
      pipelineLoading: false,
      activeTab: 'basic',
      editorTheme: localStorage.getItem('matrix_editor_theme') || 'dracula',

      modifyApplicationForm: {
        id: '',
        applicationCode: '',
        applicationName: '',
        applicationGroupId: '',
        applicationGroupCode: '',
        gitUrl: '',
        enableStatus: null,
        jobXml: '',
        jobType: ''
      },

      systemPipelineScript: '',

      applicationGroupList: [],
      enableStatusList: [
        { label: '启用', value: 1 },
        { label: '停用', value: 0 }
      ],
      jobTypeOptions: [
        { label: '后端可执行应用', value: 'backend' },
        { label: '后端类库', value: 'backend_library' },
        { label: '前端应用', value: 'frontend' }
      ],

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
        jobType: [
          { required: true, message: '请选择构建类型', trigger: 'change' }
        ]
      }
    }
  },

  computed: {
    isLightTheme() {
      return ['eclipse', 'idea', 'solarized light', 'default'].includes(this.editorTheme);
    },
    cmOptions() {
      return {
        tabSize: 2,
        mode: 'text/x-groovy',
        theme: this.editorTheme,
        lineNumbers: true,
        line: true,
        styleActiveLine: true,
        matchBrackets: true,
        readOnly: true,
        viewportMargin: Infinity
      }
    }
  },

  watch: {
    'modifyApplicationForm.jobType': {
      handler(newVal) {
        this.fetchSystemPipeline(newVal)
      }
    }
  },

  methods: {
    getGroupList() {
      queryList().then(res => {
        if (res.code === 200) {
          this.applicationGroupList = res.data || []
        }
      })
    },

    async fetchSystemPipeline(jobType) {
      if (!jobType) {
        this.systemPipelineScript = ''
        return
      }
      this.pipelineLoading = true
      try {
        const res = await getTemplateList({ templateType: 'JENKINSFILE', jobType })
        if (res.code === 200 && res.data) {
          const templates = res.data || []
          const template = templates.find(item => item.isDefault) || templates[0]
          this.systemPipelineScript = template ? template.templateContent || '' : ''
        }
      } catch (e) {
        this.systemPipelineScript = ''
        this.$message.warning('默认系统流水线模板加载失败')
      } finally {
        this.pipelineLoading = false
      }
    },

    fetchApplication(id) {
      if (!id) return
      const loadingInstance = this.$loading({ target: '.edit-tabs', text: '加载配置中...' })
      getApplicationById(id).then(res => {
        if (res.code === 200) {
          this.modifyApplicationForm = res.data
        }
      }).catch(err => {
        this.$message.error('获取详情失败：' + err)
      }).finally(() => {
        loadingInstance.close()
      })
    },

    modifyApplication() {
      this.$refs.modifyApplicationFormRef.validate((valid) => {
        if (valid) {
          this.loading = true
          const payload = {
            id: this.modifyApplicationForm.id,
            applicationCode: this.modifyApplicationForm.applicationCode,
            applicationName: this.modifyApplicationForm.applicationName,
            applicationGroupId: this.modifyApplicationForm.applicationGroupId,
            gitUrl: this.modifyApplicationForm.gitUrl,
            enableStatus: this.modifyApplicationForm.enableStatus,
            jobType: this.modifyApplicationForm.jobType
          }
          modifyApplication(payload).then(res => {
            if (res.code === 200) {
              this.$message.success('配置保存成功')
              this.$router.back()
            } else {
              this.$message.error(res.message || '保存失败')
            }
          }).catch(err => {
            this.$message.error('系统异常：' + err)
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },

    copyCode() {
      if (!this.systemPipelineScript) return
      const input = document.createElement('textarea')
      input.value = this.systemPipelineScript
      document.body.appendChild(input)
      input.select()
      document.execCommand('Copy')
      document.body.removeChild(input)
      this.$message.success('Pipeline 配置已复制到剪贴板')
    },

    onThemeChange(theme) {
      localStorage.setItem('matrix_editor_theme', theme)
    }
  },

  created() {
    this.getGroupList()
    let pid = this.$route.params.id || this.$route.params.applicationId || this.$route.query.applicationId
    if (!pid && localStorage.getItem('applicationId')) {
      try {
        pid = JSON.parse(localStorage.getItem('applicationId'))
      } catch (e) { /* ignore */ }
    }

    if (pid) {
      this.applicationId = pid
      localStorage.setItem('applicationId', JSON.stringify(pid))
      this.fetchApplication(pid)
    } else {
      this.$message.warning('参数丢失，无法加载项目信息')
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

/* 标签页 */
.edit-tabs {
  border-radius: @border-radius;
  overflow: hidden;

  /deep/ .el-tabs__header {
    background-color: @bg-content;
    border-bottom: 1px solid @border-color-light;
  }

  /deep/ .el-tabs__content {
    padding: 0;
  }
}

/* 标签页内容区 */
.tab-content {
  padding: @space-5;
  min-height: 400px;
}

/* 表单提示 */
.form-tip {
  font-size: @font-size-xs;
  color: @text-tertiary;
  line-height: 1.5;
  margin-top: 4px;
}

/* 流水线配置 */
.pipeline-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.pipeline-toolbar {
  flex-shrink: 0;
  background-color: #282c34;
  padding: @space-3 @space-4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3e4451;

  .pipeline-toolbar-right {
    display: flex;
    align-items: center;
  }
}

.pipeline-label {
  color: #abb2bf;
  font-family: @font-mono;
  font-size: @font-size-sm;
  font-weight: 600;
}

.pipeline-editor {
  flex: 1;
  background-color: #282c34;
  overflow: auto;
  min-height: 400px;

  &.light-theme {
    background-color: @bg-surface;
  }

  ::v-deep .CodeMirror {
    height: auto;
    min-height: 400px;
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: @font-size-sm;
    line-height: 1.6;
  }
}

/* 环境变量/部署历史占位 */
.env-hint {
  font-size: @font-size-xs;
  color: @text-tertiary;
  margin-top: @space-2;
}
</style>
