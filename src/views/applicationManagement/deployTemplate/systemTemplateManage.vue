<template>
  <div class="app-container" style="padding: 20px;">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-weight: bold; font-size: 16px;">
          <i class="el-icon-s-platform" style="margin-right: 5px;"></i>全局构建模版库
        </span>
        <el-button
            style="float: right;"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="handleAdd">
          新增标准模板
        </el-button>
      </div>

      <el-alert
          title="此处维护的模板为系统级通用标准 (SYSTEM Scope)。新应用创建时，可选择以此为原型初始化其私有配置。"
          type="info"
          show-icon
          style="margin-bottom: 15px;"
          :closable="false">
      </el-alert>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="Jenkins Job配置 (XML)" name="JOB_CONFIG_XML"></el-tab-pane>
        <el-tab-pane label="Jenkinsfile 流水线" name="JENKINSFILE"></el-tab-pane>
        <el-tab-pane label="Dockerfile" name="DOCKERFILE"></el-tab-pane>
      </el-tabs>

      <el-table
          :data="list"
          border
          stripe
          v-loading="loading"
          style="margin-top: 10px;"
          empty-text="暂无系统模板，请点击右上角新增"
      >
        <el-table-column prop="templateName" label="模板名称" min-width="200">
          <template slot-scope="scope">
            <span style="font-weight: 500">{{ scope.row.templateName }}</span>
            <el-tag v-if="scope.row.isDefault" size="mini" type="success" effect="dark" style="margin-left: 10px">默认推荐</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="适用场景说明" min-width="300" show-overflow-tooltip></el-table-column>
        <el-table-column prop="gmtModified" label="更新时间" width="160" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-popconfirm title="确定删除该系统模板吗？" @confirm="handleDelete(scope.row)" style="margin-left: 10px">
              <el-button slot="reference" type="text" icon="el-icon-delete" class="text-danger">删除</el-button>
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
        scope="SYSTEM"
        :default-type="activeTab"
        @refresh="getList"
    />
  </div>
</template>

<script>
import { getTemplateList, deleteTemplate } from "@/views/applicationManagement/deployTemplate/api";
import templateEditorDialog from '@/views/applicationManagement/deployTemplate/templateEditorDialog';

export default {
  name: 'systemTemplateManage',
  components: { templateEditorDialog },
  data() {
    return {
      list: [],
      activeTab: 'JOB_CONFIG_XML',
      loading: false,
      dialogVisible: false,
      isEdit: false,
      currentData: {}
    }
  },
  created() {
    this.getList();
  },
  methods: {
    handleTabClick() {
      this.getList();
    },

    getList() {
      this.loading = true;
      // [修复] 移除 applicationId: 0，仅传递 scope
      const query = {
        scope: 'SYSTEM',
        templateType: this.activeTab
      };

      getTemplateList(query).then(res => {
        if (res.code === 200) {
          this.list = res.data || [];
        }
      }).finally(() => {
        this.loading = false;
      });
    },

    handleAdd() {
      this.isEdit = false;
      this.currentData = {};
      this.dialogVisible = true;
    },

    handleEdit(row) {
      this.isEdit = true;
      // 必须深拷贝，避免污染 Table 数据
      this.currentData = JSON.parse(JSON.stringify(row));
      this.dialogVisible = true;
    },

    handleDelete(row) {
      deleteTemplate(row.id).then(res => {
        if(res.code === 200) {
          this.$message.success('删除成功');
          this.getList();
        } else {
          this.$message.error(res.message);
        }
      });
    }
  }
}
</script>

<style scoped>
.text-danger { color: #F56C6C; }
.text-danger:hover { color: #f78989; }
::v-deep .el-card__header { padding: 15px 20px; border-bottom: 1px solid #ebeef5; }
</style>