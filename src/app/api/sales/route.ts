import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Obtener todas las ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    
    let whereClause = {}
    if (vehicleId) {
      whereClause = { vehicleId }
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        vehicle: {
          include: {
            vehicleType: true
          }
        },
        customer: true,
        seller: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Error al obtener las ventas' },
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
        vehicle: {
          connect: { id: vehicleId }
        },
        customer: {
          connect: { id: customerId }
        },
        seller: {
          connect: { id: sellerId }
        }
      },
      include: {
        vehicle: {
          include: {
            vehicleType: true
          }
        },
        customer: true,
        seller: true
      }
    })

    // Crear automáticamente el documento de venta
    await prisma.saleDocument.create({
      data: {
        saleId: sale.id,
        documentNumber: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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