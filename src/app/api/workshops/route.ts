import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los talleres
export async function GET() {
  try {
    const workshops = await prisma.workshop.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(workshops)
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json(
      { error: 'Error fetching workshops' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo taller
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const workshop = await prisma.workshop.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        isActive: true
      }
    })

    return NextResponse.json(workshop, { status: 201 })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json(
      { error: 'Error creating workshop' },
      { status: 500 }
    )
  }
} 