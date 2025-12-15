<template>
  <el-dialog
      :title="isEdit ? '编辑模板' : '新增模板'"
      :visible.sync="visibleDialog"
      width="800px"
      :close-on-click-modal="false"
      append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="模板类型" prop="templateType">
        <el-radio-group v-model="form.templateType" :disabled="isEdit">
          <el-radio label="JENKINSFILE">Jenkinsfile</el-radio>
          <el-radio label="DOCKERFILE">Dockerfile</el-radio>
          <el-radio label="DEPLOY_SCRIPT">部署脚本</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="form.templateName" placeholder="请输入模板名称，如：标准Java构建"></el-input>
      </el-form-item>
      <el-form-item label="是否默认" prop="isDefault">
        <el-switch v-model="form.isDefault"></el-switch>
        <span class="tips">（选中后，该类型下的其他模板将自动取消默认）</span>
      </el-form-item>
      <el-form-item label="模板内容" prop="templateContent">
        <el-input
            type="textarea"
            :rows="15"
            placeholder="请输入模板或脚本内容..."
            v-model="form.templateContent"
            class="code-editor"
        ></el-input>
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

export default {
  name: 'templateEditorDialog',
  props: {
    visible: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
    currentData: { type: Object, default: () => ({}) },
    applicationId: { type: [Number, String], required: true },
    defaultType: { type: String, default: 'JENKINSFILE' }
  },
  data() {
    return {
      submitting: false,
      form: {
        id: null,
        applicationId: null,
        templateType: 'JENKINSFILE',
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
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      }
    }
  },
  methods: {
    initForm() {
      if (this.isEdit && this.currentData.id) {
        this.form = { ...this.currentData }
      } else {
        this.resetForm()
        this.form.applicationId = this.applicationId
        // 新增时默认选中当前 tab 的类型
        this.form.templateType = this.defaultType
      }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    resetForm() {
      this.form = {
        id: null,
        applicationId: null,
        templateType: 'JENKINSFILE',
        templateName: '',
        templateContent: '',
        isDefault: false,
        remark: ''
      }
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitting = true
          const apiFunc = this.isEdit ? updateTemplate : createTemplate
          apiFunc(this.form).then(res => {
            if (res.data.code === 2000) {
              this.$message.success(this.isEdit ? '更新成功' : '创建成功')
              this.visibleDialog = false
              this.$emit('refresh')
            } else {
              this.$message.error(res.data.message)
            }
          }).finally(() => {
            this.submitting = false
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.tips {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}
/* 模拟代码编辑器的样式 */
.code-editor {
  ::v-deep .el-textarea__inner {
    font-family: 'Courier New', Courier, monospace, sans-serif; /* 等宽字体 */
    font-size: 14px;
    background-color: #f8f8f9;
    color: #333;
    line-height: 1.5;
    white-space: pre; /* 保持换行和空格 */
    overflow-x: auto; /* 允许横向滚动 */
  }
}
</style>