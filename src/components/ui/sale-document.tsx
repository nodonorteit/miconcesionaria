'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCompanyConfig } from '@/hooks/useCompanyConfig'
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
import jsPDF from 'jspdf'

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
  const { companyConfig } = useCompanyConfig()

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

  const handleDownload = async () => {
    try {
      // Primero intentar obtener el template personalizado
      const templateResponse = await fetch(`/api/admin/document-templates/default?type=BOLETO_COMPRA_VENTA`)
      
      if (templateResponse.ok) {
        const template = await templateResponse.json()
        
        // Renderizar el template con los datos de la venta
        let htmlContent = template.content
        
        // Determinar si la concesionaria es compradora o vendedora
        // Si la concesionaria es el vendedor, entonces el cliente es el comprador
        // Si la concesionaria NO es el vendedor, entonces la concesionaria es el comprador
        const isConcesionariaVendedora = sale.seller.firstName.toLowerCase().includes('concesionaria') || 
                                        sale.seller.firstName.toLowerCase().includes('empresa') ||
                                        sale.seller.firstName.toLowerCase().includes('s.a.') ||
                                        sale.seller.firstName.toLowerCase().includes('s.r.l.') ||
                                        sale.seller.firstName.toLowerCase().includes('sociedad') ||
                                        sale.seller.lastName.toLowerCase().includes('concesionaria') ||
                                        sale.seller.lastName.toLowerCase().includes('empresa') ||
                                        sale.seller.lastName.toLowerCase().includes('s.a.') ||
                                        sale.seller.lastName.toLowerCase().includes('s.r.l.') ||
                                        sale.seller.lastName.toLowerCase().includes('sociedad')

        // Variables base que siempre están disponibles
        const baseVariables = {
          '{{companyName}}': companyConfig?.name || 'Mi Concesionaria',
          '{{companyAddress}}': 'Dirección de la empresa',
          '{{companyCity}}': 'Ciudad',
          '{{companyState}}': 'Provincia',
          '{{companyCuit}}': 'CUIT de la empresa',
          '{{companyLogoUrl}}': companyConfig?.logoUrl || '',
          '{{documentNumber}}': sale.saleNumber,
          '{{documentGeneratedAt}}': new Date().toLocaleDateString('es-AR'),
          '{{saleDate}}': new Date(sale.saleDate).toLocaleDateString('es-AR'),
          '{{vehicleBrand}}': sale.vehicle.brand,
          '{{vehicleModel}}': sale.vehicle.model,
          '{{vehicleYear}}': sale.vehicle.year,
          '{{vehicleColor}}': sale.vehicle.color || 'No especificado',
          '{{vehicleMileage}}': sale.vehicle.mileage.toLocaleString(),
          '{{vehicleType}}': sale.vehicle.vehicleType.name,
          '{{vehicleVin}}': sale.vehicle.vin || 'No especificado',
          '{{vehicleLicensePlate}}': sale.vehicle.licensePlate || 'No especificado',
          '{{customerFirstName}}': sale.customer.firstName,
          '{{customerLastName}}': sale.customer.lastName,
          '{{customerFullName}}': `${sale.customer.firstName} ${sale.customer.lastName}`,
          '{{customerEmail}}': sale.customer.email || 'No especificado',
          '{{customerPhone}}': sale.customer.phone || 'No especificado',
          '{{customerDocumentNumber}}': sale.customer.documentNumber || 'No especificado',
          '{{customerAddress}}': 'No especificado',
          '{{customerCity}}': sale.customer.city || 'No especificado',
          '{{customerState}}': sale.customer.state || 'No especificado',
          '{{sellerFirstName}}': sale.seller.firstName,
          '{{sellerLastName}}': sale.seller.lastName,
          '{{sellerFullName}}': `${sale.seller.firstName} ${sale.seller.lastName}`,
          '{{sellerEmail}}': sale.seller.email || 'No especificado',
          '{{sellerPhone}}': sale.seller.phone || 'No especificado',
          '{{sellerCommission}}': `${sale.seller.commissionRate}%`,
          '{{saleTotalAmount}}': `$${sale.totalAmount.toLocaleString('es-AR')}`,
          '{{saleCommission}}': `$${sale.commission.toLocaleString('es-AR')}`,
          '{{salePaymentMethod}}': 'Contado',
          '{{saleNotes}}': sale.notes || 'Sin notas adicionales',
          '{{currentDate}}': new Date().toLocaleDateString('es-AR'),
          '{{currentTime}}': new Date().toLocaleTimeString('es-AR')
        }

        // Variables dinámicas según el rol de la concesionaria
        const dynamicVariables = isConcesionariaVendedora ? {
          // Concesionaria es VENDEDORA (vende al cliente)
          '{{compradorName}}': sale.customer.firstName + ' ' + sale.customer.lastName,
          '{{compradorDocument}}': sale.customer.documentNumber || 'No especificado',
          '{{compradorAddress}}': 'No especificado',
          '{{compradorCity}}': sale.customer.city || 'No especificado',
          '{{compradorState}}': sale.customer.state || 'No especificado',
          '{{vendedorName}}': companyConfig?.name || 'Mi Concesionaria',
          '{{vendedorDocument}}': 'CUIT: ' + (companyConfig?.cuit || 'CUIT de la empresa'),
          '{{vendedorAddress}}': 'Dirección de la empresa',
          '{{vendedorCity}}': 'Ciudad',
          '{{vendedorState}}': 'Provincia',
          '{{vendedorCuit}}': companyConfig?.cuit || 'CUIT de la empresa',
          '{{rolConcesionaria}}': 'VENDEDORA',
          '{{tipoOperacion}}': 'VENTA',
          '{{direccionOperacion}}': 'de la concesionaria hacia el cliente'
        } : {
          // Concesionaria es COMPRADORA (compra al cliente)
          '{{compradorName}}': companyConfig?.name || 'Mi Concesionaria',
          '{{compradorDocument}}': 'CUIT: ' + (companyConfig?.cuit || 'CUIT de la empresa'),
          '{{compradorAddress}}': 'Dirección de la empresa',
          '{{compradorCity}}': 'Ciudad',
          '{{compradorState}}': 'Provincia',
          '{{compradorCuit}}': companyConfig?.cuit || 'CUIT de la empresa',
          '{{vendedorName}}': sale.customer.firstName + ' ' + sale.customer.lastName,
          '{{vendedorDocument}}': sale.customer.documentNumber || 'No especificado',
          '{{vendedorAddress}}': 'No especificado',
          '{{vendedorCity}}': sale.customer.city || 'No especificado',
          '{{vendedorState}}': sale.customer.state || 'No especificado',
          '{{rolConcesionaria}}': 'COMPRADORA',
          '{{tipoOperacion}}': 'COMPRA',
          '{{direccionOperacion}}': 'del cliente hacia la concesionaria'
        }

        // Combinar todas las variables
        const variables = { ...baseVariables, ...dynamicVariables }
        
        // Aplicar todas las variables
        Object.entries(variables).forEach(([placeholder, value]) => {
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value)
        })
        
        // Crear un elemento temporal para renderizar el HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        tempDiv.style.position = 'absolute'
        tempDiv.style.left = '-9999px'
        tempDiv.style.top = '-9999px'
        tempDiv.style.width = '800px'
        tempDiv.style.padding = '20px'
        tempDiv.style.fontFamily = 'Arial, sans-serif'
        tempDiv.style.fontSize = '12px'
        tempDiv.style.lineHeight = '1.4'
        document.body.appendChild(tempDiv)
        
        // Generar PDF desde el HTML renderizado
        const { jsPDF } = await import('jspdf')
        const html2canvas = (await import('html2canvas')).default
        
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 800,
          height: tempDiv.scrollHeight
        })
        
        // Limpiar elemento temporal
        document.body.removeChild(tempDiv)
        
        // Crear PDF
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgWidth = 210
        const pageHeight = 295
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        
        let position = 0
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }
        
        // Descargar PDF
        const fileName = `boleto-venta-${sale.saleNumber}-${new Date().toISOString().split('T')[0]}.pdf`
        pdf.save(fileName)
        
      } else {
        // Fallback: usar PDF básico si no hay template
        console.log('No se encontró template personalizado, usando PDF básico...')
        generateBasicPDF()
      }
      
    } catch (error) {
      console.error('Error generating PDF with template:', error)
      console.log('Fallback: usando PDF básico...')
      generateBasicPDF()
    }
  }
  
  const generateBasicPDF = () => {
    // Función fallback para generar PDF básico (código anterior)
    try {
      const doc = new jsPDF()
      
      // Configuración del documento
      doc.setFont('helvetica')
      doc.setFontSize(20)
      
      // Título principal
      doc.setFillColor(59, 130, 246) // Azul
      doc.rect(20, 20, 170, 15, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text('BOLETO DE COMPRA-VENTA', 105, 30, { align: 'center' })
      
      // Resetear color del texto
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      
      // Número de venta
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`Venta #${sale.saleNumber}`, 20, 50)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      
      // Fecha
      doc.text(`Fecha: ${new Date(sale.saleDate).toLocaleDateString('es-AR')}`, 20, 65)
      
      // Información del vehículo
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN DEL VEHÍCULO', 20, 85)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      
      doc.text(`Marca: ${sale.vehicle.brand}`, 20, 100)
      doc.text(`Modelo: ${sale.vehicle.model}`, 20, 110)
      doc.text(`Año: ${sale.vehicle.year}`, 20, 120)
      doc.text(`Color: ${sale.vehicle.color}`, 20, 130)
      doc.text(`Kilometraje: ${sale.vehicle.mileage.toLocaleString()} km`, 20, 140)
      doc.text(`Tipo: ${sale.vehicle.vehicleType.name}`, 20, 150)
      
      if (sale.vehicle.vin) {
        doc.text(`VIN: ${sale.vehicle.vin}`, 20, 160)
      }
      if (sale.vehicle.licensePlate) {
        doc.text(`Patente: ${sale.vehicle.licensePlate}`, 20, 170)
      }
      
      // Información del cliente
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN DEL CLIENTE', 20, 190)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      
      doc.text(`Nombre: ${sale.customer.firstName} ${sale.customer.lastName}`, 20, 205)
      if (sale.customer.email) {
        doc.text(`Email: ${sale.customer.email}`, 20, 215)
      }
      if (sale.customer.phone) {
        doc.text(`Teléfono: ${sale.customer.phone}`, 20, 225)
      }
      if (sale.customer.documentNumber) {
        doc.text(`DNI: ${sale.customer.documentNumber}`, 20, 235)
      }
      if (sale.customer.city) {
        doc.text(`Ciudad: ${sale.customer.city}`, 20, 245)
      }
      if (sale.customer.state) {
        doc.text(`Provincia: ${sale.customer.state}`, 20, 255)
      }
      
      // Información del vendedor
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN DEL VENDEDOR', 20, 275)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      
      doc.text(`Nombre: ${sale.customer.firstName} ${sale.customer.lastName}`, 20, 290)
      if (sale.customer.email) {
        doc.text(`Email: ${sale.customer.email}`, 20, 300)
      }
      if (sale.customer.phone) {
        doc.text(`Teléfono: ${sale.customer.phone}`, 20, 310)
      }
      doc.text(`Comisión: ${sale.seller.commissionRate}%`, 20, 320)
      
      // Información de la venta
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DETALLES DE LA VENTA', 20, 340)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      
      doc.text(`Monto Total: $${sale.totalAmount.toLocaleString('es-AR')}`, 20, 355)
      doc.text(`Comisión: $${sale.commission.toLocaleString('es-AR')}`, 20, 365)
      
      if (sale.notes) {
        doc.text(`Notas: ${sale.notes}`, 20, 375)
      }
      
      // Pie de página
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text('Documento generado automáticamente por el sistema', 105, 400, { align: 'center' })
      
      // Descargar el PDF
      const fileName = `boleto-venta-${sale.saleNumber}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
    } catch (error) {
      console.error('Error generating basic PDF:', error)
      alert('Error al generar el PDF. Por favor, inténtalo nuevamente.')
    }
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