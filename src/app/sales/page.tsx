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
    if (!confirm('¿Estás seguro de que quieres eliminar esta venta?')) return
    
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Venta eliminada')
        fetchSales()
        fetchVehicles() // Refresh available vehicles
      } else {
        toast.error('Error al eliminar venta')
      }
    } catch (error) {
      toast.error('Error al eliminar venta')
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
                        {seller.firstName} {seller.lastName} ({seller.commissionRate}%)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sales.map((sale) => (
          <Card key={sale.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>Venta #{sale.saleNumber}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(sale)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(sale.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Vehículo:</strong> {sale.vehicle.brand} {sale.vehicle.model}</p>
                <p><strong>Cliente:</strong> {sale.customer.firstName} {sale.customer.lastName}</p>
                <p><strong>Vendedor:</strong> {sale.seller.firstName} {sale.seller.lastName}</p>
                <p><strong>Monto:</strong> ${sale.totalAmount.toLocaleString()}</p>
                <p><strong>Comisión:</strong> ${sale.commission.toLocaleString()}</p>
                <p><strong>Estado:</strong> {getStatusLabel(sale.status)}</p>
                <p><strong>Fecha:</strong> {new Date(sale.saleDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
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