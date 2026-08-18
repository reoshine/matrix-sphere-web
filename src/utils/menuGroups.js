/**
 * 菜单分组映射工具
 * 将后端 /menu/tree 返回的菜单映射到前端定义的分组结构
 * 后端零改动，前端做分组适配
 *
 * 后端顶级菜单（menu_level=1）的标识字段为 menuCode（如 applicationManagement、serviceMonitor）。
 * 匹配逻辑仅使用 menuCode，不再依赖 menuUrl。
 */

const GROUP_CONFIG = [
  {
    key: 'overview',
    title: '概览',
    matchCodes: ['dashboard']
  },
  {
    key: 'core',
    title: '核心业务',
    matchCodes: ['applicationManagement', 'projectManagement']
  },
  {
    key: 'ops',
    title: '运维支撑',
    matchCodes: ['serviceMonitor', 'repositoryManagement', 'credentialManagement']
  },
  {
    key: 'system',
    title: '系统',
    matchCodes: ['accountManagement', 'systemManagement']
  }
]

/**
 * 根据菜单的 menuCode 判断属于哪个分组
 * @param {Object} menu - 菜单对象
 * @param {string} menu.menuCode - 菜单编码（顶级菜单的标识）
 * @returns {string} 分组 key
 */
function findGroupKey(menu) {
  const menuCode = menu.menuCode || ''

  for (const group of GROUP_CONFIG) {
    if (menuCode && group.matchCodes && group.matchCodes.includes(menuCode)) {
      return group.key
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
    const groupKey = findGroupKey(menu)
    const group = groups.find(g => g.key === groupKey)
    if (group) {
      group.items.push(menu)
    }
  }

  // 过滤掉空分组
  return groups.filter(g => g.items.length > 0)
}

export { GROUP_CONFIG }
