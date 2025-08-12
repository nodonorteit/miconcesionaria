'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Car, Eye, ShoppingCart, Archive, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import Link from 'next/link'
import { ImageCarousel } from '@/components/ui/image-carousel'

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
    description?: string
  }
  vehicleTypeName?: string
  vehicleTypeDescription?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  images?: Array<{
    id: string
    filename: string
    path: string
    isPrimary: boolean
    createdAt: string
  }>
}

interface VehicleType {
  id: string
  name: string
  category: string
  description?: string
}

interface Seller {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  commissionRate: number
  isActive: boolean
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  documentNumber?: string
  city?: string
  state?: string
}

export default function VehiclesPage() {
  const permissions = usePermissions()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<string | null>(null)
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null)
  const [sellingVehicle, setSellingVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [carouselImages, setCarouselImages] = useState<Array<{
    id: string
    filename: string
    path: string
    isPrimary: boolean
    createdAt: string
  }>>([])
  const [carouselInitialIndex, setCarouselInitialIndex] = useState(0)
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
  const [existingImages, setExistingImages] = useState<Array<{
    id: string
    filename: string
    path: string
    isPrimary: boolean
    createdAt: string
  }>>([])
  const [saleFormData, setSaleFormData] = useState({
    sellerId: '',
    customerId: '',
    totalAmount: '',
    commission: '',
    notes: '',
    paymentMethod: 'CONTADO',
    deliveryDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchVehicles()
    fetchVehicleTypes()
    fetchSellers()
    fetchCustomers()
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

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers')
      if (response.ok) {
        const data = await response.json()
        setSellers(data.filter((seller: Seller) => seller.isActive))
      }
    } catch (error) {
      console.error('Error fetching sellers:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
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
    
    if (submitting) {
      console.log('⏳ Ya se está enviando el formulario, ignorando...')
      return
    }
    
    setSubmitting(true)
    console.log('🚀 Iniciando envío del formulario...')
    console.log('📋 Datos del formulario:', formData)
    console.log('📸 Imágenes seleccionadas:', formData.images)
    
    try {
      let response: Response
      
      if (editingVehicle) {
        console.log('✏️ Editando vehículo existente...')
        
        // Si hay imágenes nuevas, usar FormData
        if (formData.images.length > 0) {
          console.log('📸 Hay imágenes nuevas, usando FormData para edición...')
          const formDataToSend = new FormData()
          formDataToSend.append('brand', formData.brand)
          formDataToSend.append('model', formData.model)
          formDataToSend.append('year', formData.year.toString())
          formDataToSend.append('color', formData.color)
          formDataToSend.append('mileage', formData.mileage.toString())
          formDataToSend.append('price', formData.price.toString())
          formDataToSend.append('description', formData.description || '')
          formDataToSend.append('vin', formData.vin || '')
          formDataToSend.append('licensePlate', formData.licensePlate || '')
          formDataToSend.append('fuelType', formData.fuelType)
          formDataToSend.append('transmission', formData.transmission)
          formDataToSend.append('status', formData.status)
          formDataToSend.append('vehicleTypeId', formData.vehicleTypeId)
          formDataToSend.append('isActive', 'true')
          
          // Agregar imágenes nuevas
          console.log(`📸 Agregando ${formData.images.length} imagen(es) nuevas al FormData...`)
          formData.images.forEach((image, index) => {
            console.log(`📸 Imagen nueva ${index + 1}:`, image.name, 'Size:', image.size, 'Type:', image.type)
            formDataToSend.append(`images`, image)
          })
          
          // Verificar que FormData tenga las imágenes
          console.log('🔍 Verificando FormData antes del envío (edición)...')
          const entries = Array.from(formDataToSend.entries())
          entries.forEach(([key, value]) => {
            if (key === 'images') {
              console.log(`📸 FormData[${key}]:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value)
            } else {
              console.log(`📋 FormData[${key}]:`, value)
            }
          })
          
          console.log('📤 Enviando FormData para edición al servidor...')
          response = await fetch(`/api/vehicles/${editingVehicle.id}`, {
            method: 'PUT',
            body: formDataToSend, // Sin Content-Type para FormData
          })
        } else {
          // Sin imágenes nuevas, usar JSON
          console.log('📋 Sin imágenes nuevas, usando JSON para edición...')
          const vehicleData = {
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            color: formData.color,
            mileage: formData.mileage,
            price: formData.price,
            description: formData.description,
            vin: formData.vin,
            licensePlate: formData.licensePlate,
            fuelType: formData.fuelType,
            transmission: formData.transmission,
            status: formData.status,
            vehicleTypeId: formData.vehicleTypeId,
            isActive: true
          }
          
          console.log('📤 Enviando datos JSON para edición:', vehicleData)
          
          response = await fetch(`/api/vehicles/${editingVehicle.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(vehicleData),
          })
        }
      } else {
        console.log('🆕 Creando nuevo vehículo...')
        // NUEVO VEHÍCULO - Enviar FormData (para imágenes)
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
        formDataToSend.append('vehicleTypeId', formData.vehicleTypeId)
        
        // Agregar imágenes
        console.log(`📸 Agregando ${formData.images.length} imagen(es) al FormData...`)
        formData.images.forEach((image, index) => {
          console.log(`📸 Imagen ${index + 1}:`, image.name, 'Size:', image.size, 'Type:', image.type)
          formDataToSend.append(`images`, image)
        })
        
        // Verificar que FormData tenga las imágenes
        console.log('🔍 Verificando FormData antes del envío...')
        const entries = Array.from(formDataToSend.entries())
        entries.forEach(([key, value]) => {
          if (key === 'images') {
            console.log(`📸 FormData[${key}]:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value)
          } else {
            console.log(`📋 FormData[${key}]:`, value)
          }
        })
        
        console.log('📤 Enviando FormData al servidor...')
        response = await fetch('/api/vehicles', {
          method: 'POST',
          body: formDataToSend,
        })
        
        console.log('📥 Respuesta del servidor recibida:', response.status, response.statusText)
      }

      if (response.ok) {
        console.log('✅ Operación exitosa!')
        const responseData = await response.json().catch(() => ({}))
        console.log('📥 Datos de respuesta:', responseData)
        
        toast.success(editingVehicle ? 'Vehículo actualizado' : 'Vehículo creado')
        setShowForm(false)
        setEditingVehicle(null)
        resetForm()
        fetchVehicles()
      } else {
        console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('📋 Detalles del error:', errorData)
        toast.error(`Error al ${editingVehicle ? 'actualizar' : 'crear'} vehículo: ${response.status}`)
      }
    } catch (error) {
      console.error('💥 Error inesperado en handleSubmit:', error)
      toast.error(`Error inesperado al ${editingVehicle ? 'actualizar' : 'crear'} vehículo`)
    } finally {
      setSubmitting(false)
      console.log('🏁 Finalizado envío del formulario')
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setExistingImages(vehicle.images || [])
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
    const vehicle = vehicles.find(v => v.id === id)
    if (!vehicle) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el vehículo "${vehicle.brand} ${vehicle.model}" (${vehicle.year})?\n\nEsta acción no se puede deshacer.`
    )
    
    if (!confirmed) return
    
    setDeletingVehicle(id)
    
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Vehículo eliminado correctamente')
        fetchVehicles()
      } else {
        toast.error('Error al eliminar vehículo')
      }
    } catch (error) {
      toast.error('Error al eliminar vehículo')
    } finally {
      setDeletingVehicle(null)
    }
  }

  const handleSell = (vehicle: Vehicle) => {
    if (vehicle.status === 'SOLD') {
      toast.error('Este vehículo ya ha sido vendido')
      return
    }
    
    setSellingVehicle(vehicle)
    setSaleFormData({
      sellerId: '',
      customerId: '',
      totalAmount: vehicle.price.toString(),
      commission: '',
      notes: '',
      paymentMethod: 'CONTADO',
      deliveryDate: new Date().toISOString().split('T')[0]
    })
  }

  const handleSellerChange = (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId)
    if (seller && sellingVehicle) {
      const commission = (sellingVehicle.price * seller.commissionRate / 100).toFixed(2)
      setSaleFormData({
        ...saleFormData,
        sellerId,
        commission
      })
    } else {
      setSaleFormData({
        ...saleFormData,
        sellerId,
        commission: ''
      })
    }
  }

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sellingVehicle) return
    
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: sellingVehicle.id,
          customerId: saleFormData.customerId,
          sellerId: saleFormData.sellerId,
          totalAmount: saleFormData.totalAmount,
          commission: saleFormData.commission,
          status: 'PENDING',
          notes: saleFormData.notes,
          paymentMethod: saleFormData.paymentMethod,
          deliveryDate: saleFormData.deliveryDate
        }),
      })

      if (response.ok) {
        const saleData = await response.json()
        toast.success('Venta creada exitosamente')
        
        // Mostrar opción para generar boleto
        if (confirm('¿Deseas generar el boleto de compra-venta ahora?')) {
          generateSaleDocument(saleData.id)
        }
        
        setSellingVehicle(null)
        setSaleFormData({
          sellerId: '',
          customerId: '',
          totalAmount: '',
          commission: '',
          notes: '',
          paymentMethod: 'CONTADO',
          deliveryDate: new Date().toISOString().split('T')[0]
        })
        fetchVehicles() // Actualizar la lista para mostrar el nuevo estado
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al crear la venta')
      }
    } catch (error) {
      toast.error('Error al crear la venta')
    }
  }

  const generateSaleDocument = async (saleId: string) => {
    try {
      const response = await fetch('/api/sales/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ saleId }),
      })

      if (response.ok) {
        const documentData = await response.json()
        // Abrir el boleto en una nueva ventana
        openSaleDocument(documentData.id)
      } else {
        toast.error('Error al generar el documento')
      }
    } catch (error) {
      toast.error('Error al generar el documento')
    }
  }

  const openSaleDocument = (documentId: string) => {
    // Abrir el boleto en una nueva ventana
    const newWindow = window.open(`/sales/documents/${documentId}`, '_blank')
    if (!newWindow) {
      toast.error('Por favor, permite popups para ver el boleto')
    }
  }

  const handleGenerateBoleto = async (vehicleId: string) => {
    try {
      // Buscar la venta del vehículo
      const response = await fetch(`/api/sales?vehicleId=${vehicleId}`)
      if (response.ok) {
        const sales = await response.json()
        if (sales.length > 0) {
          const sale = sales[0] // Tomar la primera venta
          // Generar el documento
          generateSaleDocument(sale.id)
        } else {
          toast.error('No se encontró la venta para este vehículo')
        }
      } else {
        toast.error('Error al buscar la venta')
      }
    } catch (error) {
      toast.error('Error al generar el boleto')
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

  // Función para eliminar imágenes existentes
  const handleDeleteImage = async (imageId: string) => {
    if (!editingVehicle) return
    
    try {
      const response = await fetch(`/api/vehicles/${editingVehicle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteImage',
          imageId: imageId
        })
      })

      if (response.ok) {
        // Actualizar el estado local removiendo la imagen eliminada
        setEditingVehicle({
          ...editingVehicle,
          images: editingVehicle.images?.filter(img => img.id !== imageId) || []
        })
        
        // También actualizar la lista de vehículos
        setVehicles(vehicles.map(vehicle => 
          vehicle.id === editingVehicle.id 
            ? { ...vehicle, images: vehicle.images?.filter(img => img.id !== imageId) || [] }
            : vehicle
        ))
        
        toast.success('Imagen eliminada correctamente')
      } else {
        toast.error('Error al eliminar la imagen')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar la imagen')
    }
  }

  // Función para eliminar imágenes antes de enviar
  const handleRemoveImageBeforeSubmit = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
    toast.success('Imagen removida del formulario')
  }

  // Función para abrir el carrusel de imágenes
  const handleOpenCarousel = (images: Array<{
    id: string
    filename: string
    path: string
    isPrimary: boolean
    createdAt: string
  }>, initialIndex: number = 0) => {
    setCarouselImages(images)
    setCarouselInitialIndex(initialIndex)
    setCarouselOpen(true)
  }

  // Filtrar vehículos basado en el término de búsqueda
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchTerm.toLowerCase()
    return (
      vehicle.brand.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.color.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
      vehicle.vin?.toLowerCase().includes(searchLower) ||
      vehicle.vehicleType?.name.toLowerCase().includes(searchLower) ||
      vehicle.year.toString().includes(searchLower) ||
      vehicle.price.toString().includes(searchLower)
    )
  })

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Buscar vehículos por marca, modelo, color, patente, VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="flex gap-2">
          <Link href="/vehicles/sold">
            <Button variant="outline">
              <Archive className="h-4 w-4 mr-2" />
              Vehículos Vendidos
            </Button>
          </Link>
          {permissions.canCreateVehicles && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Vehículo
            </Button>
          )}
        </div>
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
                      const newFiles = Array.from(e.target.files || [])
                      if (newFiles.length > 0) {
                        // Validar que no exceda el límite total
                        const totalImages = formData.images.length + newFiles.length
                        if (totalImages > 10) {
                          toast.error(`Máximo 10 fotos permitidas. Ya tienes ${formData.images.length} y estás agregando ${newFiles.length}`)
                          return
                        }
                        
                        // Validar tipos de archivo
                        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
                        const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type))
                        if (invalidFiles.length > 0) {
                          toast.error('Solo se permiten archivos JPG, PNG o GIF')
                          return
                        }
                        
                        // Validar tamaño (máximo 5MB por archivo)
                        const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024)
                        if (oversizedFiles.length > 0) {
                          toast.error('Cada archivo no puede ser mayor a 5MB')
                          return
                        }
                        
                        // AGREGAR las nuevas imágenes a las existentes
                        setFormData({
                          ...formData, 
                          images: [...formData.images, ...newFiles]
                        })
                        
                        // Limpiar el input para permitir seleccionar la misma imagen nuevamente
                        e.target.value = ''
                        
                        toast.success(`${newFiles.length} imagen(es) agregada(s) correctamente`)
                      }
                    }}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">
                      Máximo 10 fotos. Formatos: JPG, PNG, GIF. Máximo 5MB por archivo.
                    </p>
                    {formData.images.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({...formData, images: []})
                          toast.success('Todas las imágenes han sido removidas')
                        }}
                        className="text-xs"
                      >
                        Limpiar todas
                      </Button>
                    )}
                  </div>
                  
                  {/* Mostrar imágenes seleccionadas antes de enviar */}
                  {formData.images.length > 0 && (
                    <div className="col-span-2 mt-4">
                      <Label>Imágenes seleccionadas ({formData.images.length}/10)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveImageBeforeSubmit(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Principal
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                              {Math.round(image.size / 1024)}KB
                            </div>
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-500">
                          {formData.images.length} imagen(es) seleccionada(s). La primera será la imagen principal.
                        </p>
                        <div className="text-sm text-blue-600 font-medium">
                          Total: {formData.images.reduce((acc, img) => acc + img.size, 0).toLocaleString()} bytes
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Mostrar imágenes existentes en modo edición */}
                  {editingVehicle && editingVehicle.images && editingVehicle.images.length > 0 && (
                    <div className="col-span-2">
                      <Label>Imágenes existentes</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {editingVehicle.images.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={`/uploads/${image.filename}`}
                              alt={`Imagen del vehículo`}
                              className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleOpenCarousel(editingVehicle.images || [], index)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteImage(image.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            {image.isPrimary && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Principal
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {editingVehicle.images.length} imagen(es) actual(es). Pasa el mouse sobre una imagen para eliminarla.
                      </p>
                    </div>
                  )}
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
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingVehicle ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    `${editingVehicle ? 'Actualizar' : 'Crear'} Vehículo`
                  )}
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

      <div className="space-y-2">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <div className="relative">
                      <div className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                           onClick={() => handleOpenCarousel(vehicle.images || [], 0)}>
                        <img
                          src={vehicle.images[0].path}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {vehicle.images.length > 1 && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          +{vehicle.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {vehicle.year}
                    </span>
                    {vehicle.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="font-medium">Tipo:</span> {vehicle.vehicleType?.name || 'Sin tipo'}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Color:</span> {vehicle.color}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Km:</span> {vehicle.mileage.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Precio:</span> No disponible
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">Estado:</span> {vehicle.status}
                    </span>
                    {vehicle.licensePlate && (
                      <span className="flex items-center">
                        <span className="font-medium">Patente:</span> {vehicle.licensePlate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewingVehicle(vehicle)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Ver</span>
              </Button>
              
              {/* Botón para generar boleto si el vehículo está vendido */}
              {vehicle.status === 'SOLD' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateBoleto(vehicle.id)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Boleto</span>
                </Button>
              )}
              
              {vehicle.status !== 'SOLD' && permissions.canCreateSales && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSell(vehicle)}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Vender</span>
                </Button>
              )}
              {permissions.canCreateVehicles && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(vehicle)}
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
              {permissions.canDeleteVehicles && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(vehicle.id)}
                  disabled={deletingVehicle === vehicle.id}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingVehicle === vehicle.id ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                      <span className="hidden sm:inline">Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? `No se encontraron vehículos que coincidan con "${searchTerm}"` : 'No hay vehículos registrados'}
          </p>
        </div>
      )}

      {/* Modal de Vista Detallada */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewingVehicle.brand} {viewingVehicle.model}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingVehicle(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del Vehículo */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Información General</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Marca:</span>
                        <p className="text-gray-900">{viewingVehicle.brand}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Modelo:</span>
                        <p className="text-gray-900">{viewingVehicle.model}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Año:</span>
                        <p className="text-gray-900">{viewingVehicle.year}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Color:</span>
                        <p className="text-gray-900">{viewingVehicle.color}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Kilometraje:</span>
                        <p className="text-gray-900">{viewingVehicle.mileage.toLocaleString()} km</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Precio:</span>
                        <p className="text-gray-900 font-semibold">No disponible</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Estado:</span>
                        <p className="text-gray-900">{viewingVehicle.status}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Tipo:</span>
                        <p className="text-gray-900">{viewingVehicle.vehicleType?.name || 'Sin tipo'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Especificaciones Técnicas</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Combustible:</span>
                        <p className="text-gray-900">{viewingVehicle.fuelType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Transmisión:</span>
                        <p className="text-gray-900">{viewingVehicle.transmission}</p>
                      </div>
                      {viewingVehicle.vin && (
                        <div>
                          <span className="font-medium text-gray-600">VIN:</span>
                          <p className="text-gray-900">{viewingVehicle.vin}</p>
                        </div>
                      )}
                      {viewingVehicle.licensePlate && (
                        <div>
                          <span className="font-medium text-gray-600">Patente:</span>
                          <p className="text-gray-900">{viewingVehicle.licensePlate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {viewingVehicle.description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Descripción</h3>
                      <p className="text-gray-700">{viewingVehicle.description}</p>
                    </div>
                  )}
                </div>

                {/* Galería de Fotos */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Galería de Fotos</h3>
                    {viewingVehicle.images && viewingVehicle.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {viewingVehicle.images.map((image, index) => (
                          <div key={image.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={`/uploads/${image.filename}`}
                              alt={`${viewingVehicle.brand} ${viewingVehicle.model} - Foto ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleOpenCarousel(viewingVehicle.images || [], index)}
                              onError={(e) => {
                                console.error('Error loading image:', image.filename)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                          <Car className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No hay fotos cargadas para este vehículo</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {viewingVehicle.images && viewingVehicle.images.length > 0 
                        ? `${viewingVehicle.images.length} foto(s) cargada(s)`
                        : 'No hay fotos cargadas para este vehículo'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Venta */}
      {sellingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vender Vehículo: {sellingVehicle.brand} {sellingVehicle.model}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSellingVehicle(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSaleSubmit} className="space-y-6">
                {/* Información del Vehículo */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Información del Vehículo</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Marca/Modelo:</span>
                      <p className="text-gray-900">{sellingVehicle.brand} {sellingVehicle.model}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Año:</span>
                      <p className="text-gray-900">{sellingVehicle.year}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Color:</span>
                      <p className="text-gray-900">{sellingVehicle.color}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Precio:</span>
                      <p className="text-gray-900 font-semibold">No disponible</p>
                    </div>
                  </div>
                </div>

                {/* Formulario de Venta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sellerId">Vendedor *</Label>
                    <select
                      id="sellerId"
                      value={saleFormData.sellerId}
                      onChange={(e) => handleSellerChange(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Seleccionar vendedor...</option>
                      {sellers.map((seller) => (
                        <option key={seller.id} value={seller.id}>
                          {seller.firstName} {seller.lastName} ({seller.commissionRate}% comisión)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="customerId">Cliente *</Label>
                    <select
                      id="customerId"
                      value={saleFormData.customerId}
                      onChange={(e) => setSaleFormData({...saleFormData, customerId: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Seleccionar cliente...</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.firstName} {customer.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="totalAmount">Monto Total *</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      value={saleFormData.totalAmount}
                      onChange={(e) => setSaleFormData({...saleFormData, totalAmount: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="commission">Comisión</Label>
                    <Input
                      id="commission"
                      type="number"
                      step="0.01"
                      value={saleFormData.commission}
                      onChange={(e) => setSaleFormData({...saleFormData, commission: e.target.value})}
                      placeholder="Se calcula automáticamente"
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Método de Pago *</Label>
                    <select
                      id="paymentMethod"
                      value={saleFormData.paymentMethod}
                      onChange={(e) => setSaleFormData({...saleFormData, paymentMethod: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="CONTADO">Contado (Efectivo)</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="FINANCIADO">Financiado</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="deliveryDate">Fecha de Entrega *</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={saleFormData.deliveryDate}
                      onChange={(e) => setSaleFormData({...saleFormData, deliveryDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <textarea
                    id="notes"
                    value={saleFormData.notes}
                    onChange={(e) => setSaleFormData({...saleFormData, notes: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Notas adicionales sobre la venta..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Crear Venta
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setSellingVehicle(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Carrusel de imágenes */}
      <ImageCarousel
        images={carouselImages}
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        initialImageIndex={carouselInitialIndex}
      />
    </div>
  )
} 