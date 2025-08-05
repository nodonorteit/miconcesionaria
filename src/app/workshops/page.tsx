'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Wrench } from 'lucide-react'
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
  zipCode?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
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
      state: workshop.state || '',
      zipCode: workshop.zipCode || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este taller?')) return
    
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
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando talleres...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Gestión de Talleres" 
        breadcrumbs={[{ label: 'Talleres' }]}
      />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Taller
        </Button>
      </div>

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
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Provincia</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingWorkshop ? 'Actualizar' : 'Crear'} Taller
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workshops.map((workshop) => (
          <Card key={workshop.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{workshop.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(workshop)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(workshop.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workshop.email && (
                  <p><strong>Email:</strong> {workshop.email}</p>
                )}
                {workshop.phone && (
                  <p><strong>Teléfono:</strong> {workshop.phone}</p>
                )}
                {workshop.address && (
                  <p><strong>Dirección:</strong> {workshop.address}</p>
                )}
                {(workshop.city || workshop.state) && (
                  <p><strong>Ubicación:</strong> {workshop.city}, {workshop.state}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workshops.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay talleres registrados</p>
        </div>
      )}
    </div>
  )
} 