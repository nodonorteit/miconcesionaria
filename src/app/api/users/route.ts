import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(body.password, 12)
    
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        role: body.role || 'USER',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    )
  }
} 