'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  description: string
  oldData: any
  newData: any
  userId: string | null
  userEmail: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface AuditStats {
  totalLogs: number
  dailyStats: Array<{
    createdAt: string
    _count: { id: number }
  }>
  topUsers: Array<{
    userId: string
    userEmail: string
    _count: { id: number }
  }>
  topEntities: Array<{
    entity: string
    _count: { id: number }
  }>
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    entity: '',
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  })

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })

      const response = await fetch(`/api/audit-logs?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
        setTotalPages(data.pagination.totalPages)
      } else {
        console.error('Error fetching logs:', data.error)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      })
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [page, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      entity: '',
      action: '',
      userId: '',
      startDate: '',
      endDate: ''
    })
    setPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'COMPLETE': return 'bg-purple-100 text-purple-800'
      case 'CANCEL': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityColor = (entity: string) => {
    switch (entity) {
      case 'VEHICLE': return 'bg-blue-50 text-blue-700'
      case 'SALE': return 'bg-green-50 text-green-700'
      case 'CUSTOMER': return 'bg-purple-50 text-purple-700'
      case 'EXPENSE': return 'bg-red-50 text-red-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Auditoría del Sistema</h1>
        <p className="text-gray-600 mt-2">
          Registro de todos los movimientos y cambios realizados en el sistema
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700">Total de Registros</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalLogs}</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700">Usuarios Activos</h3>
            <p className="text-2xl font-bold text-green-600">{stats.topUsers.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700">Entidades Modificadas</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.topEntities.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700">Registros Hoy</h3>
            <p className="text-2xl font-bold text-orange-600">
              {stats.dailyStats.find(d => 
                new Date(d.createdAt).toDateString() === new Date().toDateString()
              )?._count.id || 0}
            </p>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="entity">Entidad</Label>
            <Input
              id="entity"
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
              placeholder="VEHICLE, SALE, etc."
            />
          </div>
          <div>
            <Label htmlFor="action">Acción</Label>
            <Input
              id="action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              placeholder="CREATE, UPDATE, etc."
            />
          </div>
          <div>
            <Label htmlFor="userId">Usuario</Label>
            <Input
              id="userId"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="ID del usuario"
            />
          </div>
          <div>
            <Label htmlFor="startDate">Fecha Inicio</Label>
            <Input
              id="startDate"
              type="date"
              lang="es-AR"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">Fecha Fin</Label>
            <Input
              id="endDate"
              type="date"
              lang="es-AR"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={clearFilters} variant="outline">
            Limpiar Filtros
          </Button>
        </div>
      </Card>

      {/* Lista de Logs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Registros de Auditoría</h2>
          <div className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando registros...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No se encontraron registros con los filtros aplicados
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getEntityColor(log.entity)}`}>
                      {log.entity}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                
                <p className="text-gray-800 mb-2">{log.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">ID Entidad:</span>
                    <span className="ml-2 font-mono">{log.entityId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Usuario:</span>
                    <span className="ml-2">
                      {log.userEmail || log.userId || 'Sistema'}
                    </span>
                  </div>
                  {log.ipAddress && (
                    <div>
                      <span className="font-medium text-gray-600">IP:</span>
                      <span className="ml-2 font-mono">{log.ipAddress}</span>
                    </div>
                  )}
                </div>

                {/* Mostrar datos si existen */}
                {(log.oldData || log.newData) && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                      Ver Detalles
                    </summary>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {log.oldData && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Datos Anteriores:</h4>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(log.oldData, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.newData && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Datos Nuevos:</h4>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(log.newData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              variant="outline"
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}