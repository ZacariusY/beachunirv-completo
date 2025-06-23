import { httpClient } from '@/lib/http-client'
import { toast } from 'sonner'
import { TokenManager } from '@/lib/localStorage'

// Types para usuário
export interface User {
  id: number
  name: string
  email: string
  profileImageUrl?: string
  role: 'ADM' | 'ATLETA'
  status: boolean
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  profileImageUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export class UserActions {
  /**
   * Buscar dados do usuário atual
   */
  static async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 Buscando dados do usuário atual...')
      
      // Recuperar dados do usuário do localStorage usando TokenManager
      const userData = TokenManager.getUserData<User>()
      if (!userData) {
        throw new Error('Usuário não autenticado')
      }

      console.log('✅ Dados do usuário recuperados:', userData)
      
      return userData
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuário atual:', error)
      throw new Error(error.message || 'Erro ao buscar dados do usuário')
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async getUserById(userId: number): Promise<User> {
    try {
      console.log('👤 Buscando usuário por ID:', userId)
      
      const response = await httpClient.get(`/users/${userId}`)
      console.log('✅ Usuário encontrado:', response.data)
      
      return response.data
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuário:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuário')
    }
  }

  /**
   * Atualizar dados do usuário
   */
  static async updateUser(userId: number, updateData: UpdateUserRequest): Promise<void> {
    try {
      console.log('📝 Atualizando usuário:', userId, updateData)
      
      await httpClient.put(`/users/${userId}`, updateData)
      console.log('✅ Usuário atualizado com sucesso')
      
      // Se o nome ou email foram alterados, atualizar o localStorage
      if (updateData.name || updateData.email) {
        const currentUser = await this.getCurrentUser()
        const updatedUser = {
          ...currentUser,
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.email && { email: updateData.email }),
          ...(updateData.profileImageUrl !== undefined && { profileImageUrl: updateData.profileImageUrl })
        }
        
        TokenManager.setUserData(updatedUser)
        console.log('✅ Dados atualizados no localStorage')
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar usuário:', error)
      throw new Error(error.response?.data?.message || 'Erro ao atualizar dados')
    }
  }

  /**
   * Alterar senha do usuário
   */
  static async changePassword(userId: number, passwordData: ChangePasswordRequest): Promise<void> {
    try {
      console.log('🔐 Alterando senha do usuário:', userId)
      
      await httpClient.put(`/users/${userId}/change-password`, passwordData)
      console.log('✅ Senha alterada com sucesso')
      
    } catch (error: any) {
      console.error('❌ Erro ao alterar senha:', error)
      throw new Error(error.response?.data?.message || 'Erro ao alterar senha')
    }
  }

  /**
   * Buscar usuário por email
   */
  static async getUserByEmail(email: string): Promise<User> {
    try {
      console.log('👤 Buscando usuário por email:', email)
      
      const response = await httpClient.get(`/users/email/${email}`)
      console.log('✅ Usuário encontrado por email:', response.data)
      
      return response.data
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuário por email:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuário')
    }
  }

  /**
   * Gerar iniciais do nome para avatar
   */
  static getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  /**
   * Validar email académico
   */
  static validateAcademicEmail(email: string): boolean {
    const academicDomains = ['@academico.unirv.edu.br', '@professor.unirv.edu.br']
    return academicDomains.some(domain => email.endsWith(domain))
  }

  /**
   * Traduzir role para português
   */
  static translateRole(role: string): string {
    const translations: Record<string, string> = {
      'ADM': 'Administrador',
      'ATLETA': 'Atleta'
    }
    return translations[role] || role
  }

  /**
   * Obter cor do badge por role
   */
  static getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'ADM': 'bg-purple-100 text-purple-800',
      'ATLETA': 'bg-blue-100 text-blue-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Logout do usuário
   */
  static logout(): void {
    console.log('🚪 Fazendo logout...')
    
    // Limpar dados do localStorage usando TokenManager
    TokenManager.clearAuthData()
    
    console.log('✅ Logout realizado')
    
    // Redirecionar para página de login
    window.location.href = '/'
  }
} 