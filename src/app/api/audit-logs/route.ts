import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener logs de auditoría
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const entity = searchParams.get('entity')
    const action = searchParams.get('action')
    const entityId = searchParams.get('entityId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Construir filtros
    const whereClause: any = {}
    
    if (entity) {
      whereClause.entity = entity
    }
    
    if (action) {
      whereClause.action = action
    }
    
    if (entityId) {
      whereClause.entityId = entityId
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    const [logs, totalCount] = await Promise.all([
      prisma.systemLog.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.systemLog.count({
        where: whereClause
      })
    ])

    // Parsear los datos JSON almacenados
    const parsedLogs = logs.map(log => ({
      ...log,
      oldData: log.oldData ? JSON.parse(log.oldData as string) : null,
      newData: log.newData ? JSON.parse(log.newData as string) : null
    }))

    return NextResponse.json({
      logs: parsedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Error al obtener logs de auditoría' },
      { status: 500 }
    )
  }
}

// GET - Obtener estadísticas de logs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate } = body

    const whereClause: any = {}
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    // Estadísticas por entidad
    const entityStats = await prisma.systemLog.groupBy({
      by: ['entity'],
      where: whereClause,
      _count: {
        entity: true
      }
    })

    // Estadísticas por acción
    const actionStats = await prisma.systemLog.groupBy({
      by: ['action'],
      where: whereClause,
      _count: {
        action: true
      }
    })

    // Estadísticas por usuario
    const userStats = await prisma.systemLog.groupBy({
      by: ['userEmail'],
      where: {
        ...whereClause,
        userEmail: {
          not: null
        }
      },
      _count: {
        userEmail: true
      }
    })

    // Actividad por día (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyActivity = await prisma.systemLog.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      entityStats,
      actionStats,
      userStats,
      dailyActivity
    })
  } catch (error) {
    console.error('Error fetching audit statistics:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de auditoría' },
      { status: 500 }
    )
  }
}
