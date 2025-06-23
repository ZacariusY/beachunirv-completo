'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { TokenManager } from '@/lib/localStorage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function AuthExample() {
  const { 
    isAuthenticated, 
    user, 
    token, 
    loading, 
    login, 
    logout 
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login({ email, password })
      console.log('Login realizado com sucesso!')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      console.log('Logout realizado com sucesso!')
    } catch (err: any) {
      console.error('Erro no logout:', err)
    }
  }

  // Exemplo de como acessar o token diretamente
  const handleShowToken = () => {
    const currentToken = TokenManager.getAuthToken()
    alert(`Token atual: ${currentToken?.substring(0, 50)}...`)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {!isAuthenticated ? (
        // Formulário de Login
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        // Usuário logado
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Usuário:</strong> {user?.name || user?.email || 'N/A'}
            </div>
            
            <div>
              <strong>Status:</strong> 
              <span className="text-green-600 ml-2">Autenticado</span>
            </div>

            <div className="space-y-2">
              <Button onClick={handleShowToken} variant="outline" className="w-full">
                Mostrar Token
              </Button>
              
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>Token presente:</strong> {token ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Autenticado:</strong> {isAuthenticated ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Loading:</strong> {loading ? 'Sim' : 'Não'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 