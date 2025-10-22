import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Debug temporal para verificar datos
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar vendedores desde commissionist
    const commissionists = await prisma.commissionist.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true }
    })

    // 2. Verificar transacciones completadas
    const transactions = await prisma.transaction.findMany({
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

    // 3. Verificar coincidencias
    const matches = commissionists.filter(seller => 
      transactions.some(t => t.commissionistId === seller.id)
    )

    return NextResponse.json({
      commissionists: commissionists.slice(0, 5),
      transactions: transactions.slice(0, 5),
      matches: matches,
      summary: {
        totalCommissionists: commissionists.length,
        totalTransactions: transactions.length,
        totalMatches: matches.length
      }
    })
  } catch (error) {
    console.error('Error in debug:', error)
    return NextResponse.json(
      { error: 'Error in debug', details: error },
      { status: 500 }
    )
  }
}
