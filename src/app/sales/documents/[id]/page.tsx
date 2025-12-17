'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useCompanyConfig } from '@/hooks/useCompanyConfig'
import { useDocumentTemplate } from '@/hooks/useDocumentTemplate'
import { renderTemplate } from '@/lib/template-renderer'
import './boleto.css'

interface SaleDocument {
  id: string
  documentNumber: string
  transaction: {
    id: string
    transactionNumber: string
    createdAt: string
    totalAmount: number
    commission: number
    notes?: string
    paymentMethod?: string
    deliveryDate?: string
    vehicle: {
      id: string
      brand: string
      model: string
      year: number
      color?: string
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
    commissionist?: {
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
  }
}

export default function SaleDocumentPage() {
  const params = useParams()
  const [document, setDocument] = useState<SaleDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { companyConfig, loading: configLoading } = useCompanyConfig()
  const { template: documentTemplate, loading: templateLoading } = useDocumentTemplate('BOLETO_COMPRA_VENTA')

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

  if (loading || configLoading || templateLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando documento...</p>
        </div>
      </div>
    )
  }

  if (error || !document || !documentTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || !document ? 'Documento no encontrado' : 'Template no encontrado'}
            </p>
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

  // Transformar datos de transacción al formato esperado por el template
  const saleData = {
    id: document.transaction.id,
    saleNumber: document.transaction.transactionNumber,
    saleDate: document.transaction.createdAt,
    totalAmount: Number(document.transaction.totalAmount),
    commission: Number(document.transaction.commission),
    notes: document.transaction.notes,
    paymentMethod: document.transaction.paymentMethod,
    deliveryDate: document.transaction.deliveryDate,
    vehicle: document.transaction.vehicle ? {
      id: document.transaction.vehicle.id,
      brand: document.transaction.vehicle.brand || '',
      model: document.transaction.vehicle.model || '',
      year: document.transaction.vehicle.year || 0,
      mileage: document.transaction.vehicle.mileage || 0,
      vin: document.transaction.vehicle.vin,
      licensePlate: document.transaction.vehicle.licensePlate,
      vehicleType: {
        name: document.transaction.vehicle.vehicleType?.name || 'No especificado'
      }
    } : {
      id: '',
      brand: '',
      model: '',
      year: 0,
      mileage: 0,
      vin: '',
      licensePlate: '',
      vehicleType: {
        name: 'No especificado'
      }
    },
    customer: document.transaction.customer ? {
      id: document.transaction.customer.id,
      firstName: document.transaction.customer.firstName || '',
      lastName: document.transaction.customer.lastName || '',
      email: document.transaction.customer.email,
      phone: document.transaction.customer.phone,
      documentNumber: document.transaction.customer.documentNumber,
      city: document.transaction.customer.city,
      state: document.transaction.customer.state,
      address: document.transaction.customer.address
    } : {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      documentNumber: '',
      city: '',
      state: '',
      address: ''
    },
    seller: document.transaction.commissionist && document.transaction.commissionist.firstName ? {
      id: document.transaction.commissionist.id,
      firstName: document.transaction.commissionist.firstName,
      lastName: document.transaction.commissionist.lastName,
      email: document.transaction.commissionist.email,
      phone: document.transaction.commissionist.phone,
      documentNumber: document.transaction.commissionist.documentNumber,
      city: document.transaction.commissionist.city,
      state: document.transaction.commissionist.state,
      address: document.transaction.commissionist.address
    } : null
  }

  // Renderizar el template con los datos de la venta
  const renderedHtml = renderTemplate(
    documentTemplate,
    saleData,
    companyConfig,
    document.documentNumber
  )

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

      {/* Documento renderizado desde template */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
        <div 
          className="p-8 print:p-4"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  )
} 