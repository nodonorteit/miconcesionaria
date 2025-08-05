import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'

// GET - Obtener un egreso específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        workshop: true,
        seller: true
      }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { error: 'Error fetching expense' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un egreso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Obtener egreso existente
    const existingExpense = await prisma.expense.findUnique({
      where: { id: params.id }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    let receiptPath = existingExpense.receiptPath

    // Procesar nuevo comprobante si existe
    if (receipt && receipt.size > 0) {
      // Eliminar archivo anterior si existe
      if (existingExpense.receiptPath) {
        try {
          const oldFilePath = join(process.cwd(), existingExpense.receiptPath.replace('/uploads/', ''))
          await unlink(oldFilePath)
        } catch (error) {
          console.error('Error deleting old file:', error)
        }
      }

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

    // Actualizar el egreso
    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        type: type as any,
        amount: parseFloat(amount),
        description,
        workshopId: workshopId || null,
        sellerId: sellerId || null,
        receiptPath
      },
      include: {
        workshop: true,
        seller: true
      }
    })

    // Actualizar entrada en cashflow
    await prisma.cashflow.updateMany({
      where: {
        description: `Egreso: ${existingExpense.description}`,
        amount: -existingExpense.amount
      },
      data: {
        amount: -parseFloat(amount),
        description: `Egreso: ${description}`,
        receiptPath
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Error updating expense' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un egreso (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: params.id }
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Soft delete del egreso
    await prisma.expense.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    // Eliminar entrada correspondiente en cashflow
    await prisma.cashflow.updateMany({
      where: {
        description: `Egreso: ${expense.description}`,
        amount: -expense.amount
      },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Error deleting expense' },
      { status: 500 }
    )
  }
} 