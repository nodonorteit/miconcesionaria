import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los talleres
export async function GET() {
  try {
    const workshops = await prisma.$queryRaw`
      SELECT * FROM workshops 
      WHERE isActive = 1 
      ORDER BY createdAt DESC
    `

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
    
    // Validar campos requeridos
    if (!body.name) {
      return NextResponse.json(
        { error: 'El nombre del taller es requerido' },
        { status: 400 }
      )
    }
    
    const workshopId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    await prisma.$executeRaw`
      INSERT INTO workshops (id, name, email, phone, address, city, state, isActive, createdAt, updatedAt)
      VALUES (${workshopId}, ${body.name}, ${body.email || null}, ${body.phone || null}, ${body.address || null}, ${body.city || null}, ${body.state || null}, 1, NOW(), NOW())
    `

    const workshops = await prisma.$queryRaw`
      SELECT * FROM workshops WHERE id = ${workshopId}
    `
    const workshop = Array.isArray(workshops) ? workshops[0] : workshops

    return NextResponse.json(workshop, { status: 201 })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json(
      { error: 'Error creating workshop' },
      { status: 500 }
    )
  }
} 