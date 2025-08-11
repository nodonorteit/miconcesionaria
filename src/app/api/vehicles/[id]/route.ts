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
    console.error('❌ Error fetching vehicle:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor. Por favor, intenta nuevamente.',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    )
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
    console.error('❌ Error updating vehicle:', error)
    
    // Manejar errores específicos de Prisma
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'P2002') {
      // Error de constraint único
      const field = (error as any).meta?.target?.[0] || 'campo'
      return NextResponse.json(
        { 
          error: `El ${field} ya existe en la base de datos. Por favor, usa un valor diferente.`,
          details: `Error de duplicado en: ${field}`
        }, 
        { status: 400 }
      )
    }
    
    // Otros errores de Prisma
    if (error && typeof error === 'object' && 'code' in error && (error as any).code?.startsWith('P')) {
      return NextResponse.json(
        { 
          error: 'Error en la base de datos. Por favor, verifica los datos e intenta nuevamente.',
          details: (error as any).message || 'Error de Prisma desconocido'
        }, 
        { status: 400 }
      )
    }
    
    // Error genérico
    return NextResponse.json(
      { 
        error: 'Error interno del servidor. Por favor, intenta nuevamente.',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    )
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
    console.error('❌ Error deleting vehicle:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor. Por favor, intenta nuevamente.',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    )
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
    console.error('❌ Error deleting image:', error)
    
    // Manejar errores específicos de Prisma
    if (error && typeof error === 'object' && 'code' in error && (error as any).code?.startsWith('P')) {
      return NextResponse.json(
        { 
          error: 'Error en la base de datos. Por favor, intenta nuevamente.',
          details: (error as any).message || 'Error de Prisma desconocido'
        }, 
        { status: 400 }
      )
    }
    
    // Error genérico
    return NextResponse.json(
      { 
        error: 'Error interno del servidor. Por favor, intenta nuevamente.',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, 
      { status: 500 }
    )
  }
} 