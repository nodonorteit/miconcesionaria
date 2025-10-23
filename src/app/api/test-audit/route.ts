import { NextRequest, NextResponse } from 'next/server'
import { AuditLogger } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST] Probando sistema de auditoría...')
    
    // Crear un log de prueba
    await AuditLogger.log({
      action: 'TEST',
      entity: 'SYSTEM',
      entityId: 'test-' + Date.now(),
      description: 'Prueba del sistema de auditoría desde endpoint de test',
      oldData: { test: 'valor anterior' },
      newData: { test: 'valor nuevo' },
      userId: 'test-user',
      userEmail: 'test@example.com',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    })
    
    console.log('✅ [TEST] Log de prueba creado exitosamente')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Log de prueba creado exitosamente',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ [TEST] Error en prueba de auditoría:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en prueba de auditoría',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
