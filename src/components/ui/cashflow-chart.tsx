'use client'

import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, PieChart, Calendar } from 'lucide-react'

interface CashFlowData {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  description: string
  category: string
  date: string
  receiptUrl?: string
  createdAt: string
  updatedAt: string
}

interface ChartDataPoint {
  date: string
  income: number
  expenses: number
  balance: number
  cumulativeBalance: number
}

interface CashFlowChartProps {
  data: CashFlowData[]
  dateRange: {
    start: string
    end: string
  }
  timeGrouping: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

type ChartType = 'line' | 'bar' | 'area' | 'composed'

export default function CashFlowChart({ data, dateRange, timeGrouping }: CashFlowChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>('composed')
  const [showCumulative, setShowCumulative] = React.useState(true)

  // Función para agrupar datos por período de tiempo
  const groupDataByTime = (data: CashFlowData[], grouping: string) => {
    const grouped: { [key: string]: ChartDataPoint } = {}
    
    data.forEach(item => {
      const date = new Date(item.date)
      let key = ''
      
      switch (grouping) {
        case 'daily':
          key = date.toISOString().split('T')[0]
          break
        case 'weekly':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'yearly':
          key = date.getFullYear().toString()
          break
        default:
          key = date.toISOString().split('T')[0]
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          income: 0,
          expenses: 0,
          balance: 0,
          cumulativeBalance: 0
        }
      }
      
      if (item.type === 'INCOME') {
        grouped[key].income += item.amount
      } else {
        grouped[key].expenses += Math.abs(item.amount)
      }
    })
    
    // Calcular balance y balance acumulado
    let cumulativeBalance = 0
    const sortedKeys = Object.keys(grouped).sort()
    
    sortedKeys.forEach(key => {
      const item = grouped[key]
      item.balance = item.income - item.expenses
      cumulativeBalance += item.balance
      item.cumulativeBalance = cumulativeBalance
    })
    
    return sortedKeys.map(key => grouped[key])
  }

  // Función para formatear fechas según el agrupamiento
  const formatDate = (dateStr: string, grouping: string) => {
    switch (grouping) {
      case 'daily':
        return new Date(dateStr).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        })
      case 'weekly':
        return `Sem ${new Date(dateStr).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        })}`
      case 'monthly':
        const [year, month] = dateStr.split('-')
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { 
          month: 'short', 
          year: 'numeric' 
        })
      case 'yearly':
        return dateStr
      default:
        return dateStr
    }
  }

  // Filtrar datos por rango de fechas
  const filteredData = data.filter(item => {
    const itemDate = new Date(item.date)
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    return itemDate >= startDate && itemDate <= endDate
  })

  const chartData = groupDataByTime(filteredData, timeGrouping)

  // Configuración del tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{formatDate(label, timeGrouping)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Renderizar gráfico según el tipo seleccionado
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value, timeGrouping)}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Ingresos"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Egresos"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              {showCumulative && (
                <Line 
                  type="monotone" 
                  dataKey="cumulativeBalance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Balance Acumulado"
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value, timeGrouping)}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Ingresos" />
              <Bar dataKey="expenses" fill="#ef4444" name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value, timeGrouping)}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Ingresos"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="1"
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.6}
                name="Egresos"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'composed':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value, timeGrouping)}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" fillOpacity={0.8} name="Ingresos" />
              <Bar dataKey="expenses" fill="#ef4444" fillOpacity={0.8} name="Egresos" />
              {showCumulative && (
                <Line 
                  type="monotone" 
                  dataKey="cumulativeBalance" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Balance Acumulado"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráfico de Flujo de Caja
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Línea
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Barras
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <PieChart className="h-4 w-4 mr-1" />
              Área
            </Button>
            <Button
              variant={chartType === 'composed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('composed')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Combinado
            </Button>
            <Button
              variant={showCumulative ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowCumulative(!showCumulative)}
            >
              Balance Acumulado
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No hay datos para mostrar en el período seleccionado
          </div>
        )}
      </CardContent>
    </Card>
  )
} 