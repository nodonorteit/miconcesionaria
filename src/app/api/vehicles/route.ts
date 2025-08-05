import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los vehículos
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      include: {
        vehicleType: true,
        images: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Error fetching vehicles' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const vehicle = await prisma.vehicle.create({
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
        status: body.status || 'AVAILABLE',
        vehicleTypeId: body.vehicleTypeId,
        isActive: true
      },
      include: {
        vehicleType: true,
        images: true
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json(
      { error: 'Error creating vehicle' },
      { status: 500 }
    )
  }
} 