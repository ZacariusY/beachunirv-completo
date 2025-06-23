import httpClient from '@/lib/http-client'
import { TokenManager } from '@/lib/localStorage'
import { 
  Loan, 
  CreateLoanRequest, 
  UpdateLoanRequest, 
  LoanFilters,
  LoanStatus,
  ApiResponse 
} from '@/types/api.types'

// Configuração dos endpoints
const ENDPOINTS = {
  LOANS: '/loans',
  LOANS_BY_USER: '/loans/user',
  LOANS_BY_EQUIPMENT: '/loans/equipment', 
  LOANS_BY_STATUS: '/loans/status'
}

export class LoansActions {
  /**
   * Busca todos os empréstimos
   */
  static async getAllLoans(): Promise<Loan[]> {
    try {
      const response = await httpClient.get<Loan[]>(ENDPOINTS.LOANS)
      return response || []
    } catch (error: any) {
      console.error('Erro ao buscar empréstimos:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar empréstimos')
    }
  }

  /**
   * Busca empréstimo por ID
   */
  static async getLoanById(id: number): Promise<Loan> {
    try {
      const response = await httpClient.get<Loan>(`${ENDPOINTS.LOANS}/${id}`)
      return response
    } catch (error: any) {
      console.error('Erro ao buscar empréstimo:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar empréstimo')
    }
  }

  /**
   * Busca empréstimos do usuário logado
   */
  static async getMyLoans(): Promise<Loan[]> {
    try {
      // Pega o usuário do TokenManager
      const user = TokenManager.getUserData()
      if (!user || !user.id) {
        throw new Error('Usuário não encontrado. Faça login novamente.')
      }
      
      const response = await httpClient.get<Loan[]>(`${ENDPOINTS.LOANS_BY_USER}/${user.id}`)
      return response || []
    } catch (error: any) {
      console.error('Erro ao buscar meus empréstimos:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar seus empréstimos')
    }
  }

  /**
   * Busca empréstimos por usuário
   */
  static async getLoansByUser(userId: number): Promise<Loan[]> {
    try {
      const response = await httpClient.get<Loan[]>(`${ENDPOINTS.LOANS_BY_USER}/${userId}`)
      return response || []
    } catch (error: any) {
      console.error('Erro ao buscar empréstimos do usuário:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar empréstimos do usuário')
    }
  }

  /**
   * Busca empréstimos por equipamento
   */
  static async getLoansByEquipment(equipmentId: number): Promise<Loan[]> {
    try {
      const response = await httpClient.get<Loan[]>(`${ENDPOINTS.LOANS_BY_EQUIPMENT}/${equipmentId}`)
      return response || []
    } catch (error: any) {
      console.error('Erro ao buscar empréstimos do equipamento:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar empréstimos do equipamento')
    }
  }

  /**
   * Busca empréstimos por status
   */
  static async getLoansByStatus(status: LoanStatus): Promise<Loan[]> {
    try {
      const response = await httpClient.get<Loan[]>(`${ENDPOINTS.LOANS_BY_STATUS}/${status}`)
      return response || []
    } catch (error: any) {
      console.error('Erro ao buscar empréstimos por status:', error)
      throw new Error(error.response?.data?.message || 'Erro ao buscar empréstimos por status')
    }
  }

  /**
   * Cria um novo empréstimo
   */
  static async createLoan(loanData: CreateLoanRequest): Promise<Loan> {
    try {
      const response = await httpClient.post<Loan>(ENDPOINTS.LOANS, loanData)
      return response
    } catch (error: any) {
      console.error('Erro ao criar empréstimo:', error)
      throw new Error(error.response?.data?.message || 'Erro ao criar empréstimo')
    }
  }

  /**
   * Atualiza um empréstimo
   */
  static async updateLoan(id: number, updateData: UpdateLoanRequest): Promise<void> {
    try {
      await httpClient.put(`${ENDPOINTS.LOANS}/${id}`, updateData)
    } catch (error: any) {
      console.error('Erro ao atualizar empréstimo:', error)
      throw new Error(error.response?.data?.message || 'Erro ao atualizar empréstimo')
    }
  }

  /**
   * Deleta um empréstimo
   */
  static async deleteLoan(id: number): Promise<void> {
    try {
      await httpClient.delete(`${ENDPOINTS.LOANS}/${id}`)
    } catch (error: any) {
      console.error('Erro ao deletar empréstimo:', error)
      throw new Error(error.response?.data?.message || 'Erro ao deletar empréstimo')
    }
  }

  /**
   * Inicia um empréstimo (muda status para IN_PROGRESS)
   */
  static async startLoan(id: number): Promise<void> {
    try {
      await this.updateLoan(id, { status: 'IN_PROGRESS' })
    } catch (error) {
      throw error
    }
  }

  /**
   * Finaliza um empréstimo (muda status para RETURNED)
   */
  static async finishLoan(id: number): Promise<void> {
    try {
      await this.updateLoan(id, { status: 'RETURNED' })
    } catch (error) {
      throw error
    }
  }

  /**
   * Cancela um empréstimo
   */
  static async cancelLoan(id: number): Promise<void> {
    try {
      await this.deleteLoan(id)
    } catch (error) {
      throw error
    }
  }

  /**
   * Formata data para exibição
   */
  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  /**
   * Formata horário para exibição
   */
  static formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  /**
   * Formata período completo
   */
  static formatPeriod(startDate: string, endDate: string): string {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.toDateString() === end.toDateString()) {
      // Mesmo dia
      return `${this.formatDate(startDate)} ${this.formatTime(startDate)}-${this.formatTime(endDate)}`
    } else {
      // Dias diferentes
      return `${this.formatDate(startDate)} ${this.formatTime(startDate)} - ${this.formatDate(endDate)} ${this.formatTime(endDate)}`
    }
  }

  /**
   * Traduz status para português
   */
  static translateStatus(status: LoanStatus): string {
    const translations = {
      'SCHEDULED': 'Agendado',
      'IN_PROGRESS': 'Em Andamento',
      'RETURNED': 'Devolvido',
      'PENDING': 'Pendente'
    }
    return translations[status] || status
  }

  /**
   * Retorna cor do status
   */
  static getStatusColor(status: LoanStatus): string {
    const colors = {
      'SCHEDULED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'RETURNED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
}

export default LoansActions 