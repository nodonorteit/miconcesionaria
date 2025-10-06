import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError, handleValidationError } from '@/lib/error-handler'

// GET - Obtener una compra específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchase = await prisma.transaction.findUnique({
      where: { 
        id: params.id,
        type: 'PURCHASE' // Solo compras
      },
      include: {
        vehicle: {
          include: {
            vehicleType: true
          }
        },
        customer: true, // En compras, el customer es el vendedor
        commissionist: true
      }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      )
    }

    // Transformar la respuesta
    const processedPurchase = {
      id: purchase.id,
      purchaseNumber: purchase.transactionNumber,
      purchaseDate: purchase.transactionDate,
      totalAmount: Number(purchase.totalAmount),
      status: purchase.status,
      notes: purchase.notes,
      vehicle: purchase.vehicle,
      seller: purchase.customer,
      commissionist: purchase.commissionist
    }

    return NextResponse.json(processedPurchase)
  } catch (error) {
    console.error('Error fetching purchase:', error)
    return handlePrismaError(error)
  }
}

// PUT - Actualizar una compra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.vehicleId || !body.sellerId || !body.totalAmount) {
      return handleValidationError('Faltan campos requeridos: vehículo, vendedor y monto')
    }

    // Verificar que la compra existe
    const existingPurchase = await prisma.transaction.findUnique({
      where: { 
        id: params.id,
        type: 'PURCHASE'
      }
    })

    if (!existingPurchase) {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar la transacción
    const updatedPurchase = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        vehicleId: body.vehicleId,
        customerId: body.sellerId,
        totalAmount: parseFloat(body.totalAmount),
        notes: body.notes || null
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

    // Actualizar el precio del vehículo
    await prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: { 
        price: parseFloat(body.totalAmount)
      }
    })

    // Actualizar el egreso correspondiente
    await prisma.expense.updateMany({
      where: {
        description: {
          contains: `Compra de vehículo: ${updatedPurchase.vehicle.brand} ${updatedPurchase.vehicle.model} ${updatedPurchase.vehicle.year}`
        }
      },
      data: {
        amount: parseFloat(body.totalAmount),
        description: `Compra de vehículo: ${updatedPurchase.vehicle.brand} ${updatedPurchase.vehicle.model} ${updatedPurchase.vehicle.year}`
      }
    })

    // Transformar la respuesta
    const processedPurchase = {
      id: updatedPurchase.id,
      purchaseNumber: updatedPurchase.transactionNumber,
      purchaseDate: updatedPurchase.transactionDate,
      totalAmount: Number(updatedPurchase.totalAmount),
      status: updatedPurchase.status,
      notes: updatedPurchase.notes,
      vehicle: updatedPurchase.vehicle,
      seller: updatedPurchase.customer,
      commissionist: updatedPurchase.commissionist
    }

    return NextResponse.json(processedPurchase)
  } catch (error) {
    console.error('Error updating purchase:', error)
    return handlePrismaError(error)
  }
}

// DELETE - Eliminar una compra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que la compra existe
    const purchase = await prisma.transaction.findUnique({
      where: { 
        id: params.id,
        type: 'PURCHASE'
      },
      include: {
        vehicle: true
      }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar el egreso correspondiente
    await prisma.expense.deleteMany({
      where: {
        description: {
          contains: `Compra de vehículo: ${purchase.vehicle.brand} ${purchase.vehicle.model} ${purchase.vehicle.year}`
        }
      }
    })

    // Eliminar la transacción
    await prisma.transaction.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Compra eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting purchase:', error)
    return handlePrismaError(error)
  }
}
