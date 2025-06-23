# Integração com API - BeachUnirv

Este documento explica como configurar e usar a integração com o backend do BeachUnirv.

## Configuração Inicial

### 1. Configure sua API

Copie o arquivo de exemplo de configuração:

```bash
cp config/api.config.example.ts config/api.config.ts
```

### 2. Edite o arquivo de configuração

Abra o arquivo `config/api.config.ts` e configure:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api', // URL do seu backend
  AUTH_TOKEN: 'seu_token_jwt_aqui',      // Seu token JWT
  TIMEOUT: 10000,
  // ... outras configurações
}
```

**⚠️ Importante:** Adicione `config/api.config.ts` ao seu `.gitignore` para não subir credenciais.

## Como Usar

### Autenticação

```typescript
import { authActions } from '@/actions'

// Login
try {
  const result = await authActions.login({
    email: 'usuario@email.com',
    password: 'senha123'
  })
  console.log('Usuário logado:', result.user)
} catch (error) {
  console.error('Erro no login:', error.message)
}

// Verificar se está logado
if (authActions.isAuthenticated()) {
  const user = authActions.getCurrentUser()
  console.log('Usuário atual:', user)
}

// Logout
authActions.logout()
```

### Operações CRUD Genéricas

```typescript
import { crudActions } from '@/actions'
import { Equipment, Schedule } from '@/types/api.types'

// Buscar equipamentos
const equipments = await crudActions.getAll<Equipment>('/equipments')

// Buscar equipamento específico
const equipment = await crudActions.getById<Equipment>('/equipments', 'id-do-equipamento')

// Criar agendamento
const newSchedule = await crudActions.create<Schedule>('/schedules', {
  equipmentId: 'id-do-equipamento',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T12:00:00Z'
})

// Atualizar agendamento
const updatedSchedule = await crudActions.update<Schedule>('/schedules', 'id-do-agendamento', {
  status: 'CONFIRMED'
})

// Deletar agendamento
await crudActions.delete('/schedules', 'id-do-agendamento')
```

### Requisições Personalizadas

```typescript
import { httpClient } from '@/actions'

// Buscar disponibilidade de equipamento
const availability = await httpClient.get('/schedules/availability', {
  params: {
    equipmentId: 'id-do-equipamento',
    date: '2024-01-15'
  }
})

// Upload de arquivo
const formData = new FormData()
formData.append('file', file)

const uploadResult = await httpClient.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

## Exemplos de Uso em Componentes

### Hook personalizado para autenticação

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { authActions } from '@/actions'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authActions.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (credentials: LoginRequest) => {
    const result = await authActions.login(credentials)
    setUser(result.user)
    return result
  }

  const logout = () => {
    authActions.logout()
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: authActions.isAuthenticated()
  }
}
```

### Componente de login

```typescript
// components/LoginForm.tsx
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
      // Redirecionar ou mostrar sucesso
    } catch (error) {
      console.error('Erro no login:', error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      <button type="submit">Entrar</button>
    </form>
  )
}
```

## Estrutura de Arquivos

```
├── config/
│   ├── api.config.example.ts  # Arquivo de exemplo
│   └── api.config.ts          # Sua configuração (não versionar)
├── lib/
│   └── http-client.ts         # Cliente HTTP principal
├── types/
│   └── api.types.ts          # Tipos TypeScript
├── actions/
│   └── index.ts              # Actions para API
└── hooks/
    └── useAuth.ts            # Hook de autenticação (opcional)
```

## Tratamento de Erros

O sistema já trata automaticamente:

- ✅ Tokens expirados (status 401)
- ✅ Acesso negado (status 403)
- ✅ Erros de servidor (status 500+)
- ✅ Timeout de requisições
- ✅ Adicionar token automaticamente nas requisições

## Próximos Passos

1. Copie e configure o arquivo de configuração
2. Implemente a autenticação nas suas páginas
3. Use as actions para conectar com seu backend
4. Personalize conforme necessário

**Dica:** Todos os métodos já retornam dados tipados com TypeScript! 🎉 