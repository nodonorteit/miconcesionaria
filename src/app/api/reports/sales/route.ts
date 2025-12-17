import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener reporte de ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construir condiciones de fecha
    let dateCondition = ''
    let dateParams: any[] = []

    if (startDate && endDate) {
      dateCondition = 'AND s.createdAt >= ? AND s.createdAt <= ?'
      dateParams = [new Date(startDate), new Date(endDate + 'T23:59:59')]
    } else if (startDate) {
      dateCondition = 'AND s.createdAt >= ?'
      dateParams = [new Date(startDate)]
    } else if (endDate) {
      dateCondition = 'AND s.createdAt <= ?'
      dateParams = [new Date(endDate + 'T23:59:59')]
    }

    // Obtener estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(t.id) as totalSales,
        COALESCE(SUM(t.totalAmount), 0) as totalRevenue,
        COALESCE(SUM(t.commission), 0) as totalCommission,
        COALESCE(AVG(t.totalAmount), 0) as averageSaleValue
      FROM transactions t
      WHERE t.type = 'SALE' AND t.status = 'COMPLETED' ${dateCondition}
    `

    const stats = await prisma.$queryRawUnsafe(statsQuery, ...dateParams)
    const statsData = (stats as any[])[0] as any

    // Obtener ventas por mes
    const monthlyQuery = `
      SELECT 
        DATE_FORMAT(t.createdAt, '%M %Y') as month,
        COUNT(t.id) as sales,
        COALESCE(SUM(t.totalAmount), 0) as revenue
      FROM transactions t
      WHERE t.type = 'SALE' AND t.status = 'COMPLETED' ${dateCondition}
      GROUP BY DATE_FORMAT(t.createdAt, '%Y-%m'), DATE_FORMAT(t.createdAt, '%M %Y')
      ORDER BY DATE_FORMAT(t.createdAt, '%Y-%m') DESC
      LIMIT 12
    `

    const salesByMonth = await prisma.$queryRawUnsafe(monthlyQuery, ...dateParams)

    // Obtener mejores vendedores
    const topSellersQuery = `
      SELECT 
        CONCAT(cm.firstName, ' ', cm.lastName) as name,
        COUNT(t.id) as sales,
        COALESCE(SUM(t.commission), 0) as commission
      FROM transactions t
      JOIN commissionists cm ON t.commissionistId = cm.id
      WHERE t.type = 'SALE' AND t.status = 'COMPLETED' ${dateCondition}
      GROUP BY t.commissionistId, cm.firstName, cm.lastName
      ORDER BY commission DESC
      LIMIT 5
    `

    const topSellers = await prisma.$queryRawUnsafe(topSellersQuery, ...dateParams)

    // Obtener ventas recientes
    const recentSalesQuery = `
      SELECT 
        t.id,
        t.transactionNumber AS saleNumber,
        t.createdAt as date,
        t.totalAmount as amount,
        CONCAT(c.firstName, ' ', c.lastName) as customer,
        CONCAT(v.brand, ' ', v.model, ' ', v.year) as vehicle
      FROM transactions t
      JOIN Client c ON t.customerId = c.id
      JOIN Vehicle v ON t.vehicleId = v.id
      WHERE t.type = 'SALE' AND t.status = 'COMPLETED' ${dateCondition}
      ORDER BY t.createdAt DESC
      LIMIT 10
    `

    const recentSales = await prisma.$queryRawUnsafe(recentSalesQuery, ...dateParams)

    const report = {
      totalSales: Number(statsData.totalSales),
      totalRevenue: Number(statsData.totalRevenue),
      totalCommission: Number(statsData.totalCommission),
      averageSaleValue: Number(statsData.averageSaleValue),
      salesByMonth: (salesByMonth as any[]).map(month => ({
        month: month.month,
        sales: Number(month.sales),
        revenue: Number(month.revenue)
      })),
      topSellers: (topSellers as any[]).map(seller => ({
        name: seller.name,
        sales: Number(seller.sales),
        commission: Number(seller.commission)
      })),
      recentSales: (recentSales as any[]).map(sale => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        date: sale.date,
        amount: Number(sale.amount),
        customer: sale.customer,
        vehicle: sale.vehicle
      }))
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching sales report:', error)
    return NextResponse.json(
      { error: 'Error fetching sales report' },
      { status: 500 }
    )
  }
} 