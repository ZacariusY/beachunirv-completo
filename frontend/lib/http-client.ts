import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Configuração padrão (fallback caso não encontre o arquivo de config)
const DEFAULT_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  AUTH_TOKEN: '',
  TIMEOUT: 10000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// Função para carregar configuração
const loadConfig = () => {
  try {
    // Tenta importar a configuração customizada
    const config = require('../config/api.config')
    return config.API_CONFIG || DEFAULT_CONFIG
  } catch {
    // Se não encontrar, usa a configuração padrão
    console.warn('Arquivo de configuração não encontrado. Usando configuração padrão.')
    return DEFAULT_CONFIG
  }
}

class HttpClient {
  private client: AxiosInstance
  private config: any

  constructor() {
    this.config = loadConfig()
    this.client = axios.create({
      baseURL: this.config.BASE_URL,
      timeout: this.config.TIMEOUT,
      headers: this.config.DEFAULT_HEADERS,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Interceptor de requisição - adiciona token automaticamente
    this.client.interceptors.request.use(
      (config) => {
        // Pega o token do localStorage dinamicamente usando a chave correta
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        
        console.log('🔑 Token encontrado no localStorage:', token ? 'SIM' : 'NÃO')
        console.log('🔗 URL da requisição:', config.url)
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('✅ Token adicionado ao header Authorization')
        } else {
          console.log('❌ Nenhum token encontrado')
        }
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Interceptor de resposta - trata erros globalmente
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        // Tratamento de erros comum
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          console.error('Token inválido ou expirado')
          // Aqui você pode implementar logout automático ou refresh token
        } else if (error.response?.status === 403) {
          console.error('Acesso negado')
        } else if (error.response?.status >= 500) {
          console.error('Erro interno do servidor')
        }
        
        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP principais
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // Método para atualizar token
  updateToken(token: string) {
    this.config.AUTH_TOKEN = token
    // Também salva no localStorage para o interceptor pegar
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  // Método para obter a instância axios (caso necessário)
  getClient(): AxiosInstance {
    return this.client
  }
}

// Exporta uma instância singleton
export const httpClient = new HttpClient()
export default httpClient 