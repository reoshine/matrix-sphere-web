<template>
  <PageContainer title="凭据管理" subtitle="管理 Git、服务器、Docker Registry 等凭据">
    <template #header-actions>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="addDialog">新增凭据</el-button>
    </template>

    <template #filter>
      <FilterBar @search="page" @reset="searchText = ''; page()">
        <el-form-item label="凭据搜索">
          <el-input
              v-model="searchText"
              placeholder="输入凭据名称/描述"
              prefix-icon="el-icon-search"
              clearable
              style="width: 300px;"
              size="small"
              @keyup.enter.native="page"
          />
        </el-form-item>
        <el-form-item label="凭据类型">
          <el-select v-model="filterType" placeholder="全部" clearable style="width: 150px;" size="small" @change="page">
            <el-option v-for="item in credentialTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </FilterBar>
    </template>

    <!-- 按类型分组展示 -->
    <div v-if="groupedCredentials.length > 0" class="credential-groups">
      <div v-for="group in groupedCredentials" :key="group.type" class="credential-group">
        <div class="group-header">
          <i :class="getGroupIcon(group.type)" class="group-icon"></i>
          <span class="group-title">{{ getGroupLabel(group.type) }}</span>
          <el-tag size="mini" type="info" effect="plain">{{ group.items.length }}</el-tag>
        </div>

        <el-table
            :data="group.items"
            stripe
            style="width: 100%"
            class="credential-table"
            @row-click="openDetail"
        >
          <el-table-column prop="credentialDesc" label="凭据名称" min-width="160">
            <template slot-scope="{ row }">
              <span class="cred-name">{{ row.credentialDesc || row.config.credentialName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100" align="center">
            <template slot-scope="{ row }">
              <el-tag size="mini" :type="getTypeTagType(row.credentialType)" effect="plain">
                {{ row.credentialType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="URL" min-width="200" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <span v-if="row.config.url" class="cred-url">{{ row.config.url }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="用户名" width="120">
            <template slot-scope="{ row }">
              <span v-if="row.config.user">{{ row.config.user }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="Token/密码" width="140">
            <template slot-scope="{ row }">
              <template v-if="row.config.token">
                <span v-if="!row._showToken" class="token-hidden" @click.stop="toggleToken(row)">
                  •••••••• <i class="el-icon-view"></i>
                </span>
                <span v-else class="token-revealed" @click.stop="toggleToken(row)">
                  {{ row.config.token }} <i class="el-icon-hide"></i>
                </span>
              </template>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="有效期" width="160" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.config.expiresAt" :class="isExpired(row.config.expiresAt) ? 'text-error' : ''">
                {{ formatTime(row.config.expiresAt) }}
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template slot-scope="{ row }">
              <el-button type="text" size="small" icon="el-icon-edit" @click.stop="credentialEdit(row)">编辑</el-button>
              <el-button type="text" size="small" class="text-danger" icon="el-icon-delete" @click.stop="removeCredential(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-empty v-else description="暂无凭据数据，请点击新增" />

    <!-- 分页 -->
    <div class="pagination-container" v-if="credentialList.length > 0">
      <el-pagination
          background
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pageNum"
          :page-sizes="pageSizes"
          :page-size="pageCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>

    <!-- 凭据详情抽屉 -->
    <el-drawer
        :visible.sync="detailDrawerVisible"
        direction="rtl"
        size="450px"
        :with-header="true"
        :title="detailCredential ? (detailCredential.credentialDesc || '凭据详情') : '凭据详情'"
    >
      <div class="drawer-content" v-if="detailCredential">
        <el-descriptions :column="1" border size="medium">
          <el-descriptions-item label="凭据类型">
            <el-tag size="small" :type="getTypeTagType(detailCredential.credentialType)">
              {{ detailCredential.credentialType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="凭据名称">
            {{ detailCredential.config.credentialName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ detailCredential.credentialDesc || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="URL">
            <el-link v-if="detailCredential.config.url" type="primary" :href="detailCredential.config.url" target="_blank" :underline="false">
              {{ detailCredential.config.url }}
            </el-link>
            <span v-else class="text-muted">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ detailCredential.config.user || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="Token/密码">
            <span v-if="detailCredential.config.token">
              <span v-if="!detailDrawer._showToken" class="token-hidden" @click="detailDrawer._showToken = true">
                •••••••• <i class="el-icon-view"></i>
              </span>
              <span v-else class="token-revealed" @click="detailDrawer._showToken = false">
                {{ detailCredential.config.token }} <i class="el-icon-hide"></i>
              </span>
            </span>
            <span v-else class="text-muted">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="有效期">
            <span v-if="detailCredential.config.expiresAt" :class="isExpired(detailCredential.config.expiresAt) ? 'text-error' : ''">
              {{ formatTime(detailCredential.config.expiresAt) }}
            </span>
            <span v-else class="text-muted">-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>

    <!-- 新增/编辑弹窗 -->
    <FormDialog
        :title="modifyCredentialInfoForm.id ? '修改凭据' : '新增凭据'"
        :visible.sync="modifyCredentialDialogVisible"
        width="520px"
        submit-text="确 定"
        @submit="modifyCredential"
        @cancel="cancelCredential"
    >
      <el-form
          :model="modifyCredentialInfoForm"
          :rules="modifyCredentialRules"
          ref="modifyCredentialRef"
          label-position="top"
          size="medium"
      >
        <el-form-item label="凭据类型" prop="credentialType">
          <el-select style="width: 100%" v-model="modifyCredentialInfoForm.credentialType" placeholder="请选择类型">
            <el-option
                v-for="item in credentialTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-divider content-position="center">配置详情</el-divider>

        <el-form-item label="URL 地址" prop="config.url">
          <el-input v-model="modifyCredentialInfoForm.config.url" placeholder="例如: http://192.168.1.100" />
        </el-form-item>
        <el-form-item label="凭据名称" prop="config.credentialName">
          <el-input v-model="modifyCredentialInfoForm.config.credentialName" placeholder="输入名称标识" />
        </el-form-item>
        <el-form-item label="凭据描述" prop="config.credentialDesc">
          <el-input type="textarea" :rows="2" v-model="modifyCredentialInfoForm.config.credentialDesc" placeholder="用途描述" />
        </el-form-item>
        <el-form-item label="用户名" prop="config.user">
          <el-input v-model="modifyCredentialInfoForm.config.user" placeholder="Username" />
        </el-form-item>
        <el-form-item label="Access Token" prop="config.token">
          <el-input v-model="modifyCredentialInfoForm.config.token" show-password placeholder="请输入 Token" />
        </el-form-item>
        <el-form-item label="有效期" prop="config.expiresAt">
          <el-date-picker
              style="width: 100%"
              v-model="modifyCredentialInfoForm.config.expiresAt"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择有效期"
          />
        </el-form-item>
      </el-form>
    </FormDialog>
  </PageContainer>
</template>

<script>
import { page, create, modify, remove } from '@/views/credentialManagement/api'
import PageContainer from '@/components/common/PageContainer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import FormDialog from '@/components/common/FormDialog.vue'

export default {
  name: 'credential',
  components: {
    PageContainer,
    FilterBar,
    FormDialog
  },
  data() {
    return {
      total: 0,
      pageNum: 1,
      pageCount: 20,
      pageSizes: [20, 50, 100],

      searchText: '',
      filterType: '',
      credentialList: [],

      // 详情抽屉
      detailDrawerVisible: false,
      detailCredential: null,
      detailDrawer: { _showToken: false },

      // 表单
      modifyCredentialInfoForm: {
        id: '',
        credentialType: '',
        config: { user: '', url: '', token: '', credentialName: '', credentialDesc: '', expiresAt: '' },
        credentialDesc: ''
      },
      modifyCredentialDialogVisible: false,

      modifyCredentialRules: {
        credentialType: [
          { required: true, message: '请选择凭据类型', trigger: 'change' }
        ],
        'config.url': [
          { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
        ]
      },

      credentialTypeList: [
        { label: 'Gitlab', value: 'gitlab' },
        { label: 'Jenkins', value: 'jenkins' }
      ]
    }
  },
  computed: {
    groupedCredentials() {
      const groups = {}
      this.credentialList.forEach(item => {
        const type = item.credentialType || '其他'
        if (!groups[type]) {
          groups[type] = []
        }
        groups[type].push(item)
      })
      return Object.keys(groups).map(type => ({
        type,
        items: groups[type]
      }))
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.pageNum = val
      this.page()
    },

    handleSizeChange(val) {
      this.pageCount = val
      this.page()
    },

    page() {
      page({
        pageNum: this.pageNum,
        pageCount: this.pageCount,
        searchText: this.searchText
      }).then(res => {
        if (res.code === 200) {
          const result = res.data
          this.total = result.total
          this.credentialList = (result.list || result.data || []).map(item => {
            if (item.credentialConfig) {
              try {
                item.config = JSON.parse(item.credentialConfig)
              } catch (e) {
                item.config = {}
              }
            } else {
              item.config = {}
            }
            item._showToken = false
            return item
          })
        }
      }).catch(err => {
        this.$message.error('查询失败：' + err)
      })
    },

    addDialog() {
      this.modifyCredentialInfoForm = {
        id: '',
        credentialType: '',
        config: { user: '', url: '', token: '', credentialName: '', credentialDesc: '', expiresAt: '' },
        credentialDesc: ''
      }
      this.modifyCredentialDialogVisible = true
      this.$nextTick(() => {
        this.$refs.modifyCredentialRef && this.$refs.modifyCredentialRef.clearValidate()
      })
    },

    credentialEdit(credential) {
      this.modifyCredentialInfoForm = {
        id: credential.id,
        credentialType: credential.credentialType,
        credentialDesc: credential.credentialDesc,
        config: credential.config ? JSON.parse(JSON.stringify(credential.config)) : { user: '', url: '', token: '', credentialName: '', credentialDesc: '', expiresAt: '' }
      }
      this.modifyCredentialDialogVisible = true
    },

    modifyCredential() {
      this.$refs.modifyCredentialRef.validate(valid => {
        if (valid) {
          const form = this.modifyCredentialInfoForm
          const requestData = {
            id: form.id || null,
            credentialType: form.credentialType,
            credentialDesc: form.credentialDesc,
            credentialConfig: form.config ? JSON.stringify(form.config) : null
          }

          const apiCall = form.id ? modify(requestData) : create(requestData)
          apiCall.then(res => {
            if (res.code === 200) {
              this.$message.success(form.id ? '修改成功' : '新增成功')
              this.modifyCredentialDialogVisible = false
              this.page()
            }
          }).catch(err => {
            this.$message.error('操作失败：' + err)
          })
        }
      })
    },

    cancelCredential() {
      this.modifyCredentialDialogVisible = false
    },

    removeCredential(id) {
      this.$confirm('确认删除该凭据吗？', '警告', { type: 'warning' }).then(() => {
        remove(id).then(res => {
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.page()
          }
        }).catch(err => {
          this.$message.error('删除失败：' + err)
        })
      }).catch(() => {})
    },

    // 详情抽屉
    openDetail(row) {
      this.detailCredential = row
      this.detailDrawer = { _showToken: false }
      this.detailDrawerVisible = true
    },

    // Token 显隐切换
    toggleToken(row) {
      this.$set(row, '_showToken', !row._showToken)
    },

    // 工具方法
    getGroupIcon(type) {
      const map = { gitlab: 'el-icon-connection', jenkins: 'el-icon-s-cooperation' }
      return map[type.toLowerCase()] || 'el-icon-key'
    },

    getGroupLabel(type) {
      const map = { gitlab: 'Git 凭据', jenkins: 'CI/CD 凭据' }
      return map[type.toLowerCase()] || type + ' 凭据'
    },

    getTypeTagType(type) {
      const map = { gitlab: 'warning', jenkins: 'primary' }
      return map[type] || 'info'
    },

    formatTime(time) {
      if (!time) return '-'
      return String(time).replace('T', ' ')
    },

    isExpired(time) {
      if (!time) return false
      return new Date(time) < new Date()
    }
  },
  created() {
    this.page()
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

/* 凭据分组 */
.credential-groups {
  display: flex;
  flex-direction: column;
  gap: @space-5;
}

.credential-group {
  background: @bg-footer;
  border-radius: @border-radius;
  border: 1px solid @border-color-light;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: @space-2;
  padding: @space-3 @space-4;
  background: @bg-content;
  border-bottom: 1px solid @border-color-light;
}

.group-icon {
  color: @primary-color;
  font-size: @font-size-lg;
}

.group-title {
  font-size: @font-size-sm;
  font-weight: 600;
  color: @text-primary;
}

.credential-table {
  /deep/ .el-table__header th {
    background-color: @bg-content;
  }
}

/* 凭据名称 */
.cred-name {
  font-weight: 500;
  color: @text-primary;
}

.cred-url {
  font-size: @font-size-xs;
  color: @text-secondary;
  font-family: @font-mono;
}

/* Token 显隐 */
.token-hidden {
  cursor: pointer;
  color: @text-tertiary;
  font-size: @font-size-sm;

  i {
    margin-left: 4px;
    color: @primary-color;
  }

  &:hover {
    color: @text-secondary;
  }
}

.token-revealed {
  cursor: pointer;
  color: @text-primary;
  font-family: @font-mono;
  font-size: @font-size-xs;

  i {
    margin-left: 4px;
    color: @error-color;
  }
}

/* 分页 */
.pagination-container {
  margin-top: @space-4;
  text-align: right;
}

/* 抽屉内容 */
.drawer-content {
  padding: @space-4;
}

/* 通用 */
.text-muted {
  color: @text-tertiary;
}

.text-error {
  color: @error-color;
}

.text-danger {
  color: @error-color;
  &:hover {
    color: #f78989;
  }
}
</style>
