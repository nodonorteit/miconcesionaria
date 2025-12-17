import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/error-handler'

// GET - Obtener todas las transacciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const include = searchParams.get('include')
    const status = searchParams.get('status')
    
    let whereClause: any = {}
    
    // Si se especifica un status, filtrar solo por ese status
    // Si no se especifica, excluir las canceladas
    if (status) {
      whereClause.status = status
    } else {
      whereClause.status = {
        not: 'CANCELLED'
      }
    }
    
    if (vehicleId) {
      whereClause.vehicleId = vehicleId
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

    // Evitar ventas duplicadas del mismo vehículo mientras haya una venta pendiente o completada
    const existingSale = await prisma.transaction.findFirst({
      where: {
        vehicleId,
        type: 'SALE',
        status: {
          in: ['PENDING', 'COMPLETED']
        }
      },
      select: { id: true, transactionNumber: true, status: true }
    })

    if (existingSale) {
      return NextResponse.json(
        { error: `El vehículo ya tiene una venta ${existingSale.status === 'COMPLETED' ? 'completada' : 'pendiente'} (N° ${existingSale.transactionNumber}). No se puede generar otra venta.` },
        { status: 400 }
      )
    }

    // Procesar totalAmount - limpiar formato argentino (quitar puntos de miles, convertir coma a punto)
    let totalAmountValue: number
    try {
      const cleanedTotalAmount = totalAmount.toString().replace(/\./g, '').replace(',', '.')
      totalAmountValue = parseFloat(cleanedTotalAmount)
      
      if (isNaN(totalAmountValue)) {
        console.error('❌ totalAmount inválido:', totalAmount)
        return NextResponse.json({ error: 'El monto total ingresado no es válido' }, { status: 400 })
      }
      
      // Validar que el monto no exceda el máximo permitido
      if (totalAmountValue > 999999999999999999.99) {
        console.error('❌ totalAmount excede el máximo permitido:', totalAmountValue)
        return NextResponse.json({ 
          error: `El monto total no puede ser mayor a $999.999.999.999.999.999,99. Valor ingresado: ${totalAmount}` 
        }, { status: 400 })
      }
    } catch (error) {
      console.error('❌ Error procesando totalAmount:', error)
      return NextResponse.json({ error: 'Error al procesar el monto total' }, { status: 400 })
    }

    // Procesar comisión: calcular a partir del commissionist si corresponde
    let commissionValue: number = 0
    try {
      if (commissionistId) {
        const comm = await prisma.commissionist.findUnique({
          where: { id: commissionistId },
          select: { commissionRate: true }
        })
        const rate = comm?.commissionRate ? Number(comm.commissionRate) : 0
        // Se almacena como porcentaje (ej: 1 = 1%)
        commissionValue = Number((totalAmountValue * (rate / 100)).toFixed(2))
      } else if (commission) {
        // fallback si se envía explícito
        const cleanedCommission = commission.toString().replace(/\./g, '').replace(',', '.')
        const parsed = parseFloat(cleanedCommission)
        commissionValue = isNaN(parsed) ? 0 : parsed
      }
    } catch (error) {
      console.warn('⚠️ Error calculando comisión, usando 0:', error)
      commissionValue = 0
    }

    // Generar número de transacción único
    let transactionNumber: string
    
    if (type === 'PURCHASE') {
      // Para compras, usar formato con timestamp
      transactionNumber = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    } else {
      // Para ventas, usar formato incremental
      const lastTransaction = await prisma.transaction.findFirst({
        where: {
          transactionNumber: {
            startsWith: 'SALE'
          }
        },
        orderBy: { transactionNumber: 'desc' },
        select: { transactionNumber: true }
      })

      let nextNumber = 1
      if (lastTransaction && lastTransaction.transactionNumber.match(/^SALE-(\d+)$/)) {
        const match = lastTransaction.transactionNumber.match(/^SALE-(\d+)$/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }

      transactionNumber = `SALE-${nextNumber.toString().padStart(10, '0')}`
    }

    // Crear la transacción
    const transaction = await prisma.transaction.create({
      data: {
        vehicleId,
        customerId,
        commissionistId: commissionistId || null,
        totalAmount: totalAmountValue,
        commission: commissionValue,
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
    // Usar el manejador de errores personalizado
    return handlePrismaError(error)
  }
}