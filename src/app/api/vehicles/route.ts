import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { handlePrismaError, handleValidationError } from '@/lib/error-handler'

// GET - Obtener todos los vehículos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sold = searchParams.get('sold')
    const available = searchParams.get('available')
    
    let vehicles: any[]
    
    if (sold === 'true') {
      // Obtener vehículos vendidos con información de venta e imágenes
      vehicles = await prisma.vehicle.findMany({
        where: {
          status: 'SOLD'
        },
        include: {
          vehicleType: true,
          images: true,
          transactions: {
            include: {
              commissionist: true,
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
        sale: vehicle.transactions[0] ? {
          id: vehicle.transactions[0].id,
          saleNumber: vehicle.transactions[0].transactionNumber,
          totalAmount: Number(vehicle.transactions[0].totalAmount),
          commission: Number(vehicle.transactions[0].commission),
          createdAt: vehicle.transactions[0].createdAt,
          seller: vehicle.transactions[0].commissionist ? {
            firstName: vehicle.transactions[0].commissionist.firstName,
            lastName: vehicle.transactions[0].commissionist.lastName
          } : null,
          customer: {
            firstName: vehicle.transactions[0].customer.firstName,
            lastName: vehicle.transactions[0].customer.lastName
          }
        } : null
      }))
      
      return NextResponse.json(processedVehicles)
    } else {
      // Obtener vehículos disponibles (no vendidos) con imágenes
      if (available === 'true') {
        // Obtener vehículos disponibles (sin ventas pendientes)
        vehicles = await prisma.vehicle.findMany({
          where: {
            status: 'AVAILABLE',
            transactions: {
              none: {
                status: 'PENDING'
              }
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
      } else {
        // Obtener todos los vehículos (excepto vendidos)
        vehicles = await prisma.vehicle.findMany({
          where: {
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
      }
      
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
    const contentType = request.headers.get('content-type')
    console.log('📋 Content-Type detectado:', contentType)
    
    let vehicleData: any = {}
    let images: File[] = []
    
    if (contentType?.includes('multipart/form-data')) {
      // Manejar FormData (formulario tradicional)
      const formData = await request.formData()
      console.log('📋 FormData recibido')
      
      // Extraer datos del formulario
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
        vehicleTypeId: formData.get('vehicleTypeId') as string,
        // Nuevos campos
        operationType: formData.get('operationType') as string,
        purchasePrice: formData.get('purchasePrice') as string,
        sellerId: formData.get('sellerId') as string, // ID del cliente que vende
        commissionRate: formData.get('commissionRate') as string,
        notes: formData.get('notes') as string
      }

      // Validar campos requeridos
      if (!vehicleData.brand || !vehicleData.model || !vehicleData.year || !vehicleData.mileage || !vehicleData.vehicleTypeId) {
        console.error('❌ Campos requeridos faltantes:', {
          brand: !!vehicleData.brand,
          model: !!vehicleData.model,
          year: !!vehicleData.year,
          mileage: !!vehicleData.mileage,
          vehicleTypeId: !!vehicleData.vehicleTypeId
        })
        return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
      }

      // Validar campos específicos según el tipo de operación
      if (vehicleData.operationType === 'PURCHASE') {
        if (!vehicleData.purchasePrice || !vehicleData.sellerId) {
          return NextResponse.json({ error: 'Para compras se requiere precio de compra y vendedor' }, { status: 400 })
        }
      } else if (vehicleData.operationType === 'COMMISSION') {
        if (!vehicleData.commissionRate) {
          return NextResponse.json({ error: 'Para consignaciones se requiere el porcentaje de comisión' }, { status: 400 })
        }
      }

      // Crear el vehículo
      const data = {
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: parseInt(vehicleData.year),
        mileage: parseInt(vehicleData.mileage),
        price: vehicleData.price ? parseFloat(vehicleData.price) : null,
        description: vehicleData.description || null,
        vin: vehicleData.vin || null,
        licensePlate: vehicleData.licensePlate || null,
        status: (vehicleData.status || 'AVAILABLE') as any,
        vehicleTypeId: vehicleData.vehicleTypeId,
        // Nuevos campos
        operationType: vehicleData.operationType,
        purchasePrice: vehicleData.purchasePrice ? parseFloat(vehicleData.purchasePrice) : null,
        commissionRate: vehicleData.commissionRate ? parseFloat(vehicleData.commissionRate) : null,
        notes: vehicleData.notes || null
      }

      const vehicle = await prisma.vehicle.create({
        data
      })

      // Si es una COMPRA, crear la transacción de compra y el egreso
      if (vehicleData.operationType === 'PURCHASE' && vehicleData.purchasePrice && vehicleData.sellerId) {
        // Generar número de compra único
        const purchaseNumber = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

        // Crear la transacción de compra
        await prisma.transaction.create({
          data: {
            transactionNumber: purchaseNumber,
            type: 'PURCHASE',
            vehicleId: vehicle.id,
            customerId: vehicleData.sellerId, // El cliente que nos vende el vehículo
            totalAmount: parseFloat(vehicleData.purchasePrice),
            commission: 0, // Las compras no tienen comisión
            status: 'COMPLETED',
            notes: vehicleData.notes || null,
            paymentMethod: 'CONTADO',
            deliveryDate: new Date()
          }
        })

        // Crear el egreso correspondiente
        await prisma.expense.create({
          data: {
            description: `Compra de vehículo: ${vehicleData.brand} ${vehicleData.model} ${vehicleData.year}`,
            amount: parseFloat(vehicleData.purchasePrice),
            type: 'WORKSHOP' as any,
            workshopId: null,
            commissionistId: null,
            receiptPath: null
          }
        })

        console.log(`✅ Transacción de compra y egreso creados: $${vehicleData.purchasePrice}`)
      }

      return NextResponse.json(vehicle)
    } else if (contentType?.includes('application/json')) {
      // Manejar JSON (API calls)
      try {
        const text = await request.text()
        console.log('📋 Texto recibido:', text.substring(0, 200))
        
        const vehicleData = JSON.parse(text)
        console.log('✅ JSON parseado correctamente:', Object.keys(vehicleData))

        // Validar campos requeridos
        if (!vehicleData.brand || !vehicleData.model || !vehicleData.year || !vehicleData.mileage || !vehicleData.vehicleTypeId) {
          console.error('❌ Campos requeridos faltantes:', {
            brand: !!vehicleData.brand,
            model: !!vehicleData.model,
            year: !!vehicleData.year,
            mileage: !!vehicleData.mileage,
            vehicleTypeId: !!vehicleData.vehicleTypeId
          })
          return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
        }

        // Validar campos específicos según el tipo de operación
        if (vehicleData.operationType === 'PURCHASE') {
          if (!vehicleData.purchasePrice || !vehicleData.sellerName || !vehicleData.sellerDocument) {
            return NextResponse.json({ error: 'Para compras se requiere precio de compra, nombre y documento del vendedor' }, { status: 400 })
          }
        } else if (vehicleData.operationType === 'COMMISSION') {
          if (!vehicleData.commissionRate) {
            return NextResponse.json({ error: 'Para consignaciones se requiere el porcentaje de comisión' }, { status: 400 })
          }
        }

        // Crear el vehículo
        const data = {
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: parseInt(vehicleData.year),
          mileage: parseInt(vehicleData.mileage),
          price: vehicleData.price ? parseFloat(vehicleData.price) : null,
          description: vehicleData.description || null,
          vin: vehicleData.vin || null,
          licensePlate: vehicleData.licensePlate || null,
          status: (vehicleData.status || 'AVAILABLE') as any,
          vehicleTypeId: vehicleData.vehicleTypeId,
          // Nuevos campos
          operationType: vehicleData.operationType,
          purchasePrice: vehicleData.purchasePrice ? parseFloat(vehicleData.purchasePrice) : null,
          sellerName: vehicleData.sellerName || null,
          sellerDocument: vehicleData.sellerDocument || null,
          sellerPhone: vehicleData.sellerPhone || null,
          commissionRate: vehicleData.commissionRate ? parseFloat(vehicleData.commissionRate) : null,
          notes: vehicleData.notes || null
        }

        const vehicle = await prisma.vehicle.create({
          data
        })

        // Si es una COMPRA, crear el movimiento de egreso
        if (vehicleData.operationType === 'PURCHASE' && vehicleData.purchasePrice) {
          const expenseData = {
            description: `Compra de vehículo: ${vehicleData.brand} ${vehicleData.model} ${vehicleData.year}`,
            amount: parseFloat(vehicleData.purchasePrice),
            type: 'WORKSHOP' as any, // Usar WORKSHOP como tipo por defecto
            workshopId: null,
            sellerId: null,
            receiptPath: null
          }

          await prisma.expense.create({
            data: expenseData
          })

          console.log(`✅ Egreso creado por compra de vehículo: $${vehicleData.purchasePrice}`)
        }

        return NextResponse.json(vehicle)
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError)
        return NextResponse.json(
          { error: 'Invalid JSON format' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      )
    }
  } catch (error) {
    // Usar el manejador de errores personalizado
    return handlePrismaError(error)
  }
} 