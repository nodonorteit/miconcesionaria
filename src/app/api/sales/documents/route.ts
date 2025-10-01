import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los documentos de transacciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    
    const whereClause = transactionId ? { transactionId } : {}

    const documents = await prisma.transactionDocument.findMany({
      where: whereClause,
      include: {
        transaction: {
          include: {
            vehicle: true,
            customer: true,
            commissionist: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching transaction documents:', error)
    return NextResponse.json(
      { error: 'Error al obtener documentos de transacciones' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo documento de transacción
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, templateId, content } = body

    // Validar campos requeridos
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transacción es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la transacción existe
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existe un documento para esta transacción
    const existingDocument = await prisma.transactionDocument.findFirst({
      where: { transactionId }
    })

    if (existingDocument) {
      return NextResponse.json(
        { error: 'Ya existe un documento para esta transacción' },
        { status: 400 }
      )
    }

    // Generar número de documento incremental
    const lastDocument = await prisma.transactionDocument.findFirst({
      orderBy: { documentNumber: 'desc' },
      select: { documentNumber: true }
    })

    let nextNumber = 1
    if (lastDocument && lastDocument.documentNumber.match(/^\d+$/)) {
      nextNumber = parseInt(lastDocument.documentNumber) + 1
    }

    const documentNumber = nextNumber.toString().padStart(10, '0')

    // Crear el documento de transacción
    const document = await prisma.transactionDocument.create({
      data: {
        transactionId,
        templateId,
        content: content || '',
        documentNumber
      },
      include: {
        transaction: {
          include: {
            vehicle: true,
            customer: true,
            commissionist: true
          }
        }
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction document:', error)
    return NextResponse.json(
      { error: 'Error al crear documento de transacción' },
      { status: 500 }
    )
  }
}