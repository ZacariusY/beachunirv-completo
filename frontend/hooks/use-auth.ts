import { useState, useEffect, useCallback } from 'react'
import { TokenManager } from '@/lib/localStorage'
import { AuthActions } from '@/actions/auth.actions'
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api.types'

interface UseAuthReturn {
  // Estados
  isAuthenticated: boolean
  user: any | null
  token: string | null
  loading: boolean
  
  // Ações
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  register: (userData: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<AuthResponse>
  
  // Utilitários
  initializeAuth: () => void
  clearAuth: () => void
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Função para atualizar o estado de autenticação
  const updateAuthState = useCallback(() => {
    const authToken = TokenManager.getAuthToken()
    const userData = TokenManager.getUserData()
    
    setToken(authToken)
    setUser(userData)
    setIsAuthenticated(!!authToken)
  }, [])

  // Inicializar autenticação ao montar o componente
  useEffect(() => {
    try {
      AuthActions.initializeAuth()
      updateAuthState()
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }, [updateAuthState])

  // Função de login
  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const response = await AuthActions.login(credentials)
      updateAuthState()
      return response
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [updateAuthState])

  // Função de registro
  const register = useCallback(async (userData: RegisterRequest): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const response = await AuthActions.register(userData)
      updateAuthState()
      return response
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [updateAuthState])

  // Função de logout
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      await AuthActions.logout()
      updateAuthState()
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [updateAuthState])

  // Função para atualizar token
  const refreshToken = useCallback(async (): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const response = await AuthActions.refreshToken()
      updateAuthState()
      return response
    } catch (error) {
      console.error('Erro ao atualizar token:', error)
      updateAuthState() // Atualiza estado mesmo se falhar (pode ter limpado dados)
      throw error
    } finally {
      setLoading(false)
    }
  }, [updateAuthState])

  // Função para inicializar autenticação manualmente
  const initializeAuth = useCallback(() => {
    AuthActions.initializeAuth()
    updateAuthState()
  }, [updateAuthState])

  // Função para limpar autenticação
  const clearAuth = useCallback(() => {
    TokenManager.clearAuthData()
    updateAuthState()
  }, [updateAuthState])

  return {
    // Estados
    isAuthenticated,
    user,
    token,
    loading,
    
    // Ações
    login,
    register,
    logout,
    refreshToken,
    
    // Utilitários
    initializeAuth,
    clearAuth
  }
}

export default useAuth 