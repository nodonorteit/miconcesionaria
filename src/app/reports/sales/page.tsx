'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/ui/navigation'
import { TrendingUp, DollarSign, ShoppingCart, Calendar, BarChart3 } from 'lucide-react'

interface SalesReport {
  totalSales: number
  totalRevenue: number
  totalCommission: number
  averageSaleValue: number
  salesByMonth: Array<{
    month: string
    sales: number
    revenue: number
  }>
  topSellers: Array<{
    name: string
    sales: number
    commission: number
  }>
  recentSales: Array<{
    id: string
    saleNumber: string
    date: string
    amount: number
    customer: string
    vehicle: string
  }>
}

export default function SalesReportPage() {
  const [report, setReport] = useState<SalesReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalesReport()
  }, [])

  const fetchSalesReport = async () => {
    try {
      const response = await fetch('/api/reports/sales')
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else {
        console.error('Error fetching sales report')
      }
    } catch (error) {
      console.error('Error fetching sales report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando reporte de ventas...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Reporte de Ventas" 
        breadcrumbs={[
          { label: 'Reportes', href: '/reports' },
          { label: 'Ventas' }
        ]}
      />

      {report && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalSales}</div>
                <p className="text-xs text-muted-foreground">Ventas realizadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Ingresos generados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.totalCommission.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Comisiones pagadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.averageSaleValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Valor promedio</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Ventas por Mes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Ventas por Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.salesByMonth.map((monthData, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{monthData.month}</span>
                      <span className="text-gray-600">${monthData.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((monthData.revenue / Math.max(...report.salesByMonth.map(m => m.revenue))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {monthData.sales} ventas
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Sellers */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mejores Vendedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.topSellers.map((seller, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{seller.name}</p>
                      <p className="text-sm text-gray-600">{seller.sales} ventas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${seller.commission.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Comisión</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.recentSales.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Venta #{sale.saleNumber}</p>
                      <p className="text-sm text-gray-600">{sale.customer} - {sale.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${sale.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString()}</p>
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
          <p className="text-gray-500">No hay datos de ventas disponibles</p>
        </div>
      )}
    </div>
  )
} 