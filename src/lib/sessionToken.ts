const ACCESS_TOKEN_KEY = 'kurio:access-token'

export const SESSION_EXPIRED_EVENT = 'kurio:session-expired'

export function getAccessToken() {
  return typeof window === 'undefined'
    ? null
    : window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}
