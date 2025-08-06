'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Building, Eye } from 'lucide-react'
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
  const [deletingProvider, setDeletingProvider] = useState<string | null>(null)
  const [viewingProvider, setViewingProvider] = useState<Provider | null>(null)
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
    const provider = providers.find(p => p.id === id)
    if (!provider) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar al proveedor "${provider.name}"?\n\n${provider.email ? `Email: ${provider.email}\n` : ''}${provider.phone ? `Teléfono: ${provider.phone}\n` : ''}${provider.taxId ? `CUIT/CUIL: ${provider.taxId}\n` : ''}\nEsta acción no se puede deshacer.`
    )
    
    if (!confirmed) return
    
    setDeletingProvider(id)
    
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Proveedor eliminado correctamente')
        fetchProviders()
      } else {
        toast.error('Error al eliminar proveedor')
      }
    } catch (error) {
      toast.error('Error al eliminar proveedor')
    } finally {
      setDeletingProvider(null)
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

      <div className="space-y-2">
        {providers.map((provider) => (
          <div key={provider.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {provider.name}
                    </h3>
                    {provider.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                    {provider.email && (
                      <span className="flex items-center">
                        <span className="font-medium">Email:</span> {provider.email}
                      </span>
                    )}
                    {provider.phone && (
                      <span className="flex items-center">
                        <span className="font-medium">Tel:</span> {provider.phone}
                      </span>
                    )}
                    {provider.taxId && (
                      <span className="flex items-center">
                        <span className="font-medium">CUIT/CUIL:</span> {provider.taxId}
                      </span>
                    )}
                    {(provider.city || provider.state) && (
                      <span className="flex items-center">
                        <span className="font-medium">Ubicación:</span> {provider.city}, {provider.state}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewingProvider(provider)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Ver</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(provider)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(provider.id)}
                disabled={deletingProvider === provider.id}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingProvider === provider.id ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                    <span className="hidden sm:inline">Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {providers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay proveedores registrados</p>
        </div>
      )}

      {/* Modal de Vista Detallada */}
      {viewingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewingProvider.name}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingProvider(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Información General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nombre:</span>
                      <p className="text-gray-900">{viewingProvider.name}</p>
                    </div>
                    {viewingProvider.email && (
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{viewingProvider.email}</p>
                      </div>
                    )}
                    {viewingProvider.phone && (
                      <div>
                        <span className="font-medium text-gray-600">Teléfono:</span>
                        <p className="text-gray-900">{viewingProvider.phone}</p>
                      </div>
                    )}
                    {viewingProvider.taxId && (
                      <div>
                        <span className="font-medium text-gray-600">CUIT/CUIL:</span>
                        <p className="text-gray-900">{viewingProvider.taxId}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600">Estado:</span>
                      <p className="text-gray-900">{viewingProvider.isActive ? 'Activo' : 'Inactivo'}</p>
                    </div>
                  </div>
                </div>

                {(viewingProvider.address || viewingProvider.city || viewingProvider.state) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Dirección</h3>
                    <div className="space-y-2 text-sm">
                      {viewingProvider.address && (
                        <div>
                          <span className="font-medium text-gray-600">Dirección:</span>
                          <p className="text-gray-900">{viewingProvider.address}</p>
                        </div>
                      )}
                      {(viewingProvider.city || viewingProvider.state) && (
                        <div>
                          <span className="font-medium text-gray-600">Ubicación:</span>
                          <p className="text-gray-900">{viewingProvider.city}, {viewingProvider.state}</p>
                        </div>
                      )}
                      {viewingProvider.zipCode && (
                        <div>
                          <span className="font-medium text-gray-600">Código Postal:</span>
                          <p className="text-gray-900">{viewingProvider.zipCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">ID:</span>
                      <p className="text-gray-900">{viewingProvider.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Fecha de Creación:</span>
                      <p className="text-gray-900">{new Date(viewingProvider.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Última Actualización:</span>
                      <p className="text-gray-900">{new Date(viewingProvider.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 