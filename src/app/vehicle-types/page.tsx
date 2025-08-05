'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Car } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface VehicleType {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function VehicleTypesPage() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState<VehicleType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchVehicleTypes()
  }, [])

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('/api/vehicle-types')
      if (response.ok) {
        const data = await response.json()
        setVehicleTypes(data)
      } else {
        toast.error('Error al cargar tipos de vehículos')
      }
    } catch (error) {
      toast.error('Error al cargar tipos de vehículos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingType 
        ? `/api/vehicle-types/${editingType.id}`
        : '/api/vehicle-types'
      
      const method = editingType ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingType ? 'Tipo actualizado' : 'Tipo creado')
        setShowForm(false)
        setEditingType(null)
        resetForm()
        fetchVehicleTypes()
      } else {
        toast.error('Error al guardar tipo de vehículo')
      }
    } catch (error) {
      toast.error('Error al guardar tipo de vehículo')
    }
  }

  const handleEdit = (vehicleType: VehicleType) => {
    setEditingType(vehicleType)
    setFormData({
      name: vehicleType.name,
      description: vehicleType.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este tipo de vehículo?')) return
    
    try {
      const response = await fetch(`/api/vehicle-types/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Tipo de vehículo eliminado')
        fetchVehicleTypes()
      } else {
        toast.error('Error al eliminar tipo de vehículo')
      }
    } catch (error) {
      toast.error('Error al eliminar tipo de vehículo')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando tipos de vehículos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Tipos de Vehículos" 
        breadcrumbs={[{ label: 'Tipos de Vehículos' }]}
      />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tipo
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingType ? 'Editar Tipo de Vehículo' : 'Nuevo Tipo de Vehículo'}
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
                    placeholder="Ej: Sedán, SUV, Camión, Lancha, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción opcional del tipo de vehículo"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingType ? 'Actualizar' : 'Crear'} Tipo
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingType(null)
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

      {/* Lista de tipos de vehículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicleTypes.map((vehicleType) => (
          <Card key={vehicleType.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  <span>{vehicleType.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicleType)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(vehicleType.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {vehicleType.description && (
                <p className="text-sm text-gray-600 mb-2">{vehicleType.description}</p>
              )}
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  vehicleType.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {vehicleType.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicleTypes.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay tipos de vehículos registrados</p>
        </div>
      )}
    </div>
  )
} 