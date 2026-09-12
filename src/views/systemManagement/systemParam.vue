<template>
  <PageContainer title="系统参数" subtitle="管理系统配置参数">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-tooltip content="尚未接入后端能力" placement="bottom">
        <span>
          <el-button type="primary" icon="el-icon-plus" size="small" disabled>新增参数</el-button>
        </span>
      </el-tooltip>
    </template>

    <!-- 筛选区 -->
    <template #filter>
      <FilterBar @search="getSysParamList" @reset="resetQuery">
        <el-form-item label="参数搜索">
          <el-input
            v-model="searchText"
            placeholder="参数分组/编码/描述"
            prefix-icon="el-icon-search"
            clearable
            style="width: 240px;"
            size="small"
            @keyup.enter.native="getSysParamList"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-select v-model="enabled" placeholder="全部" clearable style="width: 120px;" size="small">
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
      </FilterBar>
    </template>

    <!-- 参数列表 -->
    <el-card shadow="never">
      <el-table :data="sysParamList" border stripe v-loading="loading">
        <el-table-column type="index" width="60" align="center" />
        <el-table-column prop="paramGroupCode" label="参数分组" min-width="120" />
        <el-table-column prop="paramCode" label="参数编码" min-width="150" />
        <el-table-column prop="paramDesc" label="参数描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="paramValue" label="参数值" width="200">
          <template slot-scope="scope">
            <el-select
              size="small"
              @change="modifyParamValue($event, scope.row)"
              v-model="sysParamList[scope.$index].paramValue"
              placeholder="请选择"
              :disabled="disabled"
            >
              <el-option
                v-for="item in sysParamOptionList"
                :key="item.id"
                :label="item.paramOptionDesc"
                :value="item.paramOptionValue"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch v-model="sysParamList[scope.$index].enabled" @change="modifyParamValue($event, scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-tooltip content="尚未接入后端能力" placement="top">
              <span><el-button type="text" icon="el-icon-edit" size="small" disabled>编辑</el-button></span>
            </el-tooltip>
            <el-tooltip content="尚未接入后端能力" placement="top">
              <span><el-button type="text" icon="el-icon-delete" size="small" disabled>删除</el-button></span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && sysParamList.length === 0" description="暂无系统参数" />
    </el-card>
  </PageContainer>
</template>

<script>
import PageContainer from '@/components/common/PageContainer.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import { getSysParamList, getSysParamOptionList, modifySysParam } from '@/views/systemManagement/api'

export default {
  name: 'systemParam',
  components: {
    PageContainer,
    FilterBar
  },
  data() {
    return {
      loading: false,
      searchText: '',
      enabled: '',
      sysParamList: [],
      sysParamOptionList: [],
      disabled: false
    }
  },
  created() {
    this.getSysParamList()
    this.getSysParamOptionList()
  },
  methods: {
    async getSysParamList() {
      this.loading = true
      try {
        const res = await getSysParamList({
          searchText: this.searchText,
          enabled: this.enabled
        })
        if (res.code === 200) {
          this.sysParamList = res.data || []
        }
      } catch (e) {
        console.error('获取系统参数失败', e)
      } finally {
        this.loading = false
      }
    },

    async getSysParamOptionList() {
      try {
        const res = await getSysParamOptionList()
        if (res.code === 200) {
          this.sysParamOptionList = res.data || []
        }
      } catch (e) {
        console.error('获取参数选项失败', e)
      }
    },

    resetQuery() {
      this.searchText = ''
      this.enabled = ''
      this.getSysParamList()
    },

    async modifyParamValue(value, row) {
      try {
        const res = await modifySysParam(row)
        if (res.code === 200) {
          this.$message.success('修改成功')
        } else {
          this.$message.error(res.message)
        }
      } catch (e) {
        this.$message.error('修改失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.text-danger {
  color: @error-color;
}
</style>
