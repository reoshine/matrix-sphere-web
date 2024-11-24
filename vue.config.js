// vue.config.js
module.exports = {
  lintOnSave: false,
  devServer: {
    port: 8081,
    open: false,
    proxy: {
      '/matrix-sphere-sso': {
        target: 'http://192.168.0.10:7001/matrix-sphere-sso',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/matrix-sphere-sso': ''
        }
      },
      '/matrix-sphere-management': {
        target: 'http://192.168.0.10:7004/matrix-sphere-management',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/matrix-sphere-management': ''
        }
      },
      '/matrix-sphere': {
        target: 'http://192.168.0.10:7002/matrix-sphere',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/matrix-sphere': ''
        }
      },
    }
  }
}
