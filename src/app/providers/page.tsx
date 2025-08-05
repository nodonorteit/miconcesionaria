'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Building } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface Provider {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  taxId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    taxId: ''
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data)
      } else {
        toast.error('Error al cargar proveedores')
      }
    } catch (error) {
      toast.error('Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProvider 
        ? `/api/providers/${editingProvider.id}`
        : '/api/providers'
      
      const method = editingProvider ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingProvider ? 'Proveedor actualizado' : 'Proveedor creado')
        setShowForm(false)
        setEditingProvider(null)
        resetForm()
        fetchProviders()
      } else {
        toast.error('Error al guardar proveedor')
      }
    } catch (error) {
      toast.error('Error al guardar proveedor')
    }
  }

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider)
    setFormData({
      name: provider.name,
      email: provider.email || '',
      phone: provider.phone || '',
      address: provider.address || '',
      city: provider.city || '',
      state: provider.state || '',
      zipCode: provider.zipCode || '',
      taxId: provider.taxId || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proveedor?')) return
    
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Proveedor eliminado')
        fetchProviders()
      } else {
        toast.error('Error al eliminar proveedor')
      }
    } catch (error) {
      toast.error('Error al eliminar proveedor')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      taxId: ''
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando proveedores...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Gestión de Proveedores" 
        breadcrumbs={[{ label: 'Proveedores' }]}
      />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Proveedor
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">CUIT/CUIL</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Provincia</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingProvider ? 'Actualizar' : 'Crear'} Proveedor
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProvider(null)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{provider.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(provider)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {provider.email && (
                  <p><strong>Email:</strong> {provider.email}</p>
                )}
                {provider.phone && (
                  <p><strong>Teléfono:</strong> {provider.phone}</p>
                )}
                {provider.taxId && (
                  <p><strong>CUIT/CUIL:</strong> {provider.taxId}</p>
                )}
                {provider.address && (
                  <p><strong>Dirección:</strong> {provider.address}</p>
                )}
                {(provider.city || provider.state) && (
                  <p><strong>Ubicación:</strong> {provider.city}, {provider.state}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay proveedores registrados</p>
        </div>
      )}
    </div>
  )
} 