import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        vehicleType: true
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleData = await request.json()
    
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: parseInt(vehicleData.year),
        color: vehicleData.color,
        mileage: parseInt(vehicleData.mileage),
        price: parseFloat(vehicleData.price),
        description: vehicleData.description,
        vin: vehicleData.vin,
        licensePlate: vehicleData.licensePlate,
        fuelType: vehicleData.fuelType,
        transmission: vehicleData.transmission,
        vehicleTypeId: vehicleData.vehicleTypeId,
        isActive: vehicleData.isActive
      }
    })

    return NextResponse.json(updatedVehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vehicle.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Vehículo eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Nuevo endpoint para eliminar imágenes específicas
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, imageId } = await request.json()
    
    if (action === 'deleteImage') {
      // Eliminar la imagen de la base de datos
      await prisma.vehicleImage.delete({
        where: { id: imageId }
      })
      
      return NextResponse.json({ message: 'Imagen eliminada correctamente' })
    }
    
    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 