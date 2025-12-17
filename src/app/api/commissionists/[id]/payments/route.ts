import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET payments and summary for a commissionist
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate + 'T23:59:59')

    // Comisiones generadas (ventas completadas) en rango
    const earned = await prisma.transaction.aggregate({
      _sum: { commission: true },
      where: {
        commissionistId: params.id,
        type: 'SALE',
        status: 'COMPLETED',
        createdAt: dateFilter
      }
    })

    // Pagos realizados en rango
    const payments = await prisma.commissionPayment.findMany({
      where: {
        commissionistId: params.id,
        paymentDate: dateFilter
      },
      orderBy: { paymentDate: 'desc' }
    })

    const paidTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const earnedTotal = Number(earned._sum.commission || 0)
    const pending = Math.max(earnedTotal - paidTotal, 0)

    return NextResponse.json({
      earned: earnedTotal,
      paid: paidTotal,
      pending,
      payments
    })
  } catch (error) {
    console.error('Error fetching commission payments:', error)
    return NextResponse.json({ error: 'Error al obtener pagos de comisiones' }, { status: 500 })
  }
}

// POST register a payment
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { amount, notes } = body

    const numericAmount = parseFloat(amount)
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    // Calcular pendiente para no permitir pagar más
    const earned = await prisma.transaction.aggregate({
      _sum: { commission: true },
      where: { commissionistId: params.id, type: 'SALE', status: 'COMPLETED' }
    })
    const payments = await prisma.commissionPayment.aggregate({
      _sum: { amount: true },
      where: { commissionistId: params.id }
    })
    const pending = Math.max(Number(earned._sum.commission || 0) - Number(payments._sum.amount || 0), 0)
    if (numericAmount > pending) {
      return NextResponse.json({ error: 'El monto excede el pendiente de comisiones' }, { status: 400 })
    }

    // Registrar pago
    const payment = await prisma.commissionPayment.create({
      data: {
        commissionistId: params.id,
        amount: numericAmount,
        paymentDate: new Date(),
        notes: notes || null
      }
    })

    // Registrar egreso
    await prisma.expense.create({
      data: {
        type: 'COMMISSION',
        amount: numericAmount,
        description: `Pago de comisiones a vendedor ${params.id}`,
        commissionistId: params.id,
        isActive: true
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating commission payment:', error)
    return NextResponse.json({ error: 'Error al registrar pago de comisiones' }, { status: 500 })
  }
}

