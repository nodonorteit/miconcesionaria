'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Wrench, Eye, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface Workshop {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [deletingWorkshop, setDeletingWorkshop] = useState<string | null>(null)
  const [viewingWorkshop, setViewingWorkshop] = useState<Workshop | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  })

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('/api/workshops')
      if (response.ok) {
        const data = await response.json()
        setWorkshops(data)
      } else {
        toast.error('Error al cargar talleres')
      }
    } catch (error) {
      toast.error('Error al cargar talleres')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingWorkshop 
        ? `/api/workshops/${editingWorkshop.id}`
        : '/api/workshops'
      
      const method = editingWorkshop ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingWorkshop ? 'Taller actualizado' : 'Taller creado')
        setShowForm(false)
        setEditingWorkshop(null)
        resetForm()
        fetchWorkshops()
      } else {
        toast.error('Error al guardar taller')
      }
    } catch (error) {
      toast.error('Error al guardar taller')
    }
  }

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop)
    setFormData({
      name: workshop.name,
      email: workshop.email || '',
      phone: workshop.phone || '',
      address: workshop.address || '',
      city: workshop.city || '',
      state: workshop.state || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este taller?')) {
      return
    }

    setDeletingWorkshop(id)
    try {
      const response = await fetch(`/api/workshops/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Taller eliminado')
        fetchWorkshops()
      } else {
        toast.error('Error al eliminar taller')
      }
    } catch (error) {
      toast.error('Error al eliminar taller')
    } finally {
      setDeletingWorkshop(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: ''
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  const filteredWorkshops = workshops.filter(workshop =>
    workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.phone?.includes(searchTerm) ||
    workshop.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Navigation title="Talleres" />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando talleres...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation title="Talleres" />

      {/* Header con búsqueda y botón agregar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar talleres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Taller
        </Button>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingWorkshop ? 'Editar Taller' : 'Nuevo Taller'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Provincia</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingWorkshop ? 'Actualizar' : 'Crear'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingWorkshop(null)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de talleres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Talleres ({filteredWorkshops.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWorkshops.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron talleres que coincidan con la búsqueda' : 'No hay talleres registrados'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Wrench className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{workshop.name}</h3>
                        <div className="text-sm text-gray-500 space-y-1">
                          {workshop.email && <div>📧 {workshop.email}</div>}
                          {workshop.phone && <div>📞 {workshop.phone}</div>}
                          {workshop.city && <div>🏙️ {workshop.city}</div>}
                          <div>📅 Creado: {formatDate(workshop.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingWorkshop(workshop)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(workshop)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(workshop.id)}
                      disabled={deletingWorkshop === workshop.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de vista detallada */}
      {viewingWorkshop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Detalles del Taller
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                <p className="text-lg font-medium">{viewingWorkshop.name}</p>
              </div>
              {viewingWorkshop.email && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p>{viewingWorkshop.email}</p>
                </div>
              )}
              {viewingWorkshop.phone && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                  <p>{viewingWorkshop.phone}</p>
                </div>
              )}
              {viewingWorkshop.address && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dirección</Label>
                  <p>{viewingWorkshop.address}</p>
                </div>
              )}
              {viewingWorkshop.city && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ciudad</Label>
                  <p className="text-gray-900">{viewingWorkshop.city}</p>
                </div>
              )}
              {viewingWorkshop.state && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Provincia</Label>
                  <p className="text-gray-900">{viewingWorkshop.state}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-500">Estado</Label>
                <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  viewingWorkshop.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {viewingWorkshop.isActive ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                <p>{formatDate(viewingWorkshop.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Última Actualización</Label>
                <p>{formatDate(viewingWorkshop.updatedAt)}</p>
              </div>
              <Button
                onClick={() => setViewingWorkshop(null)}
                className="w-full"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 