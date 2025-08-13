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
    const existingDocument = await prisma.saleDocument.findFirst({
      where: { saleId }
    })

    if (existingDocument) {
      return NextResponse.json(existingDocument)
    }

    // Crear el documento de venta
    const document = await prisma.saleDocument.create({
      data: {
        saleId: sale.id,
        documentNumber: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: '' // El contenido se generará cuando se renderice el template
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