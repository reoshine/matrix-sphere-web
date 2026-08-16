/**
 * 统一操作确认弹窗工具
 * 替代 sweetalert2，收拢至 Element UI ElMessageBox 体系
 */
import { MessageBox, Message } from 'element-ui'

/**
 * 操作确认弹窗
 * @param {Object} options
 * @param {string} options.title - 弹窗标题
 * @param {string} options.message - 提示内容（支持 HTML）
 * @param {string} [options.confirmText='确定'] - 确认按钮文字
 * @param {string} [options.cancelText='取消'] - 取消按钮文字
 * @param {string} [options.type='warning'] - 弹窗类型：warning / info / success / error
 * @returns {Promise}
 */
export function confirmAction(options) {
  return MessageBox.confirm(
    options.message,
    options.title || '确认操作',
    {
      confirmButtonText: options.confirmText || '确定',
      cancelButtonText: options.cancelText || '取消',
      type: options.type || 'warning',
      dangerouslyUseHTMLString: true,
      closeOnClickModal: false,
    }
  )
}

/**
 * 成功提示（轻量级，自动消失）
 * @param {string} message - 提示内容
 * @param {number} [duration=1500] - 显示时长（毫秒）
 */
export function showSuccess(message, duration = 1500) {
  Message({
    message,
    type: 'success',
    duration,
  })
}

/**
 * 错误提示
 * @param {string} message - 提示内容
 */
export function showError(message) {
  Message({
    message,
    type: 'error',
    duration: 3000,
  })
}
