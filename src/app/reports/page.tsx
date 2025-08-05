'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/ui/navigation'
import { BarChart3, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Reportes" 
        breadcrumbs={[
          { label: 'Reportes' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reporte de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reporte de Ventas
            </CardTitle>
            <CardDescription>
              Análisis detallado de ventas con gráficos mensuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Visualiza el rendimiento de ventas mes a mes, mejores vendedores y estadísticas generales.
            </p>
            <Link href="/reports/sales">
              <Button className="w-full">
                Ver Reporte de Ventas
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Reporte de Comisiones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Reporte de Comisiones
            </CardTitle>
            <CardDescription>
              Comisiones de vendedores con opciones de ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Analiza las comisiones por vendedor, ordena por nombre o ganancias y revisa el detalle mensual.
            </p>
            <Link href="/reports/commissions">
              <Button className="w-full">
                Ver Reporte de Comisiones
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 