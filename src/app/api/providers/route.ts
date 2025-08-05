import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los proveedores
export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(providers)
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { error: 'Error fetching providers' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const provider = await prisma.provider.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        taxId: body.taxId,
        isActive: true
      }
    })

    return NextResponse.json(provider, { status: 201 })
  } catch (error) {
    console.error('Error creating provider:', error)
    return NextResponse.json(
      { error: 'Error creating provider' },
      { status: 500 }
    )
  }
} 