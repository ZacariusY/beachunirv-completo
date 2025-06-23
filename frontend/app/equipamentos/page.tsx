"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import httpClient from "@/lib/http-client"
import { toast } from "@/hooks/use-toast"
import { BottomNavigation } from "@/components/ui/bottom-navigation"

interface Equipment {
  id: number
  name: string
  amount: number
  imageUrl: string
}

export default function EquipamentosPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    amount: 0,
    imageUrl: "",
  })

  // Carregar equipamentos da API
  useEffect(() => {
    loadEquipments()
  }, [])

  const loadEquipments = async () => {
    try {
      setLoading(true)
      const response = await httpClient.get('/equipments')
      setEquipments(response || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar equipamentos",
        description: error.message || "Tente novamente",
        variant: "destructive"
      })
      // Fallback para dados mock se API falhar
      setEquipments([
        { id: 1, name: "Bola Mikasa", amount: 4, imageUrl: "/placeholder.jpg" },
        { id: 2, name: "Bola Penalty", amount: 2, imageUrl: "/placeholder.jpg" },
        { id: 3, name: "Raquete Beach Tennis", amount: 6, imageUrl: "/placeholder.jpg" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredEquipments = equipments.filter((equipment) =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = async () => {
    if (!formData.name || formData.amount <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Preencha todos os campos corretamente",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      const newEquipment = await httpClient.post('/equipments', {
        name: formData.name,
        amount: formData.amount,
        imageUrl: formData.imageUrl || "/placeholder.jpg"
      })
      
      setEquipments([...equipments, newEquipment])
      setFormData({ name: "", amount: 0, imageUrl: "" })
      setIsAddOpen(false)
      
      toast({
        title: "Equipamento criado",
        description: `${formData.name} foi adicionado com sucesso!`
      })
    } catch (error: any) {
      toast({
        title: "Erro ao criar equipamento",
        description: error.message || "Tente novamente",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setFormData({
      name: equipment.name,
      amount: equipment.amount,
      imageUrl: equipment.imageUrl,
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedEquipment || !formData.name || formData.amount <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Preencha todos os campos corretamente",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      await httpClient.put(`/equipments/${selectedEquipment.id}`, {
        name: formData.name,
        amount: formData.amount,
        imageUrl: formData.imageUrl
      })
      
      setEquipments(
        equipments.map((eq) =>
          eq.id === selectedEquipment.id
            ? { ...eq, name: formData.name, amount: formData.amount, imageUrl: formData.imageUrl }
            : eq,
        ),
      )
      setIsEditOpen(false)
      
      toast({
        title: "Equipamento atualizado",
        description: `${formData.name} foi atualizado com sucesso!`
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar equipamento",
        description: error.message || "Tente novamente",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este equipamento?")) {
      return
    }

    try {
      await httpClient.delete(`/equipments/${id}`)
      setEquipments(equipments.filter((eq) => eq.id !== id))
      
      toast({
        title: "Equipamento excluído",
        description: "Equipamento removido com sucesso!"
      })
    } catch (error: any) {
      toast({
        title: "Erro ao excluir equipamento",
        description: error.message || "Tente novamente",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">BeachUnirv</h1>
          <Button variant="ghost" size="sm" className="text-white" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
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

      {/* Equipment List */}
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Equipamentos</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          filteredEquipments.map((equipment) => (
            <Card key={equipment.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{equipment.name}</h3>
                    <p className="text-sm text-gray-600">Quantidade: {equipment.amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(equipment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(equipment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Equipment Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastro de equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Nome:</Label>
              <Input
                id="add-name"
                placeholder="Nome do equipamento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="add-amount">Quantidade:</Label>
              <Input
                id="add-amount"
                type="number"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number.parseInt(e.target.value) || 0 })}
                className="mt-1"
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="add-image">URL da Imagem:</Label>
              <Input
                id="add-image"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="mt-1"
                disabled={submitting}
              />
            </div>

            <Button 
              onClick={handleAdd} 
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome:</Label>
              <Input
                id="edit-name"
                placeholder="Nome do equipamento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="edit-amount">Quantidade:</Label>
              <Input
                id="edit-amount"
                type="number"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number.parseInt(e.target.value) || 0 })}
                className="mt-1"
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="edit-image">URL da Imagem:</Label>
              <Input
                id="edit-image"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="mt-1"
                disabled={submitting}
              />
            </div>

            <Button 
              onClick={handleUpdate} 
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentPage="equipamentos" />
    </div>
  )
}
