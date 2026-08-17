<template>
  <div v-if="visible" class="global-search-overlay" @click.self="close">
    <div class="global-search-panel" @keydown.escape="close">
      <!-- 搜索输入 -->
      <div class="search-header">
        <i class="el-icon-search search-icon"></i>
        <input
            ref="searchInput"
            v-model="query"
            class="search-input"
            placeholder="搜索应用、分支、凭据..."
            @input="onInput"
            @keydown.up.prevent="navigateUp"
            @keydown.down.prevent="navigateDown"
            @keydown.enter.prevent="selectCurrent"
        />
        <kbd class="search-kbd">ESC</kbd>
      </div>

      <!-- 搜索结果 -->
      <div class="search-body">
        <!-- 最近访问（无搜索时） -->
        <div v-if="!query" class="search-section">
          <div class="section-title">最近访问</div>
          <div
              v-for="(item, idx) in recentItems"
              :key="'r-' + idx"
              class="search-item"
              :class="{ 'is-active': activeIndex === idx }"
              @click="navigateTo(item)"
              @mouseenter="activeIndex = idx"
          >
            <i :class="item.icon" class="item-icon"></i>
            <div class="item-content">
              <span class="item-title">{{ item.title }}</span>
              <span class="item-type">{{ item.typeName }}</span>
            </div>
            <span class="item-action">前往 →</span>
          </div>
        </div>

        <!-- 搜索中 -->
        <div v-if="query && loading" class="search-loading">
          <i class="el-icon-loading"></i>
          <span>搜索中...</span>
        </div>

        <!-- 搜索结果 -->
        <template v-if="query && !loading">
          <div v-if="results.length === 0" class="search-empty">
            <i class="el-icon-search"></i>
            <p>未找到与 "{{ query }}" 相关的结果</p>
            <p class="empty-hint">建议：检查输入是否正确，尝试更短的关键词</p>
          </div>

          <div v-else class="search-section">
            <div class="section-title">搜索结果 ({{ results.length }})</div>
            <div
                v-for="(item, idx) in results"
                :key="'s-' + idx"
                class="search-item"
                :class="{ 'is-active': activeIndex === idx }"
                @click="navigateTo(item)"
                @mouseenter="activeIndex = idx"
            >
              <i :class="item.icon" class="item-icon"></i>
              <div class="item-content">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-desc" v-if="item.desc">{{ item.desc }}</span>
              </div>
              <el-tag size="mini" :type="item.tagType" effect="plain">{{ item.typeName }}</el-tag>
            </div>
          </div>
        </template>
      </div>

      <!-- 底部快捷键提示 -->
      <div class="search-footer">
        <span><kbd>↑</kbd><kbd>↓</kbd> 导航</span>
        <span><kbd>Enter</kbd> 前往</span>
        <span><kbd>ESC</kbd> 关闭</span>
      </div>
    </div>
  </div>
</template>

<script>
import { queryList } from '@/views/applicationManagement/applicationList/api'
import { page as credentialPage } from '@/views/credentialManagement/api'

export default {
  name: 'GlobalSearch',
  data() {
    return {
      visible: false,
      query: '',
      loading: false,
      results: [],
      activeIndex: 0,
      searchTimer: null,
      recentItems: [
        { title: '工作台', typeName: '页面', icon: 'el-icon-s-home', path: '/dashboard' },
        { title: '应用列表', typeName: '页面', icon: 'el-icon-s-platform', path: '/apps' },
        { title: '部署控制台', typeName: '页面', icon: 'el-icon-s-promotion', path: '/deploy' }
      ]
    }
  },
  methods: {
    open() {
      this.visible = true
      this.query = ''
      this.results = []
      this.activeIndex = 0
      this.$nextTick(() => {
        this.$refs.searchInput && this.$refs.searchInput.focus()
      })
    },

    close() {
      this.visible = false
      this.query = ''
      this.results = []
    },

    onInput() {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      if (!this.query.trim()) {
        this.results = []
        this.loading = false
        return
      }
      this.loading = true
      this.activeIndex = 0
      this.searchTimer = setTimeout(() => {
        this.doSearch(this.query.trim())
      }, 300)
    },

    async doSearch(keyword) {
      const results = []

      // 搜索应用
      try {
        const appRes = await queryList({ searchText: keyword, enableStatus: 1 })
        if (appRes.code === 200 && appRes.data) {
          appRes.data.forEach(app => {
            results.push({
              title: app.applicationName,
              desc: app.applicationCode,
              typeName: '应用',
              icon: 'el-icon-s-platform',
              tagType: '',
              path: '/apps'
            })
          })
        }
      } catch (e) { /* ignore */ }

      // 搜索凭据
      try {
        const credRes = await credentialPage({ pageNum: 1, pageCount: 10, searchText: keyword })
        if (credRes.code === 200 && credRes.data && credRes.data.list) {
          credRes.data.list.forEach(cred => {
            results.push({
              title: cred.credentialDesc || cred.config?.credentialName || '凭据',
              desc: cred.credentialType,
              typeName: '凭据',
              icon: 'el-icon-key',
              tagType: 'warning',
              path: '/resources/credentials'
            })
          })
        }
      } catch (e) { /* ignore */ }

      // 搜索菜单（本地过滤）
      const menus = this.$store.getters.menus || []
      this.searchMenus(menus, keyword, results)

      this.results = results.slice(0, 15)
      this.loading = false
    },

    searchMenus(menus, keyword, results) {
      menus.forEach(menu => {
        if (menu.menuName && menu.menuName.toLowerCase().includes(keyword.toLowerCase())) {
          results.push({
            title: menu.menuName,
            desc: menu.menuUrl,
            typeName: '菜单',
            icon: 'el-icon-menu',
            tagType: 'info',
            path: menu.menuUrl
          })
        }
        if (menu.children && menu.children.length > 0) {
          this.searchMenus(menu.children, keyword, results)
        }
      })
    },

    navigateUp() {
      const items = this.query ? this.results : this.recentItems
      if (items.length === 0) return
      this.activeIndex = (this.activeIndex - 1 + items.length) % items.length
    },

    navigateDown() {
      const items = this.query ? this.results : this.recentItems
      if (items.length === 0) return
      this.activeIndex = (this.activeIndex + 1) % items.length
    },

    selectCurrent() {
      const items = this.query ? this.results : this.recentItems
      if (items.length > 0 && items[this.activeIndex]) {
        this.navigateTo(items[this.activeIndex])
      }
    },

    navigateTo(item) {
      if (item.path) {
        this.$router.push(item.path).catch(() => {})
      }
      this.close()
    }
  },
  mounted() {
    // 监听全局快捷键
    this._keyHandler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (this.visible) {
          this.close()
        } else {
          this.open()
        }
      }
    }
    document.addEventListener('keydown', this._keyHandler)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this._keyHandler)
    if (this.searchTimer) clearTimeout(this.searchTimer)
  }
}
</script>

<style lang="less" scoped>
@import "~@/assets/css/theme.less";

.global-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding-top: 15vh;
}

.global-search-panel {
  width: 560px;
  max-height: 480px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideDown 0.15s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 搜索头部 */
.search-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-light, #f3f4f6);
}

.search-icon {
  font-size: 18px;
  color: var(--color-text-tertiary, #9ca3af);
  margin-right: 10px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--color-text-primary, #111827);
  background: transparent;

  &::placeholder {
    color: var(--color-text-tertiary, #9ca3af);
  }
}

.search-kbd {
  padding: 2px 6px;
  font-size: 11px;
  font-family: var(--font-mono, monospace);
  color: var(--color-text-tertiary, #9ca3af);
  background: var(--color-gray-100, #f3f4f6);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 4px;
}

/* 搜索体 */
.search-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.search-section {
  padding: 0 8px;
}

.section-title {
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;

  &.is-active,
  &:hover {
    background: var(--color-primary-lighter, #dbeafe);
  }
}

.item-icon {
  font-size: 16px;
  color: var(--color-primary, #2c58b4);
  margin-right: 10px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 13px;
  color: var(--color-text-primary, #111827);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 11px;
  color: var(--color-text-tertiary, #9ca3af);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-type {
  font-size: 11px;
  color: var(--color-text-tertiary, #9ca3af);
}

.item-action {
  font-size: 12px;
  color: var(--color-primary, #2c58b4);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s;
}

.search-item.is-active .item-action,
.search-item:hover .item-action {
  opacity: 1;
}

/* 加载态 */
.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--color-text-tertiary, #9ca3af);
  font-size: 13px;
}

/* 空状态 */
.search-empty {
  text-align: center;
  padding: 24px;
  color: var(--color-text-tertiary, #9ca3af);

  i {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.4;
  }

  p {
    font-size: 13px;
    margin: 4px 0;
  }

  .empty-hint {
    font-size: 12px;
    color: var(--color-text-tertiary, #9ca3af);
  }
}

/* 底部快捷键提示 */
.search-footer {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border-light, #f3f4f6);
  background: var(--color-gray-50, #f9fafb);

  span {
    font-size: 11px;
    color: var(--color-text-tertiary, #9ca3af);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  kbd {
    padding: 1px 4px;
    font-size: 10px;
    font-family: var(--font-mono, monospace);
    background: #fff;
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 3px;
  }
}
</style>
