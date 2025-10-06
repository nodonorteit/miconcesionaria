import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// GET - Obtener todos los egresos
export async function GET() {
  try {
    const expenses = await prisma.$queryRaw`
      SELECT 
        e.*,
        w.name as workshopName,
        CONCAT(c.firstName, ' ', c.lastName) COLLATE utf8mb4_unicode_ci as commissionistName
      FROM expenses e
      LEFT JOIN workshops w ON e.workshopId = w.id COLLATE utf8mb4_unicode_ci
      LEFT JOIN commissionists c ON e.commissionistId = c.id COLLATE utf8mb4_unicode_ci
      WHERE e.isActive = 1
      ORDER BY e.createdAt DESC
    `

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Error fetching expenses' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo egreso
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extraer datos del formulario
    const type = formData.get('type') as string
    const amount = formData.get('amount') as string
    const description = formData.get('description') as string
    const workshopId = formData.get('workshopId') as string
    const commissionistId = formData.get('commissionistId') as string
    const receipt = formData.get('receipt') as File

    // Validar campos requeridos
    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar completos' },
        { status: 400 }
      )
    }

    // Validar tipo específico
    if (type === 'WORKSHOP' && !workshopId) {
      return NextResponse.json(
        { error: 'Debe seleccionar un taller' },
        { status: 400 }
      )
    }

    if (type === 'COMMISSION' && !commissionistId) {
      return NextResponse.json(
        { error: 'Debe seleccionar un vendedor' },
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
      const filename = `expense_${timestamp}_${receipt.name}`
      const filepath = join(uploadsDir, filename)
      
      // Guardar archivo
      await writeFile(filepath, buffer)
      receiptPath = `/uploads/${filename}`
    }

    // Crear el egreso usando SQL directo
    const expenseId = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    await prisma.$executeRaw`
      INSERT INTO expenses (id, type, amount, description, workshopId, commissionistId, receiptPath, isActive, createdAt, updatedAt)
      VALUES (${expenseId}, ${type}, ${parseFloat(amount)}, ${description}, 
              ${workshopId || null}, ${commissionistId || null}, ${receiptPath}, 1, NOW(), NOW())
    `

    // Nota: El cashflow se calcula dinámicamente desde las transacciones y gastos
    // No es necesario insertar en una tabla cashflow separada

    // Obtener el egreso creado
    const expenses = await prisma.$queryRaw`
      SELECT 
        e.*,
        w.name as workshopName,
        CONCAT(c.firstName, ' ', c.lastName) COLLATE utf8mb4_unicode_ci as commissionistName
      FROM expenses e
      LEFT JOIN workshops w ON e.workshopId = w.id COLLATE utf8mb4_unicode_ci
      LEFT JOIN commissionists c ON e.commissionistId = c.id COLLATE utf8mb4_unicode_ci
      WHERE e.id = ${expenseId}
    `
    const expense = Array.isArray(expenses) ? expenses[0] : expenses

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Error creating expense' },
      { status: 500 }
    )
  }
} 