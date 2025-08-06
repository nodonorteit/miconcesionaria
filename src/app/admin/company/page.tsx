'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/ui/navigation'
import { Building, Upload, Save } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface CompanyConfig {
  name: string
  logoUrl: string
  description: string
}

export default function CompanyConfigPage() {
  const [config, setConfig] = useState<CompanyConfig>({
    name: 'AutoMax',
    logoUrl: '/logo.svg',
    description: 'Sistema de Gestión'
  })
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    loadCompanyConfig()
  }, [])

  const loadCompanyConfig = async () => {
    try {
      const response = await fetch('/api/admin/company')
      if (response.ok) {
        const data = await response.json()
        console.log('📸 Logo URL cargada:', data.logoUrl)
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading company config:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', config.name)
      formData.append('description', config.description)
      if (selectedFile) {
        formData.append('logo', selectedFile)
      }

      const response = await fetch('/api/admin/company', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('Configuración actualizada correctamente')
        await loadCompanyConfig()
        setSelectedFile(null)
        setPreviewUrl('')
      } else {
        toast.error('Error al actualizar la configuración')
      }
    } catch (error) {
      console.error('Error saving company config:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Configuración de Empresa" 
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Empresa' }
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Configuración de Empresa
            </CardTitle>
            <CardDescription>
              Personaliza el nombre, logo y descripción de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo */}
              <div className="space-y-4">
                <Label htmlFor="logo">Logo de la Empresa</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    {(previewUrl || config.logoUrl) ? (
                      <Image
                        src={previewUrl || config.logoUrl}
                        alt="Logo preview"
                        width={120}
                        height={120}
                        className="max-w-full max-h-full object-contain"
                        unoptimized={config.logoUrl.startsWith('/uploads/')}
                        onError={(e) => {
                          console.error('Error loading image:', config.logoUrl)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos: PNG, JPG, SVG. Tamaño máximo: 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Nombre de la empresa */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  placeholder="Ej: AutoMax"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={config.description}
                  onChange={(e) => setConfig({...config, description: e.target.value})}
                  placeholder="Ej: Sistema de Gestión"
                />
              </div>

              {/* Botón de guardar */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 