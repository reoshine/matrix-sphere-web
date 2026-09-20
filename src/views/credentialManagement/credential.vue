<template>
  <PageContainer title="凭据管理" subtitle="集中管理 GitLab 与 Jenkins 访问凭据，密钥始终脱敏展示">
    <template #header-actions>
      <el-button v-authority="'CREDENTIAL_MANAGE'" type="primary" icon="el-icon-plus" size="small" @click="addDialog">新增凭据</el-button>
    </template>

    <template #filter>
      <FilterBar @search="page" @reset="resetFilter">
        <el-form-item label="凭据搜索">
          <el-input v-model="searchText" placeholder="输入凭据名称" prefix-icon="el-icon-search" clearable size="small" style="width: 260px" />
        </el-form-item>
        <el-form-item label="凭据类型">
          <el-select v-model="filterType" placeholder="全部" clearable size="small" style="width: 150px" @change="page">
            <el-option v-for="item in credentialTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </FilterBar>
    </template>

    <div v-if="groupedCredentials.length" class="credential-groups">
      <section v-for="group in groupedCredentials" :key="group.type" class="credential-group">
        <div class="group-header">
          <i :class="getGroupIcon(group.type)" class="group-icon" />
          <span class="group-title">{{ getGroupLabel(group.type) }}</span>
          <el-tag size="mini" type="info" effect="plain">{{ group.items.length }}</el-tag>
        </div>
        <el-table :data="group.items" stripe class="credential-table" @row-click="openDetail">
          <el-table-column prop="name" label="凭据名称" min-width="180">
            <template slot-scope="{ row }"><span class="cred-name">{{ row.name || '-' }}</span></template>
          </el-table-column>
          <el-table-column label="类型" width="110" align="center">
            <template slot-scope="{ row }"><el-tag size="mini" :type="getTypeTagType(row.type)" effect="plain">{{ row.type }}</el-tag></template>
          </el-table-column>
          <el-table-column label="密钥摘要" min-width="150">
            <template slot-scope="{ row }">
              <span v-if="row.mask" class="secret-mask">{{ row.mask }}</span>
              <span v-else class="text-muted">未配置</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag size="mini" :type="row.enabled ? 'success' : 'danger'">{{ row.enabled ? '可用' : '不可用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="有效期" width="170" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.expiresAt" :class="isExpired(row.expiresAt) ? 'text-error' : ''">{{ formatTime(row.expiresAt) }}</span>
              <span v-else class="text-muted">长期有效</span>
            </template>
          </el-table-column>
          <el-table-column label="更新时间" width="170" align="center">
            <template slot-scope="{ row }">{{ formatTime(row.updatedAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template slot-scope="{ row }">
              <el-button v-authority="'CREDENTIAL_MANAGE'" type="text" size="small" icon="el-icon-edit" @click.stop="credentialEdit(row)">编辑</el-button>
              <el-button v-authority="'CREDENTIAL_MANAGE'" type="text" size="small" class="text-danger" icon="el-icon-delete" @click.stop="removeCredential(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>
    <el-empty v-else description="暂无符合条件的凭据" />

    <div v-if="credentialList.length" class="pagination-container">
      <el-pagination background :current-page="pageNum" :page-sizes="pageSizes" :page-size="pageSize" :total="total"
                     layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
    </div>

    <el-drawer :visible.sync="detailDrawerVisible" direction="rtl" size="420px" :title="detailCredential ? detailCredential.name : '凭据详情'">
      <div v-if="detailCredential" class="drawer-content">
        <el-alert title="为保护凭据安全，系统不会返回或展示原始密钥。" type="info" :closable="false" show-icon class="security-alert" />
        <el-descriptions :column="1" border size="medium">
          <el-descriptions-item label="凭据名称">{{ detailCredential.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="凭据类型"><el-tag size="small" :type="getTypeTagType(detailCredential.type)">{{ detailCredential.type }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="密钥摘要"><span class="secret-mask">{{ detailCredential.mask || '未配置' }}</span></el-descriptions-item>
          <el-descriptions-item label="状态">{{ detailCredential.enabled ? '可用' : '不可用' }}</el-descriptions-item>
          <el-descriptions-item label="有效期">{{ formatTime(detailCredential.expiresAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detailCredential.updatedAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>

    <FormDialog :title="credentialForm.id ? '修改凭据' : '新增凭据'" :visible.sync="modifyCredentialDialogVisible"
                width="520px" submit-text="确 定" @submit="saveCredential" @cancel="modifyCredentialDialogVisible = false">
      <el-form ref="credentialForm" :model="credentialForm" :rules="credentialRules" label-position="top" size="medium">
        <el-form-item label="凭据类型" prop="type">
          <el-select v-model="credentialForm.type" :disabled="Boolean(credentialForm.id)" placeholder="请选择类型" style="width: 100%">
            <el-option v-for="item in credentialTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="凭据名称" prop="name"><el-input v-model="credentialForm.name" placeholder="输入便于识别的名称" /></el-form-item>
        <template v-if="!credentialForm.id">
          <el-form-item label="服务地址" prop="url"><el-input v-model="credentialForm.url" placeholder="例如：https://gitlab.example.com" /></el-form-item>
          <el-form-item v-if="credentialForm.type === 'jenkins'" label="用户名" prop="username">
            <el-input v-model="credentialForm.username" autocomplete="off" placeholder="Jenkins 用户名" />
          </el-form-item>
        </template>
        <el-form-item :label="credentialForm.id ? '轮换密钥' : '访问密钥'" prop="secret">
          <el-input v-model="credentialForm.secret" type="password" show-password autocomplete="new-password"
                    :placeholder="credentialForm.id ? '留空表示不轮换' : '请输入访问 Token 或密码'" />
          <div v-if="credentialForm.id" class="field-helper">当前密钥不会回显；仅在填写新值后才会执行轮换。</div>
        </el-form-item>
        <el-form-item v-if="credentialForm.type === 'gitlab'" label="有效期" prop="expiresAt">
          <el-date-picker v-model="credentialForm.expiresAt" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="不选择表示长期有效" style="width: 100%" />
        </el-form-item>
      </el-form>
    </FormDialog>
  </PageContainer>
</template>

<script>
import { create, getById, modify, page, remove } from '@/views/credentialManagement/api'
import PageContainer from '@/components/common/PageContainer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import FormDialog from '@/components/common/FormDialog.vue'

function emptyCredentialForm() {
  return { id: null, name: '', type: '', url: '', username: '', secret: '', expiresAt: '' }
}

export default {
  name: 'credential',
  components: { PageContainer, FilterBar, FormDialog },
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageSize: 20,
      pageSizes: [20, 50, 100],
      searchText: '',
      filterType: '',
      credentialList: [],
      detailDrawerVisible: false,
      detailCredential: null,
      modifyCredentialDialogVisible: false,
      credentialForm: emptyCredentialForm(),
      credentialRules: {
        type: [{ required: true, message: '请选择凭据类型', trigger: 'change' }],
        name: [{ required: true, whitespace: true, message: '请输入凭据名称', trigger: 'blur' }],
        url: [{ required: true, message: '请输入服务地址', trigger: 'blur' }, { type: 'url', message: '请输入正确的 URL', trigger: 'blur' }],
        secret: [{ validator: this.validateSecret, trigger: 'blur' }]
      },
      credentialTypeList: [{ label: 'GitLab', value: 'gitlab' }, { label: 'Jenkins', value: 'jenkins' }]
    }
  },
  computed: {
    groupedCredentials() {
      const keyword = this.searchText.trim().toLowerCase()
      const groups = {}
      this.credentialList.filter(item => !keyword || String(item.name || '').toLowerCase().includes(keyword)).forEach(item => {
        const type = item.type || 'other'
        if (!groups[type]) groups[type] = []
        groups[type].push(item)
      })
      return Object.keys(groups).map(type => ({ type, items: groups[type] }))
    }
  },
  created() { this.page() },
  methods: {
    validateSecret(rule, value, callback) {
      if (!this.credentialForm.id && !String(value || '').trim()) return callback(new Error('新增凭据时必须填写访问密钥'))
      callback()
    },
    handleCurrentChange(pageNum) { this.pageNum = pageNum; this.page() },
    handleSizeChange(pageSize) { this.pageSize = pageSize; this.pageNum = 1; this.page() },
    async page() {
      try {
        const res = await page({ pageNum: this.pageNum, pageSize: this.pageSize, credentialType: this.filterType || null })
        if (res.code === 200) {
          const result = res.data || {}
          this.total = Number(result.total || 0)
          this.credentialList = result.list || result.data || []
        }
      } catch (error) { this.$message.error(`查询失败：${error.message || error}`) }
    },
    resetFilter() { this.searchText = ''; this.filterType = ''; this.pageNum = 1; this.page() },
    addDialog() {
      this.credentialForm = emptyCredentialForm()
      this.modifyCredentialDialogVisible = true
      this.$nextTick(() => this.$refs.credentialForm && this.$refs.credentialForm.clearValidate())
    },
    credentialEdit(credential) {
      this.credentialForm = { ...emptyCredentialForm(), id: credential.id, name: credential.name, type: credential.type,
        expiresAt: credential.expiresAt ? this.formatTime(credential.expiresAt) : '' }
      this.modifyCredentialDialogVisible = true
      this.$nextTick(() => this.$refs.credentialForm && this.$refs.credentialForm.clearValidate())
    },
    saveCredential() {
      this.$refs.credentialForm.validate(async valid => {
        if (!valid) return
        const form = this.credentialForm
        const request = { id: form.id, name: form.name.trim(), type: form.type, url: form.url ? form.url.trim() : null,
          username: form.username ? form.username.trim() : null, secret: form.secret ? form.secret.trim() : null,
          expiresAt: form.expiresAt ? form.expiresAt.replace(' ', 'T') : null }
        try {
          const res = await (form.id ? modify(request) : create(request))
          if (res.code === 200) { this.$message.success(form.id ? '凭据已更新' : '凭据已创建'); this.modifyCredentialDialogVisible = false; this.page() }
        } catch (error) { this.$message.error(`操作失败：${error.message || error}`) }
      })
    },
    async openDetail(row) {
      try {
        const res = await getById(row.id)
        if (res.code === 200) { this.detailCredential = res.data; this.detailDrawerVisible = true }
      } catch (error) { this.$message.error(`详情加载失败：${error.message || error}`) }
    },
    removeCredential(row) {
      this.$confirm(`确认删除凭据“${row.name}”吗？`, '删除确认', { type: 'warning' }).then(async () => {
        try {
          const res = await remove(row.id)
          if (res.code === 200) { this.$message.success('凭据已删除'); this.page() }
        } catch (error) { this.$message.error(`删除失败：${error.message || error}`) }
      }).catch(() => {})
    },
    getGroupIcon(type) { return ({ gitlab: 'el-icon-connection', jenkins: 'el-icon-s-cooperation' })[type] || 'el-icon-key' },
    getGroupLabel(type) { return ({ gitlab: 'GitLab 凭据', jenkins: 'Jenkins 凭据' })[type] || `${type} 凭据` },
    getTypeTagType(type) { return ({ gitlab: 'warning', jenkins: 'primary' })[type] || 'info' },
    formatTime(time) { return time ? String(time).replace('T', ' ') : '-' },
    isExpired(time) { return Boolean(time) && new Date(time) < new Date() }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";
.credential-groups { display: flex; flex-direction: column; gap: @space-5; }
.credential-group { overflow: hidden; background: @bg-footer; border: 1px solid @border-color-light; border-radius: @border-radius; }
.group-header { display: flex; align-items: center; gap: @space-2; padding: @space-3 @space-4; background: @bg-content; border-bottom: 1px solid @border-color-light; }
.group-icon { color: @primary-color; font-size: @font-size-lg; }
.group-title { color: @text-primary; font-size: @font-size-sm; font-weight: 600; }
.cred-name { color: @text-primary; font-weight: 500; }
.secret-mask { color: @text-secondary; font-family: @font-mono; letter-spacing: 0.04em; }
.text-muted { color: @text-tertiary; }
.text-error, .text-danger { color: @error-color !important; }
.credential-table /deep/ .el-table__header th { background-color: @bg-content; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: @space-5; }
.drawer-content { padding: 0 @space-5; }
.security-alert { margin-bottom: @space-4; }
.field-helper { min-height: 20px; margin-top: @space-1; color: @text-tertiary; font-size: @font-size-xs; line-height: 1.5; }
</style>
