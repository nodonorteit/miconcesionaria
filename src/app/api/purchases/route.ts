import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError, handleValidationError } from '@/lib/error-handler'

// GET - Obtener todas las compras
export async function GET() {
  try {
    const purchases = await prisma.transaction.findMany({
      where: {
        type: 'PURCHASE'
      },
      include: {
        vehicle: {
          include: {
            vehicleType: true
          }
        },
        customer: true, // En compras, el customer es el vendedor (particular)
        commissionist: true
      },
      orderBy: {
        transactionDate: 'desc'
      }
    })

    // Transformar los datos para el frontend
    const processedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      purchaseNumber: purchase.transactionNumber,
      purchaseDate: purchase.transactionDate,
      totalAmount: Number(purchase.totalAmount),
      status: purchase.status,
      notes: purchase.notes,
      vehicle: purchase.vehicle,
      seller: purchase.customer, // El customer es el vendedor en compras
      commissionist: purchase.commissionist
    }))

    return NextResponse.json(processedPurchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Error al obtener las compras' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva compra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    if (!body.vehicleId || !body.sellerId || !body.totalAmount) {
      return handleValidationError('Faltan campos requeridos: vehículo, vendedor y monto')
    }

    // Generar número de compra único
    const purchaseNumber = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Crear la transacción de compra
    const purchase = await prisma.transaction.create({
      data: {
        transactionNumber: purchaseNumber,
        type: 'PURCHASE',
        vehicleId: body.vehicleId,
        customerId: body.sellerId, // En compras, el customer es el vendedor
        totalAmount: parseFloat(body.totalAmount),
        commission: 0, // Las compras no tienen comisión
        status: 'COMPLETED', // Las compras se completan automáticamente
        notes: body.notes || null,
        paymentMethod: 'CONTADO', // Por defecto
        deliveryDate: new Date()
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

    // Actualizar el estado del vehículo a "disponible" (ya que ahora es propiedad de la concesionaria)
    await prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: { 
        status: 'AVAILABLE',
        // Actualizar el precio del vehículo con el precio de compra
        price: parseFloat(body.totalAmount)
      }
    })

    // Crear el egreso correspondiente
    await prisma.expense.create({
      data: {
        type: 'WORKSHOP', // Usar WORKSHOP como tipo por defecto para compras
        amount: parseFloat(body.totalAmount),
        description: `Compra de vehículo: ${purchase.vehicle.brand} ${purchase.vehicle.model} ${purchase.vehicle.year}`,
        workshopId: null,
        commissionistId: null,
        receiptPath: null
      }
    })

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

    return NextResponse.json(processedPurchase, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return handlePrismaError(error)
  }
}
