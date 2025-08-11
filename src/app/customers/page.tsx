'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  documentNumber?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    documentNumber: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      } else {
        toast.error('Error al cargar clientes')
      }
    } catch (error) {
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCustomer 
        ? `/api/customers/${editingCustomer.id}`
        : '/api/customers'
      
      const method = editingCustomer ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingCustomer ? 'Cliente actualizado' : 'Cliente creado')
        setShowForm(false)
        setEditingCustomer(null)
        resetForm()
        fetchCustomers()
      } else {
        toast.error('Error al guardar cliente')
      }
    } catch (error) {
      toast.error('Error al guardar cliente')
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      documentNumber: customer.documentNumber || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const customer = customers.find(c => c.id === id)
    if (!customer) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar al cliente "${customer.firstName} ${customer.lastName}"?\n\nEsta acción no se puede deshacer.`
    )
    
    if (!confirmed) return
    
    setDeletingCustomer(id)
    
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Cliente eliminado correctamente')
        fetchCustomers()
      } else {
        toast.error('Error al eliminar cliente')
      }
    } catch (error) {
      toast.error('Error al eliminar cliente')
    } finally {
      setDeletingCustomer(null)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      documentNumber: ''
    })
  }

  // Filtrar clientes basado en el término de búsqueda
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.documentNumber?.toLowerCase().includes(searchLower) ||
      customer.city?.toLowerCase().includes(searchLower) ||
      customer.state?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Gestión de Clientes" 
        breadcrumbs={[{ label: 'Clientes' }]}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Buscar clientes por nombre, email, teléfono, DNI/CUIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Cliente
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
                  <Label htmlFor="documentNumber">DNI/CUIL</Label>
                  <Input
                    id="documentNumber"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
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
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCustomer ? 'Actualizar' : 'Crear'} Cliente
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCustomer(null)
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
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    {customer.isActive ? (
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
                    {customer.email && (
                      <span className="flex items-center">
                        <span className="font-medium">Email:</span> {customer.email}
                      </span>
                    )}
                    {customer.phone && (
                      <span className="flex items-center">
                        <span className="font-medium">Tel:</span> {customer.phone}
                      </span>
                    )}
                    {customer.documentNumber && (
                      <span className="flex items-center">
                        <span className="font-medium">DNI/CUIL:</span> {customer.documentNumber}
                      </span>
                    )}
                    {(customer.city || customer.state) && (
                      <span className="flex items-center">
                        <span className="font-medium">Ubicación:</span> {customer.city}, {customer.state}
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
                onClick={() => handleEdit(customer)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(customer.id)}
                disabled={deletingCustomer === customer.id}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingCustomer === customer.id ? (
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
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? `No se encontraron clientes que coincidan con "${searchTerm}"` : 'No hay clientes registrados'}
          </p>
        </div>
      )}
    </div>
  )
} 