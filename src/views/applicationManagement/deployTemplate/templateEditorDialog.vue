<template>
  <el-dialog
      :title="isEdit ? '编辑模板' : '新增模板'"
      :visible.sync="visibleDialog"
      width="900px"
      :close-on-click-modal="false"
      append-to-body
      custom-class="code-editor-dialog"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板类型" prop="templateType">
            <el-radio-group v-model="form.templateType" :disabled="isEdit" size="small">
              <el-radio-button label="JOB_CONFIG_XML">XML Config</el-radio-button>
              <el-radio-button label="JENKINSFILE">Jenkinsfile</el-radio-button>
              <el-radio-button label="DOCKERFILE">Dockerfile</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="编辑器主题">
            <el-select v-model="editorTheme" size="small" placeholder="选择主题" style="width: 100%">
              <el-option label="Dracula (暗色推荐)" value="dracula">
                <span style="float: left">Dracula</span>
                <span style="float: right; color: #8492a6; font-size: 12px">Dark</span>
              </el-option>
              <el-option label="Monokai (经典暗色)" value="monokai">
                <span style="float: left">Monokai</span>
                <span style="float: right; color: #8492a6; font-size: 12px">Dark</span>
              </el-option>
              <el-option label="Eclipse (经典亮色)" value="eclipse">
                <span style="float: left">Eclipse</span>
                <span style="float: right; color: #8492a6; font-size: 12px">Light</span>
              </el-option>
              <el-option label="IDEA (IntelliJ亮色)" value="idea">
                <span style="float: left">IDEA</span>
                <span style="float: right; color: #8492a6; font-size: 12px">Light</span>
              </el-option>
              <el-option label="Solarized (暖色)" value="solarized light">
                <span style="float: left">Solarized</span>
                <span style="float: right; color: #8492a6; font-size: 12px">Light</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="form.templateName" placeholder="例如：标准Java构建模板"></el-input>
      </el-form-item>

      <el-form-item label="是否默认" prop="isDefault">
        <el-switch v-model="form.isDefault"></el-switch>
        <span class="tips">（选中后，该类型下的其他模板将自动取消默认）</span>
      </el-form-item>

      <el-form-item label="模板内容" prop="templateContent">
        <div class="editor-wrapper" :class="{ 'error-border': templateContentError, 'light-theme': isLightTheme }">

          <div class="editor-toolbar">
            <span class="toolbar-item"><i class="el-icon-view"></i> {{ currentModeLabel }}</span>
            <span class="toolbar-divider">|</span>
            <span class="toolbar-item">Theme: {{ editorTheme }}</span>
          </div>

          <codemirror
              v-model="form.templateContent"
              :options="cmOptions"
              @input="onEditorCodeChange"
          />
        </div>
        <div class="editor-tips">
          <i class="el-icon-info"></i> {{ placeholderText }}
        </div>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" :rows="2" v-model="form.remark" placeholder="可选备注"></el-input>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="visibleDialog = false">取 消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createTemplate, updateTemplate } from "@/views/applicationManagement/deployTemplate/api";

import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'

// [核心] 引入多个主题 CSS
import 'codemirror/theme/dracula.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/theme/idea.css'
import 'codemirror/theme/solarized.css'

// 引入语言模式
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/dockerfile/dockerfile.js'
import 'codemirror/mode/groovy/groovy.js'
import 'codemirror/addon/selection/active-line.js'

export default {
  name: 'templateEditorDialog',
  components: { codemirror },
  props: {
    visible: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
    currentData: { type: Object, default: () => ({}) },
    applicationId: { type: [Number, String], required: false, default: null },
    scope: { type: String, default: 'APP' },
    defaultType: { type: String, default: 'JOB_CONFIG_XML' }
  },
  data() {
    return {
      submitting: false,
      templateContentError: false,
      // [新增] 默认主题
      editorTheme: 'dracula',
      form: {
        id: null,
        scope: 'APP',
        templateType: 'JOB_CONFIG_XML',
        templateName: '',
        templateContent: '',
        isDefault: false,
        remark: ''
      },
      rules: {
        templateType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
        templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
        templateContent: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
      }
    }
  },
  computed: {
    visibleDialog: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    // 判断是否为亮色主题（用于调整边框颜色）
    isLightTheme() {
      return ['eclipse', 'idea', 'solarized light', 'default'].includes(this.editorTheme);
    },
    currentModeLabel() {
      const map = {
        'JOB_CONFIG_XML': 'XML Mode',
        'JENKINSFILE': 'Groovy Mode',
        'DOCKERFILE': 'Dockerfile Mode'
      }
      return map[this.form.templateType] || 'Text Mode';
    },
    cmOptions() {
      let mode = 'application/xml';

      if (this.form.templateType === 'JENKINSFILE') {
        mode = 'text/x-groovy';
      } else if (this.form.templateType === 'DOCKERFILE') {
        mode = 'text/x-dockerfile';
      }

      return {
        tabSize: 2,
        mode: mode,
        // [核心] 动态绑定主题
        theme: this.editorTheme,
        lineNumbers: true,
        line: true,
        styleActiveLine: true,
        matchBrackets: true,
        viewportMargin: Infinity,
      }
    },
    placeholderText() {
      if (this.form.templateType === 'JOB_CONFIG_XML') {
        return '提示：请使用 ${pipelineScript} 作为 Jenkinsfile 内容的占位符。';
      }
      return '支持 Shell / Groovy / Dockerfile 语法高亮';
    }
  },
  created() {
    this.initForm();
  },
  methods: {
    onEditorCodeChange(newCode) {
      this.form.templateContent = newCode;
      if (newCode) {
        this.$refs.form.clearValidate('templateContent');
        this.templateContentError = false;
      }
    },
    initForm() {
      this.resetForm();
      if (this.isEdit && this.currentData.id) {
        this.form = Object.assign({}, this.form, this.currentData);
      } else {
        if (this.applicationId) this.form.applicationId = this.applicationId;
        this.form.scope = this.scope;
        this.form.templateType = this.defaultType;
      }
      // 如果有保存用户偏好，可以在这里读取 localStorage 中的 theme
      const savedTheme = localStorage.getItem('matrix_editor_theme');
      if (savedTheme) {
        this.editorTheme = savedTheme;
      }

      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
      });
    },
    resetForm() {
      this.form = {
        id: null,
        scope: this.scope,
        templateType: 'JOB_CONFIG_XML',
        templateName: '',
        templateContent: '',
        isDefault: false,
        remark: ''
      };
      if (this.applicationId) this.form.applicationId = this.applicationId;
    },
    handleSubmit() {
      // 保存用户的主题偏好
      localStorage.setItem('matrix_editor_theme', this.editorTheme);

      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitting = true;
          const payload = { ...this.form };
          if (!payload.scope) payload.scope = this.scope;
          if (this.applicationId) payload.applicationId = this.applicationId;

          const apiFunc = this.isEdit ? updateTemplate : createTemplate;

          apiFunc(payload).then(res => {
            if (res.code === 200) {
              this.$message.success(this.isEdit ? '更新成功' : '创建成功');
              this.visibleDialog = false;
              this.$emit('refresh');
            } else {
              this.$message.error(res.message);
            }
          }).finally(() => {
            this.submitting = false;
          });
        } else {
          if (!this.form.templateContent) {
            this.templateContentError = true;
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.tips { font-size: 12px; color: #909399; margin-left: 10px; }
.editor-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.5;
}

.editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  line-height: 24px;
  position: relative;

  /* 错误状态红框 */
  &.error-border {
    border-color: #F56C6C;
  }

  /* 亮色主题时的微调：防止背景太白导致边框看不清 */
  &.light-theme {
    border: 1px solid #c0c4cc;
  }
}

/* 顶部状态栏样式 */
.editor-toolbar {
  height: 30px;
  line-height: 30px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 10px;
  font-size: 12px;
  color: #606266;
  display: flex;
  align-items: center;

  .toolbar-divider {
    margin: 0 10px;
    color: #dcdfe6;
  }

  .toolbar-item {
    display: flex;
    align-items: center;
    i { margin-right: 4px; }
  }
}

/* 深度定制 CodeMirror */
::v-deep .CodeMirror {
  height: 450px; /* 稍微增加高度 */
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 14px;
}

/* 调整 Dialog 样式 */
::v-deep .code-editor-dialog {
  margin-top: 5vh !important;
  .el-dialog__body {
    padding: 20px 30px;
  }
}
</style>