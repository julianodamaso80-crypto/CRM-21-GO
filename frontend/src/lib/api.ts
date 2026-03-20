import axios from 'axios'
import { useAuthStore } from '../store/auth-store'

// Em producao (browser nao-localhost), SEMPRE usa URL relativa (mesmo servidor).
// Isso garante que mesmo se VITE_API_URL estiver setado como localhost, producao funciona.
const envUrl = import.meta.env.VITE_API_URL as string | undefined
const isProductionBrowser = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
const API_URL = isProductionBrowser ? '' : (envUrl || 'http://localhost:3333')

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // LOG: URL completa sendo chamada
    const fullUrl = `${config.baseURL}${config.url}`
    console.log('[API REQUEST]', {
      method: config.method?.toUpperCase(),
      url: fullUrl,
      params: config.params,
      hasToken: !!token,
    })

    return config
  },
  (error) => {
    console.error('[API REQUEST ERROR]', error)
    return Promise.reject(error)
  }
)

// Response interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log('[API RESPONSE SUCCESS]', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error) => {
    // LOG: Erro detalhado
    console.error('[API RESPONSE ERROR]', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      fullError: error,
    })

    if (error.response?.status === 401) {
      // Token inválido ou expirado
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
