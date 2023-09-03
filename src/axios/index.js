import axios from 'axios'
import swal from 'sweetalert2'
import {logout} from "@/api/api";

// 设置post请求参数格式为json
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// 发送请求携带请求头
axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('adpSsoToken')}`
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
      logout().then(res => {
        localStorage.removeItem("adpSsoToken")
        window.location.href = 'http://localhost:7001/adp-sso/oauth/authorize?response_type=code&scope=all&client_id=adp-matrix&state=ok&redirect_uri=http://localhost:7001/adp-sso/sso/callback';
      }).catch(err => {
        localStorage.removeItem("adpSsoToken")
        window.location.href = 'http://localhost:7001/adp-sso/oauth/authorize?response_type=code&scope=all&client_id=adp-matrix&state=ok&redirect_uri=http://localhost:7001/adp-sso/sso/callback';
      })
    })
  }
  return res
}, error => {
  return Promise.reject(error)
})

export default axios
