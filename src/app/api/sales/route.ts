import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todas las transacciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const include = searchParams.get('include')
    
    let whereClause = {}
    if (vehicleId) {
      whereClause = { vehicleId }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        vehicle: {
          include: {
            vehicleType: true
          }
        },
        customer: true,
        commissionist: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Error al obtener transacciones' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva transacción
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      vehicleId, 
      customerId, 
      commissionistId, 
      totalAmount, 
      commission, 
      status, 
      notes, 
      type, 
      paymentMethod, 
      deliveryDate 
    } = body

    // Validar campos requeridos
    if (!vehicleId || !customerId || !totalAmount || !type) {
      return NextResponse.json(
        { error: 'Vehículo, cliente, monto total y tipo son requeridos' },
        { status: 400 }
      )
    }

    // Generar número de transacción incremental
    const lastTransaction = await prisma.transaction.findFirst({
      orderBy: { transactionNumber: 'desc' },
      select: { transactionNumber: true }
    })

    let nextNumber = 1
    if (lastTransaction && lastTransaction.transactionNumber.match(/^\d+$/)) {
      nextNumber = parseInt(lastTransaction.transactionNumber) + 1
    }

    const transactionNumber = nextNumber.toString().padStart(10, '0')

    // Crear la transacción
    const transaction = await prisma.transaction.create({
      data: {
        vehicleId,
        customerId,
        commissionistId,
        totalAmount: parseFloat(totalAmount),
        commission: parseFloat(commission) || 0,
        status: status || 'PENDING',
        notes,
        type,
        paymentMethod: paymentMethod || 'CONTADO',
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        transactionNumber
      },
      include: {
        vehicle: {
          include: {
            vehicleType: true
          }
        },
        customer: true,
        commissionist: true
      }
    })

    // Crear automáticamente el documento de transacción
    await prisma.transactionDocument.create({
      data: {
        transactionId: transaction.id,
        documentNumber: transactionNumber,
        content: ''
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Error al crear transacción' },
      { status: 500 }
    )
  }
}