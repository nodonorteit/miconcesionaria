import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un taller específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshop = await prisma.workshop.findUnique({
      where: { id: params.id }
    })

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(workshop)
  } catch (error) {
    console.error('Error fetching workshop:', error)
    return NextResponse.json(
      { error: 'Error fetching workshop' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un taller
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const workshop = await prisma.workshop.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state
      }
    })

    return NextResponse.json(workshop)
  } catch (error) {
    console.error('Error updating workshop:', error)
    return NextResponse.json(
      { error: 'Error updating workshop' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un taller (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workshop = await prisma.workshop.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Workshop deleted successfully' })
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return NextResponse.json(
      { error: 'Error deleting workshop' },
      { status: 500 }
    )
  }
} 