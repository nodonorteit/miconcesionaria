import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un documento de transacción específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.transactionDocument.findUnique({
      where: { id: params.id },
      include: {
        transaction: {
          include: {
            vehicle: {
              include: {
                vehicleType: true
              }
            },
            customer: true,
            commissionist: true
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
    console.error('Error fetching transaction document:', error)
    return NextResponse.json(
      { error: 'Error al obtener el documento' },
      { status: 500 }
    )
  }
}