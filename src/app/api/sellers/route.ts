import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los vendedores
export async function GET() {
  try {
    const sellers = await prisma.seller.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sellers)
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return NextResponse.json(
      { error: 'Error al obtener vendedores' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo vendedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, commissionRate } = body

    // Validar campos requeridos
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Nombre, apellido y email son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingSeller = await prisma.seller.findUnique({
      where: { email }
    })

    if (existingSeller) {
      return NextResponse.json(
        { error: 'Ya existe un vendedor con este email' },
        { status: 400 }
      )
    }

    const seller = await prisma.seller.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        commissionRate: commissionRate || 5.0
      }
    })

    return NextResponse.json(seller, { status: 201 })
  } catch (error) {
    console.error('Error creating seller:', error)
    return NextResponse.json(
      { error: 'Error al crear vendedor' },
      { status: 500 }
    )
  }
} 