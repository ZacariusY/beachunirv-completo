"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const { login, register } = useAuth()
  const router = useRouter()

  // Função para alternar entre login e cadastro, limpando o formulário
  const toggleLoginMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    setShowPassword(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        await login({
          email: formData.email,
          password: formData.password
        })
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o sistema...",
        })
        
        // Pequeno delay para mostrar o toast
        setTimeout(() => {
          router.push("/home")
        }, 1000)
        
      } else {
        // Cadastro
        if (!formData.name.trim()) {
          toast({
            title: "Erro no cadastro",
            description: "Nome é obrigatório",
            variant: "destructive"
          })
          return
        }

        if (formData.name.trim().length < 2) {
          toast({
            title: "Erro no cadastro",
            description: "Nome deve ter pelo menos 2 caracteres",
            variant: "destructive"
          })
          return
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Erro no cadastro",
            description: "As senhas não coincidem",
            variant: "destructive"
          })
          return
        }

        if (formData.password.length < 6) {
          toast({
            title: "Erro no cadastro", 
            description: "A senha deve ter pelo menos 6 caracteres",
            variant: "destructive"
          })
          return
        }

        await register({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password
        })
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Redirecionando para o sistema...",
        })
        
        // Pequeno delay para mostrar o toast
        setTimeout(() => {
          router.push("/home")
        }, 1000)
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "Erro no login" : "Erro no cadastro",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">BU</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {isLogin ? "Bem vindo de volta" : "Bem vindo ao"}
            </CardTitle>
            {!isLogin && <p className="text-xl font-semibold text-blue-600 mt-1">BeachUnirv</p>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Input
                type="email"
                placeholder="E-mail acadêmico..."
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-12"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-500 hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Entrando..." : "Cadastrando..."}
                </>
              ) : (
                isLogin ? "Entrar" : "Cadastrar"
              )}
            </Button>
          </form>

          {isLogin && (
            <div className="text-center">
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
          )}

          <div className="text-center">
            <button 
              onClick={toggleLoginMode} 
              className="text-sm text-gray-600 hover:text-blue-600"
              disabled={loading}
            >
              {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
