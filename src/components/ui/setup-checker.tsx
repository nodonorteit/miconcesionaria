'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function SetupChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      // No verificar en rutas de setup o API
      if (pathname?.startsWith('/setup') || pathname?.startsWith('/api')) {
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch('/api/setup')
        const data = await response.json()

        if (!data.setupCompleted) {
          router.push('/setup')
          return
        }
      } catch (error) {
        console.error('Error checking setup:', error)
        // Si hay error, asumir que necesita setup
        if (!pathname?.startsWith('/setup')) {
          router.push('/setup')
          return
        }
      } finally {
        setIsChecking(false)
      }
    }

    checkSetup()
  }, [pathname, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

