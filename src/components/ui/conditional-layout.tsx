'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/ui/header'
import { MainNavigation } from '@/components/ui/main-navigation'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Rutas que no deben mostrar header y navegación
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Si es una ruta de autenticación o no hay sesión, mostrar solo el contenido
  if (isAuthRoute || status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // Para rutas autenticadas, mostrar header y navegación
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen p-4">
          <MainNavigation />
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
} 