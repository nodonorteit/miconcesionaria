'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Car } from 'lucide-react'
import Image from 'next/image'
import { useCompanyConfig } from '@/hooks/useCompanyConfig'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { companyConfig, loading: configLoading } = useCompanyConfig()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales inválidas')
      } else {
        const session = await getSession()
        if (session) {
          router.push('/')
        }
      }
    } catch (error) {
      setError('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {configLoading ? (
              <div className="h-16 w-48 bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-gray-500">Cargando...</span>
              </div>
            ) : companyConfig.logoUrl ? (
              <Image 
                src={companyConfig.logoUrl} 
                alt={`${companyConfig.name || 'Empresa'} Logo`}
                width={240} 
                height={72} 
                className="h-16 w-auto"
                unoptimized={companyConfig.logoUrl.startsWith('/uploads/')}
                onError={(e) => {
                  console.error('Error loading logo:', companyConfig.logoUrl)
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="h-16 w-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {companyConfig.name || 'Sistema de Gestión'}
                </span>
              </div>
            )}
          </div>
          <CardDescription>
            Inicia sesión en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 