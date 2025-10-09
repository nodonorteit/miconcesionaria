'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, ShoppingCart, Receipt, Eye, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'
import { SaleDocument } from '@/components/ui/sale-document'

interface Sale {
  id: string
  saleNumber: string
  saleDate: string
  totalAmount: number
  commission: number
  status: string
  notes?: string
  type?: string // SALE o PURCHASE
  vehicle?: {
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
  customer?: {
    id: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
    documentNumber?: string
    city?: string
    state?: string
  }
  seller?: {
    id: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
    documentNumber?: string
    city?: string
    state?: string
  }
  commissionist?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    commissionRate: number
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

interface Commissionist {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  commissionRate: number
  isActive: boolean
}


export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [commissionists, setCommissionists] = useState<Commissionist[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [deletingSale, setDeletingSale] = useState<string | null>(null)
  const [viewingSale, setViewingSale] = useState<Sale | null>(null)
  const [showSaleDocument, setShowSaleDocument] = useState(false)
  const [selectedSaleForDocument, setSelectedSaleForDocument] = useState<Sale | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    vehicleId: '',
    customerId: '',
    commissionistId: '',
    totalAmount: '',
    commission: '',
    status: 'PENDING',
    notes: '',
    type: 'SALE' // SALE o PURCHASE
  })

  useEffect(() => {
    fetchSales()
    fetchVehicles()
    fetchCustomers()
    fetchCommissionists()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales?include=vehicle,customer,seller,vehicleType')
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

  const fetchCommissionists = async () => {
    try {
      const response = await fetch('/api/commissionists')
      if (response.ok) {
        const data = await response.json()
        setCommissionists(data.filter((commissionist: Commissionist) => commissionist.isActive))
      }
    } catch (error) {
      console.error('Error fetching commissionists:', error)
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
          commission: parseFloat(formData.commission),
          type: formData.type
        }),
      })

      if (response.ok) {
        toast.success(editingSale ? 'Transacción actualizada' : 'Transacción creada')
        setShowForm(false)
        setEditingSale(null)
        resetForm()
        fetchSales()
        fetchVehicles() // Refresh available vehicles
      } else {
        toast.error('Error al guardar transacción')
      }
    } catch (error) {
      toast.error('Error al guardar transacción')
    }
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setFormData({
      vehicleId: sale.vehicle?.id || '',
      customerId: sale.customer?.id || '',
      commissionistId: sale.commissionist?.id || '',
      totalAmount: sale.totalAmount.toString(),
      commission: sale.commission.toString(),
      status: sale.status,
      notes: sale.notes || '',
      type: 'SALE' // Por defecto SALE, se puede cambiar si es necesario
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const sale = sales.find(s => s.id === id)
    if (!sale) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la venta "${sale.saleNumber}"?\n\nEsta acción no se puede deshacer.`
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

  const handleCompleteSale = async (id: string) => {
    const sale = sales.find(s => s.id === id)
    if (!sale) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres marcar como completada la venta "${sale.saleNumber}"?\n\nEsta acción confirmará que el pago ha sido recibido.`
    )
    
    if (!confirmed) return
    
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: sale.vehicle?.id || '',
          customerId: sale.customer?.id || '',
          commissionistId: sale.commissionist?.id || '',
          totalAmount: sale.totalAmount,
          commission: sale.commission,
          status: 'COMPLETED',
          notes: sale.notes
        }),
      })

      if (response.ok) {
        toast.success('Venta marcada como completada')
        fetchSales()
      } else {
        toast.error('Error al completar la venta')
      }
    } catch (error) {
      toast.error('Error al completar la venta')
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (vehicle) {
      // Recalcular comisión si hay un comisionista seleccionado
      const commissionist = commissionists.find(c => c.id === formData.commissionistId)
      const totalAmount = vehicle.price
      const commission = commissionist && totalAmount 
        ? (totalAmount * (commissionist.commissionRate / 100))
        : 0

      setFormData({
        ...formData,
        vehicleId,
        totalAmount: totalAmount.toString(),
        commission: commission.toString()
      })
    }
  }

  const handleCommissionistChange = (commissionistId: string) => {
    const commissionist = commissionists.find(c => c.id === commissionistId)
    const totalAmount = parseFloat(formData.totalAmount) || 0
    
    // Si no hay comisionista (venta directa), comisión = 0
    // Si hay comisionista, calcular según su porcentaje
    const commission = commissionist && totalAmount
      ? (totalAmount * (commissionist.commissionRate / 100))
      : 0

    setFormData({
      ...formData,
      commissionistId,
      commission: commission.toFixed(2)
    })
  }

  const handleTotalAmountChange = (totalAmount: string) => {
    const commissionist = commissionists.find(c => c.id === formData.commissionistId)
    const amount = parseFloat(totalAmount) || 0
    
    // Recalcular comisión si hay comisionista
    const commission = commissionist && amount
      ? (amount * (commissionist.commissionRate / 100))
      : 0

    setFormData({
      ...formData,
      totalAmount,
      commission: commission.toFixed(2)
    })
  }

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      customerId: '',
      commissionistId: '',
      totalAmount: '',
      commission: '',
      status: 'PENDING',
      notes: '',
      type: 'SALE'
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

  const handleGenerateDocument = async (saleId: string) => {
    try {
      const response = await fetch('/api/sales/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ saleId }),
      })

      if (response.ok) {
        toast.success('Boleto generado exitosamente')
        // Aquí podrías actualizar la lista de ventas si es necesario
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al generar el boleto')
      }
    } catch (error) {
      console.error('Error generating document:', error)
      toast.error('Error al generar el boleto')
    }
  }

  const openSaleDocument = (sale: Sale) => {
    setSelectedSaleForDocument(sale)
    setShowSaleDocument(true)
  }

  // Filtrar ventas basado en el término de búsqueda
  const filteredSales = sales.filter(sale => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (sale.saleNumber || '').toLowerCase().includes(searchLower) ||
      (sale.vehicle?.brand || '').toLowerCase().includes(searchLower) ||
      (sale.vehicle?.model || '').toLowerCase().includes(searchLower) ||
      (sale.customer?.firstName || '').toLowerCase().includes(searchLower) ||
      (sale.customer?.lastName || '').toLowerCase().includes(searchLower) ||
      (sale.seller?.firstName || '').toLowerCase().includes(searchLower) ||
      (sale.seller?.lastName || '').toLowerCase().includes(searchLower) ||
      (sale.totalAmount || 0).toString().includes(searchLower) ||
      (sale.commission || 0).toString().includes(searchLower) ||
      getStatusLabel(sale.status || '').toLowerCase().includes(searchLower)
    )
  })

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
        title="Gestión de Transacciones" 
        breadcrumbs={[{ label: 'Transacciones' }]}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Buscar transacciones por número, vehículo, cliente, vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Transacción
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
                  <Label htmlFor="vehicleId">Vehículo *</Label>
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
                        {vehicle.brand} {vehicle.model} ({vehicle.year}) - Precio no disponible
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="customerId">Cliente (Comprador) *</Label>
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
                  <Label htmlFor="commissionistId">Vendedor (Opcional)</Label>
                  <p className="text-xs text-gray-500 mb-2">Si no seleccionas vendedor, la venta es directa de la concesionaria sin comisión</p>
                  <select
                    id="commissionistId"
                    value={formData.commissionistId}
                    onChange={(e) => handleCommissionistChange(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Sin vendedor (venta directa)</option>
                    {commissionists.map((commissionist) => (
                      <option key={commissionist.id} value={commissionist.id}>
                        {commissionist.firstName} {commissionist.lastName} ({commissionist.commissionRate}% comisión)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="totalAmount">Monto Total *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => handleTotalAmountChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Comisión (Calculada automáticamente)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={formData.commission}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Se calcula según el % del vendedor"
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
        {filteredSales.map((sale) => (
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
                      <span className="font-medium">Vehículo:</span> {sale.vehicle ? `${sale.vehicle.brand} ${sale.vehicle.model} (${sale.vehicle.year})` : 'Sin vehículo'}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Cliente:</span> {sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Sin cliente'}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Vendedor:</span> {sale.seller ? `${sale.seller.firstName} ${sale.seller.lastName}` : 'Sin vendedor'}
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
                onClick={() => setViewingSale(sale)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Ver</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openSaleDocument(sale)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Boleto</span>
              </Button>
              {sale.status === 'PENDING' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCompleteSale(sale.id)}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Completar</span>
                </Button>
              )}
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

      {filteredSales.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? `No se encontraron ventas que coincidan con "${searchTerm}"` : 'No hay ventas registradas'}
          </p>
        </div>
      )}

      {/* Modal de Vista Detallada */}
      {viewingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Venta #{viewingSale.saleNumber}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingSale(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información de la Venta */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Información de la Venta</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Número de Venta:</span>
                        <p className="text-gray-900">#{viewingSale.saleNumber}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Fecha:</span>
                        <p className="text-gray-900">{new Date(viewingSale.saleDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Estado:</span>
                        <p className="text-gray-900">{getStatusLabel(viewingSale.status)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Monto Total:</span>
                        <p className="text-gray-900 font-semibold">${viewingSale.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Comisión:</span>
                        <p className="text-gray-900">${viewingSale.commission.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Vehículo</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Marca y Modelo:</span>
                        <p className="text-gray-900">{viewingSale.vehicle ? `${viewingSale.vehicle.brand} ${viewingSale.vehicle.model}` : 'Sin vehículo'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Año:</span>
                        <p className="text-gray-900">{viewingSale.vehicle?.year || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Cliente</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Nombre:</span>
                        <p className="text-gray-900">{viewingSale.customer ? `${viewingSale.customer.firstName} ${viewingSale.customer.lastName}` : 'Sin cliente'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Vendedor</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Nombre:</span>
                        <p className="text-gray-900">{viewingSale.seller ? `${viewingSale.seller.firstName} ${viewingSale.seller.lastName}` : 'Sin vendedor'}</p>
                      </div>
                    </div>
                  </div>

                  {viewingSale.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Notas</h3>
                      <p className="text-gray-700">{viewingSale.notes}</p>
                    </div>
                  )}
                </div>

                {/* Resumen */}
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">Resumen de la Venta</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-700">Precio del Vehículo:</span>
                        <span className="font-semibold text-green-800">${viewingSale.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Comisión del Vendedor:</span>
                        <span className="font-semibold text-green-800">${viewingSale.commission.toLocaleString()}</span>
                      </div>
                      <hr className="border-green-200" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-green-800">Total:</span>
                        <span className="text-green-800">${viewingSale.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Boleto de Compra-Venta */}
      {showSaleDocument && selectedSaleForDocument && selectedSaleForDocument.vehicle && selectedSaleForDocument.customer && (
        <SaleDocument
          sale={selectedSaleForDocument as any}
          isOpen={showSaleDocument}
          onClose={() => {
            setShowSaleDocument(false)
            setSelectedSaleForDocument(null)
          }}
          onGenerateDocument={handleGenerateDocument}
        />
      )}
    </div>
  )
} 