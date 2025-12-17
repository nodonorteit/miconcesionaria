'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, CheckCircle2, XCircle } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState<'form' | 'installing' | 'success'>('form')
  const [progress, setProgress] = useState('')
  
  const [formData, setFormData] = useState({
    dbHost: '127.0.0.1',
    dbPort: '3306',
    dbName: 'miconcesionaria',
    dbUser: 'miconcesionaria',
    dbPassword: '',
    rootPassword: '' // Para crear la DB y usuario
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    setStep('installing')
    setProgress('Iniciando configuración...')

    try {
      setProgress('Creando base de datos y usuario...')
      const createResponse = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-db',
          ...formData
        }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Error al crear la base de datos')
      }

      setProgress('Aplicando migraciones...')
      const migrateResponse = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'migrate',
          ...formData
        }),
      })

      if (!migrateResponse.ok) {
        const errorData = await migrateResponse.json()
        throw new Error(errorData.error || 'Error al aplicar migraciones')
      }

      setProgress('Creando datos iniciales...')
      const seedResponse = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'seed',
          ...formData
        }),
      })

      if (!seedResponse.ok) {
        const errorData = await seedResponse.json()
        throw new Error(errorData.error || 'Error al crear datos iniciales')
      }

      setProgress('Finalizando configuración...')
      const finalizeResponse = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'finalize',
          ...formData
        }),
      })

      if (!finalizeResponse.ok) {
        const errorData = await finalizeResponse.json()
        throw new Error(errorData.error || 'Error al finalizar configuración')
      }

      setStep('success')
      setSuccess('¡Configuración completada exitosamente!')
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStep('form')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">¡Configuración Completada!</CardTitle>
            <CardDescription>
              El sistema ha sido configurado exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Serás redirigido al inicio de sesión en unos segundos...
              </AlertDescription>
            </Alert>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Credenciales por defecto:</strong></p>
              <p>Email: <code className="bg-gray-100 px-2 py-1 rounded">admin@miconcesionaria.com</code></p>
              <p>Contraseña: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code></p>
              <p className="text-xs text-yellow-600 mt-4">
                ⚠️ Se te pedirá cambiar la contraseña en el primer inicio de sesión
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-6 w-6" />
            <CardTitle className="text-2xl">Configuración Inicial</CardTitle>
          </div>
          <CardDescription>
            Configura la base de datos para comenzar a usar el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'installing' && (
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <div>
                  <p className="font-medium">{progress}</p>
                  <p className="text-sm text-gray-500">Por favor, espera...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbHost">Host de Base de Datos</Label>
                <Input
                  id="dbHost"
                  value={formData.dbHost}
                  onChange={(e) => setFormData({ ...formData, dbHost: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbPort">Puerto</Label>
                <Input
                  id="dbPort"
                  type="number"
                  value={formData.dbPort}
                  onChange={(e) => setFormData({ ...formData, dbPort: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dbName">Nombre de la Base de Datos</Label>
              <Input
                id="dbName"
                value={formData.dbName}
                onChange={(e) => setFormData({ ...formData, dbName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbUser">Usuario de Base de Datos</Label>
                <Input
                  id="dbUser"
                  value={formData.dbUser}
                  onChange={(e) => setFormData({ ...formData, dbUser: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbPassword">Contraseña del Usuario</Label>
                <Input
                  id="dbPassword"
                  type="password"
                  value={formData.dbPassword}
                  onChange={(e) => setFormData({ ...formData, dbPassword: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rootPassword">Contraseña Root (para crear DB y usuario)</Label>
              <Input
                id="rootPassword"
                type="password"
                value={formData.rootPassword}
                onChange={(e) => setFormData({ ...formData, rootPassword: e.target.value })}
                required
                disabled={isLoading}
                placeholder="Se usará solo para crear la DB y usuario"
              />
              <p className="text-xs text-gray-500">
                Esta contraseña se usa solo durante la instalación para crear la base de datos y el usuario
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando...
                </>
              ) : (
                'Iniciar Configuración'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

