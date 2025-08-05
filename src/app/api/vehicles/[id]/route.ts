import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un vehículo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        vehicleType: true,
        images: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json(
      { error: 'Error fetching vehicle' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un vehículo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year),
        color: body.color,
        mileage: parseInt(body.mileage),
        price: parseFloat(body.price),
        description: body.description,
        vin: body.vin,
        licensePlate: body.licensePlate,
        fuelType: body.fuelType,
        transmission: body.transmission,
        status: body.status,
        vehicleTypeId: body.vehicleTypeId
      },
      include: {
        vehicleType: true,
        images: true
      }
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json(
      { error: 'Error updating vehicle' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un vehículo (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { error: 'Error deleting vehicle' },
      { status: 500 }
    )
  }
} 