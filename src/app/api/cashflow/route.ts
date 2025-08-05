import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// GET - Obtener todas las entradas de cashflow
export async function GET() {
  try {
    const cashflow = await prisma.$queryRaw`
      SELECT * FROM cashflow 
      WHERE isActive = 1 
      ORDER BY createdAt DESC
    `

    return NextResponse.json(cashflow)
  } catch (error) {
    console.error('Error fetching cashflow:', error)
    return NextResponse.json(
      { error: 'Error fetching cashflow' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva entrada de cashflow
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extraer datos del formulario
    const type = formData.get('type') as string
    const amount = formData.get('amount') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const receipt = formData.get('receipt') as File

    // Validar campos requeridos
    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar completos' },
        { status: 400 }
      )
    }

    let receiptPath = null

    // Procesar comprobante si existe
    if (receipt && receipt.size > 0) {
      // Crear directorio de uploads si no existe
      const uploadsDir = join(process.cwd(), 'uploads')
      await mkdir(uploadsDir, { recursive: true })

      const bytes = await receipt.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const filename = `cashflow_${timestamp}_${receipt.name}`
      const filepath = join(uploadsDir, filename)
      
      // Guardar archivo
      await writeFile(filepath, buffer)
      receiptPath = `/uploads/${filename}`
    }

    // Crear entrada en cashflow
    const cashflowId = `cf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    await prisma.$executeRaw`
      INSERT INTO cashflow (id, type, amount, description, category, receiptPath, isActive, createdAt, updatedAt)
      VALUES (${cashflowId}, ${type}, ${parseFloat(amount)}, ${description}, 
              ${category || null}, ${receiptPath}, 1, NOW(), NOW())
    `

    // Obtener la entrada creada
    const cashflowEntries = await prisma.$queryRaw`
      SELECT * FROM cashflow WHERE id = ${cashflowId}
    `
    const cashflowEntry = Array.isArray(cashflowEntries) ? cashflowEntries[0] : cashflowEntries

    return NextResponse.json(cashflowEntry)
  } catch (error) {
    console.error('Error creating cashflow entry:', error)
    return NextResponse.json(
      { error: 'Error creating cashflow entry' },
      { status: 500 }
    )
  }
} 