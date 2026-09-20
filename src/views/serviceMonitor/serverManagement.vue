<template>
  <div class="server-management">
    <el-card class="filter-container" shadow="never">
      <el-form :inline="true" :model="queryParams" size="small" @submit.native.prevent>
        <el-form-item label="服务器名称">
          <el-input
              v-model="queryParams.searchText"
              placeholder="请输入服务器名称"
              clearable
              @keyup.enter.native="handleQuery"
              prefix-icon="el-icon-search"
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

      <el-table-column label="服务器名称" prop="serverName" min-width="150" show-overflow-tooltip />
      <el-table-column label="主机 IP" prop="ipAddress" width="150" />
      <el-table-column label="SSH端口" prop="port" width="100" align="center" />
      <el-table-column label="认证方式" width="130" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.authType === 2 ? 'SSH 密钥' : '密码' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="description" min-width="180" show-overflow-tooltip />

      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-edit" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" icon="el-icon-delete" size="small" class="text-danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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
              <el-form-item label="服务器名称" prop="serverName">
                <el-input v-model="form.serverName" placeholder="例如：生产环境-DB-01" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="主机 IP" prop="ipAddress">
                <el-input v-model="form.ipAddress" placeholder="192.168.x.x" />
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

          <el-form-item label="认证方式" prop="authType">
            <el-radio-group v-model="form.authType" @change="handleAuthTypeChange">
              <el-radio label="PASSWORD">密码认证</el-radio>
              <el-radio label="PRIVATE_KEY">密钥认证</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.authType === 'PASSWORD'" label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入SSH密码" />
            <div v-if="form.id" class="field-helper">密码不会回显，保存修改时请重新输入。</div>
          </el-form-item>

          <el-form-item v-else label="服务器私钥路径" prop="privateKeyPath">
            <el-input v-model="form.privateKeyPath" placeholder="例如：/etc/matrix-sphere/keys/id_rsa" />
            <div class="field-helper">
              仅填写后端服务器可访问的文件路径，不要粘贴私钥正文。
              <span v-if="form.id && form.privateKeyConfigured">原配置已隐藏，保存修改时请重新填写。</span>
            </div>
          </el-form-item>

          <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="2" maxlength="500" show-word-limit />
          </el-form-item>
        </el-form>

        <div class="drawer-footer">
          <el-tooltip content="连接测试能力将在 M1 阶段启用" placement="top">
            <span class="unavailable-action">
              <el-button type="warning" plain icon="el-icon-connection" disabled>测试连接</el-button>
            </span>
          </el-tooltip>
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
import {
  getServerList,
  getServerDetail,
  addServer,
  updateServer,
  deleteServer
} from './api'

const AUTH_TYPE = Object.freeze({
  PASSWORD: 1,
  PRIVATE_KEY: 2
})

function createDefaultForm() {
  return {
    id: undefined,
    serverName: '',
    ipAddress: '',
    port: 22,
    username: 'root',
    authType: 'PASSWORD',
    password: '',
    privateKeyPath: '',
    privateKeyConfigured: false,
    description: ''
  }
}

export default {
  name: "serverManagement",
  data() {
    const validatePassword = (rule, value, callback) => {
      if (this.form.authType === 'PASSWORD' && !value) {
        callback(new Error('密码认证必须填写登录密码'))
        return
      }
      callback()
    }
    const validatePrivateKeyPath = (rule, value, callback) => {
      if (this.form.authType === 'PRIVATE_KEY' && !value) {
        callback(new Error('密钥认证必须填写服务器私钥路径'))
        return
      }
      callback()
    }
    return {
      loading: true,
      submitLoading: false,
      selectedIds: [],
      tableData: [],
      queryParams: {
        searchText: ''
      },
      drawerVisible: false,
      dialogTitle: '',
      form: createDefaultForm(),
      rules: {
        serverName: [{required: true, message: "服务器名称不能为空", trigger: "blur"}],
        ipAddress: [
          {required: true, message: "主机IP不能为空", trigger: "blur"},
          {
            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
            message: "IP地址格式不正确",
            trigger: "blur"
          }
        ],
        username: [{required: true, message: "用户名不能为空", trigger: "blur"}],
        authType: [{required: true, message: "请选择认证方式", trigger: "change"}],
        password: [{validator: validatePassword, trigger: "blur"}],
        privateKeyPath: [{validator: validatePrivateKeyPath, trigger: "blur"}],
        port: [{required: true, message: "端口不能为空", trigger: "change"}]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getServerList(this.queryParams).then(response => {
        if (response.code === 200) {
          this.tableData = response.data || []
        } else {
          this.$message.error(response.message || '获取数据失败')
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.getList()
    },
    resetQuery() {
      this.queryParams.searchText = ''
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.selectedIds = selection.map(item => item.id)
    },
    resetForm() {
      this.form = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    handleAdd() {
      this.resetForm()
      this.dialogTitle = "接入新服务器"
      this.drawerVisible = true
    },
    handleEdit(row) {
      this.resetForm()
      this.loading = true
      getServerDetail(row.id).then(response => {
        if (response.code !== 200 || !response.data) {
          this.$message.error(response.message || '获取服务器详情失败')
          return
        }
        const detail = response.data
        this.form = {
          id: detail.id,
          serverName: detail.serverName || '',
          ipAddress: detail.ipAddress || '',
          port: detail.port || 22,
          username: detail.username || 'root',
          authType: detail.authType === AUTH_TYPE.PRIVATE_KEY ? 'PRIVATE_KEY' : 'PASSWORD',
          password: '',
          privateKeyPath: '',
          privateKeyConfigured: Boolean(detail.privateKeyConfigured),
          description: detail.description || ''
        }
        this.dialogTitle = "编辑服务器配置"
        this.drawerVisible = true
      }).finally(() => {
        this.loading = false
      })
    },
    handleAuthTypeChange() {
      if (this.form.authType === 'PASSWORD') {
        this.form.privateKeyPath = ''
      } else {
        this.form.password = ''
      }
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate(['password', 'privateKeyPath']))
    },
    buildRequestPayload() {
      const payload = {
        serverName: this.form.serverName.trim(),
        ipAddress: this.form.ipAddress.trim(),
        port: this.form.port,
        username: this.form.username.trim(),
        authType: AUTH_TYPE[this.form.authType],
        description: this.form.description ? this.form.description.trim() : ''
      }
      if (this.form.id) payload.id = this.form.id
      if (this.form.authType === 'PASSWORD') {
        payload.password = this.form.password
      } else {
        payload.privateKeyPath = this.form.privateKeyPath.trim()
      }
      return payload
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return

        this.submitLoading = true
        const request = this.form.id ? updateServer : addServer
        request(this.buildRequestPayload()).then(response => {
          if (response.code === 200) {
            this.$message.success(this.form.id ? "修改成功" : "接入成功")
            this.drawerVisible = false
            this.getList()
          } else {
            this.$message.error(response.message || (this.form.id ? "修改失败" : "接入失败"))
          }
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    handleDelete(row) {
      const ids = row.id
      this.$confirm(`是否确认下线服务器 "${row.serverName}"？`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return deleteServer(ids)
      }).then(response => {
        if (response.code === 200) {
          this.getList()
          this.$message.success("删除成功")
        } else {
          this.$message.error(response.message)
        }
      }).catch(() => {
      })
    },
    handleBatchDelete() {
      const ids = this.selectedIds.join(',')
      this.$confirm('是否确认下线选中的服务器节点?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return deleteServer(ids)
      }).then(response => {
        if (response.code === 200) {
          this.getList()
          this.$message.success("删除成功")
        }
      }).catch(() => {
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 15px;
  border: none;
}

.action-bar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-text-tertiary);
  margin-right: 5px;
  vertical-align: middle;
}

.status-dot.online {
  background-color: var(--color-success);
  box-shadow: none;
}

.text-danger {
  color: var(--color-error);
}

.unavailable-action {
  display: inline-block;
  cursor: not-allowed;
}

.unavailable-action + .text-danger {
  margin-left: 10px;
}

.field-helper {
  margin-top: 6px;
  color: var(--color-text-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.drawer-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-content form {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.drawer-footer {
  border-top: 1px solid var(--color-border);
  padding: 15px 0 0;
  display: flex;
  justify-content: space-between;
  background: var(--color-bg-surface);
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid var(--color-primary);
  line-height: 1;
}
</style>
