<template>
  <PageContainer title="系统参数" subtitle="管理系统运行配置、默认值与生效方式">
    <template #header-actions>
      <el-button v-authority="'SYSTEM_CONFIGURE'" type="primary" icon="el-icon-plus" size="small" @click="openCreate">
        新增参数
      </el-button>
    </template>

    <template #filter>
      <FilterBar @search="getSysParamList" @reset="resetQuery">
        <el-form-item label="参数搜索">
          <el-input v-model="searchText" placeholder="参数分组/编码/描述" prefix-icon="el-icon-search" clearable
                    style="width: 240px;" size="small" @keyup.enter.native="getSysParamList" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="enabled" placeholder="全部" clearable style="width: 120px;" size="small">
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
      </FilterBar>
    </template>

    <el-card shadow="never">
      <el-table :data="sysParamList" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="64" align="center" />
        <el-table-column prop="paramGroupCode" label="参数分组" min-width="130" show-overflow-tooltip />
        <el-table-column prop="paramCode" label="参数编码" min-width="180" show-overflow-tooltip />
        <el-table-column prop="paramDesc" label="参数描述" min-width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" type="info">{{ paramTypeLabel(scope.row.paramType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defaultValue" label="默认值" min-width="130" show-overflow-tooltip />
        <el-table-column prop="paramValue" label="当前值" min-width="150" show-overflow-tooltip />
        <el-table-column label="生效方式" width="110" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.restartRequired ? 'warning' : 'success'">
              {{ scope.row.restartRequired ? '重启后生效' : '即时生效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.enabled ? 'success' : 'info'">
              {{ scope.row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-authority="'SYSTEM_CONFIGURE'" type="text" icon="el-icon-edit" size="small"
                       @click="openEdit(scope.row)">编辑</el-button>
            <el-tooltip :content="scope.row.runtimeReferenced ? '该参数已被运行配置引用，不能删除' : '删除参数'" placement="top">
              <span class="action-wrapper">
                <el-button v-authority="'SYSTEM_CONFIGURE'" type="text" icon="el-icon-delete" size="small"
                           class="text-danger" :disabled="scope.row.runtimeReferenced" @click="removeParam(scope.row)">
                  删除
                </el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && sysParamList.length === 0" description="暂无符合条件的系统参数" />
    </el-card>

    <FormDialog :title="paramForm.id ? '编辑系统参数' : '新增系统参数'" :visible.sync="dialogVisible"
                :loading="submitting" width="560px" @submit="submitParam" @cancel="dialogVisible = false">
      <el-form ref="paramForm" :model="paramForm" :rules="rules" label-position="top" size="medium">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="参数分组" prop="paramGroupCode">
              <el-input v-model.trim="paramForm.paramGroupCode" :disabled="Boolean(paramForm.id)" placeholder="例如 deploy" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参数编码" prop="paramCode">
              <el-input v-model.trim="paramForm.paramCode" :disabled="Boolean(paramForm.id)" placeholder="例如 deploy.timeout" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="参数描述" prop="paramDesc">
          <el-input v-model.trim="paramForm.paramDesc" maxlength="128" show-word-limit placeholder="说明参数用途" />
        </el-form-item>
        <el-form-item label="参数类型" prop="paramType">
          <el-radio-group v-model="paramForm.paramType" :disabled="Boolean(paramForm.id)">
            <el-radio :label="1">文本/数值</el-radio>
            <el-radio :label="2">选项值</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="默认值" prop="defaultValue">
              <el-input v-model="paramForm.defaultValue" maxlength="128" placeholder="参数默认值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前值" prop="paramValue">
              <el-input v-model="paramForm.paramValue" maxlength="128" placeholder="当前生效值" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="启用状态" prop="enabled">
              <el-switch v-model="paramForm.enabled" active-text="启用" inactive-text="停用" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效方式" prop="restartRequired">
              <el-switch v-model="paramForm.restartRequired" active-text="需要重启" inactive-text="即时生效" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-alert v-if="paramForm.runtimeReferenced" title="该参数已被运行配置引用，允许修改但不能删除。"
                  type="warning" :closable="false" show-icon />
      </el-form>
    </FormDialog>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import { createSysParam, getSysParamList, modifySysParam, removeSysParam } from '@/views/systemManagement/api'

function emptyParamForm() {
  return {
    id: null,
    paramGroupCode: '',
    paramCode: '',
    paramDesc: '',
    paramValue: '',
    defaultValue: '',
    paramType: 1,
    restartRequired: false,
    runtimeReferenced: false,
    enabled: true
  }
}

export default {
  name: 'systemParam',
  components: { PageContainer, FilterBar, FormDialog },
  data() {
    const codePattern = /^[a-zA-Z][a-zA-Z0-9_.-]*$/
    return {
      loading: false,
      submitting: false,
      dialogVisible: false,
      searchText: '',
      enabled: '',
      sysParamList: [],
      paramForm: emptyParamForm(),
      rules: {
        paramGroupCode: [
          { required: true, whitespace: true, message: '请输入参数分组', trigger: 'blur' },
          { pattern: codePattern, message: '只能以字母开头，并使用字母、数字、点、横线或下划线', trigger: 'blur' }
        ],
        paramCode: [
          { required: true, whitespace: true, message: '请输入参数编码', trigger: 'blur' },
          { pattern: codePattern, message: '只能以字母开头，并使用字母、数字、点、横线或下划线', trigger: 'blur' }
        ],
        paramDesc: [{ required: true, whitespace: true, message: '请输入参数描述', trigger: 'blur' }],
        paramValue: [{ required: true, whitespace: true, message: '请输入当前值', trigger: 'blur' }],
        defaultValue: [{ required: true, whitespace: true, message: '请输入默认值', trigger: 'blur' }],
        paramType: [{ required: true, message: '请选择参数类型', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getSysParamList()
  },
  methods: {
    async getSysParamList() {
      this.loading = true
      try {
        const res = await getSysParamList({
          searchText: this.searchText.trim() || null,
          enabled: this.enabled === '' ? null : this.enabled
        })
        if (res.code === 200) this.sysParamList = res.data || []
      } catch (error) {
        this.$message.error(`获取系统参数失败：${error.message || error}`)
      } finally {
        this.loading = false
      }
    },
    resetQuery() {
      this.searchText = ''
      this.enabled = ''
      this.getSysParamList()
    },
    openCreate() {
      this.paramForm = emptyParamForm()
      this.dialogVisible = true
      this.clearValidation()
    },
    openEdit(row) {
      this.paramForm = { ...emptyParamForm(), ...row }
      this.dialogVisible = true
      this.clearValidation()
    },
    clearValidation() {
      this.$nextTick(() => this.$refs.paramForm && this.$refs.paramForm.clearValidate())
    },
    submitParam() {
      this.$refs.paramForm.validate(async valid => {
        if (!valid) return
        this.submitting = true
        const form = this.paramForm
        const request = form.id
          ? {
              id: form.id,
              paramDesc: form.paramDesc.trim(),
              paramValue: form.paramValue.trim(),
              defaultValue: form.defaultValue.trim(),
              restartRequired: form.restartRequired,
              enabled: form.enabled
            }
          : {
              paramGroupCode: form.paramGroupCode.trim(),
              paramCode: form.paramCode.trim(),
              paramDesc: form.paramDesc.trim(),
              paramValue: form.paramValue.trim(),
              defaultValue: form.defaultValue.trim(),
              paramType: form.paramType,
              restartRequired: form.restartRequired,
              enabled: form.enabled
            }
        try {
          const res = await (form.id ? modifySysParam(request) : createSysParam(request))
          if (res.code === 200) {
            this.$message.success(form.id ? '系统参数已更新' : '系统参数已创建')
            this.dialogVisible = false
            await this.getSysParamList()
          }
        } catch (error) {
          this.$message.error(`保存失败：${error.message || error}`)
        } finally {
          this.submitting = false
        }
      })
    },
    removeParam(row) {
      if (row.runtimeReferenced) return
      this.$confirm(`确认删除系统参数“${row.paramCode}”吗？`, '删除确认', { type: 'warning' })
        .then(async () => {
          try {
            const res = await removeSysParam(row.id)
            if (res.code === 200) {
              this.$message.success('系统参数已删除')
              await this.getSysParamList()
            }
          } catch (error) {
            this.$message.error(`删除失败：${error.message || error}`)
          }
        })
        .catch(() => {})
    },
    paramTypeLabel(type) {
      return type === 2 ? '选项值' : '文本/数值'
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.text-danger {
  color: @error-color;
}

.action-wrapper {
  display: inline-block;
  margin-left: @space-2;
}
</style>
