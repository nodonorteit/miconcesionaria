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
  MinusCircle
} from 'lucide-react'
import Link from 'next/link'
import { usePermissions } from '@/hooks/usePermissions'

interface DashboardStats {
  totalVehicles: number
  totalCustomers: number
  totalSales: number
  totalRevenue: number
  pendingSales: number
  activeSellers: number
  totalProviders: number
  totalWorkshops: number
  totalExpenses: number
  totalExpensesAmount: number
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
  const permissions = usePermissions()
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingSales: 0,
    activeSellers: 0,
    totalProviders: 0,
    totalWorkshops: 0,
    totalExpenses: 0,
    totalExpensesAmount: 0
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
          <p className="text-sm text-gray-500">Rol: {session?.user?.role || 'USER'}</p>
        </div>

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

          {permissions.canViewSales && (
            <>
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
            </>
          )}
        </div>

        {/* Additional Stats Cards */}
        {permissions.canViewSales && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {permissions.canViewExpenses && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Egresos</CardTitle>
                  <MinusCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalExpensesAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalExpenses} egresos registrados</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Pendientes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingSales}</div>
                <p className="text-xs text-muted-foreground">Pendientes de pago</p>
              </CardContent>
            </Card>

            {permissions.canViewSellers && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSellers}</div>
                  <p className="text-xs text-muted-foreground">Vendedores activos</p>
                </CardContent>
              </Card>
            )}

            {permissions.canViewProviders && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProviders}</div>
                  <p className="text-xs text-muted-foreground">Proveedores registrados</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

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

        {/* Dashboard content ends here - Quick Actions removed */}
      </div>
    </div>
  )
} 