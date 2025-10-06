'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Eye, Car, Search } from 'lucide-react'
import { Navigation } from '@/components/ui/navigation'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  color: string
  mileage: number
  price: number
  description?: string
  vin?: string
  licensePlate?: string
  fuelType: string
  transmission: string
  status: string
  vehicleTypeId: string
  vehicleType?: {
    id: string
    name: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  images?: string[]
  sale?: {
    id: string
    saleNumber: string
    totalAmount: number
    commission: number
    createdAt: string
    seller: {
      firstName: string
      lastName: string
    } | null
    customer: {
      firstName: string
      lastName: string
    }
  }
  purchasePrice?: number
  salePrice?: number
}

export default function SoldVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSoldVehicles()
  }, [])

  const fetchSoldVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles?sold=true')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      } else {
        console.error('Error fetching sold vehicles')
      }
    } catch (error) {
      console.error('Error fetching sold vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SOLD':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFuelTypeText = (fuelType: string) => {
    switch (fuelType) {
      case 'GASOLINE':
        return 'Nafta'
      case 'DIESEL':
        return 'Diesel'
      case 'ELECTRIC':
        return 'Eléctrico'
      case 'HYBRID':
        return 'Híbrido'
      default:
        return fuelType
    }
  }

  const getTransmissionText = (transmission: string) => {
    switch (transmission) {
      case 'MANUAL':
        return 'Manual'
      case 'AUTOMATIC':
        return 'Automático'
      default:
        return transmission
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Navigation
          title="Vehículos Vendidos"
          breadcrumbs={[
            { label: 'Vehículos', href: '/vehicles' },
            { label: 'Vendidos' }
          ]}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando vehículos vendidos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation
        title="Vehículos Vendidos"
        breadcrumbs={[
          { label: 'Vehículos', href: '/vehicles' },
          { label: 'Vendidos' }
        ]}
      />

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por marca, modelo, VIN o patente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicles List */}
      <div className="space-y-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {vehicle.brand} {vehicle.model} {vehicle.year}
                    </h3>
                    <p className="text-gray-600">
                      {vehicle.color} • {vehicle.mileage.toLocaleString()} km • {getFuelTypeText(vehicle.fuelType)} • {getTransmissionText(vehicle.transmission)}
                    </p>
                    {vehicle.vehicleType && (
                      <p className="text-sm text-gray-500">
                        Tipo: {vehicle.vehicleType.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="font-semibold text-green-600">Consultar</span>
                    <div className="text-sm text-gray-600">
                      Comisión: ${vehicle.sale?.commission.toLocaleString()}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setViewingVehicle(vehicle)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Sale Information */}
              {vehicle.sale && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Venta #</p>
                      <p className="font-medium">{vehicle.sale.saleNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vendedor</p>
                      <p className="font-medium">
                        {vehicle.sale.seller ? 
                          `${vehicle.sale.seller.firstName} ${vehicle.sale.seller.lastName}` : 
                          'Sin vendedor asignado'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cliente</p>
                      <p className="font-medium">{vehicle.sale.customer.firstName} {vehicle.sale.customer.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monto de Venta</p>
                      <p className="font-medium text-green-600">${vehicle.sale.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Comisión</p>
                      <p className="font-medium">${vehicle.sale.commission.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha de Venta</p>
                      <p className="font-medium">{new Date(vehicle.sale.createdAt).toLocaleDateString('es-AR')}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && !loading && (
        <div className="text-center py-8">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron vehículos vendidos con esos criterios' : 'No hay vehículos vendidos'}
          </p>
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {viewingVehicle.brand} {viewingVehicle.model} {viewingVehicle.year}
                </h2>
                <button
                  onClick={() => setViewingVehicle(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Información del Vehículo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marca:</span>
                      <span>{viewingVehicle.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modelo:</span>
                      <span>{viewingVehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Año:</span>
                      <span>{viewingVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span>{viewingVehicle.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kilometraje:</span>
                      <span>{viewingVehicle.mileage.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio de Venta:</span>
                      <span className="font-semibold text-green-600">
                        {viewingVehicle.sale?.totalAmount ? (
                          <span className="text-green-600">
                            ${viewingVehicle.sale.totalAmount.toLocaleString()}
                          </span>
                        ) : (
                          "No disponible"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Combustible:</span>
                      <span>{getFuelTypeText(viewingVehicle.fuelType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transmisión:</span>
                      <span>{getTransmissionText(viewingVehicle.transmission)}</span>
                    </div>
                    {viewingVehicle.vin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">VIN:</span>
                        <span>{viewingVehicle.vin}</span>
                      </div>
                    )}
                    {viewingVehicle.licensePlate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patente:</span>
                        <span>{viewingVehicle.licensePlate}</span>
                      </div>
                    )}
                    {viewingVehicle.description && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Descripción:</span>
                        <span>{viewingVehicle.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {viewingVehicle.sale && (
                  <div>
                    <h3 className="font-semibold mb-3">Información de Venta</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">N° de Venta:</span>
                        <span className="font-medium">{viewingVehicle.sale.saleNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vendedor:</span>
                        <span>
                          {viewingVehicle.sale.seller ? 
                            `${viewingVehicle.sale.seller.firstName} ${viewingVehicle.sale.seller.lastName}` : 
                            'Sin vendedor asignado'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cliente:</span>
                        <span>{viewingVehicle.sale.customer.firstName} {viewingVehicle.sale.customer.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monto Total:</span>
                        <span className="font-semibold text-green-600">${viewingVehicle.sale.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comisión:</span>
                        <span>${viewingVehicle.sale.commission.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Venta:</span>
                        <span>{new Date(viewingVehicle.sale.createdAt).toLocaleDateString('es-AR')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 