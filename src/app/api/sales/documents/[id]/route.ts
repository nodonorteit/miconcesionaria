import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un documento de venta específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.saleDocument.findUnique({
      where: { id: params.id },
      include: {
        sale: {
          include: {
            vehicle: {
              include: {
                vehicleType: true
              }
            },
            customer: true,
            seller: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching sale document:', error)
    return NextResponse.json(
      { error: 'Error al obtener el documento' },
      { status: 500 }
    )
  }
} 