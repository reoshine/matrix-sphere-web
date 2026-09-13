function configured(name, fallback) {
  const value = process.env[name]
  return (value && value.trim() ? value.trim() : fallback).replace(/\/$/, '')
}

function currentCallbackUrl() {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return `${origin}/callback`
}

export const runtimeConfig = Object.freeze({
  apiBase: configured('VUE_APP_API_BASE', '/matrix-sphere'),
  sseBase: configured('VUE_APP_SSE_BASE_URL', '/matrix-sphere/sse/v1'),
  oauth: Object.freeze({
    authorizeUrl: configured('VUE_APP_OAUTH_AUTHORIZE_URL', '/matrix-sphere/oauth2/authorize'),
    tokenUrl: configured('VUE_APP_OAUTH_TOKEN_URL', '/matrix-sphere/oauth2/token'),
    clientId: configured('VUE_APP_OAUTH_CLIENT_ID', 'matrix-sphere'),
    redirectUri: configured('VUE_APP_OAUTH_REDIRECT_URI', currentCallbackUrl()),
    scope: configured('VUE_APP_OAUTH_SCOPE', 'message.read')
  })
})

export function joinUrl(base, path) {
  return `${base.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`
}
