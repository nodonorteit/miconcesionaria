'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Página deshabilitada: redirige a Proveedores
export default function WorkshopsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/providers')
  }, [router])

  return null
}
