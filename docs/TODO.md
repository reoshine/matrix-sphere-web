# MatrixSphere UI/UX 重设计 — TODO 清单

> 共 39 个任务，166 个步骤。按 Phase 顺序执行。
> 来源：`docs/superpowers/plans/2026-08-16-matrix-sphere-ui-redesign.md`

---

## Phase 1：基础架构重构

### Task 1: 建立 CSS Custom Properties Token 体系
- [x] Step 1: 创建 design-tokens.css 文件骨架
- [x] Step 2: 填写 Layer 1 基础 Token
- [x] Step 3: 填写 Layer 2 语义 Token
- [x] Step 4: 填写 Layer 3 组件 Token
- [x] Step 5: 在 App.vue 中引入 design-tokens.css
- [x] Step 6: 启动开发服务器验证无编译错误
- [x] Step 7: 提交

### Task 2: theme.less 变量改为引用 CSS 变量
- [x] Step 1: 读取当前 theme.less 内容
- [x] Step 2: 将所有 Less 变量改为引用 CSS 变量
- [x] Step 3: 启动开发服务器验证
- [x] Step 4: 提交

### Task 3: 废弃 sweetalert2
- [x] Step 1: 全局搜索 sweetalert2 使用点
- [x] Step 2: 创建 src/utils/confirm.js
- [x] Step 3: 替换 headerBar.vue 中的 this.$swal 调用
- [x] Step 4: 搜索并替换其他所有 $swal 调用
- [x] Step 5: 从 main.js 中移除 sweetalert2 注册
- [x] Step 6: 删除 vue-sweetalert.js 插件文件
- [x] Step 7: 卸载 npm 依赖
- [x] Step 8: 启动开发服务器验证
- [x] Step 9: 提交

### Task 4: 删除 Footer 空壳组件
- [x] Step 1: 在 Home.vue 中移除 Footer 组件引用
- [x] Step 2: 删除 Footer.vue 文件
- [x] Step 3: 启动开发服务器验证
- [x] Step 4: 提交

### Task 5: 创建 PageContainer 通用页面容器组件
- [x] Step 1: 创建 PageContainer.vue 模板
- [x] Step 2: 添加 scoped 样式
- [x] Step 3: 在一个现有页面中试用
- [x] Step 4: 提交

### Task 6: 创建 FilterBar 通用筛选栏组件
- [x] Step 1: 创建 FilterBar.vue
- [x] Step 2: 添加 scoped 样式
- [x] Step 3: 在凭据管理页中试用
- [x] Step 4: 提交

### Task 7: 创建 FormDialog 标准化弹窗组件
- [x] Step 1: 创建 FormDialog.vue 模板
- [x] Step 2: 添加全局样式（非 scoped）
- [x] Step 3: 在凭据管理页中试用
- [x] Step 4: 提交

### Task 8: 创建 Breadcrumb 面包屑组件
- [x] Step 1: 创建 Breadcrumb.vue 模板
- [x] Step 2: 添加 scoped 样式
- [x] Step 3: 在一个隐藏页面中验证
- [x] Step 4: 提交

### Task 9: 创建 TabNav 标签页导航组件
- [x] Step 1: 重写 Tags.vue 模板
- [x] Step 2: 重写 Tags.vue 样式
- [x] Step 3: 保留现有 JS 逻辑
- [x] Step 4: 启动开发服务器验证
- [x] Step 5: 提交

### Task 10: 重构主布局 Home.vue（Flexbox）
- [x] Step 1: 重写 Home.vue 模板
- [x] Step 2: 添加 Home.vue scoped 样式
- [x] Step 3: 移除 main.css 中的 .content-box 绝对定位
- [x] Step 4: 启动开发服务器验证
- [x] Step 5: 提交

### Task 11: 重构侧边栏 sidebar.vue（分组 + 搜索 + 用户信息）
- [x] Step 1: 创建 src/utils/menuGroups.js
- [x] Step 2: 重写 sidebar.vue 模板
- [x] Step 3: 添加 sidebar.vue scoped 样式
- [x] Step 4: 实现菜单搜索过滤
- [x] Step 5: 启动开发服务器验证
- [x] Step 6: 提交

### Task 12: 重构顶栏 headerBar.vue（面包屑 + 轻量操作）
- [x] Step 1: 重写 headerBar.vue 模板
- [x] Step 2: 重写 headerBar.vue 样式
- [x] Step 3: 保留退出登录逻辑
- [x] Step 4: 启动开发服务器验证
- [x] Step 5: 提交

### Task 13: 重构路由结构（扁平化 + 语义化）
- [x] Step 1: 定义新路由结构
- [x] Step 2: 保留隐藏页面的 meta 配置
- [x] Step 3: 处理旧路由兼容
- [x] Step 4: 启动开发服务器验证
- [x] Step 5: 提交

### Task 14: 全局 CSS 清理（main.css / color-dark.css 重构）
- [x] Step 1: 清理 main.css
- [x] Step 2: 迁移 color-dark.css 内容
- [x] Step 3: 从 App.vue 移除 color-dark.css 引用
- [x] Step 4: 启动开发服务器验证
- [x] Step 5: 提交

### Task 15: 创建骨架屏组件
- [x] Step 1: 创建 SkeletonCard.vue
- [x] Step 2: 创建 SkeletonTable.vue
- [x] Step 3: 提交

### Task 16: 创建状态/反馈组件
- [x] Step 1: 创建 StatusDot.vue
- [x] Step 2: 创建 StatCard.vue
- [x] Step 3: 创建 EmptyState.vue
- [x] Step 4: 提交

### Task 17: 创建全局加载状态工具
- [x] Step 1: 安装 nprogress
- [x] Step 2: 在 axios 拦截器中集成 NProgress
- [x] Step 3: 启动开发服务器验证
- [x] Step 4: 提交

---

## Phase 2：核心页面重构

### Task 18: 实现工作台 Dashboard 页面
- [x] Step 1: 创建 Dashboard.vue 模板
- [x] Step 2: 使用 StatCard 组件展示 4 个 KPI 卡片
- [x] Step 3: 实现"快速操作"区域（4 个快捷入口卡片）
- [x] Step 4: 实现"最近部署"和"活跃应用"列表区域
- [x] Step 5: 启动验证 + 提交

### Task 19: 重构应用列表页（双视图 + PageContainer）
- [x] Step 1: 使用 PageContainer + FilterBar 替换现有布局
- [x] Step 2: 保留现有卡片视图，添加列表视图（el-table）
- [x] Step 3: 实现视图切换按钮（卡片/列表 toggle）
- [x] Step 4: 列表视图增加"最近部署"列
- [x] Step 5: 使用 FormDialog 替换新增/编辑弹窗
- [x] Step 6: 启动验证 + 提交

### Task 20: 重构部署控制台（环境并排 + 流水线可视化）
- [x] Step 1: 重写页面结构为应用概览 + 流水线步骤条 + 4 环境卡片并排 + 部署历史表格
- [x] Step 2: 实现环境卡片组件（每环境独立的已部署/待部署列表 + 操作按钮）
- [x] Step 3: 实现响应式网格（4→2→1 列自适应）
- [x] Step 4: 底部嵌入部署历史表格
- [x] Step 5: 启动验证 + 提交

### Task 21: 重构分支管理页（独立可达 + 状态感知）
- [x] Step 1: 使用 PageContainer + FilterBar 替换现有布局
- [x] Step 2: 新增"环境"列（显示分支部署在哪个环境）
- [x] Step 3: 创建分支改为 FormDialog 弹窗
- [x] Step 4: 支持批量删除未部署分支
- [x] Step 5: 使用应用选择器（顶部下拉）替代搜索框切换应用
- [x] Step 6: 启动验证 + 提交

### Task 22: 重构应用编辑页（标签页分离职责）
- [x] Step 1: 将左右分栏改为 el-tabs（基础配置 / 流水线配置 / 环境变量 / 部署历史）
- [x] Step 2: "基础配置"标签页保留现有表单
- [x] Step 3: "流水线配置"标签页保留 Jenkinsfile 预览
- [x] Step 4: 新增"环境变量"标签页（占位，待后端 API）
- [x] Step 5: 启动验证 + 提交

### Task 23: 重构凭据管理页（分组列表 + 安全展示）
- [x] Step 1: 使用 PageContainer + FilterBar 替换现有布局
- [x] Step 2: 卡片网格改为分组列表（按凭据类型分组）
- [x] Step 3: 凭据值默认隐藏（••••••），点击显示
- [x] Step 4: 新增"使用情况"列
- [x] Step 5: 凭据详情改为侧边抽屉
- [x] Step 6: 启动验证 + 提交

---

## Phase 3：辅助页面与细节打磨

### Task 24: 重构用户管理页（合并子菜单为标签页）
- [x] Step 1: 使用 PageContainer 替换现有布局
- [x] Step 2: 表格样式对齐新规范（行高 48px、表头样式）
- [x] Step 3: 启动验证 + 提交

### Task 25: 重构角色权限页（合并 3 个页面）
- [x] Step 1: 使用 PageContainer + el-tabs 合并角色管理 + 权限管理 + 角色权限分配
- [x] Step 2: 启动验证 + 提交

### Task 26: 表格全局样式覆盖
- [x] Step 1: 在 main.css 中添加 el-table 全局覆盖样式（行高、表头、斑马纹、hover）
- [x] Step 2: 启动验证 + 提交

### Task 27: 全局搜索 Command+K
- [x] Step 1: 创建 GlobalSearch.vue（弹窗式搜索面板）
- [x] Step 2: 实现 Command+K 快捷键监听
- [x] Step 3: 搜索结果展示（应用/分支/凭据分类）
- [x] Step 4: 无结果状态 + 加载状态
- [x] Step 5: 启动验证 + 提交

### Task 28: 登录页与系统内风格对齐
- [x] Step 1: 将登录页的蓝色渐变色值对齐到 design-tokens.css 的品牌色体系
- [x] Step 2: 输入框圆角、按钮样式对齐到 Token 变量
- [x] Step 3: 移除硬编码的 960px 宽度，改为响应式
- [x] Step 4: 启动验证 + 提交

### Task 29: 键盘快捷键基础
- [x] Step 1: 创建全局键盘事件监听（⌘K 搜索、⌘B 折叠侧边栏、Escape 关闭弹窗）
- [x] Step 2: 在 main.js 中初始化
- [x] Step 3: 启动验证 + 提交

---

## Phase 4：体验增强

### Task 30: 页面切换过渡动画
- [x] Step 1: 为 router-view 添加 `<transition name="fade-transform" mode="out-in">`
- [x] Step 2: 定义 fade-transform 的 CSS 过渡样式
- [x] Step 3: 提交

### Task 32: 响应式适配
- [ ] Step 1: 部署控制台环境卡片 4→2→1 响应式断点
- [ ] Step 2: 应用列表卡片列数响应式
- [ ] Step 3: 侧边栏小屏自动折叠
- [ ] Step 4: 弹窗宽度响应式
- [ ] Step 5: 提交

### Task 33: 可访问性增强
- [ ] Step 1: 创建 SkipLink 组件
- [ ] Step 2: 为侧边栏 nav 添加 aria-label
- [ ] Step 3: 为图标按钮添加 aria-label
- [ ] Step 4: 为状态指示器确保不仅用颜色
- [ ] Step 5: 提交

### Task 34: 模板管理页面重设计
- [ ] Step 1: 合并为模板中心页面（el-tabs 切换用户模板/系统模板）
- [ ] Step 2: 使用 PageContainer + FilterBar
- [ ] Step 3: 启动验证 + 提交

### Task 35: 监控中心页面重设计
- [ ] Step 1: "服务状态"页面合并服务监控 + 服务器管理
- [ ] Step 2: "容器监控"使用 PageContainer
- [ ] Step 3: 启动验证 + 提交

### Task 36: 资源管理页面重设计
- [ ] Step 1: 使用 PageContainer + FilterBar 统一页面结构
- [ ] Step 2: 启动验证 + 提交

### Task 37: 系统设置页面重设计
- [ ] Step 1: 菜单管理使用树形表格
- [ ] Step 2: 系统参数使用 PageContainer + 表格
- [ ] Step 3: 启动验证 + 提交

### Task 38: 错误页面优化
- [ ] Step 1: 重设计 404 页面，添加返回首页按钮和搜索入口
- [ ] Step 2: 提交

### Task 39: 应用分组页面重设计
- [ ] Step 1: 使用 PageContainer + FormDialog
- [ ] Step 2: 启动验证 + 提交

### Task 40: 菜单分组逻辑重构——仅适配 menuCode
- [ ] Step 1: 重构 menuGroups.js，移除 matchPaths 字段，仅保留 matchCodes 字段匹配顶级菜单的 menuCode
- [ ] Step 2: 确认 sidebar.vue 中 groupMenus 调用无需变更（已传入完整 menu 对象）
- [ ] Step 3: 启动开发服务器验证分组显示正确
- [ ] Step 4: 提交

---

## 延后任务

### Task 31: 暗黑模式（已延后）
- [ ] Step 1: 在 design-tokens.css 中追加 `[data-theme="dark"]` 覆盖层
- [ ] Step 2: 创建 theme.js 切换逻辑
- [ ] Step 3: 在侧边栏底部添加主题切换开关
- [ ] Step 4: 启动验证 + 提交

> **延后原因**：经过多次迭代修复依然无法完美适配。根本原因是 Vue scoped 样式与全局暗黑模式选择器的 CSS 特异性冲突（两者都是 0-2-0，但 scoped 样式后加载覆盖全局样式）。需要使用 `!important` 或修改所有组件的 scoped 样式才能解决，但这会影响代码质量和维护性。待整体重构计划结束后，统一采用 CSS 变量方案重新开发。
