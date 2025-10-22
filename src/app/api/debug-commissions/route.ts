import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Debug simple para comisiones
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar vendedores activos
    const activeSellers = await prisma.commissionist.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true }
    })

    // 2. Verificar transacciones completadas
    const completedSales = await prisma.transaction.findMany({
      where: { 
        type: 'SALE', 
        status: 'COMPLETED',
        commission: { gt: 0 }
      },
      select: { 
        id: true, 
        commissionistId: true, 
        commission: true 
      }
    })

    // 3. Verificar si hay coincidencias
    const matches = activeSellers.filter(seller => 
      completedSales.some(sale => sale.commissionistId === seller.id)
    )

    return NextResponse.json({
      activeSellersCount: activeSellers.length,
      completedSalesCount: completedSales.length,
      matchesCount: matches.length,
      activeSellers: activeSellers.slice(0, 3),
      completedSales: completedSales.slice(0, 3),
      matches: matches
    })
  } catch (error) {
    console.error('Error in debug:', error)
    return NextResponse.json(
      { error: 'Error in debug', details: error },
      { status: 500 }
    )
  }
}
