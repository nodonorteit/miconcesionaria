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
    console.log('🔄 Actualizando vehículo:', params.id)
    
    const contentType = request.headers.get('content-type')
    console.log('📋 Content-Type:', contentType)
    
    let body: any = {}
    
    // Solo intentar leer el body una vez
    if (contentType?.includes('application/json')) {
      try {
        const text = await request.text()
        console.log('📄 Request body (text):', text.substring(0, 200) + '...')
        
        if (!text || text.trim() === '') {
          console.error('❌ Request body está vacío')
          return NextResponse.json(
            { error: 'Request body is empty' },
            { status: 400 }
          )
        }
        
        body = JSON.parse(text)
        console.log('✅ JSON parseado correctamente:', Object.keys(body))
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError)
        return NextResponse.json(
          { error: 'Invalid JSON format', details: parseError instanceof Error ? parseError.message : 'Unknown error' },
          { status: 400 }
        )
      }
    } else {
      console.error('❌ Content-Type no soportado:', contentType)
      return NextResponse.json(
        { error: 'Unsupported content type. Use application/json' },
        { status: 400 }
      )
    }
    
    // Validar campos requeridos
    if (!body.brand || !body.model || !body.year) {
      console.error('❌ Campos requeridos faltantes:', { brand: !!body.brand, model: !!body.model, year: !!body.year })
      return NextResponse.json(
        { error: 'Missing required fields: brand, model, year' },
        { status: 400 }
      )
    }
    
    // Preparar datos para la actualización
    const updateData: any = {
      brand: body.brand,
      model: body.model,
      year: parseInt(body.year),
      color: body.color || '',
      mileage: parseInt(body.mileage) || 0,
      price: parseFloat(body.price) || 0,
      description: body.description || '',
      vin: body.vin || null,
      licensePlate: body.licensePlate || null,
      fuelType: body.fuelType || 'GASOLINE',
      transmission: body.transmission || 'MANUAL',
      status: body.status || 'AVAILABLE',
      vehicleTypeId: body.vehicleTypeId
    }
    
    console.log('📋 Datos a actualizar:', updateData)
    
    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: updateData,
      include: {
        vehicleType: true,
        images: true
      }
    })

    console.log('✅ Vehículo actualizado exitosamente:', vehicle.id)
    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('❌ Error updating vehicle:', error)
    return NextResponse.json(
      { error: 'Error updating vehicle', details: error instanceof Error ? error.message : 'Unknown error' },
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