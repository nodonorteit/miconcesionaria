import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un tipo de vehículo específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id: params.id }
    })

    if (!vehicleType) {
      return NextResponse.json(
        { error: 'Tipo de vehículo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicleType)
  } catch (error) {
    console.error('Error fetching vehicle type:', error)
    return NextResponse.json(
      { error: 'Error al cargar tipo de vehículo' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un tipo de vehículo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe otro tipo con el mismo nombre
    const existingType = await prisma.vehicleType.findFirst({
      where: {
        name,
        id: { not: params.id }
      }
    })

    if (existingType) {
      return NextResponse.json(
        { error: 'Ya existe un tipo de vehículo con ese nombre' },
        { status: 400 }
      )
    }

    const vehicleType = await prisma.vehicleType.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null
      }
    })

    return NextResponse.json(vehicleType)
  } catch (error) {
    console.error('Error updating vehicle type:', error)
    return NextResponse.json(
      { error: 'Error al actualizar tipo de vehículo' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un tipo de vehículo (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar si hay vehículos usando este tipo
    const vehiclesWithType = await prisma.vehicle.findFirst({
      where: { vehicleTypeId: params.id }
    })

    if (vehiclesWithType) {
      return NextResponse.json(
        { error: 'No se puede eliminar este tipo porque hay vehículos asociados' },
        { status: 400 }
      )
    }

    await prisma.vehicleType.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Tipo de vehículo eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting vehicle type:', error)
    return NextResponse.json(
      { error: 'Error al eliminar tipo de vehículo' },
      { status: 500 }
    )
  }
} 