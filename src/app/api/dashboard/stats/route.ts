import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalVehicles,
      totalCustomers,
      totalSales,
      totalRevenue,
      pendingSales,
      activeSellers,
      totalProviders,
      totalWorkshops,
      totalExpenses,
      totalExpensesAmount
    ] = await Promise.all([
      prisma.vehicle.count({
        where: { isActive: true }
      }),
      prisma.customer.count({
        where: { isActive: true }
      }),
      prisma.sale.count(),
      prisma.sale.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      prisma.sale.count({
        where: { status: 'PENDING' }
      }),
      prisma.seller.count({
        where: { isActive: true }
      }),
      prisma.provider.count({
        where: { isActive: true }
      }),
      prisma.workshop.count({
        where: { isActive: true }
      }),
      prisma.expense.count({
        where: { isActive: true }
      }),
      prisma.expense.aggregate({
        _sum: {
          amount: true
        },
        where: { isActive: true }
      })
    ])

    return NextResponse.json({
      totalVehicles,
      totalCustomers,
      totalSales,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingSales,
      activeSellers,
      totalProviders,
      totalWorkshops,
      totalExpenses,
      totalExpensesAmount: totalExpensesAmount._sum.amount || 0
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error fetching dashboard stats' },
      { status: 500 }
    )
  }
} 