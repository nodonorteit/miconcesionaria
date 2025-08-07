'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/ui/navigation'
import { Building, Users, Settings, FileText } from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalVehicles: number
  totalSales: number
  totalRevenue: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVehicles: 0,
    totalSales: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminStats()
  }, [])

  const loadAdminStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalUsers: data.totalUsers || 0,
          totalVehicles: data.totalVehicles || 0,
          totalSales: data.totalSales || 0,
          totalRevenue: data.totalRevenue || 0
        })
      }
    } catch (error) {
      console.error('Error loading admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const adminCards = [
    {
      title: 'Configuración de Empresa',
      description: 'Gestionar información de la empresa y logo',
      icon: Building,
      href: '/admin/company',
      color: 'bg-blue-500'
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios y permisos',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-500'
    },
    {
      title: 'Reportes',
      description: 'Ver reportes y estadísticas',
      icon: FileText,
      href: '/reports',
      color: 'bg-purple-500'
    },
    {
      title: 'Configuración del Sistema',
      description: 'Ajustes generales del sistema',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Panel de Administración" 
        breadcrumbs={[
          { label: 'Admin' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${card.color} text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 