'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, User, Clock, Calendar } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export function Header() {
  const { data: session } = useSession()
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [companyConfig, setCompanyConfig] = useState({
    name: 'AutoMax',
    logoUrl: '/logo.svg',
    description: 'Sistema de Gestión'
  })
  const [configLoaded, setConfigLoaded] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Cargar configuración de empresa
    const loadCompanyConfig = async () => {
      try {
        console.log('🔄 Cargando configuración de empresa...')
        const response = await fetch('/api/admin/company')
        if (response.ok) {
          const data = await response.json()
          console.log('📋 Configuración cargada:', data)
          setCompanyConfig(data)
          setConfigLoaded(true)
        } else {
          console.error('❌ Error en respuesta:', response.status)
          setConfigLoaded(true)
        }
      } catch (error) {
        console.error('❌ Error loading company config:', error)
      }
    }

    loadCompanyConfig()
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {!configLoaded && (
            <div className="text-xs text-gray-500">Cargando...</div>
          )}
          <Image 
            src={companyConfig.logoUrl} 
            alt={`${companyConfig.name} Logo`}
            width={200} 
            height={60} 
            className="h-12 w-auto"
            onError={(e) => {
              console.error('❌ Error cargando logo:', companyConfig.logoUrl)
              e.currentTarget.src = '/logo.svg'
            }}
            onLoad={() => {
              console.log('✅ Logo cargado correctamente:', companyConfig.logoUrl)
            }}
          />

        </div>
        
        <div className="flex items-center space-x-4">
          {/* Fecha y Hora */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{currentDateTime.toLocaleDateString('es-AR')}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{currentDateTime.toLocaleTimeString('es-AR')}</span>
          </div>
          
          {session?.user && (
            <>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {session.user.email}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 