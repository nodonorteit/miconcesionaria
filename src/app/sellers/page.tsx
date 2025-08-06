'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, UserCheck, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface Seller {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  commissionRate: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
  const [deletingSeller, setDeletingSeller] = useState<string | null>(null)
  const [viewingSeller, setViewingSeller] = useState<Seller | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    commissionRate: '5'
  })

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers')
      if (response.ok) {
        const data = await response.json()
        setSellers(data)
      } else {
        toast.error('Error al cargar vendedores')
      }
    } catch (error) {
      toast.error('Error al cargar vendedores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSeller 
        ? `/api/sellers/${editingSeller.id}`
        : '/api/sellers'
      
      const method = editingSeller ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          commissionRate: parseFloat(formData.commissionRate)
        }),
      })

      if (response.ok) {
        toast.success(editingSeller ? 'Vendedor actualizado' : 'Vendedor creado')
        setShowForm(false)
        setEditingSeller(null)
        resetForm()
        fetchSellers()
      } else {
        toast.error('Error al guardar vendedor')
      }
    } catch (error) {
      toast.error('Error al guardar vendedor')
    }
  }

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller)
    setFormData({
      firstName: seller.firstName,
      lastName: seller.lastName,
      email: seller.email,
      phone: seller.phone || '',
      commissionRate: seller.commissionRate.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const seller = sellers.find(s => s.id === id)
    if (!seller) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar al vendedor "${seller.firstName} ${seller.lastName}"?\n\nEmail: ${seller.email}\nComisión: ${seller.commissionRate}%\n\nEsta acción no se puede deshacer.`
    )
    
    if (!confirmed) return
    
    setDeletingSeller(id)
    
    try {
      const response = await fetch(`/api/sellers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Vendedor eliminado correctamente')
        fetchSellers()
      } else {
        toast.error('Error al eliminar vendedor')
      }
    } catch (error) {
      toast.error('Error al eliminar vendedor')
    } finally {
      setDeletingSeller(null)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      commissionRate: '5'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando vendedores...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Gestión de Vendedores" 
        breadcrumbs={[{ label: 'Vendedores' }]}
      />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Vendedor
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingSeller ? 'Editar Vendedor' : 'Nuevo Vendedor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
                    required
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
                  <Label htmlFor="commissionRate">Porcentaje de Comisión (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({...formData, commissionRate: e.target.value})}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Porcentaje que se lleva el vendedor por cada venta
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingSeller ? 'Actualizar' : 'Crear'} Vendedor
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSeller(null)
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
        {sellers.map((seller) => (
          <div key={seller.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {seller.firstName} {seller.lastName}
                    </h3>
                    {seller.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {seller.commissionRate}% Comisión
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="font-medium">Email:</span> {seller.email}
                    </span>
                    {seller.phone && (
                      <span className="flex items-center">
                        <span className="font-medium">Tel:</span> {seller.phone}
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
                onClick={() => setViewingSeller(seller)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Ver</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(seller)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(seller.id)}
                disabled={deletingSeller === seller.id}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingSeller === seller.id ? (
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

      {sellers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay vendedores registrados</p>
        </div>
      )}

      {/* Modal de Vista Detallada */}
      {viewingSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewingSeller.firstName} {viewingSeller.lastName}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingSeller(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nombre:</span>
                      <p className="text-gray-900">{viewingSeller.firstName} {viewingSeller.lastName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <p className="text-gray-900">{viewingSeller.email}</p>
                    </div>
                    {viewingSeller.phone && (
                      <div>
                        <span className="font-medium text-gray-600">Teléfono:</span>
                        <p className="text-gray-900">{viewingSeller.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600">Estado:</span>
                      <p className="text-gray-900">{viewingSeller.isActive ? 'Activo' : 'Inactivo'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold mb-4 text-purple-800">Información de Comisiones</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Porcentaje de Comisión:</span>
                      <span className="text-2xl font-bold text-purple-800">{viewingSeller.commissionRate}%</span>
                    </div>
                    <p className="text-sm text-purple-600">
                      Este vendedor recibe {viewingSeller.commissionRate}% de comisión por cada venta realizada.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">ID:</span>
                      <p className="text-gray-900">{viewingSeller.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Fecha de Creación:</span>
                      <p className="text-gray-900">{new Date(viewingSeller.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Última Actualización:</span>
                      <p className="text-gray-900">{new Date(viewingSeller.updatedAt).toLocaleDateString()}</p>
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