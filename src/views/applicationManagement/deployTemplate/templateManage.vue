<template>
  <div class="template-manage-container">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold">部署所需模板与脚本</span>
        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-plus" @click="handleAdd">新增模板</el-button>
      </div>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="Jenkins Job配置 (XML)" name="JOB_CONFIG_XML"></el-tab-pane>
        <el-tab-pane label="Jenkinsfile" name="JENKINSFILE"></el-tab-pane>
        <el-tab-pane label="Dockerfile" name="DOCKERFILE"></el-tab-pane>
        <el-tab-pane label="部署脚本 (deploy.sh)" name="DEPLOY_SCRIPT"></el-tab-pane>
      </el-tabs>

      <el-table :data="filteredList" border stripe style="width: 100%; margin-top: 15px" v-loading="loading">
        <el-table-column prop="templateName" label="模板名称" min-width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.templateName }}</span>
            <el-tag v-if="scope.row.isDefault" size="mini" type="success" effect="dark" style="margin-left: 10px">默认</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="updateBy" label="更新人" width="120" align="center"></el-table-column>
        <el-table-column prop="gmtModified" label="更新时间" width="160" align="center"></el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-popconfirm title="确定删除该模板吗？" @confirm="handleDelete(scope.row)" style="margin-left: 10px">
              <el-button slot="reference" type="text" icon="el-icon-delete" size="mini" class="text-danger">删除</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <template-editor-dialog
        v-if="dialogVisible"
        :visible.sync="dialogVisible"
        :is-edit="isEdit"
        :current-data="currentData"
        :application-id="applicationId"
        :default-type="activeTab"
        @refresh="getList"
    />
  </div>
</template>

<script>
import { getTemplateList, deleteTemplate } from "@/views/applicationManagement/deployTemplate/api";
import templateEditorDialog from './templateEditorDialog'

export default {
  name: 'templateManage',
  components: { templateEditorDialog },
  props: {
    applicationId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      // 默认选中 Job XML，因为它是最基础的配置
      activeTab: 'JOB_CONFIG_XML',
      dialogVisible: false,
      isEdit: false,
      currentData: {}
    }
  },
  computed: {
    filteredList() {
      return this.list.filter(item => item.templateType === this.activeTab)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getTemplateList(this.applicationId).then(res => {
        if (res.code === 200) {
          this.list = res.data || []
        }
        this.loading = false
      }).catch(() => { this.loading = false })
    },
    handleTabClick(tab, event) {
      // 切换 Tab 时无需额外操作，filteredList 会自动计算
    },
    handleAdd() {
      this.isEdit = false
      this.currentData = {}
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.currentData = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    handleDelete(row) {
      deleteTemplate(row.id).then(res => {
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.getList()
        } else {
          this.$message.error(res.message)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.template-manage-container {
  padding: 20px;
  .text-danger { color: #F56C6C; }
}
</style>