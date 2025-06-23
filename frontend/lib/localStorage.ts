/**
 * Utilitário para gerenciar dados no localStorage
 * Inclui verificações de segurança e tratamento de erros
 */

// Chaves do localStorage
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  PREFERENCES: 'user_preferences',
} as const

// Classe para gerenciar localStorage
export class LocalStorageManager {
  /**
   * Verifica se localStorage está disponível
   */
  private static isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window
    } catch {
      return false
    }
  }

  /**
   * Salva um item no localStorage
   */
  static setItem(key: string, value: string): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage não está disponível')
      return false
    }

    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
      return false
    }
  }

  /**
   * Obtém um item do localStorage
   */
  static getItem(key: string): string | null {
    if (!this.isAvailable()) {
      return null
    }

    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error)
      return null
    }
  }

  /**
   * Remove um item do localStorage
   */
  static removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false
    }

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error)
      return false
    }
  }

  /**
   * Limpa todo o localStorage
   */
  static clear(): boolean {
    if (!this.isAvailable()) {
      return false
    }

    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error)
      return false
    }
  }

  /**
   * Salva um objeto JSON no localStorage
   */
  static setObject(key: string, value: any): boolean {
    try {
      const jsonString = JSON.stringify(value)
      return this.setItem(key, jsonString)
    } catch (error) {
      console.error('Erro ao converter objeto para JSON:', error)
      return false
    }
  }

  /**
   * Obtém um objeto JSON do localStorage
   */
  static getObject<T = any>(key: string): T | null {
    const jsonString = this.getItem(key)
    if (!jsonString) return null

    try {
      return JSON.parse(jsonString) as T
    } catch (error) {
      console.error('Erro ao converter JSON para objeto:', error)
      return null
    }
  }
}

// Classe específica para gerenciar tokens de autenticação
export class TokenManager {
  /**
   * Salva o token de autenticação
   */
  static setAuthToken(token: string): boolean {
    return LocalStorageManager.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token)
  }

  /**
   * Obtém o token de autenticação
   */
  static getAuthToken(): string | null {
    return LocalStorageManager.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
  }

  /**
   * Remove o token de autenticação
   */
  static removeAuthToken(): boolean {
    return LocalStorageManager.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
  }

  /**
   * Salva o refresh token
   */
  static setRefreshToken(token: string): boolean {
    return LocalStorageManager.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token)
  }

  /**
   * Obtém o refresh token
   */
  static getRefreshToken(): string | null {
    return LocalStorageManager.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * Remove o refresh token
   */
  static removeRefreshToken(): boolean {
    return LocalStorageManager.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * Salva dados do usuário
   */
  static setUserData(userData: any): boolean {
    return LocalStorageManager.setObject(LOCAL_STORAGE_KEYS.USER_DATA, userData)
  }

  /**
   * Obtém dados do usuário
   */
  static getUserData<T = any>(): T | null {
    return LocalStorageManager.getObject<T>(LOCAL_STORAGE_KEYS.USER_DATA)
  }

  /**
   * Remove dados do usuário
   */
  static removeUserData(): boolean {
    return LocalStorageManager.removeItem(LOCAL_STORAGE_KEYS.USER_DATA)
  }

  /**
   * Verifica se o usuário está autenticado (tem token)
   */
  static isAuthenticated(): boolean {
    const token = this.getAuthToken()
    return !!token && token.length > 0
  }

  /**
   * Limpa todos os dados de autenticação
   */
  static clearAuthData(): boolean {
    const results = [
      this.removeAuthToken(),
      this.removeRefreshToken(),
      this.removeUserData()
    ]
    
    return results.every(result => result)
  }

  /**
   * Salva todos os dados de autenticação de uma vez
   */
  static setAuthData(authToken: string, refreshToken?: string, userData?: any): boolean {
    const results = [this.setAuthToken(authToken)]
    
    if (refreshToken) {
      results.push(this.setRefreshToken(refreshToken))
    }
    
    if (userData) {
      results.push(this.setUserData(userData))
    }
    
    return results.every(result => result)
  }
}

export default LocalStorageManager 