'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import './boleto.css'

interface SaleDocument {
  id: string
  documentNumber: string
  sale: {
    id: string
    saleNumber: string
    saleDate: string
    totalAmount: number
    commission: number
    notes?: string
    vehicle: {
      id: string
      brand: string
      model: string
      year: number
      color: string
      mileage: number
      vin?: string
      licensePlate?: string
      vehicleType: {
        name: string
      }
    }
    customer: {
      id: string
      firstName: string
      lastName: string
      email?: string
      phone?: string
      documentNumber?: string
      city?: string
      state?: string
      address?: string
    }
    seller: {
      id: string
      firstName: string
      lastName: string
      email?: string
      phone?: string
      commissionRate: number
    }
  }
}

export default function SaleDocumentPage() {
  const params = useParams()
  const [document, setDocument] = useState<SaleDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id as string)
    }
  }, [params.id])

  const fetchDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/sales/documents/${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setDocument(data)
      } else {
        setError('Documento no encontrado')
      }
    } catch (error) {
      setError('Error al cargar el documento')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando documento...</p>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Documento no encontrado'}</p>
            <Link href="/vehicles">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Vehículos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Botones de acción */}
      <div className="max-w-4xl mx-auto mb-6 flex gap-4 print:hidden">
        <Link href="/vehicles">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Documento */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
        <div className="p-8 print:p-4">
          {/* Encabezado */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">PARANÁ AUTOMOTORES</h1>
              <p className="text-gray-600">Av. Ramirez 3421 - Paraná - Entre Ríos</p>
              <p className="text-gray-600">CUIL/CUIT: 30718034376</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 mb-2">BOLETO DE COMPRA-VENTA</div>
              <div className="text-lg text-gray-600">N° {document.documentNumber}</div>
              <div className="text-sm text-gray-500">Fecha: {formatDate(document.sale.saleDate)}</div>
            </div>
          </div>

          {/* Información de las partes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">COMPRADOR</h3>
              <p className="text-gray-800 font-medium">Paraná Automotores</p>
              <p className="text-gray-600">Av. Ramirez 3421</p>
              <p className="text-gray-600">Paraná - Entre Ríos</p>
              <p className="text-gray-600">CUIL/CUIT: 30718034376</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">VENDEDOR</h3>
              <p className="text-gray-800 font-medium">{document.sale.customer.firstName} {document.sale.customer.lastName}</p>
              <p className="text-gray-600">{document.sale.customer.address || 'Sin dirección'}</p>
              <p className="text-gray-600">{document.sale.customer.city || ''} {document.sale.customer.state || ''}</p>
              <p className="text-gray-600">Doc. Ident. N°: {document.sale.customer.documentNumber || '---'}</p>
              <p className="text-gray-600">CUIL/CUIT: {document.sale.customer.documentNumber || '---'}</p>
            </div>
          </div>

          {/* Información del vehículo */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">INFORMACIÓN DEL VEHÍCULO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">Marca:</span>
                <p className="text-gray-900">{document.sale.vehicle.brand}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Modelo:</span>
                <p className="text-gray-900">{document.sale.vehicle.model}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Año:</span>
                <p className="text-gray-900">{document.sale.vehicle.year}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Color:</span>
                <p className="text-gray-900">{document.sale.vehicle.color}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Número de Motor:</span>
                <p className="text-gray-900">{document.sale.vehicle.vin || '---'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Patente:</span>
                <p className="text-gray-900">{document.sale.vehicle.licensePlate || '---'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Tipo:</span>
                <p className="text-gray-900">{document.sale.vehicle.vehicleType.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Kilometraje:</span>
                <p className="text-gray-900">{document.sale.vehicle.mileage.toLocaleString()} km</p>
              </div>
            </div>
          </div>

          {/* Precio y forma de pago */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">PRECIO TOTAL</h3>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(document.sale.totalAmount)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">FORMA DE PAGO</h3>
                <p className="text-gray-900 text-lg">CONTADO (Efectivo)</p>
              </div>
            </div>
          </div>

          {/* Condiciones y responsabilidades */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">CONDICIONES Y RESPONSABILIDADES</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Responsabilidades del Vendedor:</strong> El vendedor se responsabiliza por lo vendido, declarando que no tiene embargos, prendas agrarias (Ley 12.962), ni impedimentos para la venta.</p>
              <p><strong>Condiciones de Entrega:</strong> La unidad se entrega en el estado en que se encuentra, y el comprador declara conocer sus características.</p>
              <p><strong>Transferencia:</strong> El comprador se compromete a realizar la transferencia de dominio del vehículo dentro de los diez días de la fecha, según la Ley 22.977.</p>
              <p><strong>Gastos:</strong> Todos los gastos de transferencia, trámites y gestiones son a cargo exclusivo del comprador.</p>
            </div>
          </div>

          {/* Firmas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-4">
                <p className="font-semibold text-gray-900">COMPRADOR</p>
                <p className="text-gray-600">Paraná Automotores</p>
                <div className="mt-8 h-16 border-b border-gray-400"></div>
                <p className="text-sm text-gray-500 mt-2">Firma</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-4">
                <p className="font-semibold text-gray-900">VENDEDOR</p>
                <p className="text-gray-600">{document.sale.customer.firstName} {document.sale.customer.lastName}</p>
                <div className="mt-8 h-16 border-b border-gray-400"></div>
                <p className="text-sm text-gray-500 mt-2">Firma</p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Observaciones:</strong> El vendedor es responsable de cualquier deuda de patente o multa que le aparezca al vehículo desde el día de la fecha hacia atrás.
            </p>
          </div>

          {/* Pie de página */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Se firman dos ejemplares del mismo tenor.</p>
            <p>Documento generado el {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 