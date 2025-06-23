"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Edit, X, Plus, Trash2, CheckCircle, Filter, SortDesc } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import LoansActions from "@/actions/loans.actions"
import { Loan, LoanStatus, UpdateLoanRequest } from "@/types/api.types"
import { useAuth } from "@/hooks/use-auth"
import { BottomNavigation } from "@/components/ui/bottom-navigation"

export default function AgendadosPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<LoanStatus | "ALL">("ALL")
  const [sortBy, setSortBy] = useState<"date" | "equipment" | "status">("date")
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [editData, setEditData] = useState<UpdateLoanRequest>({})

  // Verificar se é administrador
  const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}')
    
    // Verificação dupla: por role E por email específico
    const isAdminByRole = user?.role === 'ADM'
    const isAdminByEmail = user?.email === 'teste@academico.unirv.edu.br'
    
    console.log('🔍 DEBUG isAdmin():')
    console.log('  - Usuário:', user)
    console.log('  - É admin por role?:', isAdminByRole)
    console.log('  - É admin por email?:', isAdminByEmail)
    
    return isAdminByRole || isAdminByEmail
  }

  // Carrega empréstimos do usuário
  useEffect(() => {
    loadMyLoans()
  }, [])

  const loadMyLoans = async () => {
    try {
      setLoading(true)
      
      // Se for ADM, carregar todos os empréstimos, senão só os próprios
      const user = JSON.parse(localStorage.getItem('user_data') || '{}')
      const isAdminUser = isAdmin() // Usar a função isAdmin() em vez de verificação inline
      
      console.log('🔍 DEBUG - Verificando permissões de usuário:')
      console.log('📋 Dados do usuário no localStorage:', user)
      console.log('👑 É admin?:', isAdminUser)
      console.log('📧 Email:', user?.email)
      console.log('🎭 Role:', user?.role)
      
      let loans
      if (isAdminUser) {
        console.log('👑 Usuário ADM detectado - carregando todos os empréstimos')
        loans = await LoansActions.getAllLoans()
        console.log('📊 Total de empréstimos carregados (getAllLoans):', loans.length)
      } else {
        console.log('👤 Usuário normal - carregando apenas seus empréstimos')
        loans = await LoansActions.getMyLoans()
        console.log('📊 Total de empréstimos carregados (getMyLoans):', loans.length)
      }
      
      console.log('📋 Empréstimos carregados:', loans)
      setLoans(loans)
    } catch (error: any) {
      console.error('❌ Erro ao carregar empréstimos:', error)
      console.error('📋 Detalhes do erro:', error.response?.data)
      toast.error(error.message || 'Erro ao carregar empréstimos')
    } finally {
      setLoading(false)
    }
  }

  // Filtra e ordena empréstimos
  const filteredAndSortedLoans = loans
    .filter((loan) => {
      const matchesSearch = loan.equipment.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || loan.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        case "equipment":
          return a.equipment.name.localeCompare(b.equipment.name)
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const handleEdit = (loan: Loan) => {
    // Verificar se usuário tem permissão para editar
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}')
    const userIsAdmin = isAdmin()
    
    if (!userIsAdmin) {
      // Usuário normal só pode editar seus próprios empréstimos
      if (loan.user.id !== currentUser.id) {
        toast.error('Você só pode editar seus próprios empréstimos')
        return
      }
      
      // Usuário normal não pode editar empréstimos finalizados
      if (loan.status === 'RETURNED') {
        toast.error('Não é possível editar empréstimos já finalizados')
        return
      }
    }
    
    setSelectedLoan(loan)
    setEditData({
      startDate: loan.startDate.split('T')[0],
      endDate: loan.endDate.split('T')[0],
      amount: loan.amount,
      status: loan.status
    })
    setIsEditOpen(true)
  }

  const handleSave = async () => {
    if (!selectedLoan) return

    try {
      // Converter datas para ISO string se foram alteradas
      const updatePayload: UpdateLoanRequest = {}
      
      if (editData.startDate && editData.startDate !== selectedLoan.startDate.split('T')[0]) {
        const originalTime = new Date(selectedLoan.startDate).toISOString().split('T')[1]
        const startDateTime = new Date(editData.startDate + 'T' + originalTime)
        updatePayload.startDate = startDateTime.toISOString()
      }
      
      if (editData.endDate && editData.endDate !== selectedLoan.endDate.split('T')[0]) {
        const originalTime = new Date(selectedLoan.endDate).toISOString().split('T')[1]
        const endDateTime = new Date(editData.endDate + 'T' + originalTime)
        updatePayload.endDate = endDateTime.toISOString()
      }
      
      if (editData.amount !== undefined && editData.amount !== selectedLoan.amount) {
        updatePayload.amount = editData.amount
      }
      
      if (editData.status && editData.status !== selectedLoan.status) {
        // Só ADM pode alterar status
        const userIsAdmin = isAdmin()
        if (userIsAdmin) {
          updatePayload.status = editData.status
        } else {
          toast.error('Apenas administradores podem alterar o status')
          return
        }
      }

      // Só atualiza se houver mudanças
      if (Object.keys(updatePayload).length === 0) {
        toast.info('Nenhuma alteração foi feita')
        setIsEditOpen(false)
        return
      }

      await LoansActions.updateLoan(selectedLoan.id, updatePayload)
      toast.success('Empréstimo atualizado com sucesso!')
      
      setIsEditOpen(false)
      loadMyLoans() // Recarrega a lista
    } catch (error: any) {
      console.error('Erro ao atualizar empréstimo:', error)
      toast.error(error.message || 'Erro ao atualizar empréstimo')
    }
  }

  const handleFinishLoan = async (loanId: number) => {
    try {
      await LoansActions.finishLoan(loanId)
      toast.success('Empréstimo finalizado!')
      loadMyLoans()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao finalizar empréstimo')
    }
  }

  const handleCancelLoan = async (loanId: number) => {
    if (!confirm('Tem certeza que deseja cancelar este empréstimo?')) return

    try {
      await LoansActions.cancelLoan(loanId)
      toast.success('Empréstimo cancelado!')
      loadMyLoans()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar empréstimo')
    }
  }

  const getStatusActions = (loan: Loan) => {
    const adminMode = isAdmin()
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}')
    const isOwnLoan = loan.user.id === currentUser.id
    
    switch (loan.status) {
      case 'SCHEDULED':
      case 'PENDING':
        return (
          <div className="flex gap-2">
            {(adminMode || isOwnLoan) && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleEdit(loan)}
                title="Editar empréstimo"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {adminMode && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleFinishLoan(loan.id)}
                className="text-green-600 hover:text-green-700"
                title="Marcar como concluído (ADM)"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            {(adminMode || isOwnLoan) && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCancelLoan(loan.id)}
                className="text-red-600 hover:text-red-700"
                title="Cancelar empréstimo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      case 'IN_PROGRESS':
        return (
          <div className="flex gap-2">
            {adminMode && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleEdit(loan)}
                title="Editar empréstimo (ADM)"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {(adminMode || isOwnLoan) && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleFinishLoan(loan.id)}
                className="text-blue-600 hover:text-blue-700"
                title="Finalizar empréstimo"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      case 'RETURNED':
        return (
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-green-600">
              Concluído
            </Badge>
            {adminMode && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleEdit(loan)}
                title="Editar empréstimo (ADM)"
                className="ml-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // Estatísticas rápidas
  const stats = {
    total: loans.length,
    scheduled: loans.filter(l => l.status === 'SCHEDULED').length,
    inProgress: loans.filter(l => l.status === 'IN_PROGRESS').length,
    returned: loans.filter(l => l.status === 'RETURNED').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando empréstimos...</p>
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

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar equipamentos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-white rounded-lg shadow-sm">
            <p className="text-lg font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm">
            <p className="text-lg font-bold text-yellow-600">{stats.scheduled}</p>
            <p className="text-xs text-gray-600">Agendados</p>
          </div>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm">
            <p className="text-lg font-bold text-orange-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-600">Em Andamento</p>
          </div>
          <div className="text-center p-2 bg-white rounded-lg shadow-sm">
            <p className="text-lg font-bold text-green-600">{stats.returned}</p>
            <p className="text-xs text-gray-600">Concluídos</p>
          </div>
        </div>

        {/* Filtros e Ordenação */}
        <div className="flex gap-2 mb-4">
          <Select value={statusFilter} onValueChange={(value: LoanStatus | "ALL") => setStatusFilter(value)}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="SCHEDULED">Agendados</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
              <SelectItem value="RETURNED">Concluídos</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: "date" | "equipment" | "status") => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SortDesc className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Data</SelectItem>
              <SelectItem value="equipment">Equipamento</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isAdmin() ? 'Todos os Empréstimos' : 'Meus Empréstimos'}
            {filteredAndSortedLoans.length !== loans.length && (
              <span className="text-sm text-gray-500 ml-2">
                ({filteredAndSortedLoans.length} de {loans.length})
              </span>
            )}
          </h2>
          <Button 
            onClick={() => router.push('/home')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </div>

        {filteredAndSortedLoans.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum empréstimo encontrado' : 'Você ainda não tem empréstimos'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => router.push('/home')}
                className="mt-4 bg-blue-500 hover:bg-blue-600"
              >
                Fazer Primeiro Empréstimo
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedLoans.map((loan) => (
              <Card key={loan.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{loan.equipment.name}</h3>
                        <Badge className={LoansActions.getStatusColor(loan.status)}>
                          {LoansActions.translateStatus(loan.status)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📅 {LoansActions.formatPeriod(loan.startDate, loan.endDate)}</p>
                        <p>📦 Quantidade: {loan.amount}</p>
                        {isAdmin() && (
                          <p>👤 Usuário: {loan.user.name} ({loan.user.email})</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {getStatusActions(loan)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Empréstimo - {selectedLoan?.equipment.name}</DialogTitle>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Status atual:</strong> {LoansActions.translateStatus(selectedLoan.status)}
                </p>
                <p className="text-sm text-blue-600">
                  <strong>Período atual:</strong> {LoansActions.formatPeriod(selectedLoan.startDate, selectedLoan.endDate)}
                </p>
              </div>
              
              <div>
                <Label htmlFor="edit-start-date">Data de Início:</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={editData.startDate || ''}
                  onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-end-date">Data de Fim:</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={editData.endDate || ''}
                  onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                  min={editData.startDate || new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Quantidade:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditData({ 
                      ...editData, 
                      amount: Math.max(1, (editData.amount || 1) - 1) 
                    })}
                    disabled={(editData.amount || 1) <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{editData.amount || 1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditData({ 
                      ...editData, 
                      amount: (editData.amount || 1) + 1 
                    })}
                  >
                    +
                  </Button>
                </div>
              </div>

              {isAdmin() && (
                <div>
                  <Label>Status:</Label>
                  <Select 
                    value={editData.status || selectedLoan.status} 
                    onValueChange={(value: LoanStatus) => setEditData({ ...editData, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Agendado</SelectItem>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                      <SelectItem value="RETURNED">Devolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                {isAdmin() ? (
                  <>👑 <strong>Modo ADM:</strong> Você pode alterar qualquer campo de qualquer empréstimo.</>
                ) : (
                  <>💡 <strong>Dica:</strong> Você só pode editar empréstimos que não foram finalizados.</>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation currentPage="agendados" />
    </div>
  )
}
