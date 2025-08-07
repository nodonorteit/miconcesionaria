import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener reporte de comisiones de vendedores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construir condiciones de fecha
    let dateCondition = ''
    let dateParams: any[] = []

    if (startDate && endDate) {
      dateCondition = 'AND sa.createdAt >= ? AND sa.createdAt <= ?'
      dateParams = [new Date(startDate), new Date(endDate + 'T23:59:59')]
    } else if (startDate) {
      dateCondition = 'AND sa.createdAt >= ?'
      dateParams = [new Date(startDate)]
    } else if (endDate) {
      dateCondition = 'AND sa.createdAt <= ?'
      dateParams = [new Date(endDate + 'T23:59:59')]
    }

    // Obtener todos los vendedores con sus comisiones
    const sellersQuery = `
      SELECT 
        s.id,
        s.firstName,
        s.lastName,
        s.email,
        s.commissionRate,
        COALESCE(COUNT(sa.id), 0) as totalSales,
        COALESCE(SUM(sa.totalAmount * s.commissionRate), 0) as totalCommission
      FROM sellers s
      LEFT JOIN sales sa ON s.id = sa.sellerId ${dateCondition ? `AND sa.createdAt IS NOT NULL ${dateCondition}` : ''}
      WHERE s.isActive = 1
      GROUP BY s.id, s.firstName, s.lastName, s.email, s.commissionRate
      ORDER BY totalCommission DESC
    `

    const sellers = await prisma.$queryRawUnsafe(sellersQuery, ...dateParams)

    // Para cada vendedor, obtener comisiones mensuales
    const sellersWithMonthlyData = await Promise.all(
      (sellers as any[]).map(async (seller) => {
        let monthlyQuery = `
          SELECT 
            DATE_FORMAT(sa.createdAt, '%Y-%m') as month,
            DATE_FORMAT(sa.createdAt, '%M %Y') as monthName,
            COUNT(sa.id) as sales,
            SUM(sa.totalAmount * ${seller.commissionRate}) as commission
          FROM sales sa
          WHERE sa.sellerId = ?
        `

        let monthlyParams = [seller.id]

        if (startDate && endDate) {
          monthlyQuery += ' AND sa.createdAt >= ? AND sa.createdAt <= ?'
          monthlyParams.push(new Date(startDate), new Date(endDate + 'T23:59:59'))
        } else if (startDate) {
          monthlyQuery += ' AND sa.createdAt >= ?'
          monthlyParams.push(new Date(startDate))
        } else if (endDate) {
          monthlyQuery += ' AND sa.createdAt <= ?'
          monthlyParams.push(new Date(endDate + 'T23:59:59'))
        }

        monthlyQuery += `
          GROUP BY DATE_FORMAT(sa.createdAt, '%Y-%m'), DATE_FORMAT(sa.createdAt, '%M %Y')
          ORDER BY month DESC
          LIMIT 12
        `

        const monthlyCommissions = await prisma.$queryRawUnsafe(monthlyQuery, ...monthlyParams)

        return {
          ...seller,
          totalSales: Number(seller.totalSales),
          totalCommission: Number(seller.totalCommission),
          monthlyCommissions: (monthlyCommissions as any[]).map(month => ({
            month: month.monthName,
            sales: Number(month.sales),
            commission: Number(month.commission)
          }))
        }
      })
    )

    return NextResponse.json(sellersWithMonthlyData)
  } catch (error) {
    console.error('Error fetching commissions report:', error)
    return NextResponse.json(
      { error: 'Error fetching commissions report' },
      { status: 500 }
    )
  }
} 