import { useSession } from 'next-auth/react'

export interface UserPermissions {
  canViewSales: boolean
  canCreateSales: boolean
  canDeleteSales: boolean
  canViewReports: boolean
  canViewExpenses: boolean
  canCreateExpenses: boolean
  canDeleteExpenses: boolean
  canViewSellers: boolean
  canCreateSellers: boolean
  canDeleteSellers: boolean
  canViewWorkshops: boolean
  canCreateWorkshops: boolean
  canDeleteWorkshops: boolean
  canViewCashflow: boolean
  canViewAdmin: boolean
  canViewAuditLogs: boolean
  canCreateVehicles: boolean
  canDeleteVehicles: boolean
  canCreateCustomers: boolean
  canDeleteCustomers: boolean
  isAdmin: boolean
  isManager: boolean
  isUser: boolean
}

export function usePermissions(): UserPermissions {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'USER'

  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const isUser = userRole === 'USER'

  return {
    // Permisos para ventas
    canViewSales: isAdmin || isManager,
    canCreateSales: isAdmin || isManager,
    canDeleteSales: isAdmin,

    // Permisos para reportes
    canViewReports: isAdmin || isManager,

    // Permisos para gastos
    canViewExpenses: isAdmin || isManager,
    canCreateExpenses: isAdmin || isManager,
    canDeleteExpenses: isAdmin,

    // Permisos para vendedores
    canViewSellers: isAdmin || isManager,
    canCreateSellers: isAdmin || isManager,
    canDeleteSellers: isAdmin,

    // Permisos para proveedores
    // Permisos para talleres
    canViewWorkshops: isAdmin || isManager,
    canCreateWorkshops: isAdmin || isManager,
    canDeleteWorkshops: isAdmin,

    // Permisos para flujo de caja
    canViewCashflow: isAdmin || isManager,

    // Permisos para administración (solo administradores)
    canViewAdmin: isAdmin,

    // Permisos para logs de auditoría (solo administradores)
    canViewAuditLogs: isAdmin,

    // Permisos para vehículos (usuarios comunes pueden crear/ver)
    canCreateVehicles: true, // Todos pueden crear vehículos
    canDeleteVehicles: isAdmin || isManager,

    // Permisos para clientes (usuarios comunes pueden crear/ver)
    canCreateCustomers: true, // Todos pueden crear clientes
    canDeleteCustomers: isAdmin || isManager,

    // Roles
    isAdmin,
    isManager,
    isUser
  }
} 