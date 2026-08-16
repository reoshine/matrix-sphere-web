/**
 * 菜单分组映射工具
 * 将后端 /menu/tree 返回的菜单映射到前端定义的分组结构
 * 后端零改动，前端做分组适配
 *
 * 注意：matchPaths 同时包含新旧路径，确保后端未迁移时也能正确分组
 */

const GROUP_CONFIG = [
  {
    key: 'overview',
    title: '概览',
    matchPaths: ['/dashboard']
  },
  {
    key: 'core',
    title: '核心业务',
    matchPaths: ['/apps', '/deploy', '/applicationManagement']
  },
  {
    key: 'ops',
    title: '运维支撑',
    matchPaths: ['/monitor', '/resources', '/serviceMonitor', '/repositoryManagement', '/credentialManagement']
  },
  {
    key: 'system',
    title: '系统',
    matchPaths: ['/settings', '/accountManagement', '/systemManagement']
  }
]

/**
 * 根据 menuUrl 前缀判断菜单属于哪个分组
 * @param {string} menuUrl - 菜单路径
 * @returns {string} 分组 key
 */
function findGroupKey(menuUrl) {
  if (!menuUrl) return 'system'

  for (const group of GROUP_CONFIG) {
    for (const path of group.matchPaths) {
      if (menuUrl.startsWith(path)) {
        return group.key
      }
    }
  }

  // 未匹配的归入"系统"分组
  return 'system'
}

/**
 * 将后端菜单树映射到分组结构
 * @param {Array} menus - 后端返回的菜单树
 * @returns {Array} 分组后的菜单结构
 */
export function groupMenus(menus) {
  if (!menus || !Array.isArray(menus)) return []

  // 初始化分组
  const groups = GROUP_CONFIG.map(g => ({
    ...g,
    items: []
  }))

  // 将每个顶级菜单分配到对应分组
  for (const menu of menus) {
    const groupKey = findGroupKey(menu.menuUrl)
    const group = groups.find(g => g.key === groupKey)
    if (group) {
      group.items.push(menu)
    }
  }

  // 过滤掉空分组
  return groups.filter(g => g.items.length > 0)
}

export { GROUP_CONFIG }
