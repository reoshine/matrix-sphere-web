const devProxyTarget = process.env.MATRIX_SPHERE_DEV_PROXY_TARGET || 'http://localhost:7002'

const createBackendProxy = pathRewrite => ({
    target: devProxyTarget,
    changeOrigin: true,
    autoRewrite: true,
    xfwd: true,
    ...(pathRewrite ? { pathRewrite } : {})
})

module.exports = {
    lintOnSave: false,
    publicPath: '/',
    devServer: {
        port: 8081,
        open: false,
        proxy: {
            // 统一代理到单体后端（backend context-path=/matrix-sphere）
            '/matrix-sphere-sso': createBackendProxy({ '^/matrix-sphere-sso': '/matrix-sphere' }),
            '/matrix-sphere-management': createBackendProxy({ '^/matrix-sphere-management': '/matrix-sphere' }),
            '/matrix-sphere': createBackendProxy(),
            '/api': createBackendProxy(),
            '/oauth2': createBackendProxy({ '^/oauth2': '/matrix-sphere/oauth2' }),
            '/login': createBackendProxy({ '^/login': '/matrix-sphere/login' }),
            '/logout': createBackendProxy({ '^/logout': '/matrix-sphere/logout' })
        }
    }
}
