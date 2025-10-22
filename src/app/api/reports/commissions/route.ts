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
      dateCondition = 'AND t.createdAt >= ? AND t.createdAt <= ?'
      dateParams = [new Date(startDate), new Date(endDate + 'T23:59:59')]
    } else if (startDate) {
      dateCondition = 'AND t.createdAt >= ?'
      dateParams = [new Date(startDate)]
    } else if (endDate) {
      dateCondition = 'AND t.createdAt <= ?'
      dateParams = [new Date(endDate + 'T23:59:59')]
    }

    // Obtener todos los vendedores con sus comisiones
    const sellersQuery = `
      SELECT 
        c.id,
        c.firstName,
        c.lastName,
        c.email,
        c.commissionRate,
        COALESCE(sales_data.totalSales, 0) as totalSales,
        COALESCE(sales_data.totalCommission, 0) as totalCommission
      FROM commissionists c
      LEFT JOIN (
        SELECT 
          commissionistId,
          COUNT(*) as totalSales,
          SUM(commission) as totalCommission
        FROM transactions 
        WHERE type = 'SALE' AND status = 'COMPLETED' ${dateCondition ? `AND createdAt IS NOT NULL ${dateCondition}` : ''}
        GROUP BY commissionistId
      ) sales_data ON c.id = sales_data.commissionistId
      WHERE c.isActive = 1
      ORDER BY totalCommission DESC
    `

    const sellers = await prisma.$queryRawUnsafe(sellersQuery, ...dateParams)

    // Para cada vendedor, obtener comisiones mensuales
    const sellersWithMonthlyData = await Promise.all(
      (sellers as any[]).map(async (seller) => {
        let monthlyQuery = `
          SELECT 
            DATE_FORMAT(t.createdAt, '%Y-%m') as month,
            DATE_FORMAT(t.createdAt, '%M %Y') as monthName,
            COUNT(t.id) as sales,
            SUM(t.commission) as commission
          FROM transactions t
          WHERE t.commissionistId = ? AND t.type = 'SALE' AND t.status = 'COMPLETED'
        `

        let monthlyParams = [seller.id]

        if (startDate && endDate) {
          monthlyQuery += ' AND t.createdAt >= ? AND t.createdAt <= ?'
          monthlyParams.push(new Date(startDate), new Date(endDate + 'T23:59:59'))
        } else if (startDate) {
          monthlyQuery += ' AND t.createdAt >= ?'
          monthlyParams.push(new Date(startDate))
        } else if (endDate) {
          monthlyQuery += ' AND t.createdAt <= ?'
          monthlyParams.push(new Date(endDate + 'T23:59:59'))
        }

        monthlyQuery += `
          GROUP BY DATE_FORMAT(t.createdAt, '%Y-%m'), DATE_FORMAT(t.createdAt, '%M %Y')
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