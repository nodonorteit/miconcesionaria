import { NextResponse } from 'next/server'

export interface PrismaError {
  code: string
  meta?: {
    target?: string[]
    [key: string]: any
  }
  message?: string
}

export interface ErrorResponse {
  error: string
  details?: string
  field?: string
}

/**
 * Maneja errores de Prisma y devuelve respuestas personalizadas para el usuario
 */
export function handlePrismaError(error: any): NextResponse<ErrorResponse> {
  console.error('Prisma Error:', error)

  // Error de constraint único (P2002)
  if (error?.code === 'P2002') {
    const target = error.meta?.target
    let fieldName = 'campo'
    let userMessage = 'El valor ya existe en la base de datos. Por favor, usa un valor diferente.'
    
    if (target && Array.isArray(target) && target.length > 0) {
      const field = target[0]
      
      // Mapeo de campos específicos
      const fieldMappings: Record<string, { name: string; message: string }> = {
        'Vehicle_vin_key': {
          name: 'VIN',
          message: 'El VIN ya existe en la base de datos. Por favor, verifica el número de VIN e intenta nuevamente.'
        },
        'Vehicle_licensePlate_key': {
          name: 'Patente',
          message: 'La patente ya existe en la base de datos. Por favor, verifica el número de patente e intenta nuevamente.'
        },
        'Client_email_key': {
          name: 'Email',
          message: 'El email ya está registrado. Por favor, usa un email diferente.'
        },
        'Client_documentNumber_key': {
          name: 'Documento',
          message: 'El número de documento ya está registrado. Por favor, verifica el documento e intenta nuevamente.'
        },
        'commissionists_email_key': {
          name: 'Email',
          message: 'El email del comisionista ya está registrado. Por favor, usa un email diferente.'
        },
        'User_email_key': {
          name: 'Email',
          message: 'El email ya está registrado. Por favor, usa un email diferente.'
        },
        'providers_taxId_key': {
          name: 'CUIT',
          message: 'El CUIT ya está registrado. Por favor, verifica el CUIT e intenta nuevamente.'
        }
      }
      
      const mapping = fieldMappings[field]
      if (mapping) {
        fieldName = mapping.name
        userMessage = mapping.message
      } else {
        // Fallback para campos no mapeados
        fieldName = field.replace(/^(Vehicle_|Client_|commissionists_|User_|providers_)/, '').replace(/_key$/, '')
        userMessage = `El ${fieldName} ya existe en la base de datos. Por favor, usa un valor diferente.`
      }
    }
    
    return NextResponse.json(
      { 
        error: userMessage,
        details: `Error de duplicado en: ${fieldName}`,
        field: fieldName
      }, 
      { status: 400 }
    )
  }
  
  // Error de registro no encontrado (P2025)
  if (error?.code === 'P2025') {
    return NextResponse.json(
      { 
        error: 'El registro que intentas modificar no existe o ya fue eliminado.',
        details: 'Registro no encontrado'
      }, 
      { status: 404 }
    )
  }
  
  // Error de foreign key constraint (P2003)
  if (error?.code === 'P2003') {
    return NextResponse.json(
      { 
        error: 'No se puede realizar esta operación porque hay datos relacionados que dependen de este registro.',
        details: 'Error de integridad referencial'
      }, 
      { status: 400 }
    )
  }
  
  // Otros errores de Prisma
  if (error?.code?.startsWith('P')) {
    return NextResponse.json(
      { 
        error: 'Error en la base de datos. Por favor, verifica los datos e intenta nuevamente.',
        details: error.message || 'Error de Prisma desconocido'
      }, 
      { status: 400 }
    )
  }
  
  // Error genérico
  return NextResponse.json(
    { 
      error: 'Error interno del servidor. Por favor, intenta nuevamente.',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, 
    { status: 500 }
  )
}

/**
 * Maneja errores de validación
 */
export function handleValidationError(message: string, field?: string): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { 
      error: message,
      field: field
    }, 
    { status: 400 }
  )
}

/**
 * Maneja errores de autenticación
 */
export function handleAuthError(message: string = 'No autorizado'): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { 
      error: message
    }, 
    { status: 401 }
  )
}

/**
 * Maneja errores de permisos
 */
export function handlePermissionError(message: string = 'No tienes permisos para realizar esta acción'): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { 
      error: message
    }, 
    { status: 403 }
  )
}
