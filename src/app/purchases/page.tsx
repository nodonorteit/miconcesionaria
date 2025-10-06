'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, ShoppingCart, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface Purchase {
  id: string
  purchaseNumber: string
  purchaseDate: string
  totalAmount: number
  status: string
  notes?: string
  vehicle: {
    id: string
    brand: string
    model: string
    year: number
    color: string
    mileage: number
    vin?: string
    licensePlate?: string
    vehicleType: {
      name: string
    }
  }
  seller: {
    id: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
    documentNumber?: string
    city?: string
    state?: string
  }
}

interface VehicleType {
  id: string
  name: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    vehicleId: '',
    sellerId: '',
    totalAmount: '',
    notes: ''
  })

  useEffect(() => {
    fetchPurchases()
    fetchVehicles()
    fetchCustomers()
    fetchVehicleTypes()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases')
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
      toast.error('Error al cargar las compras')
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('/api/vehicle-types')
      if (response.ok) {
        const data = await response.json()
        setVehicleTypes(data)
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPurchase ? `/api/purchases/${editingPurchase.id}` : '/api/purchases'
      const method = editingPurchase ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingPurchase ? 'Compra actualizada exitosamente' : 'Compra creada exitosamente')
        setShowForm(false)
        setEditingPurchase(null)
        setFormData({ vehicleId: '', sellerId: '', totalAmount: '', notes: '' })
        fetchPurchases()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al procesar la compra')
      }
    } catch (error) {
      console.error('Error submitting purchase:', error)
      toast.error('Error al procesar la compra')
    }
  }

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setFormData({
      vehicleId: purchase.vehicle.id,
      sellerId: purchase.seller.id,
      totalAmount: purchase.totalAmount.toString(),
      notes: purchase.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta compra?')) return

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Compra eliminada exitosamente')
        fetchPurchases()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar la compra')
      }
    } catch (error) {
      console.error('Error deleting purchase:', error)
      toast.error('Error al eliminar la compra')
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'COMPLETED':
        return 'Completada'
      case 'CANCELLED':
        return 'Cancelada'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filtrar compras basado en el término de búsqueda
  const filteredPurchases = purchases.filter(purchase => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (purchase.purchaseNumber || '').toLowerCase().includes(searchLower) ||
      (purchase.vehicle?.brand || '').toLowerCase().includes(searchLower) ||
      (purchase.vehicle?.model || '').toLowerCase().includes(searchLower) ||
      (purchase.seller?.firstName || '').toLowerCase().includes(searchLower) ||
      (purchase.seller?.lastName || '').toLowerCase().includes(searchLower) ||
      (purchase.totalAmount || 0).toString().includes(searchLower) ||
      getStatusLabel(purchase.status || '').toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando compras...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation
        title="Compra de Vehículos"
        breadcrumbs={[
          { label: 'Compras' }
        ]}
      />

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Buscar compras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                setShowForm(true)
                setEditingPurchase(null)
                setFormData({ vehicleId: '', sellerId: '', totalAmount: '', notes: '' })
              }}
              className="ml-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Compra
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingPurchase ? 'Editar Compra' : 'Nueva Compra de Vehículo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleId">Vehículo *</Label>
                  <select
                    id="vehicleId"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccionar vehículo</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.vin || 'Sin VIN'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="sellerId">Vendedor (Particular) *</Label>
                  <select
                    id="sellerId"
                    value={formData.sellerId}
                    onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccionar vendedor</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="totalAmount">Monto de Compra *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingPurchase(null)
                    setFormData({ vehicleId: '', sellerId: '', totalAmount: '', notes: '' })
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPurchase ? 'Actualizar' : 'Crear'} Compra
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Purchases List */}
      <div className="space-y-2">
        {filteredPurchases.map((purchase) => (
          <div key={purchase.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Compra #{purchase.purchaseNumber}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(purchase.status)}`}>
                      {getStatusLabel(purchase.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="font-medium">Vehículo:</span> {purchase.vehicle ? `${purchase.vehicle.brand} ${purchase.vehicle.model} (${purchase.vehicle.year})` : 'Sin vehículo'}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Vendedor:</span> {purchase.seller ? `${purchase.seller.firstName} ${purchase.seller.lastName}` : 'Sin vendedor'}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Monto:</span> ${purchase.totalAmount.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Fecha:</span> {new Date(purchase.purchaseDate).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingPurchase(purchase)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(purchase)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(purchase.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredPurchases.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? `No se encontraron compras que coincidan con "${searchTerm}"` : 'No hay compras registradas'}
          </p>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Compra #{viewingPurchase.purchaseNumber}
                </h2>
                <button
                  onClick={() => setViewingPurchase(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Vehículo</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Marca y Modelo:</span>
                      <p className="text-gray-900">{viewingPurchase.vehicle ? `${viewingPurchase.vehicle.brand} ${viewingPurchase.vehicle.model}` : 'Sin vehículo'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Año:</span>
                      <p className="text-gray-900">{viewingPurchase.vehicle?.year || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Vendedor</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nombre:</span>
                      <p className="text-gray-900">{viewingPurchase.seller ? `${viewingPurchase.seller.firstName} ${viewingPurchase.seller.lastName}` : 'Sin vendedor'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Información de la Compra</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Monto Total:</span>
                      <p className="text-gray-900 font-semibold text-green-600">${viewingPurchase.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Fecha:</span>
                      <p className="text-gray-900">{new Date(viewingPurchase.purchaseDate).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Estado:</span>
                      <p className="text-gray-900">{getStatusLabel(viewingPurchase.status)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {viewingPurchase.notes && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Notas</h3>
                  <p className="text-gray-700">{viewingPurchase.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
