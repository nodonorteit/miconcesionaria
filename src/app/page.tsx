'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Car, 
  Users, 
  DollarSign, 
  FileText, 
  ShoppingCart, 
  UserCheck,
  Building,
  Wrench,
  TrendingUp,
  Calendar,
  Search,
  MinusCircle
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalVehicles: number
  totalCustomers: number
  totalSales: number
  totalRevenue: number
  pendingSales: number
  activeSellers: number
  totalProviders: number
  totalWorkshops: number
}

interface DollarRate {
  casa: string
  nombre: string
  compra: number | null
  venta: number | null
  agencia: string
  variacion: number | null
  ventaCero: boolean
  decimales: number
}

interface DollarRates {
  rates: DollarRate[]
  timestamp: string
  source: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingSales: 0,
    activeSellers: 0,
    totalProviders: 0,
    totalWorkshops: 0
  })
  const [dollarRates, setDollarRates] = useState<DollarRates | null>(null)
  const [dollarLoading, setDollarLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }

    // Fetch dashboard stats
    fetchDashboardStats()
    // Fetch dollar rate
    fetchDollarRate()
  }, [status])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const fetchDollarRate = async () => {
    try {
      setDollarLoading(true)
      const response = await fetch('/api/dollar')
      if (response.ok) {
        const data = await response.json()
        setDollarRates(data)
      }
    } catch (error) {
      console.error('Error fetching dollar rates:', error)
    } finally {
      setDollarLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenido, {session?.user?.name}</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar vehículos por marca, modelo, año, color, precio..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">Total en inventario</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Clientes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">Ventas totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Ingresos totales</p>
            </CardContent>
          </Card>
        </div>

        {/* Dólar MEP Widget */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Cotizaciones del Dólar
            </CardTitle>
            <CardDescription>Cotizaciones en tiempo real desde dolarmep.com</CardDescription>
          </CardHeader>
          <CardContent>
            {dollarLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-lg">Cargando cotizaciones...</div>
              </div>
            ) : dollarRates ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dollarRates.rates.slice(0, 4).map((rate, index) => (
                    <div key={rate.casa} className={`p-4 rounded-lg border ${
                      index === 0 ? 'bg-green-50 border-green-200' :
                      index === 1 ? 'bg-blue-50 border-blue-200' :
                      index === 2 ? 'bg-purple-50 border-purple-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`text-sm font-medium ${
                        index === 0 ? 'text-green-800' :
                        index === 1 ? 'text-blue-800' :
                        index === 2 ? 'text-purple-800' :
                        'text-gray-800'
                      }`}>
                        {rate.nombre}
                      </div>
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-green-600' :
                        index === 1 ? 'text-blue-600' :
                        index === 2 ? 'text-purple-600' :
                        'text-gray-600'
                      }`}>
                        {rate.venta ? `$${rate.venta.toLocaleString('es-AR')}` : 'N/A'}
                      </div>
                      {rate.compra && (
                        <div className={`text-xs ${
                          index === 0 ? 'text-green-600' :
                          index === 1 ? 'text-blue-600' :
                          index === 2 ? 'text-purple-600' :
                          'text-gray-600'
                        }`}>
                          Compra: ${rate.compra.toLocaleString('es-AR')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tabla completa */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Tipo</th>
                        <th className="text-right py-2 font-medium">Compra</th>
                        <th className="text-right py-2 font-medium">Venta</th>
                        <th className="text-right py-2 font-medium">Agencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dollarRates.rates.map((rate, index) => (
                        <tr key={rate.casa} className="border-b">
                          <td className="py-2 font-medium">{rate.nombre}</td>
                          <td className="text-right py-2">
                            {rate.compra ? `$${rate.compra.toLocaleString('es-AR')}` : '-'}
                          </td>
                          <td className={`text-right py-2 font-bold ${
                            index === 0 ? 'text-green-600' :
                            index === 1 ? 'text-blue-600' :
                            index === 2 ? 'text-purple-600' :
                            index === 3 ? 'text-orange-600' :
                            index === 4 ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {rate.venta ? `$${rate.venta.toLocaleString('es-AR')}` : 'N/A'}
                          </td>
                          <td className="text-right py-2 text-xs text-gray-500">
                            {rate.agencia}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Última actualización: {new Date(dollarRates.timestamp).toLocaleString('es-AR')}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchDollarRate}
                    disabled={dollarLoading}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-500">
                Error al cargar las cotizaciones
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Gestión de Vehículos
              </CardTitle>
              <CardDescription>Administra el inventario de vehículos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/vehicles">
                <Button className="w-full" variant="outline">
                  Ver Vehículos
                </Button>
              </Link>
              <Link href="/vehicles">
                <Button className="w-full">
                  Agregar Vehículo
                </Button>
              </Link>
              <Link href="/vehicle-types">
                <Button className="w-full" variant="outline">
                  Tipos de Vehículos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Clientes
              </CardTitle>
              <CardDescription>Administra la base de datos de clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/customers">
                <Button className="w-full" variant="outline">
                  Ver Clientes
                </Button>
              </Link>
              <Link href="/customers">
                <Button className="w-full">
                  Agregar Cliente
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Ventas
              </CardTitle>
              <CardDescription>Gestiona las ventas y transacciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/sales">
                <Button className="w-full" variant="outline">
                  Ver Ventas
                </Button>
              </Link>
              <Link href="/sales">
                <Button className="w-full">
                  Nueva Venta
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Vendedores
              </CardTitle>
              <CardDescription>Administra el equipo de ventas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/sellers">
                <Button className="w-full" variant="outline">
                  Ver Vendedores
                </Button>
              </Link>
              <Link href="/sellers/new">
                <Button className="w-full">
                  Agregar Vendedor
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Proveedores
              </CardTitle>
              <CardDescription>Gestiona proveedores y talleres</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/providers">
                <Button className="w-full" variant="outline">
                  Ver Proveedores
                </Button>
              </Link>
              <Link href="/workshops">
                <Button className="w-full" variant="outline">
                  Ver Talleres
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Flujo de Caja
              </CardTitle>
              <CardDescription>Gestiona ingresos y egresos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/cashflow">
                <Button className="w-full" variant="outline">
                  Ver Flujo de Caja
                </Button>
              </Link>
              <Link href="/expenses">
                <Button className="w-full" variant="outline">
                  <MinusCircle className="h-4 w-4 mr-2" />
                  Egresos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reportes
              </CardTitle>
              <CardDescription>Genera reportes y análisis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/reports/sales">
                <Button className="w-full" variant="outline">
                  Reporte de Ventas
                </Button>
              </Link>
              <Link href="/reports/inventory">
                <Button className="w-full" variant="outline">
                  Reporte de Inventario
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Administración
              </CardTitle>
              <CardDescription>Gestiona usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/users">
                <Button className="w-full" variant="outline">
                  Gestión de Usuarios
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 