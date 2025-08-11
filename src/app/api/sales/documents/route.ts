import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los documentos de venta
export async function GET() {
  try {
    const documents = await prisma.saleDocument.findMany({
      include: {
        sale: {
          include: {
            vehicle: true,
            customer: true,
            seller: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching sale documents:', error)
    return NextResponse.json(
      { error: 'Error al obtener documentos de venta' },
      { status: 500 }
    )
  }
}

// POST - Generar un nuevo documento de venta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { saleId } = body

    if (!saleId) {
      return NextResponse.json(
        { error: 'ID de venta es requerido' },
        { status: 400 }
      )
    }

    // Obtener la venta con toda la información necesaria
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
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

    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existe un documento para esta venta
    const existingDocument = await prisma.saleDocument.findUnique({
      where: { saleId }
    })

    if (existingDocument) {
      return NextResponse.json(existingDocument)
    }

    // Crear el documento de venta
    const document = await prisma.saleDocument.create({
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

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating sale document:', error)
    return NextResponse.json(
      { error: 'Error al crear documento de venta' },
      { status: 500 }
    )
  }
} 