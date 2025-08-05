import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un proveedor específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: params.id }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(provider)
  } catch (error) {
    console.error('Error fetching provider:', error)
    return NextResponse.json(
      { error: 'Error fetching provider' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const provider = await prisma.provider.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        taxId: body.taxId
      }
    })

    return NextResponse.json(provider)
  } catch (error) {
    console.error('Error updating provider:', error)
    return NextResponse.json(
      { error: 'Error updating provider' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un proveedor (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const provider = await prisma.provider.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Provider deleted successfully' })
  } catch (error) {
    console.error('Error deleting provider:', error)
    return NextResponse.json(
      { error: 'Error deleting provider' },
      { status: 500 }
    )
  }
} 