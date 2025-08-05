'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Car, Bike, Truck, Tractor, Anchor, Wrench, Home, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface VehicleType {
  id: string
  name: string
  category: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const categoryIcons = {
  AUTOMOTIVE: Car,
  MOTORCYCLE: Bike,
  COMMERCIAL: Truck,
  AGRICULTURAL: Tractor,
  MARINE: Anchor,
  CONSTRUCTION: Wrench,
  RECREATIONAL: Home,
  SPECIALTY: Star
}

const categoryLabels = {
  AUTOMOTIVE: 'Automotriz',
  MOTORCYCLE: 'Motocicletas',
  COMMERCIAL: 'Comercial',
  AGRICULTURAL: 'Agrícola',
  MARINE: 'Marítimo',
  CONSTRUCTION: 'Construcción',
  RECREATIONAL: 'Recreativo',
  SPECIALTY: 'Especializado'
}

export default function VehicleTypesPage() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState<VehicleType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'AUTOMOTIVE',
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
      category: vehicleType.category,
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
      category: 'AUTOMOTIVE',
      description: ''
    })
  }

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Car
    return <IconComponent className="h-5 w-5" />
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
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="AUTOMOTIVE">🚗 Automotriz (Autos, camionetas, SUVs)</option>
                    <option value="MOTORCYCLE">🏍️ Motocicletas (Motos, scooters, cuatriciclos)</option>
                    <option value="COMMERCIAL">🚛 Comercial (Camiones, furgones, vans)</option>
                    <option value="AGRICULTURAL">🚜 Agrícola (Tractores, cosechadoras)</option>
                    <option value="MARINE">⛵ Marítimo (Barcos, lanchas, yates)</option>
                    <option value="CONSTRUCTION">🏗️ Construcción (Excavadoras, grúas)</option>
                    <option value="RECREATIONAL">🏕️ Recreativo (Caravanas, motorhomes)</option>
                    <option value="SPECIALTY">⭐ Especializado (Vehículos especiales)</option>
                  </select>
                </div>
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

      {/* Categorías organizadas */}
      {Object.entries(categoryLabels).map(([categoryKey, categoryLabel]) => {
        const typesInCategory = vehicleTypes.filter(type => type.category === categoryKey)
        if (typesInCategory.length === 0) return null

        return (
          <Card key={categoryKey} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(categoryKey)}
                {categoryLabel}
                <span className="text-sm text-gray-500">({typesInCategory.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typesInCategory.map((vehicleType) => (
                  <Card key={vehicleType.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex justify-between items-start">
                        <span>{vehicleType.name}</span>
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
                        <p className="text-sm text-gray-600">{vehicleType.description}</p>
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
            </CardContent>
          </Card>
        )
      })}

      {vehicleTypes.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay tipos de vehículos registrados</p>
        </div>
      )}
    </div>
  )
} 