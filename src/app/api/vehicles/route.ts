import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// GET - Obtener todos los vehículos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sold = searchParams.get('sold')
    
    let vehicles: any[]
    
    if (sold === 'true') {
      // Obtener vehículos vendidos con información de venta e imágenes
      vehicles = await prisma.vehicle.findMany({
        where: {
          isActive: true,
          status: 'SOLD'
        },
        include: {
          vehicleType: true,
          images: true,
          sales: {
            include: {
              seller: true,
              customer: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // Procesar los resultados para incluir información de venta
      const processedVehicles = vehicles.map((vehicle) => ({
        ...vehicle,
        status: (vehicle.status && vehicle.status.trim() !== '') ? vehicle.status : 'SOLD' as any,
        fuelType: (vehicle.fuelType && vehicle.fuelType.trim() !== '') ? vehicle.fuelType : 'GASOLINE' as any,
        transmission: (vehicle.transmission && vehicle.transmission.trim() !== '') ? vehicle.transmission : 'MANUAL' as any,
        vehicleTypeName: vehicle.vehicleType?.name || 'Sin tipo',
        vehicleTypeDescription: vehicle.vehicleType?.description || '',
        sale: vehicle.sales[0] ? {
          id: vehicle.sales[0].id,
          saleNumber: vehicle.sales[0].saleNumber,
          totalAmount: Number(vehicle.sales[0].totalAmount),
          commission: Number(vehicle.sales[0].commission),
          createdAt: vehicle.sales[0].createdAt,
          seller: {
            firstName: vehicle.sales[0].seller.firstName,
            lastName: vehicle.sales[0].seller.lastName
          },
          customer: {
            firstName: vehicle.sales[0].customer.firstName,
            lastName: vehicle.sales[0].customer.lastName
          }
        } : null
      }))
      
      return NextResponse.json(processedVehicles)
    } else {
      // Obtener vehículos disponibles (no vendidos) con imágenes
      vehicles = await prisma.vehicle.findMany({
        where: {
          isActive: true,
          status: {
            not: 'SOLD'
          }
        },
        include: {
          vehicleType: true,
          images: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // Procesar los resultados para manejar valores vacíos
      const processedVehicles = vehicles.map((vehicle) => ({
        ...vehicle,
        status: (vehicle.status && vehicle.status.trim() !== '') ? vehicle.status : 'AVAILABLE' as any,
        fuelType: (vehicle.fuelType && vehicle.fuelType.trim() !== '') ? vehicle.fuelType : 'GASOLINE' as any,
        transmission: (vehicle.transmission && vehicle.transmission.trim() !== '') ? vehicle.transmission : 'MANUAL' as any,
        vehicleTypeName: vehicle.vehicleType?.name || 'Sin tipo',
        vehicleTypeDescription: vehicle.vehicleType?.description || ''
      }))
      
      return NextResponse.json(processedVehicles)
    }
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
    console.log('🔄 Creando nuevo vehículo...')
    console.log('📋 Headers recibidos:', Object.fromEntries(request.headers.entries()))
    
    const contentType = request.headers.get('content-type') || ''
    console.log('📋 Content-Type detectado:', contentType)
    
    let vehicleData: any = {}
    let images: File[] = []
    
    if (contentType.includes('application/json')) {
      // Manejar JSON
      try {
        const text = await request.text()
        console.log('📄 Request body (JSON):', text.substring(0, 200) + '...')
        
        if (!text || text.trim() === '') {
          console.error('❌ Request body está vacío')
          return NextResponse.json(
            { error: 'Request body is empty' },
            { status: 400 }
          )
        }
        
        vehicleData = JSON.parse(text)
        console.log('✅ JSON parseado correctamente:', Object.keys(vehicleData))
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError)
        return NextResponse.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        )
      }
    } else if (contentType.includes('multipart/form-data')) {
      // Manejar FormData
      try {
        const formData = await request.formData()
        
        // Extraer datos del formulario
        vehicleData = {
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
        console.log('✅ FormData procesado correctamente:', Object.keys(vehicleData))
        console.log('📸 Imágenes encontradas:', images.length)
        
        // Log detallado de cada imagen
        images.forEach((image, index) => {
          console.log(`📸 Imagen ${index + 1}:`, {
            name: image.name,
            size: image.size,
            type: image.type,
            lastModified: image.lastModified
          })
        })
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
    if (!vehicleData.brand || !vehicleData.model || !vehicleData.year || !vehicleData.color || !vehicleData.mileage || !vehicleData.price || !vehicleData.vehicleTypeId) {
      console.error('❌ Campos requeridos faltantes:', {
        brand: !!vehicleData.brand,
        model: !!vehicleData.model,
        year: !!vehicleData.year,
        color: !!vehicleData.color,
        mileage: !!vehicleData.mileage,
        price: !!vehicleData.price,
        vehicleTypeId: !!vehicleData.vehicleTypeId
      })
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar completos' },
        { status: 400 }
      )
    }

    console.log('📋 Datos del vehículo a crear:', vehicleData)

    // Crear el vehículo
    const vehicle = await prisma.vehicle.create({
      data: {
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: parseInt(vehicleData.year),
        color: vehicleData.color,
        mileage: parseInt(vehicleData.mileage),
        description: vehicleData.description || null,
        vin: vehicleData.vin || null,
        licensePlate: vehicleData.licensePlate || null,
        status: (vehicleData.status || 'AVAILABLE') as any,
        vehicleTypeId: vehicleData.vehicleTypeId,
        isActive: true
      },
      include: {
        vehicleType: true,
        images: true
      }
    })

    console.log('✅ Vehículo creado:', vehicle.id)

    // Procesar imágenes si existen
    if (images.length > 0) {
      console.log('🖼️ Iniciando procesamiento de imágenes...')
      try {
        // Crear directorio de uploads si no existe
        const uploadsDir = join(process.cwd(), 'uploads')  // En Docker, esto es /app/uploads
        console.log('📁 Directorio de uploads a usar:', uploadsDir)
        
        // Verificar si el directorio existe y tiene permisos
        try {
          await mkdir(uploadsDir, { recursive: true })
          console.log('✅ Directorio de uploads creado/verificado:', uploadsDir)
        } catch (mkdirError) {
          console.error('❌ Error creando directorio de uploads:', mkdirError)
          // Continuar sin crear el directorio si ya existe
        }

        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          console.log(`🖼️ Procesando imagen ${i + 1}/${images.length}:`, image.name)
          
          if (image.size > 0) {
            try {
              const bytes = await image.arrayBuffer()
              const buffer = Buffer.from(bytes)
              console.log(`📊 Buffer creado: ${buffer.length} bytes`)
              
              // Generar nombre único para la imagen
              const timestamp = Date.now()
              const filename = `${vehicle.id}_${timestamp}_${i}_${image.name}`
              const filepath = join(uploadsDir, filename)
              console.log(`📝 Nombre del archivo: ${filename}`)
              console.log(`📁 Ruta completa: ${filepath}`)
              
              // Guardar archivo
              console.log('💾 Guardando archivo en disco...')
              await writeFile(filepath, buffer)
              console.log('✅ Archivo guardado en disco exitosamente')
              
              // Guardar referencia en la base de datos
              console.log('💾 Guardando referencia en BD...')
              await prisma.vehicleImage.create({
                data: {
                  url: `/uploads/${filename}`,
                  vehicleId: vehicle.id
                }
              })
              
              console.log('✅ Imagen procesada completamente:', filename)
            } catch (imageError) {
              console.error(`❌ Error procesando imagen ${i + 1}:`, imageError)
              // Continuar con la siguiente imagen
            }
          } else {
            console.log(`⚠️ Imagen ${i + 1} tiene tamaño 0, saltando...`)
          }
        }
      } catch (imageError) {
        console.error('❌ Error procesando imágenes:', imageError)
        // Continuar sin las imágenes si hay error
      }
    }

    // Obtener el vehículo con las imágenes
    const vehicleWithImages = await prisma.vehicle.findUnique({
      where: { id: vehicle.id },
      include: {
        vehicleType: true,
        images: true
      }
    })

    console.log('✅ Vehículo creado exitosamente con imágenes')
    return NextResponse.json(vehicleWithImages, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating vehicle:', error)
    
    // Manejar errores específicos de Prisma
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
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