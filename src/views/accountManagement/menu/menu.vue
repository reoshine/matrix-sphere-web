<template>
  <div class="app-container">
    <el-row :gutter="20" class="full-height">

      <el-col :span="6" class="full-height-col">
        <el-card shadow="never" class="left-card">
          <div slot="header" class="card-header">
            <span class="title"><i class="el-icon-s-operation"></i> 菜单架构</span>
          </div>

          <div class="tree-tools">
            <el-input
                placeholder="输入关键字过滤菜单"
                v-model="filterText"
                size="small"
                suffix-icon="el-icon-search"
                style="margin-bottom: 10px;">
            </el-input>

            <el-button type="primary" icon="el-icon-plus" size="small" style="width: 100%" @click="handleAddRoot">新增根菜单</el-button>
          </div>

          <div class="tree-wrapper">
            <el-tree
                ref="menuTree"
                :data="menuList"
                node-key="id"
                :props="defaultProps"
                :default-expand-all="true"
                :expand-on-click-node="false"
                :highlight-current="true"
                :filter-node-method="filterNode"
                @node-click="handleNodeClick"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span class="node-label">
                  <i :class="data.icon ? data.icon : 'el-icon-menu'" class="node-icon"></i>
                  <span :title="node.label">{{ node.label }}</span>
                </span>
                <span class="node-actions" v-if="currentMenuId === data.id">
                  <el-tooltip content="添加子菜单" placement="top" :open-delay="500">
                    <el-button type="text" icon="el-icon-plus" size="mini" @click.stop="handleAddChild(data)"></el-button>
                  </el-tooltip>
                  <el-tooltip content="删除当前菜单" placement="top" :open-delay="500">
                    <el-button type="text" class="text-danger" icon="el-icon-delete" size="mini" @click.stop="handleDelete(node, data)"></el-button>
                  </el-tooltip>
                </span>
              </span>
            </el-tree>
          </div>
        </el-card>
      </el-col>

      <el-col :span="18" class="full-height-col">
        <el-card shadow="never" class="right-card">
          <div slot="header" class="card-header">
            <span class="title"><i class="el-icon-edit-outline"></i> 菜单详情配置</span>
            <div class="header-actions" v-if="!cannotEdit">
              <el-button size="small" icon="el-icon-close" @click="cancelEditStatus">取消</el-button>
              <el-button type="primary" size="small" icon="el-icon-check" @click="saveMenu">保存变更</el-button>
            </div>
            <div class="header-actions" v-else>
              <el-button type="primary" plain size="small" icon="el-icon-edit" @click="enableEdit" :disabled="!currentMenuId">编辑当前菜单</el-button>
            </div>
          </div>

          <el-empty v-if="!currentMenuId" description="请选择左侧菜单节点进行查看或编辑"></el-empty>

          <div v-else class="form-wrapper">
            <el-form
                ref="menuForm"
                :model="menu"
                :disabled="cannotEdit"
                label-width="100px"
                label-position="right"
                size="medium"
            >
              <el-divider content-position="left">基础信息</el-divider>
              <el-row :gutter="30">
                <el-col :span="12">
                  <el-form-item label="菜单名称">
                    <el-input v-model="menu.menuName" placeholder="例如: 用户管理"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="菜单编码">
                    <el-input v-model="menu.menuCode" placeholder="唯一标识, 如: user_mgr"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="路由地址">
                    <el-input v-model="menu.menuUrl" placeholder="/system/user"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="前端组件">
                    <el-input v-model="menu.component" placeholder="如: accountManagement/account/account（叶子菜单必填）"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-divider content-position="left">样式与结构</el-divider>
              <el-row :gutter="30">
                <el-col :span="12">
                  <el-form-item label="显示图标">
                    <el-input v-model="menu.icon" placeholder="el-icon-xxx">
                      <i slot="prefix" :class="menu.icon" v-if="menu.icon"></i>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="显示排序">
                    <el-input-number v-model="menu.sortNo" controls-position="right" :min="0" style="width: 100%"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="菜单层级">
                    <el-tag type="info">{{ menu.menuLevel || '自动生成' }}</el-tag>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="父级ID">
                    <el-input v-model="menu.parentId" disabled placeholder="根节点"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getMenuById, getMenuList, modifyMenu, addMenu, deleteMenu } from "@/views/accountManagement/api";

export default {
  name: "MenuManagement",
  data() {
    return {
      // 状态控制
      loading: false,
      filterText: '', // 搜索关键字
      cannotEdit: true, // 编辑模式开关
      currentMenuId: '',

      // 数据源
      applicationList: [],
      applicationId: '',
      menuList: [],

      // 当前编辑的菜单对象
      menu: {
        id: '',
        parentId: '',
        menuName: '',
        menuCode: '',
        menuUrl: '',
        component: '',
        icon: '',
        sortNo: 0,
        menuLevel: '',
        children: []
      },

      defaultProps: {
        children: 'children',
        label: 'menuName'
      }
    };
  },
  watch: {
    // 监听输入框进行树过滤
    filterText(val) {
      this.$refs.menuTree.filter(val);
    }
  },
  methods: {
    // 树过滤逻辑
    filterNode(value, data) {
      if (!value) return true;
      return data.menuName.indexOf(value) !== -1;
    },

    // 加载菜单树
    loadMenuTree() {
      getMenuList().then(res => {
        if (res.code === 200) {
          this.menuList = res.data || [];
        }
      });
    },

    // 点击树节点 -> 查看详情
    handleNodeClick(data) {
      this.currentMenuId = data.id;
      this.cannotEdit = true; // 默认只读
      this.getMenuDetail(data.id);
    },

    // 获取详情
    getMenuDetail(id) {
      getMenuById(id).then(res => {
        if (res.code === 200) {
          this.menu = res.data;
        }
      });
    },

    // 激活编辑状态
    enableEdit() {
      this.cannotEdit = false;
    },

    // 取消编辑
    cancelEditStatus() {
      this.cannotEdit = true;
      if (this.currentMenuId) {
        this.getMenuDetail(this.currentMenuId); // 恢复原数据
      }
    },

    // 保存 (新增或修改)
    saveMenu() {
      // 这里应该加入表单校验
      // const api = this.menu.id ? modifyMenu : addMenu;

      modifyMenu(this.menu).then(res => {
        if (res.code === 200) {
          this.$message.success('保存成功');
          this.cannotEdit = true;
          this.handleApplicationChange(); // 刷新树
        } else {
          this.$message.error(res.message || '保存失败');
        }
      }).catch(err => {
        this.$message.error('保存异常: ' + err);
      });
    },

    // 工具栏：新增根节点
    handleAddRoot() {
      this.resetMenuForm();
      this.menu.parentId = '0'; // 假设0代表根
      this.menu.menuLevel = '1';
      this.currentMenuId = 'new_root'; // 临时ID用于UI状态
      this.cannotEdit = false;
    },

    // 树操作：新增子节点
    handleAddChild(data) {
      this.resetMenuForm();
      this.menu.parentId = data.id;
      // 简单的层级计算逻辑，根据实际情况调整
      this.menu.menuLevel = parseInt(data.menuLevel || 0) + 1;
      this.currentMenuId = 'new_child';
      this.cannotEdit = false;
    },

    // 树操作：删除节点
    handleDelete(node, data) {
      this.$confirm(`确认删除菜单 "${data.menuName}" 吗?`, '警告', {
        type: 'warning'
      }).then(() => {
        // TODO: 调用 deleteMenu API
        // deleteMenu(data.id).then(...)
        this.$message.success('模拟删除成功');
        // 前端模拟移除
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
        if (this.currentMenuId === data.id) {
          this.currentMenuId = '';
          this.menu = {};
        }
      });
    },

    resetMenuForm() {
      this.menu = {
        id: '',
        menuName: '',
        menuCode: '',
        menuUrl: '',
        icon: '',
        sortNo: 0,
        parentId: '',
        menuLevel: ''
      };
    }
  },
  created() {
    this.loadMenuTree();
  }
};
</script>

<style lang="less" scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  /* 适配高度，防止双重滚动条 */
  min-height: calc(100vh - 84px);
  height: calc(100vh - 84px); /* 固定高度，以便内部卡片撑满 */
  box-sizing: border-box;
}

.full-height {
  height: 100%;
}

.full-height-col {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 左侧卡片 */
.left-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;

  ::v-deep .el-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 15px;
    overflow: hidden; /* 防止卡片本身滚动 */
  }
}

/* 右侧卡片 */
.right-card {
  height: 100%;
  border: none;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    i { margin-right: 5px; color: #409EFF; }
  }
}

.tree-tools {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.tree-wrapper {
  flex: 1;
  overflow-y: auto; /* 树区域独立滚动 */
}

/* 树节点自定义样式 */
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  overflow: hidden;

  .node-label {
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .node-icon {
      margin-right: 6px;
      color: #909399;
      font-size: 14px;
    }
  }

  /* 仅在 hover 或选中时显示的按钮 */
  .node-actions {
    display: none;
    margin-left: 10px;
  }

  &:hover .node-actions {
    display: inline-block;
  }
}

/* 选中节点高亮样式的补充 */
::v-deep .el-tree-node.is-current > .el-tree-node__content {
  background-color: #f0f7ff;
  color: #409EFF;
  font-weight: bold;

  .node-icon {
    color: #409EFF;
  }

  .node-actions {
    display: inline-block; /* 选中时常显操作按钮 */
  }
}

.form-wrapper {
  padding: 0 20px;
}

.text-danger {
  color: #F56C6C;
  &:hover { color: #ff4949; }
}
</style>