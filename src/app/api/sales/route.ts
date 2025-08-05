import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todas las ventas
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        status: {
          not: 'CANCELLED'
        }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva venta
export async function POST(request: NextRequest) {
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

    // Generar número de venta único
    const saleNumber = `V${Date.now()}`

    // Crear la venta
    const sale = await prisma.sale.create({
      data: {
        saleNumber,
        totalAmount: parseFloat(totalAmount),
        commission: parseFloat(commission || '0'),
        status: status || 'PENDING',
        notes,
        vehicleId,
        customerId,
        sellerId,
        userId: 'admin-2' // TODO: Get from session
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

    // Actualizar estado del vehículo a VENDIDO
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'SOLD' }
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Error al crear venta' },
      { status: 500 }
    )
  }
} 