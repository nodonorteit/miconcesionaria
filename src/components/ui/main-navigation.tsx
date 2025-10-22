'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import {
  Home,
  Car,
  Users,
  ShoppingCart,
  UserCheck,
  Building,
  Wrench,
  DollarSign,
  FileText,
  Settings,
  MinusCircle,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: keyof ReturnType<typeof usePermissions>
}

export function MainNavigation() {
  const pathname = usePathname()
  const permissions = usePermissions()

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/',
      icon: Home
    },
    {
      label: 'Vehículos',
      href: '/vehicles',
      icon: Car
    },
    {
      label: 'Vehículos Vendidos',
      href: '/vehicles/sold',
      icon: Archive
    },
    {
      label: 'Clientes',
      href: '/customers',
      icon: Users
    },
    {
      label: 'Ventas',
      href: '/sales',
      icon: ShoppingCart,
      permission: 'canViewSales'
    },
    {
      label: 'Vendedores',
      href: '/sellers',
      icon: UserCheck,
      permission: 'canViewSellers'
    },
    {
      label: 'Proveedores',
      href: '/providers',
      icon: Building,
      permission: 'canViewProviders'
    },
    {
      label: 'Talleres',
      href: '/workshops',
      icon: Wrench,
      permission: 'canViewWorkshops'
    },
    {
      label: 'Egresos',
      href: '/expenses',
      icon: MinusCircle,
      permission: 'canViewExpenses'
    },
    {
      label: 'Flujo de Caja',
      href: '/cashflow',
      icon: DollarSign,
      permission: 'canViewCashflow'
    },
    {
      label: 'Reportes',
      href: '/reports',
      icon: FileText,
      permission: 'canViewReports'
    },
    {
      label: 'Administración',
      href: '/admin',
      icon: Settings,
      permission: 'canViewAdmin'
    },
    {
      label: 'Logs de Auditoría',
      href: '/audit-logs',
      icon: FileText,
      permission: 'canViewAuditLogs'
    }
  ]

  const filteredNavItems = navItems.filter(item => {
    if (!item.permission) return true
    return permissions[item.permission]
  })

  return (
    <nav className="flex flex-col space-y-1">
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className={cn(
              'mr-3 h-5 w-5',
              isActive ? 'text-blue-700' : 'text-gray-400'
            )} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
} 