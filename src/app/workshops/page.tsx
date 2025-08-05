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
    if (!confirm('¿Está seguro de que desea eliminar este taller?')) {
      return
    }

    try {
      const response = await fetch(`/api/workshops/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Taller eliminado exitosamente')
        fetchWorkshops()
      } else {
        toast.error('Error al eliminar el taller')
      }
    } catch (error) {
      toast.error('Error al eliminar el taller')
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
    setEditingWorkshop(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
  }

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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Talleres</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Taller
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingWorkshop ? 'Editar Taller' : 'Nuevo Taller'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Taller *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre del taller"
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
                    placeholder="email@taller.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Av. Corrientes 1234"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Buenos Aires"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Provincia</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CABA"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="1234"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  {editingWorkshop ? 'Actualizar' : 'Crear'} Taller
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Talleres */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Talleres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Teléfono</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Dirección</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ciudad</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Fecha Creación</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {workshops.map((workshop) => (
                  <tr key={workshop.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {workshop.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {workshop.email || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {workshop.phone || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {workshop.address || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {workshop.city || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatDate(workshop.createdAt)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex justify-center gap-2">
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {workshops.length === 0 && !loading && (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay talleres registrados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 