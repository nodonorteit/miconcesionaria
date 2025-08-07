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
    
    const contentType = request.headers.get('content-type') || ''
    console.log('📋 Content-Type:', contentType)
    
    let body: any = {}
    let images: File[] = []
    
    if (contentType.includes('application/json')) {
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
    } else if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData()
        
        // Extraer datos del formulario
        body = {
          brand: formData.get('brand') as string,
          model: formData.get('model') as string,
          year: formData.get('year') as string,
          color: formData.get('color') as string,
          mileage: formData.get('mileage') as string,
          price: formData.get('price') as string,
          description: formData.get('description') as string,
          vin: formData.get('vin') as string,
          licensePlate: formData.get('licensePlate') as string,
          fuelType: formData.get('fuelType') as string,
          transmission: formData.get('transmission') as string,
          status: formData.get('status') as string,
          vehicleTypeId: formData.get('vehicleTypeId') as string
        }
        
        images = formData.getAll('images') as File[]
        console.log('✅ FormData procesado correctamente:', Object.keys(body))
        console.log('📸 Imágenes encontradas:', images.length)
      } catch (formError) {
        console.error('❌ Error processing FormData:', formError)
        return NextResponse.json(
          { error: 'Invalid form data' },
          { status: 400 }
        )
      }
    } else {
      console.error('❌ Content-Type no soportado:', contentType)
      return NextResponse.json(
        { error: 'Unsupported content type. Use application/json or multipart/form-data' },
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

    // Procesar imágenes si existen
    if (images.length > 0) {
      try {
        const { writeFile, mkdir } = await import('fs/promises')
        const { join } = await import('path')
        
        // Crear directorio de uploads si no existe
        const uploadsDir = join(process.cwd(), 'uploads')
        await mkdir(uploadsDir, { recursive: true })

        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          if (image.size > 0) {
            const bytes = await image.arrayBuffer()
            const buffer = Buffer.from(bytes)
            
            // Generar nombre único para la imagen
            const timestamp = Date.now()
            const filename = `${vehicle.id}_${timestamp}_${i}_${image.name}`
            const filepath = join(uploadsDir, filename)
            
            // Guardar archivo
            await writeFile(filepath, buffer)
            
            // Guardar referencia en la base de datos
            await prisma.vehicleImage.create({
              data: {
                filename,
                path: `/uploads/${filename}`,
                isPrimary: i === 0, // La primera imagen es la principal
                vehicleId: vehicle.id
              }
            })
            
            console.log('✅ Imagen guardada:', filename)
          }
        }
      } catch (imageError) {
        console.error('❌ Error procesando imágenes:', imageError)
        // Continuar sin las imágenes si hay error
      }
    }

    // Obtener el vehículo actualizado con las imágenes
    const updatedVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicle.id },
      include: {
        vehicleType: true,
        images: true
      }
    })

    console.log('✅ Vehículo actualizado exitosamente:', vehicle.id)
    return NextResponse.json(updatedVehicle)
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