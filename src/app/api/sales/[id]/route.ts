import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuditLogger, getUserInfoFromRequest } from '@/lib/audit-logger'

// GET - Obtener una transacción específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        commissionist: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Error al obtener transacción' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una transacción
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { vehicleId, customerId, commissionistId, totalAmount, commission, status, notes, type, paymentMethod, deliveryDate } = body

    // Validar campos requeridos
    if (!vehicleId || !customerId || !totalAmount || !type) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Obtener la transacción actual para verificar el vehículo anterior
    const currentTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      select: { vehicleId: true }
    })

    if (!currentTransaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar la transacción
    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        vehicleId,
        customerId,
        commissionistId,
        totalAmount: parseFloat(totalAmount),
        commission: parseFloat(commission) || 0,
        status,
        notes,
        type,
        paymentMethod: paymentMethod || 'CONTADO',
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null
      },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true
          }
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        commissionist: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Actualizar estado del vehículo según el estado de la venta
    if (type === 'SALE') {
      if (status === 'COMPLETED') {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { status: 'SOLD' }
        })
        console.log(`✅ Vehículo ${vehicleId} marcado como vendido`)
      } else if (status === 'CANCELLED') {
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { status: 'AVAILABLE' }
        })
        console.log(`✅ Vehículo ${vehicleId} vuelve a estar disponible`)
      }
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Error al actualizar transacción' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una transacción (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    const userInfo = getUserInfoFromRequest(request)

    // Si es una venta completada, crear un egreso para reversar el ingreso
    if (transaction.type === 'SALE' && transaction.status === 'COMPLETED') {
      // Crear un egreso por el monto total de la venta (incluye la comisión)
      const expense = await prisma.expense.create({
        data: {
          description: `Reversión de venta cancelada: ${transaction.transactionNumber}`,
          amount: Number(transaction.totalAmount),
          type: 'WORKSHOP' as any, // Tipo genérico para reversiones
          workshopId: null,
          commissionistId: null,
          receiptPath: null
        }
      })
      console.log(`✅ Egreso creado por reversión de venta: $${transaction.totalAmount}`)

      // Log del egreso creado
      await AuditLogger.logExpenseAction(
        'CREATE',
        expense.id,
        `Egreso automático por reversión de venta cancelada: ${transaction.transactionNumber}`,
        undefined,
        {
          description: expense.description,
          amount: Number(expense.amount),
          type: expense.type
        },
        userInfo.userId,
        userInfo.userEmail
      )
    }

    // Log de la cancelación de la venta
    console.log('🔍 [DEBUG] Intentando registrar log de auditoría para cancelación de venta:', transaction.id)
    
    try {
      await AuditLogger.logSaleAction(
        'CANCEL',
        transaction.id,
        `Venta cancelada: ${transaction.transactionNumber} - Monto: $${transaction.totalAmount}`,
        {
          status: transaction.status,
          totalAmount: transaction.totalAmount,
          commission: transaction.commission
        },
        {
          status: 'CANCELLED',
          totalAmount: transaction.totalAmount,
          commission: transaction.commission
        },
        userInfo.userId,
        userInfo.userEmail
      )
      console.log('✅ [DEBUG] Log de auditoría registrado exitosamente')
    } catch (auditError) {
      console.error('❌ [DEBUG] Error registrando log de auditoría:', auditError)
    }

    await prisma.transaction.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' }
    })

    // Si es una venta cancelada, volver a marcar el vehículo como disponible
    if (transaction.type === 'SALE') {
      await prisma.vehicle.update({
        where: { id: transaction.vehicleId },
        data: { status: 'AVAILABLE' }
      })
      console.log(`✅ Vehículo ${transaction.vehicleId} vuelve a estar disponible tras cancelar venta`)

      // Log del cambio de estado del vehículo
      console.log('🔍 [DEBUG] Intentando registrar log de auditoría para cambio de estado del vehículo:', transaction.vehicleId)
      
      try {
        await AuditLogger.logVehicleAction(
          'UPDATE',
          transaction.vehicleId,
          `Vehículo vuelve a estar disponible tras cancelar venta: ${transaction.transactionNumber}`,
          { status: 'SOLD' },
          { status: 'AVAILABLE' },
          userInfo.userId,
          userInfo.userEmail
        )
        console.log('✅ [DEBUG] Log de auditoría del vehículo registrado exitosamente')
      } catch (auditError) {
        console.error('❌ [DEBUG] Error registrando log de auditoría del vehículo:', auditError)
      }
    }

    return NextResponse.json({ message: 'Transacción cancelada correctamente' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Error al eliminar transacción' },
      { status: 500 }
    )
  }
}