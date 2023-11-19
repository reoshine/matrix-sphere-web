// vue.config.js
module.exports = {
  lintOnSave: false,
  devServer: {
    port: 8081,
    open: false,
    proxy: {
      '/adp-sso': {
        target: 'http://192.168.0.10:7001/adp-sso',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/adp-sso': ''
        }
      },
      '/adp-matrix': {
        target: 'http://192.168.0.10:7002/adp-matrix',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/adp-matrix': ''
        }
      }
    }
  }
}
