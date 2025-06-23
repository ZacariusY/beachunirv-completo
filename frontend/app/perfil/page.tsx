"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, X, Edit, Key, Save, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { UserActions, User as UserType, UpdateUserRequest, ChangePasswordRequest } from "@/actions/user.actions"
import { TokenManager } from "@/lib/localStorage"
import { BottomNavigation } from "@/components/ui/bottom-navigation"

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Estados para edição
  const [editData, setEditData] = useState({
    name: '',
    email: ''
  })

  // Estados para alteração de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Carregar dados do usuário
  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Primeiro verificar se há token de autenticação
      if (!TokenManager.isAuthenticated()) {
        console.log('❌ Usuário não autenticado - redirecionando para login')
        router.push('/')
        return
      }
      
      const userData = await UserActions.getCurrentUser()
      console.log('👤 Dados do usuário carregados na página de perfil:', userData)
      
      setUser(userData)
      setEditData({
        name: userData.name,
        email: userData.email
      })
    } catch (error: any) {
      console.error('Erro ao carregar dados do usuário:', error)
      toast.error('Erro ao carregar dados do usuário')
      // Se não conseguir carregar, redirecionar para login
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debug: verificar estado do localStorage ao carregar a página
    console.log('🔍 Debug localStorage ao carregar página de perfil:')
    console.log('  - Token:', TokenManager.getAuthToken())
    console.log('  - User data:', TokenManager.getUserData())
    console.log('  - Is authenticated:', TokenManager.isAuthenticated())
    
    loadUserData()
  }, [])

  // Salvar alterações do perfil
  const handleSaveProfile = async () => {
    if (!user) return

    try {
      // Validações
      if (!editData.name.trim()) {
        toast.error('Nome é obrigatório')
        return
      }

      if (!editData.email.trim()) {
        toast.error('Email é obrigatório')
        return
      }

      if (!UserActions.validateAcademicEmail(editData.email)) {
        toast.error('Email deve ser do domínio @academico.unirv.edu.br ou @professor.unirv.edu.br')
        return
      }

      // Verificar se houve mudanças
      const hasChanges = editData.name !== user.name || editData.email !== user.email
      if (!hasChanges) {
        toast.info('Nenhuma alteração foi feita')
        setIsEditOpen(false)
        return
      }

      const updateRequest: UpdateUserRequest = {}
      if (editData.name !== user.name) updateRequest.name = editData.name
      if (editData.email !== user.email) updateRequest.email = editData.email

      await UserActions.updateUser(user.id, updateRequest)
      
      // Atualizar estado local
      setUser(prev => prev ? { ...prev, ...updateRequest } : null)
      
      toast.success('Perfil atualizado com sucesso!')
      setIsEditOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil')
    }
  }

  // Alterar senha
  const handleChangePassword = async () => {
    if (!user) return

    try {
      // Validações
      if (!passwordData.currentPassword) {
        toast.error('Senha atual é obrigatória')
        return
      }

      if (!passwordData.newPassword) {
        toast.error('Nova senha é obrigatória')
        return
      }

      if (passwordData.newPassword.length < 6) {
        toast.error('Nova senha deve ter pelo menos 6 caracteres')
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Confirmação de senha não confere')
        return
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        toast.error('A nova senha deve ser diferente da atual')
        return
      }

      const changeRequest: ChangePasswordRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }

      await UserActions.changePassword(user.id, changeRequest)
      
      toast.success('Senha alterada com sucesso!')
      setIsPasswordOpen(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswords({ current: false, new: false, confirm: false })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha')
    }
  }

  // Logout
  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      UserActions.logout()
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar dados do usuário</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Voltar ao Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">BeachUnirv</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white"
            onClick={() => router.push('/home')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 pb-24">
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-6">
            {/* Profile Avatar */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {UserActions.getInitials(user.name)}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Nome:</Label>
                <p className="text-lg font-semibold mt-1">{user.name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">E-mail:</Label>
                <p className="text-lg mt-1">{user.email}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Tipo:</Label>
                <div className="mt-1">
                  <Badge className={UserActions.getRoleColor(user.role)}>
                    {UserActions.translateRole(user.role)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Status:</Label>
                <div className="mt-1">
                  <Badge className={user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {user.status ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => setIsEditOpen(true)} 
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar dados
              </Button>
              
              <Button 
                onClick={() => setIsPasswordOpen(true)} 
                variant="outline"
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                Alterar senha
              </Button>
              
              <Button 
                onClick={handleLogout} 
                variant="destructive"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tipo:</strong> {UserActions.translateRole(user.role)}
              </p>
            </div>
            
            <div>
              <Label htmlFor="edit-name">Nome:</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="mt-1"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">E-mail:</Label>
              <Input
                id="edit-email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="mt-1"
                placeholder="email@academico.unirv.edu.br"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use @academico.unirv.edu.br ou @professor.unirv.edu.br
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSaveProfile} 
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button 
                onClick={() => setIsEditOpen(false)} 
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Senha Atual:</Label>
              <div className="relative mt-1">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Digite sua senha atual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-password">Nova Senha:</Label>
              <div className="relative mt-1">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirmar Nova Senha:</Label>
              <div className="relative mt-1">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Digite novamente a nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleChangePassword} 
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <Key className="h-4 w-4 mr-2" />
                Alterar
              </Button>
              <Button 
                onClick={() => {
                  setIsPasswordOpen(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setShowPasswords({ current: false, new: false, confirm: false })
                }} 
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentPage="perfil" />
    </div>
  )
}
