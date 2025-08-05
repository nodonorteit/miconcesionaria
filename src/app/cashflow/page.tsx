'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, DollarSign, Upload, Download, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface CashFlow {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
  description: string
  category: string
  date: string
  receiptUrl?: string
  createdAt: string
  updatedAt: string
}

export default function CashFlowPage() {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCashFlow, setEditingCashFlow] = useState<CashFlow | null>(null)
  const [formData, setFormData] = useState({
    type: 'INCOME',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCashFlows()
  }, [])

  const fetchCashFlows = async () => {
    try {
      const response = await fetch('/api/cashflow')
      if (response.ok) {
        const data = await response.json()
        setCashFlows(data)
      } else {
        toast.error('Error al cargar flujo de caja')
      }
    } catch (error) {
      toast.error('Error al cargar flujo de caja')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PDF, JPG, PNG o GIF')
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede ser mayor a 5MB')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('type', formData.type)
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category)
      
      if (selectedFile) {
        formDataToSend.append('receipt', selectedFile)
      }

      const url = editingCashFlow 
        ? `/api/cashflow/${editingCashFlow.id}`
        : '/api/cashflow'
      
      const method = editingCashFlow ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      if (response.ok) {
        toast.success(editingCashFlow ? 'Movimiento actualizado' : 'Movimiento creado')
        setShowForm(false)
        setEditingCashFlow(null)
        resetForm()
        fetchCashFlows()
      } else {
        toast.error('Error al guardar movimiento')
      }
    } catch (error) {
      toast.error('Error al guardar movimiento')
    }
  }

  const handleEdit = (cashFlow: CashFlow) => {
    setEditingCashFlow(cashFlow)
    setFormData({
      type: cashFlow.type,
      amount: cashFlow.amount.toString(),
      description: cashFlow.description,
      category: cashFlow.category,
      date: new Date(cashFlow.createdAt).toISOString().split('T')[0]
    })
    setSelectedFile(null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este movimiento?')) return
    
    try {
      const response = await fetch(`/api/cashflow/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Movimiento eliminado')
        fetchCashFlows()
      } else {
        toast.error('Error al eliminar movimiento')
      }
    } catch (error) {
      toast.error('Error al eliminar movimiento')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'INCOME',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    })
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getTypeLabel = (type: string) => {
    return type === 'INCOME' ? 'Ingreso' : 'Egreso'
  }

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'text-green-600' : 'text-red-600'
  }

  const getTypeIcon = (type: string) => {
    return type === 'INCOME' ? '💰' : '💸'
  }

  const calculateBalance = () => {
    return cashFlows.reduce((balance, flow) => {
      const amount = typeof flow.amount === 'number' ? flow.amount : parseFloat(flow.amount) || 0
      return flow.type === 'INCOME' ? balance + amount : balance - amount
    }, 0)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando flujo de caja...</div>
      </div>
    )
  }

  const balance = calculateBalance()

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Flujo de Caja" 
        breadcrumbs={[{ label: 'Flujo de Caja' }]}
      />

      {/* Balance Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Balance Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${balance.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {balance >= 0 ? 'Balance positivo' : 'Balance negativo'}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Movimiento
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingCashFlow ? 'Editar Movimiento' : 'Nuevo Movimiento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="INCOME">Ingreso</option>
                    <option value="EXPENSE">Egreso</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Monto</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="Ej: Ventas, Gastos, Comisiones, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="receipt">Comprobante (PDF, JPG, PNG, GIF)</Label>
                <Input
                  id="receipt"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Máximo 5MB. Formatos permitidos: PDF, JPG, PNG, GIF
                </p>
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingCashFlow ? 'Actualizar' : 'Crear'} Movimiento
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCashFlow(null)
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

      <div className="space-y-4">
        {cashFlows.map((cashFlow) => (
          <Card key={cashFlow.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(cashFlow.type)}</span>
                  <span className={getTypeColor(cashFlow.type)}>
                    {getTypeLabel(cashFlow.type)} - {cashFlow.category}
                  </span>
                </div>
                <div className="flex gap-1">
                  {cashFlow.receiptUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(cashFlow.receiptUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(cashFlow)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(cashFlow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Monto:</strong> <span className={getTypeColor(cashFlow.type)}>${(typeof cashFlow.amount === 'number' ? cashFlow.amount : parseFloat(cashFlow.amount) || 0).toLocaleString()}</span></p>
                <p><strong>Descripción:</strong> {cashFlow.description}</p>
                <p><strong>Fecha:</strong> {new Date(cashFlow.createdAt).toLocaleDateString()}</p>
                {cashFlow.receiptUrl && (
                  <p><strong>Comprobante:</strong> <span className="text-green-600">✓ Cargado</span></p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cashFlows.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay movimientos registrados</p>
        </div>
      )}
    </div>
  )
} 