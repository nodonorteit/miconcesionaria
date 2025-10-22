import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const entity = searchParams.get('entity')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (entity) {
      where.entity = entity
    }
    
    if (action) {
      where.action = action
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Obtener logs con paginación
    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.systemLog.count({ where })
    ])

    // Obtener estadísticas
    const stats = await prisma.systemLog.groupBy({
      by: ['action'],
      _count: {
        action: true
      },
      where: where
    })

    const entityStats = await prisma.systemLog.groupBy({
      by: ['entity'],
      _count: {
        entity: true
      },
      where: where
    })

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        byAction: stats,
        byEntity: entityStats
      }
    })

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para obtener estadísticas de auditoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, entity, action } = body

    const where: any = {}
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }
    
    if (entity) {
      where.entity = entity
    }
    
    if (action) {
      where.action = action
    }

    // Estadísticas generales
    const totalLogs = await prisma.systemLog.count({ where })
    
    // Logs por día (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const dailyStats = await prisma.systemLog.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        ...where,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Top usuarios más activos
    const topUsers = await prisma.systemLog.groupBy({
      by: ['userId', 'userEmail'],
      _count: {
        id: true
      },
      where: {
        ...where,
        userId: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Top entidades más modificadas
    const topEntities = await prisma.systemLog.groupBy({
      by: ['entity'],
      _count: {
        id: true
      },
      where,
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    return NextResponse.json({
      totalLogs,
      dailyStats,
      topUsers,
      topEntities
    })

  } catch (error) {
    console.error('Error fetching audit statistics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// IMPORTANTE: No implementamos DELETE para prevenir eliminación de logs de auditoría
// Los logs de auditoría son inmutables y solo pueden ser eliminados directamente desde la base de datos
export async function DELETE() {
  return NextResponse.json(
    { 
      error: 'Los logs de auditoría no pueden ser eliminados desde la aplicación',
      message: 'Los registros de auditoría son inmutables por seguridad'
    },
    { status: 403 }
  )
}