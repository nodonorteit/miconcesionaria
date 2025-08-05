import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un vendedor específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const seller = await prisma.seller.findUnique({
      where: { id: params.id }
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Vendedor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(seller)
  } catch (error) {
    console.error('Error fetching seller:', error)
    return NextResponse.json(
      { error: 'Error al obtener vendedor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un vendedor
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

    // Verificar si el email ya existe en otro vendedor
    const existingSeller = await prisma.seller.findFirst({
      where: {
        email,
        id: { not: params.id }
      }
    })

    if (existingSeller) {
      return NextResponse.json(
        { error: 'Ya existe otro vendedor con este email' },
        { status: 400 }
      )
    }

    const seller = await prisma.seller.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        commissionRate: commissionRate || 5.0
      }
    })

    return NextResponse.json(seller)
  } catch (error) {
    console.error('Error updating seller:', error)
    return NextResponse.json(
      { error: 'Error al actualizar vendedor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un vendedor (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.seller.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Vendedor eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting seller:', error)
    return NextResponse.json(
      { error: 'Error al eliminar vendedor' },
      { status: 500 }
    )
  }
} 