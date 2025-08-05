'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/ui/navigation'
import { Car, DollarSign, TrendingUp, Package } from 'lucide-react'

interface InventoryReport {
  totalVehicles: number
  availableVehicles: number
  soldVehicles: number
  totalInventoryValue: number
  averageVehiclePrice: number
  vehiclesByStatus: Array<{
    status: string
    count: number
    value: number
  }>
  vehiclesByBrand: Array<{
    brand: string
    count: number
    value: number
  }>
  recentVehicles: Array<{
    id: string
    brand: string
    model: string
    year: number
    price: number
    status: string
    addedDate: string
  }>
}

export default function InventoryReportPage() {
  const [report, setReport] = useState<InventoryReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryReport()
  }, [])

  const fetchInventoryReport = async () => {
    try {
      const response = await fetch('/api/reports/inventory')
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else {
        console.error('Error fetching inventory report')
      }
    } catch (error) {
      console.error('Error fetching inventory report:', error)
    } finally {
      setLoading(false)
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
        <div className="text-center">Cargando reporte de inventario...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Reporte de Inventario" 
        breadcrumbs={[
          { label: 'Reportes', href: '/reports' },
          { label: 'Inventario' }
        ]}
      />

      {report && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalVehicles}</div>
                <p className="text-xs text-muted-foreground">En el sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.availableVehicles}</div>
                <p className="text-xs text-muted-foreground">Para venta</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.totalInventoryValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Valor del inventario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.averageVehiclePrice.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Por vehículo</p>
              </CardContent>
            </Card>
          </div>

          {/* Vehicles by Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vehículos por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.vehiclesByStatus.map((status, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{getStatusLabel(status.status)}</p>
                      <p className="text-sm text-gray-600">{status.count} vehículos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${status.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Valor total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicles by Brand */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vehículos por Marca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.vehiclesByBrand.map((brand, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{brand.brand}</p>
                      <p className="text-sm text-gray-600">{brand.count} vehículos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${brand.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Valor total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle>Vehículos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.recentVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-gray-600">{vehicle.year} - {getStatusLabel(vehicle.status)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${vehicle.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{new Date(vehicle.addedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay datos de inventario disponibles</p>
        </div>
      )}
    </div>
  )
} 