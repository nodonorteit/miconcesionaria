'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/ui/header'
import { MainNavigation } from '@/components/ui/main-navigation'
import { useDeviceType } from '@/hooks/useDeviceType'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { device, isMobile } = useDeviceType()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Rutas que no deben mostrar header y navegación
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Si es una ruta de autenticación, mostrar solo el contenido
  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // Si está cargando la sesión, mostrar loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay sesión, redirigir al login (esto se maneja en middleware, pero por si acaso)
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // Para rutas autenticadas, mostrar header y navegación
  if (isMobile) {
    return (
      <div className={`min-h-screen bg-gray-50 device-${device}`}>
        <Header />
        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              Menú
            </button>
          </div>
          {children}
        </div>

        {mobileNavOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setMobileNavOpen(false)}
          >
            <div 
              className="absolute inset-y-0 left-0 w-72 bg-white shadow-lg p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold">Menú</h3>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="text-sm px-2 py-1 border rounded"
                >
                  ✕
                </button>
              </div>
              <MainNavigation onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}
      </div>
    )
  } else {
    return (
      <div className={`min-h-screen bg-gray-50 device-${device}`}>
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
}