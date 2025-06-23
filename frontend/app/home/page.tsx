"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Calendar, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import httpClient from "@/lib/http-client"
import LoansActions from "@/actions/loans.actions"
import { CreateLoanRequest } from "@/types/api.types"
import { useAuth } from "@/hooks/use-auth"
import { BottomNavigation } from "@/components/ui/bottom-navigation"

interface Equipment {
  id: number
  name: string
  amount: number
  imageUrl: string
}

const categories = ["Vôlei", "Futvôlei", "Beach Tennis"]

export default function HomePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "07:00",
    endTime: "10:00",
    quantity: 1,
  })
  const [isCreatingLoan, setIsCreatingLoan] = useState(false)

  // Carregar equipamentos da API
  useEffect(() => {
    loadEquipments()
  }, [])

  const loadEquipments = async () => {
    try {
      setLoading(true)
      
      // Tentar carregar da API primeiro
      try {
        const response = await httpClient.get('/equipments')
        if (response && response.length > 0) {
          console.log('📦 Equipamentos da API:', response)
          setEquipments(response)
          return
        }
      } catch (apiError) {
        console.log('⚠️ API não disponível, usando dados mock')
      }
      
      // Fallback para dados mock se API falhar ou estiver vazia
      setEquipments([
        { id: 1, name: "Bola Mikasa", amount: 4, imageUrl: "/placeholder.jpg" },
        { id: 2, name: "Bola Penalty", amount: 2, imageUrl: "/placeholder.jpg" },
        { id: 3, name: "Raquete Beach Tennis", amount: 6, imageUrl: "/placeholder.jpg" },
        { id: 4, name: "Rede Vôlei", amount: 1, imageUrl: "/placeholder.jpg" },
        { id: 5, name: "Varetas", amount: 8, imageUrl: "/placeholder.jpg" },
        { id: 6, name: "Placar Manual", amount: 3, imageUrl: "/placeholder.jpg" },
      ])
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar equipamentos:', error)
      toast.error("Erro ao carregar equipamentos")
    } finally {
      setLoading(false)
    }
  }

  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase())
    // Por enquanto, não filtramos por categoria já que não temos essa informação na API
    return matchesSearch
  })

  const handleBooking = async () => {
    if (!selectedEquipment || !bookingData.date || !user) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    if (bookingData.quantity > selectedEquipment.amount) {
      toast.error(`Quantidade máxima disponível: ${selectedEquipment.amount}`)
      return
    }

    try {
      setIsCreatingLoan(true)

      // Validar IDs
      const userId = parseInt(user.id)
      const equipmentId = parseInt(selectedEquipment.id.toString())
      
      if (isNaN(userId) || isNaN(equipmentId)) {
        toast.error("IDs inválidos. Tente fazer login novamente.")
        return
      }

      // Criar datas de início e fim - garantir que seja no futuro
      let startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}:00`)
      let endDateTime = new Date(`${bookingData.date}T${bookingData.endTime}:00`)
      
      // Se a data for hoje e horário já passou, agendar para amanhã
      const now = new Date()
      if (startDateTime <= now) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]
        startDateTime = new Date(`${tomorrowStr}T${bookingData.startTime}:00`)
        endDateTime = new Date(`${tomorrowStr}T${bookingData.endTime}:00`)
        toast.info("Data ajustada para amanhã pois o horário já passou")
      }

      // Validar datas
      if (endDateTime <= startDateTime) {
        toast.error("A hora de fim deve ser posterior à hora de início")
        return
      }

      const loanRequest: CreateLoanRequest = {
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        amount: bookingData.quantity,
        userId: userId,
        equipmentId: equipmentId,
        status: 'SCHEDULED'
      }

      console.log('📤 Enviando empréstimo:', loanRequest)
      console.log('👤 Usuário logado:', user)
      console.log('🏐 Equipamento selecionado:', selectedEquipment)
      console.log('📅 Datas:', {
        start: startDateTime,
        end: endDateTime,
        now: now
      })

      await LoansActions.createLoan(loanRequest)
      
      toast.success(`Empréstimo agendado com sucesso!`)
      setIsBookingOpen(false)
      
      // Reset form
      setBookingData({
        date: "",
        startTime: "07:00", 
        endTime: "10:00",
        quantity: 1,
      })
      
    } catch (error: any) {
      console.error('❌ Erro ao criar empréstimo:', error)
      console.error('📋 Response data:', error.response?.data)
      
      // Tentar extrair a mensagem de erro real
      let errorMessage = "Erro ao agendar empréstimo"
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          // Se for HTML de erro, extrair mensagem
          const match = error.response.data.match(/<pre>([\s\S]*?)<\/pre>/)
          if (match) {
            errorMessage = match[1].split('\n')[0] // Primeira linha do stack trace
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsCreatingLoan(false)
    }
  }

  const openBookingModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setBookingData(prev => ({
      ...prev,
      quantity: Math.min(1, equipment.amount) // Garantir que não exceda o disponível
    }))
    setIsBookingOpen(true)
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 7; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`
      options.push(timeString)
    }
    return options
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
            onClick={() => router.push('/agendados')}
          >
            <Calendar className="h-4 w-4" />
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

        {/* Categories */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          <Button
            variant={selectedCategory === "Todos" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory("Todos")}
            className="whitespace-nowrap"
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap text-white hover:bg-blue-400"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Equipment List */}
      <div className="p-4 space-y-3 pb-20">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-gray-600">Carregando equipamentos...</p>
            </div>
          </div>
        ) : filteredEquipments.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento disponível'}
            </p>
          </div>
        ) : (
          filteredEquipments.map((equipment) => (
            <Card key={equipment.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{equipment.name}</h3>
                    <p className="text-sm text-gray-600">Disponível: {equipment.amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => openBookingModal(equipment)}
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={equipment.amount === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar {selectedEquipment?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedEquipment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Data:</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]} // Não permite datas passadas
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Início:</Label>
                  <Select
                    value={bookingData.startTime}
                    onValueChange={(value) => setBookingData({ ...bookingData, startTime: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="end-time">Fim:</Label>
                  <Select
                    value={bookingData.endTime}
                    onValueChange={(value) => setBookingData({ ...bookingData, endTime: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Quantidade:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookingData({ 
                      ...bookingData, 
                      quantity: Math.max(1, bookingData.quantity - 1) 
                    })}
                    disabled={bookingData.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{bookingData.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookingData({ 
                      ...bookingData, 
                      quantity: Math.min(selectedEquipment.amount, bookingData.quantity + 1) 
                    })}
                    disabled={bookingData.quantity >= selectedEquipment.amount}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>📋 <strong>Resumo do Agendamento:</strong></p>
                <p>🏐 {selectedEquipment.name}</p>
                <p>📅 {bookingData.date ? new Date(bookingData.date).toLocaleDateString('pt-BR') : 'Selecione uma data'}</p>
                <p>⏰ {bookingData.startTime} às {bookingData.endTime}</p>
                <p>📦 Quantidade: {bookingData.quantity}</p>
              </div>

              <Button 
                onClick={handleBooking} 
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isCreatingLoan || !bookingData.date}
              >
                {isCreatingLoan ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation currentPage="home" />
    </div>
  )
}
