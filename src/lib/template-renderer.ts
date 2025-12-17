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
  description?: string
  address?: string
  city?: string
  state?: string
  cuit?: string
  phone?: string
  email?: string
  postalCode?: string
  ivaCondition?: string
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

  // Función para determinar tipo de documento (DNI o CUIT) y formatearlo
  const getDocumentInfo = (documentNumber?: string): { type: string, label: string, formatted: string } => {
    if (!documentNumber || documentNumber === '---') {
      return { type: '', label: 'Documento', formatted: '---' }
    }
    
    // Remover guiones, puntos y espacios para contar solo dígitos
    const digitsOnly = documentNumber.replace(/[^0-9]/g, '')
    const digitCount = digitsOnly.length
    
    if (digitCount <= 8) {
      // DNI: hasta 8 dígitos
      return { 
        type: 'DNI', 
        label: 'DNI', 
        formatted: documentNumber 
      }
    } else {
      // CUIT: más de 8 dígitos
      // Formatear CUIT con guiones si no los tiene (formato: XX-XXXXXXXX-X)
      let formatted = documentNumber
      if (!documentNumber.includes('-') && digitsOnly.length === 11) {
        // Si tiene 11 dígitos sin guiones, formatear
        formatted = `${digitsOnly.substring(0, 2)}-${digitsOnly.substring(2, 10)}-${digitsOnly.substring(10)}`
      }
      return { 
        type: 'CUIT', 
        label: 'CUIT', 
        formatted: formatted 
      }
    }
  }

  // Preparar valores para reemplazo
  const values: Record<string, string> = {
    // Company
    'company.name': companyConfig.name || 'Empresa',
    'company.logoUrl': companyConfig.logoUrl || '',
    'company.address': companyConfig.address || 'Sin dirección',
    'company.city': companyConfig.city || '',
    'company.state': companyConfig.state || '',
    'company.cuit': companyConfig.cuit || 'Sin CUIT',
    'company.phone': companyConfig.phone || '',
    'company.email': companyConfig.email || '',
    'company.postalCode': companyConfig.postalCode || '',
    'company.ivaCondition': companyConfig.ivaCondition || '',
    
    // Customer
    'customer.firstName': saleData.customer?.firstName || '',
    'customer.lastName': saleData.customer?.lastName || '',
    'customer.address': saleData.customer?.address || 'Sin dirección',
    'customer.city': saleData.customer?.city || '',
    'customer.state': saleData.customer?.state || '',
    'customer.documentNumber': saleData.customer?.documentNumber || '---',
    
    // Vehicle
    'vehicle.brand': saleData.vehicle?.brand || '',
    'vehicle.model': saleData.vehicle?.model || '',
    'vehicle.year': saleData.vehicle?.year?.toString() || '0',
    'vehicle.vin': saleData.vehicle?.vin || '---',
    'vehicle.licensePlate': saleData.vehicle?.licensePlate || '---',
    'vehicle.type': saleData.vehicle?.vehicleType?.name || '',
    'vehicle.mileage': saleData.vehicle?.mileage?.toLocaleString() || '0',
    
    // Sale
    'sale.totalAmount': (saleData.totalAmount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    'sale.totalAmountFormatted': formatCurrency(saleData.totalAmount || 0),
    'sale.paymentMethod': saleData.paymentMethod || 'CONTADO',
    'sale.deliveryDate': saleData.deliveryDate ? formatDate(saleData.deliveryDate) : '---',
    'sale.notes': saleData.notes || 'Sin observaciones',
    'sale.date': formatDate(saleData.saleDate || new Date().toISOString()),
    
    // Document
    'document.number': documentNumber,
    'document.generatedAt': formatDate(new Date().toISOString())
  }

  // Agregar información de documento del cliente (DNI/CUIT)
  const customerDocInfo = getDocumentInfo(saleData.customer?.documentNumber)
  values['customer.documentType'] = customerDocInfo.type
  values['customer.documentLabel'] = customerDocInfo.label
  values['customer.documentFormatted'] = customerDocInfo.formatted

  // Extraer solo el número del documentNumber (remover prefijos como "SALE-" o "COMP-")
  let documentNumberOnly = documentNumber || ''
  
  // Primero remover prefijos comunes (SALE-, COMP-, DOC-, etc.) al inicio
  documentNumberOnly = documentNumberOnly.replace(/^(SALE|COMP|DOC)-?/i, '')
  
  // Si aún tiene guiones, extraer solo la parte numérica después del último guión
  if (documentNumberOnly.includes('-')) {
    const parts = documentNumberOnly.split('-')
    // Buscar la parte que sea solo números (normalmente la última)
    const numericPart = parts.find(part => /^\d+$/.test(part))
    if (numericPart) {
      documentNumberOnly = numericPart
    } else {
      // Si no hay parte numérica pura, tomar la última parte
      documentNumberOnly = parts[parts.length - 1]
    }
  }
  
  // Remover cualquier carácter no numérico al inicio (por si acaso)
  documentNumberOnly = documentNumberOnly.replace(/^[^0-9]+/, '')
  
  // Remover ceros a la izquierda para mostrar un número más limpio
  documentNumberOnly = documentNumberOnly.replace(/^0+/, '') || '0'
  
  console.log('🔍 [TEMPLATE] documentNumber original:', documentNumber, '→ extraído:', documentNumberOnly)
  values['document.number'] = documentNumberOnly

  // Aplicar reemplazos - soportar tanto {variable} como {{variable}}
  Object.entries(values).forEach(([key, value]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Reemplazar {variable} permitiendo espacios
    const singleBrace = new RegExp(`\\{\\s*${escapedKey}\\s*\\}`, 'g')
    html = html.replace(singleBrace, value)
    
    // Reemplazar {{variable}} permitiendo espacios
    const doubleBrace = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g')
    html = html.replace(doubleBrace, value)
  })
  
  // Funciones de formato especiales
  const formattedTotalAmount = formatCurrency(saleData.totalAmount || 0)
  html = html.replace(/\{\{formatCurrency\s+sale\.totalAmount\}\}/g, formattedTotalAmount)
  html = html.replace(/\{formatCurrency\s+sale\.totalAmount\}/g, formattedTotalAmount)
  // Asegurar reemplazo explícito de los montos formateados
  html = html.replace(/\{\{\s*sale\.totalAmountFormatted\s*\}\}/g, formattedTotalAmount)
  html = html.replace(/\{\s*sale\.totalAmountFormatted\s*\}/g, formattedTotalAmount)
  // Si el template usa sale.totalAmount directamente, formatearlo también
  html = html.replace(/\{\{\s*sale\.totalAmount\s*\}\}/g, formattedTotalAmount)
  html = html.replace(/\{\s*sale\.totalAmount\s*\}/g, formattedTotalAmount)
  // Reemplazo de seguridad si quedara la palabra sin llaves
  html = html.replace(/sale\.totalAmountFormatted/g, formattedTotalAmount)
  html = html.replace(/sale\.totalAmount/g, formattedTotalAmount)
  // Si quedaron llaves rodeando el valor ya formateado, limpiarlas: { $ 40.000 } -> $ 40.000
  html = html.replace(/\{\s*(\$?\s*[0-9][0-9\.\,\s]+)\s*\}/g, '$1')
  // Remover cualquier signo de pesos duplicado que pueda haber en el template
  // Si el template tiene ${{sale.totalAmountFormatted}}, remover el $ manual
  html = html.replace(/\$\{\{sale\.totalAmountFormatted\}\}/g, '{{sale.totalAmountFormatted}}')
  html = html.replace(/\$\{sale\.totalAmountFormatted\}/g, '{sale.totalAmountFormatted}')
  html = html.replace(/\$\{\{sale\.totalAmount\}\}/g, '{{sale.totalAmountFormatted}}')
  html = html.replace(/\$\{sale\.totalAmount\}/g, '{sale.totalAmountFormatted}')
  html = html.replace(/\{\{formatDate\s+sale\.date\}\}/g, formatDate(saleData.saleDate || new Date().toISOString()))
  html = html.replace(/\{formatDate\s+sale\.date\}/g, formatDate(saleData.saleDate || new Date().toISOString()))
  html = html.replace(/\{\{formatDate\s+sale\.deliveryDate\}\}/g, saleData.deliveryDate ? formatDate(saleData.deliveryDate) : '---')
  html = html.replace(/\{formatDate\s+sale\.deliveryDate\}/g, saleData.deliveryDate ? formatDate(saleData.deliveryDate) : '---')
  html = html.replace(/\{\{formatDate\s+document\.generatedAt\}\}/g, formatDate(new Date().toISOString()))
  html = html.replace(/\{formatDate\s+document\.generatedAt\}/g, formatDate(new Date().toISOString()))

  // Manejar condicionales simples
  if (companyConfig.logoUrl) {
    html = html.replace(/{{#if company.logoUrl}}([\s\S]*?){{\/if}}/g, '$1')
  } else {
    html = html.replace(/{{#if company.logoUrl}}[\s\S]*?{{\/if}}/g, '')
  }

  return html
} 