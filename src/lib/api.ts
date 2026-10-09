import axios from 'axios'
import {
  clearAccessToken,
  getAccessToken,
  SESSION_EXPIRED_EVENT,
} from './sessionToken'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  } else {
    config.headers.delete('Authorization')
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError<{ code?: string }>(error) &&
      error.response?.data.code === 'SESSION_EXPIRED' &&
      typeof window !== 'undefined'
    ) {
      clearAccessToken()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }

    return Promise.reject(error)
  },
)
