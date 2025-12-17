import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError, handleValidationError } from '@/lib/error-handler'

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
    console.log('🔄 PUT request recibido para vehículo:', params.id)
    console.log('📋 Content-Type:', request.headers.get('content-type'))
    
    let vehicleData: any
    let hasImages = false
    let images: any[] = []
    
    // Verificar si es FormData o JSON
    const contentType = request.headers.get('content-type')
    
    if (contentType && contentType.includes('multipart/form-data')) {
      console.log('📸 Procesando FormData con imágenes...')
      
      const formData = await request.formData()
      
      // Extraer datos del vehículo
      vehicleData = {
        brand: formData.get('brand') as string,
        model: formData.get('model') as string,
        year: formData.get('year') as string,
        mileage: formData.get('mileage') as string,
        price: formData.get('price') as string,
        description: formData.get('description') as string,
        vin: formData.get('vin') as string,
        licensePlate: formData.get('licensePlate') as string,
        status: formData.get('status') as string,
        vehicleTypeId: formData.get('vehicleTypeId') as string
      }
      
      // Extraer imágenes
      const imageFiles = formData.getAll('images')
      if (imageFiles.length > 0) {
        hasImages = true
        // En Node.js, los archivos de FormData no son instancias de File
        images = imageFiles as any[]
        console.log(`📸 ${imageFiles.length} imagen(es) encontrada(s) en FormData`)
        
        imageFiles.forEach((image: any, index: number) => {
          console.log(`📸 Imagen ${index + 1}:`, image.name, 'Size:', image.size, 'Type:', image.type)
        })
      }
      
      console.log('📋 Datos del vehículo extraídos:', vehicleData)
    } else {
      console.log('📋 Procesando JSON sin imágenes...')
      vehicleData = await request.json()
    }
    
    // Validar datos requeridos
    if (!vehicleData.brand || !vehicleData.model || !vehicleData.year || !vehicleData.vehicleTypeId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: brand, model, year, vehicleTypeId' },
        { status: 400 }
      )
    }
    
    // Procesar precio - formato argentino: punto para miles, coma para decimales
    let priceValue: number | null = null
    if (vehicleData.price) {
      // Formato argentino: remover puntos (miles) y convertir coma (decimal) a punto
      const cleanedPrice = vehicleData.price.toString().trim().replace(/\./g, '').replace(',', '.')
      priceValue = parseFloat(cleanedPrice)
      
      if (isNaN(priceValue)) {
        return NextResponse.json({ error: 'El precio ingresado no es válido' }, { status: 400 })
      }
      
      // Validar que el precio no exceda el máximo permitido (Decimal(20,2))
      const maxPrice = 999999999999999999.99
      if (priceValue > maxPrice) {
        return NextResponse.json({ 
          error: `El precio no puede ser mayor a $999.999.999.999.999.999,99. Valor ingresado: ${vehicleData.price}` 
        }, { status: 400 })
      }
    }
    
    // Actualizar vehículo
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: parseInt(vehicleData.year),
        mileage: parseInt(vehicleData.mileage),
        price: priceValue,
        description: vehicleData.description,
        vin: vehicleData.vin,
        licensePlate: vehicleData.licensePlate,
        status: vehicleData.status,
        vehicleTypeId: vehicleData.vehicleTypeId
      }
    })
    
    console.log('✅ Vehículo actualizado en BD:', updatedVehicle.id)
    
    // Si hay imágenes nuevas, procesarlas
    if (hasImages && images.length > 0) {
      console.log('📸 Procesando imágenes nuevas...')
      
      try {
        // Importar fs/promises dinámicamente
        const { mkdir, writeFile } = await import('fs/promises')
        const path = await import('path')
        
        // Crear directorio de uploads si no existe
        const uploadsDir = '/app/uploads'
        await mkdir(uploadsDir, { recursive: true })
        
        // Procesar cada imagen
        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          const timestamp = Date.now()
          const randomString = Math.random().toString(36).substring(2, 15)
          // Preservar la extensión original del archivo (jpg, png, gif, webp, etc.)
          const originalName = image.name || 'image'
          const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
          const filename = `${params.id}_${timestamp}_${i}_${randomString}.${fileExtension}`
          const filePath = path.join(uploadsDir, filename)
          
          console.log(`📸 Procesando imagen ${i + 1}:`, filename)
          
          // Convertir Buffer a archivo
          const bytes = await image.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          // Guardar archivo
          await writeFile(filePath, buffer)
          console.log(`💾 Imagen guardada: ${filePath}`)
          
          // Guardar referencia en BD
          const imageRecord = await prisma.vehicleImage.create({
            data: {
              path: `/uploads/${filename}`,
              filename: filename,
              isPrimary: i === 0,
              vehicleId: params.id
            }
          })
          
          console.log(`💾 Referencia de imagen guardada en BD:`, imageRecord.id)
        }
        
        console.log('✅ Todas las imágenes procesadas correctamente')
      } catch (imageError) {
        console.error('❌ Error procesando imágenes:', imageError)
        // No fallar la actualización del vehículo por errores de imagen
      }
    }
    
    return NextResponse.json(updatedVehicle)
  } catch (error) {
    // Usar el manejador de errores personalizado
    return handlePrismaError(error)
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