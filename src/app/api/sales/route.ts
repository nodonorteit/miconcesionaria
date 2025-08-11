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
    const { vehicleId, customerId, sellerId, totalAmount, commission, status, notes, paymentMethod, deliveryDate } = body

    // Validar campos requeridos
    if (!vehicleId || !customerId || !sellerId || !totalAmount) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Obtener el primer usuario disponible o crear uno por defecto
    let userId: string
    const existingUser = await prisma.user.findFirst({
      where: { isActive: true },
      select: { id: true }
    })

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Crear un usuario por defecto si no existe ninguno
      const hashedPassword = await bcrypt.hash('admin123', 12)
      const defaultUser = await prisma.user.create({
        data: {
          email: 'admin@miconcesionaria.com',
          name: 'Administrador',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      })
      userId = defaultUser.id
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
        userId
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
        vehicleBrand: sale.vehicle.brand,
        vehicleModel: sale.vehicle.model,
        vehicleYear: sale.vehicle.year,
        vehicleColor: '', // Se puede agregar al schema si es necesario
        vehicleMileage: 0, // Se puede agregar al schema si es necesario
        vehicleVin: sale.vehicle.vin || '',
        vehicleLicensePlate: sale.vehicle.licensePlate || '',
        vehicleType: sale.vehicle.vehicleType.name,
        customerFirstName: sale.customer.firstName,
        customerLastName: sale.customer.lastName,
        customerEmail: sale.customer.email || '',
        customerPhone: sale.customer.phone || '',
        customerDocument: sale.customer.documentNumber || '',
        customerCity: sale.customer.city || '',
        customerState: sale.customer.state || '',
        sellerFirstName: sale.seller.firstName,
        sellerLastName: sale.seller.lastName,
        sellerEmail: sale.seller.email || '',
        sellerPhone: sale.seller.phone || '',
        sellerCommissionRate: parseFloat(sale.seller.commissionRate.toString()),
        totalAmount: sale.totalAmount,
        commissionAmount: sale.commission,
        notes: sale.notes || ''
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