import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'

// GET - Obtener una entrada específica de cashflow
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cashflowEntries = await prisma.$queryRaw`
      SELECT * FROM cashflow WHERE id = ${params.id}
    `

    const cashflowEntry = Array.isArray(cashflowEntries) ? cashflowEntries[0] : cashflowEntries

    if (!cashflowEntry) {
      return NextResponse.json(
        { error: 'Cashflow entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(cashflowEntry)
  } catch (error) {
    console.error('Error fetching cashflow entry:', error)
    return NextResponse.json(
      { error: 'Error fetching cashflow entry' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una entrada de cashflow
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
    const category = formData.get('category') as string
    const receipt = formData.get('receipt') as File

    // Validar campos requeridos
    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben estar completos' },
        { status: 400 }
      )
    }

    // Obtener entrada existente
    const existingEntries = await prisma.$queryRaw`
      SELECT * FROM cashflow WHERE id = ${params.id}
    `
    const existingEntry = Array.isArray(existingEntries) ? existingEntries[0] : existingEntries

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Cashflow entry not found' },
        { status: 404 }
      )
    }

    let receiptPath = existingEntry.receiptPath

    // Procesar nuevo comprobante si existe
    if (receipt && receipt.size > 0) {
      // Eliminar archivo anterior si existe
      if (existingEntry.receiptPath) {
        try {
          const oldFilePath = join(process.cwd(), existingEntry.receiptPath.replace('/uploads/', ''))
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
      const filename = `cashflow_${timestamp}_${receipt.name}`
      const filepath = join(uploadsDir, filename)
      
      // Guardar archivo
      await writeFile(filepath, buffer)
      receiptPath = `/uploads/${filename}`
    }

    // Actualizar la entrada
    await prisma.$executeRaw`
      UPDATE cashflow 
      SET type = ${type}, 
          amount = ${parseFloat(amount)}, 
          description = ${description},
          category = ${category || null},
          receiptPath = ${receiptPath},
          updatedAt = NOW()
      WHERE id = ${params.id}
    `

    // Obtener la entrada actualizada
    const updatedEntries = await prisma.$queryRaw`
      SELECT * FROM cashflow WHERE id = ${params.id}
    `
    const updatedEntry = Array.isArray(updatedEntries) ? updatedEntries[0] : updatedEntries

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error updating cashflow entry:', error)
    return NextResponse.json(
      { error: 'Error updating cashflow entry' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una entrada de cashflow (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cashflowEntries = await prisma.$queryRaw`
      SELECT * FROM cashflow WHERE id = ${params.id}
    `
    const cashflowEntry = Array.isArray(cashflowEntries) ? cashflowEntries[0] : cashflowEntries

    if (!cashflowEntry) {
      return NextResponse.json(
        { error: 'Cashflow entry not found' },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.$executeRaw`
      UPDATE cashflow SET isActive = 0, updatedAt = NOW() WHERE id = ${params.id}
    `

    return NextResponse.json({ message: 'Cashflow entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting cashflow entry:', error)
    return NextResponse.json(
      { error: 'Error deleting cashflow entry' },
      { status: 500 }
    )
  }
} 