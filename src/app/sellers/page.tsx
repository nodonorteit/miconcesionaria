'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

interface Seller {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  commissionRate: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    commissionRate: '5'
  })

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers')
      if (response.ok) {
        const data = await response.json()
        setSellers(data)
      } else {
        toast.error('Error al cargar vendedores')
      }
    } catch (error) {
      toast.error('Error al cargar vendedores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSeller 
        ? `/api/sellers/${editingSeller.id}`
        : '/api/sellers'
      
      const method = editingSeller ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          commissionRate: parseFloat(formData.commissionRate)
        }),
      })

      if (response.ok) {
        toast.success(editingSeller ? 'Vendedor actualizado' : 'Vendedor creado')
        setShowForm(false)
        setEditingSeller(null)
        resetForm()
        fetchSellers()
      } else {
        toast.error('Error al guardar vendedor')
      }
    } catch (error) {
      toast.error('Error al guardar vendedor')
    }
  }

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller)
    setFormData({
      firstName: seller.firstName,
      lastName: seller.lastName,
      email: seller.email,
      phone: seller.phone || '',
      commissionRate: seller.commissionRate.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este vendedor?')) return
    
    try {
      const response = await fetch(`/api/sellers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Vendedor eliminado')
        fetchSellers()
      } else {
        toast.error('Error al eliminar vendedor')
      }
    } catch (error) {
      toast.error('Error al eliminar vendedor')
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      commissionRate: '5'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando vendedores...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCheck className="h-8 w-8" />
          Gestión de Vendedores
        </h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Vendedor
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingSeller ? 'Editar Vendedor' : 'Nuevo Vendedor'}
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
                    required
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
                  <Label htmlFor="commissionRate">Porcentaje de Comisión (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({...formData, commissionRate: e.target.value})}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Porcentaje que se lleva el vendedor por cada venta
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingSeller ? 'Actualizar' : 'Crear'} Vendedor
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSeller(null)
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
        {sellers.map((seller) => (
          <Card key={seller.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{seller.firstName} {seller.lastName}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(seller)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(seller.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {seller.email}</p>
                {seller.phone && (
                  <p><strong>Teléfono:</strong> {seller.phone}</p>
                )}
                <p><strong>Comisión:</strong> {seller.commissionRate}%</p>
                <p><strong>Estado:</strong> {seller.isActive ? 'Activo' : 'Inactivo'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sellers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay vendedores registrados</p>
        </div>
      )}
    </div>
  )
} 