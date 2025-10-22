import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener reporte de comisiones de vendedores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construir condiciones de fecha para Prisma
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate + 'T23:59:59')
    }

    // Obtener todos los vendedores activos
    const sellers = await prisma.commissionist.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        commissionRate: true
      }
    })

    // Para cada vendedor, calcular comisiones usando Prisma
    const sellersWithCommissions = await Promise.all(
      sellers.map(async (seller) => {
        // Construir filtro de fecha para transacciones
        const transactionFilter: any = {
          commissionistId: seller.id,
          type: 'SALE',
          status: 'COMPLETED'
        }
        
        if (Object.keys(dateFilter).length > 0) {
          transactionFilter.createdAt = dateFilter
        }

        // Obtener transacciones del vendedor
        const transactions = await prisma.transaction.findMany({
          where: transactionFilter,
          select: {
            id: true,
            commission: true,
            totalAmount: true,
            createdAt: true
          }
        })

        // Calcular totales
        const totalSales = transactions.length
        const totalCommission = transactions.reduce((sum, t) => sum + Number(t.commission), 0)

        // Obtener comisiones mensuales usando raw query
        const monthlyQuery = `
          SELECT 
            DATE_FORMAT(createdAt, '%Y-%m') as month,
            DATE_FORMAT(createdAt, '%M %Y') as monthName,
            COUNT(*) as sales,
            SUM(commission) as commission
          FROM transactions 
          WHERE commissionistId = ? AND type = 'SALE' AND status = 'COMPLETED'
          ${Object.keys(dateFilter).length > 0 ? 
            (dateFilter.gte ? 'AND createdAt >= ?' : '') + 
            (dateFilter.lte ? ' AND createdAt <= ?' : '') : ''}
          GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), DATE_FORMAT(createdAt, '%M %Y')
          ORDER BY month DESC
          LIMIT 12
        `

        const monthlyParams = [seller.id]
        if (dateFilter.gte) monthlyParams.push(dateFilter.gte)
        if (dateFilter.lte) monthlyParams.push(dateFilter.lte)

        const monthlyCommissions = await prisma.$queryRawUnsafe(monthlyQuery, ...monthlyParams)

        // Formatear datos mensuales
        const formattedMonthly = (monthlyCommissions as any[]).map(month => ({
          month: month.monthName,
          sales: Number(month.sales),
          commission: Number(month.commission)
        }))

        return {
          ...seller,
          totalSales,
          totalCommission,
          monthlyCommissions: formattedMonthly
        }
      })
    )

    // Ordenar por comisión total descendente
    sellersWithCommissions.sort((a, b) => b.totalCommission - a.totalCommission)

    return NextResponse.json(sellersWithCommissions)
  } catch (error) {
    console.error('Error fetching commissions report:', error)
    return NextResponse.json(
      { error: 'Error fetching commissions report' },
      { status: 500 }
    )
  }
} 