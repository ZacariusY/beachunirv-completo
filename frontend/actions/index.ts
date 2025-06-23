import httpClient from '@/lib/http-client'
import { TokenManager } from '@/lib/localStorage'
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse,
  PaginatedResponse,
  PaginationParams
} from '@/types/api.types'

// Actions gerais para autenticação
export const authActions = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    
    if (response.success && response.data) {
      httpClient.updateToken(response.data.token)
      
      // Usa TokenManager para salvar dados de autenticação
      TokenManager.setAuthData(
        response.data.token,
        response.data.refreshToken,
        response.data.user
      )
      
      return response.data
    }
    
    throw new Error(response.message || 'Erro ao realizar login')
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await httpClient.post<ApiResponse<AuthResponse>>('/auth/register', userData)
    
    if (response.success && response.data) {
      httpClient.updateToken(response.data.token)
      
      // Usa TokenManager para salvar dados de autenticação
      TokenManager.setAuthData(
        response.data.token,
        response.data.refreshToken,
        response.data.user
      )
      
      return response.data
    }
    
    throw new Error(response.message || 'Erro ao registrar usuário')
  },

  logout() {
    httpClient.updateToken('')
    TokenManager.clearAuthData()
  },

  getCurrentUser() {
    return TokenManager.getUserData()
  },

  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated()
  },

  getToken(): string | null {
    return TokenManager.getAuthToken()
  },

  initializeAuth(): void {
    const token = TokenManager.getAuthToken()
    if (token) {
      httpClient.updateToken(token)
    }
  }
}

// Actions gerais para CRUD - podem ser usadas para qualquer entidade
export const crudActions = {
  // Buscar todos os registros
  async getAll<T>(endpoint: string, params?: PaginationParams): Promise<T[]> {
    const response = await httpClient.get<ApiResponse<T[]>>(endpoint, { params })
    return response.data
  },

  // Buscar com paginação
  async getPaginated<T>(endpoint: string, params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const response = await httpClient.get<ApiResponse<PaginatedResponse<T>>>(endpoint, { params })
    return response.data
  },

  // Buscar por ID
  async getById<T>(endpoint: string, id: string): Promise<T> {
    const response = await httpClient.get<ApiResponse<T>>(`${endpoint}/${id}`)
    return response.data
  },

  // Criar novo registro
  async create<T>(endpoint: string, data: any): Promise<T> {
    const response = await httpClient.post<ApiResponse<T>>(endpoint, data)
    return response.data
  },

  // Atualizar registro
  async update<T>(endpoint: string, id: string, data: any): Promise<T> {
    const response = await httpClient.put<ApiResponse<T>>(`${endpoint}/${id}`, data)
    return response.data
  },

  // Deletar registro
  async delete(endpoint: string, id: string): Promise<void> {
    await httpClient.delete(`${endpoint}/${id}`)
  }
}

// Exports para facilitar o uso
export { httpClient, TokenManager }
export * from './user.actions'
export default { authActions, crudActions, httpClient, TokenManager } 