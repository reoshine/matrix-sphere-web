<template>
  <div>
    <div>
      <el-input
          class="searchInput"
          minlength="0"
          maxlength="20"
          style="width: 400px;"
          size="medium"
          placeholder="请输入参数分组编码/参数编码/描述，支持模糊搜索"
          suffix-icon="el-icon-search"
          clearable
          v-model="searchText"></el-input>
      <label style="margin-left:20px" for="enabled">启用状态：</label>
      <el-select clearable size="medium" v-model="enabled" placeholder="请选择">
        <el-option
            v-for="item in enableStatusList"
            :key="item.enableStatus"
            :label="item.enableStatusName"
            :value="item.enableStatus">
        </el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="getSysParamList">查询</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addApplication()">新增</el-button>
    </div>
    <el-divider content-position="left">参数列表</el-divider>

    <el-empty v-show="sysParamList.length <= 0" description="无应用分组信息"></el-empty>
    <el-table v-show="sysParamList.length > 0" :data="sysParamList" border>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="paramGroupCode" label="参数分组编码"></el-table-column>
      <el-table-column prop="paramCode" label="参数编码"></el-table-column>
      <el-table-column prop="paramDesc" label="参数描述"></el-table-column>
      <el-table-column prop="paramValue" label="参数值">
        <template slot-scope="scope">
          <el-select size="medium" @change="modifyParamValue($event, scope.row)" v-model="sysParamList[scope.$index].paramValue" placeholder="请选择" :disabled="disabled">
            <el-option
                v-for="item in sysParamOptionList"
                :key="item.id"
                :label="item.paramOptionDesc"
                :value="item.paramOptionValue">
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="enabled" label="启用状态">
        <template slot-scope="scope">
          <el-switch
              v-model="sysParamList[scope.$index].enabled"
              @change="modifyParamValue($event, scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="small" type="primary" icon="el-icon-edit" @click="editSysParamValue(scope.row)">修 改</el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteConfirm(scope.row.id)">删 除</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import {getSysParamList, getSysParamOptionList, modifySysParam} from "@/views/systemManagement/api";

export default {
  name: "systemParam",
  data() {
    return {
      searchText: '',
      enabled: '',
      enableStatusList: [
        {
          enableStatus: true,
          enableStatusName: '启用',
        },
        {
          enableStatus: false,
          enableStatusName: '停用',
        }
      ],
      sysParamList: [],
      sysParam: {
        paramGroupCode: '',
        paramCode: '',
        paramDesc: '',
        paramType: '',
        paramValue: '',
        enabled: false
      },
      sysParamOptionList: [

      ],
      sysParamOption: {
        id: '',
        paramCode: '',
        paramOptionValue: '',
        paramOptionDesc: ''
      },
      disabled: true,
    }
  },
  methods: {
    getSysParamList() {
      getSysParamList({
        searchText: this.searchText,
        enabled: this.enabled
      }).then(res => {
        if (res.code === 200) {
          this.sysParamList = res.data
        }
      }).catch(err => {
        this.$message({
          message: '获取系统参数列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    getSysParamOptionList() {
      getSysParamOptionList({
        paramCode: 'canDeploy'
      }).then(res => {
        if (res.code === 200) {
          this.sysParamOptionList = res.data
        }
      }).catch(err => {
        this.$message({
          message: '获取系统参数列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },

    editSysParamValue() {
      this.disabled = false
    },

    modifyParamValue(event, sysParam) {
      modifySysParam({
        id: sysParam.id,
        paramGroupCode: sysParam.paramGroupCode,
        paramCode: sysParam.paramCode,
        paramDesc: sysParam.paramDesc,
        paramValue: sysParam.paramValue,
        paramType: sysParam.paramType,
        enabled: sysParam.enabled
      }).then(res => {
        if (res.code === 200) {
          this.$message({
            message: '参数修改成功！',
            type: 'success',
            duration: 2000
          });
          this.disabled = true
          this.getSysParamList()
        }
      }).catch(err => {
        this.$message({
          message: '获取系统参数列表失败，原因：' + err,
          type: 'error',
          duration: 2000,
        });
      })
    },
  },
  created() {
    this.getSysParamList()
    this.getSysParamOptionList()
  }
}
</script>

<style lang="less" scoped>
.searchInput {
  width: 80%;
  margin-right: 10px;
  margin-bottom: 10px;
}

.el-select {
  width: 190px;
  margin-right: 10px;
  margin-bottom: 10px;
}

</style>
