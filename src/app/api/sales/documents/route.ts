import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener documentos de venta (todos o por saleId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const saleId = searchParams.get('saleId')

    const whereClause = saleId ? { saleId } : {}

    const documents = await prisma.saleDocument.findMany({
      where: whereClause,
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

    // Generar número de documento en formato AAAAMMDD
    const now = new Date()
    const documentNumber = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0')

    // Crear el documento de venta
    const document = await prisma.saleDocument.create({
      data: {
        saleId: sale.id,
        documentNumber: documentNumber
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