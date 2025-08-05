import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

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
    const formData = await request.formData()
    
    // Extraer datos del formulario
    const brand = formData.get('brand') as string
    const model = formData.get('model') as string
    const year = formData.get('year') as string
    const color = formData.get('color') as string
    const mileage = formData.get('mileage') as string
    const price = formData.get('price') as string
    const description = formData.get('description') as string
    const vin = formData.get('vin') as string
    const licensePlate = formData.get('licensePlate') as string
    const fuelType = formData.get('fuelType') as string
    const transmission = formData.get('transmission') as string
    const status = formData.get('status') as string
    const vehicleTypeId = formData.get('vehicleTypeId') as string

    // Validar campos requeridos
    if (!brand || !model || !year || !color || !mileage || !price || !vehicleTypeId) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar completos' },
        { status: 400 }
      )
    }

    // Crear el vehículo
    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        year: parseInt(year),
        color,
        mileage: parseInt(mileage),
        price: parseFloat(price),
        description: description || null,
        vin: vin || null,
        licensePlate: licensePlate || null,
        fuelType: fuelType || 'GASOLINE' as any,
        transmission: transmission || 'MANUAL' as any,
        status: (status || 'AVAILABLE') as any,
        vehicleTypeId,
        isActive: true
      },
      include: {
        vehicleType: true,
        images: true
      }
    })

    // Procesar imágenes si existen
    const images = formData.getAll('images') as File[]
    if (images.length > 0) {
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
        }
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

    return NextResponse.json(vehicleWithImages, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json(
      { error: 'Error creating vehicle' },
      { status: 500 }
    )
  }
} 