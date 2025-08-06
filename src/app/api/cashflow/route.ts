import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener flujo de caja calculado dinámicamente
export async function GET() {
  try {
    // Obtener todas las ventas
    const sales = await prisma.sale.findMany({
      where: {
        status: 'COMPLETED' // Solo ventas completadas
      },
      select: {
        id: true,
        totalAmount: true,
        commission: true,
        saleDate: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        vehicle: {
          select: {
            brand: true,
            model: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        saleDate: 'desc'
      }
    })

    // Obtener todos los gastos
    const expenses = await prisma.expense.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformar ventas en ingresos de cashflow
    const incomeEntries = sales.map(sale => ({
      id: `income-${sale.id}`,
      type: 'INCOME' as const,
      amount: Number(sale.totalAmount),
      description: `Venta de ${sale.vehicle.brand} ${sale.vehicle.model} - ${sale.customer.firstName} ${sale.customer.lastName}`,
      category: 'Ventas',
      date: sale.saleDate.toISOString().split('T')[0],
      receiptUrl: null,
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString()
    }))

    // Transformar gastos en egresos de cashflow
    const expenseEntries = expenses.map(expense => ({
      id: `expense-${expense.id}`,
      type: 'EXPENSE' as const,
      amount: Number(expense.amount),
      description: expense.description,
      category: expense.type,
      date: expense.createdAt.toISOString().split('T')[0],
      receiptUrl: null,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }))

    // Combinar y ordenar por fecha
    const cashflow = [...incomeEntries, ...expenseEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json(cashflow)
  } catch (error) {
    console.error('Error fetching cashflow:', error)
    return NextResponse.json(
      { error: 'Error fetching cashflow' },
      { status: 500 }
    )
  }
}

// POST - No implementado ya que el cashflow se calcula dinámicamente
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Cashflow se calcula automáticamente desde ventas y gastos' },
    { status: 405 }
  )
} 