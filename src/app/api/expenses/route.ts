import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// GET - Obtener todos los egresos
export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      where: { isActive: true },
      include: {
        workshop: true,
        seller: true
      },
      orderBy: { createdAt: 'desc' }
    })

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
    const sellerId = formData.get('sellerId') as string
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

    if (type === 'COMMISSION' && !sellerId) {
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

    // Crear el egreso
    const expense = await prisma.expense.create({
      data: {
        type: type as any,
        amount: parseFloat(amount),
        description,
        workshopId: workshopId || null,
        sellerId: sellerId || null,
        receiptPath,
        isActive: true
      },
      include: {
        workshop: true,
        seller: true
      }
    })

    // Crear entrada en cashflow
    await prisma.cashflow.create({
      data: {
        type: 'EXPENSE',
        amount: -parseFloat(amount),
        description: `Egreso: ${description}`,
        category: type === 'WORKSHOP' ? 'MAINTENANCE' : type === 'PARTS' ? 'PURCHASE' : 'COMMISSION',
        receiptPath,
        isActive: true
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Error creating expense' },
      { status: 500 }
    )
  }
} 