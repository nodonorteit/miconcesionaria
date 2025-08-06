'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'
import CashFlowChart from '@/components/ui/cashflow-chart'

interface CashFlow {
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

export default function CashFlowPage() {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días atrás
    end: new Date().toISOString().split('T')[0]
  })
  const [timeGrouping, setTimeGrouping] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')

  useEffect(() => {
    fetchCashFlows()
  }, [])

  const fetchCashFlows = async () => {
    try {
      const response = await fetch('/api/cashflow')
      if (response.ok) {
        const data = await response.json()
        setCashFlows(data)
      } else {
        toast.error('Error al cargar flujo de caja')
      }
    } catch (error) {
      toast.error('Error al cargar flujo de caja')
    } finally {
      setLoading(false)
    }
  }

  const calculateBalance = () => {
    return cashFlows.reduce((balance, flow) => {
      const amount = typeof flow.amount === 'number' ? flow.amount : parseFloat(flow.amount) || 0
      return flow.type === 'INCOME' ? balance + amount : balance - Math.abs(amount)
    }, 0)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando flujo de caja...</div>
      </div>
    )
  }

  const balance = calculateBalance()

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Gráfico de Flujo de Caja" 
        breadcrumbs={[{ label: 'Gráfico de Flujo de Caja' }]}
      />

      {/* Balance Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Balance Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${balance.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {balance >= 0 ? 'Balance positivo' : 'Balance negativo'}
          </p>
        </CardContent>
      </Card>

      {/* Filtro de fechas y agrupamiento */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros y Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Desde</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Hasta</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="timeGrouping">Agrupamiento</Label>
              <select
                id="timeGrouping"
                value={timeGrouping}
                onChange={(e) => setTimeGrouping(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                className="w-full p-2 border rounded"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Avanzado */}
      <CashFlowChart 
        data={cashFlows}
        dateRange={dateRange}
        timeGrouping={timeGrouping}
      />
    </div>
  )
} 