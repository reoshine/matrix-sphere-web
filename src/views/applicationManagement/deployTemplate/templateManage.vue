<template>
  <PageContainer title="系统模板" subtitle="统一维护 Jenkins Job、流水线和镜像构建模板">
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">
        新增系统模板
      </el-button>
    </template>

    <el-alert
      title="当前仅支持系统模板。应用创建和部署时将根据构建类型自动选择对应的默认模板。"
      type="info"
      show-icon
      :closable="false"
      class="template-notice"
    />

    <div class="template-filter" role="group" aria-label="模板筛选">
      <el-radio-group v-model="templateType" size="small" @change="handleTypeChange">
        <el-radio-button label="JOB_CONFIG_XML">Jenkins Job 配置</el-radio-button>
        <el-radio-button label="JENKINSFILE">Jenkinsfile</el-radio-button>
        <el-radio-button label="DOCKERFILE">Dockerfile</el-radio-button>
      </el-radio-group>

      <el-select
        v-if="templateType === 'JENKINSFILE'"
        v-model="jobType"
        size="small"
        clearable
        placeholder="全部构建类型"
        class="job-type-filter"
        @change="loadTemplates"
      >
        <el-option v-for="item in jobTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>

    <el-table :data="templates" border stripe v-loading="loading" empty-text="暂无系统模板">
      <el-table-column prop="templateName" label="模板名称" min-width="200">
        <template slot-scope="scope">
          <span class="template-name">{{ scope.row.templateName }}</span>
          <el-tag v-if="scope.row.isDefault" size="mini" type="success" effect="dark" class="default-tag">
            默认
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="templateType === 'JENKINSFILE'" label="构建类型" width="150" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" type="info">{{ formatJobType(scope.row.jobType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="适用场景说明" min-width="280" show-overflow-tooltip />
      <el-table-column prop="gmtModified" label="更新时间" width="160" align="center" />
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除该系统模板吗？" @confirm="handleDelete(scope.row)">
            <el-button slot="reference" type="text" icon="el-icon-delete" class="text-danger">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <template-editor-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :is-edit="isEdit"
      :current-data="currentData"
      :default-type="templateType"
      @refresh="loadTemplates"
    />
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import { deleteTemplate, getTemplateList } from './api'
import templateEditorDialog from './templateEditorDialog.vue'

export default {
  name: 'TemplateManage',
  components: {
    PageContainer,
    templateEditorDialog
  },
  data() {
    return {
      templateType: 'JOB_CONFIG_XML',
      jobType: '',
      templates: [],
      loading: false,
      dialogVisible: false,
      isEdit: false,
      currentData: {},
      jobTypeOptions: [
        { label: '后端可执行应用', value: 'backend' },
        { label: '后端类库', value: 'backend_library' },
        { label: '前端应用', value: 'frontend' }
      ]
    }
  },
  created() {
    this.loadTemplates()
  },
  methods: {
    handleTypeChange() {
      this.jobType = ''
      this.loadTemplates()
    },

    async loadTemplates() {
      this.loading = true
      try {
        const res = await getTemplateList({
          templateType: this.templateType,
          jobType: this.templateType === 'JENKINSFILE' ? this.jobType || undefined : undefined
        })
        if (res.code === 200) {
          this.templates = res.data || []
        } else {
          this.$message.error(res.message || '系统模板加载失败')
        }
      } catch (e) {
        this.$message.error('系统模板加载失败，请重试')
      } finally {
        this.loading = false
      }
    },

    handleAdd() {
      this.isEdit = false
      this.currentData = {
        templateType: this.templateType,
        jobType: this.templateType === 'JENKINSFILE' ? this.jobType : ''
      }
      this.dialogVisible = true
    },

    handleEdit(row) {
      this.isEdit = true
      this.currentData = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },

    async handleDelete(row) {
      try {
        const res = await deleteTemplate(row.id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.loadTemplates()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      } catch (e) {
        this.$message.error('删除失败，请重试')
      }
    },

    formatJobType(jobType) {
      const option = this.jobTypeOptions.find(item => item.value === jobType)
      return option ? option.label : '未指定'
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.template-notice {
  margin-bottom: @space-4;
}

.template-filter {
  display: flex;
  align-items: center;
  gap: @space-3;
  margin-bottom: @space-4;
}

.job-type-filter {
  width: 180px;
}

.template-name {
  font-weight: 500;
}

.default-tag {
  margin-left: @space-2;
}

.text-danger {
  color: @error-color;
}
</style>
