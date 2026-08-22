<template>
  <PageContainer title="应用分组" subtitle="管理应用分组配置">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增分组</el-button>
    </template>

    <!-- 筛选区 -->
    <template #filter>
      <FilterBar @search="handleQuery" @reset="resetQuery">
        <el-form-item label="应用分组">
          <el-input
            v-model="queryParams.searchText"
            placeholder="输入编码/名称模糊搜索"
            clearable
            prefix-icon="el-icon-search"
            style="width: 240px;"
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="queryParams.enableStatus" placeholder="全部" clearable style="width: 120px;" size="small">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
      </FilterBar>
    </template>

    <!-- 分组列表 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="applicationGroupList"
        border
        stripe
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="applicationGroupCode" label="分组编码" min-width="120" show-overflow-tooltip />
        <el-table-column prop="applicationGroupName" label="分组名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="enableStatus" label="启用状态" width="120" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.enableStatus"
              :active-value="1"
              :inactive-value="0"
              @change="enableChange($event, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createByName" label="创建人" width="120" align="center" />
        <el-table-column prop="gmtCreate" label="创建时间" width="170" align="center" />
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
          :page-size.sync="queryParams.pageSize"
          :page-sizes="pageSizes"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <FormDialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :loading="submitLoading"
      width="500px"
      @submit="submitForm"
      @cancel="cancelForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
        size="small"
      >
        <el-form-item label="分组编码" prop="applicationGroupCode">
          <el-input v-model="form.applicationGroupCode" placeholder="请输入唯一编码" />
        </el-form-item>
        <el-form-item label="分组名称" prop="applicationGroupName">
          <el-input v-model="form.applicationGroupName" placeholder="请输入显示名称" />
        </el-form-item>
      </el-form>
    </FormDialog>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import FormDialog from '@/components/common/FormDialog.vue'
import { modify, queryPage, add, remove } from '@/views/applicationManagement/applicationGroup/api'

export default {
  name: 'applicationGroup',
  components: {
    PageContainer,
    FilterBar,
    FormDialog
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        searchText: '',
        enableStatus: null
      },
      pageSizes: [10, 20, 50, 100],
      total: 0,
      applicationGroupList: [],
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: undefined,
        applicationGroupCode: '',
        applicationGroupName: '',
        enableStatus: 1
      },
      rules: {
        applicationGroupCode: [
          { required: true, message: '请输入应用分组编码', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        applicationGroupName: [
          { required: true, message: '请输入应用分组名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const params = {
          pageNum: this.queryParams.pageNum,
          pageSize: this.queryParams.pageSize,
          searchText: this.queryParams.searchText,
          enableStatus: this.queryParams.enableStatus !== null ? this.queryParams.enableStatus : undefined
        }
        const res = await queryPage(params)
        if (res.code === 200) {
          const result = res.data
          this.total = result.total || 0
          this.applicationGroupList = result.list || []
        } else {
          this.$message.error(res.message || '查询失败')
        }
      } catch (e) {
        this.$message.error('网络错误')
      } finally {
        this.loading = false
      }
    },

    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    resetQuery() {
      this.queryParams.searchText = ''
      this.queryParams.enableStatus = null
      this.handleQuery()
    },

    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },

    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },

    resetForm() {
      this.form = {
        id: undefined,
        applicationGroupCode: '',
        applicationGroupName: '',
        enableStatus: 1
      }
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })
    },

    handleAdd() {
      this.resetForm()
      this.dialogTitle = '新增应用分组'
      this.dialogVisible = true
    },

    handleEdit(row) {
      this.resetForm()
      this.dialogTitle = '修改应用分组'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },

    cancelForm() {
      this.dialogVisible = false
      this.resetForm()
    },

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            const isEdit = !!this.form.id
            const apiCall = isEdit ? modify : add
            const params = isEdit
              ? { id: this.form.id, applicationGroupCode: this.form.applicationGroupCode, applicationGroupName: this.form.applicationGroupName }
              : { applicationGroupCode: this.form.applicationGroupCode, applicationGroupName: this.form.applicationGroupName, enableStatus: 1 }

            const res = await apiCall(params)
            if (res.code === 200) {
              this.$message.success(isEdit ? '修改成功' : '添加成功')
              this.dialogVisible = false
              this.getList()
            } else {
              this.$message.error(res.message || '操作失败')
            }
          } catch (e) {
            this.$message.error('请求异常')
          } finally {
            this.submitLoading = false
          }
        }
      })
    },

    handleDelete(id) {
      this.$confirm('此操作将永久删除该应用分组, 是否继续?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await remove(id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    enableChange(newValue, row) {
      const originalStatus = newValue === 1 ? 0 : 1
      modify({ id: row.id, enableStatus: newValue }).then(res => {
        if (res.code === 200) {
          this.$message.success(newValue === 1 ? '已启用' : '已停用')
        } else {
          this.$message.error(res.message || '状态修改失败')
          row.enableStatus = originalStatus
        }
      }).catch(() => {
        this.$message.error('网络错误')
        row.enableStatus = originalStatus
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }
}

.pagination-container {
  padding: @space-4;
  text-align: right;
}

.text-danger {
  color: @error-color;
}
</style>
