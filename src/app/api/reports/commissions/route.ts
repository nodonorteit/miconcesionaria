import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener reporte de comisiones de vendedores
export async function GET() {
  try {
    // Obtener todos los vendedores con sus comisiones
    const sellers = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.firstName,
        s.lastName,
        s.email,
        s.commissionRate,
        COALESCE(COUNT(sa.id), 0) as totalSales,
        COALESCE(SUM(sa.totalAmount * s.commissionRate), 0) as totalCommission
      FROM sellers s
      LEFT JOIN sales sa ON s.id = sa.sellerId
      WHERE s.isActive = 1
      GROUP BY s.id, s.firstName, s.lastName, s.email, s.commissionRate
      ORDER BY totalCommission DESC
    `

    // Para cada vendedor, obtener comisiones mensuales
    const sellersWithMonthlyData = await Promise.all(
      (sellers as any[]).map(async (seller) => {
        const monthlyCommissions = await prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(sa.createdAt, '%Y-%m') as month,
            DATE_FORMAT(sa.createdAt, '%M %Y') as monthName,
            COUNT(sa.id) as sales,
            SUM(sa.totalAmount * ${seller.commissionRate}) as commission
          FROM sales sa
          WHERE sa.sellerId = ${seller.id}
          GROUP BY DATE_FORMAT(sa.createdAt, '%Y-%m'), DATE_FORMAT(sa.createdAt, '%M %Y')
          ORDER BY month DESC
          LIMIT 12
        `

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