'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Download, ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/ui/navigation'
import Link from 'next/link'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  vin?: string
  licensePlate?: string
  status: string
  purchasePrice?: number
  salePrice?: number
  description?: string
  createdAt: string
  updatedAt: string
  vehicleType: {
    name: string
  }
  images: {
    id: string
    path: string
    filename: string
    isPrimary: boolean
  }[]
}

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchVehicle()
  }, [params.id])

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setVehicle(data)
      } else {
        console.error('Error fetching vehicle')
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (vehicle && vehicle.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === vehicle.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (vehicle && vehicle.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? vehicle.images.length - 1 : prev - 1
      )
    }
  }

  const getFuelTypeLabel = (fuelType: string) => {
    switch (fuelType) {
      case 'GASOLINE': return 'Gasolina'
      case 'DIESEL': return 'Diesel'
      case 'ELECTRIC': return 'Eléctrico'
      case 'HYBRID': return 'Híbrido'
      case 'LPG': return 'GLP'
      default: return fuelType
    }
  }

  const getTransmissionLabel = (transmission: string) => {
    switch (transmission) {
      case 'MANUAL': return 'Manual'
      case 'AUTOMATIC': return 'Automático'
      case 'CVT': return 'CVT'
      default: return transmission
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible'
      case 'SOLD': return 'Vendido'
      case 'RESERVED': return 'Reservado'
      case 'MAINTENANCE': return 'En Mantenimiento'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando vehículo...</div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Vehículo no encontrado</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
        breadcrumbs={[
          { label: 'Vehículos', href: '/vehicles' },
          { label: `${vehicle.brand} ${vehicle.model}` }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Carousel */}
        <Card>
          <CardHeader>
            <CardTitle>Fotos del Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle.images.length > 0 ? (
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={vehicle.images[currentImageIndex].path}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {vehicle.images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Image Counter */}
                <div className="mt-2 text-center text-sm text-gray-600">
                  {currentImageIndex + 1} de {vehicle.images.length}
                </div>

                {/* Thumbnail Navigation */}
                {vehicle.images.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto">
                    {vehicle.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-300'
                        }`}
                      >
                        <img
                          src={image.path}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No hay fotos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{vehicle.brand} {vehicle.model}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {getStatusLabel(vehicle.status)}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Año</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precio de Compra</p>
                  <p className="font-medium">
                    {vehicle.purchasePrice ? 
                      `$${vehicle.purchasePrice.toLocaleString()}` : 
                      'No disponible'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precio de Venta</p>
                  <p className="font-medium">
                    {vehicle.salePrice ? 
                      `$${vehicle.salePrice.toLocaleString()}` : 
                      'No disponible'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kilometraje</p>
                  <p className="font-medium">{vehicle.mileage.toLocaleString()} km</p>
                </div>
                {vehicle.licensePlate && (
                  <div>
                    <p className="text-sm text-gray-600">Patente</p>
                    <p className="font-medium">{vehicle.licensePlate}</p>
                  </div>
                )}
                {vehicle.vin && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">VIN</p>
                    <p className="font-medium">{vehicle.vin}</p>
                  </div>
                )}
              </div>

              {vehicle.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="mt-1">{vehicle.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href={`/vehicles/${vehicle.id}/edit`}>
              <Button className="w-full">
                Editar Vehículo
              </Button>
            </Link>
            <Link href={`/sales?vehicleId=${vehicle.id}`}>
              <Button variant="outline" className="w-full">
                Crear Venta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 