import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener una venta específica
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sale = await prisma.sale.findUnique({
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
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Error fetching sale:', error)
    return NextResponse.json(
      { error: 'Error al obtener venta' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una venta
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { vehicleId, customerId, sellerId, totalAmount, commission, status, notes } = body

    // Validar campos requeridos
    if (!vehicleId || !customerId || !sellerId || !totalAmount) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Obtener la venta actual para verificar el vehículo anterior
    const currentSale = await prisma.sale.findUnique({
      where: { id: params.id },
      select: { vehicleId: true }
    })

    if (!currentSale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar la venta
    const sale = await prisma.sale.update({
      where: { id: params.id },
      data: {
        totalAmount: parseFloat(totalAmount),
        commission: parseFloat(commission || '0'),
        status: status || 'PENDING',
        notes,
        vehicleId,
        customerId,
        sellerId
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
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Si cambió el vehículo, actualizar estados
    if (currentSale.vehicleId !== vehicleId) {
      // Marcar el vehículo anterior como disponible
      await prisma.vehicle.update({
        where: { id: currentSale.vehicleId },
        data: { status: 'AVAILABLE' }
      })

      // Marcar el nuevo vehículo como vendido
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'SOLD' }
      })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Error updating sale:', error)
    return NextResponse.json(
      { error: 'Error al actualizar venta' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una venta (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Obtener la venta para restaurar el vehículo
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      select: { vehicleId: true }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    // Marcar la venta como cancelada
    await prisma.sale.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' }
    })

    // Restaurar el vehículo como disponible
    await prisma.vehicle.update({
      where: { id: sale.vehicleId },
      data: { status: 'AVAILABLE' }
    })

    return NextResponse.json({ message: 'Venta eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting sale:', error)
    return NextResponse.json(
      { error: 'Error al eliminar venta' },
      { status: 500 }
    )
  }
} 