'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/ui/navigation'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  FileText, 
  Users, 
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Edit3
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemSettings {
  maintenanceMode: boolean
  debugMode: boolean
  emailNotifications: boolean
  autoBackup: boolean
  sessionTimeout: number
  maxFileSize: number
  allowedFileTypes: string[]
}

interface SystemInfo {
  version: string
  lastBackup: string
  databaseSize: string
  totalUsers: number
  totalVehicles: number
  totalSales: number
  uptime: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    debugMode: false,
    emailNotifications: true,
    autoBackup: true,
    sessionTimeout: 30,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'webp']
  })
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: '1.0.0',
    lastBackup: 'Nunca',
    databaseSize: '0 MB',
    totalUsers: 0,
    totalVehicles: 0,
    totalSales: 0,
    uptime: '0 días'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSystemInfo()
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadSystemInfo = async () => {
    try {
      // Simular carga de información del sistema
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setSystemInfo(prev => ({
          ...prev,
          totalUsers: data.totalUsers || 0,
          totalVehicles: data.totalVehicles || 0,
          totalSales: data.totalSales || 0
        }))
      }
    } catch (error) {
      console.error('Error loading system info:', error)
    }
  }

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      console.log('🔍 [DEBUG Frontend] Guardando settings:', settings)
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      console.log('🔍 [DEBUG Frontend] Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 [DEBUG Frontend] Response data:', data)
        toast.success('Configuración guardada correctamente')
        // Recargar los settings para verificar que se guardaron
        await loadSettings()
      } else {
        const errorData = await response.json()
        console.error('🔍 [DEBUG Frontend] Error response:', errorData)
        toast.error(errorData.error || 'Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    setLoading(true)
    try {
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Backup completado exitosamente')
      setSystemInfo(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleDateString('es-AR')
      }))
    } catch (error) {
      toast.error('Error al realizar backup')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = async () => {
    setLoading(true)
    try {
      // Simular limpieza de caché
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Caché limpiado correctamente')
    } catch (error) {
      toast.error('Error al limpiar caché')
    } finally {
      setLoading(false)
    }
  }

  const handleSystemRestart = async () => {
    if (confirm('¿Estás seguro de que quieres reiniciar el sistema? Esto puede tomar unos minutos.')) {
      setLoading(true)
      try {
        // Simular reinicio
        await new Promise(resolve => setTimeout(resolve, 3000))
        toast.success('Sistema reiniciado correctamente')
      } catch (error) {
        toast.error('Error al reiniciar el sistema')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Configuración del Sistema" 
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Configuración' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración General */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Ajustes básicos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Modo Mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Activar para realizar mantenimiento del sistema
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug">Modo Debug</Label>
                  <p className="text-sm text-muted-foreground">
                    Activar para mostrar información de debug
                  </p>
                </div>
                <Switch
                  id="debug"
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar notificaciones por email
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backup">Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Realizar backup automático diario
                  </p>
                </div>
                <Switch
                  id="backup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeout">Timeout de Sesión (minutos)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="filesize">Tamaño Máximo de Archivo (MB)</Label>
                  <Input
                    id="filesize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {loading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Acciones del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Acciones del Sistema
              </CardTitle>
              <CardDescription>
                Operaciones de mantenimiento y administración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleBackup} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Crear Backup
                </Button>
                
                <Button 
                  onClick={handleClearCache} 
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpiar Caché
                </Button>
                
                <Button 
                  onClick={handleSystemRestart} 
                  disabled={loading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reiniciar Sistema
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Gestión de Templates
              </CardTitle>
              <CardDescription>
                Personaliza los templates de documentos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Configura y personaliza los templates para boletos de compra-venta, recibos y otros documentos del sistema.
                </p>
                <Button 
                  asChild
                  className="flex items-center gap-2"
                >
                  <a href="/admin/settings/document-templates">
                    <FileText className="h-4 w-4" />
                    Gestionar Templates
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del Sistema */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Versión:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Último Backup:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.lastBackup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Tamaño BD:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.databaseSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Tiempo Activo:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.uptime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Usuarios:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Vehículos:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.totalVehicles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Ventas:</span>
                  <span className="text-sm text-muted-foreground">{systemInfo.totalSales}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 