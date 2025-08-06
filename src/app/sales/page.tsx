'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, ShoppingCart, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface Sale {
  id: string
  saleNumber: string
  saleDate: string
  totalAmount: number
  commission: number
  status: string
  notes?: string
  vehicle: {
    id: string
    brand: string
    model: string
    year: number
  }
  customer: {
    id: string
    firstName: string
    lastName: string
  }
  seller: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price: number
  status: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
}

interface Seller {
  id: string
  firstName: string
  lastName: string
  commissionRate: number
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [deletingSale, setDeletingSale] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    vehicleId: '',
    customerId: '',
    sellerId: '',
    totalAmount: '',
    commission: '',
    status: 'PENDING',
    notes: ''
  })

  useEffect(() => {
    fetchSales()
    fetchVehicles()
    fetchCustomers()
    fetchSellers()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales')
      if (response.ok) {
        const data = await response.json()
        setSales(data)
      } else {
        toast.error('Error al cargar ventas')
      }
    } catch (error) {
      toast.error('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.filter((v: Vehicle) => v.status === 'AVAILABLE'))
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

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers')
      if (response.ok) {
        const data = await response.json()
        setSellers(data)
      }
    } catch (error) {
      console.error('Error fetching sellers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSale 
        ? `/api/sales/${editingSale.id}`
        : '/api/sales'
      
      const method = editingSale ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalAmount: parseFloat(formData.totalAmount),
          commission: parseFloat(formData.commission)
        }),
      })

      if (response.ok) {
        toast.success(editingSale ? 'Venta actualizada' : 'Venta creada')
        setShowForm(false)
        setEditingSale(null)
        resetForm()
        fetchSales()
        fetchVehicles() // Refresh available vehicles
      } else {
        toast.error('Error al guardar venta')
      }
    } catch (error) {
      toast.error('Error al guardar venta')
    }
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setFormData({
      vehicleId: sale.vehicle.id,
      customerId: sale.customer.id,
      sellerId: sale.seller.id,
      totalAmount: sale.totalAmount.toString(),
      commission: sale.commission.toString(),
      status: sale.status,
      notes: sale.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const sale = sales.find(s => s.id === id)
    if (!sale) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la venta #${sale.saleNumber}?\n\nVehículo: ${sale.vehicle.brand} ${sale.vehicle.model}\nCliente: ${sale.customer.firstName} ${sale.customer.lastName}\n\nEsta acción no se puede deshacer.`
    )
    
    if (!confirmed) return
    
    setDeletingSale(id)
    
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Venta eliminada correctamente')
        fetchSales()
        fetchVehicles() // Refresh available vehicles
      } else {
        toast.error('Error al eliminar venta')
      }
    } catch (error) {
      toast.error('Error al eliminar venta')
    } finally {
      setDeletingSale(null)
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (vehicle) {
      setFormData({
        ...formData,
        vehicleId,
        totalAmount: vehicle.price.toString()
      })
    }
  }

  const handleSellerChange = (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId)
    const vehicle = vehicles.find(v => v.id === formData.vehicleId)
    if (seller && vehicle) {
      const commission = (vehicle.price * seller.commissionRate / 100)
      setFormData({
        ...formData,
        sellerId,
        commission: commission.toFixed(2)
      })
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      customerId: '',
      sellerId: '',
      totalAmount: '',
      commission: '',
      status: 'PENDING',
      notes: ''
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente'
      case 'COMPLETED': return 'Completada'
      case 'CANCELLED': return 'Cancelada'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando ventas...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Gestión de Ventas" 
        breadcrumbs={[{ label: 'Ventas' }]}
      />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingSale ? 'Editar Venta' : 'Nueva Venta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleId">Vehículo</Label>
                  <select
                    id="vehicleId"
                    value={formData.vehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar vehículo</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.year}) - ${vehicle.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="customerId">Cliente</Label>
                  <select
                    id="customerId"
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="sellerId">Vendedor</Label>
                  <select
                    id="sellerId"
                    value={formData.sellerId}
                    onChange={(e) => handleSellerChange(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar vendedor</option>
                    {sellers.map((seller) => (
                      <option key={seller.id} value={seller.id}>
                        {seller.firstName} {seller.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="totalAmount">Monto Total</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Comisión</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={formData.commission}
                    onChange={(e) => setFormData({...formData, commission: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingSale ? 'Actualizar' : 'Crear'} Venta
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSale(null)
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
        {sales.map((sale) => (
          <div key={sale.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Venta #{sale.saleNumber}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      sale.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(sale.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="font-medium">Vehículo:</span> {sale.vehicle.brand} {sale.vehicle.model} ({sale.vehicle.year})
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Cliente:</span> {sale.customer.firstName} {sale.customer.lastName}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Vendedor:</span> {sale.seller.firstName} {sale.seller.lastName}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Monto:</span> ${sale.totalAmount.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Comisión:</span> ${sale.commission.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Fecha:</span> {new Date(sale.saleDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(sale)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(sale.id)}
                disabled={deletingSale === sale.id}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingSale === sale.id ? (
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

      {sales.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay ventas registradas</p>
        </div>
      )}
    </div>
  )
} 