import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Debug endpoint temporal para comisiones
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar vendedores activos
    const activeSellers = await prisma.commissionist.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, commissionRate: true }
    })

    // 2. Verificar transacciones completadas con comisiones
    const completedSales = await prisma.transaction.findMany({
      where: { 
        type: 'SALE', 
        status: 'COMPLETED',
        commission: { gt: 0 }
      },
      select: { 
        id: true, 
        commissionistId: true, 
        commission: true, 
        totalAmount: true,
        createdAt: true
      }
    })

    // 3. Query simple para verificar JOIN
    const simpleQuery = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.firstName,
        c.lastName,
        c.commissionRate,
        t.commissionistId,
        t.commission
      FROM commissionists c
      LEFT JOIN transactions t ON c.id = t.commissionistId
      WHERE c.isActive = 1 AND t.type = 'SALE' AND t.status = 'COMPLETED'
      LIMIT 10
    `

    return NextResponse.json({
      activeSellers,
      completedSales,
      simpleQuery,
      message: 'Debug data retrieved'
    })
  } catch (error) {
    console.error('Error in debug:', error)
    return NextResponse.json(
      { error: 'Error in debug', details: error },
      { status: 500 }
    )
  }
}
