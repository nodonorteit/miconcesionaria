import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los tipos de vehículos
export async function GET() {
  try {
    const vehicleTypes = await prisma.vehicleType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(vehicleTypes)
  } catch (error) {
    console.error('Error fetching vehicle types:', error)
    return NextResponse.json(
      { error: 'Error al cargar tipos de vehículos' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo tipo de vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Nombre y categoría son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un tipo con el mismo nombre
    const existingType = await prisma.vehicleType.findUnique({
      where: { name }
    })

    if (existingType) {
      return NextResponse.json(
        { error: 'Ya existe un tipo de vehículo con ese nombre' },
        { status: 400 }
      )
    }

    const vehicleType = await prisma.vehicleType.create({
      data: {
        name,
        description: description || null
      }
    })

    return NextResponse.json(vehicleType, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle type:', error)
    return NextResponse.json(
      { error: 'Error al crear tipo de vehículo' },
      { status: 500 }
    )
  }
} 