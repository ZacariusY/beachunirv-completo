"use client"

import { Button } from "@/components/ui/button"
import { Home, Calendar, User, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface BottomNavigationProps {
  currentPage?: 'home' | 'agendados' | 'equipamentos' | 'perfil'
}

export function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo se der erro no servidor, limpa localmente e redireciona
      router.push("/")
    }
  }

  const getButtonVariant = (page: string) => {
    return currentPage === page ? "default" : "ghost"
  }

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Button 
            variant={getButtonVariant('home')} 
            className="flex flex-col items-center gap-1" 
            asChild
          >
            <a href="/home">
              <Home className="h-5 w-5" />
              <span className="text-xs">Início</span>
            </a>
          </Button>
          
          <Button 
            variant={getButtonVariant('agendados')} 
            className="flex flex-col items-center gap-1" 
            asChild
          >
            <a href="/agendados">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Agendados</span>
            </a>
          </Button>
          
          <Button 
            variant={getButtonVariant('perfil')} 
            className="flex flex-col items-center gap-1" 
            asChild
          >
            <a href="/perfil">
              <User className="h-5 w-5" />
              <span className="text-xs">Perfil</span>
            </a>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-1" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs">Sair</span>
          </Button>
        </div>
      </div>

      {/* Spacer for fixed bottom navigation */}
      <div className="h-20"></div>
    </>
  )
} 