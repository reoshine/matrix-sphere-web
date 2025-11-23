<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" :model="queryParams" size="small" @submit.native.prevent>
        <el-form-item label="应用分组">
          <el-input
              v-model="queryParams.searchText"
              placeholder="输入编码/名称模糊搜索"
              clearable
              prefix-icon="el-icon-search"
              @keyup.enter.native="handleQuery"
              style="width: 240px;"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="queryParams.enableStatus" placeholder="全部" clearable style="width: 120px;">
            <el-option
                v-for="item in enableStatusList"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-bar">
      <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增分组</el-button>
    </div>

    <el-card shadow="never" :body-style="{ padding: '0' }" class="table-card">
      <el-table
          v-loading="loading"
          :data="applicationGroupList"
          border
          stripe
          highlight-current-row
          style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />

        <el-table-column prop="applicationGroupCode" label="应用分组编码" min-width="120" show-overflow-tooltip />
        <el-table-column prop="applicationGroupName" label="应用分组名称" min-width="150" show-overflow-tooltip />

        <el-table-column prop="enableStatus" label="启用状态" width="120" align="center">
          <template slot-scope="scope">
            <el-switch
                v-model="scope.row.enableStatus"
                active-value="启用"
                inactive-value="停用"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="enableChange($event, scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="createByName" label="创建人" width="120" align="center" />
        <el-table-column prop="gmtCreate" label="创建时间" width="160" align="center" />

        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" size="small" @click="handleEdit(scope.row)">修改</el-button>
            <el-button type="text" icon="el-icon-delete" size="small" class="text-danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :current-page.sync="queryParams.pageNum"
            :page-size.sync="queryParams.pageCount"
            :page-sizes="pageSizes"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="500px"
        :close-on-click-modal="false"
        append-to-body
    >
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          label-position="right"
          size="small"
          style="padding-right: 20px;"
      >
        <el-form-item label="分组编码" prop="applicationGroupCode">
          <el-input v-model="form.applicationGroupCode" placeholder="请输入唯一编码" />
        </el-form-item>
        <el-form-item label="分组名称" prop="applicationGroupName">
          <el-input v-model="form.applicationGroupName" placeholder="请输入显示名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancelForm">取 消</el-button>
        <el-button size="small" type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { modifyById, queryPage, add, removeById } from "@/views/applicationManagement/applicationGroup/api";

export default {
  name: "applicationGroup",
  data() {
    return {
      // 页面状态
      loading: false,
      submitLoading: false,

      // 搜索参数（整合到一个对象中）
      queryParams: {
        pageNum: 1,
        pageCount: 10,
        searchText: '',
        enableStatus: '' // 默认为空，代表查询所有
      },
      pageSizes: [10, 20, 50, 100],
      total: 0,

      // 字典数据
      enableStatusList: ['启用', '停用'],

      // 表格数据
      applicationGroupList: [],

      // 弹窗控制
      dialogVisible: false,
      dialogTitle: '',

      // 表单数据
      form: {
        id: undefined,
        applicationGroupCode: '',
        applicationGroupName: '',
        enableStatus: '启用'
      },

      // 表单校验
      rules: {
        applicationGroupCode: [
          { required: true, message: "请输入应用分组编码", trigger: "blur" },
          { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
        ],
        applicationGroupName: [
          { required: true, message: "请输入应用分组名称", trigger: "blur" },
          { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 获取列表 */
    getList() {
      this.loading = true;
      // 注意：这里修正了原代码中 searchText 传值不一致的问题
      const params = {
        pageNum: this.queryParams.pageNum,
        pageCount: this.queryParams.pageCount,
        searchText: this.queryParams.searchText,
        enableStatus: this.queryParams.enableStatus || undefined // 如果为空字符串则传undefined或后端约定的值
      };

      queryPage(params).then(res => {
        if (res.data.code === 2000) {
          const result = res.data.body;
          this.total = result.total || 0;
          this.applicationGroupList = result.data || [];
        } else {
          this.$message.error(res.data.message || '查询失败');
        }
      }).catch(err => {
        this.$message.error('网络错误：' + err);
      }).finally(() => {
        this.loading = false;
      });
    },

    /** 搜索按钮 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    /** 重置按钮 */
    resetQuery() {
      this.queryParams.searchText = '';
      this.queryParams.enableStatus = '';
      this.handleQuery();
    },

    /** 分页操作 */
    handleSizeChange(val) {
      this.queryParams.pageCount = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.queryParams.pageNum = val;
      this.getList();
    },

    /** 重置表单 */
    resetForm() {
      this.form = {
        id: undefined,
        applicationGroupCode: '',
        applicationGroupName: '',
        enableStatus: '启用'
      };
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate();
      });
    },

    /** 打开新增弹窗 */
    handleAdd() {
      this.resetForm();
      this.dialogTitle = '新增应用分组';
      this.dialogVisible = true;
    },

    /** 打开编辑弹窗 */
    handleEdit(row) {
      this.resetForm();
      this.dialogTitle = '修改应用分组';
      this.form = JSON.parse(JSON.stringify(row)); // 深拷贝
      this.dialogVisible = true;
    },

    /** 取消弹窗 */
    cancelForm() {
      this.dialogVisible = false;
      this.resetForm();
    },

    /** 提交表单 */
    submitForm() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.submitLoading = true;

          // 根据是否有ID判断是新增还是修改
          const isEdit = !!this.form.id;
          const apiCall = isEdit ? modifyById : add;

          // 构建参数 (新增时不需要ID)
          const params = isEdit ? {
            id: this.form.id,
            applicationGroupCode: this.form.applicationGroupCode,
            applicationGroupName: this.form.applicationGroupName
          } : {
            applicationGroupCode: this.form.applicationGroupCode,
            applicationGroupName: this.form.applicationGroupName,
            enableStatus: '启用' // 新增默认启用
          };

          apiCall(params).then(res => {
            if (res.data.code === 2000) {
              this.$message.success(isEdit ? '修改成功' : '添加成功');
              this.dialogVisible = false;
              this.getList();
            } else {
              this.$message.error(res.data.message || '操作失败');
            }
          }).catch(err => {
            this.$message.error('请求异常：' + err);
          }).finally(() => {
            this.submitLoading = false;
          });
        }
      });
    },

    /** 删除操作 */
    handleDelete(id) {
      this.$confirm('此操作将永久删除该应用分组, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeById(id);
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message.success('删除成功');
          this.getList();
        } else {
          this.$message.error(res.data.message || '删除失败');
        }
      }).catch(() => {});
    },

    /** 状态切换 */
    enableChange(newValue, row) {
      // 这里需要注意：如果后端API失败，需要把 Switch 的状态改回去
      const originalStatus = newValue === '启用' ? '停用' : '启用';

      modifyById({
        id: row.id,
        enableStatus: newValue
      }).then(res => {
        if (res.data.code === 2000) {
          this.$message.success(newValue === '启用' ? '已启用' : '已停用');
        } else {
          this.$message.error(res.data.message || '状态修改失败');
          row.enableStatus = originalStatus; // 恢复界面显示
        }
      }).catch(err => {
        this.$message.error('网络错误');
        row.enableStatus = originalStatus; // 恢复界面显示
      });
    }
  }
}
</script>

<style lang="less" scoped>
/* MatrixSphere 标准样式 */
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.filter-container {
  margin-bottom: 15px;
  border: none;
  :deep(.el-card__body) {
    padding-bottom: 0; /* 减少搜索栏底部空白 */
  }
}

.action-bar {
  margin-bottom: 15px;
}

.table-card {
  border: none;
}

.pagination-container {
  padding: 15px 20px;
  background: #fff;
  text-align: right;
  border-top: 1px solid #ebeef5;
}

.text-danger {
  color: #F56C6C;
  &:hover {
    color: #f78989;
  }
}

/* 修复 dialog footer 的对齐 */
.dialog-footer {
  text-align: right;
}
</style>