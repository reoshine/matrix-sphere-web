import axios from 'axios'
import swal from 'sweetalert2'
// import { BASE_URL } from '@/axios/Global'

// 设置post请求参数格式为json
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// 发送请求携带请求头
axios.interceptors.request.use(config => {
  config.headers.Authorization = localStorage.getItem('adpSsoToken') === null ? null : `Bearer ${localStorage.getItem('adpSsoToken')}`
  return config
})

// 返回值如果是4003需要登录
axios.interceptors.response.use(res => {
  if (res.data.code === 4003) {
    swal({
      title: '登录已失效，请重新登录！',
      type: 'error',
      timer: '2500',
      confirmButtonText: '确定',
      showCancelButton: false
    }).then(() => {
      localStorage.removeItem('adpSsoToken')
      localStorage.removeItem('adpSsoRefreshToken')
      window.location.href = '/matrix-sphere/client/login'
    })
  }
  return res
}, error => {
  return Promise.reject(error)
})

// axios.defaults.baseURL = BASE_URL
export default axios
