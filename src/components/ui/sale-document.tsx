'use client'

import React, { useState } from 'react'
import { Button } from './button'
import { Card } from './card'
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckCircle,
  Car,
  User,
  DollarSign,
  Calendar,
  MapPin
} from 'lucide-react'

interface SaleDocumentProps {
  sale: {
    id: string
    saleNumber: string
    saleDate: string
    totalAmount: number
    commission: number
    notes?: string
    vehicle: {
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
      firstName: string
      lastName: string
      email?: string
      phone?: string
      documentNumber?: string
      city?: string
      state?: string
    }
    seller: {
      firstName: string
      lastName: string
      email?: string
      phone?: string
      commissionRate: number
    }
  }
  isOpen: boolean
  onClose: () => void
  onGenerateDocument: (saleId: string) => Promise<void>
}

export function SaleDocument({ sale, isOpen, onClose, onGenerateDocument }: SaleDocumentProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [documentGenerated, setDocumentGenerated] = useState(false)

  if (!isOpen) return null

  const handleGenerateDocument = async () => {
    setIsGenerating(true)
    try {
      await onGenerateDocument(sale.id)
      setDocumentGenerated(true)
    } catch (error) {
      console.error('Error generating document:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Aquí implementaremos la descarga del PDF
    console.log('Downloading document...')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Boleto de Compra-Venta</h2>
              <p className="text-gray-600">Venta #{sale.saleNumber}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del Vehículo */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Car className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Información del Vehículo</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Marca</label>
                <p className="text-gray-900">{sale.vehicle.brand}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Modelo</label>
                <p className="text-gray-900">{sale.vehicle.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Año</label>
                <p className="text-gray-900">{sale.vehicle.year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Color</label>
                <p className="text-gray-900">{sale.vehicle.color}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Kilometraje</label>
                <p className="text-gray-900">{sale.vehicle.mileage.toLocaleString()} km</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tipo</label>
                <p className="text-gray-900">{sale.vehicle.vehicleType.name}</p>
              </div>
              {sale.vehicle.vin && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">VIN</label>
                  <p className="text-gray-900 font-mono">{sale.vehicle.vin}</p>
                </div>
              )}
              {sale.vehicle.licensePlate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Patente</label>
                  <p className="text-gray-900 font-mono">{sale.vehicle.licensePlate}</p>
              </div>
              )}
            </div>
          </Card>

          {/* Información del Cliente */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Información del Cliente</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900">{sale.customer.firstName} {sale.customer.lastName}</p>
              </div>
              {sale.customer.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{sale.customer.email}</p>
                </div>
              )}
              {sale.customer.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-gray-900">{sale.customer.phone}</p>
                </div>
              )}
              {sale.customer.documentNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Documento</label>
                  <p className="text-gray-900">{sale.customer.documentNumber}</p>
                </div>
              )}
              {sale.customer.city && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Ciudad</label>
                  <p className="text-gray-900">{sale.customer.city}</p>
                </div>
              )}
              {sale.customer.state && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Provincia</label>
                  <p className="text-gray-900">{sale.customer.state}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Información del Vendedor */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Información del Vendedor</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900">{sale.seller.firstName} {sale.seller.lastName}</p>
              </div>
              {sale.seller.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{sale.seller.email}</p>
                </div>
              )}
              {sale.seller.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-gray-900">{sale.seller.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Comisión</label>
                <p className="text-gray-900">{sale.seller.commissionRate}%</p>
              </div>
            </div>
          </Card>

          {/* Información de la Venta */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Información de la Venta</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Venta</label>
                <p className="text-gray-900">{new Date(sale.saleDate).toLocaleDateString('es-AR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Monto Total</label>
                <p className="text-gray-900 font-semibold">${sale.totalAmount.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Comisión</label>
                <p className="text-gray-900">${sale.commission.toLocaleString('es-AR')}</p>
              </div>
            </div>
            {sale.notes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Notas</label>
                <p className="text-gray-900">{sale.notes}</p>
              </div>
            )}
          </Card>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {!documentGenerated ? (
              <Button
                onClick={handleGenerateDocument}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Boleto
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Boleto generado</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 