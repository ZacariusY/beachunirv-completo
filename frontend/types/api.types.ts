// Tipos para o sistema BeachUnirv

// Tipos de resposta da API
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos de autenticação
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

// Tipos de usuário
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  avatar?: string
}

// Tipos de equipamentos
export interface Equipment {
  id: string
  name: string
  description: string
  image?: string
  typeId: string
  type: EquipmentType
  available: boolean
  pricePerHour: number
  createdAt: string
  updatedAt: string
}

export interface EquipmentType {
  id: string
  name: string
  description: string
  icon?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEquipmentRequest {
  name: string
  description: string
  typeId: string
  pricePerHour: number
  image?: string
}

export interface UpdateEquipmentRequest {
  name?: string
  description?: string
  typeId?: string
  pricePerHour?: number
  available?: boolean
  image?: string
}

// Tipos de empréstimos/agendamentos
export interface Loan {
  id: number
  startDate: string
  endDate: string
  amount: number
  status: LoanStatus
  user: {
    id: number
    name: string
    email: string
  }
  equipment: {
    id: number
    name: string
    imageUrl?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateLoanRequest {
  startDate: string
  endDate: string
  amount: number
  userId: number
  equipmentId: number
  status?: LoanStatus
}

export interface UpdateLoanRequest {
  startDate?: string
  endDate?: string
  amount?: number
  status?: LoanStatus
}

export type LoanStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'RETURNED' | 'PENDING'

// Tipos de agendamentos
export interface Schedule {
  id: string
  userId: string
  user: User
  equipmentId: string
  equipment: Equipment
  startTime: string
  endTime: string
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateScheduleRequest {
  equipmentId: string
  startTime: string
  endTime: string
  notes?: string
}

export interface UpdateScheduleRequest {
  startTime?: string
  endTime?: string
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes?: string
}

export interface AvailabilityRequest {
  equipmentId: string
  date: string // formato YYYY-MM-DD
}

export interface AvailabilityResponse {
  date: string
  equipment: Equipment
  availableSlots: TimeSlot[]
  bookedSlots: TimeSlot[]
}

export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
}

// Tipos de filtros e queries
export interface EquipmentFilters {
  typeId?: string
  available?: boolean
  minPrice?: number
  maxPrice?: number
  search?: string
}

export interface ScheduleFilters {
  status?: string
  equipmentType?: string
  startDate?: string
  endDate?: string
  userId?: string
}

export interface LoanFilters {
  status?: LoanStatus
  equipmentId?: number
  userId?: number
  startDate?: string
  endDate?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Tipos de upload
export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

// Tipos de erro
export interface ApiError {
  status: number
  message: string
  errors?: string[]
  code?: string
} 