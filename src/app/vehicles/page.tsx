'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Car } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  color: string
  mileage: number
  price: number
  description?: string
  vin?: string
  licensePlate?: string
  fuelType: string
  transmission: string
  status: string
  vehicleTypeId: string
  vehicleType?: {
    id: string
    name: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface VehicleType {
  id: string
  name: string
  category: string
  description?: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
    mileage: '',
    price: '',
    description: '',
    vin: '',
    licensePlate: '',
    fuelType: 'GASOLINE',
    transmission: 'MANUAL',
    status: 'AVAILABLE',
    vehicleTypeId: '',
    images: [] as File[]
  })

  useEffect(() => {
    fetchVehicles()
    fetchVehicleTypes()
  }, [])

  const fetchVehicleTypes = async () => {
    try {
      const response = await fetch('/api/vehicle-types')
      if (response.ok) {
        const data = await response.json()
        setVehicleTypes(data)
      }
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      } else {
        toast.error('Error al cargar vehículos')
      }
    } catch (error) {
      toast.error('Error al cargar vehículos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('brand', formData.brand)
      formDataToSend.append('model', formData.model)
      formDataToSend.append('year', formData.year)
      formDataToSend.append('color', formData.color)
      formDataToSend.append('mileage', formData.mileage)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('vin', formData.vin)
      formDataToSend.append('licensePlate', formData.licensePlate)
      formDataToSend.append('fuelType', formData.fuelType)
      formDataToSend.append('transmission', formData.transmission)
      formDataToSend.append('status', formData.status)
      
      // Agregar imágenes
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image)
      })

      const url = editingVehicle 
        ? `/api/vehicles/${editingVehicle.id}`
        : '/api/vehicles'
      
      const method = editingVehicle ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      if (response.ok) {
        toast.success(editingVehicle ? 'Vehículo actualizado' : 'Vehículo creado')
        setShowForm(false)
        setEditingVehicle(null)
        resetForm()
        fetchVehicles()
      } else {
        toast.error('Error al guardar vehículo')
      }
    } catch (error) {
      toast.error('Error al guardar vehículo')
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      color: vehicle.color,
      mileage: vehicle.mileage.toString(),
      price: vehicle.price.toString(),
      description: vehicle.description || '',
      vin: vehicle.vin || '',
      licensePlate: vehicle.licensePlate || '',
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      status: vehicle.status,
      vehicleTypeId: vehicle.vehicleTypeId,
      images: []
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este vehículo?')) return
    
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Vehículo eliminado')
        fetchVehicles()
      } else {
        toast.error('Error al eliminar vehículo')
      }
    } catch (error) {
      toast.error('Error al eliminar vehículo')
    }
  }

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      year: '',
      color: '',
      mileage: '',
      price: '',
      description: '',
      vin: '',
      licensePlate: '',
      fuelType: 'GASOLINE',
      transmission: 'MANUAL',
      status: 'AVAILABLE',
      vehicleTypeId: '',
      images: []
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando vehículos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Gestión de Vehículos" 
        breadcrumbs={[{ label: 'Vehículos' }]}
      />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Vehículo
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleTypeId">Tipo de Vehículo</Label>
                  <select
                    id="vehicleTypeId"
                    value={formData.vehicleTypeId}
                    onChange={(e) => setFormData({...formData, vehicleTypeId: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar tipo...</option>
                    {vehicleTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Año</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Kilometraje</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vin">VIN (Número de Serie)</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => setFormData({...formData, vin: e.target.value})}
                    placeholder="17 caracteres alfanuméricos"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Número de identificación único del vehículo (Vehicle Identification Number)
                  </p>
                </div>
                <div>
                  <Label htmlFor="images">Fotos del Vehículo (máximo 10)</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 10) {
                        toast.error('Máximo 10 fotos permitidas')
                        return
                      }
                      // Validar tipos de archivo
                      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
                      const invalidFiles = files.filter(file => !validTypes.includes(file.type))
                      if (invalidFiles.length > 0) {
                        toast.error('Solo se permiten archivos JPG, PNG o GIF')
                        return
                      }
                      // Validar tamaño (máximo 5MB por archivo)
                      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
                      if (oversizedFiles.length > 0) {
                        toast.error('Cada archivo no puede ser mayor a 5MB')
                        return
                      }
                      setFormData({...formData, images: files})
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Máximo 10 fotos. Formatos: JPG, PNG, GIF. Máximo 5MB por archivo.
                  </p>
                </div>
                <div>
                  <Label htmlFor="licensePlate">Patente</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fuelType">Combustible</Label>
                  <select
                    id="fuelType"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar combustible...</option>
                    <option value="GASOLINE">Gasolina</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Eléctrico</option>
                    <option value="HYBRID">Híbrido</option>
                    <option value="LPG">GLP</option>
                    <option value="CNG">GNC</option>
                    <option value="HYDROGEN">Hidrógeno</option>
                    <option value="BIOFUEL">Biocombustible</option>
                    <option value="SOLAR">Solar</option>
                    <option value="WIND">Eólico</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="transmission">Transmisión</Label>
                  <select
                    id="transmission"
                    value={formData.transmission}
                    onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar transmisión...</option>
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATIC">Automático</option>
                    <option value="CVT">CVT</option>
                    <option value="SEMI_AUTOMATIC">Semi-automático</option>
                    <option value="DCT">DCT</option>
                    <option value="HYDRAULIC">Hidráulico</option>
                    <option value="ELECTRIC_DRIVE">Tracción eléctrica</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Seleccionar estado...</option>
                    <option value="AVAILABLE">Disponible</option>
                    <option value="SOLD">Vendido</option>
                    <option value="RESERVED">Reservado</option>
                    <option value="MAINTENANCE">En Mantenimiento</option>
                    <option value="REPAIR">En Reparación</option>
                    <option value="INSPECTION">En Inspección</option>
                    <option value="STORAGE">En Almacenamiento</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingVehicle ? 'Actualizar' : 'Crear'} Vehículo
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingVehicle(null)
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
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{vehicle.brand} {vehicle.model}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Tipo:</strong> {vehicle.vehicleType?.name || 'Sin tipo'}</p>
                <p><strong>Año:</strong> {vehicle.year}</p>
                <p><strong>Color:</strong> {vehicle.color}</p>
                <p><strong>Kilometraje:</strong> {vehicle.mileage.toLocaleString()} km</p>
                <p><strong>Precio:</strong> ${vehicle.price.toLocaleString()}</p>
                <p><strong>Estado:</strong> {vehicle.status}</p>
                {vehicle.licensePlate && (
                  <p><strong>Patente:</strong> {vehicle.licensePlate}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay vehículos registrados</p>
        </div>
      )}
    </div>
  )
} 