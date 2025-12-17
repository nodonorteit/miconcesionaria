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
  address?: string
  city?: string
  state?: string
  cuit?: string
  phone?: string
  email?: string
  postalCode?: string
  ivaCondition?: string
}

export default function CompanyConfigPage() {
  const [config, setConfig] = useState<CompanyConfig>({
    name: '',
    logoUrl: '',
    description: '',
    address: '',
    city: '',
    state: '',
    cuit: '',
    phone: '',
    email: '',
    postalCode: '',
    ivaCondition: ''
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
      formData.append('description', config.description || '')
      formData.append('address', config.address || '')
      formData.append('city', config.city || '')
      formData.append('state', config.state || '')
      formData.append('cuit', config.cuit || '')
      formData.append('phone', config.phone || '')
      formData.append('email', config.email || '')
      formData.append('postalCode', config.postalCode || '')
      formData.append('ivaCondition', config.ivaCondition || '')
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
                                      placeholder="Ej: Parana Automotores"
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

              {/* Información Fiscal y de Contacto */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Información Fiscal y de Contacto</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CUIT */}
                  <div className="space-y-2">
                    <Label htmlFor="cuit">CUIT *</Label>
                    <Input
                      id="cuit"
                      value={config.cuit || ''}
                      onChange={(e) => setConfig({...config, cuit: e.target.value})}
                      placeholder="Ej: 20-12345678-9"
                      required
                    />
                  </div>

                  {/* Condición IVA */}
                  <div className="space-y-2">
                    <Label htmlFor="ivaCondition">Condición IVA</Label>
                    <select
                      id="ivaCondition"
                      value={config.ivaCondition || ''}
                      onChange={(e) => setConfig({...config, ivaCondition: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Responsable Inscripto">Responsable Inscripto</option>
                      <option value="Monotributista">Monotributista</option>
                      <option value="Exento">Exento</option>
                      <option value="No Responsable">No Responsable</option>
                    </select>
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    value={config.address || ''}
                    onChange={(e) => setConfig({...config, address: e.target.value})}
                    placeholder="Ej: Av. Corrientes 1234"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Ciudad */}
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={config.city || ''}
                      onChange={(e) => setConfig({...config, city: e.target.value})}
                      placeholder="Ej: Buenos Aires"
                      required
                    />
                  </div>

                  {/* Provincia */}
                  <div className="space-y-2">
                    <Label htmlFor="state">Provincia *</Label>
                    <Input
                      id="state"
                      value={config.state || ''}
                      onChange={(e) => setConfig({...config, state: e.target.value})}
                      placeholder="Ej: CABA"
                      required
                    />
                  </div>

                  {/* Código Postal */}
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      value={config.postalCode || ''}
                      onChange={(e) => setConfig({...config, postalCode: e.target.value})}
                      placeholder="Ej: C1043AAX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={config.phone || ''}
                      onChange={(e) => setConfig({...config, phone: e.target.value})}
                      placeholder="Ej: +54 11 1234-5678"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={config.email || ''}
                      onChange={(e) => setConfig({...config, email: e.target.value})}
                      placeholder="Ej: contacto@empresa.com"
                    />
                  </div>
                </div>
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