import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un comisionista específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const commissionist = await prisma.commissionist.findUnique({
      where: { id: params.id }
    })

    if (!commissionist) {
      return NextResponse.json(
        { error: 'Comisionista no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(commissionist)
  } catch (error) {
    console.error('Error fetching commissionist:', error)
    return NextResponse.json(
      { error: 'Error al obtener comisionista' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un comisionista
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, commissionRate } = body

    // Validar campos requeridos
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Nombre, apellido y email son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe en otro comisionista
    const existingCommissionist = await prisma.commissionist.findFirst({
      where: {
        email,
        id: { not: params.id }
      }
    })

    if (existingCommissionist) {
      return NextResponse.json(
        { error: 'Ya existe otro comisionista con este email' },
        { status: 400 }
      )
    }

    const commissionist = await prisma.commissionist.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        commissionRate: commissionRate !== undefined ? commissionRate : 5.0
      }
    })

    return NextResponse.json(commissionist)
  } catch (error) {
    console.error('Error updating commissionist:', error)
    return NextResponse.json(
      { error: 'Error al actualizar comisionista' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un comisionista (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.commissionist.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Comisionista eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting commissionist:', error)
    return NextResponse.json(
      { error: 'Error al eliminar comisionista' },
      { status: 500 }
    )
  }
} 