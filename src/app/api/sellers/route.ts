import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los comisionistas
export async function GET() {
  try {
    const commissionists = await prisma.commissionist.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(commissionists)
  } catch (error) {
    console.error('Error fetching commissionists:', error)
    return NextResponse.json(
      { error: 'Error al obtener comisionistas' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo comisionista
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
    const existingCommissionist = await prisma.commissionist.findUnique({
      where: { email }
    })

    if (existingCommissionist) {
      return NextResponse.json(
        { error: 'Ya existe un comisionista con este email' },
        { status: 400 }
      )
    }

    const commissionist = await prisma.commissionist.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        commissionRate: commissionRate !== undefined ? commissionRate : 5.0
      }
    })

    return NextResponse.json(commissionist, { status: 201 })
  } catch (error) {
    console.error('Error creating commissionist:', error)
    return NextResponse.json(
      { error: 'Error al crear comisionista' },
      { status: 500 }
    )
  }
} 