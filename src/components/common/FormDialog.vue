<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    custom-class="form-dialog"
    append-to-body
    @close="handleClose"
  >
    <slot />

    <template #footer>
      <el-button size="small" @click="handleCancel">取 消</el-button>
      <el-button size="small" type="primary" :loading="loading" @click="handleSubmit">
        {{ submitText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'FormDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '520px'
    },
    loading: {
      type: Boolean,
      default: false
    },
    submitText: {
      type: String,
      default: '确 定'
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleCancel() {
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
    handleSubmit() {
      this.$emit('submit')
    }
  }
}
</script>

<style lang="less">
/* 非 scoped 样式，覆盖 Element UI 弹窗默认样式 */
.form-dialog {
  border-radius: 12px;
  overflow: hidden;

  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;
    margin: 0;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .el-dialog__body {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 16px 24px 20px;
    border-top: 1px solid #ebeef5;
    background-color: #f9fafc;
  }
}

/* 响应式：小屏弹窗全宽 */
@media (max-width: 768px) {
  .form-dialog {
    width: 90vw !important;
    margin: 0 auto;
  }
}
</style>
