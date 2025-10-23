import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Verificando logs en base de datos...')
    
    // Obtener todos los logs sin filtros
    const allLogs = await prisma.systemLog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    // Contar total de logs
    const totalLogs = await prisma.systemLog.count()
    
    // Obtener logs por entidad
    const logsByEntity = await prisma.systemLog.groupBy({
      by: ['entity'],
      _count: {
        entity: true
      },
      orderBy: {
        _count: {
          entity: 'desc'
        }
      }
    })
    
    // Obtener logs por acción
    const logsByAction = await prisma.systemLog.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    })
    
    console.log('📊 [DEBUG] Estadísticas de logs:', {
      totalLogs,
      logsByEntity,
      logsByAction,
      recentLogs: allLogs.length
    })
    
    return NextResponse.json({
      success: true,
      totalLogs,
      recentLogs: allLogs,
      logsByEntity,
      logsByAction,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ [DEBUG] Error verificando logs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error verificando logs',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
