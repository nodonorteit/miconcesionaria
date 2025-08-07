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
        COUNT(s.id) as totalSales,
        COALESCE(SUM(s.totalAmount), 0) as totalRevenue,
        COALESCE(SUM(s.commission), 0) as totalCommission,
        COALESCE(AVG(s.totalAmount), 0) as averageSaleValue
      FROM sales s
      WHERE s.status = 'COMPLETED' ${dateCondition}
    `

    const stats = await prisma.$queryRawUnsafe(statsQuery, ...dateParams)
    const statsData = (stats as any[])[0] as any

    // Obtener ventas por mes
    const monthlyQuery = `
      SELECT 
        DATE_FORMAT(s.createdAt, '%M %Y') as month,
        COUNT(s.id) as sales,
        COALESCE(SUM(s.totalAmount), 0) as revenue
      FROM sales s
      WHERE s.status = 'COMPLETED' ${dateCondition}
      GROUP BY DATE_FORMAT(s.createdAt, '%Y-%m'), DATE_FORMAT(s.createdAt, '%M %Y')
      ORDER BY DATE_FORMAT(s.createdAt, '%Y-%m') DESC
      LIMIT 12
    `

    const salesByMonth = await prisma.$queryRawUnsafe(monthlyQuery, ...dateParams)

    // Obtener mejores vendedores
    const topSellersQuery = `
      SELECT 
        CONCAT(sel.firstName, ' ', sel.lastName) as name,
        COUNT(s.id) as sales,
        COALESCE(SUM(s.commission), 0) as commission
      FROM sales s
      JOIN sellers sel ON s.sellerId = sel.id
      WHERE s.status = 'COMPLETED' ${dateCondition}
      GROUP BY s.sellerId, sel.firstName, sel.lastName
      ORDER BY commission DESC
      LIMIT 5
    `

    const topSellers = await prisma.$queryRawUnsafe(topSellersQuery, ...dateParams)

    // Obtener ventas recientes
    const recentSalesQuery = `
      SELECT 
        s.id,
        s.saleNumber,
        s.createdAt as date,
        s.totalAmount as amount,
        CONCAT(c.firstName, ' ', c.lastName) as customer,
        CONCAT(v.brand, ' ', v.model, ' ', v.year) as vehicle
      FROM sales s
      JOIN customers c ON s.customerId = c.id
      JOIN vehicles v ON s.vehicleId = v.id
      WHERE s.status = 'COMPLETED' ${dateCondition}
      ORDER BY s.createdAt DESC
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