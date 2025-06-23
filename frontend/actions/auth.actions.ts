import httpClient from '@/lib/http-client'
import { TokenManager } from '@/lib/localStorage'
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse 
} from '@/types/api.types'

// Configuração dos endpoints
const ENDPOINTS = {
  LOGIN: '/auth/login', // Endpoint principal com validações completas
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  VERIFY_TOKEN: '/auth/verify'
}

export class AuthActions {
  /**
   * Realiza login do usuário
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<ApiResponse<AuthResponse>>(
        ENDPOINTS.LOGIN, 
        credentials
      )
      
      if (response.success && response.data) {
        console.log('✅ Login bem-sucedido - Dados recebidos:')
        console.log('  - Token:', response.data.token)
        console.log('  - Usuário:', response.data.user)
        console.log('  - Role do usuário:', response.data.user?.role)
        console.log('  - Email do usuário:', response.data.user?.email)
        
        // Salva o token no cliente HTTP
        httpClient.updateToken(response.data.token)
        
        // Salva no localStorage usando o TokenManager
        const saveResult = TokenManager.setAuthData(
          response.data.token,
          response.data.refreshToken,
          response.data.user
        )
        
        console.log('💾 Dados salvos no localStorage:', saveResult)
        
        // Verificar se foi salvo corretamente
        const savedUser = TokenManager.getUserData()
        console.log('🔍 Verificação - Dados salvos:', savedUser)
        
        return response.data
      }
      
      throw new Error(response.message || 'Erro ao realizar login')
    } catch (error: any) {
      console.error('Erro no login:', error)
      throw new Error(error.response?.data?.message || 'Erro ao realizar login')
    }
  }

  /**
   * Registra novo usuário
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<ApiResponse<AuthResponse>>(
        ENDPOINTS.REGISTER, 
        userData
      )
      
      if (response.success && response.data) {
        // Automaticamente faz login após registro
        httpClient.updateToken(response.data.token)
        
        // Salva no localStorage usando o TokenManager
        TokenManager.setAuthData(
          response.data.token,
          response.data.refreshToken,
          response.data.user
        )
        
        return response.data
      }
      
      throw new Error(response.message || 'Erro ao registrar usuário')
    } catch (error: any) {
      console.error('Erro no registro:', error)
      throw new Error(error.response?.data?.message || 'Erro ao registrar usuário')
    }
  }

  /**
   * Atualiza token usando refresh token
   */
  static async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = TokenManager.getRefreshToken()

      if (!refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      const response = await httpClient.post<ApiResponse<AuthResponse>>(
        ENDPOINTS.REFRESH, 
        { refreshToken }
      )
      
      if (response.success && response.data) {
        httpClient.updateToken(response.data.token)
        
        // Atualiza tokens no localStorage
        TokenManager.setAuthData(
          response.data.token,
          response.data.refreshToken
        )
        
        return response.data
      }
      
      throw new Error(response.message || 'Erro ao atualizar token')
    } catch (error: any) {
      console.error('Erro ao atualizar token:', error)
      // Se falhar, faz logout
      this.logout()
      throw new Error(error.response?.data?.message || 'Sessão expirada')
    }
  }

  /**
   * Realiza logout do usuário
   */
  static async logout(): Promise<void> {
    try {
      await httpClient.post(ENDPOINTS.LOGOUT)
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error)
    } finally {
      // Limpa dados locais independente do resultado da API
      httpClient.updateToken('')
      TokenManager.clearAuthData()
    }
  }

  /**
   * Verifica se o token é válido
   */
  static async verifyToken(): Promise<boolean> {
    try {
      const token = TokenManager.getAuthToken()

      if (!token) return false

      const response = await httpClient.post<ApiResponse<boolean>>(
        ENDPOINTS.VERIFY_TOKEN
      )
      
      return response.success && response.data
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      return false
    }
  }

  /**
   * Obtém dados do usuário do localStorage
   */
  static getCurrentUser() {
    return TokenManager.getUserData()
  }

  /**
   * Verifica se o usuário está logado
   */
  static isAuthenticated(): boolean {
    return TokenManager.isAuthenticated()
  }

  /**
   * Obtém token do localStorage
   */
  static getToken(): string | null {
    return TokenManager.getAuthToken()
  }

  /**
   * Inicializa a autenticação ao carregar a aplicação
   * Verifica se há token no localStorage e configura o httpClient
   */
  static initializeAuth(): void {
    const token = TokenManager.getAuthToken()
    
    if (token) {
      httpClient.updateToken(token)
    }
  }
}

export default AuthActions 