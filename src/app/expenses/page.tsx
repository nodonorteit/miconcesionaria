'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, DollarSign, Upload, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface Expense {
  id: string
  type: 'WORKSHOP' | 'PARTS' | 'COMMISSION'
  amount: number
  description: string
  workshopId?: string
  commissionistId?: string
  receiptPath?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  workshop?: {
    id: string
    name: string
  }
  commissionist?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    commissionRate: number
  }
}

interface Workshop {
  id: string
  name: string
  email: string
  phone: string
}

interface Seller {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  commissionRate: number
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [commissionists, setCommissionists] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    type: 'WORKSHOP',
    amount: '',
    description: '',
    workshopId: '',
    commissionistId: '',
    receipt: null as File | null
  })

  useEffect(() => {
    fetchExpenses()
    fetchWorkshops()
    fetchCommissionists()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        
        // Transformar los datos para que coincidan con la interfaz Expense
        const transformedExpenses = data.map((expense: any) => ({
          ...expense,
          workshop: expense.workshopName ? {
            id: expense.workshopId,
            name: expense.workshopName
          } : undefined,
          commissionist: expense.commissionistId ? {
            id: expense.commissionistId,
            firstName: expense.commissionistFirstName,
            lastName: expense.commissionistLastName,
            email: expense.commissionistEmail,
            phone: expense.commissionistPhone,
            commissionRate: expense.commissionistCommissionRate
          } : undefined
        }))
        
        setExpenses(transformedExpenses)
      } else {
        toast.error('Error al cargar egresos')
      }
    } catch (error) {
      toast.error('Error al cargar egresos')
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('/api/workshops')
      if (response.ok) {
        const data = await response.json()
        setWorkshops(data)
      }
    } catch (error) {
      console.error('Error fetching workshops:', error)
    }
  }

  const fetchCommissionists = async () => {
    try {
      const response = await fetch('/api/sellers')
      if (response.ok) {
        const data = await response.json()
        setCommissionists(data)
      }
    } catch (error) {
      console.error('Error fetching commissionists:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.description) {
      toast.error('Por favor complete todos los campos requeridos')
      return
    }

    if (formData.type === 'WORKSHOP' && !formData.workshopId) {
      toast.error('Por favor seleccione un taller')
      return
    }

    if (formData.type === 'COMMISSION' && !formData.commissionistId) {
      toast.error('Por favor seleccione un vendedor')
      return
    }

    try {
      const data = new FormData()
      data.append('type', formData.type)
      data.append('amount', formData.amount)
      data.append('description', formData.description)
      
      if (formData.workshopId) {
        data.append('workshopId', formData.workshopId)
      }
      
      if (formData.commissionistId) {
        data.append('commissionistId', formData.commissionistId)
      }
      
      if (formData.receipt) {
        data.append('receipt', formData.receipt)
      }

      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses'
      const method = editingExpense ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: data
      })

      if (response.ok) {
        toast.success(editingExpense ? 'Egreso actualizado exitosamente' : 'Egreso creado exitosamente')
        resetForm()
        fetchExpenses()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al procesar el egreso')
      }
    } catch (error) {
      toast.error('Error al procesar el egreso')
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      type: expense.type,
      amount: expense.amount.toString(),
      description: expense.description,
      workshopId: expense.workshopId || '',
      commissionistId: expense.commissionistId || '',
      receipt: null
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este egreso?')) {
      return
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Egreso eliminado exitosamente')
        fetchExpenses()
      } else {
        toast.error('Error al eliminar el egreso')
      }
    } catch (error) {
      toast.error('Error al eliminar el egreso')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'WORKSHOP',
      amount: '',
      description: '',
      workshopId: '',
      commissionistId: '',
      receipt: null
    })
    setEditingExpense(null)
    setShowForm(false)
  }

  const getExpenseTypeLabel = (type: string) => {
    switch (type) {
      case 'WORKSHOP': return 'Taller'
      case 'PARTS': return 'Repuestos'
      case 'COMMISSION': return 'Comisión'
      default: return type
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Navigation title="Egresos" />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando egresos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation title="Egresos" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Egresos</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Egreso
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingExpense ? 'Editar Egreso' : 'Nuevo Egreso'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Egreso</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="WORKSHOP">Taller</option>
                    <option value="PARTS">Repuestos</option>
                    <option value="COMMISSION">Comisión</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="amount">Monto</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del egreso"
                    required
                  />
                </div>

                {formData.type === 'WORKSHOP' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="workshopId">Taller</Label>
                    <select
                      id="workshopId"
                      value={formData.workshopId}
                      onChange={(e) => setFormData({ ...formData, workshopId: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Seleccionar taller</option>
                      {workshops.map((workshop) => (
                        <option key={workshop.id} value={workshop.id}>
                          {workshop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.type === 'COMMISSION' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="sellerId">Vendedor</Label>
                    <select
                      id="sellerId"
                      value={formData.commissionistId}
                      onChange={(e) => setFormData({ ...formData, commissionistId: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Seleccionar vendedor</option>
                      {commissionists.map((commissionist) => (
                        <option key={commissionist.id} value={commissionist.id}>
                          {commissionist.firstName} {commissionist.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(formData.type === 'WORKSHOP' || formData.type === 'PARTS') && (
                  <div className="md:col-span-2">
                    <Label htmlFor="receipt">Comprobante (PDF, JPG, PNG, GIF, WebP)</Label>
                    <Input
                      id="receipt"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => setFormData({ ...formData, receipt: e.target.files?.[0] || null })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {editingExpense ? 'Actualizar' : 'Crear'} Egreso
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {getExpenseTypeLabel(expense.type)}
                    </span>
                    <span className="text-lg font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{expense.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Fecha: {formatDate(expense.createdAt)}</p>
                    {expense.workshop && <p>Taller: {expense.workshop.name}</p>}
                    {expense.commissionist && <p>Vendedor: {expense.commissionist.firstName} {expense.commissionist.lastName}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {expense.receiptPath && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(expense.receiptPath, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Ver
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(expense)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expenses.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay egresos registrados</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 