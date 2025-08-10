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
        status: vehicle.status || 'SOLD',
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
        status: vehicle.status || 'AVAILABLE',
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
    
    const contentType = request.headers.get('content-type') || ''
    console.log('📋 Content-Type:', contentType)
    
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
        price: parseFloat(vehicleData.price),
        description: vehicleData.description || null,
        vin: vehicleData.vin || null,
        licensePlate: vehicleData.licensePlate || null,
        fuelType: (vehicleData.fuelType && vehicleData.fuelType.trim() !== '') ? vehicleData.fuelType : 'GASOLINE' as any,
        transmission: (vehicleData.transmission && vehicleData.transmission.trim() !== '') ? vehicleData.transmission : 'MANUAL' as any,
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
      try {
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
    return NextResponse.json(
      { error: 'Error creating vehicle', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 