// Arquivo de configuração da API - BeachUnirv

export const API_CONFIG = {
  // URL base da API do backend
  BASE_URL: 'http://localhost:3001/api',
  
  // Token de autenticação (será definido dinamicamente)
  AUTH_TOKEN: '',
  
  // Configurações de timeout
  TIMEOUT: 10000, // 10 segundos
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints da API
  ENDPOINTS: {
    // Autenticação
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    
    // Usuários
    USERS: '/users',
    PROFILE: '/users/profile',
    
    // Equipamentos
    EQUIPMENTS: '/equipments',
    EQUIPMENT_TYPES: '/equipment-types',
    
    // Agendamentos
    SCHEDULES: '/schedules',
    SCHEDULE_AVAILABILITY: '/schedules/availability',
    
    // Outros endpoints
    UPLOAD: '/upload',
  }
}

// Configurações específicas por ambiente
export const ENV_CONFIG = {
  development: {
    ...API_CONFIG,
    BASE_URL: 'http://localhost:3001/api',
  },
  production: {
    ...API_CONFIG,
    BASE_URL: 'https://sua-api-producao.com/api',
  },
  staging: {
    ...API_CONFIG,
    BASE_URL: 'https://sua-api-staging.com/api',
  }
} 