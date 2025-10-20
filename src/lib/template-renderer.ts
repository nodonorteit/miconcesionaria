import { DocumentTemplate } from '@/types/document-template'

interface SaleData {
  id?: string
  saleNumber?: string
  saleDate?: string
  totalAmount?: number
  commission?: number
  notes?: string
  paymentMethod?: string
  deliveryDate?: string
  vehicle?: {
    id?: string
    brand?: string
    model?: string
    year?: number
    color?: string
    mileage?: number
    vin?: string
    licensePlate?: string
    vehicleType?: {
      name?: string
    }
  }
  customer?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    documentNumber?: string
    city?: string
    state?: string
    address?: string
  }
  seller?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    documentNumber?: string
    city?: string
    state?: string
    address?: string
  } | null
}

interface CompanyConfig {
  name: string
  logoUrl: string
  description: string
  address?: string
  city?: string
  state?: string
  cuit?: string
}

export function renderTemplate(
  template: DocumentTemplate, 
  saleData: SaleData, 
  companyConfig: CompanyConfig,
  documentNumber: string
): string {
  console.log('🔍 [TEMPLATE] documentNumber recibido:', documentNumber)
  let html = template.content

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Reemplazar variables del template
  const replacements: Record<string, string> = {
    // Company
    '{{company.name}}': companyConfig.name || 'Empresa',
    '{{company.logoUrl}}': companyConfig.logoUrl || '',
    '{{company.address}}': companyConfig.address || 'Sin dirección',
    '{{company.city}}': companyConfig.city || '',
    '{{company.state}}': companyConfig.state || '',
    '{{company.cuit}}': companyConfig.cuit || 'Sin CUIT',
    
    // Customer
    '{{customer.firstName}}': saleData.customer?.firstName || '',
    '{{customer.lastName}}': saleData.customer?.lastName || '',
    '{{customer.address}}': saleData.customer?.address || 'Sin dirección',
    '{{customer.city}}': saleData.customer?.city || '',
    '{{customer.state}}': saleData.customer?.state || '',
    '{{customer.documentNumber}}': saleData.customer?.documentNumber || '---',
    
    // Vehicle
    '{{vehicle.brand}}': saleData.vehicle?.brand || '',
    '{{vehicle.model}}': saleData.vehicle?.model || '',
    '{{vehicle.year}}': saleData.vehicle?.year?.toString() || '0',
    '{{vehicle.color}}': saleData.vehicle?.color || '',
    '{{vehicle.vin}}': saleData.vehicle?.vin || '---',
    '{{vehicle.licensePlate}}': saleData.vehicle?.licensePlate || '---',
    '{{vehicle.type}}': saleData.vehicle?.vehicleType?.name || '',
    '{{vehicle.mileage}}': saleData.vehicle?.mileage?.toLocaleString() || '0',
    '{{vehicle.engineNumber}}': saleData.vehicle?.vin || '---', // Usar VIN como número de motor si no hay campo específico
    
    // Sale
    '{{sale.totalAmount}}': formatCurrency(saleData.totalAmount || 0),
    '{{sale.paymentMethod}}': saleData.paymentMethod || 'CONTADO',
    '{{sale.deliveryDate}}': saleData.deliveryDate ? formatDate(saleData.deliveryDate) : '---',
    '{{sale.notes}}': saleData.notes || 'Sin observaciones',
    '{{sale.date}}': formatDate(saleData.saleDate || new Date().toISOString()),
    
    // Document
    '{{document.number}}': documentNumber,
    '{{document.generatedAt}}': formatDate(new Date().toISOString()),
    
    // Funciones de formato
    '{{formatCurrency sale.totalAmount}}': formatCurrency(saleData.totalAmount || 0),
    '{{formatDate sale.date}}': formatDate(saleData.saleDate || new Date().toISOString()),
    '{{formatDate sale.deliveryDate}}': saleData.deliveryDate ? formatDate(saleData.deliveryDate) : '---',
    '{{formatDate document.generatedAt}}': formatDate(new Date().toISOString())
  }

  // Aplicar reemplazos
  Object.entries(replacements).forEach(([placeholder, value]) => {
    html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
  })

  // Manejar condicionales simples
  if (companyConfig.logoUrl) {
    html = html.replace(/{{#if company.logoUrl}}([\s\S]*?){{\/if}}/g, '$1')
  } else {
    html = html.replace(/{{#if company.logoUrl}}[\s\S]*?{{\/if}}/g, '')
  }

  return html
} 