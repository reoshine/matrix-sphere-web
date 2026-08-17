<template>
  <PageContainer title="模板中心" subtitle="管理部署模板与构建脚本">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">
        {{ activeTab === 'user' ? '新增应用模板' : '新增系统模板' }}
      </el-button>
    </template>

    <!-- 模板类型切换 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <!-- 用户模板 -->
      <el-tab-pane label="应用模板" name="user">
        <div class="tab-toolbar">
          <el-select
            v-model="selectedAppId"
            placeholder="请选择应用"
            size="small"
            filterable
            clearable
            style="width: 240px;"
            @change="loadUserTemplates"
          >
            <el-option
              v-for="app in appList"
              :key="app.id"
              :label="app.applicationName"
              :value="app.id"
            />
          </el-select>
        </div>

        <el-table :data="userTemplates" border stripe v-loading="userLoading" empty-text="请选择应用查看模板">
          <el-table-column prop="templateName" label="模板名称" min-width="150">
            <template slot-scope="scope">
              <span>{{ scope.row.templateName }}</span>
              <el-tag v-if="scope.row.isDefault" size="mini" type="success" effect="dark" style="margin-left: 10px">默认</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="templateType" label="模板类型" width="150" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" type="info">{{ formatTemplateType(scope.row.templateType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
          <el-table-column prop="gmtModified" label="更新时间" width="160" align="center" />
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" icon="el-icon-edit" size="mini" @click="handleEdit(scope.row, 'user')">编辑</el-button>
              <el-popconfirm title="确定删除该模板吗？" @confirm="handleDelete(scope.row)">
                <el-button slot="reference" type="text" icon="el-icon-delete" size="mini" class="text-danger">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 系统模板 -->
      <el-tab-pane label="系统模板" name="system">
        <el-alert
          title="此处维护的模板为系统级通用标准 (SYSTEM Scope)。新应用创建时，可选择以此为原型初始化其私有配置。"
          type="info"
          show-icon
          style="margin-bottom: 15px;"
          :closable="false"
        />

        <el-tabs v-model="systemTemplateType" @tab-click="loadSystemTemplates">
          <el-tab-pane label="Jenkins Job配置 (XML)" name="JOB_CONFIG_XML" />
          <el-tab-pane label="Jenkinsfile 流水线" name="JENKINSFILE" />
          <el-tab-pane label="Dockerfile" name="DOCKERFILE" />
        </el-tabs>

        <el-table :data="systemTemplates" border stripe v-loading="systemLoading" empty-text="暂无系统模板">
          <el-table-column prop="templateName" label="模板名称" min-width="200">
            <template slot-scope="scope">
              <span style="font-weight: 500">{{ scope.row.templateName }}</span>
              <el-tag v-if="scope.row.isDefault" size="mini" type="success" effect="dark" style="margin-left: 10px">默认推荐</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="适用场景说明" min-width="300" show-overflow-tooltip />
          <el-table-column prop="gmtModified" label="更新时间" width="160" align="center" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row, 'system')">编辑</el-button>
              <el-popconfirm title="确定删除该系统模板吗？" @confirm="handleDelete(scope.row)">
                <el-button slot="reference" type="text" icon="el-icon-delete" class="text-danger">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 模板编辑弹窗 -->
    <template-editor-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :is-edit="isEdit"
      :current-data="currentData"
      :application-id="editAppId"
      :scope="editScope"
      :default-type="editType"
      @refresh="refreshData"
    />
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import { getTemplateList, deleteTemplate } from '@/views/applicationManagement/deployTemplate/api'
import { queryList } from '@/views/applicationManagement/applicationGroup/api'
import templateEditorDialog from './templateEditorDialog'

export default {
  name: 'templateManage',
  components: {
    PageContainer,
    templateEditorDialog
  },
  data() {
    return {
      activeTab: 'user',
      // 用户模板相关
      selectedAppId: null,
      userTemplates: [],
      userLoading: false,
      appList: [],
      // 系统模板相关
      systemTemplateType: 'JOB_CONFIG_XML',
      systemTemplates: [],
      systemLoading: false,
      // 弹窗相关
      dialogVisible: false,
      isEdit: false,
      currentData: {},
      editAppId: null,
      editScope: 'APP',
      editType: 'JOB_CONFIG_XML'
    }
  },
  created() {
    this.loadAppList()
  },
  methods: {
    handleTabChange() {
      if (this.activeTab === 'user' && this.selectedAppId) {
        this.loadUserTemplates()
      } else if (this.activeTab === 'system') {
        this.loadSystemTemplates()
      }
    },

    async loadAppList() {
      try {
        const res = await queryList()
        if (res.code === 200) {
          this.appList = res.data || []
        }
      } catch (e) {
        console.error('加载应用列表失败', e)
      }
    },

    async loadUserTemplates() {
      if (!this.selectedAppId) {
        this.userTemplates = []
        return
      }
      this.userLoading = true
      try {
        const res = await getTemplateList(this.selectedAppId)
        if (res.code === 200) {
          this.userTemplates = res.data || []
        }
      } catch (e) {
        console.error('加载用户模板失败', e)
      } finally {
        this.userLoading = false
      }
    },

    async loadSystemTemplates() {
      this.systemLoading = true
      try {
        const res = await getTemplateList({
          scope: 'SYSTEM',
          templateType: this.systemTemplateType
        })
        if (res.code === 200) {
          this.systemTemplates = res.data || []
        }
      } catch (e) {
        console.error('加载系统模板失败', e)
      } finally {
        this.systemLoading = false
      }
    },

    handleAdd() {
      this.isEdit = false
      this.currentData = {}
      if (this.activeTab === 'user') {
        this.editAppId = this.selectedAppId
        this.editScope = 'APP'
        this.editType = 'JOB_CONFIG_XML'
      } else {
        this.editAppId = null
        this.editScope = 'SYSTEM'
        this.editType = this.systemTemplateType
      }
      this.dialogVisible = true
    },

    handleEdit(row, scope) {
      this.isEdit = true
      this.currentData = JSON.parse(JSON.stringify(row))
      this.editAppId = row.applicationId || this.selectedAppId
      this.editScope = scope === 'system' ? 'SYSTEM' : 'APP'
      this.editType = row.templateType
      this.dialogVisible = true
    },

    async handleDelete(row) {
      try {
        const res = await deleteTemplate(row.id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.refreshData()
        } else {
          this.$message.error(res.message)
        }
      } catch (e) {
        this.$message.error('删除失败')
      }
    },

    refreshData() {
      if (this.activeTab === 'user') {
        this.loadUserTemplates()
      } else {
        this.loadSystemTemplates()
      }
    },

    formatTemplateType(type) {
      const map = {
        JOB_CONFIG_XML: 'Jenkins Job',
        JENKINSFILE: 'Jenkinsfile',
        DOCKERFILE: 'Dockerfile',
        DEPLOY_SCRIPT: '部署脚本'
      }
      return map[type] || type
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.tab-toolbar {
  margin-bottom: @space-4;
  display: flex;
  align-items: center;
  gap: @space-3;
}

.text-danger {
  color: @error-color;

  &:hover {
    color: #f78989;
  }
}
</style>
