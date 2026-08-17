/**
 * 全局键盘快捷键
 * 对齐设计规范 §6.4 键盘快捷键体系
 *
 * ⌘K / Ctrl+K — 全局搜索（由 GlobalSearch.vue 自行监听）
 * ⌘B / Ctrl+B — 折叠/展开侧边栏
 * Escape       — 关闭弹窗/抽屉
 */

import bus from '@/util/bus'

export function initGlobalKeys() {
  document.addEventListener('keydown', (e) => {
    // ⌘B / Ctrl+B — 折叠/展开侧边栏
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault()
      bus.$emit('toggle-sidebar')
    }

    // Escape — 关闭顶层弹窗
    if (e.key === 'Escape') {
      bus.$emit('close-top-modal')
    }
  })
}
