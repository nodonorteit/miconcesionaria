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
    const { vehicleId, customerId, commissionistId, totalAmount, commission, status, notes, type, paymentMethod, deliveryDate, commissionOverride } = body

    console.log('🔍 [DEBUG] ========== INICIO ACTUALIZACIÓN ==========')
    console.log('🔍 [DEBUG] Actualizando transacción:', {
      id: params.id,
      commissionistId: commissionistId,
      commissionistIdType: typeof commissionistId,
      commissionistIdIsEmpty: commissionistId === '',
      commissionistIdIsNull: commissionistId === null,
      commissionistIdIsUndefined: commissionistId === undefined
    })

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
      select: { vehicleId: true, commissionistId: true, status: true, type: true, transactionNumber: true }
    })

    if (!currentTransaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    // Regla: una venta completada no puede ser anulada
    if (currentTransaction.type === 'SALE' && currentTransaction.status === 'COMPLETED' && status === 'CANCELLED') {
      return NextResponse.json(
        { error: `La venta N° ${currentTransaction.transactionNumber || ''} ya está completada y no se puede anular.` },
        { status: 400 }
      )
    }

    // Normalizar commissionistId: convertir string vacío, undefined, o null a null
    let normalizedCommissionistId: string | null = null
    if (commissionistId && commissionistId !== '' && commissionistId !== 'null' && commissionistId !== 'undefined') {
      // Verificar que el commissionist existe antes de asignarlo
      try {
        const commissionistExists = await prisma.commissionist.findUnique({
          where: { id: commissionistId },
          select: { id: true }
        })
        if (commissionistExists) {
          normalizedCommissionistId = commissionistId
        } else {
          console.warn(`⚠️ Commissionist ${commissionistId} no existe, usando null`)
          normalizedCommissionistId = null
        }
      } catch (error) {
        console.error('Error verificando commissionist:', error)
        normalizedCommissionistId = null
      }
    }

    console.log('🔍 [DEBUG] commissionistId normalizado:', normalizedCommissionistId)
    console.log('🔍 [DEBUG] Transacción actual commissionistId:', currentTransaction.commissionistId)

    // Parsear totalAmount (formato AR)
    let totalAmountValue: number
    try {
      const cleanedTotalAmount = totalAmount.toString().replace(/\./g, '').replace(',', '.')
      totalAmountValue = parseFloat(cleanedTotalAmount)
      if (isNaN(totalAmountValue)) {
        return NextResponse.json({ error: 'Monto total inválido' }, { status: 400 })
      }
    } catch (err) {
      return NextResponse.json({ error: 'Error al procesar monto total' }, { status: 400 })
    }

    // Calcular comisión
    let commissionValue: number = 0
    try {
      if (commissionOverride !== undefined && commissionOverride !== null) {
        const cleanedOverride = commissionOverride.toString().replace(/\./g, '').replace(',', '.')
        const parsed = parseFloat(cleanedOverride)
        if (!isNaN(parsed) && parsed >= 0) {
          commissionValue = parsed
        }
      } else if (normalizedCommissionistId) {
        const comm = await prisma.commissionist.findUnique({
          where: { id: normalizedCommissionistId },
          select: { commissionRate: true }
        })
        const rate = comm?.commissionRate ? Number(comm.commissionRate) : 0
        commissionValue = Number((totalAmountValue * (rate / 100)).toFixed(2))
      } else if (commission) {
        const cleanedCommission = commission.toString().replace(/\./g, '').replace(',', '.')
        const parsed = parseFloat(cleanedCommission)
        commissionValue = isNaN(parsed) ? 0 : parsed
      }
    } catch (error) {
      console.warn('⚠️ Error calculando comisión, usando 0:', error)
      commissionValue = 0
    }

    // Verificar si el commissionistId actual es válido (si existe)
    let needsCommissionistFix = false
    if (currentTransaction.commissionistId) {
      try {
        const currentCommissionistExists = await prisma.commissionist.findUnique({
          where: { id: currentTransaction.commissionistId },
          select: { id: true }
        })
        if (!currentCommissionistExists) {
          console.warn(`⚠️ El commissionistId actual (${currentTransaction.commissionistId}) no existe, será limpiado`)
          needsCommissionistFix = true
        }
      } catch (error) {
        console.error('Error verificando commissionist actual:', error)
        needsCommissionistFix = true
      }
    }

    // Si el commissionistId actual es inválido, limpiarlo primero con SQL directo
    if (needsCommissionistFix) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE transactions SET commissionistId = NULL WHERE id = ?`,
          params.id
        )
        console.log('✅ CommissionistId inválido limpiado')
      } catch (error) {
        console.error('Error limpiando commissionistId inválido:', error)
      }
    }

    // Si commissionistId es null, usar SQL directo para evitar problemas de validación de Prisma
    console.log('🔍 [DEBUG] Verificando si usar SQL directo. normalizedCommissionistId === null?', normalizedCommissionistId === null)
    if (normalizedCommissionistId === null) {
      console.log('🔍 [DEBUG] ✅ Usando SQL directo para actualizar con commissionistId = null')
      try {
        // Actualizar usando SQL directo para evitar validación de clave foránea
        await prisma.$executeRawUnsafe(
          `UPDATE transactions SET 
            vehicleId = ?,
            customerId = ?,
            totalAmount = ?,
            commission = ?,
            status = ?,
            notes = ?,
            type = ?,
            paymentMethod = ?,
            deliveryDate = ?,
            commissionistId = NULL,
            updatedAt = NOW()
          WHERE id = ?`,
          vehicleId,
          customerId,
          totalAmountValue,
          commissionValue,
          status,
          notes || null,
          type,
          paymentMethod || 'CONTADO',
          deliveryDate ? new Date(deliveryDate) : null,
          params.id
        )
        console.log('✅ Transacción actualizada con SQL directo')
        
        // Obtener la transacción actualizada
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
            { error: 'Transacción no encontrada después de actualizar' },
            { status: 404 }
          )
        }

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
      } catch (sqlError) {
        console.error('Error actualizando con SQL directo:', sqlError)
        // Si falla SQL directo, intentar con Prisma normal
      }
    }

    // Preparar los datos de actualización para Prisma (solo si commissionistId no es null)
    const updateData: any = {
      vehicleId,
      customerId,
      totalAmount: totalAmountValue,
      commission: commissionValue,
      status,
      notes,
      type,
      paymentMethod: paymentMethod || 'CONTADO',
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      commissionistId: normalizedCommissionistId
    }

    console.log('🔍 [DEBUG] updateData preparado:', JSON.stringify(updateData, null, 2))

    // Actualizar la transacción
    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: updateData,
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