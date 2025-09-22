import { sso, sphere } from '@/axios'

export function login() {
    return sphere.get('/client/login')
}


export function logout() {
  return sso.get('/logout')
}

export function refreshToken(data) {
  return sso.post('/oauth2/token', data)
}