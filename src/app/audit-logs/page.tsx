'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Activity,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  description: string
  oldData: any
  newData: any
  userId: string
  userEmail: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState({
    entity: '',
    action: '',
    entityId: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      })

      const response = await fetch(`/api/audit-logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      entity: '',
      action: '',
      entityId: '',
      startDate: '',
      endDate: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'CANCEL': return 'bg-orange-100 text-orange-800'
      case 'COMPLETE': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'VEHICLE': return '🚗'
      case 'SALE': return '💰'
      case 'CUSTOMER': return '👤'
      case 'EXPENSE': return '📊'
      default: return '📝'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando logs de auditoría...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Logs de Auditoría</h1>
        <p className="text-gray-600">Registro completo de todas las acciones del sistema</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Entidad</label>
              <select
                value={filters.entity}
                onChange={(e) => handleFilterChange('entity', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Todas</option>
                <option value="VEHICLE">Vehículos</option>
                <option value="SALE">Ventas</option>
                <option value="CUSTOMER">Clientes</option>
                <option value="EXPENSE">Egresos</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Acción</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Todas</option>
                <option value="CREATE">Crear</option>
                <option value="UPDATE">Actualizar</option>
                <option value="DELETE">Eliminar</option>
                <option value="CANCEL">Cancelar</option>
                <option value="COMPLETE">Completar</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">ID de Entidad</label>
              <Input
                value={filters.entityId}
                onChange={(e) => handleFilterChange('entityId', e.target.value)}
                placeholder="ID específico"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha Desde</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fecha Hasta</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getEntityIcon(log.entity)}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-500">{log.entity}</span>
                    <span className="text-xs text-gray-400">#{log.entityId}</span>
                  </div>
                  
                  <p className="text-gray-900 mb-2">{log.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.userEmail || 'Sistema'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString('es-AR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {log.ipAddress}
                    </span>
                  </div>
                </div>
                
                {(log.oldData || log.newData) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const details = {
                        oldData: log.oldData,
                        newData: log.newData,
                        userAgent: log.userAgent
                      }
                      alert(JSON.stringify(details, null, 2))
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
