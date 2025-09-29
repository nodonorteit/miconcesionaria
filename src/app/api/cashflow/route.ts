import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener flujo de caja calculado dinámicamente
export async function GET() {
  try {
    // Obtener todas las transacciones completadas
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED' // Solo transacciones completadas
      },
      select: {
        id: true,
        type: true,
        totalAmount: true,
        commission: true,
        transactionDate: true,
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
        transactionDate: 'desc'
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

    // Transformar transacciones en entradas de cashflow
    const transactionEntries = transactions.map(transaction => ({
      id: `transaction-${transaction.id}`,
      type: transaction.type === 'SALE' ? 'INCOME' as const : 'EXPENSE' as const,
      amount: Number(transaction.totalAmount),
      description: `${transaction.type === 'SALE' ? 'Venta' : 'Compra'} de ${transaction.vehicle.brand} ${transaction.vehicle.model} - ${transaction.customer.firstName} ${transaction.customer.lastName}`,
      category: transaction.type === 'SALE' ? 'Ventas' : 'Compras',
      date: transaction.transactionDate.toISOString().split('T')[0],
      receiptUrl: null,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
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
    const cashflow = [...transactionEntries, ...expenseEntries].sort((a, b) => 
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