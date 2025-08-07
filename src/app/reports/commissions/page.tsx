'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navigation } from '@/components/ui/navigation'
import { Users, DollarSign, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Download, Filter } from 'lucide-react'

interface SellerCommission {
  id: string
  firstName: string
  lastName: string
  email: string
  commissionRate: number
  totalSales: number
  totalCommission: number
  monthlyCommissions: Array<{
    month: string
    sales: number
    commission: number
  }>
}

interface CompanyConfig {
  name: string
  logoUrl: string
  description: string
}

type SortField = 'name' | 'commission' | 'sales'
type SortOrder = 'asc' | 'desc'

export default function CommissionsReportPage() {
  const [sellers, setSellers] = useState<SellerCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchCompanyConfig()
    fetchCommissionsReport()
  }, [])

  const fetchCompanyConfig = async () => {
    try {
      const response = await fetch('/api/admin/company')
      if (response.ok) {
        const config = await response.json()
        setCompanyConfig(config)
      }
    } catch (error) {
      console.error('Error fetching company config:', error)
    }
  }

  const fetchCommissionsReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/reports/commissions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSellers(data)
      } else {
        console.error('Error fetching commissions report')
      }
    } catch (error) {
      console.error('Error fetching commissions report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortedSellers = () => {
    return [...sellers].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
          break
        case 'commission':
          aValue = a.totalCommission
          bValue = b.totalCommission
          break
        case 'sales':
          aValue = a.totalSales
          bValue = b.totalSales
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const exportToPDF = async () => {
    try {
      setExporting(true)
      
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/reports/commissions/export?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyConfig?.name || 'Parana Automotores',
          logoUrl: companyConfig?.logoUrl || '/logo.svg',
          dateRange: { startDate, endDate }
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-comisiones-${startDate || 'todo'}-${endDate || 'todo'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Error exporting PDF')
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleFilter = () => {
    fetchCommissionsReport()
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    fetchCommissionsReport()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando reporte de comisiones...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Reporte de Comisiones" 
        breadcrumbs={[
          { label: 'Reportes', href: '/reports' },
          { label: 'Comisiones' }
        ]}
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFilter} className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={exportToPDF} disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exportando...' : 'Exportar PDF'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers.length}</div>
            <p className="text-xs text-muted-foreground">Vendedores activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${sellers.reduce((sum, seller) => sum + seller.totalCommission, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Comisiones pagadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Vendedor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${sellers.length > 0 ? (sellers.reduce((sum, seller) => sum + seller.totalCommission, 0) / sellers.length).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Promedio de comisiones</p>
          </CardContent>
        </Card>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comisiones por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 p-0 h-auto font-medium"
                    >
                      Vendedor {getSortIcon('name')}
                    </Button>
                  </th>
                  <th className="text-center py-3 px-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('sales')}
                      className="flex items-center gap-2 p-0 h-auto font-medium"
                    >
                      Ventas {getSortIcon('sales')}
                    </Button>
                  </th>
                  <th className="text-center py-3 px-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('commission')}
                      className="flex items-center gap-2 p-0 h-auto font-medium"
                    >
                      Comisión Total {getSortIcon('commission')}
                    </Button>
                  </th>
                  <th className="text-center py-3 px-4">Tasa</th>
                  <th className="text-center py-3 px-4">Detalle Mensual</th>
                </tr>
              </thead>
              <tbody>
                {getSortedSellers().map((seller) => (
                  <tr key={seller.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{seller.firstName} {seller.lastName}</p>
                        <p className="text-sm text-gray-600">{seller.email}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="font-medium">{seller.totalSales}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="font-medium text-green-600">
                        ${seller.totalCommission.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {(seller.commissionRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="space-y-1">
                        {seller.monthlyCommissions.slice(0, 3).map((month, index) => (
                          <div key={index} className="text-xs">
                            <span className="text-gray-600">{month.month}:</span>
                            <span className="ml-1 font-medium">${month.commission.toLocaleString()}</span>
                          </div>
                        ))}
                        {seller.monthlyCommissions.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{seller.monthlyCommissions.length - 3} meses más
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {sellers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay datos de comisiones disponibles para el período seleccionado</p>
        </div>
      )}
    </div>
  )
} 