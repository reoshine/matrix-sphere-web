<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" :model="queryParams" size="small" @submit.native.prevent>
        <el-form-item label="服务器名称">
          <el-input
              v-model="queryParams.name"
              placeholder="请输入名称"
              clearable
              @keyup.enter.native="handleQuery"
              prefix-icon="el-icon-search"
          />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input
              v-model="queryParams.ip"
              placeholder="精确匹配"
              clearable
              prefix-icon="el-icon-location-outline"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-bar">
      <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">接入服务器</el-button>
      <el-button
          type="danger"
          icon="el-icon-delete"
          size="small"
          plain
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
      >批量下线</el-button>
    </div>

    <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="状态" width="120" align="center">
        <template slot-scope="scope">
          <el-tag
              :type="scope.row.status === 1 ? 'success' : 'danger'"
              effect="dark"
              size="small"
              class="status-tag"
          >
            <span class="status-dot" :class="{ 'online': scope.row.status === 1 }"></span>
            {{ scope.row.status === 1 ? '运行中' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="服务器名称" prop="name" min-width="150" show-overflow-tooltip />
      <el-table-column label="主机 IP" prop="ip" width="140" />
      <el-table-column label="SSH端口" prop="port" width="100" align="center" />

      <el-table-column label="创建时间" prop="createTime" width="160" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="280" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-edit" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" icon="el-icon-monitor" size="small" class="text-success" @click="handleTerminal(scope.row)">WebSSH</el-button>
          <el-button type="text" icon="el-icon-delete" size="small" class="text-danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :current-page.sync="queryParams.pageNum"
          :page-size.sync="queryParams.pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <el-drawer
        :title="dialogTitle"
        :visible.sync="drawerVisible"
        direction="rtl"
        size="500px"
        :wrapperClosable="false"
    >
      <div class="drawer-content">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px" label-position="top">

          <div class="section-title">基础信息</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="服务器名称" prop="name">
                <el-input v-model="form.name" placeholder="例如: 生产环境-DB-01" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="主机 IP" prop="ip">
                <el-input v-model="form.ip" placeholder="192.168.x.x" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="SSH 端口" prop="port">
                <el-input-number v-model="form.port" :min="1" :max="65535" style="width: 100%" controls-position="right"/>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="section-title" style="margin-top: 20px">认证配置</div>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="root" />
          </el-form-item>

          <el-form-item label="认证方式">
            <el-radio-group v-model="form.authType">
              <el-radio label="PASSWORD">密码认证</el-radio>
              <el-radio label="KEY">密钥认证</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.authType === 'PASSWORD'" label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入SSH密码" />
          </el-form-item>

          <el-form-item v-else label="私钥内容" prop="privateKey">
            <el-input v-model="form.privateKey" type="textarea" :rows="4" placeholder="-----BEGIN RSA PRIVATE KEY-----" />
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="2" />
          </el-form-item>
        </el-form>

        <div class="drawer-footer">
          <el-button type="warning" plain :loading="testing" icon="el-icon-connection" @click="handleTestConnection">测试连接</el-button>
          <div>
            <el-button @click="drawerVisible = false">取 消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
// 引入 API
import {
  getServerList,
  addServer,
  updateServer,
  deleteServer,
  testServerConnection
} from './api'

export default {
  name: "serverManagement",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 提交状态
      submitLoading: false,
      // 测试连接状态
      testing: false,
      // 选中数组
      selectedIds: [],
      // 表格数据
      tableData: [],
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        ip: undefined
      },
      // 抽屉显示
      drawerVisible: false,
      // 抽屉标题
      dialogTitle: '',
      // 表单参数
      form: {
        id: undefined,
        name: '',
        ip: '',
        port: 22,
        username: 'root',
        authType: 'PASSWORD', // PASSWORD or KEY
        password: '',
        privateKey: '',
        remark: ''
      },
      // 表单校验
      rules: {
        name: [{required: true, message: "服务器名称不能为空", trigger: "blur"}],
        ip: [
          {required: true, message: "主机IP不能为空", trigger: "blur"},
          // 简单的IP校验正则
          {
            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
            message: "IP地址格式不正确",
            trigger: "blur"
          }
        ],
        username: [{required: true, message: "用户名不能为空", trigger: "blur"}],
        password: [{required: false, trigger: "blur"}], // 根据逻辑动态校验
        port: [{required: true, message: "端口不能为空", trigger: "blur"}]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询服务器列表 */
    getList() {
      this.loading = true;
      getServerList(this.queryParams).then(response => {
        if (response.code === 200) {
          this.tableData = response.data || [];
          this.total = this.tableData.length;
        } else {
          this.$message.error(response.message || '获取数据失败');
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.name = '';
      this.queryParams.ip = '';
      this.handleQuery();
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.selectedIds = selection.map(item => item.id);
    },
    /** 分页大小改变 */
    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.getList();
    },
    /** 当前页改变 */
    handleCurrentChange(val) {
      this.queryParams.pageNum = val;
      this.getList();
    },
    /** 表单重置 */
    resetForm() {
      this.form = {
        id: undefined,
        name: '',
        ip: '',
        port: 22,
        username: 'root',
        authType: 'PASSWORD',
        password: '',
        privateKey: '',
        remark: ''
      };
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate();
        }
      });
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.resetForm();
      this.dialogTitle = "接入新服务器";
      this.drawerVisible = true;
    },
    /** 修改按钮操作 */
    handleEdit(row) {
      this.resetForm();
      // 深拷贝防止修改表单时影响表格显示
      this.form = JSON.parse(JSON.stringify(row));
      // 确保默认值
      if (!this.form.authType) this.form.authType = 'PASSWORD';
      this.dialogTitle = "编辑服务器配置";
      this.drawerVisible = true;
    },
    /** 测试连接 */
    handleTestConnection() {
      this.$refs.form.validateField(['ip', 'port', 'username'], (errMsg) => {
        if (errMsg) return; // 如果基础字段校验失败则不测试

        this.testing = true;
        testServerConnection(this.form).then(response => {
          if (response.code === 200) {
            this.$message.success(response.data ? '连接测试成功' : '连接测试失败');
          } else {
            this.$message.warning(response.message || '连接测试失败');
          }
          this.testing = false;
        }).catch(() => {
          this.testing = false;
        });
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.id) {
            updateServer(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success("修改成功");
                this.drawerVisible = false;
                this.getList();
              } else {
                this.$message.error(response.message || "修改失败");
              }
              this.submitLoading = false;
            }).catch(() => {
              this.submitLoading = false;
            });
          } else {
            addServer(this.form).then(response => {
              if (response.code === 200) {
                this.$message.success("接入成功");
                this.drawerVisible = false;
                this.getList();
              } else {
                this.$message.error(response.message || "接入失败");
              }
              this.submitLoading = false;
            }).catch(() => {
              this.submitLoading = false;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id;
      this.$confirm(`是否确认下线服务器 "${row.name}" ?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return deleteServer(ids);
      }).then(response => {
        if (response.code === 200) {
          this.getList();
          this.$message.success("删除成功");
        } else {
          this.$message.error(response.message);
        }
      }).catch(() => {
      });
    },
    /** 批量删除 */
    handleBatchDelete() {
      const ids = this.selectedIds.join(',');
      this.$confirm('是否确认下线选中的服务器节点?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return deleteServer(ids);
      }).then(response => {
        if (response.code === 200) {
          this.getList();
          this.$message.success("删除成功");
        }
      }).catch(() => {
      });
    },
    /** WebSSH 跳转 (预留) */
    handleTerminal(row) {
      // this.$router.push(`/ops/terminal?id=${row.id}`);
      this.$message.info(`正在连接至 ${row.ip} ...`);
    },
    // 时间格式化简易版，建议使用 dayjs 或 moment
    parseTime(time) {
      if (!time) return '';
      return time.replace('T', ' ');
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5; /* 浅灰色背景，增强对比度 */
  min-height: calc(100vh - 84px);
}

.filter-container {
  margin-bottom: 15px;
  border: none; /* 去除边框，更现代 */
}

.action-bar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

/* MatrixSphere 风格状态灯 */
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #909399; /* 默认灰色 */
  margin-right: 5px;
  vertical-align: middle;
}

.status-dot.online {
  background-color: #ffffff;
  box-shadow: 0 0 4px #ffffff; /* 发光效果 */
}

/* 文本颜色辅助类 */
.text-success {
  color: #67C23A;
}

.text-danger {
  color: #F56C6C;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
  background: #fff;
  padding: 10px 0;
}

/* 抽屉内部样式 */
.drawer-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-content form {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px; /* 避免滚动条遮挡 */
}

.drawer-footer {
  border-top: 1px solid #e8e8e8;
  padding: 15px 0 0;
  display: flex;
  justify-content: space-between;
  background: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  line-height: 1;
}
</style>